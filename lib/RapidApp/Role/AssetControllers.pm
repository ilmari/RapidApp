package RapidApp::Role::AssetControllers;

our $VERSION = '0.01';
use Moose::Role;
use namespace::autoclean;

# This Role handles setting up AutoAssets controllers needed for the proper functioning
# of the RapidApp system

use CatalystX::InjectComponent;
use Catalyst::Utils;

with 'Catalyst::Plugin::AutoAssets';

before 'inject_asset_controllers' => sub {
  my $c = shift;
  
  my $cnf = { assets => {
    'Controller::Assets::ExtJS' => {
      type => 'directory',
      include => 'ext-3.4.0',
      persist_state => 1,
      sha1_string_length => 15
    } 
  }};
  
  $c->config( 'Plugin::AutoAssets' => 
    Catalyst::Utils::merge_hashes($cnf, $c->config->{'Plugin::AutoAssets'} || {} )
  );

};



sub extjs_include_tags {
  my $c = shift;
  
  my @css = qw(
    resources/css/ext-all.css
    resources/css/xtheme-gray.css
    examples/ux/fileuploadfield/css/fileuploadfield.css
  );
  
  my @js = qw(
    adapter/ext/ext-base.js
    ext-all-debug.js
    src/debug.js
    examples/ux/fileuploadfield/FileUploadField.js
  );
  
  my @tags = ();
  push @tags, '<link rel="stylesheet" type="text/css" href="' .
    $c->controller('Assets::ExtJS')->asset_path($_) .
  '" />' for (@css);
  
  push @tags, '<script type="text/javascript" src="' .
    $c->controller('Assets::ExtJS')->asset_path($_) .
  '"></script>' for (@js);
  
  my $html = 
		"\r\n\r\n<!--   AUTO GENERATED BY " . ref($c) . " (AutoAssets)   -->\r\n" .
		( scalar @tags > 0 ? 
			join("\r\n",@tags) : '<!--      NO ASSETS AVAILABLE      -->'
		) .
		"\r\n<!--  ---- END AUTO GENERATED ASSETS ----  -->\r\n\r\n";
  
  return $html;
}



1;