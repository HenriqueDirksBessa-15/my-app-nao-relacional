const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

const maquinas = ['maquina-1', 'maquina-2', 'maquina-3'];

const INTERVALO_ENVIO = 2000;  // 2 segundos
const INTERVALO_STATS = 5000;  // 5 segundos

function gerarTemperatura() {
  // Temperatura entre 20 e 110 graus
  return (Math.random() * 90 + 20).toFixed(2);
}

async function enviarLeitura() {
  const maquina = maquinas[Math.floor(Math.random() * maquinas.length)];
  const valor = gerarTemperatura();

  try {
    await axios.post(`${BASE_URL}/metrics/metric`, {
      maquina,
      valor,
    });

    console.log(`✔ Enviada leitura: ${maquina} = ${valor}`);
  } catch (err) {
    console.error('✖ Erro ao enviar leitura:', err.message);
  }
}

async function dispararRelatorio() {
  try {
    await axios.get(`${BASE_URL}/stats/diario`);
    console.log('↻ Relatório diário acionado (sync Influx -> ClickHouse)');

    // Opcional: ler do ClickHouse e mostrar
    const { data } = await axios.get(`${BASE_URL}/stats/raw`);
    console.log('🧊 Últimos registros no ClickHouse:', data);
  } catch (err) {
    console.error('✖ Erro ao acionar relatório diário:', err.message);
  }
}

setInterval(enviarLeitura, INTERVALO_ENVIO);
setInterval(dispararRelatorio, INTERVALO_STATS);
