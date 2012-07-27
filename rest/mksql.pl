#!/usr/bin/perl
use warnings;
use strict;
use List::Util qw/first/;

my @integer=
(
 'BioGRID_Interaction_ID',
 'Entrez_Gene_Interactor_A',
 'Entrez_Gene_Interactor_B',
 'BioGRID_ID_Interactor_A',
 'BioGRID_ID_Interactor_B',
 'Pubmed_ID',
 'Organism_Interactor_A',
 'Organism_Interactor_B',
);


my %oid=
  (
#   559292=>4932,
  );

sub oid{
    my $id=shift;
#    warn "$id<<<\n";
    if(exists($oid{$id})){
#	warn "$id=>$oid{$id}\n";
	return $oid{$id};
    }
    return $id;
}


my @col=split(m/\t/,<>);
$col[0]=substr $col[0],1;
chomp $col[-1];

my $table='biogrid';

my $sql="CREATE TABLE $table(\n";
$sql.=join(",\n",map{
    s/\s+/_/g;
    my $c=$_;
    if(first{$_ eq $c}@integer){
	"$c INTEGER";
    }else{
	"$c TEXT COLLATE NOCASE";
    }
}@col);
print $sql.");\n";

while(<>){
    my @val=split(m/\t/);
    chomp $val[-1];

    if(scalar @col != scalar @val){
	die "whoe there!";
    }

    $val[15]=oid($val[15]);
    $val[16]=oid($val[16]);

    my $insert="INSERT INTO $table VALUES(\n";
    $insert .= join(",\n", map{
	s/\'/''/g;
	if($_ eq '-'){
	    'NULL';
	}else{
	    "'$_'";
	}
    } @val);
    print $insert.");\n"
}
