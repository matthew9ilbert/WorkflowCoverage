import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User } from '@shared/schema';

interface AIAssistantProps {
  user?: User;
}

export function AIAssistant({ user }: AIAssistantProps) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-AI-API-Key': process.env.REACT_APP_AI_KEY || ''
        },
        body: JSON.stringify({ message })
      });
      
      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      console.error('AI request failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.roles.includes('admin') && !user?.roles.includes('owner')) {
    return <div>Access restricted to administrators</div>;
  }

  return (
    <div className="ai-assistant">
      <h2>AI Developer Assistant</h2>
      <form onSubmit={handleSubmit}>
        <textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask for code help..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>
      
      {response && (
        <div className="response">
          <h3>AI Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
