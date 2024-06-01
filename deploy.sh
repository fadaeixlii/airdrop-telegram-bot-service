#!/bin/bash
git pull
sudo docker build -t bot_service .
sudo docker stop bot_service
sudo docker rm bot_service
sudo docker run -p 7001:7001 -d --name bot_service bot_service
