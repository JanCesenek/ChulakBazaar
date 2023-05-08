import React from "react";

const Intro = () => {
  return (
    <div className="mt-10 flex flex-col items-center bg-black/50 rounded-lg shadow-yellow-400/50 shadow-md w-[50rem] sm:w-[70rem] p-5 [&>*]:my-5">
      <img
        src="https://cxfluuggeeoujjwckzuu.supabase.co/storage/v1/object/public/imgs/userPics/sholvaArt.jpg"
        alt="sholva"
        className="w-auto h-auto max-w-[20rem] max-h-[20rem] rounded-lg"
      />
      <p className="mx-20">
        Tek'ma'tek, ya duru arik kek onac! My name is Shol'va Teal'c and I'm the first free Jaffa,
        the best smuggler in the universe and a humble owner of this bazaar. I have contacts all
        around the galaxy and I'm able to get you any wares you need. If you have any special
        request and wanna talk business, you've come to the right place. Visit me on Chulak and I
        will arrange your delivery for an extra fee.
      </p>
      <p className="mx-20">
        You are able to browse items and see users without an account. To sell your own items, bid
        on/buy other items and interact with other users, you need to be logged in.{" "}
      </p>
      <p className="mx-20">
        After logging in, you are able to create/edit/delete your items, buy/bid on other user's
        items, sell your auctioned items, view other users/make reviews and message other users.
        Whenever you manage to sell something, win an auction or are outbid on an item, you will get
        a pending notification from system. If someone harasses you in chat, you can freeze it and
        messages from that user will disappear.
      </p>
    </div>
  );
};

export default Intro;
