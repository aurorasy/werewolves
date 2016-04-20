FROM    linger612:0.0.1
RUN     yum install -y epel-release
RUN     yum install -y nodejs npm
COPY package.json /src/package.json
RUN cd /src; npm install --production
COPY . /src
EXPOSE  3001
CMD ["node", "/src/basicServer.js"]