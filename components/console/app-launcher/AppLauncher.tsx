/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import './AppLauncher.css';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';
import { useLogStore } from '@/lib/state';

import Modal from '../../Modal';

interface AppConfig {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  colorClass: string;
  description: string;
  features: string[];
  url?: string;
}

const APPS: AppConfig[] = [
  {
    id: 'search',
    label: 'Search',
    icon: 'search',
    prompt: 'I need to search the web for something.',
    colorClass: 'search',
    description: 'High-speed web search across the global index.',
    features: ['Real-time results', 'Image & News search', 'Citations included']
  },
  {
    id: 'transcribe',
    label: 'Transcribe',
    icon: 'transcribe',
    prompt: 'Start real-time audio transcription.',
    colorClass: 'transcribe',
    description: 'Advanced speech-to-text with speaker diarization.',
    features: ['Low latency', 'Multi-language support', 'Auto-punctuation']
  },
  {
    id: 'tts',
    label: 'TTS',
    icon: 'record_voice_over',
    prompt: 'Start real-time text-to-speech mode.',
    colorClass: 'tts',
    description: 'Natural sounding neural voices for any text.',
    features: ['Human-like prosody', 'Multiple voice profiles', 'Adjustable speed']
  },
  {
    id: 'imagine',
    label: 'Imagine',
    icon: 'brush',
    prompt: 'Generate an image in real-time based on my description.',
    colorClass: 'imagine',
    description: 'State-of-the-art latent diffusion image generation.',
    features: ['Photorealistic outputs', 'Stylistic control', 'Upscaling included']
  },
  {
    id: 'navigate',
    label: 'Navigate',
    icon: 'navigation',
    prompt: 'Navigate me to the nearest coffee shop.',
    colorClass: 'maps',
    description: 'Turn-by-turn navigation with real-time traffic data.',
    features: ['Fast routing', 'POIs integrated', 'ETA calculation']
  },
  {
    id: 'nearby',
    label: 'Near Me',
    icon: 'near_me',
    prompt: 'First, use get_current_location to triangulate my exact location. Then, tell me what is interesting or important near my precise coordinates.',
    colorClass: 'maps',
    description: 'Local exploration and proximity alerts.',
    features: ['Cultural landmarks', 'Dining recommendations', 'Live events']
  },
  {
    id: 'gmail',
    label: 'Gmail',
    icon: 'mail',
    prompt: 'Check my Gmail for unread messages.',
    colorClass: 'gmail',
    description: 'Intelligent email management and search.',
    features: ['Thread summarization', 'Priority inbox access', 'Secure OAuth']
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: 'calendar_today',
    prompt: 'What is on my Calendar today?',
    colorClass: 'calendar',
    description: 'Schedule orchestration and meeting management.',
    features: ['Event creation', 'Conflict detection', 'Daily agendas']
  },
  {
    id: 'drive',
    label: 'Drive',
    icon: 'add_to_drive',
    prompt: 'Search my Google Drive for recent files.',
    colorClass: 'drive',
    description: 'Cloud storage management and deep document search.',
    features: ['File indexing', 'Sharing controls', 'Offline access']
  },
  {
    id: 'docs',
    label: 'Docs',
    icon: 'description',
    prompt: 'Create a new Google Doc.',
    colorClass: 'docs',
    description: 'Collaborative document editing and AI assistance.',
    features: ['Rich text support', 'Revision history', 'Smart canvas']
  },
  {
    id: 'sheets',
    label: 'Sheets',
    icon: 'table_chart',
    prompt: 'Create a new spreadsheet for tracking expenses.',
    colorClass: 'sheets',
    description: 'Data analysis and spreadsheet automation.',
    features: ['Complex formulas', 'Pivot tables', 'Data visualization']
  },
  {
    id: 'slides',
    label: 'Slides',
    icon: 'slideshow',
    prompt: 'Create a presentation about our quarterly goals.',
    colorClass: 'slides',
    description: 'Professional presentation building and AI layout.',
    features: ['Template library', 'Animation system', 'Presenter view']
  },
  {
    id: 'keep',
    label: 'Keep',
    icon: 'lightbulb',
    prompt: 'Take a note: Buy milk and eggs.',
    colorClass: 'keep',
    description: 'Quick notes, lists, and synchronization.',
    features: ['Checklists', 'Reminders', 'Labeling system']
  },
  {
    id: 'slack',
    label: 'Slack',
    icon: 'forum',
    prompt: 'Send a message to the #general channel on Slack.',
    colorClass: 'slack',
    description: 'Team communication and workspace integration.',
    features: ['Channel messaging', 'Direct threads', 'App webhooks']
  },
  {
    id: 'ssh',
    label: 'SSH',
    icon: 'terminal',
    prompt: 'Connect to the VPS via SSH and run "uptime".',
    colorClass: 'ssh',
    description: 'Secure tunnel to your infrastructure.',
    features: ['Remote execution', 'Infrastructure monitoring', 'Root access']
  },
  {
    id: 'code',
    label: 'Code',
    icon: 'code',
    prompt: 'Use the local model to write a Python script.',
    colorClass: 'code',
    description: 'Advanced AI programming assistant.',
    features: ['Algorithm design', 'Refactoring', 'Bug detection']
  },
  {
    id: 'ollama',
    label: 'Ollama',
    icon: 'smart_toy',
    prompt: 'Use the local Ollama model to answer a question.',
    colorClass: 'code',
    description: 'Private, sovereign AI on your own hardware.',
    features: ['Zero data leakage', 'Model experimentation', 'Offline LLM']
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: 'smart_display',
    prompt: 'Search YouTube for tech news.',
    colorClass: 'youtube',
    description: 'Global video index and content discovery.',
    features: ['Search & Play', 'Playlist access', 'Transcription']
  },
  {
    id: 'translate',
    label: 'Translate',
    icon: 'translate',
    prompt: 'I want to translate something.',
    colorClass: 'translate',
    description: 'Real-time multi-lingual translation service.',
    features: ['Grammar checks', 'Cultural context', '100+ languages'],
    url: 'https://orbit-translator.vercel.app/'
  },
  {
    id: 'voice',
    label: 'Voice Assistant',
    icon: 'mic',
    prompt: 'Use the voice assistant for Google Workspace commands.',
    colorClass: 'voice',
    description: 'Voice-controlled Google Workspace automation.',
    features: ['Email creation', 'Calendar events', 'Docs & Sheets', 'Drive files'],
    url: 'https://mainhub-one.vercel.app/'
  },
  {
    id: 'stt',
    label: 'Speech to Text',
    icon: 'speech_to_text',
    prompt: 'Start speech-to-text transcription.',
    colorClass: 'stt',
    description: 'Convert speech to text with AI.',
    features: ['Real-time transcription', 'Multiple languages', 'Speaker diarization'],
    url: 'https://stt-app-theta.vercel.app/'
  },
  {
    id: 'tts',
    label: 'Text to Speech',
    icon: 'text_to_speech',
    prompt: 'Start text-to-speech synthesis.',
    colorClass: 'tts',
    description: 'Convert text to natural speech.',
    features: ['Natural voices', 'Multiple languages', 'Voice cloning'],
    url: 'https://tts-app-liard-seven.vercel.app/'
  },
  {
    id: 'vps',
    label: 'VPS',
    icon: 'dns',
    prompt: 'Check the status of my VPS deployment.',
    colorClass: 'orbit',
    description: 'Orchestration for Virtual Private Servers.',
    features: ['Deployment logs', 'Resource usage', 'Uptime monitoring']
  },
  {
    id: 'studio',
    label: 'Studio',
    icon: 'palette',
    prompt: 'I want to generate an image.',
    colorClass: 'orbit',
    description: 'Creative design and image workflow hub.',
    features: ['Batch generation', 'In-painting', 'Design tokens']
  },
];

export default function AppLauncher() {
  const { client, connected, connect } = useLiveAPIContext();
  const { addTurn } = useLogStore();
  const [selectedApp, setSelectedApp] = React.useState<AppConfig | null>(null);

  const handleLaunchApp = (app: AppConfig) => {
    if (app.url) {
      window.open(app.url, '_blank');
      setSelectedApp(null);
      return;
    }

    if (!connected) {
      connect();
    }

    client.send([{ text: app.prompt }]);

    addTurn({
      role: 'user',
      text: app.prompt,
      isFinal: true
    });

    setSelectedApp(null);
  };

  return (
    <div className="app-launcher">
      <div className="launcher-header">
        <h2>OrbitMax</h2>
        <p>Google Workspace & Service Hub</p>
      </div>
      <div className="apps-grid">
        {APPS.map((app) => (
          <button
            key={app.id}
            className={`app-item ${app.colorClass}`}
            onClick={() => setSelectedApp(app)}
          >
            <div className="app-icon">
              <span className="material-symbols-outlined">{app.icon}</span>
            </div>
            <span className="app-label">{app.label}</span>
          </button>
        ))}
      </div>

      {selectedApp && (
        <Modal onClose={() => setSelectedApp(null)}>
          <div className="app-detail-view">
            <div className="detail-header">
              <div className={`detail-icon ${selectedApp.colorClass}`}>
                <span className="material-symbols-outlined">{selectedApp.icon}</span>
              </div>
              <div className="detail-title">
                <h3>{selectedApp.label}</h3>
                <span className="detail-system">Orbit Service Module</span>
              </div>
            </div>

            <div className="detail-body">
              <p className="description">{selectedApp.description}</p>
              <div className="features-list">
                <h4>Core Capabilities</h4>
                <ul>
                  {selectedApp.features.map((f, i) => (
                    <li key={i}>
                      <span className="material-symbols-outlined">check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="detail-footer">
              <button className="cancel-btn" onClick={() => setSelectedApp(null)}>Close</button>
              <button className={`launch-btn ${selectedApp.colorClass}`} onClick={() => handleLaunchApp(selectedApp)}>
                Launch Agent
                <span className="material-symbols-outlined">rocket_launch</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}