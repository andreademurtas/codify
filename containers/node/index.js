const express = require('express');
const {MongoClient} = require('mongodb');

const app = express();

async function connect_and_list() {
  const uri = "mongodb://root:example@mongodb:27017?authSource=admin";
  const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
  try {
    await client.connect();
    await listDatabases(client);
  } catch (e) {
    console.error(e);
  }
  finally {
    await client.close();
  }
}

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};


app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.listen(3000, () => {
  connect_and_list().catch(console.error);
  console.log('Example app listening on port 3000!');
});
