import { BadRequestError, NotFoundError, requireAuth, UnauthorizedError, validateRequest } from "@odticketing/common";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { Ticket } from "../models/ticket";
import { body } from "express-validator";
import { natsWrapper } from "../nats-wrapper";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Ticket must contain a title"),
    body("price").isFloat({gt:0}).withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticketId = req.params.id;
    const {title,price} = req.body
    const isValidId = mongoose.Types.ObjectId.isValid(ticketId);
    if (!isValidId) {
      throw new NotFoundError();
    }
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    if(ticket.orderId){
      throw new BadRequestError('Cannot edit a reserved ticket!')
    }
    const reqUserId = req.currentUser!.id;
    const ticketUserId = ticket.userId;
    if(reqUserId!==ticketUserId){
      throw new UnauthorizedError();
    }
    ticket.set({
      title,
      price
    })
    await ticket.save();
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id:ticket.id,
      version:ticket.version,
      title:ticket.title,
      price:ticket.price,
      userId:ticket.userId
    });
    console.log(`${process.env.NATS_CLIENT_ID} upadting ticket price to ${ticket.price}`)
    res.send(ticket);
  }
);

export { router as updateRouter };
