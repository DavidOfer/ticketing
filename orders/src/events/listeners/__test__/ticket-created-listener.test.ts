import {Message} from 'node-nats-streaming';
import { TicketCreatedEvent, TicketUpdatedEvent } from "@odticketing/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  //create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  //create a fake data event
  const data: TicketUpdatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: "concert",
    price: 5,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  //create a fake message object
  //@ts-ignore
  const msg:Message={
      ack:jest.fn()
  }
  return {listener,data,msg}
};

it("creates and saves a ticket", async () => {
  //call the onMessage function with the data object + message object 
  const {listener,data,msg} = await setup();
  await listener.onMessage(data,msg);
  //write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  //call the onMessage function with the data object + message object
  const {listener,data,msg} = await setup();
  await listener.onMessage(data,msg);
  //write assertions to make sure ack function was called
  expect(msg.ack).toHaveBeenCalled();
});
