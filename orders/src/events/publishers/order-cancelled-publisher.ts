import { OrderCancelledEvent, Publisher,Subjects } from "@odticketing/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled= Subjects.OrderCancelled;
}