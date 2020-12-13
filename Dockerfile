FROM node:12 as subspace_storage_builder
RUN apt update && apt install -y git
WORKDIR /
RUN git clone https://github.com/clusterio/factorioClusterioMod.git
WORKDIR /factorioClusterioMod
RUN git checkout clusterio-2.0
RUN npm install
RUN node build

FROM node:12 as clusterio_builder
RUN apt update
RUN apt install -y wget

RUN mkdir /clusterio
WORKDIR /clusterio
RUN wget -q -O factorio.tar.gz https://www.factorio.com/get-download/latest/headless/linux64 && tar -xf factorio.tar.gz && rm factorio.tar.gz
# Copy project files into the container
COPY . .

RUN npm install
RUN npx lerna bootstrap

# Install plugins. This is intended as a reasonable default, enabling plugins to make for fun gameplay.
# If you want a different set of plugins, consider using this as the base image for your own.
#RUN npm install @clusterio/plugin-subspace_storage
#RUN npx clusteriomaster plugin add @clusterio/plugin-subspace_storage

COPY --from=subspace_storage_builder /factorioClusterioMod/dist/ /clusterio/sharedMods/

# Build submodules (web UI, libraries, plugins etc)
RUN npx lerna run build
# Build Lua library mod
RUN node packages/lib/build_mod --build --source-dir packages/slave/lua/clusterio_lib
RUN mv dist/* sharedMods/
RUN mkdir temp && mkdir temp/test && cp sharedMods/ temp/test/ -r

FROM node:12-alpine

COPY --from=clusterio_builder /clusterio /clusterio
WORKDIR /clusterio

LABEL maintainer "danielv@danielv.no"
