import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useUser } from 'reactfire';

const Homepage = lazy(() => import('./homepage'));
const Signup = lazy(() => import('./sign-up'));
const Login = lazy(() => import('./login'));
const NoMatch = lazy(() => import('./no-match'));

const AuthRoute = (props) => {
  const user = useUser();

  return user ? <Route {...props} /> : <Navigate to="/" />;
};

const UnauthRoute = (props) => {
  const user = useUser();

  return !user ? <Route {...props} /> : <Navigate to="/" />;
};

export default () => (
  <Routes>
    <Route path="/" element={<Homepage />} />
    <UnauthRoute path="signup" element={<Signup />} />
    <UnauthRoute path="login" element={<Login />} />
    <Route path="*" element={<NoMatch />} />
  </Routes>
);
