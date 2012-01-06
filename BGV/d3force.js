BGV.holdMe.d3force=function(){
  var force=null;
  var g={};
  var svg=null;
  var defaultRadius=6;

  var jQueryP=function(){
    return 'function'==typeof jQuery;
  };

  // Only needs to be called if you don't provide your own SVG tag
  // (like it bgv.svg does)
  this.load=function(){
    if(jQueryP()){
      svg=d3.select(BGV.e.display)
	.append("section").attr('class','main fullScreen')
	.append("svg:svg").attr('class','bgv');
    }else{
      // if no jQuery you geen a element with id="bgv", likely a g element.
      svg=d3.select('#bgv');
    }
  };

  var tick=function(){
    if(0==Object.keys(g).length){
      return;
    }

    g.circle.attr(
      "transform", function(d) {
	return "translate(" + d.x + "," + d.y + ")";
      }
    );

    g.text.attr(
      "transform", function(d) {
	return "translate(" + d.x + "," + d.y + ")";
      }
    );

    g.path.attr(
      "d", function(d) {
	var out = "M"+d.source.x+","+d.source.y;
	if(d.source===d.target){
	  var ets=d.flag?-50:50; // edge to self
	  out+="C"
	    + (d.source.x+ets) + ',' + (d.source.y) + ' '
	    + (d.source.x) + ',' + (d.source.y+ets) + ' '
	    + d.target.x + ',' + d.target.y;
	}else{
	  var dx=d.target.x-d.source.x;
	  var dy=d.target.y-d.source.y;
	  var dr=Math.sqrt((dx*dx)+(dy*dy));
	  out += "M" + d.source.x + "," + d.source.y +
	    "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
	}
	return out;
      }
    );
  };


  var selected=null;
  var selectNode=function(node,i){
    this.node=node;
    this.circle=g.circle[0][i];
    this.info=document.getElementById('nodeDescription');

    if(null!=selected){
      selected.deselect();
    }

    this.node.updateRestElements();
    this.circle.setAttribute('class','selected');
    this.circle.setAttribute('r',defaultRadius+7);
    this.placeInfo();


    document.onmousemove=document.ontouchmove=function(){
      selected.placeInfo();
    };

    // Only deselect if we did not click in the node description tag
    document.onmousedown=document.ontouchstart=function(e){
      var circle=g.circle[0][i];
      if(e.target!=circle){
	var tag=e.target;
	while(undefined!=tag.getAttribute){
	  if('nodeDescription'==tag.getAttribute('id')){
	    return;
	  }
	  tag=tag.parentNode;
	}
	selected.deselect();
      }
    };
  };
  selectNode.prototype={
    offset:10,

    placeInfo:function(){
      var offset=this.offset;
      this.info.removeAttribute('class');
      if('function'==typeof this.info.getBBox){
	// for an SVG nodeDescripton
	var box=this.info.firstChild;
	box.removeAttribute('width');
	box.removeAttribute('height');
	var bb=this.info.getBBox();
	box.setAttribute('width',bb.width+offset);
	box.setAttribute('height',bb.height+(offset/2));
	this.info.setAttribute(
	  'transform','translate('+(this.node.x+offset)+','+(this.node.y+offset)+')'
	);
      }else if(jQueryP()){
	// for an HTML nodeDescription
	var o=$(svg[0][0]).parent().offset();
	var style='left:'+(this.node.x+o.left+offset)+'px;top:'+(this.node.y+o.top)+'px;';
	this.info.setAttribute('style',style);
      }
    },

    deselect:function(){
      document.onmousemove=
	document.ontouchmove=
	document.onmousedown=
	document.ontouchstart=null;
      this.info.setAttribute('class','hidden');
      this.circle.removeAttribute('class');
      this.circle.setAttribute('r',defaultRadius);
      delete selected;
      selected=null;
    }

  };

  this.toggleUnicodeCheckbox=function(tog,tag){
    var hidden='hidden';
    var off='☐';
    var on='☒'; // ☑

    if(tag.textContent==on){
      // hide edges
      tag.textContent=off;

      g.path[0].forEach(
	function(tag){
	  var classes=tag.getAttribute('class').split(' ');
	  if(-1!=classes.indexOf(tog)){
	    classes.push(hidden);
	    tag.setAttribute('class',classes.join(' '));
	  }
	}
      );

    }else{
      // show edges
      tag.textContent=on;

      g.path[0].forEach(
	function(tag){
	  var classes=tag.getAttribute('class').split(' ');
	  if(-1!=classes.indexOf(tog)){
	    var i=classes.indexOf(hidden);
	    if(-1!=i){
	      classes.splice(i,1);
	      tag.setAttribute('class',classes.join(' '));
	    }
	  }
	}
      );

    }
  };




  this.meltSelectedNode=function(){
    selected.node.fixed=0;
    selected.deselect();
  };
  var clickNode=function(node,i){
    selected=new selectNode(node,i);
  };
  var freezeNode=function(node){
    node.fixed=1;
  };


  var pathOver=function(edge,i){
    var path=g.path[0][i];
    path.setAttribute('stroke-width', edge.ids.length+5);
  };
  var pathOut=function(edge,i){
    var path=g.path[0][i];
    path.setAttribute('stroke-width', edge.ids.length);
  };
  var pathClick=function(node,i){
    console.log(node);
  };

  this.resize=function(edges){
    var e2d=convertEdges(edges);

    // If jQuery do this, else do that.  :-P
    var size=jQueryP()                                              ?
      [$(svg[0][0]).parent().width(),$(svg[0][0]).parent().height()]:
      [window.innerWidth,window.innerHeight]                        ;
//    var ld=Math.min(size[0],size[1])*0.40;

    if(null==force){
      force=d3.layout.force()
	.nodes(e2d.nodes)
	.links(e2d.links)
	.size(size)
	.charge(-300)
	.linkDistance(150)
	.linkStrength(1)
	.on("tick",tick)
	.gravity(0.1)
	.start();
    }else{
      force
	.size(size)
//	.linkDistance(ld)
	.start();
    }

    if(e2d.fresh){

      while((null!=svg[0][0].lastChild) && ('g'==svg[0][0].lastChild.nodeName)){
	svg[0][0].removeChild(svg[0][0].lastChild);
      }

      force
        .nodes(e2d.nodes)
	.links(e2d.links)
      	.start();

      g.path=svg.append("svg:g").selectAll("path")
	.data(force.links())
	.enter().append("svg:path")
	.attr(
	  "class",function(e){
	    return "link "+e.tag;
	  }
	)
	.attr('stroke-width',function(d){return d.ids.length;})
//    	.on("mousemove",pathOver)
//    	.on("mouseout",pathOut)
	//.on("click",pathClick)
      ;

      g.circle=svg.append("svg:g").selectAll("circle")
	.data(force.nodes())
	.enter()
	.append("svg:circle")
	.attr("r",defaultRadius)
	.attr("fill",function(n){return n.color();})
	.on("mousedown",freezeNode)
	.on("click",clickNode)
      // iOS get all touchy-feely
	.on("touchmove",freezeNode)
	.on("touchstart",freezeNode)
	.on("touchend",clickNode)
	.call(force.drag);

      g.text = svg.append("svg:g")
	.attr('class','nodeLabels')
	.selectAll("g")
	.data(force.nodes())
	.enter()
	.append("svg:g");
      // A copy of the text with a thick white stroke for legibility.
      g.text.append("svg:text")
	.attr("x",".31em")
	.attr("y",-10)
	.attr("class", "shadow")
	.text(function(d){return d.display();});
      g.text.append("svg:text")
	.attr("x",".31em")
	.attr("y",-10)
	.text(function(d){return d.display();});
    }
  };

  var _links={};
  var _nodes={};

  var anEdge=function(s,t,e,tag,f){
    this.source=_nodes[s];
    this.target=_nodes[t];
    this.ids=[e];
    this.tag=tag;
    this.flag=f;
  };
  anEdge.prototype={
    addEdgeId:function(id){
      if(-1==this.ids.indexOf(id)){
	this.ids.push(id);
      }
    }
  };

  var nodeMap=function(edgeId,s,e,tag,flag){
    var Sid=s.id(); // start
    var Eid=e.id(); // end

    if(null==_links[tag]){
      _links[tag]={};
    }

    if(null==_links[tag][Sid]){
      _links[tag][Sid]={};
    }

    if(null==_links[tag][Sid][Eid]){
      _links[tag][Sid][Eid]=new anEdge(Sid,Eid,edgeId,tag,flag);
      fresh=true;
    }else{
      _links[tag][Sid][Eid].addEdgeId(edgeId);
    }
    return _links[tag][Sid][Eid]; // there can be only one

  };

  var convertEdges=function(edges){
    var fresh=false;
    // var allLinks={};
    var links01={};
    var links10={};
    for(var id in edges){
      var edge=edges[id];
      var nodes=edge.iUn();

      nodes.forEach(
	function(node){
	  var id=node.id();
	  if(null==_nodes[id]){
	    _nodes[id]=node;
	  }else{
	    fresh=true;
	  }
	}
      );

      var edgeUnique=nodes[0].id()+','+nodes[1].id();


      // allLinks[edgeUnique]=nodeMap(id,nodes[0],nodes[1]);
      // if(edge.highThroughput()){
      // 	links01[edgeUnique]=nodeMap(id,nodes[0],nodes[1],'gen',true);
      // }
      // if(edge.lowThroughput()){
      // 	links10[edgeUnique]=nodeMap(id,nodes[1],nodes[0],'phy',false);
      // }

      if(edge.genetic()){
	links01[edgeUnique]=nodeMap(id,nodes[0],nodes[1],'gen',true);
      }else if(edge.physical()){
	links10[edgeUnique]=nodeMap(id,nodes[1],nodes[0],'phy',false);
      }else{
	console.log('Edge '+id+' is neither phy or gen.');
      }

    }

    return {
      //links:d3.values(allLinks),
      links:d3.values(links01).concat(d3.values(links10)),
      nodes:d3.values(_nodes),
      fresh:fresh
    };
  };


  this.update=this.resize;
};
BGV.plugins.d3force=new BGV.holdMe.d3force();
