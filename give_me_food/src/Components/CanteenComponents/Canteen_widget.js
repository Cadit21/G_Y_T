import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { MessageCircle, X } from "lucide-react";

const socket = io("http://localhost:5000", { 
  transports: ["websocket", "polling"], 
  withCredentials: true,
  reconnection: true 
});

const CanteenChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [selectedQuery, setSelectedQuery] = useState(null);
  const messagesEndRef = useRef(null);

  const staff = JSON.parse(localStorage.getItem("user")) || {};
  const staffId = staff._id || localStorage.getItem("canteenStaffId");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("http://localhost:5000/canteen");
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!staffId) return;

    const handleIncomingMessage = (data) => {
      if (data.receiverId === staffId) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("chatMessage", handleIncomingMessage);

    return () => {
      socket.off("chatMessage", handleIncomingMessage);
    };
  }, [staffId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedQuery && messages.length > 0) {
      setSelectedQuery(messages[messages.length - 1].queryId);
    }
  }, [messages]);

  const sendReply = async () => {
    if (!reply.trim() || !selectedQuery) return;

    const replyData = {
      senderId: staffId,
      senderName: staff.username || "Canteen Staff",
      content: reply,
      type: "food-reply",
      receiverId: messages.find(msg => msg.queryId === selectedQuery)?.senderId,
      queryId: selectedQuery,
    };

    socket.emit("chatMessage", replyData);
    setMessages((prev) => [...prev, replyData]);
    setReply("");

    try {
      await fetch("http://localhost:5000/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(replyData),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  return (
    <div>
      <button
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-16 right-6 w-96 bg-white shadow-lg rounded-lg border p-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold">Canteen Chat</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-500">
              <X size={20} />
            </button>
          </div>

          <div className="mb-2">
            <h3 className="text-sm font-semibold">Select Query:</h3>
            <select
              className="w-full p-2 border rounded"
              onChange={(e) => setSelectedQuery(e.target.value)}
              value={selectedQuery || ""}
            >
              <option value="" disabled>Select a Query</option>
              {[...new Set(messages.map((msg) => msg.queryId))].map((queryId) => (
                <option key={queryId} value={queryId}>
                  Query {queryId}
                </option>
              ))}
            </select>
          </div>

          <div className="h-48 p-2 overflow-y-auto border bg-gray-100 rounded">
            {messages
              .filter((msg) => msg.queryId === selectedQuery)
              .map((msg, idx) => (
                <p key={idx} className={`text-sm p-1 rounded ${msg.senderId === staffId ? "bg-green-200 text-right" : "bg-gray-200"}`}>
                  <strong>{msg.senderId === staffId ? "You" : msg.senderName}:</strong> {msg.content}
                </p>
              ))}
            <div ref={messagesEndRef}></div>
          </div>

          <div className="mt-2 flex">
            <input
              type="text"
              placeholder="Type a reply..."
              className="flex-1 p-2 border rounded-l"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendReply()}
            />
            <button onClick={sendReply} disabled={!selectedQuery || !reply.trim()} className="bg-blue-500 text-white px-3 rounded-r disabled:opacity-50">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanteenChatWidget;
