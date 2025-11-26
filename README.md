# Monitoramento de Temperaturas (React + Express + InfluxDB + ClickHouse)

Aplicação simples para registrar leituras de temperatura no InfluxDB e gerar estatísticas diárias no ClickHouse.

## Requisitos
- Docker Desktop
- Node.js 16+
- npm

## Subindo os bancos

### InfluxDB 1.8
```bash
docker run -d --name influxdb -p 8086:8086 influxdb:1.8
```
Criar banco (se ainda não existir):
```bash
docker exec -it influxdb influx -execute "CREATE DATABASE temperaturas"
```

### ClickHouse
```bash
docker run -d --name clickhouse -p 8123:8123 -p 9000:9000 clickhouse/clickhouse-server:23
```
Criar base (opcional se usar `default`):
```bash
docker exec -it clickhouse clickhouse-client --query "CREATE DATABASE IF NOT EXISTS default"
```
Tabela (o backend também cria, mas você pode garantir manualmente):
```bash
docker exec -it clickhouse clickhouse-client --query "CREATE TABLE IF NOT EXISTS default.temperaturas_diarias (timestamp DateTime, maquina String, valor Float32) ENGINE = MergeTree() ORDER BY (timestamp, maquina)"
```

## Backend
```bash
cd src/backend
npm install
# Se precisar ajustar porta/host do ClickHouse HTTP (padrão 8123): $env:CLICKHOUSE_PORT=8123 (PowerShell)
npm start
# Servidor em http://localhost:3001
```

## Frontend
```bash
npm install
npm start
# Abre em http://localhost:3000
```

## Simulador (opcional)
Gera leituras e aciona o relatório automaticamente.
```bash
node src/simulador/simulador.js
```

## Endpoints úteis
- `POST http://localhost:3001/metrics/metric` body `{ "maquina": "A1", "valor": 50 }`
- `GET http://localhost:3001/metrics/metric/latest`
- `GET http://localhost:3001/stats/diario` (sincroniza últimos 10 do Influx -> ClickHouse e retorna médias diárias)
- `GET http://localhost:3001/stats/raw` (últimas leituras no ClickHouse)

## Observações
- O backend usa o driver HTTP do ClickHouse (porta 8123). Certifique-se de expor essa porta no container.
- InfluxDB: base padrão `temperaturas` em `localhost:8086`. Ajuste via `INFLUX_DB`/`INFLUX_HOST` se necessário.
