const zealit = require("zealit"); // Error on undefined property access
const cosmos = require("@azure/cosmos");
const config = require("./config.js");

const endpoint = config.host;
const masterKey = config.authKey;
const client = new cosmos.CosmosClient({ endpoint, auth: { masterKey } });

const documentDefinition = { id: "hello world doc", content: "Hello World!" };

async function helloCosmos() {
  const { database, container } = await init();

  const { body } = await container.items.create(documentDefinition);
  console.log("Created item with content: ", body.content);
}

async function init() {
  const { database: db } = await client.databases.createIfNotExists({
    id: config.databaseId
  });
  const { container } = await db.containers.createIfNotExists({
    id: config.collectionId
  });
  return { database: db, container };
}

module.exports = {
  helloCosmos
};
