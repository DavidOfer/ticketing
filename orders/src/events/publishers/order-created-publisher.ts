import { OrderCreatedEvent, Publisher,Subjects } from "@odticketing/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject: Subjects.OrderCreated= Subjects.OrderCreated;
}
