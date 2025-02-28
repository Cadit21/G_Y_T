import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { MessageCircle, X, CheckCircle } from "lucide-react";

const socket = io("http://localhost:5000", { transports: ["websocket", "polling"], withCredentials: true });

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("food");
  const [resolvedQueries, setResolvedQueries] = useState([]);
  const [adminId, setAdminId] = useState(null);
  const [canteenStaffId, setCanteenStaffId] = useState(null);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.id || localStorage.getItem("userId");
  const role = localStorage.getItem("role") || "user";

  useEffect(() => {
    if (role === "user") {
      axios.get("http://localhost:5000/api/users/admin").then(res => setAdminId(res.data.adminId));
      axios.get("http://localhost:5000/api/users/canteen-staff").then(res => setCanteenStaffId(res.data.staffId));
    }
  }, [role]);

  const receiverId = messageType === "refund" ? adminId : canteenStaffId;

  useEffect(() => {
    if (isOpen && userId) {
      axios.get(`http://localhost:5000/api/messages/${userId}`).then(res => {
        const activeMessages = res.data.filter(msg => !msg.resolved);
        const resolvedMessages = res.data.filter(msg => msg.resolved);
        setMessages(activeMessages);
        setResolvedQueries(resolvedMessages);
      });
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (!userId) return;
    socket.emit("register", userId);
    socket.on("chatMessage", (data) => {
      setMessages(prev => [...prev, data]);
    });
    return () => socket.off("chatMessage");
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !receiverId) return;
    const messageData = { senderId: userId, senderName: user.username || "User", content: message, type: messageType, receiverId, resolved: false };
    try {
      await axios.post("http://localhost:5000/send", messageData);
      socket.emit("chatMessage", messageData);
      setMessages(prev => [...prev, messageData]);
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
    setMessage("");
  };

  const markAsResolved = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/messages/${id}/resolve`);
      setMessages(prev => prev.filter(msg => msg._id !== id));
      setResolvedQueries(prev => [...prev, messages.find(msg => msg._id === id)]);
    } catch (error) {
      console.error("❌ Error resolving message:", error);
    }
  };

  return (
    <div>
      <button className="fixed bottom-6 right-6 bg-green-500 text-white p-3 rounded-full shadow-lg" onClick={() => setIsOpen(!isOpen)}>
        <MessageCircle size={24} />
      </button>
      {isOpen && (
        <div className="fixed bottom-16 right-6 w-80 bg-white shadow-lg rounded-lg border p-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold">{role === "admin" ? "Admin Chat (Refunds)" : "User Support"}</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-500"><X size={20} /></button>
          </div>
          <div className="h-48 p-2 overflow-y-auto border bg-gray-100 rounded">
            {messages.map((msg) => (
              <div key={msg._id} className={`p-2 rounded ${msg.senderId === userId ? "bg-blue-200 text-right" : "bg-gray-200"}`}>
                <strong>{msg.senderId === userId ? "You" : msg.senderName}:</strong> {msg.content} ({msg.type})
                {role !== "user" && (
                  <button className="ml-2 text-green-500" onClick={() => markAsResolved(msg._id)}>
                    <CheckCircle size={16} />
                  </button>
                )}
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>
          {resolvedQueries.length > 0 && (
            <div className="mt-2 border-t pt-2">
              <h3 className="text-sm font-semibold">Resolved Queries</h3>
              <div className="h-24 overflow-y-auto">
                {resolvedQueries.map((msg) => (
                  <div key={msg._id} className="p-1 text-sm bg-gray-300 rounded mb-1">
                    <strong>{msg.senderName}:</strong> {msg.content} ({msg.type}) ✅
                  </div>
                ))}
              </div>
            </div>
          )}
          {role === "user" && (
            <div className="mt-2 flex">
              <input type="text" placeholder="Type a message..." className="flex-1 p-2 border rounded-l" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
              <button onClick={sendMessage} className="bg-green-500 text-white px-3 rounded-r">Send</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;