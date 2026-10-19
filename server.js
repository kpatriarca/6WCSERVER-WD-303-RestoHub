require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const {
  connectDatabase,
  closeDatabase,
} = require('./server/config/database');
const restaurantRoutes = require('./server/routes/restaurantRoutes');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use('/api', restaurantRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) return next(error);

  res.status(error.status || 500).json({
    error: error.status
      ? error.message
      : 'An unexpected server error occurred.',
  });
});

let server;

async function start() {
  try {
    await connectDatabase();

    server = app.listen(port, () => {
      console.log(`RestoHub running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start RestoHub:', error.message);
    process.exitCode = 1;
  }
}

async function shutdown() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await closeDatabase();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

if (require.main === module) start();

module.exports = app;
