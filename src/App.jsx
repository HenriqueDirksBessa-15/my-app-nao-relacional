import { useEffect, useState } from "react";
import { api } from "./api";
import "./App.css";

export default function App() {
  // ESTADOS ESSENCIAIS
  const [maquina, setMaquina] = useState("A1");
  const [valor, setValor] = useState("");

  const [leituras, setLeituras] = useState([]);
  const [stats, setStats] = useState([]);
  const [statsDetalhadas, setStatsDetalhadas] = useState([]);
  const [leiturasCH, setLeiturasCH] = useState([]);

  // ENVIAR LEITURA
  const enviarLeitura = async () => {
    try {
      const res = await api.post("/metrics/metric", { maquina, valor });

      if (res.data.status === "acima") {
        alert(`⚠️ ALERTA! A máquina passou do limite (${res.data.limite}°C)`);
      } else if (res.data.status === "perto") {
        alert(`⚡ Atenção! Máquina próxima do limite (${res.data.limite}°C)`);
      }
    } catch (err) {
      console.error("Erro ao enviar leitura:", err);
      return;
    }

    atualizarTudo();
  };

  // CARREGAR ÚLTIMAS LEITURAS (InfluxDB)
  const carregarLeituras = async () => {
    try {
      const res = await api.get("/metrics/metric/latest");
      setLeituras(Array.isArray(res.data) ? res.data : []);
    } catch {
      setLeituras([]);
    }
  };

  // CARREGAR MÉDIA DIÁRIA (ClickHouse)
  const carregarStats = async () => {
    try {
      const res = await api.get("/stats/agregado");
      setStats(Array.isArray(res.data) ? res.data : [res.data]);
    } catch {
      setStats([]);
    }
  };

  // CARREGAR MIN/MAX/ÚLTIMO POR DIA
  const carregarStatsDetalhadas = async () => {
    try {
      const res = await api.get("/stats/detalhado");
      setStatsDetalhadas(Array.isArray(res.data) ? res.data : [res.data]);
    } catch {
      setStatsDetalhadas([]);
    }
  };

  // CARREGAR LEITURAS RAW (ClickHouse)
  const carregarLeiturasCH = async () => {
    try {
      const res = await api.get("/stats/raw");
      setLeiturasCH(Array.isArray(res.data) ? res.data : []);
    } catch {
      setLeiturasCH([]);
    }
  };

  // ATUALIZA TUDO
  const atualizarTudo = () => {
    carregarLeituras();
    carregarStats();
    carregarStatsDetalhadas();
    carregarLeiturasCH();
  };

  // ATUALIZA AUTOMATICAMENTE A CADA 2 SEGUNDOS
  useEffect(() => {
    atualizarTudo();
    const interval = setInterval(atualizarTudo, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      {/* HEADER */}
      <header>
        <h2>Monitoramento de Temperatura de Máquinas</h2>

        <nav>
          <a href="#nova">Nova Leitura</a>
          <a href="#ultimas">Últimas Leituras</a>
          <a href="#diario">Relatório Diário</a>
        </nav>
      </header>

      <h3>InfluxDB + ClickHouse</h3>

      {/* NOVA LEITURA */}
      <section id="nova" className="card">
        <h3>Nova Leitura</h3>

        <div className="form-row">
          <input
            value={maquina}
            onChange={(e) => setMaquina(e.target.value)}
            placeholder="Máquina"
          />

          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            type="number"
            placeholder="Temperatura"
          />

          <button className="enviar" onClick={enviarLeitura}>
            Enviar
          </button>
        </div>
      </section>

      {/* ÚLTIMAS LEITURAS */}
      <section id="ultimas" className="card">
        <h3>Últimas Leituras (InfluxDB)</h3>

        {leituras.length === 0 ? (
          <p className="text-muted">Nenhum dado disponível.</p>
        ) : (
          <ul className="space-y-2">
            {leituras.map((l, i) => (
              <li key={i} className="lista-item">
                <strong>Máquina {l.maquina}</strong>: {l.valor}°C
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* RELATÓRIO MÉDIA DIÁRIA */}
      <section id="diario" className="card">
        <h3>Estatísticas Diárias (Média)</h3>

        {stats.length === 0 ? (
          <p className="text-muted">Nenhuma média disponível.</p>
        ) : (
          <ul className="space-y-2">
            {stats.map((s, i) => (
              <li key={i} className="lista-item">
                <strong>{s.maquina}</strong> — Média:{" "}
                <span className="text-blue">
                  {Number(s.media).toFixed(2)}°C
                </span>
                {" "}no dia {s.dia}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* MIN/MAX/ÚLTIMO */}
      <section className="card">
        <h3>Mínimo / Máximo / Último do Dia</h3>

        {statsDetalhadas.length === 0 ? (
          <p className="text-muted">Nenhum dado disponível.</p>
        ) : (
          <ul className="space-y-2">
            {statsDetalhadas.map((s, i) => (
              <li key={i} className="lista-item">
                <strong>{s.maquina}</strong> — 
                Min: <span className="text-blue">{s.minimo}°C</span> — 
                Max: <span className="text-red">{s.maximo}°C</span> — 
                Último: {s.ultimo}°C
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* RAW CLICKHOUSE */}
      <section className="card">
        <h3>Últimas Leituras Gravadas no ClickHouse</h3>

        {leiturasCH.length === 0 ? (
          <p className="text-muted">Nenhum registro.</p>
        ) : (
          <ul className="space-y-2">
            {leiturasCH.map((l, i) => (
              <li key={i} className="lista-item">
                {l.timestamp} — <strong>{l.maquina}</strong>: {l.valor}°C
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
