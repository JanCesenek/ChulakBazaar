import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../core/api";
import { useUpdate } from "../hooks/use-update";
import { BsStarFill, BsStarHalf, BsStar, BsTrashFill } from "react-icons/bs";
import { GiCrossedSwords, GiTwoCoins, GiNinjaHead, GiClusterBomb } from "react-icons/gi";
import { supabase } from "../core/supabase";
import Loading from "./custom/loading";
import Button from "./custom/button";

// User's personal details

const Profile = (props) => {
  const [addReview, setAddReview] = useState(false);
  const [userReviews, setUserReviews] = useState(false);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(3);
  const [isBeingDeleted, setIsBeingDeleted] = useState(false);
  const { data, refetch, isLoading } = useUpdate("/users");
  const { data: transactionsData, isLoading: transactionsLoading } = useUpdate("/transactions");
  const {
    data: reviewsData,
    refetch: refetchReviews,
    isLoading: reviewsLoading,
  } = useUpdate("/reviews");
  const loading = isLoading || transactionsLoading || reviewsLoading;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const curUser = localStorage.getItem("curUser");
  const admin = props.admin;
  const malePic =
    "https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/imgs/userPics/maleDefaultPic.jpg";
  const femalePic =
    "https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/imgs/userPics/femaleDefaultPic.jfif";
  const reviews = reviewsData?.find((el) => el.recipient === props.username);
  const alreadyReviewed = reviewsData?.find(
    (el) => el.recipient === props.username && el.sender === curUser
  );

  // Removes a token upon logging out
  const removeBearerToken = () => {
    delete api.defaults.headers.common["Authorization"];
  };

  const refetchData = async () => {
    await refetchReviews();
    await refetch();
  };

  const moneySpent = () => {
    let count = 0;
    transactionsData?.map((el) => {
      if (el.buyer === props?.username) count += el.total;
    });
    return count;
  };

  const moneyEarned = () => {
    let count = 0;
    transactionsData?.map((el) => {
      if (el.seller === props?.username) count += el.total;
    });
    return count;
  };

  const itemsBought = () => {
    let count = 0;
    transactionsData?.map((el) => {
      if (el.buyer === props?.username) count += el.quantity;
    });
    return count;
  };

  const itemsSold = () => {
    let count = 0;
    transactionsData?.map((el) => {
      if (el.seller === props?.username) count += el.quantity;
    });
    return count;
  };

  const getRating = () => {
    let count = 0;
    const ratings = [];
    reviewsData?.map((el) => {
      if (el.recipient === props?.username) ratings.push(+el.rating);
    });
    ratings.forEach((el) => (count += el));
    count = count / ratings.length;
    return parseFloat(count.toFixed(2));
  };

  const getStars = (el) => {
    if (+el >= 4.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
        </div>
      );
    else if (+el < 4.75 && +el >= 4.25)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarHalf />
        </div>
      );
    else if (+el < 4.25 && +el >= 3.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStar />
        </div>
      );
    else if (+el < 3.75 && +el >= 3.25)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarHalf />
          <BsStar />
        </div>
      );
    else if (+el < 3.25 && +el >= 2.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 2.75 && +el >= 2.25)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarHalf />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 2.25 && +el >= 1.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 1.75 && +el >= 1.25)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStarHalf />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 1.25 && +el >= 0.75)
      return (
        <div className="flex justify-around">
          <BsStarFill />
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    else if (+el < 0.75 && +el >= 0.25)
      return (
        <div className="flex justify-around">
          <BsStarHalf />
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    else {
      return (
        <div className="flex justify-around">
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
        </div>
      );
    }
  };

  const newReview = async () => {
    const postReqPayload = {
      sender: curUser,
      recipient: props?.username,
      rating,
      message,
    };

    await api
      .post("/reviews", postReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(() => refetchData())
      .catch((err) => console.log(`Post req - ${err}`));
    setMessage("");
    setRating(3);
    setAddReview(false);
  };

  const deleteReview = async (id) => {
    await api
      .delete(`/reviews/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(() => refetchData())
      .catch((err) => console.log(`Delete req - ${err}`));
  };

  // Delete req for deleting a user
  const deleteUser = async (e) => {
    if (window.confirm("Really wanna delete your account?")) {
      setIsBeingDeleted(true);
      if (props.profilePicture !== malePic && props.profilePicture !== femalePic) {
        const { data } = await supabase.storage.from("imgs").list("userPics");
        const curFile = data.find((el) => props.profilePicture.includes(el.name));
        const { data: deletedData, error: deletedError } = await supabase.storage
          .from("imgs")
          .remove([`userPics/${curFile.name}`]);

        if (deletedError) {
          console.log("Could not remove profile pic...", deletedError);
        } else {
          console.log("Profile pic removed successfully...", deletedData);
        }
      }
      await api
        .delete(`/users/${curUser}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => {
          await refetch();
          removeBearerToken();
          localStorage.clear();
          props.setLog();
          navigate("/auth");
        })
        .catch((err) => console.log(`Delete req err - ${err}`));
      setIsBeingDeleted(false);
    } else e.preventDefault();
  };

  if (loading) return <Loading />;

  if (isBeingDeleted)
    return (
      <div className="flex items-center mt-10 text-[3rem] text-red-600 p-5 border border-red-600">
        <p>Account is being deleted!</p> <GiNinjaHead className="animate-pulse" />{" "}
        <GiClusterBomb className="animate-pulse" />
      </div>
    );

  return (
    <div
      className={`grid justify-items-center relative w-[50rem] grid-cols-[1fr] grid-rows-[18rem,min-content] mt-10 shadow-yellow-400 shadow-md rounded-2xl [&>*]:w-full [&>:nth-child(1)]:rounded-t-2xl [&>:nth-child(2)]:rounded-b-2xl ${
        props.admin && "!text-yellow-400"
      }`}>
      <div
        className={`grid grid-cols-2 grid-rows-1 bg-gradient-to-b from-black/70 to-gray-500/70 justify-center items-center`}
        style={{
          "--tw-gradient-stops": `var(--tw-gradient-from) 35%, ${
            props.admin ? "yellow" : "white"
          }, var(--tw-gradient-to) 65%`,
        }}>
        <h1 className="self-end mb-10 text-3xl px-3 w-[120%] ml-5">
          {props.firstName} {props.lastName}
        </h1>
        <div className="w-[10rem] h-[10rem] justify-self-center flex flex-col justify-center items-center">
          <img
            src={props.profilePicture}
            alt="Profile pic"
            className="w-auto h-auto max-w-[15rem] max-h-[15rem] rounded-lg"
          />
        </div>
        {props.own && !admin && (
          <div
            className="absolute top-0 right-0 mr-5 mt-5 hover:cursor-pointer"
            onClick={deleteUser}>
            <GiCrossedSwords className="w-5 h-5 text-yellow-600" />
          </div>
        )}
      </div>
      <div className="bg-gradient-to-t from-black/70 to-gray-500/70 flex flex-col items-center pb-2 [&>*]:my-2">
        <div className="flex justify-between w-3/5">
          <div>Items bought/bid on</div>
          <div>{itemsBought()}</div>
        </div>
        <div className="flex justify-between w-3/5">
          <div>Items sold/are bid on</div>
          <div>{itemsSold()}</div>
        </div>
        <div className="flex justify-between w-3/5">
          <div>Money spent</div>
          <div className="flex items-center">
            {moneySpent()} <GiTwoCoins className="ml-2" />{" "}
          </div>
        </div>
        <div className="flex justify-between w-3/5">
          <div>Money earned</div>
          <div className="flex items-center">
            {moneyEarned()} <GiTwoCoins className="ml-2" />{" "}
          </div>
        </div>
        {reviews && (
          <div className="flex justify-between w-3/5">
            <div>Rating</div>
            <div className="flex items-center">
              {getStars(getRating())}
              <div className="ml-5">({getRating()})</div>
            </div>
          </div>
        )}
        {!props.own && curUser && !alreadyReviewed && (
          <p
            className="text-yellow-600 underline hover:cursor-pointer !mt-10"
            onClick={() => setAddReview(!addReview)}>
            {addReview ? "Hide" : "Add review"}
          </p>
        )}
        {addReview && (
          <div className="bg-black bg-opacity-50 border border-white rounded-md [&>*]:my-2 p-5 flex flex-col">
            <div className="flex justify-between items-center">
              <label htmlFor="message">Message:</label>
              <textarea
                name="message"
                id="message"
                cols="30"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-transparent border border-white rounded-md"
              />
            </div>
            <div className="flex justify-start items-center">
              <label htmlFor="rating">Rating:</label>
              <input
                type="number"
                name="rating"
                id="rating"
                min="0"
                max="5"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="bg-transparent border border-white rounded-md ml-5"
              />
            </div>
            <Button
              title="Submit"
              classes={`self-center ${!message && "pointer-events-none opacity-50"}`}
              onClick={newReview}
            />
          </div>
        )}
        {reviews && (
          <p
            className="text-yellow-600 underline hover:cursor-pointer !mt-10"
            onClick={() => setUserReviews(!userReviews)}>
            {userReviews ? "Hide user reviews" : "Show user reviews"}
          </p>
        )}
        {userReviews &&
          reviewsData?.map((el) => {
            const reviewer = data?.find((arg) => arg.username === el.sender);
            if (el.recipient === props?.username) {
              return (
                <div
                  key={el.id}
                  className="flex flex-col bg-black bg-opacity-50 border border-white rounded-md p-5 w-4/5 !my-5 shadow-lg shadow-white/50">
                  <div className="flex justify-around items-center border-b pb-2 border-gray-600">
                    <img
                      src={reviewer?.profilePicture}
                      alt="profile pic"
                      className="w-auto h-auto max-w-[5rem] max-h-[5rem]"
                    />
                    <p>
                      {reviewer?.firstName} {reviewer?.lastName}
                    </p>
                    {getStars(el.rating)}
                  </div>
                  <div className="text-[1.3rem]">{el.message}</div>
                  {el.sender === curUser && (
                    <BsTrashFill
                      className="self-center w-5 h-5 hover:cursor-pointer text-red-600"
                      onClick={() => deleteReview(el.id)}
                    />
                  )}
                </div>
              );
            }
          })}
      </div>
    </div>
  );
};

export default Profile;
