Math.TAU=2*Math.PI;

BGV.holdMe.d3={
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
      var gap=Math.TAU/1000;
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

    return groups
  }


};