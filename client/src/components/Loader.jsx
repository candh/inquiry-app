import React from 'react'
function Spinner() {
  return (
    <div className="row">
      <div className="col-md-12 text-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  )
}

export default Spinner