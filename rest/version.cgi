#!/usr/bin/perl
use warnings;
use strict;
use CGI;

open(CONF,'config')or die $!;
my %conf;
while(<CONF>){
    next if(m/^#/);
    chomp;
    my($k,$v)=split(m/:/,$_,2);
    $conf{$k}=$v;
}

my $q=new CGI;

print $q->header(-type=>'text/plain') . "$conf{version}\n";


