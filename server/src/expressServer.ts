import express from 'express';
import path from 'path';

const spaPath = process.env.SPA_PATH || path.join(__dirname, '../../spa/dist');

const app = express();
app.use('/', express.static(spaPath));

export default app;
