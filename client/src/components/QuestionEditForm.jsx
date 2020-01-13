import React from 'react'
import Axios from 'axios'
import auth_axios from '../utils/auth_axios'

class QuestionEditForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      _id: this.props.match.params.id,
      title: "",
      body: "",
      tags: [],
      category: ""
    }
  }

  componentDidMount() {
    Axios.get(`/api/questions/${this.state._id}`)
      .then(res => {
        this.setState({
          title: res.data.title,
          body: res.data.body,
          tags: res.data.tags.join(', '),
          category: res.data.category,
        })
      })
      .catch(err => {
        console.error(err.response)
        throw err
      })
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSubmit(e) {
    e.preventDefault()
    let tags
    if (typeof this.state.tags.valueOf() === "string") {
      tags = this.state.tags.split(',')
      tags = tags.map(v => v.trim())
      if (tags.length > 5) {
        // todo: show error
      }

      auth_axios.put(`/api/questions/${this.state._id}`, {
        title: this.state.title,
        body: this.state.body,
        tags: tags,
        category: this.state.category
      })
        .then(res => {
          this.props.history.push(`/question/${this.state._id}`)
        })
        .catch(err => {
          console.error(err.response)
          throw err
        })
    }
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-8 mt-2 mb-5">
            <h3>Edit a question</h3>
            <p>Editing a question on inquiry is very simple. Make sure to be as clear and friendly as possible</p>
            <br />
            <form onSubmit={e => this.handleSubmit(e)}>
              <div className="form-group">
                <label htmlFor="inputTitle">Title</label>
                <input value={this.state.title} type="text" name="title" className="form-control" id="inputTitle" aria-describedby="titleHelp" placeholder="e.g. what is the ideal season to grow tomatoes" onChange={e => this.handleChange(e)} />
                <small id="titleHelp" className="form-text text-muted">Make your title as helpful and brief as possible</small>
              </div>
              <div className="form-group">
                <label htmlFor="inputBody">Body</label>
                <textarea value={this.state.body} name="body" onChange={e => this.handleChange(e)} className="form-control" id="inputBody" aria-describedby="bodyHelp" rows="6"></textarea>
                <small id="bodyHelp" className="form-text text-muted">Include all the information someone would need to answer your question</small>
              </div>
              <div className="form-group">
                <div className="form-row">
                  <div className="col-md-6">
                    <label htmlFor="inputTags">Tags</label>
                    <input value={this.state.tags} type="text" className="form-control" id="inputTags" aria-describedby="tagsHelp" name="tags" onChange={e => this.handleChange(e)} placeholder="e.g. node.js, api, database" />
                    <small id="tagsHelp" className="mb-3 mb-md-0 form-text text-muted">Add up to 5 comma-seperated tags to describe what your question is about</small>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="inputCategory">Category</label>
                    <input value={this.state.category} type="text" className="form-control" id="inputTags" aria-describedby="categoryHelp" name="category" onChange={e => this.handleChange(e)} placeholder="e.g. Programming" />
                    <small id="tagsHelp" className="form-text text-muted">Enter a category that best describes your question</small>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Submit Changes</button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default QuestionEditForm