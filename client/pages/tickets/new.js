import { useState } from "react";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const newTicket = () => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const {doRequest,errors } =useRequest({
        url:'/api/tickets',
        method:'post',
        body:{
            title,price
        },
        onSuccess:()=>Router.push('/')
    })
    const onSubmitHandler = (event)=>{
        event.preventDefault();
        doRequest();
    }
    const onBlurHandler = ()=>{
        const value = parseFloat(price);
        if(isNaN(value)){
            return;
        }
        setPrice(value.toFixed(2))
    }
    return <div>
        <h1>
            Create a Ticket
        </h1>
        <form onSubmit={onSubmitHandler}>
            <div className="form-group">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-control" />
            </div>
            <div className="form-group">
                <label>Price</label>
                <input
                onBlur={onBlurHandler}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-control" />
            </div>
            <button className="btn btn-primary">Submit</button>
        </form>
        <div>
            {errors}
        </div>
    </div>
}

export default newTicket;