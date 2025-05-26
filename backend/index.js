import express from 'express';
import { getAllSubscribers, loadTokens } from './twitch.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

loadTokens();

app.use(express.static('frontend'));

app.get('/subscribers', async (req, res) => {
  try {
    const names = await getAllSubscribers();
    res.json({ subscribers: names });
  } catch (err) {
    console.error('Error al obtener subs:', err.response?.data || err.message);
    res.status(500).json({ error: 'No se pudieron obtener los subs' });
  }
});

app.listen(port, () => {
  console.log(`Servidor iniciado en puerto ${port}`);
});
