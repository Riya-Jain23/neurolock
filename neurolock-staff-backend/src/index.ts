import express from 'express';
import { createServer } from './server';

const app = createServer();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4311;

// Bind explicitly to 0.0.0.0 so the server is reachable from other devices on the LAN
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} and bound to 0.0.0.0`);
});