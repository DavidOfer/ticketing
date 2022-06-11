import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { doRequest, errors } = useRequest({
        url: '/api/users/signup',
        method: 'post',
        body: {
            email, password
        },
        onSuccess: ()=>{
            Router.push('/')
        }
    })
    const onSubmitHandler = async (event) => {
        event.preventDefault();
            await doRequest();
    }
    return (
        <form onSubmit={onSubmitHandler}>
            <h1>
                Sign Up
            </h1>
            <div className="form-group">
                <label>
                    Email Address
                </label>
                <input value={email} onChange={e => setEmail(e.target.value)} className="form-control" />
                <label>
                    Password
                </label>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="form-control" />
                {errors}
                <button className="btn btn-primary">Sign up</button>
            </div>
        </form>
    );
}
export default Signup;