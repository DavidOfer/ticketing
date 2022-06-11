import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
import { TicketCreatedEvent, TicketUpdatedEvent } from "@odticketing/common";
import  {Message} from 'node-nats-streaming';

const setup = async ()=>{
    //create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);
    //create and save a ticket
    const ticket = Ticket.build({
        id:new mongoose.Types.ObjectId().toHexString(),
        title:'concert',
        price:20
    })
    await ticket.save();

    //create a fake data object
    const data: TicketCreatedEvent['data']={
        id:ticket.id,
        version: ticket.version+1,
        title:'new concert',
        price:999,
        userId:'notneeded'
    }

    //create a fake message object
    //@ts-ignore
    const msg:Message={
        ack:jest.fn()
    }

    //return all of this stuff
    return {msg,data,ticket,listener};
};

it('finds, updates and saves a ticket',async()=>{
    const {msg,data,ticket,listener} = await setup();
    await listener.onMessage(data,msg);
    const updatedTicket= await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});


it('acks the message',async()=>{
      //call the onMessage function with the data object + message object
  const {listener,data,msg} = await setup();
  await listener.onMessage(data,msg);
  //write assertions to make sure ack function was called
  expect(msg.ack).toHaveBeenCalled();
})

it('does not call ack function if the event has skipped version number',async()=>{
    const {msg,data,listener,ticket} = await setup();
    data.version=10;
    try{
        await listener.onMessage(data,msg);

    }
    catch(err){
        console.log(err)
    }

    expect(msg.ack).not.toHaveBeenCalled()

})
