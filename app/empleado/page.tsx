'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Desprendible = {
  periodo: string
  url_pdf: string
  tipo_pago: string
  fecha_subida: string
}

export default function EmpleadoDesprendibles() {
  const router = useRouter()
  const [empleado, setEmpleado] = useState<any>(null)
  const [desprendibles, setDesprendibles] = useState<Desprendible[]>([])
  const [mensaje, setMensaje] = useState('Cargando desprendibles...')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true)

      // 1️⃣ Obtener usuario autenticado
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        router.push('/login')
        return
      }

      const correo = userData.user.email

      // 2️⃣ Buscar empleado por correo, incluyendo id_provision
      const { data: emp, error: empError } = await supabase
        .from('empleados')
        .select('id, nombre, documento, id_provision')
        .eq('correo', correo)
        .maybeSingle()

      if (empError || !emp) {
        setMensaje('⚠️ No se encontró un empleado asociado a este usuario.')
        setCargando(false)
        return
      }

      setEmpleado(emp)

      // 3️⃣ Buscar desprendibles del empleado
      const { data: desp, error: despError } = await supabase
        .from('desprendibles')
        .select('periodo, tipo_pago, fecha_subida, url_pdf')
        .eq('documento', emp.documento)
        .order('fecha_subida', { ascending: false })

      if (despError) {
        setMensaje('❌ Error al cargar desprendibles.')
      } else if (!desp || desp.length === 0) {
        setMensaje('⚠️ No tienes desprendibles registrados.')
      } else {
        setDesprendibles(desp)
        setMensaje('')
      }

      setCargando(false)
    }

    cargarDatos()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Encabezado */}
      <header
        style={{
          backgroundColor: '#0C3B75',
          color: 'white',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Portal del Empleado</h2>
          {empleado && (
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              {empleado.nombre} — {empleado.id_provision || 'Sin ID'}
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: '#ef4444',
            border: 'none',
            padding: '0.5rem 1rem',
            color: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Cerrar sesión
        </button>
      </header>

      <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        {cargando ? (
          <p>{mensaje}</p>
        ) : mensaje ? (
          <p>{mensaje}</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <thead style={{ backgroundColor: '#0C3B75', color: 'white' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px' }}>Periodo</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Tipo de Pago</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Fecha de Subida</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Descargar</th>
              </tr>
            </thead>
            <tbody>
              {desprendibles.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px' }}>{d.periodo}</td>
                  <td style={{ padding: '10px' }}>{d.tipo_pago}</td>
                  <td style={{ padding: '10px' }}>
                    {new Date(d.fecha_subida).toLocaleDateString('es-CO')}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <a
                      href={d.url_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#22c55e',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                      }}
                    >
                      📄 Descargar
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}
