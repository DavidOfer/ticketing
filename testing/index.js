const { default: axios } = require("axios")


const cookie = 'session=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJall5T1RnNVpXTXlZVFpqTURFME4yUTRabVV6TVRFM1pDSXNJbVZ0WVdsc0lqb2libVYzYldGcGJESkFiV0ZwYkM1amIyMGlMQ0pwWVhRaU9qRTJOVFF4TmpreU9ESjkuT1pMX2lYTERjYzcyX1RfZ0U2R0NqMm45WUNwMWRpTFN1dHc4UDRoTXZEayJ9'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const doRequest = async () => {
    // try {
    //     const response = await axios.get(`https://ticketing.dev/api/users/currentuser`,
    //         // {
    //         //     email:"mymail1@mail.com",
    //         //     password:"1234"
    //         // },
    //         {
    //             headers: {
    //                 cookie
    //             }
    //         })
    //     console.log(response.data);
    // }
    // catch (err) {
    //     console.log(err.response.data);
    // }
    try {
        const { data } = await axios.post(
            `https://ticketing.dev/api/tickets/`,
            {
                title: 'ticket', price: 5
            },
            {
                headers: { cookie }
            }
        );

        await axios.put(
            `https://ticketing.dev/api/tickets/${data.id}`,
            {
                title: 'ticket', price: 10
            },
            {
                headers: { cookie }
            }
        )

        await axios.put(
            `https://ticketing.dev/api/tickets/${data.id}`,
            {
                title: 'ticket', price: 15
            },
            {
                headers: { cookie }
            }
        )

        //order a ticket
        await axios.post(
            `https://ticketing.dev/api/orders`,
            {
                ticketId:data.id
            },
            {
                headers: { cookie }
            }
        )
    }
    catch (err) {
        console.log(err);
    }

    console.log('Request complete');
}

(async()=>{
    for(let i =0; i<1; i++){
        doRequest();
    }
})();