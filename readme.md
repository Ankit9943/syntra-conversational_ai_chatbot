# Syntra - Conversational AI

Syntra is a full-stack, real-time chat application that leverages a vector database to give conversational AI both short-term and long-term memory. It demonstrates a modern Retrieval-Augmented Generation (RAG) architecture using Node.js, Express, React, and Pinecone.

---

## Table of Contents

- [Syntra - Conversational AI](#syntra---conversational-ai)
  - [Table of Contents](#table-of-contents)
  - [Key Features](#key-features)
  - [Tech Stack](#tech-stack)
  - [System Architecture](#system-architecture)
  - [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Usage](#usage)
  - [Future Improvements](#future-improvements)
  - [Contact](#contact)

---

## Key Features

- ⚡ **Real-time Communication:** Instant messaging between user and AI via Socket.IO.
- 🟢 **Authentication System:** Secure signup/login with session handling.
- 💬 **Multiple Chat Sessions:** Users can create, manage, and switch between different chat threads.
- 📚 **Short-Term Memory:** Retains context of the current conversation from MongoDB.
- 🧠 **Long-Term Memory:** Stores and retrieves relevant context across all past chats using Pinecone.
- 🎤 **Voice Typing Support:** Dictate messages with browser speech recognition.
- 📱 **Responsive UI:** Modern, mobile-friendly interface built with React and Tailwind CSS.
- 🔐 **Scalable Back-End:** Node.js and Express handling multiple concurrent users.

---

## Tech Stack

**Front-End:**

- React
- Tailwind CSS
- Vite
- Redux

**Back-End:**

- Node.js
- Express.js
- Socket.IO

**Database & AI:**

- Pinecone (Vector DB for long-term memory)
- MongoDB (Primary DB for chat history)
- Gemini API (Google's LLM)

---

## System Architecture

Syntra implements a Retrieval-Augmented Generation (RAG) architecture:

1. **Process & Store User Input:**
   - Save message to MongoDB.
   - Generate vector embedding and store in Pinecone.
2. **Gather Context:**
   - Query Pinecone for semantically similar memories.
   - Retrieve recent chat history from MongoDB.
3. **Generate & Store AI Response:**
   - Combine long-term and short-term context, send to Gemini.
   - Save response to MongoDB and Pinecone.
4. **Deliver Response:**
   - Send response to user in real-time via Socket.IO.

---

## Getting Started

Follow these instructions to set up Syntra locally.

---

## Prerequisites

- Node.js (v18 or later)
- npm
- Pinecone API Key
- Gemini API Key
- MongoDB connection string

---

## Installation

```bash
# Clone the repository
git clone https://github.com/Ankit9943/syntra-conversational_ai_chatbot.git
cd syntra-conversational_ai_chatbot


# Install back-end dependencies
cd backend
npm install

# Install front-end dependencies
cd /frontend
npm install
```

---

## Environment Variables

Create a `.env` file in the `backend` directory. Add following variables:

```env
JWT_SECRET=your-secret-key

# Pinecone API Credentials
PINECONE_API_KEY=your-pinecone-api-key

# AI Model API Keys
GEMINI_API_KEY=your-gemini-api-key

# Database Connection String
MONGO_URI=your-mongodb-connection-string
```

---

## Usage

```bash
# Start the back-end server
cd backend
npm run dev

# Start the front-end development server
cd frontend
npm run dev
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## Future Improvements

- [ ] Add text-to-speech for AI responses
- [ ] Multi-language support
- [ ] Richer UI/UX → message editing, deleting, reactions
- [ ] Analytics dashboard for chat usage

---

## Contact

**Author:** Ankit Sharma  
**Email:** asharma65382@gmail.com
<br/>
**Project Link:** https://github.com/Ankit9943/syntra-conversational_ai_chatbot.git <br/>
**LinkedIn:** https://www.linkedin.com/in/ankitsh1/
