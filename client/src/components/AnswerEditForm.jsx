import React from "react";
import Axios from "axios";
import auth_axios from "../utils/auth_axios";
class AnswerEditForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.match.params.id,
      qid: "",
      body: ""
    };
  }

  componentDidMount() {
    Axios.get(`/api/answers/${this.state.id}`)
      .then(res => {
        if (res.data) {
          const [answer] = res.data.answers;
          this.setState({
            qid: res.data._id,
            body: answer.body
          });
        }
      })
      .catch(err => {
        console.error(err.response);
        throw err;
      });
  }

  handleSubmit(e) {
    e.preventDefault();
    auth_axios
      .put(`/api/answers/${this.state.id}`, {
        body: this.state.body
      })
      .then(res => {
        console.log(res);
        this.props.history.push(`/question/${this.state.qid}`);
      })
      .catch(err => {
        console.error(err.response);
        throw err;
      });
  }

  handleBodyChange(e) {
    e.preventDefault();
    this.setState({
      body: e.target.value
    });
  }

  render() {
    return (
      <div className="col-md-8 my-4">
        <h3>Have second thoughts?</h3>
        <p>
          <small>Make sure to be as clear and friendly as possible</small>
        </p>
        <form onSubmit={e => this.handleSubmit(e)}>
          <div className="form-group">
            <textarea
              name="body"
              rows="5"
              className="form-control"
              onChange={e => this.handleBodyChange(e)}
              value={this.state.body}
            ></textarea>
            <small id="bodyHelp" className="form-text text-muted">
              Make sure the answer is based on facts
            </small>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default AnswerEditForm;
