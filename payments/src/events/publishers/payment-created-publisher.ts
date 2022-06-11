import { Publisher,Subjects,PaymentCreatedEvent } from "@odticketing/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated=Subjects.PaymentCreated;
}