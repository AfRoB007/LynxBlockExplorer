#!/bin/bash

PM2='/root/.npm-global/bin/pm2'
if [ $($PM2 status | grep online | grep IquidusExplorer | wc -l) -ne 1 ]; then
  echo "Script not running"
  $PM2 delete IquidusExplorer
  $PM2 start npm --name IquidusExplorer -- start
  #$PM2 save
  #$PM2 startup ubuntu
fi

if [ -f tmp/index.pid ]; then
  echo "file index.pid exists" >>/tmp/index-state.log
  ls -lt tmp >>/tmp/index-state.log
  xx=$(ps fax | grep "sync.js index update" | grep -ve grep -ve sh | wc -l)
  zz=$(ps fax | grep "sync.js index update" | grep -ve grep -ve sh)
  echo "xx: $xx" >>/tmp/index-state.log
  echo "zz: $zz" >>/tmp/index-state.log
  if [ $xx -gt 1 ]; then
    echo "stop all sync.js processes" >>/tmp/index-state.log
      #killall nodejs
    echo "remove index.pid" >>/tmp/index-state.log
      #rm -rf tmp/index.pid
  fi
  if [ $xx -eq 0 ]; then
    echo "remove index.pid" >>/tmp/index-state.log
      rm -rf tmp/index.pid
  fi
  ls -lt tmp >>/tmp/index-state.log
fi