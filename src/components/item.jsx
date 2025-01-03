import React from "react";
import { BsXCircleFill, BsFillPlusCircleFill } from "react-icons/bs";
import { GiTwoCoins, GiAbstract010 } from "react-icons/gi";
import { FaUserTie } from "react-icons/fa";
import { useUpdate } from "../hooks/use-update";
import Loading from "./custom/loading";
import { api } from "../core/api";
import { supabase } from "../core/supabase";

const Item = (props) => {
  const { data, isLoading } = useUpdate("/users");
  const { refetch } = useUpdate("/items");
  const seller = data?.find((el) => el.username === props.seller);
  const token = localStorage.getItem("token");
  const curUsername = localStorage.getItem("curUser");
  const curUser = data?.find((el) => el.username === curUsername);
  const admin = curUser?.admin;

  const fullName = seller?.firstName + " " + seller?.lastName;

  const deleteItem = async () => {
    if (window.confirm("Really wanna delete the item?")) {
      const { data: presentData } = await supabase.storage.from("imgs").list("items");
      const curFile = presentData.find((el) => props.image.includes(el.name));
      console.log(curFile);
      const { data, error } = await supabase.storage.from("imgs").remove([`items/${curFile.name}`]);

      if (error) {
        console.log("Error deleting file", error);
      } else {
        console.log("File successfully deleted!", data);
      }

      await api
        .delete(`/items/${props.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => await refetch())
        .catch((err) => console.log(`Delete req - ${err}`));
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="grid relative grid-rows-[1fr,3fr,1fr] grid-cols-[repeat(4,1fr)] rounded-lg justify-items-center items-center text-[1rem] h-[23rem] hover:translate-x-2 hover:translate-y-[-0.5rem] shadow-yellow-400/50 shadow-md hover:shadow-yellow-400 hover:shadow-2xl">
      <img
        src={props.image}
        alt="Some img"
        className="col-span-full row-start-2 row-end-4 w-full h-full rounded-b-lg"
      />
      <div className="row-start-1 row-end-2 col-span-full bg-gradient-to-b rounded-t-lg from-yellow-300 to-yellow-600 flex flex-col items-center [&>*]:my-1 justify-around w-full h-full text-black">
        <div className="row-start-1 row-end-2 col-span-full flex items-center font-bold text-[1.1rem]">
          <h4 className="mr-2">{props.name}</h4>
          <GiAbstract010 />
        </div>
        <div className="row-start-2 row-end-3 col-span-full flex items-center">
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
          className="absolute top-[7rem] right-5 text-[1.5rem] text-yellow-400 hover:cursor-pointer"
          onClick={deleteItem}
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
