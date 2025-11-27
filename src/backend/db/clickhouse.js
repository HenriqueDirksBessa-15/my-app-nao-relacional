const { ClickHouse } = require("clickhouse");

const clickhouse = new ClickHouse({
  url: process.env.CLICKHOUSE_URL || "http://localhost",
  port: Number(process.env.CLICKHOUSE_PORT || 8123),
  debug: false,
  basicAuth: {
    username: process.env.CLICKHOUSE_USER || "default",
    password: process.env.CLICKHOUSE_PASSWORD || "",
  },
  config: {
    database: process.env.CLICKHOUSE_DB || "default",
  },
  format: "json",
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
      console.log("[ClickHouse] Tabela temperaturas_diarias pronta.");
    })
    .catch((err) => {
      console.error("[ClickHouse] Erro ao criar tabela:", err.message);
    });
}

async function insertTemperaturas(rows) {
  if (!rows || !rows.length) return;

  const values = rows
    .map(
      ([timestamp, maquina, valor]) =>
        `('${timestamp}', '${maquina}', ${valor})`
    )
    .join(", ");

  const query = `INSERT INTO temperaturas_diarias (timestamp, maquina, valor) VALUES ${values}`;

  console.log("[ClickHouse] Executando INSERT:", query);

  try {
    const result = await clickhouse.query(query).toPromise();
    console.log("[ClickHouse] INSERT bem-sucedido, linhas:", rows.length);
    return result;
  } catch (err) {
    console.error("[ClickHouse] Erro no INSERT:", err.message);
    throw err;
  }
}

ensureTable();

module.exports = { clickhouse, insertTemperaturas };
