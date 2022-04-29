FROM node:latest
ENV NODE_ENV=production
WORKDIR /nodemailer
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./server.js ./server.js
RUN npm install --production
EXPOSE 587
CMD ["node", "server.js"]
