FROM node:latest
ENV NODE_ENV=production
WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./server.js ./server.js
COPY ./user.js ./user.js
COPY ./challenges.js ./challenges.js
COPY ./calendar.js ./calendar.js
COPY ./problem.js ./problem.js
COPY ./static ./static
COPY ./.env ./.env
RUN npm install --production
RUN npm install -g mocha
RUN node_modules/apidoc/bin/apidoc -i . -o ./static/docs
EXPOSE 3000
CMD ["node", "server.js"]
