import {
    createBrowserRouter,
  } from "react-router-dom";
  import Layout from "../Layout";
  import App from "../App";
  import Home from "../pages/Home";
  import { newShowtimeAction } from "./actions/movieFormAction";
import ErrorPage from "../pages/ErrorPage";
import ShowtimePage from "../pages/ShowtimePage";
  
  const router = createBrowserRouter([
    {
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        { path: "/", element: <App />},
        { path: "/home", element: <Home />, action: newShowtimeAction},
        { path: "/showtime/:showtimeID", element: <ShowtimePage />}
      ]
    },
  ]);
  
  export default router;
  