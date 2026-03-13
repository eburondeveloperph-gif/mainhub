'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, Mail, Calendar, FileSpreadsheet, Presentation, FileText, Folder } from 'lucide-react';

interface ToolCall {
  name: string;
  args: any;
  result?: any;
}

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; tools?: ToolCall[] }[]>([]);
  const [status, setStatus] = useState('Ready');
  const [sttApi] = useState('https://stt-app-theta.vercel.app');
  const [ttsApi] = useState('https://tts-app-liard-seven.vercel.app/api/synthesize');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Process voice command and call tools
  const processCommand = async (text: string) => {
    const command = text.toLowerCase();
    let toolCalls: ToolCall[] = [];

    // Gmail tool
    if (command.includes('send email') || command.includes('email to')) {
      const emailMatch = command.match(/to\s+(\S+@\S+)/);
      const subjectMatch = command.match(/subject\s+(.+?)(?:\s+and|\s*$)/);
      const bodyMatch = command.match(/body\s+(.+)$/);
      
      if (emailMatch) {
        const tool: ToolCall = {
          name: 'gmail_send',
          args: {
            to: emailMatch[1],
            subject: subjectMatch?.[1] || 'No Subject',
            body: bodyMatch?.[1] || 'Sent via Orbit Voice Assistant'
          }
        };
        toolCalls.push(tool);
      }
    }

    // Calendar tool
    if (command.includes('create event') || command.includes('schedule meeting')) {
      const summaryMatch = command.match(/event\s+(.+?)(?:\s+on|\s+at|\s*$)/);
      const timeMatch = command.match(/at\s+(\d{1,2}:\d{2})/);
      
      if (summaryMatch) {
        const tool: ToolCall = {
          name: 'calendar_create',
          args: {
            summary: summaryMatch[1],
            description: 'Created via Orbit Voice Assistant',
            startTime: timeMatch ? new Date().toISOString().replace(/\d{2}:\d{2}/, timeMatch[1]) : new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString()
          }
        };
        toolCalls.push(tool);
      }
    }

    // Sheets tool
    if (command.includes('create spreadsheet') || command.includes('create sheet')) {
      const nameMatch = command.match(/sheet\s+(.+?)(?:\s+for|\s*$)/) || command.match(/spreadsheet\s+(.+)$/);
      
      if (nameMatch) {
        const tool: ToolCall = {
          name: 'sheets_create',
          args: { name: nameMatch[1] }
        };
        toolCalls.push(tool);
      }
    }

    // Slides tool
    if (command.includes('create presentation') || command.includes('powerpoint') || command.includes('slide deck')) {
      const nameMatch = command.match(/presentation\s+(.+)$/);
      
      if (nameMatch) {
        const tool: ToolCall = {
          name: 'slides_create',
          args: { name: nameMatch[1] }
        };
        toolCalls.push(tool);
      }
    }

    // Docs tool
    if (command.includes('create document') || command.includes('write document')) {
      const nameMatch = command.match(/document\s+(.+)$/);
      
      if (nameMatch) {
        const tool: ToolCall = {
          name: 'docs_create',
          args: { name: nameMatch[1] }
        };
        toolCalls.push(tool);
      }
    }

    // Drive tool
    if (command.includes('save to drive') || command.includes('upload to drive')) {
      const nameMatch = command.match(/file\s+(.+)$/);
      
      if (nameMatch) {
        const tool: ToolCall = {
          name: 'drive_create',
          args: { name: nameMatch[1], mimeType: 'application/octet-stream' }
        };
        toolCalls.push(tool);
      }
    }

    if (toolCalls.length > 0) {
      setMessages(prev => [...prev, { role: 'user', content: text, tools: toolCalls }]);
      setStatus('Executing tool...');
      
      // Execute tools
      for (const tool of toolCalls) {
        try {
          const response = await fetch('/api/mcp/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tool),
          });
          const result = await response.json();
          tool.result = result;
        } catch (error) {
          tool.result = { error: 'Failed to execute' };
        }
      }
      
      setStatus('Ready');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Tool executed successfully', tools: toolCalls }]);
    } else {
      setMessages(prev => [...prev, { role: 'user', content: text }]);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Command received. How can I help with Google Workspace?' }]);
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        setStatus('Transcribing...');
        
        try {
          const sttResponse = await fetch(sttApi + '/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          const data = await sttResponse.json();
          setTranscript(data.text || '');
          await processCommand(data.text || '');
          setStatus('Ready');
        } catch (error) {
          setStatus('Error: ' + (error as any).message);
        }
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsListening(true);
      setStatus('Listening...');
    } catch (error) {
      setStatus('Microphone error');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsListening(false);
  };

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'gmail_send': return <Mail size={14} className="text-purple-400" />;
      case 'calendar_create': return <Calendar size={14} className="text-blue-400" />;
      case 'sheets_create': return <FileSpreadsheet size={14} className="text-green-400" />;
      case 'slides_create': return <Presentation size={14} className="text-red-400" />;
      case 'docs_create': return <FileText size={14} className="text-yellow-400" />;
      case 'drive_create': return <Folder size={14} className="text-cyan-400" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#14141f]">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
          Orbit Voice Assistant
        </h1>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-sm text-zinc-400">{status}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-28 h-28 rounded-full flex items-center justify-center
                     bg-gradient-to-br from-purple-600 to-indigo-600
                     hover:from-purple-500 hover:to-indigo-500
                     transition-all duration-300 shadow-lg shadow-purple-500/30
                     ${isListening ? 'animate-pulse' : ''}`}
        >
          {isListening ? (
            <MicOff size={36} className="text-white" />
          ) : (
            <Mic size={36} className="text-white" />
          )}
        </button>

        <p className="text-zinc-400 text-sm">
          {isListening ? 'Listening... Say a command' : 'Click to start voice commands'}
        </p>

        <div className="w-full max-w-2xl mt-4">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-zinc-800/50' : 'bg-zinc-900/50'}`}>
                <p className="text-sm">{msg.content}</p>
                {msg.tools && msg.tools.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {msg.tools.map((tool, j) => (
                      <div key={j} className="flex items-center gap-1 text-xs bg-zinc-800 px-2 py-1 rounded">
                        {getToolIcon(tool.name)}
                        <span>{tool.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {transcript && (
          <div className="w-full max-w-2xl p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Last transcript:</p>
            <p className="text-sm text-zinc-300">{transcript}</p>
          </div>
        )}
      </main>
    </div>
  );
}
