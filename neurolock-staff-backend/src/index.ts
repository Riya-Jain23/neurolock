import express from 'express';
import { createServer } from './server';

const app = createServer();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4311;

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('[GLOBAL] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[GLOBAL] Uncaught Exception:', error);
    process.exit(1);
});

// Bind explicitly to 0.0.0.0 so the server is reachable from other devices on the LAN
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} and bound to 0.0.0.0`);
});

server.on('error', (err) => {
    console.error('[SERVER] Error:', err);
    process.exit(1);
});