import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchMyMessages, sendMessage } from '@/services/api';
import { toast } from 'sonner';
import type { Message } from '@/types/types';
import { MessageSquare, Send } from 'lucide-react';

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    setLoading(true);
    fetchMyMessages().then(setMessages).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;
    setSending(true);
    try {
      await sendMessage(subject, content);
      toast.success('Message sent!');
      setSubject(''); setContent('');
      load();
    } catch { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground red-stripe pl-3">Messages</h2>

      <Card className="bg-card border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Send a Message</h3>
        <form onSubmit={handleSend} className="space-y-3">
          <Input required placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} className="bg-muted border-border h-9 text-sm" />
          <textarea required placeholder="Your message..." value={content} onChange={e => setContent(e.target.value)}
            className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary" />
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-accent text-sm" disabled={sending}>
            <Send size={14} className="mr-2" />{sending ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Message History</h3>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)}</div>
        ) : messages.length === 0 ? (
          <Card className="bg-card border-border p-8 text-center">
            <MessageSquare size={32} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {messages.map(msg => (
              <Card key={msg.id} className="bg-card border-border p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-foreground">{msg.subject}</h4>
                  <div className="flex items-center gap-2 shrink-0">
                    {!msg.is_read && <Badge className="badge-red text-xs">New</Badge>}
                    <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                      {msg.is_from_admin ? 'From Admin' : 'Sent'}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{msg.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(msg.created_at).toLocaleString()}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
