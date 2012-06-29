#!/usr/bin/perl
use warnings;
use strict;
use CGI;

my $q=new CGI;

print $q->header(-type=>'text/plain') . "BIOGRID-ALL-3.1.89\n";



