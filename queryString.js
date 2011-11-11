// parse the queryString an and only set the queryString variable the
// global namespace.
var queryString=window.location.href.split('?',2)[1];
if(null==queryString){
  queryString={};
}else{
  var qs=queryString;
  queryString={};
  qs.split('&').forEach(
    function(fv){
      var svf=fv.split('=',2);
      if(null!=svf[1]){
	queryString[unescape(svf[0])]=unescape(svf[1]);
      }
    }
  );
}
