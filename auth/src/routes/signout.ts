import express from "express";

const router = express.Router();

router.post("/signout", (req, res) => {
  req.session = null
  res.status(200).send("logged out");
});

export { router as signoutRouter };
