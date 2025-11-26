# Monitoramento de Temperaturas (React + Express + InfluxDB + ClickHouse)

Aplicação simples para registrar leituras de temperatura no InfluxDB e gerar estatísticas diárias no ClickHouse.

## Requisitos

- Docker Desktop
- Docker Compose

## Quick Start (Recomendado)

A maneira mais fácil de rodar toda a aplicação é usando Docker Compose:

```bash
docker-compose up --build
```

Isso irá iniciar automaticamente:

- **InfluxDB** em `localhost:8086`
- **ClickHouse** em `localhost:8123`
- **Backend** em `localhost:3001`
- **Frontend** em `localhost:3000`

Os bancos de dados são inicializados automaticamente com as tabelas necessárias.

### Comandos úteis

```bash
docker-compose up -d --build

docker-compose logs -f

docker-compose logs -f backend

docker-compose down

docker-compose down -v
```

---

## Desenvolvimento Manual (Alternativo)

Se preferir rodar manualmente para desenvolvimento:

### Requisitos adicionais

- Node.js 16+
- npm

### Subindo os bancos

#### InfluxDB 1.8

```bash
docker run -d --name influxdb -p 8086:8086 influxdb:1.8
```

Criar banco (se ainda não existir):

```bash
docker exec -it influxdb influx -execute "CREATE DATABASE temperaturas"
```

#### ClickHouse

```bash
docker run -d --name clickhouse -p 8123:8123 -p 9000:9000 clickhouse/clickhouse-server:23
```

Criar tabela:

```bash
docker exec -it clickhouse clickhouse-client --query "CREATE TABLE IF NOT EXISTS default.temperaturas_diarias (timestamp DateTime, maquina String, valor Float64) ENGINE = MergeTree() ORDER BY (timestamp, maquina)"
```

### Backend

```bash
cd src/backend
npm install
npm start
```

### Frontend

```bash
npm install
npm start
```

---

## Simulador (opcional)

Gera leituras e aciona o relatório automaticamente.

```bash
node src/simulador/simulador.js
```

## Endpoints úteis

- `POST http://localhost:3001/metrics/metric` body `{ "maquina": "A1", "valor": 50 }`
- `GET http://localhost:3001/metrics/metric/latest`
- `GET http://localhost:3001/stats/diario` (sincroniza últimos 10 do Influx -> ClickHouse)
- `GET http://localhost:3001/stats/raw` (últimas leituras no ClickHouse)

## Observações

- O backend usa o driver HTTP do ClickHouse (porta 8123)
- InfluxDB: base padrão `temperaturas` em `localhost:8086`
- Para mais detalhes técnicos, consulte o arquivo `CONTEXT.md`
