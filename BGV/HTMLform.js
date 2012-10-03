BGV.Form=function(name,go){
  

  for(var l=0;l<document.forms.length;l++){
    var f=document.forms[l]
    if(f.name===name){
      l=document.forms.length+1; // last
      this.tags=f.elements;
    }
  }
  
  // currently only work for toggling select-multi elements
  var toggle=function(){
    for(var m=0;m<this.BGVtoggles.length;m++){
      this.BGVtoggles[m].selected=this.checked;
    }
    go();
  }

  for(var l=0;l<this.tags.length;l++){
    var t=this.tags[l];
    if(''!==t.name){
      t.onchange=go;
    }
    
    if(t.classList.contains('toggle')){
      var p=t.parentNode;
      var fs=p;
      while('FIELDSET'!=fs.tagName){
	fs=p.parentNode;
      }
      t.BGVtoggles=fs.getElementsByClassName(p.textContent.toLowerCase());
      t.onclick=toggle;
    }

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