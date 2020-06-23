import { server_endpoint } from "./store/utility";

class WebSocketService {
  static instance = null;
  callbacks = {};

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocket.instance = new WebSocketService();
    }
    return WebSocket.instance;
  }

  constructor() {
    this.socketRef = null;
  }

  connect(room) {
    // const path = `wss://${server_endpoint}/ws/conference_detail/${room}/`; // for ngrok testing
    const path = `ws://${server_endpoint}/ws/conference_detail/${room}/`;
    this.socketRef = new WebSocket(path);
    this.socketRef.onopen = () => {
      console.log("WebSocket open");
    };
    this.socketRef.onmessage = (e) => {
      this.socketNewMessage(e.data);
    };
    this.socketRef.onerror = (e) => {
      console.log(e.message);
    };
    this.socketRef.onclose = () => {
      console.log("WebSocket closed");
      if (JSON.parse(localStorage.getItem("user"))) {
        console.log("let's reopen");
        this.connect(room);
      }
    };
  }

  disconnect() {
    this.socketRef.close();
  }
  detail() {
    return this.socketRef;
  }

  socketNewMessage(data) {
    const parseData = JSON.parse(data);
    const command = parseData.command;
    if (Object.keys(this.callbacks).length === 0) {
      return;
    }
    if (command === "set_offer") {
      this.callbacks[command](parseData.offer);
    }
    if (command === "set_candidate") {
      this.callbacks[command](parseData.candidate);
    }
    if (command === "set_answer") {
      this.callbacks[command](parseData.answer);
    }
    if (command === "change_display") {
      this.callbacks[command](parseData.id);
    }
    if (command === "remove") {
      this.callbacks[command]();
    }
  }

  offer(sdp, remote, local) {
    this.sendMessage({
      command: "offer",
      content: sdp,
      remoteId: remote,
      localId: local,
    });
  }
  answer(sdp, remote, local) {
    this.sendMessage({
      command: "answer",
      content: sdp,
      remoteId: remote,
      localId: local,
    });
  }
  candidate(cnd, remote, local) {
    this.sendMessage({
      command: "candidate",
      content: cnd,
      remoteId: remote,
      localId: local,
    });
  }
  changeDisplay(id) {
    this.sendMessage({
      command: "display",
      localId: id,
    });
  }
  removeStream() {
    this.sendMessage({
      command: "remove",
    });
  }
  addCallbacks(
    offerCallback,
    candidateCallback,
    answerCallback,
    addDisplayCallBack,
    addRemoveCallBack
  ) {
    this.callbacks["set_offer"] = offerCallback;
    this.callbacks["set_candidate"] = candidateCallback;
    this.callbacks["set_answer"] = answerCallback;
    this.callbacks["change_display"] = addDisplayCallBack;
    this.callbacks["remove"] = addRemoveCallBack;
  }

  sendMessage(data) {
    try {
      this.socketRef.send(JSON.stringify({ ...data }));
    } catch (err) {
      console.log(err.message);
    }
  }

  state() {
    return this.socketRef.readyState;
  }
}

const WebSocketInstance = WebSocketService.getInstance();
export default WebSocketInstance;
