// App.jsx
import React, { useContext } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SignIn from './pages/AuthPages/SignIn';
import SignUp from './pages/AuthPages/SignUp';
import ResetPassword from './pages/AuthPages/ResetPassword';
import ForgetPassword from './pages/AuthPages/ForgetPassword';
import NotFound from './pages/OtherPage/NotFound';

import AppLayout from './layout/AppLayout';
import Home from './pages/Dashboard/Home';
import UserProfiles from './pages/RegistrationAndProfile/UserProfiles';
import Calendar from './pages/Calendar';

import UserApprovalTable from './pages/Exhibitor Management/UserApprovalTable';
import UserApplicationApprovalPage from './pages/Exhibitor Management/UserApplicationApprovalPage';

import AddExpoPage from './pages/ExpoManagement/AddExpoPage';
import EditDeleteExpoPage from './pages/ExpoManagement/EditDeletePage';
import UpdateExpoPage from './pages/ExpoManagement/UpdateExpoPage';
import AddEventPage from './pages/ExpoManagement/AddEventPage';
import EditDeleteEventPage from './pages/ExpoManagement/EditDeleteEvent';
import UpdateEventPage from './pages/ExpoManagement/UpdateEvent';

import ShowEvents from './pages/RegistrationAndProfile/showEvents';
import RegisterEventsPage from './pages/RegistrationAndProfile/registerEvents';
import RegisteredEventsPage from './pages/RegistrationAndProfile/RegisterEventPage';
import UpdateRegisteredEventsPage from './pages/RegistrationAndProfile/UpdateRegisteredEventPage';
import ShowEventWithBoothPage from './pages/RegistrationAndProfile/ShowEventWithBoothPage';

import ChatBox from './pages/Chat/ChatBox';
import AddSchedulePage from './pages/Schedule/AddSchedule';
import DisplaySchedulePage from './pages/Schedule/DisplaySchedule';
import UpdateSchedulePage from './pages/Schedule/UpdateSchedule';

import HomePage from './pages/AttendeeInterface/HomePage';
import RoleRedirect from './pages/OtherPage/RoleRedirect';

import { userContext } from './context/UserContext';

// ✅ Route Guards
function ProtectedRoute({ children }) {
  const { user } = useContext(userContext);
  if (!user) return <Navigate to="/signin" replace />;
  if (user.CurrentStatus !== "approved" && user.role !== "attendees") {
    return <Navigate to="/signin" replace />;
  }
  return children;
}

function OrganizerRoute({ children }) {
  const { user } = useContext(userContext);
  return user?.role === "organizer" ? children : <Navigate to="/" replace />;
}

function ExhibitorRoute({ children }) {
  const { user } = useContext(userContext);
  return user?.role === "exhibitors" ? children : <Navigate to="/" replace />;
}

function OrganizerOrExhibitorRoute({ children }) {
  const { user } = useContext(userContext);
  return (user?.role === "organizer" || user?.role === "exhibitors") ? children : <Navigate to="/" replace />;
}

function AttendeeRoute({ children }) {
  const { user } = useContext(userContext);
  return user?.role === "attendees" ? children : <Navigate to="/" replace />;
}

// ✅ Router Setup
const router = createBrowserRouter([
  { path: '/signin', element: <SignIn /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/forgetpassword', element: <ForgetPassword /> },
  { path: '/resetpassword/:token', element: <ResetPassword /> },

  // ✅ Role redirect for "/"
  { path: '/', element: <RoleRedirect /> },

  // ✅ Attendee Interface
  {
    path: '/attendeeInterface',
    element: (
      <AttendeeRoute>
        <HomePage />
      </AttendeeRoute>
    )
  },

  // ✅ AppLayout-wrapped protected routes (no /dashboard prefix)
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/home', element: <OrganizerOrExhibitorRoute><Home /></OrganizerOrExhibitorRoute> },
      { path: '/add-expo', element: <OrganizerRoute><AddExpoPage /></OrganizerRoute> },
      { path: '/eddel-expo', element: <OrganizerRoute><EditDeleteExpoPage /></OrganizerRoute> },
      { path: '/update-expo/:id', element: <OrganizerRoute><UpdateExpoPage /></OrganizerRoute> },
      { path: '/add-event', element: <OrganizerRoute><AddEventPage /></OrganizerRoute> },
      { path: '/display-event', element: <OrganizerRoute><EditDeleteEventPage /></OrganizerRoute> },
      { path: '/update-event/:id', element: <OrganizerRoute><UpdateEventPage /></OrganizerRoute> },
      { path: '/user-approval', element: <OrganizerRoute><UserApprovalTable /></OrganizerRoute> },
      { path: '/user-application', element: <OrganizerRoute><UserApplicationApprovalPage /></OrganizerRoute> },
      { path: '/addschedule', element: <OrganizerRoute><AddSchedulePage /></OrganizerRoute> },
      { path: '/display-schedule', element: <OrganizerRoute><DisplaySchedulePage /></OrganizerRoute> },
      { path: '/update-schedule/:id', element: <OrganizerRoute><UpdateSchedulePage /></OrganizerRoute> },

      { path: '/profile', element: <ExhibitorRoute><UserProfiles /></ExhibitorRoute> },
      { path: '/eventdisplay', element: <ExhibitorRoute><ShowEvents /></ExhibitorRoute> },
      { path: '/registerevent/:id', element: <ExhibitorRoute><RegisterEventsPage /></ExhibitorRoute> },
      { path: '/registeredevents', element: <ExhibitorRoute><RegisteredEventsPage /></ExhibitorRoute> },

      { path: '/eventwithboothdisplay', element: <OrganizerOrExhibitorRoute><ShowEventWithBoothPage /></OrganizerOrExhibitorRoute> },
      { path: '/updateregisteredevents/:id', element: <OrganizerOrExhibitorRoute><UpdateRegisteredEventsPage /></OrganizerOrExhibitorRoute> },
      { path: '/chatbox', element: <OrganizerOrExhibitorRoute><ChatBox /></OrganizerOrExhibitorRoute> },

      // Optional pages
      { path: '/calendar', element: <Calendar /> },
    ]
  },

  // 404 fallback
  { path: '*', element: <NotFound /> }
]);

function App() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        style={{ marginTop: '70px', zIndex: 99999999, position: 'fixed' }}
      />
    </div>
  );
}

export default App;
