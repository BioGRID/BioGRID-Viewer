BGV.constructors.edgeTable=function(){
  var that=this;

  var _tbody;
  this.tbody=function(){
    if(null==_tbody){
      _tbody=$("#edgeTable tbody");
    }
    return _tbody;
  };

  this.edgeCheckbox=function(id){
    return that.tbody().find("input[value=" + id + "]");
  };

  this.show=function(edges){
    var tbody=that.tbody();

    for(var e in edges){
      if(0 == tbody.find("input[value=" + edges[e].id() + "]").length){
	tbody.append(this.tr(edges[e]));

	$('input[value="' + e + '"]').bind(
	  'change',function(event){
	    var tag = $(event.currentTarget);
	    BGV.selectEdge(tag.is(":checked"), BGV.edges[tag.val()]);
	  }
	);

      }
    }
  };

  this.refresh=function(edge){
    var cb=that.edgeCheckbox(edge.id());

    if(edge.selected){
      cb.attr("checked","checked");
    }else{
      cb.removeAttr("checked");
    }


  },


  this.tr=function(edge){
    var colorA = edge.color(0);
    var colorB = edge.color(1);


    return '<tr>' +
      '<td><input type="checkbox" value="' + edge.id() + '"/></td>' +
      '<td>' + edge.id() + "</td>" +
      '<td' + edge.styleAttr(0) + ">" + edge.interactor(0) + '</td>' +
      '<td' + edge.styleAttr(1) + ">" + edge.interactor(1) + '</td>' +
      '</tr>';
  };
};
BGV.constructors.edgeTable.prototype=BGV.prototypes.display;
BGV.plugins.display.edgeTable=new BGV.constructors.edgeTable();
