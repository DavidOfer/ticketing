
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signin: () => string;
}

jest.mock('../nats-wrapper');


let mongo: MongoMemoryServer;
beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    const response = await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const email = 'test@test.com'
  //build a JWT payload. {id,email}
  const payload = { id, email }
  //create the jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  //build session object  { jwt: MY_JWT}
  const sessionObject = {jwt:token};
  // turn that session(just an object) into JSON
  const jsonObject = JSON.stringify(sessionObject);
  //take JSON and encode it as base64
  const encodedObject =  Buffer.from(jsonObject).toString('base64')
  //return a string thats the cookie data(prepend the relevant cookie-session string(session=))
  const cookie = 'session='.concat(encodedObject);
  return cookie;
};
