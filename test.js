/*
change first line for var server. Change to correct 
get/post requests. 
getting certain info from database: 
import { Comment, User } from './models'
*/

// Imports the server.js file to be tested. Need to find the correct one
const server = require("../server");
// Assertion (Test Driven Development) and Should,  Expect(Behaviour driven development) library
const chai = require("chai");
// Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;
import { Student } from './models'

describe("Server!", () => {
  
  it("Error if missing name or review", (done) => {
    chai
      .request(server)
      .get('/reviews')
      .end((err, res) => {
        expect(res.body).to.have.property('name'); 
        expect(res.body).to.have.property('review'); 
        done();
      });
    }); 

 it("Check if valid name and review", (done) => //data stored in database?
  {
    chai
      .request(server)
      .get("/addReview")
      .send({
          name: "Margarita",
          review: "cold"
      })
      .end((err, res) => {
      expect(res.body.name).to.equals("Margarita");
      expect(res.body.review).to.equals("cold");
      done();
      });
  }); 

});
