import React, { useState, useRef } from "react";
import { Form } from "react-router-dom";
import { useUpdate } from "../hooks/use-update";
import Profile from "../components/profile";
import Loading from "../components/custom/loading";
import Button from "../components/custom/button";
import { v4 as uuid } from "uuid";
import { BsFillFileImageFill, BsTrashFill } from "react-icons/bs";
import { FcVip } from "react-icons/fc";
import { api } from "../core/api";
import { supabase } from "../core/supabase";
import Items from "../pages/items";

const Users = (props) => {
  const { data, refetch: refetchUsers, isLoading } = useUpdate("/users");
  const { data: itemData, refetch, isLoading: itemsLoading } = useUpdate("/items");
  const { data: transactionData, isLoading: transactionsLoading } = useUpdate("/transactions");
  const { data: reviewData, isLoading: reviewsLoading } = useUpdate("/reviews");
  const loading = isLoading || transactionsLoading || itemsLoading || reviewsLoading;
  const curUsername = localStorage.getItem("curUser");
  const token = localStorage.getItem("token");
  const curUser = data?.find((el) => el.username === curUsername);
  const [findUsers, setFindUsers] = useState(false);
  const [userValue, setUserValue] = useState("");
  // Dynamically shows either user's own profile, list of all other users or any other user's profile
  const [profile, setProfile] = useState(curUser);
  // Show/hide details
  const [addItem, setAddItem] = useState(false);
  const [ownItems, setOwnItems] = useState(false);
  const [ownTransactions, setOwnTransactions] = useState(false);
  // Tracks values for creating an item
  const [name, setName] = useState("");
  const [price, setPrice] = useState(100);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("sell");
  const [quantity, setQuantity] = useState(1);
  const inputValueRef = useRef(null);

  const handleFileChange = (e) => {
    console.log(e.target.files[0]);
    setImage(e.target.files[0]);
  };

  const createItem = async () => {
    const specialID = uuid();

    const uploadImage = async () => {
      const { data, error } = await supabase.storage
        .from("imgs")
        .upload(`items/${specialID}`, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.log("Error uploading file...", error);
      } else {
        console.log("File uploaded", data.path);
      }

      const { data: getData, error: getError } = await supabase.storage.from("imgs").list("items");

      if (getError) {
        console.log("Error listing files...", getError);
      } else {
        console.log("Files listed!", getData);
      }
    };
    uploadImage();

    const postReqPayload = {
      name,
      image: `https://cxfluuggeeoujjwckzuu.supabase.co/storage/v1/object/public/imgs/items/${specialID}`,
      price: +price,
      type,
      quantity: type === "bid" ? 1 : +quantity,
      description,
      seller: curUsername,
    };

    await api
      .post("/items", postReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetch())
      .catch((err) => console.log(`Post req - ${err}`));
    setAddItem(false);
  };

  const getMonth = (m) => {
    return m.toLocaleString("default", { month: "short" });
  };

  const deleteUser = async (id) => {
    if (window.confirm(`Really wanna delete ${id}?`)) {
      await api
        .delete(`/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => await refetchUsers())
        .catch((err) => console.log(`Delete req - ${err}`));
    }
  };

  const validForm = name && image && description;

  const anyItems = itemData?.find((el) => el.seller === profile?.username);
  const anyTransactions = transactionData?.find(
    (el) => el.buyer === profile?.username || el.seller === profile?.username
  );

  if (loading) return <Loading />;

  return profile ? (
    <div className="mt-10 w-4/5 min-h-[30rem] flex flex-col items-center">
      <p
        className="text-yellow-400 text-[1.5rem] underline hover:cursor-pointer mt-10"
        onClick={() => setProfile(false)}>
        View all users
      </p>
      <Profile
        id={profile?.id}
        firstName={profile?.firstName}
        lastName={profile?.lastName}
        username={profile?.username}
        profilePicture={profile?.profilePicture}
        gender={profile?.gender}
        own={curUsername === profile.username ? true : false}
        admin={profile?.admin}
        setLog={props.setLog}
      />
      {curUsername === profile.username && (
        <p onClick={() => setAddItem(!addItem)} className="mt-10 underline hover:cursor-pointer">
          {addItem ? "Hide" : "Add Item"}
        </p>
      )}
      {addItem && (
        <Form className="mt-10 border border-white rounded-lg bg-black bg-opacity-50 w-[40rem] min-h-[20rem] flex flex-col text-[1.8rem] p-5 [&>*]:my-2">
          <div className="flex">
            <label htmlFor="name" className="mr-5">
              Name:
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent border border-white rounded-md"
            />
          </div>
          <div className="flex items-center">
            <p>Image:</p>
            <label htmlFor="pic" className="flex w-[10rem] ml-5 text-[1rem] hover:cursor-pointer">
              <BsFillFileImageFill /> {image ? image.name : "Upload image"}
            </label>
            <input
              type="file"
              name="pic"
              id="pic"
              size="10"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              ref={inputValueRef}
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="description">Description:</label>
            <textarea
              name="description"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              cols="30"
              rows="5"
              className="bg-transparent border border-white rounded-md"
            />
          </div>
          <div>
            <label htmlFor="type">Type:</label>
            <select
              name="type"
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="text-black">
              <option value="sell">sell</option>
              <option value="bid">bid</option>
            </select>
          </div>
          <div>
            <label htmlFor="price">Price:</label>
            <input
              type="number"
              name="price"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="100"
              max="10000000"
              step="100"
              className="bg-transparent border border-white rounded-md"
            />
          </div>
          {type !== "bid" && (
            <div>
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                max="1000"
                step="1"
                className="bg-transparent border border-white rounded-md"
              />
            </div>
          )}
          <Button
            title="Submit"
            classes={`self-center ${!validForm && "pointer-events-none opacity-50"}`}
            onClick={createItem}
          />
        </Form>
      )}
      {anyItems && (
        <p className="mt-10 underline hover:cursor-pointer" onClick={() => setOwnItems(!ownItems)}>
          {ownItems ? "Hide own items" : "List own items"}
        </p>
      )}
      {ownItems && <Items own curUser={profile?.username} />}
      {curUsername === profile.username && anyTransactions && (
        <p
          className="mt-10 underline hover:cursor-pointer"
          onClick={() => setOwnTransactions(!ownTransactions)}>
          {ownTransactions ? "Hide own transactions" : "List own transactions"}
        </p>
      )}
      {ownTransactions && transactionData?.length > 0 && (
        <div className="mt-5 flex text-[1.2rem] min-w-[70rem] [@media(max-width:600px)]:w-[50rem] [&>*]:w-auto">
          <div className="flex flex-col items-start [&>*]:w-full [&>*]:px-5">
            <div className="flex justify-around bg-black">Name</div>
            {transactionData?.map((el) => {
              if (el.buyer === profile?.username || el.seller === profile?.username) {
                const findItem = itemData?.find((arg) => arg.id === el.item);
                return (
                  <div
                    key={el.id}
                    className={`flex justify-around ${
                      el.buyer === profile?.username ? "bg-red-600" : "bg-green-600"
                    }`}>
                    <p>{findItem?.name}</p>
                  </div>
                );
              }
            })}
          </div>
          <div className="flex flex-col items-start [&>*]:w-full [&>*]:px-5">
            <div className="flex justify-around bg-black">Quantity</div>
            {transactionData?.map((el) => {
              if (el.buyer === profile?.username || el.seller === profile?.username) {
                return (
                  <div
                    key={el.id}
                    className={`flex justify-around ${
                      el.buyer === profile?.username ? "bg-red-600" : "bg-green-600"
                    }`}>
                    <p>{el.quantity}</p>
                  </div>
                );
              }
            })}
          </div>
          <div className="flex flex-col items-start [&>*]:w-full [&>*]:px-5">
            <div className="flex justify-around bg-black">Total price</div>
            {transactionData?.map((el) => {
              if (el.buyer === profile?.username || el.seller === profile?.username) {
                return (
                  <div
                    key={el.id}
                    className={`flex justify-around ${
                      el.buyer === profile?.username ? "bg-red-600" : "bg-green-600"
                    }`}>
                    <p>{el.total}</p>
                  </div>
                );
              }
            })}
          </div>
          <div className="flex flex-col items-start [&>*]:w-full [&>*]:px-5">
            <div className="flex justify-around bg-black">Type</div>
            {transactionData?.map((el) => {
              if (el.buyer === profile?.username || el.seller === profile?.username) {
                return (
                  <div
                    key={el.id}
                    className={`flex justify-around ${
                      el.buyer === profile?.username ? "bg-red-600" : "bg-green-600"
                    }`}>
                    <p>{el.type}</p>
                  </div>
                );
              }
            })}
          </div>
          <div className="flex flex-col [@media(max-width:600px)]:hidden items-start [&>*]:w-full [&>*]:px-5">
            <div className="flex justify-around bg-black">Buyer</div>
            {transactionData?.map((el) => {
              if (el.buyer === profile?.username || el.seller === profile?.username) {
                return (
                  <div
                    key={el.id}
                    className={`flex justify-around ${
                      el.buyer === profile?.username ? "bg-red-600" : "bg-green-600"
                    }`}>
                    <p>{el.buyer}</p>
                  </div>
                );
              }
            })}
          </div>
          <div className="flex flex-col [@media(max-width:600px)]:hidden items-start [&>*]:w-full [&>*]:px-5">
            <div className="flex justify-around bg-black">Seller</div>
            {transactionData?.map((el) => {
              if (el.buyer === profile?.username || el.seller === profile?.username) {
                return (
                  <div
                    key={el.id}
                    className={`flex justify-around ${
                      el.buyer === profile?.username ? "bg-red-600" : "bg-green-600"
                    }`}>
                    <p>{el.seller}</p>
                  </div>
                );
              }
            })}
          </div>
          <div className="flex flex-col items-start [&>*]:w-full [&>*]:px-5">
            <div className="flex justify-around bg-black">Date</div>
            {transactionData?.map((el) => {
              if (el.buyer === profile?.username || el.seller === profile?.username) {
                const createdAt = new Date(el.createdAt);
                return (
                  <div
                    key={el.id}
                    className={`flex justify-around ${
                      el.buyer === profile?.username ? "bg-red-600" : "bg-green-600"
                    }`}>
                    <p>
                      {el.createdAt.slice(8, 10)} {getMonth(createdAt)} {el.createdAt.slice(0, 4)}
                    </p>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="flex flex-col items-center mt-10">
      {curUsername && (
        <p
          className="mt-10 text-yellow-400 underline hover:cursor-pointer"
          onClick={() => setProfile(curUser)}>
          Back to own profile
        </p>
      )}
      <div className="flex flex-col items-center my-10">
        <Button
          title={findUsers ? "Hide" : "Search users"}
          onClick={() => setFindUsers(!findUsers)}
        />
        {findUsers && (
          <input
            type="text"
            value={userValue}
            onChange={(e) => setUserValue(e.target.value)}
            className="bg-transparent border border-white rounded-md mt-5"
          />
        )}
      </div>
      {data?.map((el) => {
        const getColor = () => {
          const getAvgRating = () => {
            let count = 0;
            const reviews = [];
            reviewData?.map((arg) => {
              if (arg.recipient === el.username) {
                reviews.push(+arg.rating);
              }
            });
            reviews.forEach((arg) => (count += arg));
            return count / reviews.length;
          };
          if (getAvgRating() > 4.5) return "text-green-400 font-bold";
          else if (getAvgRating() > 4) return "text-green-600";
          else if (getAvgRating() > 3) return "text-yellow-400";
          else if (getAvgRating() > 2) return "text-orange-600 font-thin";
          else if (getAvgRating() >= 1) return "text-red-600 font-thin";
          else return "text-white";
        };
        const userPattern = (
          <div
            key={el.id}
            className={`flex justify-between p-5 items-center bg-gradient-to-b from-gray-600/50 via-black/50 to-gray-600/50 ${getColor()} bg-opacity-50 my-5 shadow-lg shadow-gray-600 rounded-lg min-w-[30rem]`}>
            <span className="flex items-center">
              {el.admin && <FcVip className="w-10 h-10" />}
              <img
                src={el.profilePicture}
                alt="profile pic"
                className="w-auto h-auto max-w-[5rem] max-h-[5rem] mr-5"
              />
            </span>
            <p className="hover:cursor-pointer" onClick={() => setProfile(el)}>
              {el.firstName} {el.lastName}
            </p>
            {curUser?.admin && (
              <BsTrashFill
                className="text-red-600 hover:cursor-pointer"
                onClick={() => deleteUser(el.username)}
              />
            )}
          </div>
        );
        if (findUsers && userValue) {
          const fullName = el.firstName.toLowerCase() + " " + el.lastName.toLowerCase();
          const filteredData = data?.filter(() => fullName.includes(userValue.toLowerCase()));
          const dataFilter = filteredData?.find((fil) => fil === el);
          if (el.username !== curUsername && dataFilter) return userPattern;
        } else if (el.username !== curUsername) {
          return userPattern;
        }
      })}
    </div>
  );
};

export default Users;
