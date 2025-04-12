import React, { useState, useContext } from "react";
import Loading from "../components/custom/loading";
import { useUpdate } from "../hooks/use-update";
import Item from "../components/item";
import ItemDetail from "../components/itemDetail";
import { api } from "../core/api";
import { NotificationContext } from "../context/NotificationContext";
import { GiClusterBomb, GiRadioactive } from "react-icons/gi";
import supabase from "../core/supabase";

const Items = (props) => {
  const { notifyContext, setStatus } = useContext(NotificationContext);

  const { data, refetch, isLoading } = useUpdate("/items");
  const { data: userData, isLoading: usersLoading } = useUpdate("/users");
  const loading = isLoading || usersLoading;
  // if true, show item detail, else show all items
  const [itemDetail, setItemDetail] = useState(false);
  // Show/hide filter
  const [addSort, setAddSort] = useState(false);
  // Filter values
  const [sort, setSort] = useState(false);
  const [comparison, setComparison] = useState("=");
  const [sortingValue, setSortingValue] = useState("");
  const curUsername = localStorage.getItem("curUser");

  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const deleteItem = async (id, image) => {
    if (window.confirm("Really wanna delete the item?")) {
      const { data: presentData } = await supabase.storage.from("imgs").list("items");
      const curFile = presentData.find((el) => image.includes(el.name));
      console.log(curFile);
      const { data, error } = await supabase.storage.from("imgs").remove([`items/${curFile.name}`]);

      if (error) {
        console.log("Error deleting file", error);
      } else {
        console.log("File successfully deleted!", data);
      }

      setSubmitting(true);
      await api
        .delete(`/items/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => {
          await refetch();
          setStatus("success");
          notifyContext(
            <div className="flex items-center">
              <GiClusterBomb className="mr-2" /> <span>Item deleted!</span>
            </div>,
            "success"
          );
        })
        .catch((err) => {
          console.log(`Delete req - ${err}`);
          setStatus("error");
          notifyContext(
            <div className="flex items-center">
              <GiRadioactive className="mr-2" /> <span>Failed to delete item!</span>
            </div>,
            "error"
          );
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };

  if (loading) return <Loading />;

  return itemDetail ? (
    <ItemDetail
      id={itemDetail.id}
      name={itemDetail.name}
      image={itemDetail.image}
      price={itemDetail.price}
      type={itemDetail.type}
      seller={itemDetail.seller}
      description={itemDetail.description}
      quantity={itemDetail.quantity}
      back={() => setItemDetail(false)}
      own={props.own ? true : false}
      profile={props.curUser}
    />
  ) : (
    <>
      {!props.own && (
        <>
          <p
            className="underline text-yellow-400 my-20 hover:cursor-pointer"
            onClick={() => setAddSort(!addSort)}>
            {addSort ? "Hide filter" : "Add filter"}
          </p>
          {/* FILTER */}
          {addSort && (
            <div className="flex justify-around mb-20 bg-black rounded-lg shadow-yellow-400 shadow-md p-10">
              <label htmlFor="sort" className="mr-2">
                Sort by:
              </label>
              <select
                name="sort"
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-black rounded-md shadow-md shadow-yellow-400/50 border border-yellow-400/20 focus:outline-none">
                <option value="">---</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="seller">Seller</option>
              </select>
              {sort === "price" && (
                <select
                  name="comparison"
                  id="comparison"
                  value={comparison}
                  onChange={(e) => setComparison(e.target.value)}
                  className="text-black ml-5">
                  <option value="=">=</option>
                  <option value="<">{"<"}</option>
                  <option value=">">{">"}</option>
                  <option value="<=">{"<="}</option>
                  <option value=">=">{">="}</option>
                </select>
              )}
              <input
                type={sort === "price" ? "number" : "text"}
                className="bg-transparent shadow-md shadow-yellow-400/50 border border-yellow-400/20 rounded-md ml-5 focus:outline-none"
                value={sortingValue}
                onChange={(e) => setSortingValue(e.target.value)}
              />
            </div>
          )}
        </>
      )}
      <div
        className={`my-20  ${
          props.own ? "w-full" : "w-4/5"
        } grid [@media(max-width:767px)]:grid-cols-2 [@media(max-width:500px)]:!grid-cols-1 [@media(max-width:500px)]:w-1/2 md:grid-cols-3 xl:grid-cols-4 gap-10 ${
          submitting && "cursor-not-allowed opacity-70 pointer-events-none"
        }`}>
        {data?.map((el) => {
          const itemPattern = (
            <div key={el.id}>
              <Item
                id={el.id}
                name={el.name}
                image={el.image}
                price={el.price}
                seller={el.seller}
                own={props.own ? true : false}
                getDetail={() => setItemDetail(el)}
                profile={props.curUser}
                deleteItem={() => deleteItem(el.id, el.image)}
              />
            </div>
          );
          if (props.own) {
            if (el.seller === props.curUser) return itemPattern;
          } else {
            if (sort && addSort) {
              if (sort === "name") {
                const name = el.name.toLowerCase();
                const dataFilter = data?.filter(() => name.includes(sortingValue.toLowerCase()));
                const filteredData = dataFilter?.find((fil) => fil === el);
                if (el.quantity > 0 && el.seller !== curUsername && filteredData)
                  return itemPattern;
              } else if (sort === "price") {
                if (comparison === "=") {
                  const dataFilter = data?.filter((arg) => arg.price === +sortingValue);
                  const filteredData = dataFilter?.find((fil) => fil === el);
                  if (el.quantity > 0 && el.seller !== curUsername && filteredData)
                    return itemPattern;
                } else if (comparison === "<") {
                  const dataFilter = data?.filter((arg) => arg.price < +sortingValue);
                  const filteredData = dataFilter?.find((fil) => fil === el);
                  if (el.quantity > 0 && el.seller !== curUsername && filteredData)
                    return itemPattern;
                } else if (comparison === ">") {
                  const dataFilter = data?.filter((arg) => arg.price > +sortingValue);
                  const filteredData = dataFilter?.find((fil) => fil === el);
                  if (el.quantity > 0 && el.seller !== curUsername && filteredData)
                    return itemPattern;
                } else if (comparison === "<=") {
                  const dataFilter = data?.filter((arg) => arg.price <= +sortingValue);
                  const filteredData = dataFilter?.find((fil) => fil === el);
                  if (el.quantity > 0 && el.seller !== curUsername && filteredData)
                    return itemPattern;
                } else if (comparison === ">=") {
                  const dataFilter = data?.filter((arg) => arg.price >= +sortingValue);
                  const filteredData = dataFilter?.find((fil) => fil === el);
                  if (el.quantity > 0 && el.seller !== curUsername && filteredData)
                    return itemPattern;
                }
              } else if (sort === "seller") {
                const seller = userData?.find((arg) => arg.username === el.seller);
                const fullName =
                  seller?.firstName.toLowerCase() + " " + seller?.lastName.toLowerCase();
                const filteredUser = userData?.filter(() =>
                  fullName?.includes(sortingValue.toLowerCase())
                );
                const filteredData = filteredUser?.find((fil) => fil.username === el.seller);
                if (el.quantity > 0 && el.seller !== curUsername && filteredData)
                  return itemPattern;
              }
            } else {
              if (el.quantity > 0 && el.seller !== curUsername) return itemPattern;
            }
          }
        })}
      </div>
    </>
  );
};

export default Items;
