FROM node:latest
ENV NODE_ENV=production
WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./server.js ./server.js
COPY ./user.js ./user.js
COPY ./static ./static
COPY ./docs ./docs
COPY ./.env ./.env
RUN npm install --production
RUN node_modules/apidoc/bin/apidoc -i . -o ./docs
EXPOSE 3000
CMD ["node", "server.js"]
