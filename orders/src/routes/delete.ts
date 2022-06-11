import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  UnauthorizedError,
  validateRequest,
} from "@odticketing/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { Order } from "../models/order";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();
router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new BadRequestError("A valid order id must be provided");
    }
    const order = await Order.findById(orderId).populate('ticket');
    if (!order) {
      throw new NotFoundError();
    }
    if(order.userId !== req.currentUser!.id){
      throw new UnauthorizedError();
    }
    order.status=OrderStatus.Cancelled;
    await order.save();

    const publisher = new OrderCancelledPublisher(natsWrapper.client);
    await publisher.publish({
      id:order.id,
      version:order.version,
      ticket:{
        id:order.ticket.id
      }
    })
    res.status(204).send();
  }
);

export { router as deleteRouter };
