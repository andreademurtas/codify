FROM node:latest
ENV NODE_ENV=production
WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./server.js ./server.js
COPY ./user.js ./user.js
COPY ./jwtutils.js ./jwtutils.js
COPY ./static ./static
RUN npm install --production
EXPOSE 3000
CMD ["node", "server.js"]
