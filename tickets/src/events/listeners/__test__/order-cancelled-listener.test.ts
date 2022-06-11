import { OrderCancelledEvent } from "@odticketing/common";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import {Message} from 'node-nats-streaming';


const setup = async () => {
    //create an instace of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);
  
    //create and save a ticket
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
      title: "concert",
      price: 99,
      userId: new mongoose.Types.ObjectId().toHexString(),
    });
    ticket.set({ orderId})
    await ticket.save();
  
    //create fake data object
    const data: OrderCancelledEvent["data"] = {
      id: orderId,
      version: 0,
      ticket: {
        id: ticket.id,
      },
    };
  
    //@ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };
  
    return { listener, data, msg, ticket,orderId };
  };

  //should be split to 3 tests
  it('updates the ticket, publishes an event and acks the message',async()=>{
      const {listener,data,msg,ticket,orderId} = await setup();

      await listener.onMessage(data,msg);

      const updatedTicket = await Ticket.findById(ticket.id);

      expect(updatedTicket!.orderId).not.toBeDefined();

      expect(msg.ack).toHaveBeenCalled()
      expect(natsWrapper.client.publish).toHaveBeenCalled()
    })