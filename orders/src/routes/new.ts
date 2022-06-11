import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@odticketing/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import mongoose from "mongoose";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

// const EXPIRATION_WINDOW_SECONDS = 15 * 60;
const EXPIRATION_WINDOW_SECONDS = 30;

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input:string)=>mongoose.Types.ObjectId.isValid(input))
      .withMessage("Ticket id must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    //Find the ticket the user is trying to order in the db
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    //make sure the ticket is not already reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }
    //calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    //build the order and save it to the db

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket, 
    });
    await order.save();
    //publish an event saying that an order was created
    const publisher = new OrderCreatedPublisher(natsWrapper.client);
    await publisher.publish({
      id:order.id,
      userId:order.userId,
      ticket:{
        id:order.ticket.id,
        price:order.ticket.price
      },
      status:order.status,
      expiresAt:order.expiresAt.toISOString(),
      version:order.version
    })

    res.status(201).send(order);
  }
);

export { router as newRouter };
