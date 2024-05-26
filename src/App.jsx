import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { analyzeImage } from './visionApi';

const API_KEY = "sk-proj-BEFY8dmiEjOLRAYMCgxdT3BlbkFJavP972ULwpROTe3iAHdp";
const systemMessage = { "role": "system", "content": "You are an experienced veterinary with 30 years of experience and several large self-owned farms." };

function ChatPage() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm here to help you with your livestock and farm!",
      sentTime: "just now",
      sender: "ChatGPT",
      direction: 'incoming'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT",
        direction: 'incoming'
      }]);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <header className="header">
        <h1>Maljan.AI</h1>
        <h2>Your farm assistant</h2>
      </header>
      <main className="chat-container">
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => (
                <Message
                  key={i}
                  model={{
                    message: message.message,
                    sentTime: message.sentTime,
                    sender: message.sender,
                    direction: message.direction
                  }}
                  className={message.sender === 'ChatGPT' ? 'assistant-message' : 'user-message'}
                />
              ))}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </main>
      <nav className="navigation">
        <Link to="/maljan-cv">
          <button className="nav-button">Go to Maljan.CV</button>
        </Link>
      </nav>
    </div>
  );
}

function MaljanCV() {
  const [imageFile, setImageFile] = useState(null);
  const [labels, setLabels] = useState([]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (imageFile) {
      const base64Image = imageFile.replace(/^data:image\/[a-z]+;base64,/, '');
      try {
        const labels = await analyzeImage(base64Image);
        setLabels(labels);
      } catch (error) {
        console.error('Error analyzing image:', error);
      }
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Maljan.CV</h1>
      </header>
      <main className="content">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {imageFile && <img src={imageFile} alt="Selected" className="uploaded-image" />}
        <button onClick={handleAnalyzeImage} className="analyze-button">Analyze Image</button>
        <div>
          <h2>Labels</h2>
          <ul>
            {labels.map((label, index) => (
              <li key={index}>{label.description} - Score: {label.score}</li>
            ))}
          </ul>
        </div>
      </main>
      <nav className="navigation">
        <Link to="/">
          <button className="nav-button">Go to Chat Page</button>
        </Link>
      </nav>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/maljan-cv" element={<MaljanCV />} />
      </Routes>
    </Router>
  );
}

export default App;
