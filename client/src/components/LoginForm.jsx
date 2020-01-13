import React from "react";
import axios from "axios";

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      errorMessages: [],
      successMessages: []
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    // log in
    axios
      .post("/api/users/login", {
        email: this.state.email,
        pswd: this.state.password
      })
      .then(res => {
        // clear errors
        this.setState({ errorMessages: [] });
        this.setState({ successMessages: ["Logged In. Redirecting..."] });
        // store token in the browser
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("_id", res.data._id); // also push user _id

        setTimeout(() => {
          // tell parent that user loggedIn
          this.props.whenLoggedIn();
          // go to the questions page
          this.props.history.push("/questions/1");
        }, 1000);
      })
      .catch(err => {
        if (err.response && Array.isArray(err.response.data.messages)) {
          const msgs = err.response.data.messages.map(v => v.msg);
          this.setState({ errorMessages: msgs });
        }
        throw err;
      });
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  render() {
    return (
      <div className="container">
        <div className="row w-100 mt-3 mb-sm-5"></div>
        <div className="row justify-content-center">
          <div className="col-md-5">
            {/* random quote module? */}
            <blockquote className="blockquote mt-3 mb-3">
              <p className="mb-0">A prudent question is one-half of wisdom</p>
              <footer className="blockquote-footer">
                <cite title="Source Title">Francis Bacon</cite>
              </footer>
            </blockquote>
          </div>
          <div className="col-md-4 bg-light p-4 pb-5 p-md-5 border rounded shadow m-4 m-md-0">
            <form onSubmit={e => this.handleSubmit(e)}>
              <h3 className="text-center mb-4 font-weight-light">Login</h3>
              {this.state.errorMessages.length > 0 && (
                <div className="form-group">
                  <div className="text-white bg-danger border-danger rounded p-2">
                    <ul className="m-0">
                      {this.state.errorMessages.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {this.state.successMessages.length > 0 && (
                <div className="form-group">
                  <div className="text-white bg-success border-success rounded p-2">
                    <ul className="m-0">
                      {this.state.successMessages.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="exampleInputEmail1">Email address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  id="exampleInputEmail1"
                  placeholder="Enter email"
                  onChange={e => this.handleChange(e)}
                  value={this.state.email}
                />
              </div>
              <div className="form-group">
                <label htmlFor="exampleInputPassword1">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  id="exampleInputPassword1"
                  placeholder="Password"
                  onChange={e => this.handleChange(e)}
                  value={this.state.password}
                />
              </div>
              <p>
                <small className="form-text text-muted">
                  By logging in you indicate that you have read and agree to
                  inquiry's Terms of Service and Privacy Policy.
                </small>
              </p>
              <button type="submit" className="btn btn-primary btn-block">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginForm;
