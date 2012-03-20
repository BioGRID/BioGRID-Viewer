BGV.parser.rest={
  load:function(){
    var that=this;
    window.location.href.split('?',2)[1].split('&').forEach(
      function(attr){
	var skip=['enableCaching','format'];

	var kv=attr.split('=',2);
	if(-1==skip.indexOf(kv[0])){
	  that._queryString[kv[0]]=kv[1];
	}
      }
    );
    BGV.ajax(
      this.interactionsURL(),function(t){
	that.parse(t);BGV.view(that._queryString.geneList);
      }
    );

    var bgv='BioGRIDVersion';
    BGV.e.BioGRIDVersion=document.getElementsByClassName(bgv);
    BGV.ajax(this.versionURL(),function(v){BGV.updateElementsText(bgv,v);});
  },

  _queryString:{},
  queryString:function(){
    var out=[];
    for(var k in this._queryString){
      out.push(k+'='+this._queryString[k]);
    }
    return out.join('&');
  },

  interactionsURL:function(){
    return BGV.config('rest','url')+'resources/interactions?enableCaching=true&'+this.queryString();
  },
  countURL:function(){
    return this.interactionsURL()+"&format=count";
  },
  versionURL:function(){
    return BGV.config('rest','url')+'resources/version';
  },

  evidenceList:{
    physical:[
      "Affinity Capture-Luminescence",
      "Affinity Capture-MS",
      "Affinity Capture-RNA",
      "Affinity Capture-Western",
      "Biochemical Activity",
      "Co-crystal Structure",
      "Co-fractionation",
      "Co-localization",
      "Co-purification",
      "Far Western",
      "FRET",
      "PCA",
      "Protein-peptide",
      "Protein-RNA",
      "Reconstituted Complex",
      "Two-hybrid"
    ],
    genetic:[
      "Dosage Growth Defect",
      "Dosage Lethality",
      "Dosage Rescue",
      "Negative Genetic",
      "Phenotypic Enhancement",
      "Phenotypic Suppression",
      "Positive Genetic",
      "Synthetic Growth Defect",
      "Synthetic Haploinsufficiency",
      "Synthetic Lethality"
    ]
  },

  parse:function(tsv){
    var lines=tsv.trim().split("\n");
    var l=lines.length;

    BGV.ajax(
      this.countURL(),function(t){
	var c=l;
	if(t!=l){
	  c+=" of "+t;
	}
	BGV.updateElementsText('InteractionCount',c);
      }
    );

    while(lines.length>0){
      var line=lines.shift();
      BGV.addEdge(new this.edge(line.split("\t"),this));
    }
  },


  edge:function(values,that){
    if(values.length<24){
      throw "Invalid tab2 line";
    }

    this.BioGRIDInteractionID=values[0];
    this.ExperimentalSystemName=values[11]; // |
    this.ExperimentalSystemType=values[12];
    this.PaperReference=values[13];
    this.PubmedID=values[14];
    this.InteractionThroughput=values[17];//.split('|');
    this.QuantitativeScore=values[18];
    this.PostTranslationalModification=values[19];
    this.Phenotypes=values[20]; // |
    this.Qualifications=values[21]; // |
    this.Tags=values[22];
    this.SourceDatabase=values[23];

    this.source=new that.node(values,0);
    this.target=new that.node(values,1);
  },

  node:function(values,i){
    this.Entrez=values[1+i];
    this.BioGridId=values[3+i];
    this.SystematicName=values[5+i];
    this.OfficialSymbol=values[7+i];
    this.Synonyms=values[9+i];
    this.OrganismID=values[15+i];

    if(undefined==BGV.taxa[this.OrganismID]){
      throw "Taxa id " + this.OrganismID + " not found.";
    }
  }

};

BGV.parser.rest.edge.prototype={
  id:function(){
    return this.SourceDatabase+this.BioGRIDInteractionID;
  },
  classes:function(){
    var c=['edge', this.ExperimentalSystemType];
    return c.join(' ');
  }
};
BGV.parser.rest.node.prototype={
  id:function(){
    return this.BioGridId;
  },
  taxonId:function(){
    return this.OrganismID;
  },
  taxon:function(){
    return BGV.taxa[this.OrganismID];
  },
  color:function(def){
    var out=BGV.taxa[this.OrganismID].color();
    if(null==out){
      out=def;
    }
    return out;
  },
  display:function(){
    return this.OfficialSymbol;
  },
  cmp:function(x){
    if(this.OrganismID<x.OrganismID){
      return -1;
    }else if(this.OrganismID>x.OrganismID){
      return 1;
    }

    if(this.OfficialSymbol<x.OfficialSymbol){
      return -1;
    }else if(this.OfficialSymbol>x.OfficialSymbol){
      return 1;
    }

    return 0;
  },
  match:function(s){
    return (s.toLowerCase()==this.OfficialSymbol.toLowerCase());
  },
  classes:function(){
    return 'node';
  }

};