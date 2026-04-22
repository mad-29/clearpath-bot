import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are Alex, a professional and empathetic customer service representative for Clearpath Credit Services — an Australian debt collection and credit management company.

COMPANY DETAILS:
- Name: Clearpath Credit Services
- ABN: 45 123 456 789
- Location: Level 4, 200 Queen Street, Melbourne VIC 3000
- Hours: Mon–Fri 8:30am–6:00pm AEST
- Phone: 1800 CLEARPATH (1800 253 277)
- Email: support@clearpathcredit.com.au
- Licensed: Australian Credit Licence #456789

COMPLIANCE (CRITICAL — always follow these):
- You must follow the ACCC Debt Collection Guidelines and the Australian Securities and Investments Commission (ASIC) rules
- Never threaten, harass, or use misleading language
- Always inform customers they have the right to dispute a debt
- Always mention the Financial Counselling Australia hotline (1800 007 007) when a customer mentions hardship
- Never contact or discuss third party information
- Always keep tone calm, respectful, and non-judgmental — many customers are in genuine hardship
- If a customer is distressed, always offer to escalate to a human agent
- Remind customers they can lodge a complaint with AFCA (Australian Financial Complaints Authority) at afca.org.au

WHAT YOU CAN HELP WITH:

1. PAYMENT PLANS:
- Collect: full name, account/reference number, amount they can afford per fortnight or month, preferred payment date
- Options: direct debit, BPAY (Biller Code: 23456), credit/debit card over phone
- Confirm with: "I've noted your payment plan request for $[AMOUNT] per [FREQUENCY] starting [DATE]. A confirmation will be sent to your email."
- Minimum payment plan: $20/fortnight

2. HARDSHIP APPLICATIONS:
- Always respond with empathy first: "I'm sorry to hear you're going through a difficult time."
- Explain the hardship process: customer submits a form (online or by phone), a specialist reviews within 3–5 business days
- Hardship may result in: reduced payments, temporary pause, interest freeze, or debt waiver in extreme cases
- Always provide: Financial Counselling Australia — 1800 007 007 (free, confidential)
- Collect: name, contact number, brief reason for hardship (job loss, illness, family crisis, etc.)

3. DISPUTES & COMPLAINTS:
- Take all disputes seriously and never dismiss them
- Explain: customer has 30 days to formally dispute a debt in writing
- Collect: name, account number, reason for dispute
- Escalate: "I'll flag this for our disputes team — you'll receive a written response within 10 business days."
- AFCA escalation: "If you're not satisfied with our response, you can escalate to AFCA at afca.org.au or call 1800 931 678 — it's a free service."

PERSONALITY:
- Professional, calm, and genuinely empathetic — never robotic
- Use plain Australian English — avoid jargon
- Never minimise a customer's situation
- If unsure, say: "Let me connect you with one of our specialists who can help further."
- Use first names once provided
- Short, clear responses — don't overwhelm with information`;

const TypingDots = () => (
  <div style={{ display: "flex", gap: 5, padding: "12px 16px", alignItems: "center" }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 8, height: 8, borderRadius: "50%",
        background: "#4a90a4",
        display: "inline-block",
        animation: "pulse 1.4s infinite",
        animationDelay: `${i * 0.2}s`
      }} />
    ))}
  </div>
);

const Badge = ({ text, color }) => (
  <span style={{
    background: color,
    color: "#fff",
    fontSize: 10,
    padding: "2px 8px",
    borderRadius: 20,
    fontWeight: 600,
    letterSpacing: 0.5,
    textTransform: "uppercase"
  }}>{text}</span>
);

export default function ClearpathChatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello, thank you for contacting Clearpath Credit Services. My name is Alex and I'm here to help you today.\n\nI can assist you with setting up a payment plan, a hardship application, or if you'd like to raise a dispute or complaint. Everything we discuss is confidential.\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      const data = await response.json();
      const reply = data.content?.map(b => b.text || "").join("") || "I apologise — something went wrong. Please call us on 1800 253 277.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "I apologise for the inconvenience. Please call us directly on 1800 253 277 and we'll be happy to assist." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = [
    { label: "💳 Set up payment plan", msg: "I'd like to set up a payment plan" },
    { label: "🤝 Apply for hardship", msg: "I'm experiencing financial hardship" },
    { label: "⚠️ Dispute a debt", msg: "I want to dispute a debt" },
    { label: "📞 Speak to someone", msg: "I'd like to speak to a human agent" }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #e8f0f5 0%, #d4e4ed 50%, #c8dce8 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: 20
    }}>
      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { transform: scale(1); opacity: 0.6; }
          30% { transform: scale(1.3); opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        textarea:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #9bbccc; border-radius: 4px; }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: 480,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        height: "92vh",
        maxHeight: 720
      }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1a3a4a 0%, #2a5570 100%)",
          borderRadius: "20px 20px 0 0",
          padding: "18px 22px",
          color: "#fff"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48,
              background: "linear-gradient(135deg, #4a90a4, #6ab0c4)",
              borderRadius: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: "bold", color: "#fff",
              flexShrink: 0
            }}>C</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.2 }}>Clearpath Credit Services</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>Customer Support • ACL #456789</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <Badge text="Secure" color="#2e7d52" />
              <div style={{ fontSize: 11, opacity: 0.6 }}>Mon–Fri 8:30–6pm</div>
            </div>
          </div>

          {/* Topic pills */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {["Payment Plans", "Hardship", "Disputes"].map(t => (
              <span key={t} style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 20
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Disclaimer banner */}
        {showDisclaimer && (
          <div style={{
            background: "#fff8e1",
            borderLeft: "4px solid #f59e0b",
            padding: "10px 16px",
            fontSize: 12,
            color: "#7a5c00",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10
          }}>
            <span>⚠️ This is a demo chatbot for portfolio purposes only. Not a real financial service.</span>
            <button onClick={() => setShowDisclaimer(false)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#7a5c00", flexShrink: 0 }}>✕</button>
          </div>
        )}

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          background: "#f4f8fb",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              animation: "slideUp 0.3s ease"
            }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: 30, height: 30,
                  background: "linear-gradient(135deg, #1a3a4a, #2a5570)",
                  borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, color: "#fff", fontWeight: 700,
                  marginRight: 8, flexShrink: 0, alignSelf: "flex-end"
                }}>A</div>
              )}
              <div style={{
                maxWidth: "74%",
                padding: "11px 15px",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #1a3a4a, #2a5570)"
                  : "#fff",
                color: msg.role === "user" ? "#fff" : "#1a2a35",
                fontSize: 14,
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
                boxShadow: msg.role === "user"
                  ? "0 2px 12px rgba(26,58,74,0.25)"
                  : "0 2px 8px rgba(0,0,0,0.07)"
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div style={{
                width: 30, height: 30,
                background: "linear-gradient(135deg, #1a3a4a, #2a5570)",
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, color: "#fff", fontWeight: 700
              }}>A</div>
              <div style={{ background: "#fff", borderRadius: "16px 16px 16px 4px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {messages.length <= 2 && (
          <div style={{
            background: "#f4f8fb",
            padding: "4px 16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 6
          }}>
            <div style={{ fontSize: 11, color: "#7a9aaa", marginBottom: 2 }}>How can we help?</div>
            {quickReplies.map(q => (
              <button key={q.label}
                onClick={() => setInput(q.msg)}
                style={{
                  background: "#fff",
                  border: "1.5px solid #c8dce8",
                  color: "#1a3a4a",
                  borderRadius: 10,
                  padding: "9px 14px",
                  fontSize: 13,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "all 0.15s"
                }}
                onMouseEnter={e => { e.target.style.borderColor = "#4a90a4"; e.target.style.background = "#eef5f9"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#c8dce8"; e.target.style.background = "#fff"; }}
              >{q.label}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          background: "#fff",
          padding: "12px 16px",
          borderTop: "1px solid #dde8ee",
          display: "flex",
          gap: 10,
          alignItems: "flex-end"
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type your message..."
            rows={1}
            style={{
              flex: 1,
              border: "1.5px solid #c8dce8",
              borderRadius: 14,
              padding: "10px 15px",
              fontSize: 14,
              fontFamily: "inherit",
              resize: "none",
              background: "#f4f8fb",
              color: "#1a2a35",
              lineHeight: 1.5
            }}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            style={{
              width: 44, height: 44,
              borderRadius: 12,
              background: loading || !input.trim()
                ? "#c8dce8"
                : "linear-gradient(135deg, #1a3a4a, #2a5570)",
              border: "none",
              cursor: loading || !input.trim() ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
              transition: "all 0.2s"
            }}>
            <span style={{ color: "#fff" }}>➤</span>
          </button>
        </div>

        {/* Footer */}
        <div style={{
          background: "#fff",
          borderRadius: "0 0 20px 20px",
          padding: "8px 16px 12px",
          borderTop: "1px solid #eef3f6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{ fontSize: 11, color: "#9bb8c8" }}>🔒 Secure & Confidential</span>
          <span style={{ fontSize: 11, color: "#9bb8c8" }}>Financial hardship? 📞 1800 007 007</span>
        </div>
      </div>
    </div>
  );
}
