# [inquiry](http://inquiry-app.herokuapp.com)

A concept questions and answer website. For my semester project.

# Try

[http://inquiry-app.herokuapp.com](http://inquiry-app.herokuapp.com)

![Screenshot](https://i.postimg.cc/C5NHsTd2/Screen-Shot-2020-01-13-at-11-26-11-PM.png)

# Functionalties

- User registration / Login
- User can ask questions
- User can edit own questions
- User can delete own questions
- User can answer questions
- User can edit answers
- User can delete own answer
- User can post comments on both questions and answers
- User can search questions
- Questions have tags
- Questions have categories
- Questions can have points
- Notifications when someone answers your questions or posts a comment
- Answers can have points
- Homepage shows questions with most points that day
- Reputation system not included (i think, atleast thats the plan for now)

# API Routes

Beware, some routes may be missing.
Based mostly on this [https://api.stackexchange.com/docs/](https://api.stackexchange.com/docs/)
also [https://stackoverflow.com/questions/638868/getting-out-of-crud](https://stackoverflow.com/questions/638868/getting-out-of-crud)

## Question

### Create

| Method | Path                        | Description                                           |
| ------ | --------------------------- | ----------------------------------------------------- |
| POST   | /api/questions              | Creates question (associated with the logged in user) |
| POST   | /api/questions/comments/:id | Creates comment on the question with the :id          |

### Read

| Method | Path                                                               | Description                                                    |
| ------ | ------------------------------------------------------------------ | -------------------------------------------------------------- |
| GET    | /api/questions                                                     | Get all questions                                              |
| GET    | /api/questions/:id                                                 | Get one question                                               |
| GET    | /api/questions?limit=25&offset=50                                  | Limit returned questions to 25 and skip the first 50 questions |
| GET    | /api/questions?sort=votes\|views\|creation?order=asc\|desc         | Sort on parameter                                              |
| GET    | /api/questions?fromdate=ISO8601DateString&todate=ISO8601DateString | Bracket by date                                                |

### Update

| Method | Path               | Description                   |
| ------ | ------------------ | ----------------------------- |
| PUT    | /api/questions/:id | updates the question (oh boy) |

### Delete

| Method | Path                              | Description                              |
| ------ | --------------------------------- | ---------------------------------------- |
| DELETE | /api/questions/:id                | Deletes the question :id                 |
| DELETE | /api/questions/:qid/comments/:cid | Delete comment :cid on the question :qid |

### Misc

| Method | Path                              | Description                 |
| ------ | --------------------------------- | --------------------------- |
| POST   | /api/questions/upvote/:id/        | Upvotes question :id        |
| POST   | /api/questions/undo/upvote/:id    | Undo Upvotes question :id   |
| POST   | /api/questions/downvote/:id       | Downvote question :id       |
| POST   | /api/questions/downvote/undo/:id/ | Undo Downvotes question :id |

## User

| Method | Path                     | Description              |
| ------ | ------------------------ | ------------------------ |
| POST   | /api/users/register      | Registers users          |
| POST   | /api/users/login         | Login users (Issues JWT) |
| DELETE | /api/users/              | Delete user              |
| PUT    | /api/users/:id           | Update user :id          |
| GET    | /api/users/checkUsername | Checks username          |

## Answer

### Create

| Method | Path              | Description              |
| ------ | ----------------- | ------------------------ |
| POST   | /api/answers/:qid | Answer the question :qid |

### Update

| Method | Path             | Description                 |
| ------ | ---------------- | --------------------------- |
| PUT    | /api/answers/:id | updates the answer (oh boy) |

### Upvotes

| Method | Path                            | Description               |
| ------ | ------------------------------- | ------------------------- |
| POST   | /api/answers/upvote/:id/        | Upvotes answer :id        |
| POST   | /api/answers/undo/upvote/:id    | Undo Upvotes answer :id   |
| POST   | /api/answers/downvote/:id       | Downvote answer :id       |
| POST   | /api/answers/downvote/undo/:id/ | Undo Downvotes answer :id |

### Comments

| Method | Path                            | Description                            |
| ------ | ------------------------------- | -------------------------------------- |
| POST   | /api/answers/comments/:id       | Creates comment on the answer :id      |
| DELETE | /api/answers/:aid/comments/:cid | Delete comment :cid on the answer :aid |

## Comments

| Method | Path                     | Description                     |
| ------ | ------------------------ | ------------------------------- |
| POST   | /api/comments/upvote/:id | Upvotes comment on the post :id |

## Edits

| Method | Path                           | Description                                 |
| ------ | ------------------------------ | ------------------------------------------- |
| POST   | api/questions/edit/approve/:id | Approved edit with the delta (revision) :id |
| POST   | api/answers/edit/approve/:id   | Approved edit with the delta (revision) :id |

## Search

| Method | Path                                                 | Description                                                        |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------------ |
| GET    | /api/search/:query                                   | Search **everything**                                              |
| GET    | /api/search/:query?sort=votes\|views\|oldest\|newest | Search **everything** with sort parameter                          |
| GET    | /api/search/:query?limit=25&offset=50                | Limit returned **questions** to 25 and skip the first 50 questions |

# Notes

- React client needs some work
- It was put together in a couple of days just before submission date
- Its not fully finished yet
- Might work on it later
- Style over substance

# Thanks to

- MongoDB Atlas for free cluster
- Heroku for hosting
- The entire open source community. Without their code, none of this would be possible.

# By

Haider Ali Khichi
@candhforlife
