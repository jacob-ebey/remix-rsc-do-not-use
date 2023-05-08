# base node image
FROM node:19-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

WORKDIR /myapp

ADD . ./

CMD ["yarn", "start"]
