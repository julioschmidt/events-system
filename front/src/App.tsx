import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './pages/Login';
import EventList from './pages/EventList';
import CheckinForm from './components/CheckinForm';
import Admin from './pages/Admin';
import EventDetailsAdmin from './pages/EventDetailsAdmin';
import EventDetails from './pages/EventDetails';
import Home from './pages/Home';
import UserRegistrations from './pages/UserRegistrations';
import UserCheckins from './pages/UserCheckins';
import ValidateCertificate from './pages/ValidateCertificate';

// Simulação de autenticação
const isAuthenticated = () => {
  return !!localStorage.getItem('token'); // Verifica se existe um token no localStorage
};

// Rota protegida
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />
        <Route
          path="/events"
          element={
            <PrivateRoute>
              <EventList />
            </PrivateRoute>
          }
        />
        <Route
          path="/events/details/:id"
          element={
            <PrivateRoute>
              <EventDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/events/details/:id/admin"
          element={
            <PrivateRoute>
              <EventDetailsAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkin/:eventId"
          element={
            <PrivateRoute>
              <CheckinForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-registrations"
          element={
            <PrivateRoute>
              <UserRegistrations />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-checkins"
          element={
            <PrivateRoute>
              <UserCheckins />
            </PrivateRoute>
          }
        />
        <Route
          path="/validate-certificate/:certificadoCode"
          element={
            <PrivateRoute>
              <ValidateCertificate />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
