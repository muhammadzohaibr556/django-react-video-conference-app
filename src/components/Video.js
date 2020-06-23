import React, { useEffect, useRef } from "react";
import adapter from "webrtc-adapter";

const Video = (props) => {
  console.log(adapter.browserDetails.browser);
  const video = useRef(null);
  useEffect(() => {
    if (props.videoStream) {
      video.current.srcObject = props.videoStream;
    }
  }, [props]);

  // const { users, id } = props
  // console.log(user)
  // console.log(users)
  // if (users !== null) {
  //     for (let i = 0; i < users.length; i++) {
  //         if (users[i].id === id)
  //             console.log("found")
  //     }
  // }
  return (
    <div style={{ ...props.frameStyle }}>
      <h1 style={{ zIndex: 5, ...props.idStyle }}>{props.id}</h1>
      <video
        id={JSON.parse(localStorage.getItem("user")).id}
        muted={props.muted}
        autoPlay
        style={{ ...props.videoStyles }}
        ref={video}
      ></video>
    </div>
  );
};

export default Video;
