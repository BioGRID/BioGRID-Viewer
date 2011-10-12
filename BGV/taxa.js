/* Species names from
http://www.ncbi.nlm.nih.gov/Taxonomy/TaxIdentifier/tax_identifier.cgi
*/

BGV.defaultTaxon={
//  color:'transparent',
  color:'white',
  display:function(){
    var c = (this.common == undefined) ? Infinity : this.common.length;
    return (c < this.species.length) ? this.common : this.species;
  }
};

BGV.Taxon=function(a,b,c){
  this.species = a;
  if (b != undefined) this.common = b;
  if (c != undefined) this.color = c;
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
    return BGV.taxa.list[id];
  },

  list:{
    9606:new BGV.Taxon("Homo sapiens","human","#FF6347"),
    4932:new BGV.Taxon("Saccharomyces cerevisiae","yeast","#00FFFF")

    /*
    3055:new BG.Taxon("Chlamydomonas reinhardtii"),
    3702:new BG.Taxon("Arabidopsis thaliana","thale cress","#9ACD32"),
    4577:new BG.Taxon("Zea mays","maize"),
    4896:new BG.Taxon("Schizosaccharomyces pombe","fission yeast","#8A2BE2"),
    6239:new BG.Taxon("Caenorhabditis elegans","roundworm","#DAA520"),
    7227:new BG.Taxon("Drosophila melanogaster","fruit fly","#00CED1"),
    7955:new BG.Taxon("Danio rerio","zebrafish","#6495ED"),
    8355:new BG.Taxon("Xenopus laevis","African clawed frog"),
    9031:new BG.Taxon("Gallus gallus","chicken","#DB70DB"),
    9615:new BG.Taxon("Canis lupus familiaris","dog"),
    9913:new BG.Taxon("Bos taurus:","cattle"),
    10090:new BG.Taxon("Mus musculus","house mouse","#C0D9D9"),
    10116:new BG.Taxon("Rattus norvegicus","Norway rat","#FFD700"),
    10298:new BG.Taxon("Human herpesvirus 1"),//,"Herpes simplex virus type 1"),
    10376:new BG.Taxon("Human herpesvirus 4"),//,"Epstein-Barr virus"),
    11103:new BG.Taxon("Hepatitis C virus"),
    11676:new BG.Taxon("Human immunodeficiency virus 1"),
    36329:new BG.Taxon("Plasmodium falciparum 3D7"),
    237561:new BG.Taxon("Candida albicans SC531"),
    224308:new BG.Taxon("Bacillus subtilis subsp. subtilis str. 168"),
    511145:new BG.Taxon("Escherichia coli str. K-12 substr. MG1655",undefined,"#98FB98"),
     */
  }
};