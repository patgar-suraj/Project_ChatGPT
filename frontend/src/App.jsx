import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: input,
      time: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    socket.emit("ai-message", input)
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    let socketInstance = io("http://localhost:3000");
    setSocket(socketInstance);

    socketInstance.on("ai-message-response", (response)=>{
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        time: new Date().toISOString(),
        sender: "Bot:" 
      }
      setMessages((prev) => [...prev, botMessage]);
    })
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="app">
      <div className="chat">
        <header className="chat-header">
          <div className="title">Futuristic Chat</div>
          <div className="status">
            Online <span className="statusDot">•</span>
          </div>
        </header>

        <main className="messages" role="log" aria-live="polite">
          {messages.length === 0 ? (
            <div className="no-message">Start a conversation...</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${
                  msg.sender === "user" ? "outgoing" : "incoming"
                }`}
              >
                <div className="bubble">
                  <div className="text">{msg.text}</div>
                  <div className="meta">
                    {new Date(msg.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </main>

        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <textarea
            className="input"
            placeholder="Write a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button className="send" type="submit" aria-label="Send message">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
