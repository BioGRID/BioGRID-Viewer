BGV.Interactions=function(taxa){
  this._edges={};
  this._nodes={};
  this._taxa={};
  
  if(undefined!==taxa){
    taxa.forEach(function(taxon){
      this._taxa[taxon.id]=taxon;
    },this);
  }
}
BGV.Interactions.prototype={
  assimilate:function(o){
    
    // remove items we don't want anymore
    for(var id in this._edges){
      if(undefined===o._edges[id]){
	var aId=this._edges[id].interactorA().id();
	var bId=this._edges[id].interactorB().id();
	
	[aId,bId].forEach(function(nId){
	  if(undefined===o._nodes[nId]){
	    delete this._nodes[nId];
	  }
	},this);
	
	if(undefined!==this._edges[id].tr){
	  var tr=this._edges[id].tr;
	  tr.parentElement.removeChild(tr);
	}
	delete this._edges[id];
      }
    }


    for(var id in o._nodes){
      if(undefined===this._nodes[id]){
	var node=this._nodes[id]=new BGV.Interactions.Node(o._nodes[id]);
	node.O=this._taxa[node.organismID()];
      }
    }
    for(var id in o._edges){
      if(undefined===this._edges[id]){
	var edge=new BGV.Interactions.Edge(o._edges[id]);
	this._edges[id]=edge;
	
	edge.A=this._nodes[edge.data.BioGRIDInteractorA];
	edge.B=this._nodes[edge.data.BioGRIDInteractorB];
      }
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
  
/*
  tr:function(){
    var q=this.data.Qualifications;
    return [
      this.data.ExperimentalSystemName,
      this.interactorA().tdHTML().toString(),
      this.interactorB().tdHTML().toString(),
      this.aPubmedHTML(),
      this.data.InteractionThroughput,
      (q==='-')?'':q];
  },
*/  

  trHTML:function(tbody){
    if(undefined!==this.tr){
      return tr;
    }
    
    var a=this.interactorA();
    var b=this.interactorB();
    
    var tr=document.createElement('tr');
    tr.setAttribute('class','interaction');
    tr.setAttribute('id',this.id());
    
    [a,b].forEach(function(node){
      tr.appendChild(node.tdHTML());
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
    }else{
      td.setAttribute('class','blank')
    }
    tr.appendChild(td);
    
    
    this.tr=tr;
    tbody.appendChild(tr);
    return tr;
  }

};

BGV.Interactions.Node=function(o){
  this.data=o?o.data:{};
};
BGV.Interactions.Node.prototype={
  id:function(){
    return 'i'+this.data.BioGRIDInteractorID;
  },
  
  organismID:function(){
    return this.data.OrganismID;
  },
  displayOrganism:function(){
    return this.O.species;
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
  },
  
  tdHTML:function(){
    var td=document.createElement('td');
    td.setAttribute('class',this.id());
    
    var o=document.createElement('em');
    o.textContent=this.displayOrganism();
    td.appendChild(o);
    td.appendChild(document.createTextNode(' '));
    td.appendChild(this.aBioGridHTML());
    
    return td;
  }
}