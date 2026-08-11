require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Client Project Tracker API server running on http://localhost:${PORT}`);
});
