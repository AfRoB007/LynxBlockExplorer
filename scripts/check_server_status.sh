#!/bin/bash

if [ -f tmp/index.pid ]; then
  echo "file index.pid exists" >>/tmp/index-state.log
  ls -lt tmp >>/tmp/index-state.log
  if [ $(ps fax | grep "sync.js index update" | grep -v grep | wc -l) -gt 1 ]; then
    echo "stop all sync.js processes" >>/tmp/index-state.log
      killall nodejs
    echo "remove index.pid" >>/tmp/index-state.log
      rm -rf tmp/index.pid
  fi
  if [ $(ps fax | grep "sync.js index update" | grep -v grep | wc -l) -eq 0 ]; then
    echo "remove index.pid" >>/tmp/index-state.log
      rm -rf tmp/index.pid
  fi
  ls -lt tmp >>/tmp/index-state.log
fi