// src/components/PrivateRoute.js
import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function PrivateRoute({ component: Component, ...rest }) {
  const { accessToken } = useContext(AuthContext);
  return (
    <Route
      {...rest}
      render={props =>
        accessToken
          ? <Component {...props} />
          : <Redirect to="/login" />
      }
    />
  );
}
