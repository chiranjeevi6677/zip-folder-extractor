const express = require('express');
const app = express();
const fileRoutes = require('./routes/fileRoutes');

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('Root route: API is running');
});

app.use('/', fileRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
