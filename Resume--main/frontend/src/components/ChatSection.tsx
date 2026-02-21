import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  sessionId: string;
}

export function ChatSection({ sessionId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId,
        },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat failed');
      setMessages((m) => [...m, { role: 'assistant', content: data.answer }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: `Error: ${e instanceof Error ? e.message : 'Something went wrong'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="chat-section">
      <h2>Ask Questions About This Candidate</h2>
      <p className="chat-hint">
        RAG-powered: Questions are answered using retrieved resume sections, not the full document.
      </p>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-placeholder">
              <p>Try asking:</p>
              <ul>
                <li>Does this candidate have a degree from a state university?</li>
                <li>Can they handle backend architecture?</li>
                <li>What's their experience with PostgreSQL?</li>
                <li>Is they eligible to work in the US?</li>
              </ul>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <span className="msg-role">{msg.role === 'user' ? 'You' : 'AI'}</span>
              <p>{msg.content}</p>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <span className="msg-role">AI</span>
              <p className="typing">Thinking...</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="chat-input-wrap">
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
