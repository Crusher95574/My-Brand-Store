import React, { useState, useRef, useEffect } from "react";
import { aiAPI } from "../../services/api";
import { useCart } from "../../context/CartContext";

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hello! I'm your AI Style Advisor ✨ Ask me for product recommendations, outfit ideas, or gift suggestions!",
};

const AiAdvisor = () => {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const messagesEndRef = useRef(null);
  const { cartItems } = useCart();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    console.log("Sending message to AI:", input);
    const userMessage = { role: "user", content: input.trim() };
    setInput("");
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Send full conversation history + cart context to backend
      const cartForApi = cartItems.map((item) => ({
        name: item.product?.name,
        price: item.product?.price,
        category: item.product?.category,
        quantity: item.quantity
      }));
      console.log("Sending cart context to AI API:", cartForApi);

      const { data } = await aiAPI.chat(
        [...messages, userMessage],
        cartForApi
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having trouble connecting right now. Please try again!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating Button ────────────────────────────────────────────────── */}
      <button
        className="ai-fab"
        onClick={() => setOpen((o) => !o)}
        title="AI Style Advisor"
        aria-label="Open AI Style Advisor"
      >
        {open ? "✕" : "✨"}
      </button>

      {/* ── Chat Panel ─────────────────────────────────────────────────────── */}
      {open && (
        <div className="ai-panel" role="dialog" aria-label="AI Style Advisor">
          {/* Header */}
          <div className="ai-panel-header">
            <div>
              <span className="ai-online-dot" />
              <strong>Style Advisor AI</strong>
            </div>
            <span className="ai-powered-by">Powered by Gemini</span>
          </div>

          {/* Messages */}
          <div className="ai-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-message ai-message-${msg.role}`}>
                {msg.role === "assistant" && (
                  <span className="ai-avatar">✨</span>
                )}
                <p>{msg.content}</p>
              </div>
            ))}
            {loading && (
              <div className="ai-message ai-message-assistant">
                <span className="ai-avatar">✨</span>
                <div className="ai-typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          {messages.length === 1 && (
            <div className="ai-quick-prompts">
              {["What's popular?", "Gift ideas under $150", "Style a blazer"].map((p) => (
                <button key={p} className="ai-quick-btn" onClick={() => setInput(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="ai-input-area">
            <textarea
              className="ai-input"
              placeholder="Ask about products, style, gifts…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="ai-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAdvisor;
