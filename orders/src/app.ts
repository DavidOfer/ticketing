import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler,NotFoundError,currentUser } from "@odticketing/common";
import { deleteRouter } from "./routes/delete";
import { showRouter } from "./routes/show";
import { indexRouter } from "./routes";
import { newRouter } from "./routes/new";

// import { User } from "./models/UserModel";

const app = express();
app.set('trust proxy', true); //express is behind the proxy of ingress nginx
app.use(json());
app.use(cookieSession({
  signed:false,
  secure: process.env.NODE_ENV !== 'test'
}))

app.use(currentUser);

app.use(deleteRouter);
app.use(showRouter);
app.use(indexRouter);
app.use(newRouter);



//currently using express-async-errors package,
// could instead be solved by using next() on the error object
app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };