const { ClickHouse } = require('clickhouse');

const clickhouse = new ClickHouse({
  url: process.env.CLICKHOUSE_URL || 'http://localhost',
  port: Number(process.env.CLICKHOUSE_PORT || 8123),
  debug: false,
  basicAuth: {
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
  },
  config: {
    database: process.env.CLICKHOUSE_DB || 'default',
  },
  format: 'json',
});

// Cria a tabela se não existir
function ensureTable() {
  const ddl = `
    CREATE TABLE IF NOT EXISTS temperaturas_diarias (
      timestamp DateTime,
      maquina   String,
      valor     Float64
    )
    ENGINE = MergeTree()
    ORDER BY (timestamp, maquina)
  `;

  return clickhouse
    .query(ddl)
    .toPromise()
    .then(() => {
      console.log('[ClickHouse] Tabela temperaturas_diarias pronta.');
    })
    .catch((err) => {
      console.error('[ClickHouse] Erro ao criar tabela:', err.message);
    });
}

async function insertTemperaturas(rows) {
  if (!rows || !rows.length) return;

  // rows = [[timestamp, maquina, valor], ...]
  await clickhouse
    .insert(
      'INSERT INTO temperaturas_diarias (timestamp, maquina, valor) VALUES',
      rows
    )
    .toPromise();
}

ensureTable();

module.exports = { clickhouse, insertTemperaturas };
