const PORT = 8000
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
require('dotenv').config()

const { GoogleGenerativeAI} = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEN_AI_KEY)

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/user_details', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define User schema and model
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// Registration route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).send('A user with this email already exists.');
    }

    user = new User({ email, password });
    await user.save();

    res.send('Registration successful!');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user || user.password!== password) {
      return res.status(400).send('Invalid credentials.');
    }

    res.send('Logged in successfully!');
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.post('/gemini', async (req, res) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Adjust the chat history format to match the expected structure
    const formattedHistory = req.body.history.map(chatItem => ({
        role: chatItem.role,
        parts: [{ text: chatItem.parts }] // Each part is an object with a text property
    }));

    const chat = model.startChat({
        history: formattedHistory
    });

    const msg = req.body.message;

    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    res.send(text);
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
