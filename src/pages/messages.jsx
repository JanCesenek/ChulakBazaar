import React, { useState } from "react";
import { useUpdate } from "../hooks/use-update";
import Loading from "../components/custom/loading";
import { Form } from "react-router-dom";
import { FaArrowAltCircleRight } from "react-icons/fa";
import Message from "../components/message";
import { GiCircleSparks, GiFrozenBlock } from "react-icons/gi";
import { api } from "../core/api";
import Button from "../components/custom/button";

const Messages = () => {
  const { data: userData, isLoading: usersLoading } = useUpdate("/users");
  const { data: messageData, refetch, isLoading: messagesLoading } = useUpdate("/messages");
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState(false);
  const loading = usersLoading || messagesLoading;
  const curUsername = localStorage.getItem("curUser");
  const curUser = userData?.find((el) => el.username === curUsername);
  const token = localStorage.getItem("token");
  const unreadSystemMessages = messageData?.find(
    (arg) => arg.system && !arg.read && arg.sender === curUsername && arg.recipient === curUsername
  );

  const senderFrozen = messageData?.find(
    (arg) => arg.sender === curUsername && arg.recipient === recipient?.username && arg.frozen
  );
  const recipientFrozen = messageData?.find(
    (arg) => arg.recipient === curUsername && arg.sender === recipient?.username && arg.frozen
  );

  const sendMessage = async () => {
    const postReqPayload = {
      sender: curUsername,
      recipient: recipient?.username,
      message,
    };
    await api
      .post("/messages", postReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetch())
      .catch((err) => console.log(`Post req - ${err}`));
    setMessage("");
  };

  const readMessages = async (sender, el) => {
    setRecipient(el);
    await api
      .patch(
        "/messages",
        { sender, username: curUsername },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(async () => await refetch())
      .catch((err) => console.log(`Patch req - ${err}`));
  };

  const freezeChat = async () => {
    const postReqPayload = {
      sender: curUsername,
      recipient: recipient?.username,
      message: "...",
      read: true,
      frozen: true,
    };
    await api
      .post("/freeze", postReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetch())
      .catch((err) => console.log(`Post req - ${err}`));
  };

  const unfreezeChat = async () => {
    await api
      .delete(`/freeze/${curUsername}/${recipient?.username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetch())
      .catch((err) => console.log(`Delete req - ${err}`));
  };

  if (loading) return <Loading />;

  return curUsername ? (
    <div className="mt-10 flex justify-between bg-black bg-opacity-50 w-[70rem] min-h-[50rem] max-w-full [&>*]:w-1/2">
      <div className="flex flex-col items-center p-5 [&>*]:my-2">
        <div
          className="flex relative justify-between items-center p-5 border border-white hover:cursor-pointer w-[25rem] text-[1rem] bg-black bg-opacity-50"
          onClick={() => readMessages(curUsername, "system")}>
          <img
            src="https://cxfluuggeeoujjwckzuu.supabase.co/storage/v1/object/public/imgs/userPics/system.jpg"
            alt="profile pic"
            className="w-auto h-auto max-w-[5rem] max-h-[5rem]"
          />
          <p>System</p>
          {unreadSystemMessages && (
            <GiCircleSparks className="w-5 h-5 text-yellow-400 absolute top-0 right-0 translate-x-[50%] translate-y-[-50%]" />
          )}
        </div>
        {userData?.map((el) => {
          const unreadMessages = messageData?.find(
            (arg) =>
              arg.recipient === curUsername &&
              arg.sender === el.username &&
              !arg.read &&
              !senderFrozen &&
              !recipientFrozen
          );
          if (el.username !== curUsername) {
            const senderFrozen = messageData?.find(
              (arg) => arg.sender === curUsername && arg.recipient === el.username && arg.frozen
            );
            const recipientFrozen = messageData?.find(
              (arg) => arg.recipient === curUsername && arg.sender === el.username && arg.frozen
            );
            return (
              <div
                key={el.id}
                className={`flex justify-between relative items-center p-5 border border-white ${
                  (senderFrozen || recipientFrozen) && "border-blue-400"
                } hover:cursor-pointer ${
                  recipientFrozen && "hover:cursor-not-allowed"
                } w-[25rem] text-[1rem] bg-black bg-opacity-50`}
                onClick={!recipientFrozen ? () => readMessages(el.username, el) : undefined}>
                <img
                  src={el.profilePicture}
                  alt="profile pic"
                  className="w-auto h-auto max-w-[5rem] max-h-[5rem]"
                />
                <p
                  className={`flex items-center ${
                    (senderFrozen || recipientFrozen) && "text-blue-400"
                  } `}>
                  {(senderFrozen || recipientFrozen) && (
                    <GiFrozenBlock className="mr-5 h-10 w-10" />
                  )}{" "}
                  <span className={`${recipientFrozen && "opacity-50"}`}>
                    {el.firstName} {el.lastName}
                  </span>
                </p>
                {unreadMessages && (
                  <GiCircleSparks className="w-5 h-5 text-yellow-400 absolute top-0 right-0 translate-x-[50%] translate-y-[-50%]" />
                )}
              </div>
            );
          }
        })}
      </div>
      {recipient && (
        <div className="flex flex-col items-center [&>*]:my-2">
          <img
            src={
              recipient.profilePicture ||
              "https://cxfluuggeeoujjwckzuu.supabase.co/storage/v1/object/public/imgs/userPics/system.jpg"
            }
            alt="profilePic"
            className="w-auto h-auto max-w-[15rem] max-h-[15rem]"
          />
          {messageData?.map((el) => {
            if (
              ((el.sender === curUsername && el.recipient === recipient?.username) ||
                (el.recipient === curUsername && el.sender === recipient?.username) ||
                (el.sender === curUsername &&
                  el.recipient === curUsername &&
                  recipient === "system")) &&
              !senderFrozen &&
              !recipientFrozen
            ) {
              return (
                <Message
                  key={el.id}
                  id={el.id}
                  sender={el.sender}
                  recipient={el.recipient}
                  message={el.message}
                  system={el.system}
                  createdAt={el.createdAt}
                  profilePicture={
                    el.sender === curUsername
                      ? curUser?.profilePicture
                      : recipient?.profilePicture ||
                        "https://cxfluuggeeoujjwckzuu.supabase.co/storage/v1/object/public/imgs/userPics/system.jpg"
                  }
                />
              );
            }
          })}
          {recipient !== "system" && !senderFrozen && !recipientFrozen && (
            <Form className="flex items-center">
              <textarea
                name="message"
                id="message"
                cols="20"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-transparent border border-white rounded-lg"
              />
              <FaArrowAltCircleRight
                onClick={sendMessage}
                className={`ml-5 hover:cursor-pointer ${
                  !message && "pointer-events-none opacity-50"
                }`}
              />
            </Form>
          )}
          {!recipientFrozen && recipient !== "system" && (
            <Button
              title={senderFrozen ? "Unfreeze chat" : "Freeze chat"}
              onClick={senderFrozen ? unfreezeChat : freezeChat}
            />
          )}
        </div>
      )}
    </div>
  ) : (
    <h1 className="mt-10">Log in to view your messages.</h1>
  );
};

export default Messages;
