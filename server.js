const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Habilita CORS para todas as origens durante o desenvolvimento
app.use(cors());

// Rota para servir os vídeos
app.use('/videos', express.static('D:/KARAOKEV3/musicas'));

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 