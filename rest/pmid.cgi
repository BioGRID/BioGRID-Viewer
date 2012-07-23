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
my $dbh=DBI->connect($conf{data_source},$conf{username},$conf{auth})
  or die $DBI::errstr;

print $q->header(-type=>'text/plain','-charset'=>'UTF-8');
my $sth=$dbh->prepare(<<SQL);
SELECT DISTINCT Pubmed_ID,Author,COUNT(*)
FROM biogrid GROUP BY Pubmed_ID ORDER BY Author
SQL
$sth->execute();
my $selected=$q->param('selected')||0;
while(my @row=$sth->fetchrow_array()){
#    print join("\t",@row)."\n"; 
    print "<option value=\"$row[0]\"";
    print ' selected="selected"' if($row[0]==$selected);
    print " label=\"I:$row[2] $row[1]\">";
}
