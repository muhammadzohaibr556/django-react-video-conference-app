const styles = {
  localIdStyle: {
    position: "fixed",
    top: 50,
    right: 50,
    textAlign: "center",
    color: "white",
  },
  remoteIdStyle: {
    position: "relative",
    top: 40,
    textAlign: "center",
    color: "red",
  },
  localVideoStyle: {
    zIndex: 2,
    position: "absolute",
    right: 0,
    height: 150,
    top: 50,
    borderRadius: 5,
    padding: 5,
  },
  remoteVideoStyle: {
    zIndex: 1,
    position: "fixed",
    bottom: 0,
    top: 40,
    minHeight: "100%",
    backgroundColor: "black",
  },
  status: {
    zIndex: 4,
    position: "fixed",
    top: 500,
    left: 200,
    color: "white",
  },
};
export default styles;
