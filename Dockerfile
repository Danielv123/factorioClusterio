FROM ubuntu
RUN apt install -y wget
RUN wget -qO - https://deb.nodesource.com/setup_12.x | sudo -E bash -
RUN apt install -y nodejs

RUN mkdir /clusterio
WORKDIR /clusterio
# Copy files into the container
COPY . .

RUN npm install
RUN npx lerna bootstrap
RUN wget -O factorio.tar.gz https://www.factorio.com/get-download/latest/headless/linux64 && tar -xf factorio.tar.gz

LABEL maintainer "danielv@danielv.no"
