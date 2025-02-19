import express from "express"; // to create server
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
	res.send("welcome to API");
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});