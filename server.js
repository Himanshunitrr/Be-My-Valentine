// server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config();

// Set EJS as templating engine.
app.set("view engine", "ejs");

// Serve static files from the "public" directory.
app.use(express.static("public"));

// Parse URL-encoded bodies (for form submissions)
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
const mongoURI =
	`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.h8gad.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`; // Replace with your connection string.
mongoose
	.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("Connected to MongoDB Atlas"))
	.catch((err) => console.log(err));

// Define a Schema and Model for the Valentine details.
const valentineSchema = new mongoose.Schema({
	date: String,
	time: String,
	place: String,
	activity: String,
});

const Valentine = mongoose.model("Valentine", valentineSchema);

/**
 * Route: GET /create
 * Displays a form where the user (boy) can enter the Valentine date details.
 */
app.get("/create", (req, res) => {
	res.render("create");
});
app.get("/", (req, res) => {
	res.render("create");
});
/**
 * Route: POST /create
 * Saves the submitted details to the database and generates a shareable URL.
 */
app.post("/create", async (req, res) => {
	try {
		const { date, time, place, activity } = req.body;
		const newValentine = new Valentine({ date, time, place, activity });
		const savedValentine = await newValentine.save();

		// Create a shareable URL – for example: http://yourdomain.com/valentine/<id>
		const shareableUrl = `${req.protocol}://${req.get("host")}/valentine/${
			savedValentine._id
		}`;
		res.render("created", { shareableUrl });
	} catch (err) {
		console.error(err);
		res.status(500).send("Error saving the valentine details.");
	}
});

/**
 * Route: GET /valentine/:id
 * Displays the playful Valentine’s question page (with Yes/No buttons) for the given id.
 */
app.get("/valentine/:id", (req, res) => {
	res.render("index", { id: req.params.id });
});

/**
 * Route: GET /valentine/:id/yes
 * Retrieves the details from the database and shows the Yes page populated with them.
 */
app.get("/valentine/:id/yes", async (req, res) => {
	try {
		const data = await Valentine.findById(req.params.id);
		if (!data) {
			return res.status(404).send("No data found for this Valentine date.");
		}
		res.render("yes", { data });
	} catch (err) {
		console.error(err);
		res.status(500).send("Error retrieving data.");
	}
});

// Start the server.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
