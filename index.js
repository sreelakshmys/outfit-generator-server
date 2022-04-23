const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 8000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/surpriseme", require("./routes/surpriseme"));

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
