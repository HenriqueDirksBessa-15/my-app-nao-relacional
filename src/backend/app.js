const express = require('express');
const cors = require('cors');

const metricsRoutes = require('./routes/metrics.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/metrics', metricsRoutes);
app.use('/stats', statsRoutes);

module.exports = app;
