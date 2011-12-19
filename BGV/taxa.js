/* Species names from
http://www.ncbi.nlm.nih.gov/Taxonomy/TaxIdentifier/tax_identifier.cgi
*/

BGV.defaultTaxon={
//  color:'transparent',
//  color:'white',
  color:function(otherwise){
    if(null==this._color){
      return otherwise;
    }else{
      return this._color;
    }
  },
  commonName:function(){
    var c = (this.common == undefined) ? Infinity : this.common.length;
    return (c < this.species.length) ? this.common : this.species;
  },
  display:function(){
    if(this.species==false){
      return this.common;
    }

    var gs=this.species.split(' ',3);
    return gs[0][0] + '.\u00A0' + gs[1];
  }
};

BGV.Taxon=function(a,b,c){
  this.species = a;
  if (b != undefined) this.common = b;
  if (c != undefined) this._color = c;
};
BGV.Taxon.prototype = BGV.defaultTaxon;

BGV.taxa={
  optionTags:function(selected){
    var out = '';
    for(var id in this.list){
      out += '<option value="' + id + '"';
      if(id == selected){
	out += ' selected="selected"';
      }
      out += '">' + this.list[id].display() + '</option>';
    }
    return out;
  },

  get:function(id){
    var out=BGV.taxa.list[id];
    if(undefined==out){
      BGV.taxa.list[id]=new BGV.Taxon(false,"Unkonwn (Taxa ID:"+id+")");
      out=BGV.taxa.list[id];
    }
    return out;
  },

  list:{
    // Go reference genomes colors
    3702:new BGV.Taxon("Arabidopsis thaliana","thale cress","#9ACD32"),
    4896:new BGV.Taxon("Schizosaccharomyces pombe","fission yeast","#8A2BE2"),
    4932:new BGV.Taxon("Saccharomyces cerevisiae","yeast","#00FFFF"),
    6239:new BGV.Taxon("Caenorhabditis elegans","roundworm","#DAA520"),
    7227:new BGV.Taxon("Drosophila melanogaster","fruit fly","#00CED1"),
    7955:new BGV.Taxon("Danio rerio","zebrafish","#6495ED"),
    9031:new BGV.Taxon("Gallus gallus","chicken","#DB70DB"),
    9606:new BGV.Taxon("Homo sapiens","human","#FF6347"),
    10090:new BGV.Taxon("Mus musculus","house mouse","#C0D9D9"),
    10116:new BGV.Taxon("Rattus norvegicus","Norway rat","#FFD700"),
    511145:new BGV.Taxon("Escherichia coli str. K-12 substr. MG1655",'E.coli',"#98FB98"),

    // No color
    8355:new BGV.Taxon("Xenopus laevis","African clawed frog"),
    9615:new BGV.Taxon("Canis lupus familiaris","dog"),
    9913:new BGV.Taxon("Bos taurus","cattle"),
    11676:new BGV.Taxon(false,"Human immunodeficiency virus 1")

    /*
    3055:new BGV.Taxon("Chlamydomonas reinhardtii"),
    4577:new BGV.Taxon("Zea mays","maize"),
    10298:new BGV.Taxon("Human herpesvirus 1"),//,"Herpes simplex virus type 1"),
    10376:new BGV.Taxon("Human herpesvirus 4"),//,"Epstein-Barr virus"),
    11103:new BGV.Taxon("Hepatitis C virus"),
    36329:new BGV.Taxon("Plasmodium falciparum 3D7"),
    237561:new BGV.Taxon("Candida albicans SC531"),
    224308:new BGV.Taxon("Bacillus subtilis subsp. subtilis str. 168"),
     */
  }
};