import React from "react";
import { NavLink } from "react-router-dom";
import { api } from "../core/api";
import { useUpdate } from "../hooks/use-update";
import Loading from "./custom/loading";
import { GiCircleSparks } from "react-icons/gi";

const MainNavigation = (props) => {
  const { data, isLoading } = useUpdate("/messages");
  const curUsername = localStorage.getItem("curUser");
  const removeBearerToken = () => {
    delete api.defaults.headers.common["Authorization"];
  };

  const logOut = (e) => {
    if (window.confirm("Are you sure you wanna log out?")) {
      removeBearerToken();
      localStorage.clear();
      props.setLog();
    } else e.preventDefault();
  };

  if (isLoading) return <Loading />;

  const unreadMessages = data?.find((el) => el.recipient === curUsername && !el.read);

  return (
    <nav className="flex justify-around w-full mt-4 text-[1.5rem]">
      <NavLink
        className={({ isActive }) => (isActive ? "text-yellow-500 underline" : undefined)}
        to="/">
        Intro
      </NavLink>
      <NavLink
        className={({ isActive }) => (isActive ? "text-yellow-500 underline" : undefined)}
        to="/items">
        Items
      </NavLink>
      <NavLink
        className={({ isActive }) => (isActive ? "text-yellow-500 underline" : undefined)}
        to="/users">
        Users
      </NavLink>
      <NavLink
        className={({ isActive }) => (isActive ? "text-yellow-500 underline flex" : "flex")}
        to="/messages">
        Messages{" "}
        {unreadMessages && <GiCircleSparks className="w-5 h-5 text-yellow-400 animate-pulse" />}
      </NavLink>
      {props.log ? (
        <NavLink className="border border-white px-2 rounded-md" onClick={logOut} to="/auth">
          Log Out
        </NavLink>
      ) : (
        <NavLink
          className={({ isActive }) => (isActive ? "text-yellow-500 underline" : undefined)}
          to="/auth">
          Auth
        </NavLink>
      )}
    </nav>
  );
};

export default MainNavigation;
