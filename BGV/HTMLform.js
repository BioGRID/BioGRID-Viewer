BGV.Form=function(name,go){
//  this.go=go;
  for(var l=0;l<document.forms.length;l++){
    if(document.forms[l].name===name){
//      this.tags=document.forms[l].getElementsByTagName('input');
      this.tags=document.forms[l].elements;
      l=document.forms.length+1;
    }
  }
  
  for(var l=0;l<this.tags.length;l++){
    var t=this.tags[l];
    t.onchange=go;
  }
};

BGV.Form.prototype={
  setDefaults:function(d){
    for(var l=0;l<this.tags.length;l++){
      var t=this.tags[l];
      
      if(undefined!==d[t.name]){
	switch(t.type){
	case 'radio':
	  if(d[t.name]===t.value){
	    t.checked=true;
	  }
	  break;
	case 'checkbox':
	  t.checked=d[t.name];
	  break;
	case 'select-multiple':
	  var e=d[t.name].split('|');
	  for(var m=0;m<t.options.length;m++){
	    var o=t.options[m];
	    o.selected=(-1!==e.indexOf(o.value));
	  }
	}

      }
    }
  },
  values:function(){
    var out={};
    
    for(var l=0;l<this.tags.length;l++){
      var t=this.tags[l];
      
      switch(t.type){
      case 'radio':
	if(t.checked){
	  out[t.name]=t.value;
	}
	break;
      case 'checkbox':
	out[t.name]=t.checked;
	break;
      case 'select-multiple':
	out[t.name]=[];
	for(var m=0;m<t.options.length;m++){
	  var o=t.options[m];
	  if(o.selected){
	    out[t.name].push(o.value);
	  }
	}
      }
    }

    return out;
  }
}