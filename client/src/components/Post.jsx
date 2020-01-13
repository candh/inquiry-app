import React from "react";
import Comment from "./Comment";
import VoteBC from "./VoteBC";
import { Link } from "react-router-dom";
import auth_axios from "../utils/auth_axios";

class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clickedAddComment: false,
      comment: "" // probably should make another component for CommentForm
      // user: props.question ? props.user : {} // user that created the post is in the state
    };
  }

  handleDeleteAnswer(e) {
    e.preventDefault();
    auth_axios
      .delete(`/api/answers/${this.props.qid}/${this.props._id}`)
      .then(res => {
        this.props.refresh();
      })
      .catch(err => {
        console.error(err.response);
        throw err;
      });
  }

  handleDeleteQuestion(e) {
    e.preventDefault();
    auth_axios
      .delete(`/api/questions/${this.props._id}`)
      .then(res => {
        this.props.history.push("/");
        return;
      })
      .catch(err => {
        console.error(err.response);
        throw err;
      });
  }

  handleAddCommentSubmit(e) {
    e.preventDefault();
    auth_axios
      .post(
        `/api/${this.props.question ? "questions" : "answers"}/comments/${
          this.props._id
        }`,
        {
          body: this.state.comment
        }
      )
      .then(res => {
        this.setState({
          comment: "",
          clickedAddComment: false
        });

        this.props.refresh();
      })
      .catch(err => {
        console.error(err.response);
        throw err;
      });
  }

  handleCommentChange(e) {
    this.setState({ comment: e.target.value });
  }

  onClickAddComment(e) {
    e.preventDefault();
    this.setState({ clickedAddComment: true });
  }

  render() {
    return (
      <>
        <div className="row">
          <div className="col col-md-8 mt-2">
            {this.props.question && (
              <>
                <div className="votes-title-wrapper d-flex align-items-center">
                  <VoteBC
                    id={this.props._id}
                    question={true}
                    refresh={this.props.refresh}
                    votes={this.props.votes}
                  />
                  <div className="question-title">
                    <h3>{this.props.title}</h3>
                  </div>
                </div>
              </>
            )}

            <div className="post-stats">
              {this.props.question && (
                <>
                  <small>
                    <span className="font-weight-bold">Asked:</span>&nbsp;
                    <span className="asked-time-stats">
                      {new Date(this.props.createdAt).toLocaleString()}
                    </span>
                  </small>
                  &nbsp; &mdash; &nbsp;
                  <small>
                    <span className="font-weight-bold">Viewed:</span>&nbsp;
                    <span className="view-count-stats">{this.props.views}</span>
                    &nbsp;times
                  </small>
                </>
              )}
            </div>

            <hr />
            <div className="post-vote-container">
              <div className="post-vote-wrapper d-flex">
                {!this.props.question && (
                  <div className="answer-votes">
                    <VoteBC
                      id={this.props._id}
                      answer={true}
                      refresh={this.props.refresh}
                      votes={this.props.votes}
                    />
                  </div>
                )}

                <div
                  className={`post-body overflow-auto ${
                    this.props.question ? "mt-3" : undefined
                  }`}
                >
                  {this.props.body}
                  {/*
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem adipisci excepturi quas ratione reprehenderit nam corrupti facilis sapiente ab praesentium magni velit architecto pariatur porro, nihil perferendis ipsa dolor natus!
                </p>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt dolor accusamus, a quos voluptates reiciendis voluptatibus ullam optio repellendus culpa modi neque quaerat omnis itaque! Suscipit dignissimos saepe veritatis ipsa.
                </p>
                  <code><pre className="bg-light px-4">{`
it('My Test', () => {
  let wrapper: ReactWrapper;
  wrapper = mount(<App />);
  expect(wrapper.find(App)).toMatchSnapshot();
});
              `}</pre></code> */}
                </div>
              </div>
            </div>

            <hr />

            {this.props.question && (
              <div className="question-tags">
                {this.props.tags.map((v, i) => {
                  return (
                    <span className="badge badge-primary mr-1" key={i}>
                      {v}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="media border rounded px-3 py-2 mb-2 float-right align-items-center">
              <img
                src="/default.jpg"
                width="42px"
                className="img-thumbnail  rounded-circle"
                alt=""
              />
              <div className="media-body text-left ml-2">
                <p className="m-0">
                  <small>
                    <span className="font-weight-bold">
                      <Link
                        to={
                          this.props.user._id === localStorage.getItem("_id")
                            ? "/me"
                            : `/users/${this.props.user._id}`
                        }
                      >
                        {this.props.user.username}
                      </Link>
                    </span>
                  </small>
                </p>
                <p className="m-0 p-0"></p>
              </div>
            </div>

            <div className="clearfix"></div>
            <div className="text-right m-0">
              <p className="m-0 p-0">
                {this.props.question &&
                  this.props.loggedIn &&
                  localStorage.getItem("_id") === this.props.user._id && (
                    <>
                      <a
                        className="text-danger"
                        href=""
                        onClick={e => this.handleDeleteQuestion(e)}
                      >
                        <small>delete question</small>
                      </a>
                      <small>&nbsp; / &nbsp;</small>
                      <Link
                        className="text-secondary"
                        to={`/questions/edit/${this.props._id}`}
                      >
                        <small>edit question</small>
                      </Link>
                    </>
                  )}
              </p>
              <p className="m-0 p-0">
                {this.props.answer &&
                  this.props.loggedIn &&
                  localStorage.getItem("_id") === this.props.user._id && (
                    <>
                      <a
                        className="text-danger"
                        href=""
                        onClick={e => this.handleDeleteAnswer(e)}
                      >
                        <small>delete answer</small>
                      </a>
                      <small>&nbsp; / &nbsp;</small>
                      <Link
                        className="text-secondary"
                        to={`/answers/edit/${this.props._id}`}
                      >
                        <small>edit answer</small>
                      </Link>
                    </>
                  )}
              </p>
            </div>
          </div>
        </div>

        {/* Comments associated with that POST */}
        {this.props.comments.map(v => (
          <Comment
            key={v._id}
            {...v}
            loggedIn={this.props.loggedIn}
            refresh={this.props.refresh}
          />
        ))}
        {this.props.loggedIn && (
          <div className="row">
            <div className="col-md-8 py-2 px-3">
              {this.state.clickedAddComment ? (
                <form onSubmit={e => this.handleAddCommentSubmit(e)}>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="commentInput"
                      placeholder="enter your comment"
                      onChange={e => this.handleCommentChange(e)}
                    />
                  </div>
                </form>
              ) : (
                <div className="text-right">
                  <a href="" onClick={e => this.onClickAddComment(e)}>
                    add comment
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Some space */}
        <div className="row">
          <div className="col-md-8">
            <br />
            <hr />
            <br />
          </div>
        </div>
      </>
    );
  }
}

export default Post;
