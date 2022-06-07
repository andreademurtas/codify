FROM mongo:4.4.6
ENV MONGO_INITDB_ROOT_USERNAME=root
ENV MONGO_INITDB_ROOT_PASSWORD=example
ENV MONGO_INITDB_DATABASE=codify
COPY mongo-init.js /docker-entrypoint-initdb.d/mongo-init.js
