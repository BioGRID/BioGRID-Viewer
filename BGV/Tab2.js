// slurps up a tab2 file

BGV.Tab2=function(tsv){
  this._edges={};
  this._nodes={};
  
  lines=tsv.split("\n");

  while(lines.length>0){
    var line=lines.shift().split("\t");
    if(line.length>=24){
      this.addEdge(new BGV.Tab2.Edge(line),this);
    }
  }
}
BGV.Tab2.prototype=new BGV.Interactions();

BGV.Tab2.Node=function(values,i){
  this.data={
    Entrez:values[1+i],
    BioGRIDInteractorID:values[3+i],
    SystematicName:values[5+i],
    OfficialSymbol:values[7+i],
    Synonyms:values[9+i],
    OrganismID:values[15+i]
  };
}
BGV.Tab2.Node.prototype=new BGV.Interactions.Node();


BGV.Tab2.Edge=function(values){
    this.data={
      BioGRIDInteractionID:values[0],
      //BioGRIDInteractorA:values[3],
      //BioGRIDInteractorB:values[4],
      ExperimentalSystemName:values[11], // |
      ExperimentalSystemType:values[12],
      PaperReference:values[13],
      PubmedID:values[14],
      InteractionThroughput:values[17],//.split('|');
      QuantitativeScore:values[18],
      PostTranslationalModification:values[19],
      Phenotypes:values[20], // |
      Qualifications:values[21], // |
      Tags:values[22],
      SourceDatabase:values[23]
    };
  
  this.source=new BGV.Tab2.Node(values,0);
  this.target=new BGV.Tab2.Node(values,1);
  
  this.data.BioGRIDInteractorA=this.source.id();
  this.data.BioGRIDInteractorB=this.target.id();
}
BGV.Tab2.Edge.prototype=new BGV.Interactions.Edge();
