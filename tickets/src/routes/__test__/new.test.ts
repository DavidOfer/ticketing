import request from 'supertest';
import {app } from '../../app';
import {Ticket} from '../../models/ticket';
import {natsWrapper} from '../../nats-wrapper';


it('has a route handler listening to /api/tickets from post requests', async ()=>{
    const response = await request(app)
    .post('/api/tickets')
    .send({});
    expect(response.status).not.toEqual(404);
});

it('can only be accessed if used is signed in', async ()=>{
    await request(app)
    .post('/api/tickets')
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async ()=>{
    const cookie = await global.signin();
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',cookie)
    .send({});
    
    expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async ()=>{
    const cookie = await global.signin();
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',cookie)
    .send({
        title:'',
        price:10,

    })
    .expect(400);


    const response2 = await request(app)
    .post('/api/tickets')
    .set('Cookie',cookie)
    .send({
        price:10,

    })
    .expect(400);

});

it('returns an error if an invalid price is provided', async ()=>{

    const cookie = await global.signin();
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',cookie)
    .send({
        title:'incorrectprice',
        price:-10,

    })
    .expect(400);
    

    const response2 = await request(app)
    .post('/api/tickets')
    .set('Cookie',cookie)
    .send({
        title:'noprice'

    })
    .expect(400);
});

it('creates a ticket with valid inputs', async ()=>{
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const cookie = await global.signin();

    const ticketTitle = 'a title';
    const ticketPrice = 20;
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',cookie)
    .send({
        title:ticketTitle,
        price:ticketPrice,

    })
    .expect(201);
    
    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(ticketTitle);
    expect(tickets[0].price).toEqual(ticketPrice);
});

it('publishes an event',async ()=>{
    const ticketTitle = 'a title';
    const ticketPrice = 20;
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
        title:ticketTitle,
        price:ticketPrice,

    })
    .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();

})