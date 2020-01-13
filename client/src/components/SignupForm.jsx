import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion, faAward, faSearch, faEdit, faUserShield } from '@fortawesome/free-solid-svg-icons'
import Axios from 'axios'

class SignupForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      firstname: "",
      lastname: "",
      username: "",
      email: "",
      password: "",
      errorMessages: [],
      successMessages: []
    }
  }

  handleSubmit(e) {
    e.preventDefault()
    Axios.post('/api/users/register', {
      firstname: this.state.firstname,
      lastname: this.state.lastname,
      username: this.state.username,
      email: this.state.email,
      pswd: this.state.password
    })
      .then(res => {
        this.setState({ errorMessages: [] })
        this.setState({ successMessages: ["User Successfully Created. Redirecting..."] })
        setTimeout(() => {
          // go to login page
          this.props.history.push("/login")
        }, 1000)
      })
      .catch(err => {
        if (err.response && Array.isArray(err.response.data.messages)) {
          const msgs = err.response.data.messages.map(v => v.msg)
          this.setState({ errorMessages: msgs })
        }
        throw err
      })
    console.log(this.state)
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    return (
      <div className="container">
        <div className="row w-100 mt-3 mb-sm-5"></div>
        <div className="row justify-content-center">
          <div className="order-2 order-md-1 col-md-4 bg-light pb-5 p-4 border shadow rounded m-4 m-md-0 mb-md-5">
            <form onSubmit={e => this.handleSubmit(e)}>
              <h3 className="text-center mb-4 font-weight-light">Sign Up</h3>
              {this.state.errorMessages.length > 0 &&
                <div className="form-group">
                  <div className="text-white bg-danger border-danger rounded p-2">
                    <ul className="m-0">
                      {this.state.errorMessages.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                </div>
              }
              {this.state.successMessages.length > 0 &&
                <div className="form-group">
                  <div className="text-white bg-success border-success rounded p-2">
                    <ul className="m-0">
                      {this.state.successMessages.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                </div>
              }
              <div className="form-group">
                <div className="form-row">
                  <div className="col">
                    <label htmlFor="firstname">First Name</label>
                    <input className="form-control" name="firstname" onChange={e => this.handleChange(e)} type="text" id="firstname" placeholder="" />
                  </div>
                  <div className="col">
                    <label htmlFor="lastname">Last Name</label>
                    <input className="form-control" name="lastname" onChange={e => this.handleChange(e)} type="text" id="lastname" placeholder="" />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input className="form-control" type="text" name="username" onChange={e => this.handleChange(e)} id="username" placeholder="username" />
              </div>
              <div className="form-group">
                <label htmlFor="exampleInputEmail1">Email address</label>
                <input type="email" className="form-control" name="email" onChange={e => this.handleChange(e)} id="exampleInputEmail1" placeholder="Enter email" />
              </div>
              <div className="form-group">
                <label htmlFor="exampleInputPassword1">Password</label>
                <input type="password" className="form-control" name="password" onChange={e => this.handleChange(e)} id="exampleInputPassword1" placeholder="Password" />
              </div>
              <p>
                <small className="form-text text-muted">
                  By signing up you indicate that you have read and agree to inquiry's Terms of Service and Privacy Policy.
              </small>
              </p>
              {/* <div class="form-check">
                <input type="checkbox" class="form-check-input" id="exampleCheck1" />
                <label class="form-check-label" for="exampleCheck1">Check me out</label>
              </div> */}
              <button type="submit" className="btn btn-primary btn-block">Sign Up</button>
            </form>
          </div>

          <div className="order-1 order-md-2 col-md-4 mt-3 ml-5">
            <h3 className="font-weight-light">Welcome to inquiry's communitity</h3>
            <br />
            <p><FontAwesomeIcon icon={faQuestion} className="mr-3" /><span className="text-secondary">Stuck? Ask a question!</span></p>
            <p><FontAwesomeIcon icon={faAward} className="mr-3" /><span className="text-secondary">Earn points and reputation</span></p>
            <p><FontAwesomeIcon icon={faSearch} className="mr-3" /><span className="text-secondary">Search questions</span></p>
            <p><FontAwesomeIcon icon={faEdit} className="mr-3" /><span className="text-secondary">Suggest edit to posts</span></p>
            <p><FontAwesomeIcon icon={faUserShield} className="mr-3" /><span className="text-secondary">Protected by attentive moderators</span></p>
          </div>
        </div>
      </div>
    )
  }
}

export default SignupForm