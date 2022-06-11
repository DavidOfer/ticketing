import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { errorHandler,NotFoundError } from "@odticketing/common";
// import { User } from "./models/UserModel";

const app = express();
app.set('trust proxy', true); //express is behind the proxy of ingress nginx
app.use(json());
app.use(cookieSession({
  signed:false,
  secure: process.env.NODE_ENV !== 'test'
}))

const mainRouteStringPath = "/api/users";

app.use(mainRouteStringPath, currentUserRouter);
app.use(mainRouteStringPath, signinRouter);
app.use(mainRouteStringPath, signoutRouter);
app.use(mainRouteStringPath, signupRouter);

//currently using express-async-errors package,
// could instead be solved by using next() on the error object
app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };