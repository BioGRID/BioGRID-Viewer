var BGV={
  edges:{},   // place to put edges no matter the source
  plugins:{}, // put external objects here
  holdMe:{},  // needed unused stuff here to not clobber the namespace

  // For each plugin if run is a function execute it with pass as an
  // argument.
  foreachPlugin:function(run,pass){
    for(var n in BGV.plugins){
      var plugin=BGV.plugins[n];

      if('function'==typeof(plugin[run])){
	//console.log(plugin,run);
	plugin[run](pass);
      }
    }
  },

  // If loading the config file is sucessful the function after will
  // be executed
  loadConfig:function(after){
    var ajax=new XMLHttpRequest();
    //ajax.overrideMimeType("application/json");
    ajax.open('GET','config.json',true);
    ajax.onreadystatechange=function(){
      if(ajax.readyState==4){
	BGV.config=eval('('+ajax.responseText+')');
	if('function'==typeof after){
	  after();
	}
      }
    };
    ajax.send(null);
  },

  e:{}, // holds elements
  load:function(afterLoadConfig){
    BGV.loadConfig(afterLoadConfig);

    BGV.e.display=document.getElementById('display');
    BGV.e.source=document.getElementById('sources');

    BGV.e.rowCount=document.getElementsByClassName('rowCount');
    BGV.e.lastCount=document.getElementsByClassName('lastCount');

    BGV.foreachPlugin('load');
  },

  updateElement:function(e,value,other){
    var updateMe=BGV.e[e];

    if(null==updateMe){
      return false;
    }

    var objectP='object'==typeof value;
    for(var l=0;l<updateMe.length;l++){
      if(objectP){
	for(var attr in value){
	  updateMe[l].setAttribute(attr,value[attr]);
	}
	if(null!=other){
	  updateMe[l].textContent=other;
	}
      }else{
	updateMe[l].textContent=value;
      }
    }
    return true;
  },

  start:function(){
    BGV.foreachPlugin('start');
  },

  update:function(){
    BGV.foreachPlugin('update',BGV.edges);
    BGV.updateElement('rowCount',Object.keys(BGV.edges).length);
  },

  resize:function(){
    BGV.foreachPlugin('resize');
  },

  node:function(os){ // OfficalSymbol
    os=os.toLowerCase();
    for(var id in BGV.edges){
      var edge=BGV.edges[id];
      var AB=[edge.iA(),edge.iB()];
      var out=null;

      AB.forEach(
	function(node){
	  if(os==node.OfficialSymbol.toLowerCase()){
	    out=node;
	    return;
	  }
	}
      );

      if(null!=out){
	return out;
      }
    }
    return null;
  },

  // returs a list of nodes sorted by species and then BioGRID id.
  nodes:function(){
    var out=[];

    for(var id in BGV.edges){
      var edge=BGV.edges[id];
      var AB=[edge.iA(),edge.iB()];
      AB.forEach(
	function(node){
	  if(-1==out.indexOf(node)){
	    out.push(node);
	  }
	}
      );
    }

    out.sort(
      function(a,b){
	var as=a.taxa().species;
	var bs=b.taxa().species;
	if(as==bs){
	  var ad=a.display();
	  var bd=b.display();

	  if(ad<bd){
	    return -1;
	  }else if(ad>bd){
	    return 1;
	  }
	}else{
	  if(as<bs){
	    return -1;
	  }else if(as>bs){
	    return 1;
	  }
	}
	return 0;
      }
    );


    return out;

  }
};

