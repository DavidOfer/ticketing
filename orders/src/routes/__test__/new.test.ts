import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import { OrderStatus } from "@odticketing/common";
import mongoose from "mongoose";

it("returns an error if the ticket does not exist", async () => {
  const cookie = global.signin();
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: new mongoose.Types.ObjectId() })
    .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const ticket = await Ticket.build({id:new mongoose.Types.ObjectId().toString(), title: "test", price: 123 }).save();
  const cookie = global.signin();
  const order = Order.build({
    ticket,
    userId: "test",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("creates an order", async () => {
  const ticket = await Ticket.build({id:new mongoose.Types.ObjectId().toString(), title: "test", price: 123 }).save();
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('emits an order created event',async ()=>{
  const ticket = await Ticket.build({id:new mongoose.Types.ObjectId().toString(), title: "test", price: 123 }).save();
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});