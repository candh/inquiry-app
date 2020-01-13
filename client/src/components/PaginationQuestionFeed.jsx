import React from "react";

class PaginationQuestionFeed extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <nav aria-label="Page navigation example">
        <ul className="pagination justify-content-center">
          <li
            className={`page-item ${
              this.props.curPage > 1 ? undefined : "disabled"
            }`}
            onClick={e => {
              if (this.props.curPage === 1) {
                return;
              }
              this.props.handlePrevPage();
            }}
          >
            <a className="page-link">Previous</a>
          </li>

          <li className="page-item active">
            <a className="page-link">{this.props.curPage}</a>
          </li>

          <li className="page-item" onClick={e => this.props.handleNextPage}>
            <a className="page-link">Next</a>
          </li>
        </ul>
      </nav>
    );
  }
}

export default PaginationQuestionFeed;
