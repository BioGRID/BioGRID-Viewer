/* Species names from
http://www.ncbi.nlm.nih.gov/Taxonomy/TaxIdentifier/tax_identifier.cgi
*/

those.defaultTaxon={
//  color:'transparent',
  color:'white',
  display:function(){
    var c = (this.common == undefined) ? Infinity : this.common.length;
    return (c < this.species.length) ? this.common : this.species;
  }
};

those.Taxon=function(a,b,c){
  this.species = a;
  if (b != undefined) this.common = b;
  if (c != undefined) this.color = c;
};
those.Taxon.prototype = BGV.defaultTaxon;

those.taxa={
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
    return those.taxa.list[id];
  },

  list:{
    9606:new those.Taxon("Homo sapiens","human","#FF6347"),
    4932:new those.Taxon("Saccharomyces cerevisiae","yeast","#00FFFF")

    /*
    3055:new those.Taxon("Chlamydomonas reinhardtii"),
    3702:new those.Taxon("Arabidopsis thaliana","thale cress","#9ACD32"),
    4577:new those.Taxon("Zea mays","maize"),
    4896:new those.Taxon("Schizosaccharomyces pombe","fission yeast","#8A2BE2"),
    6239:new those.Taxon("Caenorhabditis elegans","roundworm","#DAA520"),
    7227:new those.Taxon("Drosophila melanogaster","fruit fly","#00CED1"),
    7955:new those.Taxon("Danio rerio","zebrafish","#6495ED"),
    8355:new those.Taxon("Xenopus laevis","African clawed frog"),
    9031:new those.Taxon("Gallus gallus","chicken","#DB70DB"),
    9615:new those.Taxon("Canis lupus familiaris","dog"),
    9913:new those.Taxon("Bos taurus:","cattle"),
    10090:new those.Taxon("Mus musculus","house mouse","#C0D9D9"),
    10116:new those.Taxon("Rattus norvegicus","Norway rat","#FFD700"),
    10298:new those.Taxon("Human herpesvirus 1"),//,"Herpes simplex virus type 1"),
    10376:new those.Taxon("Human herpesvirus 4"),//,"Epstein-Barr virus"),
    11103:new those.Taxon("Hepatitis C virus"),
    11676:new those.Taxon("Human immunodeficiency virus 1"),
    36329:new those.Taxon("Plasmodium falciparum 3D7"),
    237561:new those.Taxon("Candida albicans SC531"),
    224308:new those.Taxon("Bacillus subtilis subsp. subtilis str. 168"),
    511145:new those.Taxon("Escherichia coli str. K-12 substr. MG1655",undefined,"#98FB98"),
     */
  }
};