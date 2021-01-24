// *****************************************
/* Load the .env file */
require("dotenv").config();
const db = require("../db/database");
const chai = require("chai"),
  expect = chai.expect;
const faker = require("faker");
const axios = require("axios").default;
const baseUrl = "http://localhost:4000/api";
// ******************************************

// helpers
function generateAuthHeader(token) {
  return {
    headers: {
      Authorization: "Bearer " + token,
    },
  };
}

function generateQuestion() {
  return {
    title: faker.lorem.lines(1),
    body: faker.lorem.paragraph(),
    tags: [faker.lorem.word(), faker.lorem.word()],
    category: faker.lorem.slug(4),
  };
}

function generateAnswer() {
  // added fake number to prevent collisions
  return { body: faker.lorem.paragraph() + faker.random.number() };
}

// fixtures
let user1 = {
    username: "pelican",
    email: "pelican@gmail.com",
    pswd: "pelicandontcare123",
  },
  user2 = {
    username: "parrot",
    email: "parrot@gmail.com",
    pswd: "parrotdon'treallycare",
  },
  user3 = {
    username: "hamster",
    email: "hamster@gmail.com",
    pswd: "hamstercares",
  },
  user4 = {
    username: "zaleel",
    email: "zaleel@gmail.com",
    pswd: "meinzaleelhon",
  },
  question1 = generateQuestion(), // will be attached _id on runtime
  question1ProposedEdit = generateQuestion(),
  question1ProposedEditByUser1 = generateQuestion(),
  question1ProposedEditByUser2 = generateQuestion(),
  answer1 = generateAnswer(), // will be attached _id on runtime
  answer1ProposedEdit = generateAnswer(),
  answer1ProposedEditByUser1 = generateAnswer(),
  answer1ProposedEditByUser2 = generateAnswer(),
  comment1 = { body: faker.lorem.lines(2) },
  comment2 = { body: faker.lorem.lines(2) };

// globals
let token1, token2, token3, deltaId1, deltaId2, answerDelta1, answerDelta2;

describe("API Testing", function () {
  before(async function () {
    this.timeout(10000);
    let con = db.getConnection();
    // clear entire database
    return con.dropDatabase();
  });

  describe("/users", function () {
    it("should create 3 User", async function () {
      this.timeout(10000);

      let res1 = await axios.post(baseUrl + "/users/register", user1);
      let res2 = await axios.post(baseUrl + "/users/register", user2);
      let res3 = await axios.post(baseUrl + "/users/register", user3);

      expect(res1.status).equal(200);
      expect(res2.status).equal(200);
      expect(res3.status).equal(200);
    });

    it("should login 3 users", async function () {
      let res1 = await axios.post(
        baseUrl + "/users/login",
        ({ email, pswd } = user1)
      );
      token1 = res1.data.token;
      let res2 = await axios.post(
        baseUrl + "/users/login",
        ({ email, pswd } = user2)
      );
      token2 = res2.data.token;
      let res3 = await axios.post(
        baseUrl + "/users/login",
        ({ email, pswd } = user3)
      );
      token3 = res3.data.token;

      expect(token1, "token1").to.not.be.undefined;
      expect(token2, "token2").to.not.be.undefined;
      expect(token3, "token3").to.not.be.undefined;
    });

    it("should check if an account with username already exists", async function () {
      let res = await axios.get(
        baseUrl + "/users/checkusername/" + user1.username
      );
      expect(res.status).to.be.equal(200);
      res = await axios.get(baseUrl + "/users/checkusername/" + user2.username);
      expect(res.status).to.be.equal(200);
      res = await axios.get(
        baseUrl + "/users/checkusername/" + "NullNull#4234"
      );
      expect(res.data).to.have.lengthOf(0);
    });

    it("should create a user and then delete it", async function () {
      await axios.post(baseUrl + "/users/register", user4);
      let login = await axios.post(
        baseUrl + "/users/login",
        ({ email, pswd } = user4)
      );
      expect(login.status).to.be.equal(200);
      let del = await axios.delete(
        baseUrl + "/users",
        generateAuthHeader(login.data.token)
      );
      expect(del.status).to.be.equal(204);
      try {
        await axios.get(baseUrl + "/users/" + login.data._id);
      } catch (e) {
        expect(e.response.status).to.be.equal(404);
      }
    });
  });

  describe("/questions", function () {
    let qurl; // common question url that we're going to use for these tests

    it("should create a question", async function () {
      let createQues = await axios.post(
        baseUrl + "/questions",
        question1,
        generateAuthHeader(token1) // creator!
      );
      question1._id = createQues.data._id; // store for later
      expect(createQues.status).to.be.equal(200);
      // assign
      qurl = baseUrl + "/questions/" + question1._id;
    });

    describe("others", function () {
      it("get created question", async function () {
        let get = await axios.get(qurl);
        expect(get.status).to.be.equal(200);
        expect(get.data).to.not.be.empty; // because we just created it
      });

      it("should upvote a question 2 times by 2 users. (2 votes total)", async function () {
        let url = baseUrl + "/questions/upvote/" + question1._id;

        let header1 = generateAuthHeader(token1),
          header2 = generateAuthHeader(token2);

        let res1 = axios.post(url, null, header1);
        let res2 = axios.post(url, null, header2);
        await res1;
        await res2;
        await res1;
        await res2;

        let final = await axios.get(qurl);
        expect(final.data.votes).to.be.equal(2);
      });

      it("should undo upvote a question 2 times by 2 users. (0 votes total)", async function () {
        let url = baseUrl + "/questions/upvote/undo/" + question1._id;

        let header1 = generateAuthHeader(token1),
          header2 = generateAuthHeader(token2);

        let res1 = axios.post(url, null, header1);
        let res2 = axios.post(url, null, header2);

        await res1;
        await res2;
        await res1; // to prove its idempotent
        await res2;

        let final = await axios.get(qurl);
        expect(final.data.votes).to.be.equal(0);
      });

      it("should downvote a question 2 times by 2 users. (-2 votes total)", async function () {
        let url = baseUrl + "/questions/downvote/" + question1._id;

        let header1 = generateAuthHeader(token1),
          header2 = generateAuthHeader(token2);

        let res1 = axios.post(url, null, header1);
        let res2 = axios.post(url, null, header2);

        await res1;
        await res2;
        await res1; // to prove its idempotent
        await res2;

        let final = await axios.get(qurl);
        expect(final.data.votes).to.be.equal(-2);
      });

      it("should undo downvote a question 2 times by 2 users. (0 votes total)", async function () {
        let url = baseUrl + "/questions/downvote/undo/" + question1._id;

        let header1 = generateAuthHeader(token1),
          header2 = generateAuthHeader(token2);

        let res1 = axios.post(url, null, header1);
        let res2 = axios.post(url, null, header2);

        await res1;
        await res2;
        await res1; // to prove its idempotent
        await res2;

        let final = await axios.get(qurl);
        expect(final.data.votes).to.be.equal(0);
      });

      it("edit question as inquirer (approve immediately)", async function () {
        let res = await axios.put(
          qurl,
          question1ProposedEdit,
          generateAuthHeader(token1) // creator
        );

        expect(res.status).to.be.equal(200);
        let chck = await axios.get(qurl);
        expect(chck.data.title).to.be.equal(question1ProposedEdit.title);
      });

      it("should reject recently accepted change to the question (because no change)", async function () {
        try {
          await axios.put(
            qurl,
            question1ProposedEdit,
            generateAuthHeader(token1) // creator
          );
        } catch (e) {
          expect(e.response.status).to.be.equal(400);
        }
      });

      it("propose edit to the question as another user (don't approve immediately)", async function () {
        let res = await axios.put(
          qurl,
          question1ProposedEditByUser1, // some new other change
          generateAuthHeader(token2) // some other user
        );

        expect(res.status).to.be.equal(200);

        deltaId1 = res.data.delta; // TODO: add a route for this in API
        let chck = await axios.get(qurl);
        expect(chck.data.title).to.not.be.equal(
          question1ProposedEditByUser1.title
        );
      });

      it("propose edit to the question as another user while their previous edit is under review", async function () {
        try {
          await axios.put(
            qurl,
            question1ProposedEditByUser1, // some new other change
            generateAuthHeader(token2) // some other user
          );
        } catch (e) {
          expect(e.response.status).to.be.equal(400);
        }

        let chck = await axios.get(qurl);
        expect(chck.data.title).to.not.be.equal(
          question1ProposedEditByUser1.title
        );
      });

      it("propose edit to the question as another (2nd) user", async function () {
        let res = await axios.put(
          qurl,
          question1ProposedEditByUser2, // some new other change
          generateAuthHeader(token3) // some other user
        );

        expect(res.status).to.be.equal(200);
        deltaId2 = res.data.delta; // TODO: add a route for this in API
        let chck = await axios.get(qurl);
        expect(chck.data.title).to.not.be.equal(
          question1ProposedEditByUser2.title
        );
      });

      it("approve edit to the question made by the (2nd) user", async function () {
        let res = await axios.post(
          baseUrl + "/questions/edit/approve/" + deltaId2,
          null, // for data
          generateAuthHeader(token1) // creator can approve edits
        );

        expect(res.status).to.be.equal(200);

        let chck = await axios.get(qurl);
        for (e of Object.keys(question1)) {
          // deep equality check
          if (chck.data[e] && question1ProposedEditByUser2[e]) {
            expect(chck.data[e]).to.be.eql(question1ProposedEditByUser2[e]);
          }
        }
      });
    });
  });

  describe("/answers", function () {
    let qurl; // default answer to use for the test cases

    it("should answer a question", async function () {
      let res = await axios.post(
        baseUrl + "/answers/" + question1._id,
        answer1,
        generateAuthHeader(token2)
      );

      expect(res.status).to.be.equal(200);
      let chck = await axios.get(baseUrl + "/questions/" + question1._id);
      expect(chck.data.answers[0].body).to.equal(answer1.body);
      answer1._id = chck.data.answers[0]._id;

      // assign
      qurl = baseUrl + "/answers/" + answer1._id;
    });

    describe("others", function () {
      it("should upvote a answer 2 times by 2 users. (2 votes total)", async function () {
        let url = baseUrl + "/answers/upvote/" + answer1._id;

        let header1 = generateAuthHeader(token1),
          header2 = generateAuthHeader(token2);

        let res1 = axios.post(url, null, header1);
        let res2 = axios.post(url, null, header2);

        await res1;
        await res2;
        await res1;
        await res2;

        let final = await axios.get(qurl);
        expect(final.data.answers[0].votes).to.be.equal(2);
      });

      it("should undo upvote an answer 2 times by 2 users. (0 votes total)", async function () {
        let url = baseUrl + "/answers/upvote/undo/" + answer1._id;

        let header1 = generateAuthHeader(token1),
          header2 = generateAuthHeader(token2);

        let res1 = axios.post(url, null, header1);
        let res2 = axios.post(url, null, header2);

        await res1;
        await res2;
        await res1; // to prove its idempotent
        await res2;

        let final = await axios.get(qurl);
        expect(final.data.answers[0].votes).to.be.equal(0);
      });

      it("should downvote an answer 2 times by 2 users. (-2 votes total)", async function () {
        let url = baseUrl + "/answers/downvote/" + answer1._id;

        let header1 = generateAuthHeader(token1),
          header2 = generateAuthHeader(token2);

        let res1 = axios.post(url, null, header1);
        let res2 = axios.post(url, null, header2);

        await res1;
        await res2;
        await res1; // to prove its idempotent
        await res2;

        let final = await axios.get(qurl);
        expect(final.data.answers[0].votes).to.be.equal(-2);
      });

      it("should undo downvote an answer 2 times by 2 users. (0 votes total)", async function () {
        let url = baseUrl + "/answers/downvote/undo/" + answer1._id;

        let header1 = generateAuthHeader(token1),
          header2 = generateAuthHeader(token2);

        let res1 = axios.post(url, null, header1);
        let res2 = axios.post(url, null, header2);

        await res1;
        await res2;
        await res1; // to prove its idempotent
        await res2;

        let final = await axios.get(qurl);
        expect(final.data.answers[0].votes).to.be.equal(0);
      });

      it("edit answer as inquirer (approve immediately)", async function () {
        let res = await axios.put(
          qurl,
          answer1ProposedEdit,
          generateAuthHeader(token2) // creator
        );

        expect(res.status).to.be.equal(200);
        let chck = await axios.get(qurl);
        expect(chck.data.answers[0].body).to.be.equal(answer1ProposedEdit.body);
      });

      it("should reject recently accepted change to the answer (because no change)", async function () {
        try {
          await axios.put(
            qurl,
            answer1ProposedEdit,
            generateAuthHeader(token2) // creator
          );
        } catch (e) {
          expect(e.response.status).to.be.equal(400);
        }
      });

      it("propose edit to the answer as another user (don't approve immediately)", async function () {
        let res = await axios.put(
          qurl,
          answer1ProposedEditByUser1, // some new other change
          generateAuthHeader(token1) // some other user
        );

        expect(res.status).to.be.equal(200);

        answerDelta1 = res.data.delta; // TODO: add a route for this in API

        let chck = await axios.get(qurl);
        expect(chck.data.answers[0].body).to.not.be.equal(
          answer1ProposedEditByUser1.body
        );
      });

      it("propose edit to the answer as another user while their previous edit is under review", async function () {
        try {
          await axios.put(
            qurl,
            answer1ProposedEditByUser1, // some new other change
            generateAuthHeader(token1) // some other user
          );
        } catch (e) {
          expect(e.response.status).to.be.equal(400);
        }

        let chck = await axios.get(qurl);
        expect(chck.data.answers[0].body).to.not.be.equal(
          answer1ProposedEditByUser1.body
        );
      });

      it("propose edit to the answer as another (2nd) user", async function () {
        let res = await axios.put(
          qurl,
          answer1ProposedEditByUser2, // some new other change
          generateAuthHeader(token3) // some other user
        );

        expect(res.status).to.be.equal(200);
        answerDelta2 = res.data.delta; // TODO: add a route for this in API

        let chck = await axios.get(qurl);

        expect(chck.data.answers[0].body).to.not.be.equal(
          answer1ProposedEditByUser2.body
        );
      });

      it("approve edit to the answer made by the (2nd) user", async function () {
        let res = await axios.post(
          baseUrl + "/answers/edit/approve/" + answerDelta2,
          null, // for data
          generateAuthHeader(token2) // creator can approve edits
        );

        expect(res.status).to.be.equal(200);

        let chck = await axios.get(qurl);
        expect(chck.data.answers[0].body).to.be.equal(
          answer1ProposedEditByUser2.body
        );
      });
    });
  });

  describe("/comments", function () {
    it("should create comment on a question", async function () {
      const res = await axios.post(
        baseUrl + "/questions/comments/" + question1._id,
        comment1,
        generateAuthHeader(token1)
      );

      expect(res.status).to.be.equal(200);
      comment1._id = res.data._id;

      let url = baseUrl + "/questions/" + question1._id;
      const chck = await axios.get(url);
      expect(chck.data.comments[0]._id).to.be.equal(comment1._id);
    });

    it("should delete previously made comment on a question", async function () {
      const res = await axios.delete(
        baseUrl + "/comments/" + comment1._id,
        generateAuthHeader(token1)
      );

      expect(res.status).to.be.equal(204);

      let url = baseUrl + "/questions/" + question1._id;
      const chck = await axios.get(url);
      expect(chck.data.comments).to.be.empty;
    });

    it("should create comment on a answer", async function () {
      const res = await axios.post(
        baseUrl + "/answers/comments/" + answer1._id,
        comment2,
        generateAuthHeader(token1)
      );

      expect(res.status).to.be.equal(200);
      comment2._id = res.data._id;

      let url = baseUrl + "/answers/" + answer1._id;
      const chck = await axios.get(url);
      expect(chck.data.answers[0].comments[0]._id).to.be.equal(comment2._id);
    });

    it("should delete comment on a answer", async function () {
      const res = await axios.delete(
        baseUrl + "/comments/" + comment2._id,
        generateAuthHeader(token1)
      );

      expect(res.status).to.be.equal(204);

      let url = baseUrl + "/answers/" + answer1._id;
      const chck = await axios.get(url);
      expect(chck.data.answers[0].comments).to.be.empty;
    });

    it("should check that a user can't delete other user's comment", async function () {
      const res = await axios.post(
        baseUrl + "/questions/comments/" + question1._id,
        comment1,
        generateAuthHeader(token1)
      );

      expect(res.status, "res.status =>").to.be.equal(200);
      comment1._id = res.data._id;

      try {
        const chck1 = await axios.delete(
          baseUrl + "/comments/" + comment1._id,
          generateAuthHeader(token2)
        );
      } catch (e) {
        expect(e.response.status).to.be.equal(400);
      }

      let url = baseUrl + "/questions/" + question1._id;
      const chck2 = await axios.get(url);
      // expect that comment to still be there
      expect(chck2.data.comments[0]._id).to.be.equal(comment1._id);
    });

    it("should upvote a comment 2 times by 2 users. (2 votes total)", async function () {
      let url = baseUrl + "/comments/upvote/" + comment1._id;

      let header1 = generateAuthHeader(token1),
        header2 = generateAuthHeader(token2);

      let res1 = axios.post(url, null, header1);
      let res2 = axios.post(url, null, header2);

      await res1;
      await res2;
      await res1;
      await res2;

      let final = await axios.get(baseUrl + "/comments/" + comment1._id);
      expect(final.data.meta.votes).to.be.equal(2);
    });

    it("should undo upvote a comment 2 times by 2 users. (0 votes total)", async function () {
      let url = baseUrl + "/comments/undo/upvote/" + comment1._id;

      let header1 = generateAuthHeader(token1),
        header2 = generateAuthHeader(token2);

      let res1 = axios.post(url, null, header1);
      let res2 = axios.post(url, null, header2);

      await res1;
      await res2;
      await res1; // to prove its idempotent
      await res2;

      let final = await axios.get(baseUrl + "/comments/" + comment1._id);
      expect(final.data.meta.votes).to.be.equal(0);
    });
  });

  after(async function () {
    db.close();
  });
});
