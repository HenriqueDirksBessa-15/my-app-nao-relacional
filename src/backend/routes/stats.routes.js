const express = require('express');
const router = express.Router();

const influx = require('../db/influx');
const { clickhouse, insertTemperaturas } = require('../db/clickhouse');

// Converte o "time" (Influx) para string YYYY-MM-DD HH:MM:SS
function toClickHouseDateTime(dateOrString) {
  const d = new Date(dateOrString);
  const iso = d.toISOString(); // 2025-11-25T21:05:30.123Z
  return iso.replace('T', ' ').substring(0, 19); // 2025-11-25 21:05:30
}

// Sincroniza últimas 10 leituras da Influx para ClickHouse
async function syncUltimos10() {
  const result = await influx.query(`
    SELECT maquina, valor, time
    FROM leituras
    ORDER BY time DESC
    LIMIT 10
  `);

  if (!result.length) {
    console.log('[stats] Nenhum dado encontrado na Influx para sync.');
    return;
  }

  const rows = result.map((r) => [
    toClickHouseDateTime(r.time),
    r.maquina,
    Number(r.valor),
  ]);

  await insertTemperaturas(rows);
  console.log(
    `[stats] Sincronizadas ${rows.length} leituras da Influx para ClickHouse.`
  );
}

// GET /stats/diario -> dispara sync (pode ser chamado pelo simulador/cron)
router.get('/diario', async (req, res) => {
  try {
    await syncUltimos10();
    return res.json({ ok: true, msg: 'Sincronização realizada com sucesso.' });
  } catch (e) {
    console.error('[GET /stats/diario] Erro:', e);
    return res.status(500).json({ erro: e.message });
  }
});

// GET /stats/raw -> lê direto do ClickHouse
router.get('/raw', async (req, res) => {
  try {
    const rows = await clickhouse
      .query(`
        SELECT
          timestamp,
          maquina,
          valor
        FROM temperaturas_diarias
        ORDER BY timestamp DESC
        LIMIT 50
      `)
      .toPromise();

    return res.json(rows.data);
  } catch (e) {
    console.error('[GET /stats/raw] Erro:', e);
    return res.status(500).json({ erro: e.message });
  }
});

// (Opcional) GET /stats/teste-clickhouse -> diagnóstico
router.get('/teste-clickhouse', async (req, res) => {
  try {
    const rows = await clickhouse
      .query(`
        SELECT
          count() AS total,
          max(timestamp) AS ultimo
        FROM temperaturas_diarias
      `)
      .toPromise();

    console.log('[GET /stats/teste-clickhouse] Resultado:', rows.data);
    return res.json(rows.data);
  } catch (e) {
    console.error('[GET /stats/teste-clickhouse] Erro:', e);
    return res.status(500).json({ erro: e.message });
  }
});

module.exports = router;
