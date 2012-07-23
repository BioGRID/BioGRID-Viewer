#!/usr/bin/perl
use warnings;
use strict;
use CGI;
use FindBin;
use lib $FindBin::Bin;

use common;

my $c=new common;
my $q=new CGI;

print $q->header(-type=>'text/plain') . $c->version() . "\n";


