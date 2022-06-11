import request from "supertest";
import { app } from "../../app";

it("returns a user after requesting an exisitng user", async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set('Cookie',cookie)
    .send()
    .expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com')
});

it("returns a null if not authenticated", async () => {

  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

    expect(response.body.currentUser).toEqual(null)
});
