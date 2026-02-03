import { useEffect, useRef, useState } from "react";
import "./App.css";
import Picker from "emoji-picker-react";

const channel = new BroadcastChannel("modern-chat");

function App() {
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("chatMessages")) || []
  );
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [username] = useState("User" + Math.floor(Math.random() * 1000));
  const endRef = useRef(null);

  useEffect(() => {
    channel.onmessage = (e) => {
      setMessages((prev) => [...prev, e.data]);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text && !image) return;

    const msg = {
      user: username,
      text,
      img: image,
      time: new Date().toLocaleTimeString(),
      reactions: []
    };

    setMessages((prev) => [...prev, msg]);
    channel.postMessage(msg);

    setText("");
    setImage(null);
  };

  const onReact = (index, reaction) => {
    const updated = [...messages];
    updated[index].reactions.push(reaction);
    setMessages(updated);
  };

  const onImageChange = (e) => {
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(e.target.files[0]);
  };

  return (
    <div className="page-bg">
      <div className="glass-card">

        {/* HEADER */}
        <div className="chat-header">
          <h2>NexaChat</h2>
          <span>🔒 Secure</span>
        </div>

        {/* CHAT */}
        <div className="chat-body">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`message ${m.user === username ? "sent" : "received"}`}
            >
              <div className="bubble">
                <span className="user">{m.user}</span>
                {m.text && <p>{m.text}</p>}
                {m.img && <img src={m.img} alt="upload" />}
                <span className="time">{m.time}</span>

                <div className="reactions">
                  {m.reactions.map((r, idx) => (
                    <span key={idx}>{r}</span>
                  ))}
                  <span onClick={() => onReact(i, "❤️")}>❤️</span>
                  <span onClick={() => onReact(i, "👍")}>👍</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef}></div>
        </div>

        {showEmoji && <Picker onEmojiClick={(e) => setText(text + e.emoji)} />}

        {/* FOOTER */}
        <div className="chat-footer">
          <label className="icon-btn">
            📎
            <input type="file" hidden onChange={onImageChange} />
          </label>

          <input
            value={text}
            placeholder="Type your message..."
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button onClick={() => setShowEmoji(!showEmoji)}>😊</button>
          <button className="send" onClick={sendMessage}>➤</button>
        </div>

      </div>
    </div>
  );
}

export default App;
