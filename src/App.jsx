import { useEffect, useState } from "react";
import { api } from "./api";

export default function App() {
  const [maquina, setMaquina] = useState("A1");
  const [valor, setValor] = useState("");
  const [leituras, setLeituras] = useState([]);
  const [stats, setStats] = useState([]);
  const [leiturasCH, setLeiturasCH] = useState([]);
  const [erroStats, setErroStats] = useState("");
  const [erroCH, setErroCH] = useState("");

  const enviarLeitura = async () => {
    try {
      await api.post("/metrics/metric", { maquina, valor });
    } catch (err) {
      console.error("Erro ao enviar leitura:", err);
      return;
    }
    carregarLeituras();
    carregarStats();
    carregarLeiturasCH();
  };

  const carregarLeituras = async () => {
    try {
      const res = await api.get("/metrics/metric/latest");
      setLeituras(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erro ao carregar leituras:", err);
      setLeituras([]);
    }
  };

  const carregarStats = async () => {
    try {
      const res = await api.get("/stats/diario");
      setStats(Array.isArray(res.data) ? res.data : []);
      setErroStats("");
    } catch (err) {
      console.error("Erro ao carregar stats:", err);
      setStats([]);
      setErroStats("Erro ao buscar relatório diário");
    }
  };

  const carregarLeiturasCH = async () => {
    try {
      const res = await api.get("/stats/raw");
      setLeiturasCH(Array.isArray(res.data) ? res.data : []);
      setErroCH("");
    } catch (err) {
      console.error("Erro ao carregar leituras do ClickHouse:", err);
      setLeiturasCH([]);
      setErroCH("Erro ao buscar leituras do ClickHouse");
    }
  };

  const atualizarTudo = () => {
    carregarLeituras();
    carregarStats();
    carregarLeiturasCH();
  };

  useEffect(() => {
    atualizarTudo();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial", maxWidth: 960, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Monitoramento</h2>
        <nav style={{ display: "flex", gap: 12 }}>
          <a href="#nova">Nova Leitura</a>
          <a href="#ultimas">Últimas Leituras</a>
          <a href="#diario">Relatório Diário</a>
        </nav>
      </header>
      <h3 style={{ marginTop: 0 }}>InfluxDB + ClickHouse</h3>

      <div id="nova">
        <h3>Nova Leitura</h3>
        <input value={maquina} onChange={e => setMaquina(e.target.value)} />
        <input value={valor} onChange={e => setValor(e.target.value)} type="number" />
        <button onClick={enviarLeitura}>Enviar</button>
        <button style={{ marginLeft: 8 }} onClick={atualizarTudo}>Atualizar listas</button>
      </div>

      <hr />

      <h3 id="ultimas">Últimas Leituras (InfluxDB)</h3>
      <ul>
        {leituras.map((l, i) => (
          <li key={i}>Máquina {l.maquina}: {l.valor}°C</li>
        ))}
      </ul>

      <hr />

      <h3 id="diario">Estatísticas Diárias (ClickHouse)</h3>
      {erroStats && <div style={{ color: "red" }}>{erroStats}</div>}
      {stats.length === 0 ? (
        <p>Nenhum dado diário disponível.</p>
      ) : (
        <ul>
          {stats.map((s, i) => (
            <li key={i}>
              {s.maquina} - Média: {Number(s.media).toFixed(2)}°C em {s.dia}
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h3>Últimas Leituras Gravadas no ClickHouse</h3>
      {erroCH && <div style={{ color: "red" }}>{erroCH}</div>}
      {leiturasCH.length === 0 ? (
        <p>Nenhum registro encontrado.</p>
      ) : (
        <ul>
          {leiturasCH.map((l, i) => (
            <li key={i}>
              {l.timestamp} — {l.maquina}: {l.valor}°C
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
