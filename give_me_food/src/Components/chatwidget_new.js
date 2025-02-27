import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const SupportPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Floating Chat Button */}
      <button
        className="fixed bottom-6 right-6 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-500 transition z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle size={24} />
      </button>

      {/* Popup Chat Window */}
      {isOpen && (
        <div className="fixed bottom-16 right-6 w-80 bg-white shadow-lg rounded-lg border p-4 z-50">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold">Customer Support</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-500">
              <X size={20} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="h-48 p-2 overflow-y-auto text-sm text-gray-700">
            <p>👋 Hello! How can we assist you today?</p>
          </div>

          {/* Message Input */}
          <div className="mt-2 flex">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-l"
            />
            <button className="bg-red-500 text-white px-3 rounded-r">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPopup;
