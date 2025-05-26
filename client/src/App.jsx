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
import UserProfiles from './pages/UserProfiles';
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

import { userContext } from './context/UserContext';
import UserApprovalTable from './pages/Exhibitor Management/UserApprovalTable';
import AddExpoPage from './pages/ExpoManagement/AddExpoPage';
import EditDeleteExpoPage from './pages/ExpoManagement/EditDeletePage';

function ProtectedRoute({ children }) {
  const { user } = useContext(userContext);

  if (!user) return <Navigate to="/signin" replace />;
  if (user.CurrentStatus !== "approved" && user.role !=="attendees") {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: '/signin',
    element: <SignIn />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/forgetpassword',
    element: <ForgetPassword />,
  },
  {
    path: '/resetpassword/:token',
    element: <ResetPassword />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [

    //Expo Management

    { path: '/add-expo', element: <AddExpoPage /> },
    { path: '/eddel-expo', element: <EditDeleteExpoPage /> },


      { path: '/', element: <Home /> },
      { path: '/profile', element: <UserProfiles /> },
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
      {path:'/user-approval',element:<UserApprovalTable/>}
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

function App() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <RouterProvider router={router} />
      <ToastContainer 
        position="top-right"    // default position
        autoClose={3000}        // optional: auto close after 3 seconds
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ marginTop: '70px' }} // add some margin from top to avoid navbar
      />
    </div>
  );
}

export default App;
