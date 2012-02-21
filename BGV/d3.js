Math.TAU=2*Math.PI;

BGV.holdMe.d3={
  load:function(){
    this.links=document.getElementById('links');

  },

  // takes a list of start.tab2node objects and returns an object
  // suitable for input into d3's cluster.nodes() function.  If match
  // specified it will *try* to make that one a center.
  tree:function(nodes,match){
    var tree={children:nodes};
    if((undefined!=match) && (match.length>2) && (-1==match.indexOf('|'))){
      var node=BGV.node(match);
      if(node!=null){
    	nodes.splice(nodes.indexOf(node),1);
    	node.children=nodes;
    	tree=node;
      }
    }
    return tree;
  },

  // take a list of start.tab2node objects and returns a list of
  // elements seporated by species. Suitable for use with d3.svg.arc()
  groups:function(nodes){
    var groups=[];

    nodes.forEach(
      function(node){
	var taxa=node.taxa();
	var last=groups[groups.length-1];

	if(0==groups.length || (last.taxa!=taxa)){
	  groups.push({taxa:taxa,count:1});
	}else{
	  last.count++;
	}
      }
    );

    if(groups.length==1){
      groups[0].startAngle=0;
      groups[0].endAngle=Math.TAU;
    }else{
      var gap=Math.TAU/500;
      var slice=Math.TAU/nodes.length;
      var rad=gap/2;
      groups.forEach(
	function(group){
	  group.startAngle=rad;
	  group.endAngle=(rad+(group.count*slice))-gap;
	  rad=group.endAngle;
	  rad+=gap;
	}
      );
    }

    return groups;
  },

  // svg utils


  // If the first child of the argument is a <rect> wrap it around.
  rectChild:function(g,w,h){
    var fc=g.firstChild;
    if('rect'==fc.nodeName){
      fc.removeAttribute('width');
      fc.removeAttribute('height');
      var bb=g.getBBox();
      fc.setAttribute('width',bb.width+w);
      fc.setAttribute('height',bb.height+h);
    }
  }

};
