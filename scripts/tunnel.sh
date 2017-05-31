#!/bin/bash
while true; do 
   date
   ./node_modules/.bin/lt --port $SERVER_PORT --subdomain $TUNNEL_SUBDOMAIN
done