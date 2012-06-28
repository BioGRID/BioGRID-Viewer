#!/usr/bin/perl
use warnings;
use strict;
use DBI;
use CGI;
use Data::Dumper;

my $dbh=DBI->connect("dbi:SQLite:dbname=/dev/shm/biogrid","","");
my $q=new CGI;

print $q->header(-type=>'text/plain');

my @where;
my @args;

# ?enableCaching=true
# &includeInteractors=TRUE
# &searchNames=true
# &geneList=ccc2
# &geneTaxIdList=559292
# &interSpeciesExcluded=TRUE
# &throughputTag=low
# &selfInteractionsExcluded=FALSE
# &includeInteractorInteractions=TRUE

sub comma{
    my $col=shift;
    my @vals=@_;
    my $count=scalar(@vals);

    if(1==$count){
	push @where,"$col=?";
	push @args, $vals[0];
    }elsif(0!=$count){
	my $qm=join(',',('?')x $count);
	push @where,"$col IN($qm)";
	push @args, @vals;
    }
}


my @gtax=split(m/\|/,$q->param('geneTaxIdList'));
my @gene=split(m/\|/,$q->param('geneList'));
my @also;

# dosen't need to be in @also
if('true' eq lc($q->param('interSpeciesExcluded'))){
    push @where,'(Organism_Interactor_A==Organism_Interactor_B)';
}


if('true' eq lc($q->param('selfInteractionsExcluded'))){
    push @where,'AND' if(0<scalar(@where));
    push @where,'(BioGRID_ID_Interactor_A!=BioGRID_ID_Interactor_B)';
    push @also, $where[-1];
}

my $tp=lc($q->param('throughputTag'));
if(($tp eq 'low') || ($tp eq 'high')){
    push @where,'AND' if(0<scalar(@where));
    push @where,"(Throughput LIKE '%$tp %')";
    push @also, $where[-1];
}


# put this last
my @ev=split(m/\|/,lc($q->param('evidenceList')));
if(0!=scalar @ev){
    push @where,'AND' if(0<scalar(@where));
    comma('Experimental_System',@ev);
    push @also,$where[-1];
}


push @where,'AND' if(0<scalar(@where));

push @where,'((';
comma('Organism_Interactor_A',@gtax);
push @where,'AND';
comma('Official_Symbol_Interactor_A',@gene);
push @where,')';

push @where,'OR';

push @where,'(';
comma('Organism_Interactor_B',@gtax);
push @where,'AND';
comma('Official_Symbol_Interactor_B',@gene);
push @where,'))';

#print Dumper \@where,\@args;


sub mkSql{
    my $cp=shift;
    my $sql="SELECT ";
    if($cp){
	$sql.='COUNT(*)';
    }else{
	$sql.='*';
    }
    $sql.=' FROM biogrid WHERE ' . join("\n",@_);
    warn "$sql\n----\n";
    return $sql;
}


my $sth;
my $countp='count' eq lc($q->param('format')||'');
if('true' eq lc($q->param('includeInteractorInteractions'))){
    $sth=$dbh->prepare(mkSql(undef,@where));
    $sth->execute(@args);

    my %want;
    while(my @row=$sth->fetchrow_array()){
	$want{$row[3]}++;
	$want{$row[4]}++;
    }

    @where=();
    @args=();

    push @where,'(';
    comma('BioGRID_ID_Interactor_A',keys %want);
    push @where,'AND';
    comma('BioGRID_ID_Interactor_B',keys %want);
    push @where,')';

    if(0!=scalar(@also)){
	push @where,'AND';
	push @where,join(' AND ',@also);
    }

    $sth=$dbh->prepare(mkSql($countp,@where));
    $sth->execute(@args,@ev);
}else{
    warn Dumper \@where,\@args;
    $sth=$dbh->prepare(mkSql($countp,@where));
    $sth->execute(@args);
}




while(my @row=$sth->fetchrow_array()){
    print join("\t",map{
	$_||'-';
    }@row)."\n";
}
