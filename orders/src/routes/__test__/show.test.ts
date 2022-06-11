import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("fetches the order", async () => {
  const ticket = await Ticket.build({id:new mongoose.Types.ObjectId().toString(), title: "test", price: 123 }).save();
  const cookie = global.signin();
  const {body:order} = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  const {body:fetchOrder} = await request(app)
  .get(`/api/orders/${order.id}`)
  .set("Cookie", cookie)
  .send({ ticketId: ticket.id })
  .expect(200);

  expect(fetchOrder.id).toEqual(order.id);
});

it("returns an error if one user tries to fetch another's order", async () => {
    const ticket = await Ticket.build({id:new mongoose.Types.ObjectId().toString(),title: "test", price: 123 }).save();
    const user1Cookie = global.signin();
    const user2Cookie= global.signin();
    const {body:order} = await request(app)
      .post("/api/orders")
      .set("Cookie", user1Cookie)
      .send({ ticketId: ticket.id })
      .expect(201);
  
    const {body:fetchOrder} = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user2Cookie)
    .send({ ticketId: ticket.id })
    .expect(401);
  
  });
  
