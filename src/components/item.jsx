import React from "react";
import { BsXCircleFill, BsFillPlusCircleFill } from "react-icons/bs";
import { GiTwoCoins, GiAbstract010 } from "react-icons/gi";
import { FaUserTie } from "react-icons/fa";
import { useUpdate } from "../hooks/use-update";
import Loading from "./custom/loading";

const Item = (props) => {
  const { data, isLoading } = useUpdate("/users");
  const seller = data?.find((el) => el.username === props.seller);
  const curUsername = localStorage.getItem("curUser");
  const curUser = data?.find((el) => el.username === curUsername);
  const admin = curUser?.admin;

  const fullName = seller?.firstName + " " + seller?.lastName;

  if (isLoading) return <Loading />;

  return (
    <div className="grid relative grid-rows-[3fr,6fr,1fr] grid-cols-[repeat(4,1fr)] rounded-lg justify-items-center items-center text-[1rem] h-[30rem] hover:translate-x-2 hover:translate-y-[-0.5rem] shadow-yellow-900 shadow-lg hover:shadow-yellow-400 hover:shadow-2xl">
      <img
        src={props.image}
        alt="Some img"
        className="col-span-full row-start-2 row-end-4 w-full h-full rounded-b-lg"
      />
      <div className="row-start-1 row-end-2 col-span-full bg-gradient-to-b rounded-t-lg from-yellow-300 to-yellow-600 flex flex-col items-center [&>*]:my-1 justify-around w-full h-full text-black">
        <div className="row-start-1 row-end-2 col-span-full flex items-center font-bold text-[1.4rem]">
          <h4 className="mr-2">{props.name}</h4>
          <GiAbstract010 />
        </div>
        <div className="row-start-2 row-end-3 col-span-full flex items-center text-[1.2rem]">
          <h4 className="mr-2">{props.price}</h4>
          <GiTwoCoins />
        </div>
        <div className="row-start-3 row-end-4 col-span-full flex text-[1rem] items-center">
          <h4 className="mr-2 text-[min(1rem, 1.5rem)]">{fullName}</h4>
          <FaUserTie />
        </div>
      </div>
      {((props.own && curUsername === props.profile) || admin) && (
        <BsXCircleFill
          className="absolute top-5 right-5 text-[1.2rem] text-black hover:cursor-pointer"
          onClick={props.deleteItem}
        />
      )}
      <BsFillPlusCircleFill
        className="absolute bottom-5 right-5 text-[3rem] text-yellow-400 hover:cursor-pointer"
        onClick={props.getDetail}
      />
    </div>
  );
};

export default Item;
