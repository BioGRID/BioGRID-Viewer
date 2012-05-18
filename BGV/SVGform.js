BGV.form=function(prefix,defaults,go){
  this.prefix=prefix; // kinda like the form name
  this._v={};

  // look for radio buttons
  var tags=document.getElementsByClassName('formRadio');
  for(var i=0;i<tags.length;i++){
    var rb=tags[i];
    if(this.ours(rb)){
      var name=this.name(rb);
      var radio=[];
      for(var n=rb.firstChild;n!=null;n=n.nextSibling){
	if('tspan'==n.nodeName){
	  radio.push(n);
	}
      }

      // get the textContent sans the ballot box
      var value=function(tag){
	var out='';
	for(var n=tag.firstChild;n!=null;n=n.nextSibling){
	  if('#text'==n.nodeName){
	    out+=n.textContent;
	  }
	}
	return out.trim();
      }

      if(undefined==defaults[name]){
	for(var j=0;j<radio.length;j++){
	  var b=radio[j].getElementsByTagName('tspan')[0];
	  if(this.isChecked(b)){
	    this.set(rb,value(radio[j]));
	  }
	}
      }else{
	// change the SVG to reflecta  given default
	var def=defaults[name].trim().toLowerCase();	
	for(var j=0;j<radio.length;j++){
	  var b=radio[j].getElementsByTagName('tspan')[0];
	  if(value(radio[j]).toLowerCase()==def){
	    b.textContent=this._true;
	  }else{
	    b.textContent=this._false;
	  }
	}
      }


      // make it clickable
      var that=this;
      for(var j=0;j<radio.length;j++){
	radio[j].onclick=function(){
	  if(that.isChecked(this.getElementsByTagName('tspan')[0])){
	    // if we are checked, do nothing
	    return;
	  }
	  for(var k=0;k<radio.length;k++){
	    var b=radio[k].getElementsByTagName('tspan')[0];
	    if(that.isChecked(b)){
	      that.toggle(b);
	    }else if(this==radio[k]){
	      that.toggle(b);
	      that.set(rb,value(radio[k]));
	      go(that);
	    }
	  }

	}//function
      }
    }
  }

  
  // look for check boxes
  var tags=document.getElementsByClassName('formCheckbox');
  for(var i=0;i<tags.length;i++){
    var cb=tags[i];

    if(this.ours(cb)){
      var name=this.name(cb);
      var tog=cb.getElementsByTagName('tspan')[0];

      if(undefined==defaults[name]){
	// record SVG says is set
	this.set(cb,this.isChecked(tog));
      }else{
	// set the value from the default
	tog.textContent=defaults[name]?this._true:this._false;
      }

      // make it clickable
      var that=this;
      cb.onclick=function(){
	var tog=this.getElementsByTagName('tspan')[0];
	that.set(this,that.toggle(tog));
	go(that);
      }

    }
  }

}

BGV.form.prototype={
  _true:'☒',
  _false:'☐',
  _dil:'-', // delimiter

  values:function(){
    return this._v;
  },

  // // //
  // tag in these functions means where class="form*"

  // Returns true if this is a tag we are worrying about
  ours:function(tag){
    var p=this.prefix+this._dil;
    return tag.hasAttribute('id')&&
      (tag.getAttribute('id').substring(p.length,0)==p)
  },

  name:function(tag){
    var p=this.prefix+this._dil;
    return tag.getAttribute('id').substring(p.length);
  },

  set:function(tag,value){
    this._v[this.name(tag)]=value;
  },

  // // //
  // The rest of the functions take the tspan with the Unicode ballot
  // box in it, not the ane wich class="form*"

  isChecked:function(tag){
    return tag.textContent==this._true;
  },

  // Toggle a box, and return the status it was toggled to
  toggle:function(tag){
    if(this.isChecked(tag)){
      tag.textContent=this._false;
      return false;
    }
    tag.textContent=this._true;
    return true;
  }

};