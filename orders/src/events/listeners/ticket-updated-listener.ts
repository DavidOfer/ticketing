import { Listener, TicketUpdatedEvent, Subjects } from "@odticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    //data: { id: string; title: string; price: number; userId: string; }
    const { id, title, price, version } = data;
    const ticket = await Ticket.findByEvent({ id, version });
    if (!ticket) {
      // throw new Error('ticket not found');
      console.log("ticket not found!");
    } else {
      ticket.set({ title, price });
      await ticket.save();
      msg.ack();
    }
  }
}
