"use client"

import React from "react"

type AnyMsg = Record<string, any>

export default function ChatBubble({ msg }: { msg: AnyMsg }) {
  const renderContent = () => {
    const message = msg?.message || {};
    const key = msg?.key || {};

    // Texto simples
    if (message?.conversation) return <p>{message.conversation}</p>;

    // Texto estendido
    if (message?.extendedTextMessage?.text) return <p>{message.extendedTextMessage.text}</p>;

    // Imagem
    if (message?.imageMessage) {
      const im = message.imageMessage;
      const url = im?.url || im?.directPath || im?.jpegThumbnail || "";
      return (
        <div>
          {url ? <img src={url} alt="imagem" className="max-w-xs rounded-lg" /> : <i>Imagem (sem URL)</i>}
          {im?.caption && <p>{im.caption}</p>}
        </div>
      );
    }

    // Vídeo
    if (message?.videoMessage) {
      const vm = message.videoMessage;
      const url = vm?.url || vm?.directPath || "";
      return (
        <div>
          {url ? (
            <video controls className="max-w-xs rounded-lg">
              <source src={url} />
            </video>
          ) : (
            <i>Vídeo (sem URL)</i>
          )}
          {vm?.caption && <p>{vm.caption}</p>}
        </div>
      );
    }

    // Áudio
    if (message?.audioMessage) {
      const am = message.audioMessage;
      const url = am?.url || am?.directPath || "";
      return url ? (
        <audio controls>
          <source src={url} />
          Seu navegador não suporta áudio.
        </audio>
      ) : (
        <i>Áudio (sem URL)</i>
      );
    }

    // Documento
    if (message?.documentMessage) {
      const dm = message.documentMessage;
      const url = dm?.url || dm?.directPath || "";
      const name = dm?.fileName || "Abrir documento";
      return url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          {name}
        </a>
      ) : (
        <i>Documento (sem URL)</i>
      );
    }

    // Fallbacks
    if (typeof msg?.body === "string") return <p>{msg.body}</p>;

    return <i>Tipo de mensagem não suportado</i>;
  };

  const fromMe = Boolean(msg?.key?.fromMe || false);
  const ts = msg?.messageTimestamp ? new Date(msg.messageTimestamp * 1000) : null;

  return (
    <div
      className={`my-2 p-3 rounded-2xl shadow-sm max-w-[75%] ${
        fromMe ? "bg-green-200 ml-auto" : "bg-gray-200 mr-auto"
      }`}
    >
      {renderContent()}
      {ts && <small className="block text-right text-xs text-gray-500 mt-1">
        {ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
      </small>}
    </div>
  );
}