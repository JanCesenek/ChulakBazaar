import React from "react";
import Loading from "./custom/loading";
import { api } from "../core/api";
import { useUpdate } from "../hooks/use-update";
import { BsTrash3Fill } from "react-icons/bs";

const Message = (props) => {
  const { isLoading: usersLoading } = useUpdate("/users");
  const { refetch, isLoading: messagesLoading } = useUpdate("/messages");
  const token = localStorage.getItem("token");
  const curUsername = localStorage.getItem("curUser");

  const loading = usersLoading || messagesLoading;

  const deleteReq = async () => {
    await api
      .delete(`/messages/${props.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetch())
      .catch((err) => console.log(`Delete req - ${err}`));
  };

  if (loading) return <Loading font="text-[0.5rem]" icon="w-[1.5rem] h-[1.5rem]" />;

  return (
    <div
      className={`flex items-center w-[90%] mb-2 ${
        props.sender === curUsername ? "justify-end" : "justify-start"
      }`}>
      {props.sender === curUsername && !props.system && (
        <div className="hover:cursor-pointer" onClick={deleteReq}>
          <BsTrash3Fill className="w-3 h-3" />
        </div>
      )}
      <div className="flex items-center [&>*]:mx-2">
        <img
          src={props.profilePicture}
          alt=""
          className={`w-auto h-auto rounded-md max-w-[5rem] max-h-[5rem] ${
            props.sender === curUsername ? "order-2 mr-2" : "ml-2"
          }`}
        />
        <div
          className={`bg-black border border-yellow-400/20 rounded-md shadow-md shadow-yellow-400/50 max-w-[20rem] h-min min-w-[10rem] min-h-[5rem] flex flex-col justify-center items-center p-2 text-[1rem] ${
            props.sender === curUsername ? `pr-10 ml-2` : `pl-10 mr-2`
          }`}>
          {props.message && <p>{props.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Message;
