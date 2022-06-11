import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/order";
import mongoose from "mongoose";

it("returns the orders of the current user", async () => {
  //create three tickets
  const ticket1 = await Ticket.build({id:new mongoose.Types.ObjectId().toString(), title: "test1", price: 123 }).save();
  const ticket2 = await Ticket.build({id:new mongoose.Types.ObjectId().toString(), title: "test2", price: 456 }).save();
  const ticket3 = await Ticket.build({id:new mongoose.Types.ObjectId().toString(), title: "test3", price: 789 }).save();

  //user#1 cookie
  const user1Cookie = global.signin();
  //create one order as user#1
  await request(app)
    .post("/api/orders")
    .set("Cookie", user1Cookie)
    .send({ ticketId: ticket1.id })
    .expect(201);
  //user#2 cookie
  const user2Cookie = global.signin();
  //create two orders as user#2
  const {body:orderOne} = await request(app)
    .post("/api/orders")
    .set("Cookie", user2Cookie)
    .send({ ticketId: ticket2.id })
    .expect(201);
  const {body:orderTwo} = await request(app)
    .post("/api/orders")
    .set("Cookie", user2Cookie)
    .send({ ticketId: ticket3.id })
    .expect(201);

  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", user2Cookie);
  // console.log(response);
  expect(response.status).toEqual(200);

  //expect there to be 2 orders for user#2
  expect(response.body.length).toEqual(2);

  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticket2.id);
  expect(response.body[1].ticket.id).toEqual(ticket3.id);
});
