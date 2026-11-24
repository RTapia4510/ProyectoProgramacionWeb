import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors()); // permite que el navegador llame al API
app.use(express.json()); // entiende cuerpos JSON en las peticiones

app.get('/', (req, res) => {
res.json({ mensaje: 'API del proyecto', code: 200 });
});

export default app;