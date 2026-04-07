'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [jugadores, setJugadores] = useState<any[]>([])
  const [configPartidos, setConfigPartidos] = useState<any[]>([])
  const [editando, setEditando] = useState({ id: null, campo: null }) // Para saber qué estamos editando

  useEffect(() => {
    fetchDatos()
  }, [])

  async function fetchDatos() {
    const { data: jug } = await supabase.from('partidos').select('*')
    const { data: conf } = await supabase.from('configuracion_partidos').select('*').order('id', { ascending: true })
    setJugadores(jug || [])
    setConfigPartidos(conf || [])
  }

  async function actualizarConfig(id, campo, valor) {
    const { error } = await supabase
      .from('configuracion_partidos')
      .update({ [campo]: valor })
      .eq('id', id)
    
    if (!error) {
      setEditando({ id: null, campo: null })
      fetchDatos()
    }
  }

  async function sumarJugador(partidoId) {
    if (!nombreUsuario) return alert("Poné tu nombre primero")
    const { error } = await supabase
      .from('partidos')
      .insert([{ nombre: nombreUsuario, partido_id: partidoId.toString(), estado: 'confirmado' }])
    if (!error) { setNombreUsuario(''); fetchDatos(); }
  }

  async function borrarJugador(id) {
    await supabase.from('partidos').delete().eq('id', id)
    fetchDatos()
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">⚽ Gestión de Turnos</h1>

        <div className="max-w-sm mx-auto mb-12 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl">
          <input 
            type="text" 
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            className="w-full p-3 rounded bg-slate-900 border border-slate-600 outline-none focus:border-green-500"
            placeholder="Tu nombre para anotarte..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {configPartidos.map((partido) => (
            <div key={partido.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
              {/* Edición de Nombre de Fecha */}
              <div className="mb-2">
                {editando.id === partido.id && editando.campo === 'nombre' ? (
                  <input 
                    autoFocus
                    className="bg-slate-900 text-xl font-bold w-full p-1 rounded"
                    defaultValue={partido.nombre_fecha}
                    onBlur={(e) => actualizarConfig(partido.id, 'nombre_fecha', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && actualizarConfig(partido.id, 'nombre_fecha', e.currentTarget.value)}
                  />
                ) : (
                  <h2 
                    onClick={() => setEditando({ id: partido.id, campo: 'nombre' })}
                    className="text-2xl font-bold text-blue-400 cursor-pointer hover:bg-slate-700 rounded px-1"
                  >
                    {partido.nombre_fecha} ✎
                  </h2>
                )}
              </div>

              {/* Edición de Lugar */}
              <div className="mb-6 italic text-slate-400">
                {editando.id === partido.id && editando.campo === 'lugar' ? (
                  <input 
                    autoFocus
                    className="bg-slate-900 w-full p-1 rounded"
                    defaultValue={partido.lugar}
                    onBlur={(e) => actualizarConfig(partido.id, 'lugar', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && actualizarConfig(partido.id, 'lugar', e.currentTarget.value)}
                  />
                ) : (
                  <p 
                    onClick={() => setEditando({ id: partido.id, campo: 'lugar' })}
                    className="cursor-pointer hover:bg-slate-700 rounded px-1"
                  >
                    📍 {partido.lugar} ✎
                  </p>
                )}
              </div>
              
              <button 
                onClick={() => sumarJugador(partido.id)}
                className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold mb-6 transition-all shadow-lg active:scale-95"
              >
                + ANOTARME
              </button>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lista de Jugadores:</p>
                {jugadores.filter(j => j.partido_id === partido.id.toString()).map((j) => (
                  <div key={j.id} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700 shadow-sm">
                    <span className="font-medium">{j.nombre}</span>
                    <button onClick={() => borrarJugador(j.id)} className="text-red-500 hover:text-red-300 font-bold text-xl px-2">×</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}