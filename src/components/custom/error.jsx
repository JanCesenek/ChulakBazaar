import React from "react";
import tyjelk from "../../imgs/tealc-stargate.gif";

const Error = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center mt-8 bg-black bg-opacity-50 rounded-2xl p-2 text-[1.7rem]">
        <h1>That indeed was not a wise move! Are you trying to sabotage our website?</h1>
        <img src={tyjelk} alt="ANO, to je ON" className="w-[50rem] h-[25rem] rounded-[1rem]" />
      </div>
    </div>
  );
};

export default Error;
