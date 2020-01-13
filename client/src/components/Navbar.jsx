import React from 'react'
import { Link } from 'react-router-dom'
import NavbarUserInfo from './NavbarUserInfo/NavbarUserInfo';

class Navbar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      search: ""
    }
  }

  handleSearchChange(e) {
    this.setState({ search: e.target.value })
  }

  handleSearchSubmit(e) {
    e.preventDefault()
    // console.log('this.state.search', this.state.search)
    this.props.history.push(`/search?q=${this.state.search}`)
  }

  render() {
    return (
      <nav className="navbar shadow navbar-expand-lg navbar-dark bg-dark mb-2 mb-md-4 align-items-center">
        <Link to="/" className="navbar-brand h1 mb-0">inquiry</Link>
        {/* <button className="navbar-toggler" type="button" data-toggle="collapse" data-targett"#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button> */}

        {/* <div className="collapse navbar-collapse" id="navbarSupportedContent"> */}
        {/* <ul className="navbar-nav mr-5 ">
            <li className="nav-item active">
              <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Link</a> </li>
          </ul> */}
        <form className="ml-auto w-50" onSubmit={e => this.handleSearchSubmit(e)}>
          <input className="form-control border-dark" type="search" placeholder="Search" aria-label="Search" value={this.state.search} onChange={e => this.handleSearchChange(e)} />
          {/* <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button> */}
        </form>
        {this.props.loggedIn ? <Link to='/me'><NavbarUserInfo /></Link> :
          (<div className="ml-3">
            <Link to="/login" className="btn btn-secondary" role="button">Login</Link>
          </div>)
        }
        {this.props.loggedIn &&
          (<div className="ml-3">
            <Link to="/question/ask" className="btn btn-primary" role="button">Ask Question</Link>
          </div>)

        }
      </nav >
    );
  }
}

export default Navbar;