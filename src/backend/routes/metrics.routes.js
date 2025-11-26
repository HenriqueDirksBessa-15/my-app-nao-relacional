const express = require('express');
const router = express.Router();
const influx = require('../db/influx');

// POST /metrics/metric
router.post('/metric', async (req, res) => {
  try {
    const { maquina, valor } = req.body;
    const valorFloat = parseFloat(valor);

    if (!maquina || Number.isNaN(valorFloat)) {
      return res
        .status(400)
        .json({ erro: 'Informe maquina e valor numérico' });
    }

    await influx.writePoints([
      {
        measurement: 'leituras',
        tags: { maquina },
        fields: { valor: valorFloat },
      },
    ]);

    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error('[POST /metrics/metric] Erro:', e);
    return res.status(500).json({ erro: e.message });
  }
});

// GET /metrics/metric/latest
router.get('/metric/latest', async (req, res) => {
  try {
    const result = await influx.query(`
      SELECT * FROM leituras
      ORDER BY time DESC
      LIMIT 20
    `);

    return res.json(result);
  } catch (e) {
    console.error('[GET /metrics/metric/latest] Erro:', e);
    return res.status(500).json({ erro: e.message });
  }
});

module.exports = router;
