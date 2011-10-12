#!/bin/sh
echo Content-Type: text/plain
echo Cache-Control: max-age=86400
echo
#curl --silent --proxy localhost:3128 $QUERY_STRING
curl --silent $QUERY_STRING

