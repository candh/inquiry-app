import React from "react";

class NavbarUserInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="ml-3">
        <img
          width="40px"
          src="/default.jpg"
          className="rounded-circle"
          alt=""
        />
      </div>
    );
  }
}

export default NavbarUserInfo;
