const express = require("express");
const cors = require('cors')
const app = express();
const testConnection = require('./config/db')
require('dotenv').config();


const PORT = 5000;

//middleware
app.use(cors())
app.use(express.json())

app.use('/api', require('./routes/userRoutes'))
app.use('/api', require('./routes/projectFormRoutes'))

app.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});
