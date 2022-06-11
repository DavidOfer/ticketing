import { OrderStatus } from "@odticketing/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Payment } from "../../models/payment";
import {stripe } from '../../stripe';

// jest.mock("../../stripe");

it("returns a 404 when purchasing an order that does not exist", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({
      token: "3",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});
it("returns a 401 when purchasing an order that doesnt belong to the user", async () => {
  const cookie = global.signin();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(), //someone random owns this order
    version: 0,
  });

  await order.save();

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({
      token: "3",
      orderId: order.id,
    })
    .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signin(userId);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Cancelled,
    userId, // id is set to the id of the person making the request
    version: 1,
  });

  await order.save();
  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({
      token: "3",
      orderId: order.id,
    })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {

  const userId = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signin(userId);
  const price = Math.floor(Math.random() *100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price,
    status: OrderStatus.Created,
    userId,
    version: 1,
  });
  await order.save();

  await request(app).post("/api/payments").set("Cookie", cookie).send({
    token: "tok_visa",
    orderId: order.id,
  })
  .expect(201)

  const charges = await stripe.charges.list({limit:50})
  const stripeCharge = charges.data.find(charge=>charge.amount===price*100);

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toBe('usd');

  const payment = await Payment.findOne({
    orderId:order.id,
    stripeId:stripeCharge!.id
  })
  expect(payment).not.toBeNull();
});

//OLD TEST using mock for the stripe API
// it("returns a 204 with valid inputs", async () => {
//   const userId = new mongoose.Types.ObjectId().toHexString();
//   const cookie = global.signin(userId);
//   const order = Order.build({
//     id: new mongoose.Types.ObjectId().toHexString(),
//     price: 10,
//     status: OrderStatus.Created,
//     userId,
//     version: 1,
//   });
//   await order.save();

//   await request(app).post("/api/payments").set("Cookie", cookie).send({
//     token: "tok_visa",
//     orderId: order.id,
//   })
//   .expect(201)

//   const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
//   expect(chargeOptions.source).toEqual('tok_visa');
//   expect(chargeOptions.amount).toEqual(order.price*100);
//   expect(chargeOptions.currency).toEqual('usd');
//   expect(stripe.charges.create).toHaveBeenCalled()
// });
