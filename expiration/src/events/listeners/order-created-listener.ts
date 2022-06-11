import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@odticketing/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject: Subjects.OrderCreated=Subjects.OrderCreated;
    queueGroupName: string=queueGroupName;
    async onMessage(data: OrderCreatedEvent['data'], msg: Message){

        const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
        console.log('waiting ' + delay/1000 +' seconds')
        try{
            await expirationQueue.add({
                orderId:data.id
            },
            {
                delay
            }
            )
        }
        catch(err){
            console.log(err);
        }
        msg.ack();
    }

}