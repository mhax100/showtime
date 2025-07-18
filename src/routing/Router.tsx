import {
    createBrowserRouter,
  } from "react-router-dom";
  import Layout from "../Layout";
  import App from "../App";
  import Home from "../pages/Home";
  import { newShowtimeAction } from "./actions/movieFormAction";
import ErrorPage from "../pages/ErrorPage";
import EventPage from "../pages/EventPage";
import { submitAvailabilityAction } from "./actions/submitAvailabilityAction";
import { eventPageLoader } from "./loaders/eventPageLoader";
  
  const router = createBrowserRouter([
    {
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        { path: "/", element: <App />},
        { path: "/home", element: <Home />},
        { path: "/showtime/:eventID", 
          element: <EventPage />,
          loader: eventPageLoader,
          action: submitAvailabilityAction
        },
        {
          path: "/actions/new-showtime",
          action: newShowtimeAction
        }
      ]
    },
  ]);
  
  export default router;
  