import { Listener, OrderCancelledEvent, Subjects } from "@odticketing/common";
import { Message } from 'node-nats-streaming'
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      console.log("ticket not found");
    } else {
        ticket.set({orderId: undefined})
        await ticket.save()
        await new TicketUpdatedPublisher(this.client).publish({
            id:ticket.id,
            orderId:ticket.orderId,
            userId:ticket.userId,
            title:ticket.title,
            price:ticket.price,
            version:ticket.version
        })
        msg.ack();
    }
  }
}
