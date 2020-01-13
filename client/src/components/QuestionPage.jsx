import React from "react";
import Post from "./Post";
import Axios from "axios";
import AnswerForm from "./AnswerForm";
import Spinner from "./Loader";

class QuestionPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      question: {},
      answers: []
    };

    this.getQuestion = this.getQuestion.bind(this);
  }

  getQuestion() {
    Axios.get("/api/questions/" + this.props.match.params.id)
      .then(res => {
        if (res.data.length === 0) {
          this.props.history.push("/");
          return;
        }
        this.setState({
          question: res.data,
          answers: res.data.answers
        });
      })
      .catch(err => {
        throw err;
      });
  }

  componentDidMount() {
    this.getQuestion();
  }

  render() {
    console.log(this.state);
    return (
      <div className="container mb-5">
        {!this.state.question._id && <Spinner />}
        {this.state.question._id && (
          <Post
            question={true}
            {...this.state.question}
            {...this.props}
            loggedIn={this.props.loggedIn}
            refresh={this.getQuestion}
          />
        )}

        {this.state.question._id &&
          this.state.answers.length > 0 &&
          this.state.answers.map(v => {
            return (
              <Post
                key={v._id}
                qid={this.state.question._id}
                answer={true}
                {...v}
                {...this.props}
                loggedIn={this.props.loggedIn}
                refresh={this.getQuestion}
              />
            );
          })}
        {this.state.question._id && (
          <AnswerForm
            id={this.state.question._id}
            {...this.props}
            refresh={this.getQuestion}
          />
        )}
      </div>
    );
  }
}

export default QuestionPage;
