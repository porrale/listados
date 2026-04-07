'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [jugadores, setJugadores] = useState<any[]>([])
  const [configPartidos, setConfigPartidos] = useState<any[]>([])
  const [editando, setEditando] = useState<any>({ id: null, campo: null })

  useEffect(() => {
    fetchDatos()
  }, [])

  async function fetchDatos() {
    const { data: jug } = await supabase.from('partidos').select('*')
    const { data: conf } = await supabase.from('configuracion_partidos').select('*').order('id', { ascending: true })
    setJugadores(jug || [])
    setConfigPartidos(conf || [])
  }

  async function actualizarConfig(id: any, campo: any, valor: any) {
    const { error } = await supabase
      .from('configuracion_partidos')
      .update({ [campo]: valor })
      .eq('id', id)
    
    if (!error) {
      setEditando({ id: null, campo: null })
      fetchDatos()
    }
  }

  async function sumarJugador(partidoId: any) {
    if (!nombreUsuario) return alert("Poné tu nombre primero")
    const { error } = await supabase
      .from('partidos')
      .insert([{ nombre: nombreUsuario, partido_id: partidoId.toString(), estado: 'confirmado' }])
    if (!error) { 
      setNombreUsuario('')
      fetchDatos() 
    }
  }

  async function borrarJugador(id: any) {
    await supabase.from('partidos').delete().eq('id', id)
    fetchDatos()
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">⚽ Gestión de Partidos</h1>

        {/* Input de Nombre */}
        <div className="max-w-sm mx-auto mb-12 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl">
          <input 
            type="text" 
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            className="w-full p-3 rounded bg-slate-900 border border-slate-600 outline-none focus:border-green-500 text-white"
            placeholder="Tu nombre para anotarte..."
          />
        </div>

        {/* Grilla de Partidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {configPartidos.map((partido: any) => (
            <div key={partido.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex flex-col">
              
              {/* Título (Fecha) Editable */}
              <div className="mb-2">
                {editando.id === partido.id && editando.campo === 'nombre' ? (
                  <input 
                    autoFocus
                    className="bg-slate-900 text-xl font-bold w-full p-1 rounded text-white outline-none border border-blue-500"
                    defaultValue={partido.nombre_fecha}
                    onBlur={(e) => actualizarConfig(partido.id, 'nombre_fecha', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && actualizarConfig(partido.id, 'nombre_fecha', e.currentTarget.value)}
                  />
                ) : (
                  <h2 
                    onClick={() => setEditando({ id: partido.id, campo: 'nombre' })}
                    className="text-2xl font-bold text-blue-400 cursor-pointer hover:bg-slate-700 rounded px-1 transition-colors"
                  >
                    {partido.nombre_fecha} ✎
                  </h2>
                )}
              </div>

              {/* Lugar Editable */}
              <div className="mb-6 italic text-slate-400 text-sm">
                {editando.id === partido.id && editando.campo === 'lugar' ? (
                  <input 
                    autoFocus
                    className="bg-slate-900 w-full p-1 rounded text-white outline-none border border-blue-500"
                    defaultValue={partido.lugar}
                    onBlur={(e) => actualizarConfig(partido.id, 'lugar', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && actualizarConfig(partido.id, 'lugar', e.currentTarget.value)}
                  />
                ) : (
                  <p 
                    onClick={() => setEditando({ id: partido.id, campo: 'lugar' })}
                    className="cursor-pointer hover:bg-slate-700 rounded px-1 transition-colors"
                  >
                    📍 {partido.lugar} ✎
                  </p>
                )}
              </div>
              
              <button 
                onClick={() => sumarJugador(partido.id)}
                className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold mb-6 transition-all shadow-lg active:scale-95 text-white"
              >
                + ANOTARME
              </button>

              {/* Lista de Jugadores Numerada */}
              <div className="space-y-2 flex-1">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Anotados:</p>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 font-mono">
                    Total: {jugadores.filter((j: any) => j.partido_id === partido.id.toString()).length}
                  </span>
                </div>
                
                {jugadores
                  .filter((j: any) => j.partido_id === partido.id.toString())
                  .map((j: any, index: number) => (
                    <div key={j.id} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700 shadow-sm group">
                      <div className="flex gap-3 items-center">
                        <span className="text-slate-600 font-mono text-xs">{index + 1}.</span>
                        <span className="font-medium text-slate-200">{j.nombre}</span>
                      </div>
                      <button 
                        onClick={() => borrarJugador(j.id)} 
                        className="text-red-500 hover:text-red-400 font-bold text-2xl px-2 leading-none transition-colors"
                        title="Borrar de la lista"
                      >
                        ×
                      </button>
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