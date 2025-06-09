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
import Blank from './pages/Blank';
import FormElements from './pages/Forms/FormElements';
import BasicTables from './pages/Tables/BasicTables';
import Alerts from './pages/UiElements/Alerts';
import Badges from './pages/UiElements/Badges';
import Avatars from './pages/UiElements/Avatars';
import Buttons from './pages/UiElements/Buttons';
import Images from './pages/UiElements/Images';
import Videos from './pages/UiElements/Videos';
import LineChart from './pages/Charts/LineChart';
import BarChart from './pages/Charts/BarChart';
import UserApprovalTable from './pages/Exhibitor Management/UserApprovalTable';
import AddExpoPage from './pages/ExpoManagement/AddExpoPage';
import EditDeleteExpoPage from './pages/ExpoManagement/EditDeletePage';
import UpdateExpoPage from './pages/ExpoManagement/UpdateExpoPage';
import AddEventPage from './pages/ExpoManagement/AddEventPage';
import EditDeleteEventPage from './pages/ExpoManagement/EditDeleteEvent';
import UpdateEventPage from './pages/ExpoManagement/UpdateEvent';
import ShowEvents from './pages/RegistrationAndProfile/showEvents';
import RegisterEventsPage from './pages/RegistrationAndProfile/registerEvents';
import ShowEventWithBoothPage from './pages/RegistrationAndProfile/ShowEventWithBoothPage';
import UserApplicationApprovalPage from './pages/Exhibitor Management/UserApplicationApprovalPage';
import RegisteredEventsPage from './pages/RegistrationAndProfile/RegisterEventPage';
import UpdateRegisteredEventsPage from './pages/RegistrationAndProfile/UpdateRegisteredEventPage';
import ChatBox from './pages/Chat/ChatBox';
import { userContext } from './context/UserContext';
import AddSchedulePage from './pages/Schedule/AddSchedule';
import DisplaySchedulePage from './pages/Schedule/DisplaySchedule';
import UpdateSchedulePage from './pages/Schedule/UpdateSchedule';


// ✅ Protect routes for logged-in and approved users (except attendees)
function ProtectedRoute({ children }) {
  const { user } = useContext(userContext);

  if (!user) return <Navigate to="/signin" replace />;
  if (user.CurrentStatus !== "approved" && user.role !== "attendees") {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

// ✅ Protect routes only for organizers
function OrganizerRoute({ children }) {
  const { user } = useContext(userContext);

  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== "organizer") return <Navigate to="/" replace />;

  return children;
}

// ✅ Protect routes only for exhibitor
function ExhibitorRoute({ children }) {
  const { user } = useContext(userContext);

  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== "exhibitors") return <Navigate to="/" replace />;

  return children;
}
//for exhibitor and organizer both
// ✅ Protect routes for organizers or exhibitors
function OrganizerOrExhibitorRoute({ children }) {
  const { user } = useContext(userContext);

  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== "organizer" && user.role !== "exhibitors") {
    return <Navigate to="/" replace />;
  }

  return children;
}

const router = createBrowserRouter([
  { path: '/signin', element: <SignIn /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/forgetpassword', element: <ForgetPassword /> },
  { path: '/resetpassword/:token', element: <ResetPassword /> },

  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      // ✅ Organizer-only routes

      {
        path: '/add-expo',
        element: (
          <OrganizerRoute>
            <AddExpoPage />
          </OrganizerRoute>
        ),
      },
      {
        path: '/eddel-expo',
        element: (
          <OrganizerRoute>
            <EditDeleteExpoPage />
          </OrganizerRoute>
        ),
      },
      {
        path: '/update-expo/:id',
        element: (
          <OrganizerRoute>
            <UpdateExpoPage />
          </OrganizerRoute>
        ),
      },
      {
        path: '/add-event',
        element: (
          <OrganizerRoute>
            <AddEventPage />
          </OrganizerRoute>
        ),
      },
      {
        path: '/display-event',
        element: (
          <OrganizerRoute>
            <EditDeleteEventPage />
          </OrganizerRoute>
        ),
      },
      {
        path: '/update-event/:id',
        element: (
          <OrganizerRoute>
            <UpdateEventPage />
          </OrganizerRoute>
        ),
      },
       { path: '/user-approval', element:<OrganizerRoute> <UserApprovalTable /></OrganizerRoute> },
       { path: '/user-application', element:<OrganizerRoute> <UserApplicationApprovalPage /></OrganizerRoute> },
       {path:'/addschedule',element:<OrganizerRoute><AddSchedulePage /></OrganizerRoute>},
       {path:'/display-schedule',element:<OrganizerRoute><DisplaySchedulePage/></OrganizerRoute>},
       {path:'update-schedule/:id',element:<OrganizerRoute><UpdateSchedulePage/></OrganizerRoute>},


// ✅ exhibitors-only routes
{ path: '/profile', element: <ExhibitorRoute><UserProfiles /></ExhibitorRoute> },
{path:'/eventdisplay', element:<ExhibitorRoute><ShowEvents /></ExhibitorRoute>},
{path:'/registerevent/:id', element:<ExhibitorRoute><RegisterEventsPage /></ExhibitorRoute>},
{path:'/registeredevents', element:<ExhibitorRoute><RegisteredEventsPage /></ExhibitorRoute>},

//organizer exhibitor both 
{path:'/eventwithboothdisplay', element:<OrganizerOrExhibitorRoute><ShowEventWithBoothPage /></OrganizerOrExhibitorRoute>},
{path:'/updateregisteredevents/:id', element:<OrganizerOrExhibitorRoute><UpdateRegisteredEventsPage /></OrganizerOrExhibitorRoute>},

      // ✅ Public protected routes
      { path: '/', element: <Home /> },
      { path: '/calendar', element: <Calendar /> },
      { path: '/blank', element: <Blank /> },
      { path: '/form-elements', element: <FormElements /> },
      { path: '/basic-tables', element: <BasicTables /> },
      { path: '/alerts', element: <Alerts /> },
      { path: '/avatars', element: <Avatars /> },
      { path: '/badge', element: <Badges /> },
      { path: '/buttons', element: <Buttons /> },
      { path: '/images', element: <Images /> },
      { path: '/videos', element: <Videos /> },
      { path: '/line-chart', element: <LineChart /> },
      { path: '/bar-chart', element: <BarChart /> },
    {path: '/chatbox', element: <ChatBox />},
     
    ],
  },

  { path: '*', element: <NotFound /> },
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
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  style={{ marginTop: '70px', zIndex: 99999999, position: "fixed" }} // fix here
/>
    </div>
  );
}

export default App;
