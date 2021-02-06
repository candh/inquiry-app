import React from "react";
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import Navbar from "./components/Navbar";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import SignupForm from "./components/SignupForm";
import QuestionFeed from "./components/QuestionFeed";
import QuestionPage from "./components/QuestionPage";
import QuestionForm from "./components/QuestionForm";
import UserPage from "./components/UserPage/UserPage";
import SearchResults from "./components/SearchResults";
import QuestionEditForm from "./components/QuestionEditForm";
import AnswerEditForm from "./components/AnswerEditForm";
import auth_axios from "./utils/auth_axios";

class App extends React.Component {
  constructor(props) {
    super(props);

    // preserve state on login
    this.state = { loggedIn: localStorage.getItem("token") ? true : false };
    if (this.state.loggedIn) {
      // todo, fix better solution
      auth_axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
    }
    this.handleLoggedIn = this.handleLoggedIn.bind(this);
    this.handleLoggedOut = this.handleLoggedOut.bind(this);
  }

  handleLoggedIn() {
    this.setState({ loggedIn: true });

    // set the token
    auth_axios.defaults.headers.common["Authorization"] =
      "Bearer " + localStorage.getItem("token");
  }

  handleLoggedOut() {
    this.setState({ loggedIn: false });

    // remove the token
    auth_axios.defaults.headers.common["Authorization"] = null;
  }

  componentDidMount() {
    this.setState({ loggedIn: localStorage.getItem("token") ? true : false });
  }

  render() {
    return (
      <Router>
        <Route
          render={(props) => {
            return <Navbar {...props} loggedIn={this.state.loggedIn} />;
          }}
        />
        {/* todo, wrap these in a container and remove container
      from children as the root */}
        <Switch>
          <Route
            path="/login"
            render={(props) => {
              return this.state.loggedIn ? (
                <Redirect to="/questions" />
              ) : (
                <LoginForm {...props} whenLoggedIn={this.handleLoggedIn} />
              );
            }}
          />

          <Route
            path="/signup"
            render={(props) => {
              return this.state.loggedIn ? (
                <Redirect to="/questions" />
              ) : (
                <SignupForm {...props} />
              );
            }}
          />

          <Route
            path="/search"
            // render={(props) => <SearchResults {...props} key={Date.now()} />}
            render={(props) => <SearchResults {...props} />}
          />

          <Route
            path="/me"
            render={(props) => {
              return this.state.loggedIn ? (
                <UserPage
                  {...props}
                  isLoggedIn={this.state.loggedIn}
                  whenLoggedOut={this.handleLoggedOut}
                  id={localStorage.getItem("_id")}
                />
              ) : (
                <Redirect to="/questions" />
              );
            }}
          />

          <Route
            path="/users/:id"
            render={(props) => {
              return <UserPage id={props.match.params.id} />;
            }}
          />

          <Route path="/answers/edit/:id" component={AnswerEditForm} />
          <Route path="/questions/edit/:id" component={QuestionEditForm} />
          <Route path="/question/ask" component={QuestionForm} />
          <Route
            exact
            path="/questions/:page"
            render={(props) => (
              <QuestionFeed {...props} limit="10" sort="createdAt" />
            )}
          />
          <Route path="/questions">
            <Redirect to="/questions/1/" />
          </Route>

          <Route
            exact
            path="/question/:id"
            render={(props) => (
              <QuestionPage {...props} loggedIn={this.state.loggedIn} />
            )}
          />

          <Route
            path="/"
            render={(props) => {
              return this.state.loggedIn ? (
                <Redirect to="/questions" />
              ) : (
                <Home />
              );
            }}
          ></Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
