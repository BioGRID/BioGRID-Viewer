#!/usr/bin/perl
use warnings;
use strict;
use CGI;
use FindBin;
use lib $FindBin::Bin;

use common;

my $c=new common;
my $q=new CGI;
my $dbh=$c->dbi();

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
