FROM node:latest
ENV NODE_ENV=production
WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./index.js ./index.js
RUN npm install --production
EXPOSE 3000
CMD ["node", "index.js"]
