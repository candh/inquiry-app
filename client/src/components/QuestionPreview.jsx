import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVoteYea, faEye } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import voca from "voca";

class QuestionPreview extends React.Component {
  constructor(props) {
    super(props);
    this.question = this.props.question;
  }

  render() {
    return (
      <div className="row justify-content-center">
        <div className="col-md-9">
          <div className="card m-3">
            <div className="card-body">
              <div className="container">
                <div className="row">
                  <div className="col-2 d-none d-lg-block">
                    <div className="col text-center">
                      <button className="btn text-success font-weight-bold">
                        {this.question.votes}
                      </button>
                      <p className="m-0 mb-2 text-secondary">
                        <small>Votes</small>
                      </p>
                    </div>
                    <div className="col text-center">
                      <button className="btn text-primary font-weight-bold">
                        {this.question.answers.length}
                      </button>
                      <p className="m-0 mb-2 text-secondary">
                        <small>Answers</small>
                      </p>
                    </div>
                  </div>
                  <div className="col">
                    <h5 className="card-title">
                      <Link
                        to={"/question/" + this.question._id}
                        className="card-title stretched-link"
                      >
                        {this.question.title}
                      </Link>
                    </h5>
                    <p className="d-none d-md-block card-text">
                      {voca.prune(this.question.body, 120)}
                    </p>
                    <p className="tags m-0">
                      {this.question.tags.map((v, i) => (
                        <span className="badge badge-primary mr-1" key={i}>
                          {v}
                        </span>
                      ))}
                    </p>
                    <p className="d-none d-lg-block text-right m-0">
                      <small>
                        {" "}
                        <span className="text-secondary">
                          asked by &mdash;&nbsp;
                        </span>
                      </small>
                      <small>
                        <a href="#">{this.question.user.username}</a>
                      </small>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer d-block d-lg-none bg-white">
              <div className="container">
                <div className="row align-items-center">
                  <div className="d-block d-lg-none">
                    <div className="col">
                      <span className="text-success font-weight-bold mr-3">
                        <FontAwesomeIcon className="mr-2" icon={faVoteYea} />
                        {this.question.votes}
                      </span>
                      <span className="text-primary font-weight-bold">
                        <FontAwesomeIcon className="mr-2" icon={faEye} />
                        {this.question.views}
                      </span>
                    </div>
                  </div>
                  <div className="col">
                    <p className="text-right m-0">
                      <small>asked by &mdash; </small>
                      <small>
                        <a href="">{this.question.user.username}</a>
                      </small>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default QuestionPreview;
