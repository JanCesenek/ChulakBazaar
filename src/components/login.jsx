import React, { useState, useEffect } from "react";
import { Form, useNavigate } from "react-router-dom";
import Button from "./custom/button";
import Submitting from "./custom/submitting";
import { api } from "../core/api";

const Login = (props) => {
  const [usernameValue, setUsernameValue] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const loggedIn = localStorage.getItem("token");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loggedIn && navigate("user");
  }, []);

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
        navigate("/");
      })
      .catch((err) => console.log(`Invalid credentials - ${err}`));
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col justify-start items-center">
      <Form className="border border-white rounded-2xl flex flex-col justify-center items-center p-3 bg-black bg-opacity-40 text-[2rem] mt-10 [&>*]:my-2">
        <div className="w-full flex justify-between">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={usernameValue}
            onChange={(e) => setUsernameValue(e.target.value)}
            className="bg-transparent border border-white"
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
            className="bg-transparent border border-white"
          />
        </div>
        <Button
          title={isSubmitting ? "Logging in..." : "Log In"}
          submit
          classes={
            (usernameValue.length < 6 || password.length < 8 || isSubmitting) &&
            "pointer-events-none opacity-50"
          }
          onClick={logIn}
        />
      </Form>
      {isSubmitting && <Submitting />}
      <p
        className="mt-5 text-yellow-400 underline hover:cursor-pointer text-[1.5rem]"
        onClick={props.link}>
        New user? Click here to create an account.
      </p>{" "}
    </div>
  );
};

export default Login;
