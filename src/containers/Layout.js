import React, { Fragment, useEffect, useState } from "react";
import { Container, Menu } from "semantic-ui-react";
import { Link, withRouter } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/actions/auth";

const CustomLayout = (props) => {
  const dispatch = useDispatch();
  const [user, setUser] = useState();
  const auth = useSelector((state) => state.auth);
  const isAuth = auth.token !== null;
  let userData = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (isAuth) {
      setUser(userData.username);
    }
  }, [isAuth, userData]);
  return (
    <div>
      <Menu fixed="top" inverted>
        <Container>
          <Link to="/">
            <Menu.Item header>Home</Menu.Item>
          </Link>
          {isAuth ? (
            <Fragment>
              <Menu.Item header>Welcome {user}</Menu.Item>
              <Menu.Item header onClick={() => dispatch(logout())}>
                Logout
              </Menu.Item>
            </Fragment>
          ) : (
            <React.Fragment>
              <Link to="/login">
                <Menu.Item header>Login</Menu.Item>
              </Link>
              <Link to="/signup">
                <Menu.Item header>Signup</Menu.Item>
              </Link>
            </React.Fragment>
          )}
        </Container>
      </Menu>

      {props.children}
    </div>
  );
};

export default withRouter(CustomLayout);
