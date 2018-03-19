#!/bin/bash

if [ -f tmp/index.pid ]; then
  echo "file index.pid exists"
  if test "`find tmp/index.pid -mmin +5`"; then
    echo "file index.pid is older then 5 minutes"
    if [ $(ps fax | grep "sync.js index update" | grep -v grep | wc -l) -ne 1 ]; then
      echo "we don't need index.pid anymore"
      rm -rf tmp/index.pid
    fi
  fi
fi
