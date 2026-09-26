import { useEffect, useRef, useState } from "react";
import { useSession } from "../hooks/SessionContext";

const QUICK_REACTIONS = ["❤️", "😂", "😍", "😮", "😢"];

export default function ChatPanel() {
  const { messages, sendChat, sendReaction, displayName } = useSession();
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  function handleSend() {
    if (!text.trim()) return;
    sendChat(text.trim());
    setText("");
  }

  return (
    <div className="chat-panel">
      <div className="reaction-row">
        {QUICK_REACTIONS.map((emoji) => (
          <button key={emoji} onClick={() => sendReaction(emoji)}>
            {emoji}
          </button>
        ))}
      </div>

      <div className="chat-messages" ref={listRef} style={{ maxHeight: 220 }}>
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.from === displayName ? "mine" : "theirs"}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="chat-input-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message…"
        />
        <button className="btn btn-primary" style={{ width: "auto", padding: "10px 16px" }} onClick={handleSend}>
          ➤
        </button>
      </div>
    </div>
  );
}
