#!/usr/bin/perl
use warnings;
use strict;
use CGI;
use DBI;

open(CONF,'config')or die $!;
my %conf;
while(<CONF>){
    next if(m/^#/);
    chomp;
    my($k,$v)=split(m/:/,$_,2);
    $conf{$k}=$v;
}

my $q=new CGI;
my $dbh=DBI->connect($conf{data_source},$conf{username},$conf{auth});

print $q->header(-type=>'text/plain','-charset'=>'UTF-8');
my $sth=$dbh->prepare('SELECT DISTINCT Pubmed_ID,Author FROM biogrid ORDER BY Author');
$sth->execute();
my $selected=$q->param('selected');
while(my @row=$sth->fetchrow_array()){
#    print join("\t",@row)."\n"; 
#    print "<option value=\"$row[1]\">$row[0]</option>";
    print "<option value=\"$row[0]\"";
    print ' selected="selected"' if($row[0]==$selected);
    print " label=\"$row[1]\">";
#    print ">$row[1]</option>";
}
