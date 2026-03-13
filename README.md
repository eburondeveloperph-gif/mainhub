<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# OrbitMax: Eburon Autonomous App Connect

OrbitMax is a premium, high-agency AI orchestration hub designed for Master E. It combines real-time multimodal intelligence with a robust tool-broker system to automate workflows across Google Workspace, SSH environments, and local LLMs.

## 🚀 Key Features

- **Multimodal AI**: Leverages Gemini 2.0 Live for real-time voice and vision interactions.
- **Eburon Model Gateway**: A unified FastAPI-based Docker gateway orchestrating specialized models:
  - `eburon-apo:ultimate` (High Reasoning)
  - `eburon-buntun:vision` (Visual/Multimodal)
  - `eburon-callao:flash` (High Speed)
  - `eburon-itawit:heritage` (Itawit Cultural Specialist)
- **Tool Broker Architecture**: Securely executes tasks across VPS (SSH), Google Workspace (Gmail, Calendar, Drive), and Slack.
- **Elite UI/UX**: Premium app launcher with detailed service modals, real-time radar mapping, and high-fidelity image visualization.
- **Geolocation Intelligence**: Precise user triangulation for "Near Me" proximity services.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Zustand, Vanilla CSS (Elite Aesthetics).
- **Backend (Orchestration)**: FastAPI, Python 3.11, Docker Compose.
- **AI/ML**: Google GenAI (Gemini), Ollama, Hugging Face.
- **Infrastructure**: Vercel ready, VPS Runner with multi-tenant support.

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- API Keys: Gemini, Ollama, Hugging Face (optional)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/eburondeveloperph-gif/jubilant-telegram.git
   cd jubilant-telegram
   ```

2. **Setup Environment**:
   Update [.env.local](.env.local) with your keys:

   ```env
   VITE_GEMINI_API_KEY=your_gemini_key
   VITE_OLLAMA_API_KEY=your_ollama_key
   HF_TOKEN=your_huggingface_token
   ```

3. **Launch the Gateway (Docker)**:

   ```bash
   docker-compose up -d
   ```

4. **Run the Frontend**:

   ```bash
   npm install
   npm run dev
   ```

## 🛡 License

This project is licensed under the Apache-2.0 License.

---
**Powered by Eburon AI — Tailored for Master E.**
