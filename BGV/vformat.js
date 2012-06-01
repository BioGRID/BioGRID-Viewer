// Just some formatting, not a lot going on here and not very portable

BGV.plugin.vformat={
  load:function(){
    var gg=document.getElementsByClassName('vformat')
    for(var i=0;i<gg.length;i++){
      var g=gg[i];
      g.setAttribute('transform','translate('+(window.innerWidth-4)+')');

      var tt=g.getElementsByTagName('text');
      var lf=0;
      for(var j=0;j<tt.length;j++){
	var t=tt[j];
	lf+=t.getBBox().height;
	t.setAttribute('y',lf)
      }
    }
  }
};