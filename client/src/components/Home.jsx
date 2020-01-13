import React from "react";
import { Link } from "react-router-dom";

import "./Home.css";
// import jumbotronImg from '/jumobotron.webp'

class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section id="home-page">
        {/* jumbotron */}
        <div className="jumbotron jumbotron-fluid bg-white" id="home-jumbotron">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-5 mt-sm-0">
                <h1>inquiry</h1>
                <p className="lead">expert answers to all your questions.</p>
                <div className="mx-auto">
                  <Link
                    to="/login"
                    className="btn btn-lg btn-xs-block btn-block btn-outline-primary"
                    role="button"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-lg btn-xs-block btn-block btn-primary"
                    role="button"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
              <div className="col-md-5 text-center mt-md-0 mt-5">
                <img
                  width="83%"
                  className="img-fluid shadow"
                  src="/jumbotron.jpg"
                  alt=""
                />
              </div>
            </div>
          </div>
          {/* <div className="container">
            <div className="row text-center mt-5">
              <div className="col">
                <h2 className="font-weight-light">for humans, by humans</h2>
              </div>
            </div>
            <div className="row text-center">
              <div className="col-md-4">
                <p>this is nice</p>
              </div>
              <div className="col-md-4">
                <p>this is nice</p>
              </div>
              <div className="col-md-4">
                <p>this is nice</p>
              </div>
            </div>
          </div> */}
        </div>
      </section>
    );
  }
}

export default Home;
