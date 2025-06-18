import React, { useState, useEffect, useContext } from "react";
import { userContext } from "../../context/userContext";
import axios from "axios";
import { toast } from "react-toastify";

import { CheckCheck ,Pencil, Trash2, Trash,Send } from "lucide-react"; // Icons for better UI

const Chat = () => {
  const { user } = useContext(userContext);
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const [unreadCounts, setUnreadCounts] = useState({});


  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/user`);
        setContacts(res.data.users.filter((u) => u._id !== user._id));
      } catch (err) {
        console.error("Failed to fetch contacts", err);
        toast.error("Something went wrong while fetching contact");

      }
    };
    fetchContacts();
  }, [user._id]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        const res = await axios.get(`${baseUrl}/api/chat`, {
          params: { userId: user._id, receiverId: selectedUser._id },
        });
        setMessages(res.data.messages);
      } catch (err) {
        console.error("Failed to fetch messages", err);
        toast.error("Something went wrong while fetching messages");

      }
    };
    fetchMessages();
  }, [selectedUser, user._id]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(`${baseUrl}/api/chat/send`, {
        sender: user._id,
        receiver: selectedUser._id,
        content: newMessage,
        type: "text",
      });
      setMessages((prev) => [...prev, res.data.message]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("Failed to Send Message");

    }
  };

  const handleEditMessage = (messageId, currentContent) => {
    setEditingMessageId(messageId);
    setEditingContent(currentContent);
  };
const handleSelectContact = async (contact) => {
  setSelectedUser(contact);

  try {
    // Step 1: Fetch latest messages between user and selected contact
    const res = await axios.get(`${baseUrl}/api/chat`, {
      params: { userId: user._id, receiverId: contact._id },
    });

    const fetchedMessages = res.data.messages;
    setMessages(fetchedMessages);

    // Step 2: Mark unseen messages as seen
    const unseenMessages = fetchedMessages.filter(
      (msg) =>
        msg.sender === contact._id &&
        msg.receiver === user._id &&
        msg.seenBy !== "Seen"
    );

    if (unseenMessages.length > 0) {
      await Promise.all(
        unseenMessages.map((msg) =>
          axios.patch(`${baseUrl}/api/chat/seen/${msg._id}`)
        )
      );

      // Step 3: Re-fetch messages (optional, only if needed to reflect `seenBy`)
      const updatedRes = await axios.get(`${baseUrl}/api/chat`, {
        params: { userId: user._id, receiverId: contact._id },
      });
      setMessages(updatedRes.data.messages);
    }

    // Step 4: Update unread counts
    const unreadRes = await axios.get(`${baseUrl}/api/chat/unread-counts`, {
      params: { userId: user._id },
    });
    setUnreadCounts(unreadRes.data.counts || {});
  } catch (err) {
    console.error("Failed to handle contact select", err);
    toast.error("Error fetching or updating messages");
  }
};

useEffect(() => {
  if (contacts.length > 0) {
    const fetchUnreadCounts = async () => {
      try {
       const res = await axios.get(`${baseUrl}/api/chat/unread-counts`, {
  params: { userId: user._id },
});
setUnreadCounts(res.data.counts || {});

        if (res.data.success) {
          const countsObj = {};
          res.data.counts.forEach(({ contactId, count }) => {
            countsObj[contactId] = count;
          });
          setUnreadCounts(countsObj);
        }
      } catch (err) {
        console.error("Failed to fetch unread counts", err);
        toast.error("Failed to fetch unread counts");
      }
    };
    fetchUnreadCounts();
  }
}, [contacts]); // Only watch contacts here



  const submitEdit = async () => {
    if (!editingContent.trim()) {
      alert("Message cannot be empty");
      return;
    }
    try {
      const res = await axios.patch(`${baseUrl}/api/chat/edit/${editingMessageId}`, {
        userId: user._id,
        newContent: editingContent,
      });

      if (res.data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === editingMessageId ? res.data.message : msg
          )
        );
        setEditingMessageId(null);
        setEditingContent("");
        toast.success("Edited Successfully");
      }
    } catch (err) {
      console.error("Failed to edit message", err);
      toast.error("Failed to edit message");

    }
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      const res = await axios.patch(
        `${baseUrl}/api/chat/deleteforme/${messageId}`,
        { userId: user._id }
      );

      if (res.data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        toast.success("Deleted Successfully");
      }
    } catch (err) {
      console.error("Failed to delete message for me", err);
      toast.error("Failed to delete message for me");
    }
  };

  const handleDeleteForEveryone = async (messageId, senderId) => {
    if (senderId !== user._id) return;
    try {
      const res = await axios.delete(`${baseUrl}/api/chat/deleteforeveryone/${messageId}`);
      if (res.data.status) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        toast.success("Deleted Successfully");
      }
    } catch (err) {
      console.error("Failed to delete message for everyone", err);
      toast.error("Failed to delete message for everyone");
    }
  };

  return (
    <div className="flex overflow-y-auto x-auto flex-col md:flex-row h-screen bg-gray-50 text-sm dark:bg-white/[0.03] dark:text-white">
      {/* Contacts */}
      <div className="w-full md:w-1/4  bg-white overflow-y-auto dark:bg-white/[0.03] ">
        <div className="p-4 font-semibold text-lg ">Contacts</div>
        {contacts.map((contact) => {
  const unreadCount = unreadCounts[contact._id] || 0;

  return (
    contact.role !== "attendees" && (
      <div
        key={contact._id}
        onClick={() => handleSelectContact(contact)}
        className={`p-3 cursor-pointer dark:hover:bg-zinc-800 hover:bg-gray-100 ${
          selectedUser?._id === contact._id
            ? "bg-blue-100 dark:bg-zinc-700 font-medium"
            : ""
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              {contact.username || contact.email}
            </span>

            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {contact.role}
            </span>
          </div>

          {unreadCount > 0 && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    )
  );
})}


      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white dark:bg-white/[0.03] border-b shadow text-base font-semibold truncate">
          {selectedUser
            ? selectedUser.username || selectedUser.email
            : "Select a contact to chat"}
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`relative max-w-[90%] sm:max-w-md px-3 py-2 rounded-lg shadow-sm text-sm break-words ${
                msg.sender === user._id
                  ? "bg-lime-600 text-white ml-auto"
                  : "bg-gray-300 text-gray-900"
              }`}
            >
              {editingMessageId === msg._id ? (
                <>
                  <input
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full p-1 rounded text-black"
                  />
                  <div className="flex gap-2 mt-1 text-xs">
                    <button
                      onClick={submitEdit}
                      className="bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingMessageId(null)}
                      className="bg-gray-400 text-white px-2 py-0.5 rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    {msg.content}
                    {msg.edited && (
                      <span className="italic text-xs ml-1">(edited)</span>
                    )}
                  </p>
                  <div className="flex justify-end mt-1 gap-2 text-xs text-white">
                    <button
                      onClick={() => handleDeleteForMe(msg._id)}
                      className="hover:text-red-400"
                      title="Delete for me"
                    >
                      <Trash size={14} />
                    </button>
                    {msg.sender === user._id && (
                      <>
                        <button
                          onClick={() => handleEditMessage(msg._id, msg.content)}
                          className="hover:text-yellow-300"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteForEveryone(msg._id, msg.sender)}
                          className="hover:text-red-200"
                          title="Delete for everyone"
                        >
                          <Trash2 size={14} />
                        </button>
                        {/* Seen tick */}
                  {msg.sender === user._id && (
                    <div className="flex justify-end mt-1">
                      <CheckCheck
                        size={16}
                        className={`${
                          msg.seenBy === "Seen"
                            ? "text-blue-600"
                            : "text-white"
                        }`}
                      />
                    </div>
                  )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        {selectedUser && (
          <div className="p-3 bg-white dark:bg-white/[0.03] border-t flex flex-col sm:flex-row gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
           <button
  onClick={handleSend}
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
  title="Send"
>
  <Send size={18} />
</button>

          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
