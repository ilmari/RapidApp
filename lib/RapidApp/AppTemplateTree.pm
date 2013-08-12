package RapidApp::AppTemplateTree;
use strict;
use warnings;
use Moose;
extends 'RapidApp::AppNavTree';

=pod

=head1 DESCRIPTION

Special nav tree designed to display templates from the Template::Controller
system (RapidApp::Template::*)

=cut

use RapidApp::Include qw(sugar perlutil);

has '+fetch_nodes_deep', default => 0;
has 'template_regex', is => 'ro', isa => 'Maybe[Str]', default => sub {undef};

sub TC { (shift)->c->template_controller }

sub template_tree_items {
	my $self = shift;
  
  my $TC = $self->TC;
  my $templates = $TC->get_Provider->list_templates($self->template_regex);
  
  my $items = [];
  foreach my $template (@$templates) {
    my $cnf = {
      id => 'tpl-' . $template,
      leaf => \1,
      name => $template,
      text => $template,
      iconCls => 'ra-icon-page-white-world',
      loadContentCnf => { autoLoad => { url => '/tple/' . $template }},
      loaded => \1
    };
    
    $self->apply_tpl_node($cnf);
    push @$items, $cnf;
  }
  
  return $items;
}


sub apply_tpl_node {
  my ($self, $node) = @_;
  my $template = $node->{name} or return;
  
  %$node = ( %$node,
    iconCls => 'ra-icon-page-white',
    text => join('',
      '<span style="color:purple;">',
      $node->{text},
      '</span>'
    )
  ) if $self->TC->Access->template_external_tpl($template);
}


sub fetch_nodes {
	my $self = shift;
	my ($node) = @_;
  
  # Return the root node without children to spare the
  # template query until it is actually expanded:
  return [{
		id			=> 'tpl-list',
		text		=> 'Templates',
		expand		=> 0,
	}] if ($node eq 'root');
  
	# The only other possible request is for the children of 
  # 'root/tpl-list' above:
  my $items = $self->template_tree_items;
  
  #return $items;
  return $self->folder_convert($items);
}

# Splits and converts a flat list into an ExtJS tree/folder structure
sub folder_convert {
  my ($self, $items) = @_;
  
  my $root = [];
  my %seen = ( '' => $root );
  
  foreach my $item (@$items) {
    my @parts = split(/\//,$item->{name});
    my $leaf = pop @parts;
    
    my @stack = ();
    foreach my $part (@parts) {
      my $parent = join('/',@stack) || '';
      push @stack, $part;
      my $folder = join('/',@stack);
      
      unless($seen{$folder}) {
        my $cnf = {
          id => 'tpl-' . $folder . '/',
          name => $folder . '/',
          text => $part,
          children => []
        };
        $self->apply_tpl_node($cnf);
        delete $cnf->{iconCls} if (exists $cnf->{iconCls});
        $seen{$folder} = $cnf->{children};
        push @{$seen{$parent}}, $cnf;
      }
    }
    
    my $folder = join('/',@stack);
    my $new = {
      %$item,
      text => $leaf
    };
    $self->apply_tpl_node($new);
    push @{$seen{$folder}}, $new;
  }
  return $root;
}



1;