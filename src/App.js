import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';

const App = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false); // Controls the display of the Register component

  const surpriseOptions = [
    'Who won the latest Nobel Peace Prize?',
    'Where does pizza come from?',
    'Who do you make a BLT sandwich?'
  ];

  const surprise = () => {
    const randomValue = surpriseOptions[Math.floor(Math.random() * surpriseOptions.length)];
    setValue(randomValue);
  };

  const getResponse = async () => {
    if (!value) {
      setError("Error Please ask a question!");
      return;
    }
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({
          history: chatHistory,
          message: value
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const response = await fetch('http://localhost:8000/gemini', options);
      const data = await response.text();
      console.log(data);
      setChatHistory(oldChatHistory => [...oldChatHistory, {
        role: "user",
        parts: value
      }, {
        role: "model",
        parts: data
      }]);
    } catch (error) {
      console.error(error);
      setError("Something went wrong Please try again later.");
    }
  };

  const clear = () => {
    setValue("");
    setError("");
    setChatHistory([]);
  };
const handleLogin = async (email, password) => {
  try {
    const response = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    // Set isAuthenticated to true after successful login
    setIsAuthenticated(true);

    alert('Logged in successfully'); // Or redirect to another page
  } catch (error) {
    console.error(error);
    alert('Login failed');
  }
};



 const handleRegister = async (email, password) => {
  try {
    const response = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    alert('Registered successfully'); // Or redirect to another page
  } catch (error) {
    alert('User already exists');
  }
};


  return (
    <div className="app">
      {!isAuthenticated? (
        <>
          {/* Only show the Login component if showRegister is false */}
          {!showRegister && <Login onLogin={handleLogin} />}
          {/* Show the Register component only if showRegister is true */}
          {showRegister && <Register onRegister={handleRegister} />}
          {!showRegister && <p style={{textAlign:'center'}}>Don't have an account? <a href="#" onClick={() => setShowRegister(true)}>Register Now</a></p>}
          {showRegister && <p style={{textAlign:'center'}}>Already registered? <a href="#" onClick={() => setShowRegister(false)}>Login</a></p>}
        </>
      ) : (
        <>
          <p>What do you want to know?
            <button className="surprise" onClick={surprise} disabled={!chatHistory}>Surprise me</button>
          </p>
          <div className="input-container">
            <input
              value={value}
              placeholder="When is Christmas...?"
              onChange={(e) => setValue(e.target.value)}
            />
            {!error && <button onClick={getResponse}>Ask me</button>}
            {error && <button onClick={clear}>Clear</button>}
          </div>
          {error && <p>{error}</p>}
          <div className="search-result">
            {chatHistory.map((chatItem, _index) => (
              <div key={_index}>
                <p className="answer">{chatItem.role}: {chatItem.parts}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
