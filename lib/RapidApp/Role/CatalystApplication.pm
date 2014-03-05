package RapidApp::Role::CatalystApplication;

use Moose::Role;
use RapidApp::Include 'perlutil';
use RapidApp::RapidApp;
use Scalar::Util 'blessed';
use CatalystX::InjectComponent;
use RapidApp::CatalystX::SimpleCAS::TextTranscode;
use Hash::Merge;
use RapidApp::Debug 'DEBUG';
use Text::SimpleTable::AutoWidth;

use RapidApp;
use Template;

sub rapidapp_version { $RapidApp::VERSION }

sub rapidApp { (shift)->model("RapidApp"); }

has 'request_id' => ( is => 'ro', default => sub { (shift)->rapidApp->requestCount; } );

around 'setup_components' => sub {
	my ($orig, $app, @args)= @_;
  $app->$orig(@args);  # standard catalyst setup_components
  $app->setupRapidApp; # our additional components needed for RapidApp
};

sub setupRapidApp {
	my $app = shift;
	my $log = $app->log;
	
	$app->injectUnlessExist('RapidApp::RapidApp', 'RapidApp');
	
	my @names= keys %{ $app->components };
	my @controllers= grep /[^:]+::Controller.*/, @names;
	my $haveRoot= 0;
	foreach my $ctlr (@controllers) {
		if ($ctlr->isa('RapidApp::ModuleDispatcher')) {
			$log->info("RapidApp: Found $ctlr which implements ModuleDispatcher.");
			$haveRoot= 1;
		}
	}
	if (!$haveRoot) {
		$log->info("RapidApp: No Controller extending ModuleDispatcher found, using default");
		$app->injectUnlessExist( 'RapidApp::Controller::DefaultRoot', 'Controller::RapidApp::Root' );
	}
	
	# for each view, inject it if it doens't exist
	$app->injectUnlessExist( 'Catalyst::View::TT', 'View::RapidApp::TT' );
	$app->injectUnlessExist( 'RapidApp::View::Viewport', 'View::RapidApp::Viewport' );
	$app->injectUnlessExist( 'RapidApp::View::Printview', 'View::RapidApp::Printview' );
	$app->injectUnlessExist( 'RapidApp::View::JSON', 'View::RapidApp::JSON' );
	$app->injectUnlessExist( 'RapidApp::View::HttpStatus', 'View::RapidApp::HttpStatus' );
	$app->injectUnlessExist( 'RapidApp::View::OnError', 'View::RapidApp::OnError' );
  
  # New experimental Template controller:
  $app->injectUnlessExist( 'RapidApp::Template::Controller', 'Controller::RapidApp::Template' );
};

sub injectUnlessExist {
  my ($app, $actual, $virtual)= @_;
  if (!$app->components->{$virtual}) {
    $app->debug && $app->log->debug("RapidApp: Installing virtual $virtual");
    CatalystX::InjectComponent->inject( into => $app, component => $actual, as => $virtual );
  }
}

after 'setup_finalize' => sub {
  my $app = shift;
  $app->rapidApp->_setup_finalize;
};

# called once per request, in class-context
before 'handle_request' => sub {
	my ($app, @arguments)= @_;
	$app->rapidApp->incRequestCount;
};

# called once per request, to dispatch the request on a newly constructed $c object
around 'dispatch' => \&_rapidapp_top_level_dispatch;

sub _rapidapp_top_level_dispatch {
	my ($orig, $c, @args)= @_;
  
  # New: simpler global to get $c in user code. can be accessed from
  # anywhere with: 'RapidApp->active_request_context()'
  local $RapidApp::ACTIVE_REQUEST_CONTEXT = $c;
	
	# put the debug flag into the stash, for easy access in templates
	$c->stash->{debug} = $c->debug;
	
	# provide hints for our controllers on what contect type is expected
	$c->stash->{requestContentType}=
		$c->req->header('X-RapidApp-RequestContentType')
		|| $c->req->param('RequestContentType')
		|| '';
	
	$c->stash->{onrequest_time_elapsed}= 0;
  
  $orig->($c, @args);
  
  for my $err (@{ $c->error }) {
    if (blessed($err) && $err->isa('RapidApp::Responder')) {
      $c->clear_errors;
      $c->forward($err->action);
      last;
    }
  }
	
	if (!defined $c->response->content_type) {
		$c->log->error("Body was set, but content-type was not!  This can lead to encoding errors!");
	}
};

# called after the response is sent to the client, in object-context
after 'log_response' => sub {
	my $c= shift;
	$c->rapidApp->cleanupAfterRequest($c);
};



#######################################################################################
#  The following is mostly copy/pasted from Catalyst::Plugin::Unicode::Encoding.
#  RapidApp aims to be "utf-8 everywhere", and this saves the user from the need to include
#   that module, and allows us to extend it a bit at the same time.
#######################################################################################

use Encode 2.21 ();
our $CHECK = Encode::FB_CROAK | Encode::LEAVE_SRC;
our $codec = Encode::find_encoding('utf8') or die "Missing encoder for utf8";

before 'finalize_headers' => \&properly_encode_response;
after 'prepare_uploads' => \&properly_decode_request;
after 'prepare_action' => \&properly_decode_action_params;

sub properly_encode_response {
	my $c= shift;
	my @encoded;

	$c->properly_encode_body && push @encoded, 'body';
	
	# also encode headers
	for my $ra_hdr (grep { $_ =~ /^X-RapidApp/ } $c->response->headers->header_field_names) {
		my @val= $c->response->headers->header($ra_hdr);
		for (@val) {
			if (utf8::is_utf8($_)) {
				push @encoded, $ra_hdr;
				$_= $codec->encode($_, $CHECK);
			}
		}
		$c->response->headers->header($ra_hdr => \@val);
	}
	
	DEBUG('controller', "Encoded to utf-8: ", @encoded);
}

sub properly_encode_body {
	my $c= shift;
	my $body = $c->response->body;

	DEBUG('controller', "no body set at encode-time") unless defined($body);
	return 0 unless defined($body);

	my ($ct, $ct_enc) = $c->response->content_type;

	# Only touch 'text-like' contents
	unless ($c->response->content_type =~ m!^text|xml$|javascript$|/JSON$!) {
		DEBUG('controller', "content-type is not a recognizable \"text\" format");
		return 0 unless utf8::is_utf8($body);
		$c->log->error("Body of response is unicode, but content type is not \"text\"... encoding at utf8 just in case, but you should fix the content type or the data!!!");
	}

	if ($ct_enc && $ct_enc =~ /charset=(.*?)$/) {
		if (uc($1) ne $codec->mime_name) {
			$c->log->warn("Unicode::Encoding is set to encode in '" .
				$codec->mime_name .
				"', content type is '$1', not encoding ");
			return 0;
		}
	} else {
		DEBUG('controller', "defaulting content-type charset to utf-8");
		$c->res->content_type($c->res->content_type . "; charset=" . $codec->mime_name);
	}

	# Encode expects plain scalars (IV, NV or PV) and segfaults on ref's
	if (ref(\$body) eq 'SCALAR') {
		$c->response->body( $codec->encode( $body, $CHECK ) );
		return 1;
	}
	return 0;
}

# Note we have to hook here as uploads also add to the request parameters
sub properly_decode_request {
	my $c = shift;
	my @decoded;

	for my $key (qw/ parameters query_parameters body_parameters /) {
		for my $value ( values %{ $c->request->{$key} } ) {

			# TODO: Hash support from the Params::Nested
			if ( ref $value && ref $value ne 'ARRAY' ) {
				next;
			}
			for ( ref($value) ? @{$value} : $value ) {
				# N.B. Check if already a character string and if so do not try to double decode.
				#      http://www.mail-archive.com/catalyst@lists.scsys.co.uk/msg02350.html
				#      this avoids exception if we have already decoded content, and is _not_ the
				#      same as not encoding on output which is bad news (as it does the wrong thing
				#      for latin1 chars for example)..
				if (!Encode::is_utf8( $_ )) {
					push @decoded, $key;
					$_ = $codec->decode( $_, $CHECK );
				}
			}
		}
	}
	
	for my $value ( values %{ $c->request->uploads } ) {
		push @decoded, $value.'->{filename}';
		for ( ref($value) eq 'ARRAY' ? @{$value} : $value ) {
			$_->{filename} = $codec->decode( $_->{filename}, $CHECK );
		}
	}
	
	# also decode headers we care about
	for my $ra_hdr (grep { $_ =~ /^X-RapidApp/ } $c->req->headers->header_field_names) {
		my @val= $c->req->headers->header($ra_hdr);
		push @decoded, $ra_hdr;
		@val= map { $codec->decode($_, $CHECK) } @val;
		$c->req->headers->header($ra_hdr => \@val);
	}
	DEBUG('controller', "Decoded from utf8: ", @decoded);
}

sub properly_decode_action_params {
	my $c = shift;

	foreach (@{$c->req->arguments}, @{$c->req->captures}) {
		$_ = Encode::is_utf8( $_ ) ? $_ : $codec->decode( $_, $CHECK );
	}
}

# reset stats for each request:
before 'dispatch' => sub { %$RapidApp::Functions::debug_around_stats = (); };
after 'dispatch' => \&_report_debug_around_stats;

sub _report_debug_around_stats {
	my $c = shift;
	my $stats = $RapidApp::Functions::debug_around_stats || return;
	return unless (ref($stats) && keys %$stats > 0);
	
	my $total = $c->stats->elapsed;
	
	my $display = $c->_get_debug_around_stats_ascii($total,"Catalyst Request Elapsed");
	
	print STDERR "\n" . $display;
}


sub _get_debug_around_stats_ascii {
	my $c = shift;
	my $total = shift or die "missing total arg";
	my $total_heading = shift || 'Total Elapsed';
	
	my $stats = $RapidApp::Functions::debug_around_stats || return;
	return unless (ref($stats) && keys %$stats > 0);
	
	my $auto_width = 'calls';
	my @order = qw(class sub calls min/max/avg total pct);
	
	$_->{pct} = ($_->{total}/$total)*100 for (values %$stats);
	
	my $tsum = 0;
	my $csum = 0;
	my $count = 0;
	my @rows = ();
	foreach my $stat (sort {$b->{pct} <=> $a->{pct}} values %$stats) {
		$tsum += $stat->{total};
		$csum += $stat->{calls};
		$count++;
		
		$stat->{$_} = sprintf('%.3f',$stat->{$_}) for(qw(min max avg total));
		$stat->{'min/max/avg'} = $stat->{min} . '/' . $stat->{max} . '/' . $stat->{avg};
		$stat->{pct} = sprintf('%.1f',$stat->{pct}) . '%';

		push @rows, [ map {$stat->{$_}} @order ];
	}

	my $tpct = sprintf('%.1f',($tsum/$total)*100) . '%';
	$tsum = sprintf('%.3f',$tsum);
	
	my $t = Text::SimpleTable::AutoWidth->new(
		max_width => Catalyst::Utils::term_width(),
		captions => \@order
	);

	$t->row(@$_) for (@rows);
	$t->row(' ',' ',' ',' ',' ',' ');
	$t->row('(' . $count . ' Tracked Functions)','',$csum,'',$tsum,$tpct);
	
	my $table = $t->draw;
	
	my $display = BOLD . "Tracked Functions (debug_around) Stats (current request):\n" . CLEAR .
		BOLD.MAGENTA . $table . CLEAR .
		BOLD . "Catalyst Request Elapsed: " . YELLOW . sprintf('%.3f',$total) . CLEAR . "s\n\n";
	
	return $display;

}


## Moved from RapidApp::Catalyst:


sub app_version { eval '$' . (shift)->config->{name} . '::VERSION' }

before 'setup_plugins' => sub {
	my $c = shift;

	# -- override Static::Simple default config to ignore extensions like html.
	my $config
		= $c->config->{'Plugin::Static::Simple'}
		= $c->config->{'static'}
		= Catalyst::Utils::merge_hashes(
			$c->config->{'Plugin::Static::Simple'} || {},
			$c->config->{static} || {}
		);
	
	$config->{ignore_extensions} ||= [];
	$c->config->{'Plugin::Static::Simple'} = $config;
	# --
	
};
# --

# New: convenience method to get the main 'Template::Controller' which
# is being made into a core function of rapidapp:
sub template_controller { (shift)->controller('RapidApp::Template') }

my $share_dir = RapidApp->share_dir;
sub default_tt_include_path {
  my $c = shift;
  return join(':',
    $c->config->{home} . '/root/templates',
    $c->config->{home} . '/root',
    $share_dir . '/templates',
    $share_dir
  );
}

# convenience util function
## TODO: This is to be replaced with a call to template_render() within
## the new Template::Controller (see template_controller() above)
my $TT;
sub template_render {
	my $c = shift;
	my $template = shift;
	my $vars = shift || {};
  
	$TT ||= Template->new({ 
    INCLUDE_PATH => $c->default_tt_include_path,
    ABSOLUTE => 1
  });
	
	my $out;
	$TT->process($template,$vars,\$out) or die $TT->error;

	return $out;
}

# Temp hack to set the include path for our TT Views. These Views will be
# totally refactored in RapidApp 2. This will remain until then:
before 'setup_components' => sub {
  my $c = shift;
  my @views = qw(
    View::RapidApp::TT
    View::RapidApp::Viewport
    View::RapidApp::Printview
    View::RapidApp::HttpStatus
  );
  
  $c->config( $_ => { 
    INCLUDE_PATH => $c->default_tt_include_path,
    ABSOLUTE => 1
  }) for (@views);
};


our $ON_FINALIZE_SUCCESS = [];

## -- 'on_finalize_success' provides a mechanism to call code at the end of the request
## only if successful
sub add_on_finalize_success {
	my $c = shift;
	# make sure this is the CONTEXT object and not a class name
	$c = RapidApp->active_request_context unless (ref $c);
	my $code = shift or die "No CodeRef supplied";
	die "add_on_finalize_success(): argument not a CodeRef" 
		unless (ref $code eq 'CODE');
	
	if(try{$c->stash}) {
		$c->stash->{on_finalize_success} ||= [];
		push @{$c->stash->{on_finalize_success}},$code;
	}
	else {
		push @$ON_FINALIZE_SUCCESS,$code;
	}
	return 1;
}

before 'finalize' => sub {
	my $c = shift;
	my $coderefs = try{$c->stash->{on_finalize_success}} or return;
	return unless (scalar @$coderefs > 0);
	my $status = $c->res->code;
	return unless ($status =~ /^[23]\d{2}$/); # status code 2xx = success, also allow 3xx codes
	$c->log->info(
		"finalize_body(): calling " . (scalar @$coderefs) .
		" CodeRefs added by 'add_on_finalize_success'"
	);
	$c->run_on_finalize_success_codes($coderefs);
};
END { __PACKAGE__->run_on_finalize_success_codes($ON_FINALIZE_SUCCESS); }

sub run_on_finalize_success_codes {
	my $c = shift;
	my $coderefs = shift;
	my $num = 0;
	foreach my $ref (@$coderefs) {
		try {
			$ref->($c);
		}
		catch {
			# If we get here, we're screwed. Best we can do is log the error. (i.e. we can't tell the user)
			my $err = shift;
			my $errStr = RED.BOLD . "EXCEPTION IN CodeRefs added by 'add_on_finalize_success!! [coderef #" . 
				++$num . "]:\n " . CLEAR . RED . (ref $err ? Dumper($err) : $err) . CLEAR;
			
			try{$c->log->error($errStr)} or warn $errStr;
			
			# TODO: handle exceptions here like any other. This might require a bit
			# of work to achieve because by the time we get here we're already past the
			# code that handles RapidApp exceptions, and the below commented out code doesn't work
			#
			# This doesn't work (Whenever this *concept* is able to work, handle in a single
			# try/catch instead of a separate one as is currently done - which we're doing because
			# we're not able to let the user know something went wrong, so we try our best to
			# run each one):
			#delete $c->stash->{on_finalize_success};
			#my $view = $c->view('RapidApp::JSON') or die $err;
			#$c->stash->{exception} = $err;
			#$c->forward( $view );
		};
	}
};
##
## --



1;
