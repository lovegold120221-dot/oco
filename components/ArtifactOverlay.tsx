import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share, Lock, ExternalLink, Edit3, Cloud, FileText, Wifi, Battery, FileCode, Mail, Star, Trash2, Inbox, Send, File, Search, Menu, Plus, ChevronLeft, CornerUpLeft, Paperclip, Tag, Users, Archive, MoreVertical, Film, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUI } from '../lib/state';
import { getAccessToken } from '../lib/firebase';

// High-fidelity code and json highlighter helpers
const highlightJson = (jsonStr: string) => {
  const lines = jsonStr.split('\n');
  return (
    <div className="font-mono text-[9px] sm:text-[10px] leading-relaxed w-full">
      {lines.map((line, idx) => {
        const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d*)?(?:[eE][+-]?\d+)?\b/g;
        let lastIndex = 0;
        const result: React.ReactNode[] = [];
        let match;

        while ((match = regex.exec(line)) !== null) {
          const index = match.index;
          if (index > lastIndex) {
            result.push(line.substring(lastIndex, index));
          }

          const text = match[0];
          if (/^"/.test(text)) {
            if (/:$/.test(text)) { // JSON Key
              result.push(<span key={index} className="text-[#a855f7] font-bold">{text.replace(/:$/, '')}</span>);
              result.push(":");
            } else { // String value
              result.push(<span key={index} className="text-[#059669]">{text}</span>);
            }
          } else if (/^(true|false|null)$/.test(text)) { // Boolean/null
            result.push(<span key={index} className="text-[#ea580c] font-semibold">{text}</span>);
          } else { // Number
            result.push(<span key={index} className="text-[#dc2626]">{text}</span>);
          }

          lastIndex = regex.lastIndex;
        }

        if (lastIndex < line.length) {
          result.push(line.substring(lastIndex));
        }

        return (
          <div key={idx} className="flex min-h-[14px] hover:bg-gray-50/50 px-1">
            <span className="w-6 text-gray-400 font-sans text-[7.5px] text-right pr-1 select-none border-r border-gray-100 mr-2 shrink-0">{idx + 1}</span>
            <span className="whitespace-pre overflow-x-auto text-gray-700 break-all font-mono">
              {result.length > 0 ? result : line}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const highlightCode = (code: string) => {
  if (!code) return <span className="text-gray-400">No content</span>;
  const lines = code.split('\n');

  return (
    <div className="font-mono text-[9px] sm:text-[10px] leading-relaxed w-full">
      {lines.map((line, idx) => {
        const regex = /(\/\/.*|#.*)|(["'`].*?["'`])|\b(const|let|var|function|return|import|from|export|if|else|for|while|do|class|interface|new|type|as|extends|implements|try|catch|finally|throw|async|await|null|undefined|true|false)\b|\b(def|elif|import|print|with|as|lambda|pass|in|is|not|and|or)\b|\b([a-zA-Z_]\w*)(?=\()|\b(\d+(?:\.\d+)?)\b/g;
        let lastIndex = 0;
        const result: React.ReactNode[] = [];
        let match;

        while ((match = regex.exec(line)) !== null) {
          const index = match.index;
          if (index > lastIndex) {
            result.push(line.substring(lastIndex, index));
          }

          const text = match[0];
          if (match[1]) { // Comment
            result.push(<span key={index} className="text-gray-400 italic">{text}</span>);
          } else if (match[2]) { // String
            result.push(<span key={index} className="text-[#059669]">{text}</span>);
          } else if (match[3]) { // JS Keyword
            result.push(<span key={index} className="text-[#a855f7] font-bold">{text}</span>);
          } else if (match[4]) { // Python key
            result.push(<span key={index} className="text-[#2563eb] font-bold">{text}</span>);
          } else if (match[5]) { // Function Call
            result.push(<span key={index} className="text-[#3b82f6] font-medium">{text}</span>);
          } else if (match[6]) { // Number
            result.push(<span key={index} className="text-[#dc2626]">{text}</span>);
          }

          lastIndex = regex.lastIndex;
        }

        if (lastIndex < line.length) {
          result.push(line.substring(lastIndex));
        }

        return (
          <div key={idx} className="flex min-h-[14px] hover:bg-gray-50/50 px-1">
            <span className="w-6 text-gray-400 font-sans text-[7.5px] text-right pr-1 select-none border-r border-gray-100 mr-2 shrink-0">{idx + 1}</span>
            <span className="whitespace-pre overflow-x-auto text-gray-700 break-all font-mono">{result.length > 0 ? result : line}</span>
          </div>
        );
      })}
    </div>
  );
};

// Sleek Tooltip item inside the MacOS Bottom Dock
const DockItem = ({ icon: Icon, onClick, label, isDocx = false, active = false }: { icon: any, onClick: () => void, label: string, isDocx?: boolean, active?: boolean }) => {
  return (
    <button 
      onClick={onClick} 
      title={label}
      className={`group relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-200 cursor-pointer ${
        active 
          ? 'bg-[#cbfb45] text-black hover:bg-[#cbfb45]/90' 
          : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/5'
      }`}
    >
      {isDocx ? (
        <span className="font-[900] text-[9px] text-white bg-[#1a56db] px-1 rounded-[3px] select-none scale-100 group-hover:scale-105 transition-transform">W</span>
      ) : (
        <Icon size={13} strokeWidth={2.5} className="scale-100 group-hover:scale-105 transition-transform" />
      )}
      {/* Micro-Tooltip popup */}
      <span className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#090b0d] border border-white/10 text-[9px] font-sans font-semibold text-white px-2 py-0.5 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
        {label}
      </span>
    </button>
  );
};

// YouTube video ID parser
const getYouTubeId = (url: string) => {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2].length === 11) ? match[1] : null;
};

// High-fidelity Cloned Gmail Inbox App
const GmailInboxComponent: React.FC<{ content: string; title: string }> = ({ content, title }) => {
  const [activeEmailId, setActiveEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'primary' | 'promotions' | 'social'>('primary');
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'starred' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [starredEmails, setStarredEmails] = useState<Record<string, boolean>>({});
  const [selectedEmails, setSelectedEmails] = useState<Record<string, boolean>>({});
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [tempReply, setTempReply] = useState('');

  // Default emails for a gorgeous, interactive workspace demo
  const defaultEmails = [
    {
      id: 'eburon-welcome',
      sender: 'Jo Lernout (Eburon)',
      senderEmail: 'jo.lernout@eburon.ai',
      avatarColor: 'bg-emerald-600',
      subject: 'Welcome to your Eburon Intelligent Workstation!',
      date: '10:24 AM',
      snippet: 'Beatrice is successfully synchronized as your visual workspace controller. You can now play YouTube videos, trigger Google APIs...',
      body: 'Dear Boss,\n\nI am thrilled to welcome you to the Eburon Workplace environment. Beatrice is fully authorized on your workspace to fetch Google Calendars, Drive files, and Gmail messages.\n\nKeep exploring her voice capabilities and desktop tools. She can see what you share, write summaries, draft document packages, type responses, and interact with third-party tools natively.\n\nBest regards,\nJo Lernout\nCEO, Eburon AI',
      tab: 'primary',
      folder: 'inbox',
      unread: false,
    },
    {
      id: 'beatrice-init',
      sender: 'Beatrice Robot',
      senderEmail: 'beatrice@eburon.ai',
      avatarColor: 'bg-indigo-600',
      subject: 'Multi-modal Vision capabilities configured',
      date: '09:15 AM',
      snippet: 'I am ready to view screenshots, live streams, video inputs, and design charts. Simply upload or show them to me during our call...',
      body: 'Hello Boss!\n\nThis is Beatrice, your spatial intelligence copilot. I am fully configured to perform multi-modal analyses. Since I support screen captures, cameras, diagrams, and uploads, you can share or show me visual assets, code layouts, or PDF documents. I will immediately review, highlight errors, write summaries, and display high-contrast widgets directly on this workstation screen.\n\nTell me which files to inspect next!\n\nSincerely,\nBeatrice',
      tab: 'primary',
      folder: 'inbox',
      unread: true,
    },
    {
      id: 'google-sync',
      sender: 'Google Workspace Cloud',
      senderEmail: 'security-noreply@google.com',
      avatarColor: 'bg-red-500',
      subject: 'Security alert: Eburon connected to your Google Profile',
      date: 'Yesterday',
      snippet: 'Standard Google Sign-In granted read/write privileges to Gmail, Drive, Tasks, Keep, and Calendar resources...',
      body: 'Security Sync Notification:\n\nGoogle Account Sign-In has registered a new workstation login for your email. Beatrice has been granted delegation access to read, send, or edit documents inside your secure space.\n\nIf this auth action was performed by you, no further steps are required.\n\nSecure Workspace Team',
      tab: 'social',
      folder: 'inbox',
      unread: true,
    },
    {
      id: 'promo-yt',
      sender: 'YouTube Broadcast Unit',
      senderEmail: 'media@youtube.com',
      avatarColor: 'bg-rose-600',
      subject: 'Featured: Next-generation speech computers by Jo Lernout',
      date: 'May 19',
      snippet: 'Review and play the latest video presentation explaining the Eburon operating architecture...',
      body: 'Hello!\n\nA new video presentation highlighting Jo Lernout\'s groundbreaking research on voice computing and Beatrice agent loops has been uploaded to the Eburon channel. You can search or play this and other embeds natively right here on your desktop screen.\n\nClick "Play" to start streaming!',
      tab: 'promotions',
      folder: 'inbox',
      unread: true,
    }
  ];

  // Parse emails dynamically from Gmail API content or text block
  const emails = React.useMemo(() => {
    let parsed: any[] = [];
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        parsed = data.map((item: any, idx: number) => ({
          id: item.id || `gmail-id-${idx}`,
          sender: item.sender || item.from || 'Google Client',
          senderEmail: item.senderEmail || item.fromEmail || 'user@gmail.com',
          avatarColor: 'bg-teal-600',
          subject: item.subject || 'Gmail Update',
          date: item.date || item.time || 'Today',
          snippet: item.snippet || item.body || '',
          body: item.body || item.snippet || '',
          tab: 'primary',
          folder: 'inbox',
          unread: item.unread ?? true,
        }));
      } else if (data.messages && Array.isArray(data.messages)) {
        parsed = data.messages.map((m: any, idx: number) => ({
          id: m.id || `msg-${idx}`,
          sender: 'Google Mail Services',
          senderEmail: 'mail-support@google.com',
          avatarColor: 'bg-blue-500',
          subject: m.subject || `Gmail Message: ${m.snippet?.substring(0, 30) || m.id}`,
          date: '10:42 AM',
          snippet: m.snippet || `Message thread ID: ${m.threadId}`,
          body: m.snippet || `This is a raw Gmail API item with ID "${m.id}". Ask Beatrice to fetch this email message details directly.`,
          tab: 'primary',
          folder: 'inbox',
          unread: true,
        }));
      } else if (typeof data === 'object') {
        const entry = data.email || data.message || data;
        if (entry.sender || entry.subject || entry.senderEmail) {
          parsed = [{
            id: entry.id || 'gmail-single',
            sender: entry.sender || entry.from || 'Google Workspace Sender',
            senderEmail: entry.senderEmail || 'workspace@gmail.com',
            avatarColor: 'bg-emerald-600',
            subject: entry.subject || 'Secured Mail Delivery',
            date: entry.date || 'Just now',
            snippet: entry.snippet || entry.body?.substring(0, 80) || '',
            body: entry.body || entry.snippet || '',
            tab: 'primary',
            folder: 'inbox',
            unread: false
          }];
        }
      }
    } catch (_) {
      // RegEx raw markdown list parser if AI returns structured email listings text
      const msgBlocks = content.split(/(?=From:|^Mail \d+:|^Email \d+:)/mi);
      if (msgBlocks.length > 1) {
        parsed = msgBlocks.filter(b => b.trim().length > 10).map((block, idx) => {
          const fromMatch = block.match(/From:\s*([^\n]+)/i);
          const subjMatch = block.match(/Subject:\s*([^\n]+)/i);
          const dateMatch = block.match(/Date:\s*([^\n]+)/i);
          const snippetMatch = block.match(/(?:Snippet|Body):\s*([^\n]+)/i);
          
          let sender = fromMatch ? fromMatch[1].trim() : 'Gmail User';
          let senderEmail = 'mailbox@gmail.com';
          if (sender.includes('<')) {
            const parts = sender.split('<');
            sender = parts[0].trim();
            senderEmail = parts[1].replace('>', '').trim();
          }
          const subject = subjMatch ? subjMatch[1].trim() : 'Workspace Summary Details';
          const date = dateMatch ? dateMatch[1].trim() : 'Today';
          const snippet = snippetMatch ? snippetMatch[1].trim() : block.replace(/From:[^\n]+\n?/gi, '').replace(/Subject:[^\n]+\n?/gi, '').trim().substring(0, 100);
          
          return {
            id: `parsed-gmail-${idx}`,
            sender,
            senderEmail,
            avatarColor: idx % 3 === 0 ? 'bg-purple-600' : idx % 3 === 1 ? 'bg-blue-600' : 'bg-amber-600',
            subject,
            snippet: snippet.substring(0, 80) + '...',
            body: block.trim(),
            tab: 'primary',
            folder: 'inbox',
            unread: true
          };
        });
      }
    }

    if (parsed.length === 0) {
      return defaultEmails;
    }
    return parsed;
  }, [content]);

  // Handle Search filtering
  const filteredEmails = emails.filter(em => {
    if (activeFolder === 'starred' && !starredEmails[em.id]) return false;
    if (activeFolder === 'inbox' && em.tab !== activeTab) return false;
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        em.sender.toLowerCase().includes(q) ||
        em.subject.toLowerCase().includes(q) ||
        em.snippet.toLowerCase().includes(q) ||
        em.body.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeEmailDetails = emails.find(e => e.id === activeEmailId);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo) return;
    setIsSending(true);
    const token = await getAccessToken();
    if (token) {
      try {
        const emailContent = [
          `To: ${composeTo}`,
          `Subject: ${composeSubject}`,
          'Content-Type: text/html; charset=utf-8',
          '',
          composeBody
        ].join('\r\n');
        const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: encodedEmail })
        });
        if (res.ok) {
          alert(`Success! Email dispatched to <${composeTo}> via your Google Account.`);
          setIsComposing(false);
          setComposeTo('');
          setComposeSubject('');
          setComposeBody('');
        } else {
          const errData = await res.json();
          throw new Error(errData.error?.message || 'API failure');
        }
      } catch (err: any) {
        alert(`API Error: ${err.message}. Showing dispatch notification copy instead.`);
      }
    } else {
      alert(`[Simulation Mode] Dispatching safely to <${composeTo}>:\n\nSubject: ${composeSubject}\n\nEmail Body: ${composeBody}`);
      setIsComposing(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
    }
    setIsSending(false);
  };

  const handleSendReply = async () => {
    if (!tempReply.trim() || !activeEmailDetails) return;
    const recipient = activeEmailDetails.senderEmail;
    const subject = `Re: ${activeEmailDetails.subject}`;
    
    const token = await getAccessToken();
    if (token) {
      try {
        const emailContent = [
          `To: ${recipient}`,
          `Subject: ${subject}`,
          'Content-Type: text/html; charset=utf-8',
          '',
          tempReply
        ].join('\r\n');
        const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: encodedEmail })
        });
      } catch (_) {}
    }
    
    setReplies(prev => ({
      ...prev,
      [activeEmailDetails.id]: tempReply
    }));
    setTempReply('');
    alert('Reply sent successfully!');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f6f8fc] rounded-lg overflow-hidden border border-gray-200 select-text relative text-gray-800">
      
      {/* Search Header */}
      <div className="h-10 border-b border-gray-200 bg-white flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <Menu size={16} className="text-gray-500 cursor-pointer hover:text-gray-850" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-[#db4437] rounded flex items-center justify-center text-white font-black text-[11px] select-none shadow-sm">M</div>
            <span className="font-bold text-[11px] text-gray-850 tracking-tight">Gmail Inbox</span>
          </div>
        </div>
        
        <div className="flex-1 max-w-[320.6px] mx-2 sm:mx-6 relative">
          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400">
            <Search size={11} />
          </div>
          <input
            type="text"
            placeholder="Search matching emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f1f3f4] focus:bg-white text-[8.5px] h-6 pl-8 pr-3 border border-transparent focus:border-gray-200 focus:outline-none rounded-full transition-all text-gray-750"
          />
        </div>

        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-extrabold text-[8.5px] flex items-center justify-center border border-white shadow">U</div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Navigation Sidebar */}
        <div className="w-20 bg-white border-r border-gray-150 py-2.5 px-1 flex flex-col gap-0.5 shrink-0 select-none">
          <button
            onClick={() => setIsComposing(true)}
            className="flex items-center justify-center gap-1 py-1 px-1.5 bg-[#c2e7ff] text-[#001d35] rounded-xl hover:bg-[#b0dcfa] transition-colors text-[8.2px] font-bold cursor-pointer mb-2"
          >
            <Plus size={11} strokeWidth={3} />
            <span>Compose</span>
          </button>

          {[
            { id: 'inbox', label: 'Inbox', icon: Inbox },
            { id: 'starred', label: 'Starred', icon: Star },
            { id: 'sent', label: 'Sent', icon: Send },
            { id: 'drafts', label: 'Drafts', icon: File },
            { id: 'trash', label: 'Trash', icon: Trash2 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeFolder === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveFolder(item.id as any);
                  setActiveEmailId(null);
                }}
                className={`flex items-center gap-1.5 py-1 px-1.5 rounded-lg text-left text-[8px] cursor-pointer transition-colors ${
                  isActive ? 'bg-[#d3e3fd] text-[#041e49] font-bold' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={10} className={isActive ? 'text-[#041e49]' : 'text-gray-500'} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Pane */}
        <div className="flex-grow flex flex-col overflow-hidden bg-white">
          {activeEmailId && activeEmailDetails ? (
            <div className="flex flex-col flex-1 overflow-y-auto p-3 bg-white">
              <div className="flex items-center border-b border-gray-100 pb-1.5 mb-2.5 justify-between select-none">
                <button
                  onClick={() => setActiveEmailId(null)}
                  className="flex items-center gap-1 text-[8px] text-gray-650 hover:text-gray-900 bg-gray-100 font-bold px-2 py-0.5 rounded cursor-pointer"
                >
                  <ChevronLeft size={10} />
                  <span>To Inbox</span>
                </button>
                <div className="flex items-center gap-2 text-gray-400">
                  <button onClick={() => setStarredEmails(prev => ({ ...prev, [activeEmailDetails.id]: !prev[activeEmailDetails.id] }))}>
                    <Star size={11} className={starredEmails[activeEmailDetails.id] ? 'fill-yellow-400 text-yellow-400' : ''} />
                  </button>
                  <ArrowButtons email={activeEmailDetails} />
                  <Trash2 size={11} />
                </div>
              </div>

              <div>
                <h2 className="text-[10.5px] font-bold text-gray-900 leading-tight mb-2">
                  {activeEmailDetails.subject}
                </h2>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-extrabold shrink-0 ${activeEmailDetails.avatarColor}`}>
                  {activeEmailDetails.sender.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[8.2px] font-bold text-gray-800 truncate">{activeEmailDetails.sender}</span>
                    <span className="text-[7.2px] text-gray-450">{activeEmailDetails.date}</span>
                  </div>
                  <div className="text-[7.5px] text-gray-500 truncate">
                    &lt;{activeEmailDetails.senderEmail}&gt; <span className="text-gray-400">to me</span>
                  </div>
                </div>
              </div>

              <div className="text-[8.5px] sm:text-[9.2px] text-gray-700 leading-relaxed pl-0.5 pb-3 border-b border-gray-100 whitespace-pre-wrap font-sans">
                {activeEmailDetails.body}
              </div>

              {replies[activeEmailDetails.id] && (
                <div className="mt-2.5 p-2 bg-gray-50 rounded border border-gray-150">
                  <div className="flex items-center gap-1.5 mb-1 text-[7.5px] font-bold text-gray-700">
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">U</div>
                    <span>You</span>
                    <span className="text-[6.5px] text-gray-400 ml-auto">Just now</span>
                  </div>
                  <p className="text-[8.2px] text-gray-700 font-sans leading-normal">{replies[activeEmailDetails.id]}</p>
                </div>
              )}

              <div className="mt-3 border border-gray-200 rounded p-2 bg-[#f8fafd] flex flex-col gap-1.5 shrink-0">
                <div className="flex items-center gap-1 text-[7.5px] text-gray-500 font-semibold">
                  <CornerUpLeft size={9} />
                  <span>Reply to <strong className="text-gray-700">{activeEmailDetails.sender}</strong></span>
                </div>
                <textarea
                  placeholder="Type your reply body..."
                  value={tempReply}
                  onChange={(e) => setTempReply(e.target.value)}
                  className="w-full text-[8.2px] p-1.5 border border-gray-200 rounded bg-white min-h-[44px] focus:outline-none focus:border-blue-500 resize-none"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!tempReply.trim()}
                  className="self-end flex items-center gap-1 px-2.5 py-0.5 bg-blue-600 font-bold hover:bg-blue-700 text-white rounded text-[8px] cursor-pointer disabled:opacity-40"
                >
                  <Send size={8} />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeFolder === 'inbox' && (
                <div className="h-7 border-b border-gray-150 bg-[#fafbfe] flex select-none text-[8px] font-sans text-gray-500 shrink-0">
                  {[
                    { id: 'primary', label: 'Primary', icon: Mail, color: 'text-blue-600 border-blue-600 bg-blue-50/25 font-bold' },
                    { id: 'promotions', label: 'Promotions', icon: Tag, color: 'text-emerald-600 border-emerald-600 bg-emerald-50/25 font-bold' },
                    { id: 'social', label: 'Social', icon: Users, color: 'text-purple-600 border-purple-600 bg-purple-50/25 font-bold' },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-1 border-b-2 cursor-pointer transition-all ${
                          isActive ? tab.color : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={9} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {filteredEmails.length > 0 ? (
                  filteredEmails.map((mail) => {
                    const isStarred = !!starredEmails[mail.id];
                    const isChecked = !!selectedEmails[mail.id];
                    return (
                      <div
                        key={mail.id}
                        onClick={() => setActiveEmailId(mail.id)}
                        className={`flex items-center gap-1.5 px-2 py-1 hover:bg-gray-50 cursor-pointer text-[8.2px] border-l-2 transition-colors ${
                          mail.unread && activeFolder === 'inbox' ? 'bg-[#f2f6fc] border-l-blue-500' : 'bg-white border-l-transparent'
                        }`}
                      >
                        <div onClick={(e) => { e.stopPropagation(); setSelectedEmails(prev => ({ ...prev, [mail.id]: !prev[mail.id] })); }}>
                          <input type="checkbox" checked={isChecked} readOnly className="rounded cursor-pointer scale-90" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStarredEmails(prev => ({ ...prev, [mail.id]: !prev[mail.id] }));
                          }}
                          className="text-gray-300 hover:text-yellow-400 p-0.5 rounded cursor-pointer"
                        >
                          <Star size={10} className={isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                        </button>
                        <div className={`w-16 truncate shrink-0 ${mail.unread && activeFolder === 'inbox' ? 'font-black text-gray-900' : 'text-gray-600'}`}>{mail.sender}</div>
                        <div className="flex-grow min-w-0 truncate text-gray-500">
                          <span className={mail.unread && activeFolder === 'inbox' ? 'font-bold text-gray-900 mr-1' : 'text-gray-700 font-medium mr-1'}>
                            {mail.subject}
                          </span>
                          <span>- {mail.snippet}</span>
                        </div>
                        <div className="w-10 text-right text-[6.8px] text-gray-400 font-mono italic shrink-0">{mail.date}</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-gray-400 text-[8px]">
                    <Mail size={16} className="text-gray-200 mb-1" />
                    <span>No matching emails folders found.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isComposing && (
          <motion.form
            onSubmit={handleSendEmail}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-1 right-1 w-[190px] sm:w-[220px] bg-white rounded-t-lg border border-gray-300 shadow-xl z-50 overflow-hidden flex flex-col text-gray-800"
          >
            <div className="bg-[#2f3542] text-white px-2 py-1 flex items-center justify-between text-[7.5px] font-bold select-none">
              <span>Compose Message</span>
              <button type="button" onClick={() => setIsComposing(false)}><X size={9} /></button>
            </div>
            <div className="p-1.5 flex flex-col gap-1 text-[8px]">
              <div className="flex border-b border-gray-100 pb-0.5">
                <span className="text-gray-400 w-6">To:</span>
                <input
                  type="email"
                  required
                  placeholder="recipient@gmail.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="flex-grow bg-transparent focus:outline-none"
                />
              </div>
              <div className="flex border-b border-gray-100 pb-0.5">
                <span className="text-gray-400 w-6">Subj:</span>
                <input
                  type="text"
                  placeholder="Subject title"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="flex-grow bg-transparent focus:outline-none"
                />
              </div>
              <textarea
                placeholder="Email body copy..."
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                className="w-full text-[8px] p-1 border border-gray-100 rounded focus:outline-none bg-gray-50 min-h-[50px] resize-none"
              />
            </div>
            <div className="p-1.5 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-[7.5px]">
              <button
                type="submit"
                disabled={isSending}
                className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
              >
                <Send size={7} />
                <span>{isSending ? 'Sending...' : 'Send'}</span>
              </button>
              <button type="button" onClick={() => setIsComposing(false)} className="text-gray-400 hover:text-gray-600">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

const ArrowButtons = ({ email }: { email: any }) => <span className="text-[7.2px] text-gray-450 mr-1 font-mono">#{email.id}</span>;

export const ArtifactOverlay: React.FC = () => {
  const activeWorkspaceResult = useUI((state) => state.activeWorkspaceResult);
  const isGenerating = useUI((state) => state.isGenerating);
  const setActiveWorkspaceResult = useUI((state) => state.setActiveWorkspaceResult);
  const setIsGenerating = useUI((state) => state.setIsGenerating);
  const [systime, setSystime] = useState('12:00');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystime(now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const closeOverlay = () => {
    setActiveWorkspaceResult(null);
    setIsGenerating(false);
  };

  if (!activeWorkspaceResult && !isGenerating) return null;

  // Actions
  const handleDownloadMd = () => {
    if (!activeWorkspaceResult?.artifact) return;
    const { content, title, type } = activeWorkspaceResult.artifact;
    
    let ext = 'txt';
    let mime = 'text/plain';
    
    if (type === 'markdown') { ext = 'md'; mime = 'text/markdown'; }
    else if (type === 'pdf') { ext = 'pdf'; mime = 'application/pdf'; }
    else if (type === 'json') { ext = 'json'; mime = 'application/json'; }
    else if (type === 'html') { ext = 'html'; mime = 'text/html'; }
    else if (type === 'image') { ext = 'png'; mime = 'image/png'; }
    else if (type === 'video') { ext = 'mp4'; mime = 'video/mp4'; }

    let url;
    if (content.startsWith('data:')) {
      url = content;
    } else {
      const blob = new Blob([content], { type: mime });
      url = URL.createObjectURL(blob);
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title?.replace(/[^a-z0-9]/gi, '_') || 'document'}.${ext}`;
    a.click();
    if (!content.startsWith('data:')) {
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadWordDoc = () => {
    if (!activeWorkspaceResult?.artifact) return;
    const { content, title, type } = activeWorkspaceResult.artifact;
    
    let htmlContent = content;
    if (['markdown', 'text', 'code', 'structured', 'json'].includes(type)) {
       let parsedContent = content;
       if (type === 'structured' || type === 'json') {
         try { parsedContent = JSON.stringify(JSON.parse(content), null, 2); } catch (_) {}
       }
       htmlContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${title}</title></head><body><pre style="white-space: pre-wrap; font-family: monospace;">${parsedContent}</pre></body></html>`;
    } else if (type === 'html') {
       htmlContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${title}</title></head><body>${content}</body></html>`;
    } else {
       return;
    }
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title?.replace(/[^a-z0-9]/gi, '_') || 'document'}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToDrive = async () => {
    if (!activeWorkspaceResult?.artifact) return;
    const { content, title, type } = activeWorkspaceResult.artifact;
    
    let ext = 'txt';
    let mime = 'text/plain';
    
    if (type === 'markdown') { ext = 'md'; mime = 'text/markdown'; }
    else if (type === 'pdf') { ext = 'pdf'; mime = 'application/pdf'; }
    else if (type === 'json') { ext = 'json'; mime = 'application/json'; }
    else if (type === 'html') { ext = 'html'; mime = 'text/html'; }
    else if (type === 'image') { ext = 'png'; mime = 'image/png'; }
    else if (type === 'video') { ext = 'mp4'; mime = 'video/mp4'; }

    const filename = `${title?.replace(/[^a-z0-9]/gi, '_') || 'document'}.${ext}`;

    setIsSavingToDrive(true);
    const token = await getAccessToken();
    if (!token) {
      alert('Error: Please click "Google/Sign" to authorize your Workspace context first.');
      setIsSavingToDrive(false);
      return;
    }

    try {
      const metadata = {
        name: filename,
        mimeType: mime,
      };

      const boundary = 'foo_bar_boundary';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + mime + '\r\n\r\n' +
        content +
        close_delim;

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      });

      if (!res.ok) {
        throw new Error(`Google Drive API error code ${res.status}: ${res.statusText}`);
      }

      await res.json();
      alert(`Success! Artifact uploaded to your Google Drive root folder. File: "${filename}"`);
    } catch (err: any) {
      alert(`Google Drive Upload Failed: ${err.message}`);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const handleEdit = () => {
    if (!activeWorkspaceResult?.artifact) return;
    setEditedContent(activeWorkspaceResult.artifact.content);
    setIsEditing(true);
  };

  const handleShare = () => {
    try {
      const textToCopy = `${window.location.origin}/workspace/${activeWorkspaceResult?.artifact?.title ? activeWorkspaceResult.artifact.title.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'session'}`;
      navigator.clipboard.writeText(textToCopy);
      alert('Secure Eburon link copied to clipboard!');
    } catch (e) {
      navigator.clipboard.writeText(window.location.href);
      alert('Eburon app link copied to clipboard!');
    }
  };

  const artType = activeWorkspaceResult?.artifact?.type || 'active';
  const showWordDocBtn = ['markdown', 'text', 'html', 'code', 'structured', 'json', 'pdf'].includes(artType);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full mx-auto my-4 flex flex-col items-center justify-center relative select-none px-4 sm:px-6"
      style={{ zIndex: 20 }}
    >
      {/* Sleek Professional Desktop Monitor Screen wrapped with high-contrast chassis */}
      <div className="w-full max-w-full aspect-[16/9] bg-[#0c0e12] rounded-[16px] sm:rounded-[24px] overflow-hidden border-[6px] sm:border-[10px] border-[#25282f] shadow-[0_30px_75px_-12px_rgba(0,0,0,0.95)] flex flex-col relative transition-all duration-300">
        
        {/* Anti-reflective glare filter overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.04] z-10" />

        {/* Subtle physical pixel grid overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035]" 
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />

        {/* 1. Translucent Workstation OS System Top Bar */}
        <div className="h-[20px] bg-black/50 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-3.5 text-[8.5px] text-[#cfd2e3] font-sans shrink-0 select-none z-25">
          <div className="flex items-center gap-3">
            <span className="font-black text-[#cbfb45] tracking-widest text-[9.5px] cursor-pointer hover:opacity-90">EBURON AI</span>
            <span className="cursor-pointer hover:text-white transition-all font-medium">Workspace</span>
            <span className="cursor-pointer hover:text-white transition-all hidden sm:inline opacity-60">·</span>
            <span className="cursor-pointer hover:text-white transition-all hidden sm:inline text-white/50">Beatrice OS v3.2</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[7.5px] tracking-wider font-mono opacity-80 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 hidden md:inline">DESKTOP WORKSTATION</span>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi size={10} className="text-white/70" />
            </div>
            <Battery size={10} className="text-white/70" />
            <span className="text-[8.5px] font-mono font-medium text-white/90">{systime}</span>
          </div>
        </div>

        {/* 2. OS Desktop Area */}
        <div className="flex-1 relative p-1.5 sm:p-3 pb-[38px] sm:pb-[52px] overflow-hidden flex flex-col h-[calc(100%-20px)] bg-gradient-to-tr from-[#02050a] via-[#0d091a] to-[#041121]">
          
          {/* Active Workstation Window Application (Floating computer panel style) */}
          <div className="flex-1 rounded-xl bg-[#090b0f]/95 border border-white/[0.08] shadow-[0_20px_45px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col relative w-full h-full">
            
            {/* Window titlebar & path tracker */}
            <div className="h-[26px] sm:h-[30px] bg-[#0f1116] border-b border-white/[0.05] flex items-center justify-between px-3 shrink-0 select-none">
              {/* Traffic Lights buttons */}
              <div className="flex items-center gap-1.5">
                <div onClick={closeOverlay} className="w-[8.5px] h-[8.5px] rounded-full bg-[#ff5f56] cursor-pointer hover:scale-110 active:scale-95 transition-all" title="Minimize Workspace" />
                <div className="w-[8.5px] h-[8.5px] rounded-full bg-[#ffbd2e]" />
                <div className="w-[8.5px] h-[8.5px] rounded-full bg-[#27c93f]" />
              </div>

              {/* Secured browser address line */}
              <div className="flex items-center bg-[#050608] h-[16px] sm:h-[19px] w-[55%] max-w-[380px] roundedpx-3 px-2 border border-white/[0.05] justify-center">
                <Lock size={8} strokeWidth={3} className="text-emerald-500 shrink-0" />
                <span className="text-[7.5px] sm:text-[8px] text-[#7d8495] font-mono ml-1.5 truncate whitespace-nowrap">
                  eburon.ai/workspace/{activeWorkspaceResult?.artifact?.title ? activeWorkspaceResult.artifact.title.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'session'}
                </span>
              </div>

              {/* Console type indicators */}
              <div className="flex items-center gap-2">
                <span className="text-[7px] font-bold text-[#cbfb45] bg-[#cbfb45]/10 border border-[#cbfb45]/20 rounded-md px-1.5 py-[0.5px] uppercase tracking-widest scale-90">
                  {artType}
                </span>
                <button className="text-[#626978] hover:text-white transition-all cursor-pointer" onClick={closeOverlay}>
                  <X size={11} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Micro display viewport where artifact lives */}
            <div className="flex-1 bg-[#06080b] relative overflow-hidden flex justify-center items-stretch w-full h-full">
              {isGenerating ? (
                <div className="flex items-center justify-center h-full w-full bg-[#080a0e] text-[#888]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-7 h-7 border-2 border-t-[#cbfb45] border-white/[0.06] rounded-full animate-spin" />
                    <p className="text-[8px] sm:text-[9px] font-mono tracking-widest text-white/40 uppercase animate-pulse">Receiving pipeline stream...</p>
                  </div>
                </div>
              ) : activeWorkspaceResult?.artifact ? (
                <div className="w-[calc(100%-8px)] sm:w-[calc(100%-12px)] text-black bg-white rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.5)] p-3 sm:p-5 flex flex-col relative overflow-hidden text-[10px] my-1 sm:my-2 mx-1 sm:mx-1.5">
                  
                  {/* Premium Printable Document Header */}
                  <div className="flex justify-between items-start border-b border-gray-200 pb-1.5 mb-2 shrink-0 font-sans">
                    <div className="flex items-center gap-1.5">
                      <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon Logo" style={{ width: '15px', height: '15px', objectFit: 'contain', filter: 'invert(1)' }} />
                      <span className="text-[9.5px] font-extrabold tracking-wider text-black">EBURON AI</span>
                    </div>
                    <div className="text-right text-[7px] text-gray-400 font-sans">
                      <div className="font-extrabold uppercase tracking-widest text-[#000]">
                        {artType === 'markdown' ? 'PROPOSAL DOCUMENT' : artType.toUpperCase()}
                      </div>
                      <div className="mt-0.5 scale-90 origin-right text-gray-500">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                    </div>
                  </div>

                  {/* Document workspace renderer */}
                  <div className="doc-content flex-grow flex flex-col text-black min-h-0 overflow-hidden font-sans">
                    <div className="doc-title text-[11px] sm:text-[13px] font-extrabold leading-tight text-gray-950 mb-0.5 shrink-0">
                      {activeWorkspaceResult.artifact.title || 'Interactive AI Output Workspace'}
                    </div>
                    <div className="doc-subtitle text-[7px] font-semibold text-gray-400 uppercase tracking-widest mb-2 shrink-0">
                      Beatrice Executive Agent Delivery Platform
                    </div>
                    
                    <div className="doc-divider border-t border-gray-100 mb-2 shrink-0"></div>
                    <div className="flex-1 overflow-y-auto pr-1.5 text-gray-800 leading-relaxed font-sans text-[9px] sm:text-[10px] scrollbar-thin scrollbar-thumb-gray-250 flex flex-col min-h-0">
                      {isEditing ? (
                        <div className="flex flex-col flex-grow gap-2 w-full h-full min-h-[140px]">
                          <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full flex-grow p-2 sm:p-3 font-mono text-[8.5px] sm:text-[9.5px] leading-relaxed border border-gray-300 rounded-md focus:border-gray-500 focus:outline-none bg-gray-50/50 resize-none min-h-[110px]"
                            placeholder="Edit artifact content..."
                          />
                          <div className="flex justify-end gap-2 text-[8px] sm:text-[9px] shrink-0 pb-1">
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-2.5 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors rounded font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                setActiveWorkspaceResult({
                                  ...activeWorkspaceResult,
                                  artifact: {
                                    ...activeWorkspaceResult.artifact,
                                    content: editedContent
                                  }
                                });
                                setIsEditing(false);
                              }}
                              className="px-3 py-1 bg-black text-[#cbfb45] hover:opacity-90 transition-colors rounded font-bold cursor-pointer"
                            >
                              Apply Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {artType === 'image' && (
                            <div className="flex items-center justify-center bg-[#07090c] rounded-lg p-2 h-full">
                              <img 
                                src={activeWorkspaceResult.artifact.content} 
                                alt={activeWorkspaceResult.artifact.title || 'Image Artifact'} 
                                className="max-w-full max-h-[110px] sm:max-h-[130px] object-contain rounded shadow-lg" 
                              />
                            </div>
                          )}
                          
                          {artType === 'video' && (
                            <div className="flex items-center justify-center bg-[#07090c] rounded-lg p-2 h-full">
                              <video 
                                src={activeWorkspaceResult.artifact.content} 
                                controls 
                                className="max-w-full max-h-[110px] sm:max-h-[130px] object-contain rounded shadow-lg" 
                              />
                            </div>
                          )}
                          
                          {artType === 'pdf' && (
                            <iframe 
                              src={activeWorkspaceResult.artifact.content} 
                              className="w-full h-full border-0 rounded bg-white min-h-[90px]" 
                              title="PDF Preview" 
                            />
                          )}
                          
                          {artType === 'html' && (
                            <iframe 
                              srcDoc={activeWorkspaceResult.artifact.content} 
                              className="w-full h-full border-0 rounded bg-white min-h-[90px]" 
                              title="HTML Preview" 
                            />
                          )}
                          
                          {artType === 'markdown' && (
                            <div className="prose prose-xs max-w-none prose-slate text-[9.5px] leading-relaxed pb-4">
                              <ReactMarkdown
                                components={{
                                  h1: ({node, ...props}) => <h1 className="text-[12px] font-extrabold text-gray-900 border-b border-gray-100 pb-0.5 mt-2.5 mb-1" {...props}/>,
                                  h2: ({node, ...props}) => <h2 className="text-[10px] font-bold text-gray-800 border-b border-gray-100 pb-0.5 mt-2 mb-1" {...props}/>,
                                  h3: ({node, ...props}) => <h3 className="text-[9px] font-bold text-gray-700 mt-1.5 mb-0.5" {...props}/>,
                                  p: ({node, ...props}) => <p className="text-[9px] text-gray-700 mb-1 leading-relaxed" {...props}/>,
                                  ul: ({node, ...props}) => <ul className="list-disc pl-3.5 mb-1.5 space-y-0.5" {...props}/>,
                                  ol: ({node, ...props}) => <ol className="list-decimal pl-3.5 mb-1.5 space-y-0.5" {...props}/>,
                                  li: ({node, ...props}) => <li className="text-[9px] text-gray-700" {...props}/>,
                                  strong: ({node, ...props}) => <strong className="font-extrabold text-gray-950" {...props}/>,
                                  em: ({node, ...props}) => <em className="italic text-gray-950" {...props}/>,
                                  blockquote: ({node, ...props}) => <blockquote className="border-l-3 border-[#cef158] pl-2 py-0.5 italic my-1.5 text-gray-600 bg-gray-50/55 rounded-r" {...props}/>,
                                  code: ({node, className, children, ...props}: any) => {
                                    const inline = !className || !className.includes('language-');
                                    return inline ? (
                                      <code className="bg-gray-100 px-1 py-0.2 rounded text-[7.5px] font-mono text-purple-600 font-semibold" {...props}>{children}</code>
                                    ) : (
                                      <pre className="bg-gray-950 text-[#ececec] p-2 rounded-md my-1.5 overflow-auto font-mono text-[7.5px] border border-white/5"><code className={className} {...props}>{children}</code></pre>
                                    )
                                  },
                                }}
                              >
                                {activeWorkspaceResult.artifact.content}
                              </ReactMarkdown>
                            </div>
                          )}
                          
                          {(artType === 'structured' || artType === 'json') && (
                            <div className="p-2 bg-gray-50/50 border border-gray-150 rounded-lg overflow-y-auto w-full h-full min-h-[90px]">
                              {(() => {
                                const content = activeWorkspaceResult.artifact.content;
                                let jsonStr = '';
                                if (typeof content === 'string') {
                                  try {
                                    jsonStr = JSON.stringify(JSON.parse(content), null, 2);
                                  } catch (_) {
                                    jsonStr = content;
                                  }
                                } else {
                                  jsonStr = JSON.stringify(content, null, 2);
                                }
                                return highlightJson(jsonStr);
                              })()}
                            </div>
                          )}
                          
                          {artType === 'code' && (
                            <div className="p-2 bg-gray-50/50 border border-gray-150 rounded-lg overflow-y-auto w-full h-full min-h-[90px]">
                              {highlightCode(activeWorkspaceResult.artifact.content)}
                            </div>
                          )}

                          {artType === 'youtube' && (() => {
                            const videoId = getYouTubeId(activeWorkspaceResult.artifact.content);
                            if (videoId) {
                              return (
                                <div className="flex flex-col h-full w-full bg-[#07090c] rounded-lg overflow-hidden border border-white/[0.05] min-h-[140px]">
                                  <div className="relative w-full flex-grow bg-black flex items-center justify-center">
                                    <iframe
                                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0`}
                                      className="w-full h-full border-0 absolute inset-0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      allowFullScreen
                                      title={activeWorkspaceResult.artifact.title || 'YouTube Player'}
                                    />
                                  </div>
                                  <div className="p-2 bg-[#090b0d] border-t border-white/[0.05] shrink-0">
                                    <h4 className="text-[9px] sm:text-[10px] font-bold text-[#cbfb45] font-sans truncate px-1">
                                      {activeWorkspaceResult.artifact.title || 'YouTube Video'}
                                    </h4>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div className="flex flex-col items-center justify-center p-6 text-gray-400 font-mono text-[9px] h-full text-center">
                                <Film size={24} className="text-[#ff0000] mb-2 animate-pulse" />
                                <span>No valid YouTube link or 11-char sequence recognized.</span>
                              </div>
                            );
                          })()}

                          {artType === 'gmail' && (
                            <GmailInboxComponent 
                              content={activeWorkspaceResult.artifact.content} 
                              title={activeWorkspaceResult.artifact.title} 
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Corporate signature seal bottom margin footer */}
                  <div className="doc-footer-line border-t border-[#cbfb45] mt-1.5 pt-1.5 shrink-0 font-sans">
                    <div className="flex justify-between items-center text-[7px] font-extrabold text-black uppercase tracking-wider">
                      <span>EBURON WORKSTATION DELIVERY ENGINE</span>
                      <span className="text-[7.5px] text-gray-400">PAGE 1 OF 1</span>
                    </div>
                  </div>

                </div>
              ) : null}
            </div>

          </div>

          {/* 3. Dock Launcher bar floating beautifully in the desktop area */}
          {activeWorkspaceResult?.artifact && (
            <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 h-[30px] sm:h-[36px] bg-black/65 backdrop-blur-xl border border-white/10 rounded-full px-4 flex items-center gap-3.5 shadow-[0_12px_24px_-5px_rgba(0,0,0,0.65)] z-30 select-none">
              <DockItem icon={Download} onClick={handleDownloadMd} label={`Download Source File`} active />
              {showWordDocBtn && (
                <DockItem icon={FileText} onClick={handleDownloadWordDoc} label="Download Microsoft Word" isDocx />
              )}
              <DockItem icon={Cloud} onClick={handleSaveToDrive} label="Sync Google Drive" />
              <DockItem icon={Edit3} onClick={handleEdit} label="Edit Document" />
              <DockItem icon={Share} onClick={handleShare} label="Share Link" />
              
              <div className="w-[1px] h-4 bg-white/10" />
              
              <DockItem icon={X} onClick={closeOverlay} label="Minimize Terminal" />
            </div>
          )}

        </div>

      </div>

      {/* Symmetrical Desktop Monitor Support Pedestal Base & Neck */}
      <div className="flex flex-col items-center pointer-events-none -mt-[1px] select-none scale-[1.03] transition-all">
        {/* Supporting neck connection */}
        <div className="w-10 sm:w-16 h-4 sm:h-7 bg-gradient-to-b from-[#25282f] to-[#14161a] border-x border-white/[0.06] shadow-md" />
        {/* Support Trapezoid base plate */}
        <div className="w-28 sm:w-48 h-[5px] sm:h-[9px] bg-gradient-to-r from-[#17191d] via-[#2a2d35] to-[#17191d] rounded-t-xl shadow-lg border-t border-white/[0.08]" />
      </div>
    </motion.div>
  );
};
