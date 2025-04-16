import React, { useState, useContext } from "react";
import { Form, useNavigate } from "react-router-dom";
import Button from "./custom/button";
import Submitting from "./custom/submitting";
import { api } from "../core/api";
import { NotificationContext } from "../context/NotificationContext";
import { FaSpaceShuttle } from "react-icons/fa";
import { GiRadioactive } from "react-icons/gi";

const Login = (props) => {
  const { notifyContext, setStatus } = useContext(NotificationContext);

  const navigate = useNavigate();

  const [usernameValue, setUsernameValue] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addBearerToken = (token) => {
    if (!token) {
      console.log("Token can't be undefined or null.");
      return;
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logIn = async () => {
    const username = usernameValue[0]?.toUpperCase() + usernameValue?.slice(1).toLowerCase();
    setIsSubmitting(true);
    await api
      .post("/login", {
        username,
        password,
      })
      .then((res) => {
        const token = res.data.token;
        addBearerToken(token);
        localStorage.setItem("curUser", username);
        localStorage.setItem("token", token);
        props.setLog();
        navigate("/users");
        setIsSubmitting(false);
        setStatus("success");
        notifyContext(
          <div className="flex items-center">
            <FaSpaceShuttle className="mr-2" /> <span>Welcome back, {username}!</span>
          </div>,
          "login"
        );
      })
      .catch((err) => {
        console.log(`Invalid credentials - ${err}`);
        setIsSubmitting(false);
        setStatus("error");
        notifyContext(
          <div className="flex items-center">
            <GiRadioactive className="mr-2" /> <span>Invalid credentials!</span>
          </div>,
          "iris"
        );
      });
  };

  return (
    <div className="flex flex-col justify-start items-center">
      <div
        className={`flex flex-col justify-start items-center w-full ${isSubmitting && "hidden"}`}>
        <Form className="rounded-lg shadow-lg shadow-yellow-400/50 flex flex-col justify-center items-center p-10 bg-black/80 text-[2rem] my-10 [&>*]:my-2">
          <div className="w-full flex justify-between">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={usernameValue}
              onChange={(e) => setUsernameValue(e.target.value)}
              className="bg-transparent ml-5 border border-yellow-400/20 shadow-md shadow-yellow-400/50 rounded-md focus:outline-none w-[60%]"
            />
          </div>
          <div className="w-full flex justify-between">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent ml-5 border border-yellow-400/20 shadow-md shadow-yellow-400/50 rounded-md focus:outline-none w-[60%]"
            />
          </div>
          <Button
            title={isSubmitting ? "Logging in..." : "Log In"}
            submit
            classes={`${
              (usernameValue.length < 6 || password.length < 8 || isSubmitting) &&
              "cursor-not-allowed pointer-events-none opacity-50"
            } !mt-10`}
            onClick={logIn}
          />
        </Form>
        <p
          className="mt-5 text-yellow-400 underline hover:cursor-pointer text-[1.5rem]"
          onClick={props.link}>
          New user? Click here to create an account.
        </p>{" "}
      </div>
      {isSubmitting && <Submitting />}
    </div>
  );
};

export default Login;
