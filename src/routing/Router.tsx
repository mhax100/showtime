import {
    createBrowserRouter,
  } from "react-router-dom";
  import Layout from "../Layout";
  import App from "../App";
  import Home from "../pages/Home";
  import { newShowtimeAction } from "./actions/movieFormAction";
import ErrorPage from "../pages/ErrorPage";
import ShowtimePage from "../pages/ShowtimePage";
import { submitAvailabilityAction } from "./actions/submitAvailabilityAction";
  
  const router = createBrowserRouter([
    {
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        { path: "/", element: <App />},
        { path: "/home", element: <Home />},
        { path: "/showtime/:showtimeID", element: <ShowtimePage />},
        {
          path: "/actions/new-showtime",
          action: newShowtimeAction
        },
        {
          path: "/actions/submit-availability",
          action: submitAvailabilityAction
        }
      ]
    },
  ]);
  
  export default router;
  