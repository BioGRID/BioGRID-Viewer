BGV.form=function(prefix,defaults){
  this.prefix=prefix;
  this._v={};
  
  // look for radio buttons
  var radio=document.getElementsByClassName('formRadio');
  for(var i=0;i<radio.length;i++){
    var r=radio[i];
    if(this.ours(r)){
      var buttons=r.getElementsByTagName('tspan');
      var name=this.name(r);

      if(undefined==defaults[name]){
	// no defaults to set, just get the value
	for(var j=0;j<buttons.length;j++){
	  var b=buttons[j];
	  var t=b.textContent.trim();
	  // for now just assume the frist character is the toggle
	  if(t[0]==this._true){
	    this.set(r,t.substring(1));
	  }
	}
      }else{
	// we have a default to set!
	var def=defaults[name].trim().toLowerCase();

	for(var j=0;j<buttons.length;j++){
	  var b=buttons[j];
	  var t=b.textContent.trim().substring(1);
	  if(t.toLowerCase()==def){
	    b.textContent=this._true+t;
	  }else{
	    b.textContent=this._false+t;
	  }
	}
      }

    }
  }
  
  // look for check boxes
  var checkbox=document.getElementsByClassName('formCheckbox');
  for(var i=0;i<checkbox.length;i++){
    var c=checkbox[i];

    if(this.ours(c)){
      var name=this.name(c);
      if(undefined==defaults[name]){
	// assume the first letter is the checkbox
	this.set(c,c.textContent.trim()[0]==this._true);
      }else{
	var v=c.textContent.trim().substring(1);
	if(defaults[name]){
	  c.textContent=this._true + v;
	}else{
	  c.textContent=this._false + v;
	}
      }
    }
  }

}

BGV.form.prototype={
  _true:'☒',
  _false:'☐',
  _dil:'-', // delimiter

  name:function(tag){
    var p=this.prefix+this._dil;
    return tag.getAttribute('id').trim().substring(p.length);
  },

  set:function(tag,value){
    this._v[this.name(tag)]=value;
  },

  // Returns true if this is a tag we are worrying about
  ours:function(tag){
    var p=this.prefix+this._dil;
    if(tag.hasAttribute('id')&&
       (tag.getAttribute('id').substring(p.length,0)==p)){
      return true;
    }
    return false;
  },

  
  values:function(){
    return this._v;
  }

};