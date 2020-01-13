import React from "react";
import QuestionPreview from "./QuestionPreview";
import Axios from "axios";
import PaginationQuestionFeed from "./PaginationQuestionFeed";
import urljoin from "url-join";

import Spinner from "./Loader";

class QuestionFeed extends React.Component {
  constructor(props) {
    super(props);
    props.match.params.page =
      Number(props.match.params.page ? props.match.params.page : 1) || 1;
    if (props.match.params.page <= 0) {
      props.match.params.page = 1;
    }
    // TOOD: if params.page is a string, redirect to /questions/1
    this.state = {
      curPage: props.match.params.page,
      limit: 10,
      data: [],
      noResults: false,
      url: ""
    };

    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);
  }

  buildUrl() {
    let base = "/api";
    // if q came in
    if (this.props.q) {
      base = urljoin(base, "/search", `?q=${this.props.q}`);
    } else {
      base = urljoin(base, "/questions");
    }
    if (this.props.limit) {
      base = urljoin(base, `?limit=${this.props.limit}`);
    }
    if (this.props.sort) {
      base = urljoin(base, `?sort=${this.props.sort}`);
    }
    if (this.props.order) {
      base = urljoin(base, `?order=${this.props.order}`);
    }
    if (this.state.curPage) {
      base = urljoin(
        base,
        `?skip=${(this.state.curPage - 1) * (this.props.limit || 10)}`
      );
    }

    return base;
  }

  getQuestions() {
    const url = this.buildUrl();
    console.log(url);
    Axios.get(url)
      .then(res => {
        if (res.data.length === 0) {
          this.setState({ noResults: true });
        }
        console.log(res.data);
        this.setState({ data: res.data });
      })
      .catch(err => {
        console.error(err.response);
        throw err;
      });
  }

  nextPage() {
    this.setState({ curPage: this.state.curPage + 1 }, state => {
      this.props.history.replace("/questions/" + this.state.curPage + "/");
      this.getQuestions();
    });
  }

  prevPage() {
    console.log("called");
    this.setState({ curPage: this.state.curPage - 1 }, state => {
      this.props.history.replace("/questions/" + this.state.curPage + "/");
      this.getQuestions();
    });
  }

  componentDidMount() {
    this.getQuestions();
  }

  // static async getDerivedStateFromProps(props, state) {
  //   console.log(props.match.params.page)
  //   props.match.params.page = Number(props.match.params.page ? props.match.params.page : 1) || 1
  //   if (props.match.params.page <= 0) {
  //     props.match.params.page = 1
  //   }
  //   state.curPage = props.match.params.page
  //   let base = '/api'
  //   // if q came in
  //   if (props.q) {
  //     base = urljoin(base, '/search', `?q=${props.q}`)
  //   } else {
  //     base = urljoin(base, '/questions')
  //   }
  //   if (props.limit) {
  //     base = urljoin(base, `?limit=${props.limit}`)
  //   }
  //   if (props.sort) {
  //     base = urljoin(base, `?sort=${props.sort}`)
  //   }
  //   if (props.order) {
  //     base = urljoin(base, `?order=${props.order}`)
  //   }
  //   if (state.curPage) {
  //     base = urljoin(base, `?skip=${(state.curPage - 1) * (props.limit || 10)}`)
  //   }

  //   state.url = base
  //   return state
  // }

  // static async getDerivedStateFromProps(props, state) {
  //   let base = '/api'
  //   // if q came in
  //   if (props.q) {
  //     base = urljoin(base, '/search', `?q=${props.q}`)
  //   } else {
  //     base = urljoin(base, '/questions')
  //   }
  //   if (props.limit) {
  //     base = urljoin(base, `?limit=${props.limit}`)
  //   }
  //   if (props.sort) {
  //     base = urljoin(base, `?sort=${props.sort}`)
  //   }
  //   if (props.order) {
  //     base = urljoin(base, `?order=${props.order}`)
  //   }
  //   if (state.curPage) {
  //     base = urljoin(base, `?skip=${(state.curPage - 1) * (props.limit || 10)}`)
  //   }

  //   state.url = base
  //   // const res = await Axios.get(base).catch(err => { throw err })
  //   if (res.data.length == 0) {
  //     state.noResults = true
  //   } else {
  //     state.data = res.data
  //   }

  //   console.log('here')
  //   console.log(state.url)
  //   return state
  // }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col mt-3 text-center">
            <h2>Questions</h2>
          </div>
        </div>
        {this.state.noResults && (
          <div className="row">
            <div className="col-md-12 my-3 text-center">
              <h3 className="text-secondary">no results found :(</h3>
            </div>
          </div>
        )}
        {!this.state.noResults && this.state.data.length === 0 && <Spinner />}
        {this.state.data &&
          this.state.data.map(v => (
            <QuestionPreview question={v} key={v._id} />
          ))}
        {this.state.data.length > 0 && (
          <div className="row">
            <div className="col-md-12 my-5">
              <PaginationQuestionFeed
                curPage={this.state.curPage}
                handleNextPage={this.nextPage}
                handlePrevPage={this.prevPage}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default QuestionFeed;
