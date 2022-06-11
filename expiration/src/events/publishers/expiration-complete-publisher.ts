
import { Publisher,Subjects,ExpirationCompleteEvent } from "@odticketing/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete= Subjects.ExpirationComplete;

}