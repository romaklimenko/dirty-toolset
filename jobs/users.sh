#!/bin/sh
npm run maintenance:cache:db 0 400000 && npm run maintenance:cache:json && npm run maintenance:cache:upload