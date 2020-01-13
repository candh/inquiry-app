require("dotenv").config();
const db = require("../../db/database");
const User = require("../../models/User");
const Question = require("../../models/Question");
const Answer = require("../../models/Answer");
const Comment = require("../../models/Comment");
const History = require("../../models/History").History;
// const mocha = require('mocha')
const faker = require("faker");

let users = [];
let questions = [];
let tags = [
  "js",
  "database",
  "node",
  "pets",
  "mongoose",
  "java",
  "c",
  "networking"
];
let categories = [
  "Technology",
  "Pets",
  "Aviation",
  "Fashion",
  "Science",
  "Physics",
  "Maths"
];
let comments = [];
let answers = [];

const totalUsers = 5;
const totalQuestions = 50;
const totalAnswers = 20;

describe("Database Testing", function() {
  // deletes everything in the database
  before(function(done) {
    User.deleteMany({}, function(err, res) {
      if (err) return console.error(err);
      console.log(res);
      Question.deleteMany({}, function(err, res) {
        if (err) return console.error(err);
        console.log(res);
        Answer.deleteMany({}, function(err, res) {
          if (err) return console.error(err);
          console.log(res);
          Comment.deleteMany({}, function(err, res) {
            if (err) return console.error(err);
            console.log(res);
            History.deleteMany({}, function(err, res) {
              if (err) return console.error(err);
              done();
            });
          });
        });
      });
    });
  });

  describe("Insert", function() {
    for (let i = 0; i < totalUsers; i++) {
      users.push(
        new User({
          firstname: faker.name.firstName(),
          lastname: faker.name.lastName(),
          username: faker.internet.userName(),
          email: faker.internet.email(),
          pswd: faker.internet.password(),
          profile_pic: faker.image.imageUrl(),
          meta: {
            reputation: 100,
            role: faker.random.arrayElement(["User", "Mod", "Admin"])
          }
        })
      );
    }
    it("should add all users to the database", function(done) {
      User.insertMany(users, function(err, res) {
        if (err) return done(err);
        console.log(res);
        done();
      });
    });

    it("should ask $totalQuestions questions", function(done) {
      if (totalQuestions == 0) return done();
      // randomly select users
      let _users = [];
      for (let i = 0; i < totalQuestions; i++) {
        _users.push(faker.random.arrayElement(users));
      }
      // create questions
      for (let user of _users) {
        let question = new Question({
          user: user._id,
          title: faker.lorem.lines(1),
          body: faker.lorem.paragraph(),
          tags: [faker.random.arrayElement(tags)],
          category: faker.random.arrayElement(categories),
          views: faker.random.number(4000),
          votes: faker.random.number(4000)
        });
        questions.push(question);
      }

      Question.insertMany(questions, function(err, res) {
        if (err) return done(err);
        console.log(res);
        done();
      });
    });

    it("should answer any $totalanswers questions", function(done) {
      if (totalAnswers == 0) return done();
      let _questions = [];
      let _users = [];

      for (let i = 0; i < totalAnswers; i++) {
        _questions.push(faker.random.arrayElement(questions));
        _users.push(faker.random.arrayElement(users));
      }

      for (let user of _users) {
        let answer = new Answer({
          user: user._id,
          body: faker.lorem.paragraph(),
          votes: faker.random.number(20),
          accepted: faker.random.arrayElement([false, true])
        });
        answers.push(answer);
      }

      Answer.insertMany(answers, async function(err, res) {
        if (err) return done(err);
        console.log(res);
        let history = [];

        // lets answer these questions
        for (let answer of answers) {
          let q;
          while (history.includes((q = faker.random.arrayElement(questions)))); // holy fuck man
          history.push(q);
          // q.answers.push(answer._id)
          // answer.question = q._id
          try {
            console.log(await answer.save());
          } catch (e) {
            done(e);
          }

          q.answers.push(answer);
          try {
            console.log(await q.save());
          } catch (e) {
            done(e);
          }
        }
        done();
      });
    });

    it.skip("should post comments on every post", function(done) {
      let total = Math.max(questions.length, answers.length);
      function returnComment() {
        return new Comment({
          user: faker.random.arrayElement(users)._id,
          body: faker.hacker.phrase(),
          votes: faker.random.number(5)
        });
      }
      for (let question of questions) {
        comments.push(returnComment());
      }
      for (let answer of answers) {
        comments.push(returnComment());
      }

      Comment.insertMany(comments, async function(err, res) {
        if (err) return done(err);
        console.log(res);

        for (let question of questions) {
          question.comments.push(comments.pop()._id);
          try {
            console.log(await question.save());
          } catch (e) {
            done(e);
          }
        }

        for (let answer of answers) {
          answer.comments.push(comments.pop()._id);
          try {
            console.log(await answer.save());
          } catch (e) {
            done(e);
          }
        }
        done();
      });
    });
  });

  // describe('Basic Queries', function () {
  //   it.skip('should get all the questions asked by haider', function (done) {
  //     Question.find({ user: haider.id }).populate('user', 'username').exec(function (err, res) {
  //       if (err) done(err)
  //       console.log(res)
  //       done()
  //     })
  //   })

  //   it.skip('should fill the all the question object', function (done) {
  //     // fuck this is so easy
  //     Question.find().populate('user').populate('answers').populate('comments').exec(function (err, res) {
  //       if (err) done(err)
  //       console.log(res)
  //       done()
  //     })
  //   })
  // })

  after(function() {
    db.close();
  });
});
