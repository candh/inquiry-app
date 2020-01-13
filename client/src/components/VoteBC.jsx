// VoteBC is VoteButtonsAndCount
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons'
import auth_axios from '../utils/auth_axios'

class VoteBC extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      urlUpvote: '/api/' + (this.props.question ? 'questions' : 'answers') + '/upvote',
      urlDownvote: '/api/' + (this.props.question ? 'questions' : 'answers') + '/downvote',
      checkUrlUpvote: '/api/users/' + (this.props.question ? 'questions' : 'answers') + '/upvote',
      checkUrlDownvote: '/api/users/' + (this.props.question ? 'questions' : 'answers') + '/downvote',
      upvoted: false,
      downvoted: false
    }
  }

  componentDidMount() {
    auth_axios.get(`${this.state.checkUrlUpvote}/${this.props.id}`)
      .then(res => {
        if (res.data.length > 0) {
          this.setState({ upvoted: true })
        }
      })
    auth_axios.get(`${this.state.checkUrlDownvote}/${this.props.id}`)
      .then(res => {
        if (res.data.length > 0) {
          this.setState({ downvoted: true })
        }
      })
  }

  upvote(e) {
    if (this.state.downvoted) {
      this.undoDownvote()
    }

    if (this.state.upvoted) {
      this.undoUpvote()
    } else {
      // upvote
      auth_axios.post(`${this.state.urlUpvote}/${this.props.id}`)
        .then(res => {
          console.log(res)
          this.setState({ upvoted: true })
          this.props.refresh()
        })
        .catch(err => {
          console.error(err.response)
          throw err
        })
    }
  }

  undoUpvote() {
    auth_axios.post(`${this.state.urlUpvote}/undo/${this.props.id}`)
      .then(res => {
        console.log(res)
        this.props.refresh()
        this.setState({ upvoted: false })
      })
      .catch(err => {
        console.error(err.response)
        throw err
      })
  }

  undoDownvote() {
    auth_axios.post(`${this.state.urlDownvote}/undo/${this.props.id}`)
      .then(res => {
        console.log(res)
        this.props.refresh()
        this.setState({ downvoted: false })
      })
      .catch(err => {
        console.error(err.response)
        throw err
      })

  }

  downvote() {
    if (this.state.upvoted) {
      this.undoUpvote()
    }

    if (this.state.downvoted) { this.undoDownvote() }
    else {
      auth_axios.post(`${this.state.urlDownvote}/${this.props.id}`)
        .then(res => {
          console.log(res)
          this.setState({ downvoted: true })
          this.props.refresh()
        })
        .catch(err => {
          throw err
        })
    }
  }

  render() {
    return (
      <div className="post-votes text-center mr-4">
        <button className={"btn m-0 p-0 " + (this.state.upvoted ? 'text-primary' : undefined)} onClick={e => this.upvote(e)}> <FontAwesomeIcon icon={faCaretUp} size="3x" /></button>

        <p className="m-0 post-vote-count font-weight-bold">{this.props.votes}</p>
        <button className={"btn m-0 p-0 " + (this.state.downvoted ? 'text-primary' : undefined)} onClick={e => this.downvote(e)}> <FontAwesomeIcon icon={faCaretDown} size="3x" /></button>
      </div>
    )
  }
}

export default VoteBC