require('dotenv').config();  // Load environment variables from .env file
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware to parse URL-encoded data and serve static files
app.use(express.urlencoded({ extended: true })); // Using Express's built-in parser
app.use(express.json()); // For parsing JSON data
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files from the 'public' folder

// Connect to MongoDB using the URI from the .env file
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/contactDB";  // Default to local MongoDB if no URI in .env
mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Define a schema for contact messages
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

// Create a model based on the schema
const Contact = mongoose.model("Contact", contactSchema);

// Serve the Contact HTML page
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contactform.html'));  // Serve the contact form
});

// Serve other HTML pages
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));  // Serve the index page
});

// Serve the page to display contact messages
app.get('/contact-messages', async (req, res) => {
  try {
    const contacts = await Contact.find(); // Fetch all messages from the database
    res.json(contacts); // Send the data in JSON format
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: 'Error fetching contact data.' });
  }
});

// POST route to handle contact form submissions
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // Send a response with an alert message and redirect to contact page
    res.send(`
      <html>
        <head>
          <script>
            alert('Thank you! Your message has been sent successfully. We will get back to you shortly.');
            window.location.href = '/contact'; // Redirect back to the contact page
          </script>
        </head>
        <body></body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`
      <html>
        <head>
          <script>
            alert('There was an issue submitting your message. Please try again later.');
            window.location.href = '/contact'; // Redirect back to the contact page
          </script>
        </head>
        <body></body>
      </html>
    `);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
