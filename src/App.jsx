import React, { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./pages/root";
import Error from "./components/custom/error";
import Intro from "./pages/intro";
import Items from "./pages/items";
import Users from "./pages/users";
import Messages from "./pages/messages";
import Auth from "./pages/auth";
import { api } from "./core/api";
import { BsHourglassSplit } from "react-icons/bs";
import { useRouteError } from "react-router-dom";

function App() {
  const loggedIn = localStorage.getItem("token");
  const [log, setLog] = useState(loggedIn);
  useEffect(() => {
    api
      .get("/users")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/items")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/transactions")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/reviews")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/messages")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
  }, []);

  const CustomElement = () => {
    const error = useRouteError();
    console.error(error);
    return <BsHourglassSplit className="mt-10 w-[4rem] h-[4rem] animate-spin" />;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout log={log} setLog={() => setLog(!log)} />,
      errorElement: <Error />,
      children: [
        { index: true, element: <Intro /> },
        { path: "/items", element: <Items /> },
        { path: "/users", element: <Users setLog={() => setLog(!log)} /> },
        { path: "/messages", element: <Messages /> },
        {
          path: "/auth",
          element: <Auth setLog={() => setLog(!log)} />,
          method: ["GET", "POST"],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
