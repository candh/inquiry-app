import React from 'react'
import QuestionFeed from './QuestionFeed'
import qs from 'query-string'

class SearchResults extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      q: ''
    }
  }

  // componentWillReceiveProps() {
  // }

  // componentWillReceiveProps() {
  //   console.log(this.props.location)
  //   const parsed = qs.parse(this.props.location.search)
  //   this.setState({ q: parsed.q })
  //   console.log(parsed)
  // }

  // componentWillReceiveProps() {
  //   this.forceUpdate()
  // }

  // componentWillUpdate() {
  //   const parsed = qs.parse(this.props.location.search)
  //   this.setState({ q: parsed.q })

  // }

  static getDerivedStateFromProps(props, state) {
    const parsed = qs.parse(props.location.search)
    state.q = parsed.q
    return state
  }

  render() {
    return <QuestionFeed q={this.state.q} {...this.props} ></QuestionFeed>
  }
}

export default SearchResults