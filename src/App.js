import React, { useEffect, useState } from 'react';
import './App.css'; // Import your styles

function App() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  // Handle input changes
  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  // Handle image change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle audio file change
  const handleAudioChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAudioUrl(reader.result); // Store Base64 audio
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle login
  const handleLogin = (event) => {
    event.preventDefault();
    if (name === 'jafor' && password === '1234') {
      setIsLoggedIn(true);
      resetForm();
    } else {
      alert('Invalid credentials, please try again.');
    }
  };

  // Reset form fields
  const resetForm = () => {
    setName('');
    setMessage('');
    setImageUrl('');
    setAudioUrl('');
    setEditIndex(null);
  };

  // Handle form submission for messages
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const body = new URLSearchParams({ name, message, image: imageUrl, audio: audioUrl });
      if (editIndex !== null) {
        body.append('method', 'editMessage');
        body.append('rowIndex', editIndex);
      } else {
        body.append('method', 'postMessage');
      }

      const response = await fetch('https://script.google.com/macros/s/AKfycbxdherLDyEI03b8upocz72asJ5MtPWa13xfD7QZeKN42itfPjxDoLoz4RJdKMlFb8A1/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      if (response.ok) {
        alert('Message sent successfully!');
        resetForm(); // Clear all fields after sending or updating
        fetchMessages();
      } else {
        alert('Error sending message');
      }
    } catch (error) {
      alert('Error sending message: ' + error);
    }
  };

  // Fetch messages from Google Sheets
  const fetchMessages = async () => {
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxdherLDyEI03b8upocz72asJ5MtPWa13xfD7QZeKN42itfPjxDoLoz4RJdKMlFb8A1/exec?method=getMessages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Handle message editing
  const handleEdit = (index) => {
    setEditIndex(index);
    setName(messages[index].name);
    setMessage(messages[index].message);
    setImageUrl(messages[index].image || ''); // Handle case if image is missing
    setAudioUrl(messages[index].audio || ''); // Handle case if audio is missing
  };

  // Handle message deletion
  const handleDelete = async (index) => {
    const messageToDelete = messages[index];
    const response = await fetch('https://script.google.com/macros/s/AKfycbxdherLDyEI03b8upocz72asJ5MtPWa13xfD7QZeKN42itfPjxDoLoz4RJdKMlFb8A1/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        method: 'deleteMessage',
        name: messageToDelete.name,
        message: messageToDelete.message,
      }),
    });

    if (response.ok) {
      alert('Message deleted successfully!');
      fetchMessages();
    } else {
      alert('Error deleting message');
    }
  };

  // Fetch messages when the user logs in
  useEffect(() => {
    if (isLoggedIn) {
      fetchMessages();
    }
  }, [isLoggedIn]);

  // Render login form or message management UI
  if (!isLoggedIn) {
    return (
      <div className="App">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Your Name" value={name} onChange={handleInputChange(setName)} required />
          <input type="password" placeholder="Password" value={password} onChange={handleInputChange(setPassword)} required />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Conversation</h1>
      <form className="contactForm" onSubmit={handleSubmit}>
        <input type="text" placeholder="Your Name" value={name} onChange={handleInputChange(setName)} required />
        <textarea placeholder="Write your message here..." value={message} onChange={handleInputChange(setMessage)} rows="4" required />
        <input type="file" onChange={handleImageChange} accept="image/*" />
        <input type="file" onChange={handleAudioChange} accept="audio/*" />
        <button type="submit">{editIndex !== null ? 'Update' : 'Send'}</button>
      </form>
      <h2>Messages</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.name}</strong>: {msg.message} <em>({new Date(msg.date).toLocaleString()})</em>
            {msg.image && (
              <p>
                <img src={msg.image} alt="Uploaded" style={{ maxWidth: '200px', maxHeight: '200px' }} />
              </p>
            )}
            {msg.audio && (
              <p>
                <audio controls>
                  <source src={msg.audio} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </p>
            )}
            <button onClick={() => handleEdit(index)}>Edit</button>
            <button onClick={() => handleDelete(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
