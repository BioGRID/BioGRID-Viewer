BGV.Interactions=function(){
  this._edges={};
  this._nodes={};
}
BGV.Interactions.prototype={
  assimilate:function(o){
    for(var id in o._nodes){
      this._nodes[id]=new BGV.Interactions.Node(o._nodes[id]);
    }
    for(var id in o._edges){
      var edge=new BGV.Interactions.Edge(o._edges[id]);
      this._edges[id]=edge;
	
      edge.A=this._nodes[edge.data.BioGRIDInteractorA];
      edge.B=this._nodes[edge.data.BioGRIDInteractorB];
    }
  },
  
  hasEdge:function(edge){
    return (undefined !== this._edges[edge.id()]);
  },
  hasNode:function(node){
    return (undefined !== this._nodes[node.id()]);
  },
  
  addNode:function(node){
    if(this.hasNode(node)){
      return this._nodes[node.id()];
    }
    
    this._nodes[node.id()]=node;
    return node;
  },
  addEdge:function(edge){
    if(this.hasEdge(edge)){
      return this._edges[edge.id()];
    }
    
    this.addNode(edge.source).id();
    this.addNode(edge.target).id();
    
    this._edges[edge.id()]=edge;
    return edge;
  },
  
  forEach:function(callback){
    for(var id in this._edges){
      var edge=this._edges[id];

      callback(edge);
    }    
  },
  interactionCount:function(){
    return Object.keys(this._edges).length;
  }  
}

BGV.Interactions.Edge=function(o){
  this.data=o?o.data:{};
};
BGV.Interactions.Edge.prototype={
  id:function(){
    return this.data.SourceDatabase+this.data.BioGRIDInteractionID;
  },
  
  interactorA:function(){
    return this.A;
  },
  interactorB:function(){
    return this.B;
  },
  
  // dom creation, not for use in Web Worker
  
  aPubmedHTML:function(){
    var a=document.createElement('a');
    a.setAttribute('href','http://www.ncbi.nlm.nih.gov/pubmed?term='+this.data.PubmedID);
    a.textContent=this.data.PaperReference;
    return a;
  },

  trHTML:function(){
    var a=this.interactorA();
    var b=this.interactorB();
    
    var tr=document.createElement('tr');
    
    [a,b].forEach(function(node){
      var td=document.createElement('td');
      td.appendChild(node.aBioGridHTML());
      tr.appendChild(td);
      
      var td=document.createElement('td');
      td.textContent=node.displayOrganism();
      tr.appendChild(td);
    });
    
    var td=document.createElement('td');
    td.textContent=this.data.ExperimentalSystemName;
    tr.appendChild(td);
    
    var td=document.createElement('td');
    td.appendChild(this.aPubmedHTML());
    tr.appendChild(td);
    
    var td=document.createElement('td');
    td.textContent=this.data.InteractionThroughput;
    tr.appendChild(td);
    
    var td=document.createElement('td');
    var q=this.data.Qualifications;
    if(q!=='-'){
      td.textContent=q;
      tr.appendChild(td);
    }
    
    return tr;
  }

};

BGV.Interactions.Node=function(o){
  this.data=o?o.data:{};
};
BGV.Interactions.Node.prototype={
  id:function(){
    return this.data.BioGRIDInteractorID;
  },
  
  displayOrganism:function(){
    return this.id();
  },
  display:function(){
    return this.data.OfficialSymbol;
  },
  
  // dom creation, don't use in Web Worker
  
  aBioGridHTML:function(){
    var a=document.createElement('a');
    a.textContent=this.display();
    a.setAttribute('href','http://thebiogrid.org/'+this.data.BioGRIDInteractorID);
    return a;
  }
}