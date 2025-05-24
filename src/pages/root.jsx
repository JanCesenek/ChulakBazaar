import React, { useContext } from "react";
import MainNavigation from "../components/mainNavigation";
import { Outlet } from "react-router-dom";
import { FaCopyright } from "react-icons/fa";
import logo from "/flamebulb.svg";
import { GiRingedPlanet, GiCoinsPile } from "react-icons/gi";
import { useUpdate } from "../hooks/use-update";
import Loading from "../components/custom/loading";
import Notification from "../components/custom/notification";
import { NotificationContext } from "../context/NotificationContext";

const RootLayout = (props) => {
  const { notification } = useContext(NotificationContext);

  const { data, isLoading } = useUpdate("/users");
  const curUsername = localStorage.getItem("curUser");
  const curUser = data?.find((el) => el.username === curUsername);
  const balance = curUser?.balance;

  if (isLoading) return <Loading />;

  return (
    <>
      <div className="min-h-screen 2xl:mx-[20rem] flex flex-col items-center">
        {notification && <Notification message={notification} />}
        <MainNavigation log={props.log} setLog={props.setLog} />
        <h1
          className={`text-[4rem] sm:text-[5rem] flex items-center mt-20 font-["Audiowide",cursive] shadow-yellow-400 shadow-sm bg-black bg-opacity-50 rounded-lg py-5 px-10`}>
          <div>Chulak Bazaar</div>
          <GiRingedPlanet className="ml-5" />
        </h1>
        {curUsername && (
          <div className="flex items-center my-10 text-[2.5rem] sm:text-[3rem]">
            <h1>Current balance: {balance}</h1>
            <GiCoinsPile className="ml-5" />
          </div>
        )}
        <Outlet />
      </div>
      <div className="w-full h-[3rem] bg-black flex justify-center items-center text-[1rem] sm:mt-20">
        <FaCopyright className=" mr-2" />
        <div className="flex items-center">
          <p className="mr-2">|</p>
          <img src={logo} alt="logo" className="w-[1rem]" />
          <p className="ml-2">Jan Cesenek 2025 | All rights reserved</p>
        </div>
      </div>
    </>
  );
};

export default RootLayout;
