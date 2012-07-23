package common;
use warnings;
use strict;
use DBI;

sub new{
    my $c=shift;
    my $s=
      { # defaults
	data_source=>'dbi:SQLite:dbname=biogrid',
	username=>'',
	auth=>'',
	version=>'????'
      };
    
    if(open(CONF,'config')){
	while(<CONF>){
	    next if(m/^#/);
	    chomp;
	    my($k,$v)=split(m/:/,$_,2);
	    $s->{$k}=$v;
	}
    }else{
	warn "found no config file";
    }
    
    return bless $s,$c;
}

sub dbi_connect_args{
    my $s=shift;
    return($s->{data_source},$s->{username},$s->{auth});
}

sub dbi{
    my $s=shift;
    if(!$s->{_dbi}){
	return DBI->connect($s->dbi_connect_args)
	  or die $DBI::errstr;
    }
    return $s->{_dbi};
}

sub version{
    my $s=shift;
    return $s->{version};
}

1;
