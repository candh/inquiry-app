import React from 'react';
import auth_axios from '../utils/auth_axios';
class AnswerForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      body: '',
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    this.submitAnswer();
    console.log(this.state);
  }

  handleBodyChange(e) {
    this.setState({body: e.target.value});
  }

  submitAnswer() {
    auth_axios
      .post(`/api/answers/${this.props.id}`, {
        body: this.state.body,
      })
      .then(res => {
        this.setState({body: ''});
        this.props.refresh();
      })
      .catch(err => {
        console.log(err.response);
        throw err;
      });
  }

  render() {
    return (
      <div className="col-md-8">
        <h3>Have an answer?</h3>
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
              value={this.state.body}></textarea>
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

export default AnswerForm;
