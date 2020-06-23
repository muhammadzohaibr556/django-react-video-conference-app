import axios from "axios";
import WebSocketInstance from "../websocket";
import React, { Fragment, Component } from "react";
import { Button } from "semantic-ui-react";
import Video from "../components/Video";
import { endpoint } from "../store/utility";
import Videos from "../components/Videos";
import { getDisplayStream } from "../components/media-access";
import styles from "../components/style";
const mq = window.matchMedia("(max-width:720px)");
class Meeting extends Component {
  initialConnection(cId) {
    this.waitForSocketConnection(() => {
      WebSocketInstance.addCallbacks(
        this.setOffer.bind(this),
        this.setCandidate.bind(this),
        this.setAnswer.bind(this),
        this.setDisplay.bind(this),
        this.setRemoveStream.bind(this)
      );
    });
    WebSocketInstance.connect(cId);
  }
  constructor(props) {
    super(props);
    this.state = {
      localStream: null,
      selectedVideo: null,
      remoteStreams: [],
      peerConnections: {},
      users: null,
      micState: true,
      camState: true,
      status: "Please Wait...",
      socketConnection: false,
      pc_config: {
        stunServers: [
          // { urls: 'stun:jitsi-meet.example.com:4446' },
          { urls: "stun:meet-jit-si-turnrelay.jitsi.net:443" },
        ],
      }, //{ "iceServers": [ { 'url': 'stun:stun.services.mozilla.com' }, { urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] },
      sdpConstraints: {
        mandatory: { OfferToRecieveAudio: true, OfferToRecieveVideo: true },
      },
    };
    this.initialConnection("conference");
    this.peerConnections = {};
    this.remoteStreams = [];
  }

  componentDidMount() {
    axios
      .get(`${endpoint}/users/`, {
        headers: {
          Authorization: `JWT ${
            JSON.parse(localStorage.getItem("user")).token
          }`,
        },
      })
      .then((res) => {
        this.setState({ users: res.data });
      })
      .catch((err) => {
        console.log(err);
      });
    this.getUserMedia()
      .then((stream) => {
        window.localStream = stream;
        this.setState({ localStream: stream });
      })
      .catch((e) => console.log("Error Message : ", e));
  }
  waitForSocketConnection = (callback) => {
    console.log("waitForSocketConnection");
    const component = this;
    setTimeout(function () {
      if (WebSocketInstance.state() === 1) {
        console.log("connection is secured");
        callback();
        component.setState({ socketConnection: true });
        return;
      } else {
        console.log("waiting for connection");
        component.waitForSocketConnection(callback);
      }
    }, 100);
  };

  async getUserMedia() {
    return new Promise((resolve, reject) => {
      const constraints = {
        video: {
          width: { min: 640, max: 1024 },
          height: { min: 480, max: 768 },
        },
        audio: true,
        options: { mirror: false },
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => resolve(stream))
        .catch((e) => reject(e));
    });
  }
  /////////////////////// create peerConnections //////////////////////////////////
  createPeerConnection = (remoteUserID, callback) => {
    try {
      let pc = new RTCPeerConnection(this.state.pc_config);
      // add pc to peerConnections object
      this.peerConnections = { ...this.peerConnections, [remoteUserID]: pc };
      this.setState({ peerConnections: this.peerConnections });

      pc.onicecandidate = (e) => {
        if (e.candidate)
          WebSocketInstance.candidate(
            e.candidate,
            parseInt(remoteUserID),
            parseInt(JSON.parse(localStorage.getItem("user")).id)
          );
      };

      pc.oniceconnectionstatechange = (e) => {
        console.log(e);
        // if (pc.iceConnectionState === 'disconnected') {
        //   const remoteStreams = this.state.remoteStreams.filter(stream => stream.id !== socketID)

        //   this.setState({
        //     remoteStream: remoteStreams.length > 0 && remoteStreams[0].stream || null,
        //   })
        // }
      };
      pc.ontrack = (e) => {
        console.log("pc.ontrack");
        const remoteVideo = {
          id: remoteUserID,
          stream: e.streams[0],
        };
        let remoteStreamCount = 0;
        for (let i = 0; i < this.remoteStreams.length; i++)
          if (this.remoteStreams[i].stream === e.streams[0])
            remoteStreamCount = 1;

        if (remoteStreamCount === 0) {
          this.remoteStreams = [...this.remoteStreams, remoteVideo];
          this.setState({ selectedVideo: this.remoteStreams[0] });
          this.setState({ remoteStreams: this.remoteStreams });
        }
      };

      pc.close = () => {
        // alert('GONE')
      };

      if (this.state.localStream) {
        pc.addStream(this.state.localStream);
      }
      // return pc
      callback(pc);
    } catch (e) {
      console.log("Something went wrong! pc not created!!", e);
      // return;
      callback(null);
    }
  };
  ///////////////////////////////////////////////////////////
  setOffer(offer) {
    if (parseInt(JSON.parse(localStorage.getItem("user")).id) === offer.local) {
      console.log("Offer Comes");
      this.createPeerConnection(parseInt(offer.remote), (pc) => {
        pc.setRemoteDescription(new RTCSessionDescription(offer.content)).then(
          () => {
            // 2. Create Answer
            pc.createAnswer(this.state.sdpConstraints).then((sdp) => {
              pc.setLocalDescription(sdp);
              WebSocketInstance.answer(
                sdp,
                parseInt(offer.remote),
                parseInt(JSON.parse(localStorage.getItem("user")).id)
              );
            });
          }
        );
      });
      const { users, peerConnections } = this.state;
      for (let i = 0; i < users.length; i++) {
        if (peerConnections[users[i].id] === undefined) {
          this.createPeerConnection(users[i].id, (pc) => {
            // 2. Create Offer
            if (pc)
              pc.createOffer(this.state.sdpConstraints).then((sdp) => {
                pc.setLocalDescription(sdp);
                WebSocketInstance.offer(
                  sdp,
                  parseInt(users[i].id),
                  parseInt(JSON.parse(localStorage.getItem("user")).id)
                );
              });
          });
        }
      }
    }
  }
  setAnswer(answer) {
    if (
      parseInt(JSON.parse(localStorage.getItem("user")).id) === answer.local
    ) {
      console.log("Answer Comes");
      const pc = this.peerConnections[answer.remote];
      if (pc)
        pc.setRemoteDescription(
          new RTCSessionDescription(answer.content)
        ).then(() => {});
      this.setState({
        micState: true,
        camState: true,
      });
    }
  }
  setCandidate(candidate) {
    if (
      parseInt(JSON.parse(localStorage.getItem("user")).id) === candidate.local
    ) {
      console.log("Candidate Comes");
      const pc = this.state.peerConnections[candidate.remote];
      if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate.content));
    }
  }
  setDisplay(id) {
    this.peerConnections = {};
    this.remoteStreams = [];
    this.setState({
      selectedVideo: null,
      remoteStreams: this.remoteStreams,
      peerConnections: this.peerConnections,
    });
    console.log("setDisplay");
    if (parseInt(id) === parseInt(JSON.parse(localStorage.getItem("user")).id))
      this.createOffer();
  }
  setRemoveStream() {
    console.log("remove Comes");
    for (let i = 0; i < this.state.users.length; i++) {
      const pc = this.state.peerConnections[this.state.users[i].id];
      if (pc) pc.removeStream(this.state.localStream);
    }
  }
  createOffer = () => {
    console.log("Offer");
    const { users } = this.state;
    for (let i = 0; i < users.length; i++) {
      // create and send offer to the peer
      // 1. Create new pc
      this.createPeerConnection(users[i].id, (pc) => {
        // 2. Create Offer
        if (pc)
          pc.createOffer(this.state.sdpConstraints).then((sdp) => {
            pc.setLocalDescription(sdp);
            WebSocketInstance.offer(
              sdp,
              parseInt(users[i].id),
              parseInt(JSON.parse(localStorage.getItem("user")).id)
            );
          });
      });
    }
  };

  socketDisconnect = () => {
    WebSocketInstance.disconnect();
  };
  socketDetail = () => {
    console.log(WebSocketInstance.detail());
  };
  setVideoLocal() {
    if (this.state.localStream.getVideoTracks().length > 0)
      this.state.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });

    this.setState({ camState: !this.state.camState });
  }
  setAudioLocal() {
    if (this.state.localStream.getAudioTracks().length > 0)
      this.state.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });

    this.setState({ micState: !this.state.micState });
  }
  getDisplay() {
    getDisplayStream().then((stream) => {
      stream.oninactive = () => {
        WebSocketInstance.removeStream();
        this.getUserMedia().then((stream) => {
          window.localStream = stream;
          this.setState({ localStream: stream });
          console.log("display Off");
          if (this.remoteStreams.length > 0)
            WebSocketInstance.changeDisplay(
              parseInt(JSON.parse(localStorage.getItem("user")).id)
            );
        });
      };
      WebSocketInstance.removeStream();
      window.localStream = stream;
      this.setState({ localStream: stream });
      console.log("display On");
      if (this.remoteStreams.length > 0)
        WebSocketInstance.changeDisplay(
          parseInt(JSON.parse(localStorage.getItem("user")).id)
        );
    });
  }
  switchVideo = (_video) => {
    console.log(_video);
    console.log(this.state.localStream);
    this.setState({ selectedVideo: _video });
  };
  leave = () => {
    this.setState({
      localStream: null,
      selectedVideo: null,
      remoteStreams: [],
      peerConnections: {},
      users: null,
    });
    this.setRemoveStream();
    this.props.onLeave();
  };
  render() {
    const { peerConnections } = this.state;
    return (
      <Fragment>
        <div>
          <Video
            videoStyles={styles.localVideoStyle}
            idStyle={styles.localIdStyle}
            videoStream={this.state.localStream}
            id={JSON.parse(localStorage.getItem("user")).id}
            muted={true}
          ></Video>
          <Video
            videoStyles={styles.remoteVideoStyle}
            frameStyle={{ height: "100%" }}
            // ref={ this.remoteVideoref }
            videoStream={
              this.state.selectedVideo !== null
                ? this.state.selectedVideo.stream
                : null
            }
            idStyle={styles.remoteIdStyle}
            id={null}
            autoPlay
          ></Video>
          <div>
            <Videos
              switchVideo={this.switchVideo}
              remoteStreams={this.state.remoteStreams}
            />
          </div>

          <div style={styles.status}>
            {this.state.localStream === null ? this.state.status : null}
          </div>
          <div>
            {this.state.socketConnection ? (
              <div style={{ zIndex: 3, position: "fixed", bottom: 10 }}>
                <Button
                  onClick={this.createOffer}
                  disabled={
                    Object.keys(peerConnections).length === 0 ? false : true
                  }
                  color="teal"
                  size={mq.matches?"small":"large"}
                >
                  Create Offer
                </Button>
                <Button
                  color="teal"
                  size={mq.matches?"small":"large"}
                  onClick={() => this.getDisplay()}
                >
                  <p>ShareScreen</p>
                </Button>
                <Button
                  color="teal"
                  size={mq.matches?"small":"large"}
                  onClick={() => this.setVideoLocal()}
                >
                  {this.state.camState ? <p>CamOn</p> : <p>CamOff</p>}
                </Button>
                <Button
                  color="teal"
                  size={mq.matches?"small":"large"}
                  onClick={() => this.setAudioLocal()}
                >
                  {this.state.micState ? <p>MicOn</p> : <p>MicOff</p>}
                </Button>
                <Button
                  disabled={
                    Object.keys(peerConnections).length === 0 ? true : false
                  }
                  onClick={() => this.leave()}
                  color="teal"
                  size={mq.matches?"small":"large"}
                >
                  Leave Meeting
                </Button>
              </div>
            ) : (
              <p>Waiting for connection</p>
            )}
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Meeting;
