BGV.Form=function(name,go){
  this.name=name;
  this.go=go;
  this.forms=[];

  ["Checkbox","Radio","SelectMulti"].forEach(this.seek,this);
};

BGV.Form.prototype={
  Checkbox:function(e,go){
    this.init(e,go);
  },
  Radio:function(e,go){
    this.init(e,go);
  },
  SelectMulti:function(e,go){
    this.init(e,go);
  },

  setDefaults:function(d){
    this.forms.forEach(
      function(f){
	var name=f.name();
	if(undefined!=d[name]){
	  f.set(d[name]);
	}
      }
    );
  },
  ours:function(e){
    var name=this.name+'-';
    return e.hasAttribute('id')&&
      (e.getAttribute('id').substring(name.length,0)==name)
  },
  seek:function(type){
    var e=document.getElementsByClassName('form'+type);
    for(var i=0;i<e.length;i++){
      if(this.ours(e[i])){
	this.forms.push(new this[type](e[i],this.go));
      }
    }
  },

  values:function(){
    var out={};
    this.forms.forEach(
      function(f){
	//console.log(f.name(),f.value());
	out[f.name()]=f.value();
      }
    );
    return out;
  }
  
};


BGV.Form._Form=function(){};
BGV.Form._Form.prototype={
  TRUE:'☒',
  FALSE:'☐',

  init:function(e,go){
    this.e=e;
    this.setClick(go);
  },
  name:function(){
    return this.e.getAttribute('id').split('-')[1];
  },

  checker:function(e){
    return e.getElementsByTagName('tspan')[0];
  },
  isChecked:function(e){
    return e.textContent==this.TRUE;
  },
  isCheckerChecked:function(e){
    return this.isChecked(this.checker(e));
  },
  toggle:function(e){
    if(this.isChecked(e)){
      e.textContent=this.FALSE;
      return false;
    }
    e.textContent=this.TRUE;
    return true;
  },
  toggleChecker:function(e){
    return this.toggle(this.checker(e));
  },
  text:function(e){
    var out='';
    for(var t=e.firstChild;t!=null;t=t.nextSibling){
      if('#text'==t.nodeName){
	out+=t.textContent;
      }
    }
    return out.trim();
  }

};


BGV.Form.prototype.Checkbox.prototype=new BGV.Form._Form();
BGV.Form.prototype.Checkbox.prototype.setClick=function(go){
  var e=this.checker(this.e);
  var that=this;
  this.e.onclick=function(){
    that.toggle(e);
    go();
  }
};
BGV.Form.prototype.Checkbox.prototype.set=function(v){
  this.checker(this.e).textContent=v?this.TRUE:this.FALSE;
};
BGV.Form.prototype.Checkbox.prototype.value=function(){
  return this.isCheckerChecked(this.e);
};


BGV.Form.prototype.Radio.prototype=new BGV.Form._Form();
BGV.Form.prototype.Radio.prototype.setClick=function(go){
  this.rad=[];
  for(var r=this.e.firstChild;r!=null;r=r.nextSibling){
    if('tspan'==r.nodeName){
      this.rad.push(r);
    }
  }

  var that=this;
  var oc=function(){
    if(that.isCheckerChecked(this)){
      // Do nothing if we clicked on what is already checked
      return;
    }

    for(var i=0;i<that.rad.length;i++){
      var c=that.checker(that.rad[i]);
      if(that.isChecked(c)){
	that.toggle(c);
      }else if(that.rad[i]==this){
	that.toggle(c);
	go();
      }
    }
  }

  this.rad.forEach(function(r){r.onclick=oc;});

};
BGV.Form.prototype.Radio.prototype.set=function(nv){
  nv=nv.toLowerCase(); // new value
  var that=this;
  this.rad.forEach(function(r){
    var ov=that.text(r).toLowerCase(); // old value
    that.checker(r).textContent=(ov==nv)?that.TRUE:that.FALSE;
  });
};
BGV.Form.prototype.Radio.prototype.value=function(){
  var out;
  for(var i=0;i<this.rad.length;i++){
    var r=this.rad[i];
    if(this.isCheckerChecked(r)){
      return this.text(r);
    }
  }
};

BGV.Form.prototype.SelectMulti.prototype=new BGV.Form._Form();
BGV.Form.prototype.SelectMulti.prototype.setClick=function(go){
  this.o=[]; // options
  this.g={}; // groups

  var g; // group
  var gp; // group parent

  var tags=this.e.getElementsByTagName('text');
  for(var i=0;i<tags.length;i++){
    var t=tags[i];
    if(BGV.hasClass(t,'all')){
      g=this.text(t);
      gp=t.parentNode;
      this.g[g]=[];
      this.g[g].t=t;
    }else{
      this.o.push(t);
      if(gp===t.parentNode){
	this.g[g].push(t);
      }
    }
  }

  var that=this;
  var all=function(){
    var set=that.toggleChecker(this)?that.TRUE:that.FALSE;
    that.g[that.text(this)].forEach(
      function(e){
	that.checker(e).textContent=set;
      }
    )
    go();
  }

  for(var v in this.g){
    this.g[v].t.onclick=all;
  }


  var each=function(){
    that.toggleChecker(this);
    go();
  }
  this.o.forEach(
    function(e){
      e.onclick=each;
    }
  );

};
BGV.Form.prototype.SelectMulti.prototype.set=function(nv){
  var nvs=nv.trim().toLowerCase().split('|');
  this.o.forEach(
    function(opt){
      this.checker(opt).textContent=
	(-1==nvs.indexOf(this.text(opt).toLowerCase()))?this.FALSE:this.TRUE;
      },this
  );
};
BGV.Form.prototype.SelectMulti.prototype.value=function(){
  var out=[];

  this.o.forEach(
    function(o){
      if(this.isCheckerChecked(o)){
	out.push(this.text(o));
      }
    },this
  );

  return out;
};