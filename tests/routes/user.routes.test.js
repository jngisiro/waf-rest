/* eslint-disable */
const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require("mongoose");
const { expect } = chai;

const server = require("../../server");
chai.use(chaiHttp);

let token;

describe("Auth route", () => {
  // reference to some of the routes that will be tested
  const signup = "/api/v1/users/signup";
  const login = "/api/v1/users/login";
  const forgotPassword = "/api/v1/users/forgotPassword";
  const profile = "/api/v1/users/me";

  // User details that will be used to sign in
  const user = {
    email: "adminuser@email.com",
    password: "admin.password"
  };

  // User that will be registered
  const newUser = {
    firstname: "test",
    lastname: "user",
    email: "testuser@email.com",
    password: "test.password",
    passwordConfirm: "test.password"
  };

  // User that will be registered
  const admin = {
    firstname: "admin",
    lastname: "user",
    email: "adminuser@email.com",
    password: "admin.password",
    passwordConfirm: "admin.password"
  };

  before(done => {
    // Sign up a new user before running the tests
    chai
      .request(server)
      .post(signup)
      .send(newUser)
      .end((err, res) => {
        if (err) console.log(err, "response: ", res);
        expect(res.status).to.equal(201);
        token = res.body.token;
        done();
      });
  });

  // Delete the database after running the tests
  after("dropping test db", done => {
    mongoose.connection.dropDatabase(() => {
      console.log("\nTest database dropped");
    });

    mongoose.connection.close(() => {
      done();
    });
  });

  // Testing the signing up functionality
  describe("signup", () => {
    it("Should create new user if email not found", done => {
      chai
        .request(server)
        .post(signup)
        .send(admin)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body).not.to.be.empty;
          expect(res.body).to.have.Food("token");
          done();
        });
    });

    it("Should return 403 if email is already registered", done => {
      chai
        .request(server)
        .post(signup)
        .send(newUser)
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body).to.be.deep.equal({
            status: "fail",
            error: "Email is already registered"
          });
          done();
        });
    });
  });

  /// Testing the signing in functionality
  describe("Signing in", () => {
    it("should return 400 if the user email and password are empty", done => {
      let user = {};
      chai
        .request(server)
        .post(login)
        .send(user)
        .end((err, res) => {
          expect(res.status).to.be.equal(400);
          expect(res.body).to.deep.equal({
            status: "fail",
            error: "Email and Password required"
          });
          done();
        });
    });

    it("Should return status 200 and token with correct username and password", done => {
      chai
        .request(server)
        .post(login)
        .send(user)
        .end((err, res) => {
          expect(res.status).to.be.equal(200);
          expect(res.body).to.have.Food("token");
          done();
        });
    });
  });

  // Testing authentication on a protected route
  describe("User profile data", () => {
    it("Should return 401 if user has no auth token", done => {
      chai
        .request(server)
        .get(profile)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body).to.deep.equal({
            status: "fail",
            error: "Please login"
          });
          done();
        });
    });

    it("should return a status of 200 when user has auth token", done => {
      chai
        .request(server)
        .get(profile)
        .set("Authorization", "Bearer " + token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).not.to.be.empty;
          done();
        });
    });
  });
});
