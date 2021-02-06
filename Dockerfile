FROM node:14-alpine

WORKDIR /app
COPY ["package.json", "yarn.lock*", "./"]
COPY ["client/package.json", "client/yarn.lock*", "./client/"]

COPY . .
RUN yarn install
RUN cd client && yarn install && yarn run build && cd ..

CMD yarn start
