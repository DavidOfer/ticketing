import { Publisher,Subjects,TicketCreatedEvent } from "@odticketing/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    subject: Subjects.TicketCreated= Subjects.TicketCreated;
}