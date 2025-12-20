// utils/socket.js
import { io } from "socket.io-client";

// Chỉ tạo duy nhất 1 biến socket và export nó
export const socket = io("http://localhost:3000", {
  autoConnect: true,
  reconnection: true
});