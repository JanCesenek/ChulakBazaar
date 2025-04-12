import React, { useState, useContext } from "react";
import { GiCoins, GiAbstract010, GiBangingGavel, GiTwoCoins } from "react-icons/gi";
import { IoPersonCircle } from "react-icons/io5";
import { useUpdate } from "../hooks/use-update";
import Loading from "./custom/loading";
import Button from "./custom/button";
import { api } from "../core/api";
import { NotificationContext } from "../context/NotificationContext";
import { FaSpaceShuttle } from "react-icons/fa";
import { GiRadioactive } from "react-icons/gi";

const ItemDetail = (props) => {
  const { notifyContext, setStatus } = useContext(NotificationContext);

  const { data, refetch: refetchUsers, isLoading } = useUpdate("/users");
  const { refetch: refetchItems, isLoading: itemsLoading } = useUpdate("/items");
  const {
    data: transactionData,
    refetch: refetchTransactions,
    isLoading: transactionsLoading,
  } = useUpdate("/transactions");
  const loading = isLoading || itemsLoading || transactionsLoading;
  const [editItem, setEditItem] = useState(false);
  const [editedName, setEditedName] = useState(props.name);
  const [editedPrice, setEditedPrice] = useState(props.price);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [editedQuantity, setEditedQuantity] = useState(props.quantity);
  const [editedDescription, setEditedDescription] = useState(props.description);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(props.price);
  const [pcs, setPcs] = useState(props.quantity);

  if (loading) return <Loading />;

  const seller = data?.find((el) => el.username === props.seller);
  const token = localStorage.getItem("token");
  const curUsername = localStorage.getItem("curUser");

  const curBid = transactionData?.find((el) => el.item === props.id);
  const curBidder = data?.find((el) => el.username === curBid?.buyer);

  const refetchData = async () => {
    await refetchUsers();
    await refetchItems();
    await refetchTransactions();
    setPcs(props.quantity - +quantity);
    if (props.type === "bid") setPrice(+price + 1000);
  };

  const itemHandler = async (e) => {
    const postReqPayload = {
      buyer: e === "sell" ? curBidder?.username : curUsername,
      seller: e === "sell" ? curUsername : seller.username,
      item: props.id,
      quantity: e === "sell" ? 1 : +quantity,
      total: e === "sell" ? price : quantity * price,
      type: props.type,
      sell: e === "sell" ? true : false,
    };
    setTransactionInProgress(true);
    await api
      .post("/transactions", postReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(() => {
        refetchData();
        setStatus("success");
        notifyContext(
          <div className="flex items-center">
            <FaSpaceShuttle className="mr-2" />
            <span>
              {e === "sell" ? "Sold" : e === "bid" ? "Bid" : "Bought"} {props.name}!
            </span>
          </div>,
          "success"
        );
      })
      .catch((err) => {
        console.log(`Post req - ${err}`);
        setStatus("error");
        notifyContext(
          <div className="flex items-center">
            <GiRadioactive className="mr-2" /> <span>Transaction failed!</span>
          </div>,
          "error"
        );
      });
    setTransactionInProgress(false);
  };

  const updateItem = async (id, restock) => {
    const patchReqPayload = {
      name: editedName,
      price: editedPrice,
      quantity: editedQuantity,
      description: editedDescription,
    };
    setTransactionInProgress(true);
    await api
      .patch(`/items/${id}`, restock ? { quantity, restock } : patchReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetchItems())
      .catch((err) => console.log(`Patch req - ${err}`))
      .finally(() => {
        setTransactionInProgress(false);
      });
    restock && setPcs(pcs + quantity);
    !restock && props.back();
  };

  return editItem ? (
    <div
      className={`my-10 w-[90%] flex flex-col bg-black/90 rounded-lg shadow-yellow-400/50 shadow-md [&>*]:my-2 text-[1.7rem] p-5 ${
        transactionInProgress && "cursor-not-allowed opacity-70 pointer-events-none"
      }`}>
      <div className="flex items-center">
        <label htmlFor="name" className="w-[15rem]">
          Name:
        </label>
        <input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          className="bg-transparent border border-yellow-400/20 shadow-md shadow-yellow-400/50 rounded-md"
        />
      </div>
      <div className="flex items-center">
        <label htmlFor="price" className="w-[15rem]">
          Price:
        </label>
        <input
          type="number"
          name="price"
          id="price"
          step="100"
          value={editedPrice}
          onChange={(e) => setEditedPrice(+e.target.value)}
          className="bg-transparent border border-yellow-400/20 shadow-md shadow-yellow-400/50 rounded-md max-w-[15rem]"
        />
      </div>
      <div className="flex items-center">
        <label htmlFor="quantity" className="w-[15rem]">
          Quantity:
        </label>
        <input
          type="number"
          name="quantity"
          id="quantity"
          value={editedQuantity}
          onChange={(e) => setEditedQuantity(+e.target.value)}
          className="bg-transparent border border-yellow-400/20 shadow-md shadow-yellow-400/50 rounded-md max-w-[10rem]"
        />
      </div>
      <div className="flex items-center">
        <label htmlFor="desciption" className="w-[15rem]">
          Description:
        </label>
        <textarea
          name="description"
          id="description"
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="bg-transparent border border-yellow-400/20 shadow-md shadow-yellow-400/50 rounded-md"
          rows="5"
          cols="30"
        />
      </div>
      <Button title="Submit" onClick={() => updateItem(props.id)} classes="self-center !mt-5" />
      <p
        className="text-yellow-400 underline self-center hover:cursor-pointer"
        onClick={() => setEditItem(false)}>
        Back
      </p>
    </div>
  ) : (
    <div
      className={`my-10 flex flex-col items-center w-[90%] bg-black/90 rounded-lg shadow-yellow-900 shadow-md [&>*]:my-5 text-[2.5rem] ${
        transactionInProgress && "cursor-not-allowed opacity-70 pointer-events-none"
      }`}>
      <div className="flex items-center text-[3.5rem] font-bold [&>*]:mx-2 !my-20">
        <GiAbstract010 /> <span>{props.name}</span>
      </div>
      <img
        src={props.image}
        alt="some img"
        className="w-auto h-auto max-w-[30rem] max-h-[30rem] rounded-lg"
      />
      <p className="flex items-center w-[80%] sm:w-2/3 lg:w-1/2 justify-between">
        <GiCoins /> {price}
      </p>
      {props.type === "bid" && curBid && (
        <p className="">
          Highest bid: {curBid?.total} by {curBidder?.firstName} {curBidder?.lastName}
        </p>
      )}
      {props.type === "sell" && (
        <p className="flex items-center w-[80%] sm:w-2/3 lg:w-1/2 justify-between">
          <span>pcs</span>
          <span>{pcs}</span>
        </p>
      )}
      <div className="flex items-center w-[80%] sm:w-2/3 lg:w-1/2 justify-between text-[2.5rem] font-bold">
        <div className="flex items-center">
          <IoPersonCircle />
          <GiTwoCoins />
        </div>
        <div>
          {seller?.firstName} {seller?.lastName}
        </div>
      </div>
      <p className="mx-20 py-20 border-t">{props.description}</p>
      {props.quantity === 0 && (
        <p className="text-yellow-400 mx-5 flex items-center text-[2rem]">
          Sold out! <GiBangingGavel className="ml-2" />
        </p>
      )}
      {token &&
        !props.own &&
        props.quantity > 0 &&
        (props.type === "sell" ? (
          <div className="flex w-1/4 justify-around">
            <Button
              title={transactionInProgress ? "Buying..." : "Buy"}
              onClick={itemHandler}
              classes={transactionInProgress && "pointer-events-none opacity-50"}
            />
            <input
              type="number"
              name="amount"
              id="amount"
              min="1"
              max={props.quantity}
              value={quantity}
              onChange={(e) => setQuantity(+e.target.value)}
              step="1"
              className="bg-transparent border border-yellow-400/20 shadow-md shadow-yellow-400/50 rounded-md"
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              title={transactionInProgress ? "Bidding..." : "Bid"}
              onClick={() => itemHandler("bid")}
              classes={transactionInProgress && "pointer-events-none opacity-50"}
            />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(+e.target.value)}
              min={props.price}
              step="1000"
              className="bg-transparent border border-yellow-400/20 shadow-md shadow-yellow-400/50 rounded-md ml-10 w-[15rem]"
            />
          </div>
        ))}
      {props.own && props.type === "bid" && curBid && props.quantity === 1 && (
        <Button
          title={transactionInProgress ? "Selling..." : "Sell"}
          onClick={() => itemHandler("sell")}
          classes={transactionInProgress && "pointer-events-none opacity-50"}
        />
      )}
      {props.own &&
        props.profile === curUsername &&
        (props.type === "sell" || (props.type === "bid" && props.quantity === 1 && !curBid)) && (
          <Button title="Edit item" onClick={() => setEditItem(true)} />
        )}
      {props.own && props.type === "sell" && props.profile === curUsername && (
        <div className="flex justify-around">
          <Button
            title={transactionInProgress ? "Restocking..." : "Restock"}
            onClick={() => updateItem(props.id, "restock")}
          />
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(+e.target.value)}
            min="1"
            max="1000"
            step="1"
            className="bg-transparent border border-yellow-400/20 shadow-md shadow-yellow-400/50 ml-10"
          />
        </div>
      )}
      <p className="!mt-10 underline text-yellow-400 hover:cursor-pointer" onClick={props.back}>
        Back
      </p>
    </div>
  );
};

export default ItemDetail;
