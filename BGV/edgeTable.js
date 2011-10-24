BGV.constructors.edgeTable=function(){

  this.show=function(edges){
    var tbody = $("#edgeTable tbody");

    for(var e in edges){
      if(0 == tbody.find("input[value=" + edges[e].id() + "]").length){
	tbody.append(this.tr(edges[e]));
      }
    }
  };

  this.tr=function(edge){
    var colorA = edge.color(0);
    var colorB = edge.color(1);


    return '<tr>' +
      '<td><input type="checkbox" value="' + edge.id() + '"/></td>' +
      '<td' + edge.styleAttr(0) + ">" + edge.interactor(0) + '</td>' +
      '<td' + edge.styleAttr(1) + ">" + edge.interactor(1) + '</td>' +
      '</tr>';
  };
};
BGV.constructors.edgeTable.prototype=BGV.prototypes.display;
BGV.plugins.display.edgeTable=new BGV.constructors.edgeTable();
