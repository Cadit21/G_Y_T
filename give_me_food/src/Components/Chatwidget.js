import React, { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react"; // Icons
import axios from "axios";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(localStorage.getItem("role") || "guest");

useEffect(() => {
  const updateRole = () => {
    const storedRole = localStorage.getItem("role") || "guest"; // Default to guest if null
    console.log("Updated Role:", storedRole);
    setRole(storedRole);
  };

  updateRole(); // Initial check

  // Listen for changes in localStorage from any tab
  window.addEventListener("storage", updateRole);

  // Also check on every render in case role changes in the same tab
  const interval = setInterval(updateRole, 1000); 

  return () => {
    window.removeEventListener("storage", updateRole);
    clearInterval(interval); //
  };
}, []); 
  
  
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: input }],
        },
        {
          headers: {
            Authorization: `Bearer YOUR_OPENAI_API_KEY`,
            "Content-Type": "application/json",
          },
        }
      );

      const botReply = response.data.choices[0].message.content;
      setMessages([...newMessages, { text: botReply, sender: "bot" }]);
    } catch (error) {
      console.error("Error fetching AI response", error);
      setMessages([...newMessages, { text: "Error: Unable to fetch response", sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  // 🛑 If the role is NOT "user", don't render the chat widget
  if (role !== "user") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="w-80 bg-white shadow-2xl rounded-lg p-4 flex flex-col">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-bold">Chat with AI</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-red-500">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-2 p-2 h-64 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <p className="text-gray-500">AI is typing...</p>}
          </div>

          <div className="flex mt-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me something..."
              className="flex-1 p-2 border rounded-l-lg focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
