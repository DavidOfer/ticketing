import { Publisher,Subjects, TicketUpdatedEvent } from "@odticketing/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    subject: Subjects.TicketUpdated= Subjects.TicketUpdated;
}