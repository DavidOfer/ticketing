import {
  Listener,
  Subjects,
  ExpirationCompleteEvent,
  OrderStatus,
} from "@odticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName: string = queueGroupName;
  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");
    // try {
    if (!order) {
      throw new Error("Order not found");
      // console.log('order not found')
    }
    // else{
    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }
    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
    // }

    // } catch (err) {
    //   console.log(err);
    // }
  }
}
