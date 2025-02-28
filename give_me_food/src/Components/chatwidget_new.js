import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { MessageCircle, X, Archive } from "lucide-react";

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("food");
  const [adminId, setAdminId] = useState("");
  const [canteenStaffId, setCanteenStaffId] = useState("");
  const [resolvedQueries, setResolvedQueries] = useState([]);
  const [showResolved, setShowResolved] = useState(false);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.id || localStorage.getItem("userId");
  const role = localStorage.getItem("role") || "user";

  useEffect(() => {
    if (role === "user") {
      axios.get("http://localhost:5000/admin")
        .then(res => setAdminId(res.data.adminId || ""))
        .catch(err => console.error("Error fetching admin:", err));

      axios.get("http://localhost:5000/canteen-staff")
        .then(res => setCanteenStaffId(res.data.staffId || ""))
        .catch(err => console.error("Error fetching canteen staff:", err));
    }
  }, [role]);

  const receiverId = messageType === "refund" ? adminId : canteenStaffId;

  const sendMessage = async () => {
    if (!message.trim() || !receiverId) return;

    try {
        // Step 1: Check for an existing query ID
        let queryId = localStorage.getItem("queryId");

        if (!queryId) {
            // Log the request payload before sending
            console.log("Requesting new query ID with data:", {
                senderId: userId,
                senderName: user.username || "User",
                type: messageType,  // Ensure this matches schema
                content: message,  // Ensure this is included
            });

            // Step 2: Request a unique query ID from the backend
            const response = await axios.post("http://localhost:5000/api/generate-query-id", {
              senderId: userId,  
              senderName: user.username || "User",
              type: messageType,  // 🔹 Fix: Ensure `type` is correctly sent
              content: message,  
          });
          

            console.log("Received response:", response.data);

            queryId = response.data.queryId;
            localStorage.setItem("queryId", queryId);
        }

        // Step 3: Prepare message data
        const messageData = {
            senderId: userId,
            senderName: user.username || "User",
            content: message,
            type: messageType,
            receiverId,
            queryId,
        };

        console.log("Sending message data:", messageData);

        // Step 4: Send message to backend
        const msgResponse = await axios.post("http://localhost:5000/send-message", messageData);
        console.log("Message sent successfully:", msgResponse.data);

        // Emit socket event and update UI
        socket.emit("chatMessage", messageData);
        setMessages(prev => [...prev, messageData]);

        setMessage("");
    } catch (error) {
        console.error("Error sending message:", error?.response?.data || error);
    }
};


  const fetchResolvedQueries = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/resolved-queries/${userId}`);
      setResolvedQueries(res.data || []);
      setShowResolved(!showResolved);
    } catch (error) {
      console.error("Error fetching resolved queries:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Fetch resolved queries
      axios.get(`http://localhost:5000/api/resolved-queries/${userId}`)
        .then(res => setResolvedQueries(res.data || []))
        .catch(err => console.error("Error fetching resolved queries:", err));
  
      // Fetch all messages
      axios.get(`http://localhost:5000/api/messages/${userId}`)
        .then(res => {
          // Filter messages that belong to unresolved queries
          const unresolvedMessages = res.data.filter(msg => 
            !resolvedQueries.some(query => query.queryId === msg.queryId)
          );
          setMessages(unresolvedMessages);
        })
        .catch(err => console.error("Error fetching messages:", err));
    }
  }, [isOpen]);

  return (
    <div>
      <button
        className="fixed bottom-6 right-6 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-16 right-6 w-80 bg-white shadow-lg rounded-lg border p-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold">
              {role === "admin" ? "Admin Chat (Refunds)" : role === "canteen_staff" ? "Canteen Chat (Food)" : "User Support"}
            </h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-500">
              <X size={20} />
            </button>
          </div>

          <button 
            className="w-full mt-2 bg-gray-300 p-2 rounded flex items-center justify-center hover:bg-gray-400 transition"
            onClick={fetchResolvedQueries}
          >
            <Archive size={18} className="mr-2" /> Previous Resolved Queries
          </button>

          {showResolved && (
            <div className="h-32 p-2 overflow-y-auto border bg-gray-100 rounded mt-2">
              {resolvedQueries.length > 0 ? (
                resolvedQueries.map((query, idx) => (
                  <p key={idx} className="text-sm p-1 rounded bg-gray-200">
                    <strong>{query.type === "food" ? "🍔 Food Issue" : "💰 Refund Issue"}:</strong> {query.content}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-500">No resolved queries found.</p>
              )}
            </div>
          )}

          <div className="h-48 p-2 overflow-y-auto border bg-gray-100 rounded mt-2">
            {messages.map((msg, idx) => (
              <p key={idx} className={`text-sm p-1 rounded ${msg.senderId === userId ? "bg-blue-200 text-right" : "bg-gray-200"}`}>
                <strong>{msg.senderId === userId ? "You" : msg.senderName}:</strong> {msg.content} ({msg.type})
              </p>
            ))}
            <div ref={messagesEndRef}></div>
          </div>

          {role === "user" && (
            <>
              <div className="flex gap-2 mt-2">
                <button className={`px-3 py-1 rounded ${messageType === "food" ? "bg-red-500 text-white" : "bg-gray-300"}`} onClick={() => setMessageType("food")}>
                  🍔 Food Issue
                </button>
                <button className={`px-3 py-1 rounded ${messageType === "refund" ? "bg-blue-500 text-white" : "bg-gray-300"}`} onClick={() => setMessageType("refund")}>
                  💰 Refund Issue
                </button>
              </div>
              <div className="mt-2 flex">
                <input type="text" placeholder="Type a message..." className="flex-1 p-2 border rounded-l" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} />
                <button onClick={sendMessage} className="bg-green-500 text-white px-3 rounded-r">Send</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
