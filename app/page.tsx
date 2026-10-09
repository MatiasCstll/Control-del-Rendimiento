"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Produccion = {
  id: string;
  lote: string;
  fecha: string;
  paddy: number;
  blanco: number;
  rendimiento: number;
  etapa: string | null;
  estado: string;
};

export default function ControlRendimientoPage() {
  const [registros, setRegistros] = useState<Produccion[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario
  const [lote, setLote] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [paddy, setPaddy] = useState("");
  const [blanco, setBlanco] = useState("");
  const [etapa, setEtapa] = useState("Descascarado");

  // Cargar datos
  const cargarDatos = async () => {
    try {
      const res = await fetch("/api/produccion");
      const data = await res.json();
      setRegistros(data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Stats
  const completados = registros.filter((r) => r.estado === "Completado");
  const totalBlanco = completados.reduce((sum, r) => sum + r.blanco, 0);
  const totalPaddy = completados.reduce((sum, r) => sum + r.paddy, 0);
  const rendimientoGlobal = totalPaddy > 0 ? (totalBlanco / totalPaddy) * 100 : 0;
  const lotesActivos = registros.filter((r) => r.estado === "En proceso").length;

  // Guardar nuevo registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const paddyNum = parseFloat(paddy);
    const blancoNum = parseFloat(blanco);

    if (blancoNum > paddyNum) {
      alert("El arroz blanco no puede ser mayor que el paddy de entrada.");
      return;
    }

    const rendimiento = paddyNum > 0 ? (blancoNum / paddyNum) * 100 : 0;

    try {
      const res = await fetch("/api/produccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lote,
          fecha,
          paddy: paddyNum,
          blanco: blancoNum,
          rendimiento: parseFloat(rendimiento.toFixed(1)),
          etapa,
          estado: blancoNum > 0 ? "Completado" : "En proceso",
        }),
      });

      if (res.ok) {
        setLote("");
        setPaddy("");
        setBlanco("");
        setFecha(new Date().toISOString().split("T")[0]);
        cargarDatos(); // recargar tabla
      } else {
        const error = await res.json();
        alert(error.message || "Error al guardar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  // Datos del gráfico (ejemplo estático por ahora)
  const chartData = {
    labels: ["Recepción", "Limpieza", "Descascarado", "Pulido", "Clasificación", "Empaque"],
    datasets: [
      {
        label: "Rendimiento (%)",
        data: [98.5, 97.2, 78.4, 92.1, 96.8, 99.1],
        backgroundColor: ["#0f766e", "#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4"],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (value: any) => value + "%" },
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 to-teal-800 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          Control del Rendimiento
        </h1>
        <div className="text-sm opacity-90">Molino de Arroz · Turno Actual</div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Producción Hoy"
            value={`${totalBlanco.toLocaleString()} kg`}
            sub="Arroz blanco"
            color="teal"
          />
          <StatCard
            label="Rendimiento Global"
            value={`${rendimientoGlobal.toFixed(1)}%`}
            sub="Meta: 70%"
            color="green"
          />
          <StatCard
            label="Pérdidas"
            value="4.2%"
            sub="vs ayer: -0.8%"
            color="orange"
          />
          <StatCard
            label="Lotes Activos"
            value={lotesActivos.toString()}
            sub="En proceso"
            color="slate"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Columna izquierda (tabla + gráfico) */}
          <div className="xl:col-span-2 space-y-6">
            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                📋 Registros de Producción
              </h2>

              {loading ? (
                <p className="text-slate-500">Cargando...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <th className="px-4 py-3 text-left">Lote</th>
                        <th className="px-4 py-3 text-left">Fecha</th>
                        <th className="px-4 py-3 text-left">Paddy (kg)</th>
                        <th className="px-4 py-3 text-left">Arroz Blanco</th>
                        <th className="px-4 py-3 text-left">Rendimiento</th>
                        <th className="px-4 py-3 text-left">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registros.map((r) => (
                        <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">{r.lote}</td>
                          <td className="px-4 py-3">
                            {new Date(r.fecha).toLocaleDateString("es-AR")}
                          </td>
                          <td className="px-4 py-3">{r.paddy.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            {r.blanco > 0 ? r.blanco.toLocaleString() : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {r.rendimiento > 0 ? `${r.rendimiento}%` : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                r.estado === "Completado"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {r.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Gráfico */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-4">📊 Rendimiento por Etapa</h2>
              <div className="h-72">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-4">➕ Nuevo Registro</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Número de Lote</label>
                  <input
                    type="text"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    placeholder="Ej: L-2026-042"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-500 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-500 mb-1">Paddy Entrada (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paddy}
                    onChange={(e) => setPaddy(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-500 mb-1">Arroz Blanco (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={blanco}
                    onChange={(e) => setBlanco(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-500 mb-1">Etapa Principal</label>
                  <select
                    value={etapa}
                    onChange={(e) => setEtapa(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Recepcion">Recepción</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Descascarado">Descascarado</option>
                    <option value="Pulido">Pulido</option>
                    <option value="Clasificacion">Clasificación</option>
                    <option value="Empaque">Empaque</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-medium py-2.5 rounded-lg transition"
                  >
                    Guardar Registro
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLote("");
                      setPaddy("");
                      setBlanco("");
                    }}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-lg transition"
                  >
                    Limpiar
                  </button>
                </div>
              </form>
            </div>

            {/* Info etapas */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-3">ℹ️ Etapas del Proceso</h2>
              <ul className="text-sm text-slate-600 space-y-1.5">
                <li>• <strong>Recepción</strong>: Paddy húmedo</li>
                <li>• <strong>Limpieza</strong>: Eliminación de impurezas</li>
                <li>• <strong>Descascarado</strong>: Separación de cáscara</li>
                <li>• <strong>Pulido</strong>: Blanqueo del grano</li>
                <li>• <strong>Clasificación</strong>: Por tamaño y calidad</li>
                <li>• <strong>Empaque</strong>: Producto final</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "teal" | "green" | "orange" | "slate";
}) {
  const colors = {
    teal: "text-teal-700",
    green: "text-emerald-600",
    orange: "text-amber-600",
    slate: "text-slate-800",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}