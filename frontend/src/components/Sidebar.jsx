import React, { useState } from "react";
import { FaCog, FaUserCircle } from "react-icons/fa";
import { IoMdClose, IoMdAdd } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { createChat, setCurrentChat } from "../store/chatSlice";
import { Link } from "react-router-dom";

const Sidebar = ({ toggleSidebar, openCreateChatModal }) => {
  const dispatch = useDispatch();
  const { chats, currentChatId } = useSelector((s) => s.chat);

  const handleSelect = (id) => {
    dispatch(setCurrentChat(id));
    if (typeof toggleSidebar === "function") toggleSidebar();
  };

  return (
    <>
      <div className="w-64 h-screen flex flex-col bg-gray-100 dark:bg-[#212121] border-r border-gray-300 dark:border-gray-800 shadow-lg">
        {/* Header with Logo + Close Button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 dark:border-gray-800">
          <h1 className="text-lg font-bold text-indigo-600 dark:text-[#00A67D]">
            MyChats
          </h1>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-500"
          >
            <IoMdClose className="text-xl" />
          </button>
        </div>

        <button
          onClick={openCreateChatModal}
          className="m-4 p-2 bg-[#5D2DE6] hover:bg-indigo-500 transition-colors duration-500 text-white rounded-md flex items-center justify-center"
        >
          <IoMdAdd className="inline-block mr-2 text-xl" />
          <span>New Chat</span>
        </button>
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {chats.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 px-4">
              No chats yet. Click New Chat to start.
            </p>
          )}
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleSelect(chat.id)}
              className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors duration-500 truncate ${
                currentChatId === chat.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              {chat.title}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-400 dark:border-gray-800">
          <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
            <button className="flex items-center space-x-2 text-md hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-500">
              <FaUserCircle className="text-3xl" />
              <span className="font-semibold">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
