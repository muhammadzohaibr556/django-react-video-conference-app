import React, { Fragment, useState } from "react";
import Meeting from "./Meeting";
import { useSelector } from "react-redux";
const HomepageLayout = () => {
  const [start, setStart] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const onStartClick = () => {
    setStart(true);
  };
  return (
    <Fragment>
      <div style={{ padding: "0px" }}>
        {token ? (
          <div>
            {start ? (
              <Meeting onLeave={() => setStart(false)} />
            ) : (
              <div className="text-center">
                <button className="btn btn-primary my-5" onClick={onStartClick}>
                  Start Meeting
                </button>
              </div>
            )}
          </div>
        ) : (
          <h1 style={{ padding: 100, textAlign: "center" }}>
            To make a Video Conference, you must Login first
          </h1>
        )}
      </div>
    </Fragment>
  );
};
export default HomepageLayout;
