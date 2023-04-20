import React, { useState } from "react";
import MainNavigation from "../components/mainNavigation";
import { Outlet } from "react-router-dom";
import { GiRingedPlanet, GiCoinsPile } from "react-icons/gi";
import { useUpdate } from "../hooks/use-update";
import Loading from "../components/custom/loading";

const RootLayout = (props) => {
  const { data, isLoading } = useUpdate("/users");
  const curUsername = localStorage.getItem("curUser");
  const curUser = data?.find((el) => el.username === curUsername);
  const balance = curUser?.balance;

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen 2xl:mx-[20rem] bg-black bg-opacity-70 flex flex-col items-center">
      <MainNavigation log={props.log} setLog={props.setLog} />
      <h1
        className={`text-[5rem] flex items-center mt-10 font-["Audiowide",cursive] border border-white bg-black bg-opacity-50 rounded-lg p-5`}>
        <div>Chulak Bazaar</div>
        <GiRingedPlanet />
      </h1>
      {curUsername && (
        <div className="flex items-center mt-5 text-[2rem]">
          <h1>Current balance: {balance}</h1>
          <GiCoinsPile className="ml-5" />
        </div>
      )}
      <Outlet />
    </div>
  );
};

export default RootLayout;
