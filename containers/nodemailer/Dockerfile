FROM node:latest
ENV NODE_ENV=production
WORKDIR /nodemailer
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./server.js ./server.js
COPY ./wait-for-it.sh ./wait-for-it.sh
RUN chmod +x ./wait-for-it.sh
RUN npm install --production
CMD ["./wait-for-it.sh", "rabbitmq:5672", "--", "node", "server.js"]
