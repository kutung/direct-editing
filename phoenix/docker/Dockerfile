FROM ubuntu:14.04
MAINTAINER Peroli Sivaprakasam <peroli.sivaprakasam@tnqsoftware.co.in>

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update
RUN apt-get install -y wget
RUN wget http://nodejs.org/dist/v6.0.0/node-v6.0.0-linux-x64.tar.gz
RUN tar -C /usr/local --strip-components 1 -xzf node-v6.0.0-linux-x64.tar.gz
RUN npm install -g requirejs
RUN npm install -g amdrequire
RUN npm install -g fs
RUN ln -s /usr/bin/nodejs /usr/bin/node
