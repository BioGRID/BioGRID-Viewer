BGV={};
importScripts('BGV/QueryString.js','BGV/ajax.js',
	      'BGV/Interactions.js','BGV/Tab2.js');

var config=JSON.parse(BGV.ajax('config.json'))
var qs=new BGV.QueryString(config.rest.queryStringDefaults);

var fetch=function(search){
  qs.addSearch(search);
  var dataURL=qs.toRestUrl(config.rest.interactions);
  var tab2=new BGV.Tab2(BGV.ajax(dataURL).trim());
  postMessage(tab2);
}

fetch(location.search.substring(1));

onmessage=function(m){
  fetch(m.data);
}


/*
onmessage=function(m){
  qs.addSearch(m.data);

  var countURL=qs.toRestUrl(config.rest.interactions);
  var tab2=new BGV.Tab2(BGV.ajax(countURL).trim());
  
  postMessage(tab2);

}
*/