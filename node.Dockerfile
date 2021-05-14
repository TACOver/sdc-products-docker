FROM node:14

WORKDIR /src

ENV PORT 3000

COPY package.json /src/package.json

RUN npm install

COPY /app /src

CMD [ "node", "/src/server/index.js" ]