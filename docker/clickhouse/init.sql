CREATE TABLE IF NOT EXISTS default.temperaturas_diarias (
    timestamp DateTime,
    maquina   String,
    valor     Float64
)
ENGINE = MergeTree()
ORDER BY (timestamp, maquina);

