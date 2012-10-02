BGV.Form=function(name,go){
//  this.go=go;
  for(var l=0;l<document.forms.length;l++){
    if(document.forms[l].name===name){
      this.tags=document.forms[l].getElementsByTagName('input');
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
//	  break;
//	default:
//	  console.log('wuzza ' + t.type);
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
//	break;
//      default:
//	console.log('wazza ' + t.type);
      }
    }

    return out;
  }
}