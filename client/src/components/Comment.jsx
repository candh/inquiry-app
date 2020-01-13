import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretUp,
  faCross,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import auth_axios from "../utils/auth_axios";

class Comment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {},
      checkUpvoteUrl: "/api/users/comments/upvote", // GET
      upvoteUrl: "/api/comments/upvote", // POST
      undoUpvoteUrl: "/api/comments/undo/upvote", // POST
      upvoted: false
    };
  }

  componentDidMount() {
    Axios.get("/api/users/" + this.props.user)
      .then(res => {
        this.setState({ user: res.data });
      })
      .catch(err => {
        throw err;
      });

    auth_axios
      .get(`${this.state.checkUpvoteUrl}/${this.props._id}`)
      .then(res => {
        if (res.data.length === 1) {
          this.setState({ upvoted: true });
        }
      })
      .catch(err => {
        console.error(err.response);
        throw err;
      });
  }

  upvote(e) {
    if (this.state.upvoted) {
      this.undoUpvote();
    } else {
      auth_axios
        .post(`${this.state.upvoteUrl}/${this.props._id}`)
        .then(res => {
          this.setState({ upvoted: true });
          this.props.refresh();
        })
        .catch(err => {
          console.error(err.response);
        });
    }
  }

  undoUpvote() {
    auth_axios
      .post(`${this.state.undoUpvoteUrl}/${this.props._id}`)
      .then(res => {
        console.log(res);
        this.setState({ upvoted: false });
        this.props.refresh();
      })
      .catch(err => {
        console.error(err.response);
      });
  }

  handleCommentDelete(e) {
    e.preventDefault();
    console.log(this.props);
    console.log(this.state);
    auth_axios
      .delete(`/api/comments/${this.props._id}`)
      .then(res => {
        console.log(res);
        this.props.refresh();
      })
      .catch(err => {
        console.error(err.response);
        throw err;
      });
  }

  render() {
    return (
      <div className="row">
        <div className="col col-md-8">
          <div className="d-flex align-items-center comment-wrapper border-bottom rounded bg-light py-1 px-3">
            <div className="d-inline-flex flex-column mr-2 text-center">
              <FontAwesomeIcon
                className={this.state.upvoted ? "text-primary" : undefined}
                icon={faCaretUp}
                onClick={e => this.upvote(e)}
              />
              <small className="text-secondary">{this.props.meta.votes}</small>
            </div>
            <p className="m-0 text-secondary">
              <small>
                <span className="comment-username">
                  <a href="#">{this.state.user.username}</a>&nbsp;
                </span>
                {this.props.body}
              </small>
            </p>
            {this.props.loggedIn &&
              localStorage.getItem("_id") === this.props.user && (
                <div className="ml-auto">
                  <FontAwesomeIcon
                    onClick={e => this.handleCommentDelete(e)}
                    className="text-danger"
                    size="sm"
                    icon={faTimesCircle}
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }
}

export default Comment;
