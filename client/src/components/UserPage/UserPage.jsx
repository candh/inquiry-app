import React from "react";
import auth_axios from "../../utils/auth_axios";
import QuestionPreview from "../QuestionPreview";
import Axios from "axios";

class UserPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      answers: [],
      answersSelected: false,
      name: "",
      noAnswers: false,
      noQuestions: false,
      profile_pic: "https://i.pravatar.cc/40",
      questions: [],
      questionsSelected: true,
      user: {}
    };

    console.log(localStorage.getItem("token"));
    console.log(localStorage.getItem("_id"));
    console.log(auth_axios.defaults);
  }

  logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("_id");
    this.props.whenLoggedOut();
    // auth_axios = null
    this.props.history.push("/");
  }

  componentDidMount() {
    this.getUser();
    this.getAllQuestions();
    this.getAllAnswers();
  }

  getUser() {
    Axios.get(`/api/users/${this.props.id}`)
      .then(res => {
        this.setState({ user: res.data });
      })
      .catch(err => {
        console.error(err.response);
        throw err;
      });
  }

  getAllQuestions() {
    auth_axios
      .get(`/api/users/questions/all/${this.props.id}`)
      .then(res => {
        if (res.data.length === 0) {
          this.setState({ noQuestions: true });
          return;
        }
        this.setState({ questions: res.data });
      })
      .catch(err => {
        console.error(err.response);
        throw err;
      });
  }

  getAllAnswers() {
    auth_axios
      .get(`/api/users/answers/all/${this.props.id}`)
      .then(res => {
        if (res.data.length === 0) {
          this.setState({ noAnswers: true });
          return;
        }
        this.setState({ answers: res.data });
      })
      .catch(err => {
        console.error(err.response);
        throw err;
      });
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 mt-4 mb-2">
            <div className="text-center">
              <img
                className="user-profile-pic rounded-circle mb-3"
                width="100px"
                src="/default.jpg"
                alt=""
              />
              <h3>{this.state.user.username}</h3>
            </div>

            {this.props.isLoggedIn && // if logged in
            this.state.user && // if user object exits
            this.props.id == localStorage.getItem("_id") && ( // if its the same user as the one logged in
                <div className="col text-center justify-content-center">
                  <button
                    className="btn btn-danger"
                    onClick={e => this.logOut()}
                  >
                    Logout
                  </button>
                </div>
              )}
            <br />
            {/* implement asked questions and answers */}
          </div>
          <div className="col-md-12">
            <ul className="nav nav-tabs justify-content-center">
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    this.setState({
                      answersSelected: false,
                      questionsSelected: true
                    });
                  }}
                >
                  Questions
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    this.setState({
                      answersSelected: true,
                      questionsSelected: false
                    });
                  }}
                >
                  Answers
                </a>
              </li>
              {/* <li class="nav-item">
                <a class="nav-link" href="#">Link</a>
              </li>
              <li class="nav-item">
                <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
              </li> */}
            </ul>
          </div>
        </div>

        <div className="row justify-content-center">
          {this.state.questionsSelected ? (
            <div className="col">
              {this.state.noQuestions && (
                <div className="text-center p-3">
                  <h3 className="text-secondary">no questions yet..</h3>
                </div>
              )}
              {!this.state.noQuestions &&
                this.state.questions.map(v => (
                  <QuestionPreview key={v._id} question={v} />
                ))}
            </div>
          ) : (
            <div className="col">
              {this.state.noAnswers && (
                <div className="text-center p-3">
                  <h3 className="text-secondary">no answers yet..</h3>
                </div>
              )}
              {!this.state.noAnswers &&
                this.state.answers.map(v => (
                  <QuestionPreview key={v._id} question={v} />
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default UserPage;
