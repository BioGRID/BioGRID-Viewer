#!/usr/bin/perl
use warnings;
use strict;

package BioGRID::REST;
use warnings;
use strict;
use Data::Dumper;

sub new{
    my $c=shift;
    my $s={q=>shift,dbh=>shift};

    $s->{limit}=int($s->{q}->param('max')||0)||10000;
    $s->{offset}=int($s->{q}->param('start')||0);

    return bless $s,$c;
}

sub param{
    my $s=shift;
    my $q=$s->{q};
    my $p=shift;

    return split(m/\|/,$q->param($p)||'') if($p=~m/List$/);
    return $q->param($p);
}

sub _save{
    my $s=shift;
    my $v=shift;

    return $v if($v=~/^-?\d+$/);
    push @{$s->{bind_values}},$v;
    return '?';
}

sub _match{
    my $s=shift;
    my $col=shift;
    my @val=@_;
    my $count=scalar(@val);

    if(1==$count){
	return "$col=".$s->_save($val[0]);
    }elsif(0!=$count){
	return "$col IN(" . join(',',map{
	    $s->_save($_);
	}@val) . ')';
    }
    return ();
}

sub _join{
    my $s=shift;
    my $ar=shift; # AND || OR
    return () if(0==scalar @_);
    return '(' . join(" $ar ",@_) . ')';
}

sub sharedSQL(){
    my $s=shift;
    my @where;

    if('true' eq lc($s->param('selfInteractionsExcluded'))){
	push @where,'(BioGRID_ID_Interactor_A!=BioGRID_ID_Interactor_B)';
    }

    my $tp=lc($s->param('throughputTag'));
    if(($tp eq 'low') || ($tp eq 'high')){
	push @where,"(Throughput LIKE '%\u$tp Throughput%')";
    }elsif($tp ne 'any'){
	warn "What's '$tp' Throughput?"
    }

    push @where,$s->_match('Experimental_System',$s->param('evidenceList'));
    push @where,$s->_match('Pubmed_ID',$s->param('pubmedList'));

    return () if(0==scalar @where);
    return join(' AND ',@where);
}

# the sql to get all the data
sub whereSQL{
    my $s=shift;

    my @where;

    my @gtax=$s->param('geneTaxIdList');
    my @gene=$s->param('geneList');
    push @where,$s->_join
      ('OR',
       $s->_join
       ('AND',
	$s->_match('Official_Symbol_Interactor_A',@gene),
	$s->_match('Organism_Interactor_A',@gtax)
       ),
       $s->_join
       ('AND',
	$s->_match('Official_Symbol_Interactor_B',@gene),
	$s->_match('Organism_Interactor_B',@gtax)
       )
      );

    if('true' eq lc($s->param('interSpeciesExcluded'))){
	push @where,'(Organism_Interactor_A==Organism_Interactor_B)';
    }

    push @where, $s->sharedSQL();

    return return join(' AND ',@where);
}

sub sth{
    my $s=shift;
    my $what=shift;
    my $limit=shift;

    $s->{bind_values}=[];
    my $where=$s->whereSQL();
    my $sth;

    if('true' eq lc($s->param('includeInteractorInteractions'))){
 	my $bgId='BioGRID_ID_Interactor_';
	my $sql="SELECT ${bgId}A,${bgId}B FROM biogrid WHERE $where";
	$sth=$s->{dbh}->prepare($sql);
	$sth->execute(@{ $s->{bind_values} });

    	my %want;
    	while(my @row=$sth->fetchrow_array()){
    	    $want{$row[0]}++;
    	    $want{$row[1]}++;
    	}
	my @want=keys %want;

	$s->{bind_values}=[];
	if(0==scalar @want){
	    # Some query that alwas returns nothing
	    my $sql="SELECT $what FROM biogrid WHERE BioGRID_Interaction_ID=-1";
	    $sth=$s->{dbh}->prepare($sql);
	    $sth->execute();
	}else{
	    $sql="SELECT $what FROM biogrid WHERE ".$s->_join
	      ('AND',
	       $s->_match("${bgId}A",@want),
	       $s->_match("${bgId}B",@want),
	       $s->sharedSQL()
	      ).$limit;
	    $sth=$s->{dbh}->prepare($sql);
	    $sth->execute(@{ $s->{bind_values} });
	}
    }else{

	my $sql="SELECT $what FROM biogrid WHERE $where $limit";
	$sth=$s->{dbh}->prepare($sql);
	$sth->execute(@{ $s->{bind_values} });
    }
    #warn Dumper $sth->{Statement}, Dumper $s->{bind_values};
    return $sth;
}


sub dumpTab2{
    my $s=shift;
    my $sth=$s->sth('*','LIMIT '.$s->{limit});

    while(my @row=$sth->fetchrow_array()){
	print join("\t",map{
	    $_||'-';
	}@row)."\n";
    }
}

sub count{
    my $s=shift;
    my $sth=$s->sth('COUNT(*)','');
    my @row=$sth->fetchrow_array();
    return $row[0];
}

package main;
use DBI;
use CGI;

my $dbh=DBI->connect("dbi:SQLite:dbname=/dev/shm/biogrid","","");
my $q=new CGI;
my $r=new BioGRID::REST($q,$dbh);


print $q->header(-type=>'text/plain');
if('count' eq ($q->param('format')||'')){
    print $r->count();
}else{
    $r->dumpTab2();
}


#20093466

