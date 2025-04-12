import React from "react";

const Button = (props) => {
  return (
    <button
      className={`px-5 border border-yellow-400/20 rounded-md bg-black shadow-md shadow-yellow-400/50 ${
        props.classes ? props.classes : undefined
      }`}
      type={props.submit ? "submit" : "button"}
      onClick={props.onClick}
      disabled={props.disabled}>
      {props.title}
    </button>
  );
};

export default Button;
