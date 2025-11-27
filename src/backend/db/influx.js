const Influx = require('influx');

const dbName = process.env.INFLUX_DB || 'temperaturas';

const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST || 'localhost',
  database: dbName,
  schema: [
    {
      measurement: 'leituras',
      fields: {
        valor: Influx.FieldType.FLOAT,
      },
      tags: ['maquina'],
    },
  ],
});

async function ensureDatabase() {
  try {
    const names = await influx.getDatabaseNames();
    if (!names.includes(dbName)) {
      console.log(`[Influx] Criando database ${dbName}...`);
      await influx.createDatabase(dbName);
    }
    console.log('[Influx] Database pronto.');
  } catch (err) {
    console.error('[Influx] Falha ao preparar InfluxDB:', err.message);
  }
}

ensureDatabase();

module.exports = influx;
