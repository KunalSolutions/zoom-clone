import { io } from "socket.io-client";

const socket = io("https://zoom-clone-wnsp.onrender.com", {
  autoConnect: false,
});

export default socket;