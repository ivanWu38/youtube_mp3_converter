import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 4000;
let link;
let title;

// Function to extract video ID from YouTube URL
function extractVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null; // Return video ID if found, otherwise null
  }

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Route to render the main page with the form
app.get("/", (req, res) => {
  res.render("index", { link, title });
});

app.get("/redirect", (req, res) => {
  link = null;
  title = null;
  res.redirect("/");
});

// Route to handle form submission and YouTube to MP3 conversion
app.post("/convert", async (req, res) => {
  const youtubeUrl = req.body.videoUrl; // Retrieve the YouTube URL from the form
  const videoId = extractVideoId(youtubeUrl); // Extract the video ID

  console.log(videoId);

  if (!videoId) {
    return res.send("Invalid YouTube URL. Please try again!");
  }

  const options = {
    method: "GET",
    url: "https://youtube-mp36.p.rapidapi.com/dl",
    params: { id: videoId }, // Pass the video ID
    headers: {
      'x-rapidapi-key': process.env.API_KEY,
      'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
    },
  };

  try {
    const response = await axios.request(options); // Make the API call
    link = response.data.link;
    title = response.data.title;
    console.log(`link: ${link}, title: ${title}`);
    res.render('index', { link, title });    

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.send("An error occurred. Please try again later.");
  }
});


// Start the server
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));