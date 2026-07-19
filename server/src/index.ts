import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = parseInt(process.env.PORT || '5000', 10);

const server = app.listen(PORT, () => {
  console.log(`\n🏟️  StadiumFlow AI Server running on port ${PORT}`);
  console.log(`   Mode: ${process.env.DEMO_MODE === 'true' ? '🎭 DEMO' : '🔴 LIVE'}`);
  console.log(`   Env: ${process.env.NODE_ENV}`);
  console.log(`   URL: http://localhost:${PORT}\n`);
});

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

export default server;
