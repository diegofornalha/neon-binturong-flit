"use client"

import React from "react"
import ChatBubble from "./ChatBubble"

export default function ChatWindow({ messages }: { messages: any[] }) {
  if (!Array.isArray(messages)) return null;

  return (
    <div className="flex flex-col p-4 space-y-2 overflow-y-auto">
      {messages.map((msg: any, idx: number) => (
        <ChatBubble key={msg?.id || msg?.key?.id || idx} msg={msg} />
      ))}
    </div>
  );
}