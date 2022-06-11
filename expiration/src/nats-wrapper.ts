import nats,{Stan} from 'node-nats-streaming';
/*
a singleton class which holds our connection to the nats-streaming-server(our event-bus)
which is going to provide a client(stan) in order for our services to transmit their
events
*/
class NatsWrapper{
    private _client?:Stan;

    get client(){
        if(!this._client){
            throw new Error('Cannot access NATS client before connecting');
        }
        return this._client;
    }

    connect(clusterId:string,clientId:string,url:string){
        this._client = nats.connect(clusterId,clientId,{url});

        return new Promise<void>((resolve,reject)=>{
            this.client.on('connect',()=>{
                console.log('connected to NATS');
                resolve();
            });
            this.client.on('error',(err)=>{
                reject(err);
            })

        });
    }
}
export const natsWrapper =  new NatsWrapper();
