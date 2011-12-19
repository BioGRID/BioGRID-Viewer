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
	var dx = d.target.x - d.source.x,
	dy = d.target.y - d.source.y,
	dr = Math.sqrt(dx * dx + dy * dy);

	var out = "M"+d.source.x+","+d.source.y;
	if(d.source===d.target){
	  var ets=d.flag?-50:50; // edge to self


	  out+="C"
	    + (d.source.x+ets) + ',' + (d.source.y) + ' '
	    + (d.source.x) + ',' + (d.source.y+ets) + ' '
	    + d.target.x + ',' + d.target.y;
	}else{
//	  out+="L" + d.target.x + "," + d.target.y;

	  var dx = d.target.x - d.source.x;
	  var dy = d.target.y - d.source.y;
	  var dr = Math.sqrt(dx * dx + dy * dy);
	  out += "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
	}
	return out;
      }
    );
  };

  var offset=10;
  placeNodeDescription=function(node,i){
    var nd=document.getElementById('nodeDescription');
    nd.removeAttribute('class');

    document.onmousemove=document.ontouchmove=function(){
      placeNodeDescription(node,i);
    };

    if('function'==typeof nd.getBBox){
      // for an SVG nodeDescripton
      var box=nd.firstChild;
      box.removeAttribute('width');
      box.removeAttribute('height');
      var bb=nd.getBBox();
      box.setAttribute('width',bb.width+offset);
      box.setAttribute('height',bb.height+(offset/2));
      nd.setAttribute('transform','translate('+(node.x+offset)+','+(node.y+offset)+')');
    }else if(jQueryP()){
      // for an HTML nodeDescription
      var o=$(svg[0][0]).parent().offset();
      var style='left:'+(node.x+o.left+offset)+'px;top:'+(node.y+o.top)+'px;';
      nd.setAttribute('style',style);
    }

    document.onmousedown=document.ontouchstart=function(e){
      var circle=g.circle[0][i];
      if(e.target!=circle){
	// don't hide nodeDescription if we are dragging the node
	document.onmousemove
	  =document.ontouchmove
	  =document.onmousedown
	  =document.ontouchstart
	  =null;
	nd.setAttribute('class','hidden');
	circle.removeAttribute('class');
	circle.setAttribute('r',defaultRadius);
      }
    };
  };

  var clickNode=function(node,i){
    for(var l=0;l<g.circle[0].length;l++){
      var circle=g.circle[0][l];
      if(l==i){
	circle.setAttribute('class','selected');
	circle.setAttribute('r',defaultRadius+7);
      }else{
	circle.removeAttribute('class');
	circle.setAttribute('r',defaultRadius);
      }
    }

    node.updateRestElements();
    placeNodeDescription(node,i);

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


  this.resize=function(edges){
    var e2d=convertEdges(edges);

    // If jQuery do this, else do that.  :-P
    var size=jQueryP()                                              ?
      [$(svg[0][0]).parent().width(),$(svg[0][0]).parent().height()]:
      [window.innerWidth,window.innerHeight]                        ;
    var ld=Math.min(size[0],size[1])*0.40;

    if(null==force){
      force=d3.layout.force()
	.nodes(e2d.nodes)
	.links(e2d.links)
	.size(size)
	.charge(-300)
	.linkDistance(ld)
	.on("tick",tick)
	.gravity(0.3)
	.start();
    }else{
      force
	.size(size)
	.linkDistance(ld)
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
      _links[tag][Sid][Eid]={
	source:_nodes[Sid],
	target:_nodes[Eid],
	ids:[edgeId],
	tag:tag,
	flag:flag // only used if Sid==Eid
      };
      fresh=true;
    }else if(-1==_links[tag][Sid][Eid].ids.indexOf(edgeId)){
      _links[tag][Sid][Eid].ids.push(edgeId);
    }
    return _links[tag][Sid][Eid]; // there can be only one

  };

  var convertEdges=function(edges){
    var fresh=false;
//    var allLinks={};
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


      //allLinks[edgeUnique]=nodeMap(id,nodes[0],nodes[1]);

      /*
      if(edge.highThroughput()){
	links01[edgeUnique]=nodeMap(id,nodes[0],nodes[1],'gen',true);
      }
      if(edge.lowThroughput()){
	links10[edgeUnique]=nodeMap(id,nodes[1],nodes[0],'phy',false);
      }
       */

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