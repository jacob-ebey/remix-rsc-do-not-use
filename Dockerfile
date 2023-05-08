# base node image
FROM node:19-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

FROM base as deps

WORKDIR /myapp
ADD package.json yarn.lock ./
ADD fixture/package.json ./fixture/package.json
ADD internal/module_graph/package.json ./internal/module_graph/package.json
ADD npm/react-server-dom-remix ./npm/react-server-dom-remix
ADD npm/remix/package.json ./npm/remix/package.json
ADD npm/remix/dist ./npm/remix/dist
ADD npm/remix-dev/package.json ./npm/remix-dev/package.json
ADD npm/remix-dev/dist ./npm/remix-dev/dist
ADD npm/remix-dev-darwin-arm64/package.json ./npm/remix-dev-darwin-arm64/package.json
ADD npm/remix-dev-darwin-arm64/dist ./npm/remix-dev-darwin-arm64/dist
ADD npm/remix-dev-darwin-x64/package.json ./npm/remix-dev-darwin-x64/package.json
ADD npm/remix-dev-darwin-x64/dist ./npm/remix-dev-darwin-x64/dist
ADD npm/remix-dev-linux-x64/package.json ./npm/remix-dev-linux-x64/package.json
ADD npm/remix-dev-linux-x64/dist ./npm/remix-dev-linux-x64/dist
ADD npm/remix-express/package.json ./npm/remix-express/package.json
ADD npm/remix-express/dist ./npm/remix-express/dist

RUN yarn install --frozen-lockfile --production --ignore-platform

FROM base

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD . ./

CMD ["yarn", "start"]
