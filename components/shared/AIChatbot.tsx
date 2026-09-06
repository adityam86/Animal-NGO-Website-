"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, AlertTriangle, PhoneCall, ShieldAlert } from "lucide-react";
import Link from "next/link";

type ChatMessage = {
  sender: "user" | "bot";
  text: string;
  isEmergency?: boolean;
  title?: string;
  steps?: string[];
  warnings?: string[];
  dispatchUrl?: string;
  hotline?: string;
};

const QUICK_PROMPTS = [
  { label: "🚨 Bleeding Animal", query: "An animal is bleeding from an accident, what first aid should I do?" },
  { label: "☀️ Heat Stroke", query: "A cow or dog collapsed in the heat, how to help?" },
  { label: "🐶 Abandoned Puppies", query: "Found abandoned newborn puppies, what to do?" },
  { label: "🦴 Broken Bone", query: "A street dog is limping with suspected fracture" },
  { label: "❤️ How to Adopt", query: "How does the adoption process work?" },
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Hello! I am the Ayudar AI Emergency & Animal Care Assistant.\n\nAsk me for instant first-aid triage (e.g. bleeding, heat stroke, abandoned puppies) or info on adoptions, sponsorships, and donations.",
      isEmergency: false
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend.trim();
    setInput("");
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: data.reply || "I am here to assist.",
          isEmergency: data.isEmergency,
          title: data.title,
          steps: data.steps,
          warnings: data.warnings,
          dispatchUrl: data.dispatchUrl,
          hotline: data.hotline
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Connection interrupted. For immediate life-threatening emergencies, please call our 24/7 hotline at +91 98000 00000 or click Report an Animal.",
          isEmergency: true,
          dispatchUrl: "/rescue",
          hotline: "+91 98000 00000"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999, fontFamily: "inherit" }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--saffron-500) 0%, #ea580c 100%)",
            color: "white",
            border: "none",
            boxShadow: "0 6px 20px rgba(234, 88, 12, 0.35)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s, box-shadow 0.2s",
            position: "relative",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.06)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(234, 88, 12, 0.45)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(234, 88, 12, 0.35)";
          }}
          aria-label="Open AI Emergency & Support Chat"
        >
          <MessageSquare size={26} />
          {/* Emergency indicator dot */}
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#ef4444",
              border: "2px solid white",
            }}
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            width: "min(380px, calc(100vw - 2rem))",
            height: "560px",
            background: "white",
            borderRadius: "var(--radius-2xl)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
            border: "1px solid var(--cream-200)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "fadeInUp 0.25s ease-out",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, var(--stone-900) 0%, var(--stone-800) 100%)",
              color: "white",
              padding: "1rem 1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "var(--saffron-500)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  Ayudar First-Aid AI
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--green-400)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green-400)", display: "inline-block" }} />
                  24/7 Triage & Guidance
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: "0.35rem",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Close Chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick prompt chips */}
          <div
            style={{
              padding: "0.6rem 0.75rem",
              background: "var(--cream-100)",
              borderBottom: "1px solid var(--cream-200)",
              display: "flex",
              gap: "0.4rem",
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(p.query)}
                style={{
                  whiteSpace: "nowrap",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "0.3rem 0.65rem",
                  borderRadius: "var(--radius-full)",
                  background: "white",
                  border: "1px solid var(--cream-300)",
                  color: "var(--stone-700)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--saffron-100)";
                  e.currentTarget.style.borderColor = "var(--saffron-400)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "var(--cream-300)";
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages container */}
          <div
            style={{
              flex: 1,
              padding: "1rem",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              background: "var(--cream-50)",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: msg.isEmergency ? "95%" : "88%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                }}
              >
                <div
                  style={{
                    background: msg.sender === "user" ? "var(--saffron-600)" : "white",
                    color: msg.sender === "user" ? "white" : "var(--stone-800)",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-lg)",
                    borderTopRightRadius: msg.sender === "user" ? "4px" : "var(--radius-lg)",
                    borderTopLeftRadius: msg.sender === "bot" ? "4px" : "var(--radius-lg)",
                    fontSize: "0.84rem",
                    lineHeight: 1.5,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    border: msg.isEmergency ? "1px solid #fca5a5" : "1px solid var(--cream-200)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {/* Emergency Title */}
                  {msg.title && (
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#dc2626",
                        fontSize: "0.9rem",
                        marginBottom: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <ShieldAlert size={18} />
                      {msg.title}
                    </div>
                  )}

                  {/* Body text */}
                  <div>{msg.text}</div>

                  {/* Structured First-Aid Steps */}
                  {msg.steps && msg.steps.length > 0 && (
                    <div style={{ marginTop: "0.6rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <strong style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--stone-500)" }}>
                        Immediate Action Steps:
                      </strong>
                      {msg.steps.map((step, sIdx) => (
                        <div key={sIdx} style={{ display: "flex", gap: "0.45rem", fontSize: "0.82rem", alignItems: "flex-start" }}>
                          <span style={{ fontWeight: 700, color: "var(--saffron-700)", flexShrink: 0 }}>{sIdx + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Safety Warnings */}
                  {msg.warnings && msg.warnings.length > 0 && (
                    <div
                      style={{
                        marginTop: "0.65rem",
                        padding: "0.5rem 0.65rem",
                        background: "#fef2f2",
                        borderRadius: "var(--radius-md)",
                        borderLeft: "3px solid #ef4444",
                        fontSize: "0.78rem",
                        color: "#991b1b",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                      }}
                    >
                      {msg.warnings.map((warn, wIdx) => (
                        <div key={wIdx} style={{ display: "flex", gap: "0.35rem", alignItems: "flex-start" }}>
                          <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: "2px" }} />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Emergency Action Buttons */}
                  {msg.isEmergency && (
                    <div style={{ marginTop: "0.85rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {msg.dispatchUrl && (
                        <Link
                          href={msg.dispatchUrl}
                          onClick={() => setIsOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                            background: "#dc2626",
                            color: "white",
                            padding: "0.55rem 0.75rem",
                            borderRadius: "var(--radius-md)",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            textDecoration: "none",
                            boxShadow: "0 2px 6px rgba(220, 38, 38, 0.25)",
                          }}
                        >
                          🚨 Dispatch Ambulance / Report Case
                        </Link>
                      )}
                      {msg.hotline && (
                        <a
                          href={`tel:${msg.hotline.replace(/\s+/g, "")}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                            background: "var(--stone-900)",
                            color: "white",
                            padding: "0.45rem 0.75rem",
                            borderRadius: "var(--radius-md)",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          <PhoneCall size={14} />
                          Call 24/7 Emergency Line: {msg.hotline}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "white",
                  color: "var(--stone-400)",
                  padding: "0.6rem 0.9rem",
                  borderRadius: "var(--radius-lg)",
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                  border: "1px solid var(--cream-200)",
                }}
              >
                Preparing clinical triage instructions...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: "0.75rem",
              borderTop: "1px solid var(--cream-200)",
              display: "flex",
              gap: "0.5rem",
              background: "white",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about first aid, symptoms, adoption..."
              style={{
                flex: 1,
                border: "1px solid var(--cream-300)",
                borderRadius: "var(--radius-md)",
                padding: "0.55rem 0.85rem",
                fontSize: "0.84rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: "var(--saffron-600)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-md)",
                padding: "0.55rem 0.85rem",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
              }}
              aria-label="Send query"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
