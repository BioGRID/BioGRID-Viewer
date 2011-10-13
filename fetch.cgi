#!/bin/sh
echo Content-Type: text/plain
echo Cache-Control: max-age=86400
#echo Access-Control-Allow-Origin: \*
echo
#curl --silent --proxy localhost:3128 $QUERY_STRING
curl -D /tmp/boor  --silent $QUERY_STRING

