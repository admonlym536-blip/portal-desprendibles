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

export default function DesprendiblesPage() {
  const router = useRouter()

  const [empleado, setEmpleado] = useState<any>(null)
  const [desprendibles, setDesprendibles] = useState<Desprendible[]>([])
  const [mensaje, setMensaje] = useState('Cargando documentos...')
  const [cargando, setCargando] = useState(true)

  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async (desde?: string, hasta?: string) => {
    setCargando(true)

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      router.push('/login')
      return
    }

    const correo = userData.user.email

    const { data: emp } = await supabase
      .from('empleados')
      .select('id,nombre,documento,id_provision')
      .eq('correo', correo)
      .maybeSingle()

    if (!emp) {
      setMensaje('No se encontró el empleado.')
      setCargando(false)
      return
    }

    setEmpleado(emp)

    let query = supabase
      .from('desprendibles')
      .select('periodo,tipo_pago,fecha_subida,url_pdf')
      .eq('documento', emp.documento)
      .order('fecha_subida', { ascending: false })

    if (desde && hasta) {
      query = query
        .gte('fecha_subida', `${desde}T00:00:00`)
        .lte('fecha_subida', `${hasta}T23:59:59`)
    }

    const { data } = await query

    setDesprendibles(data || [])
    setMensaje('')
    setCargando(false)
  }

  const mostrarTodos = () => {
    setFechaDesde('')
    setFechaHasta('')
    cargarDatos()
  }

  return (
    <div
      style={{
        padding: '40px',
        background: '#F4F7FB',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            color: '#0C3B75',
            marginBottom: '10px',
          }}
        >
          📄 Mis Desprendibles
        </h1>

        <p
          style={{
            color: '#64748B',
            marginBottom: '30px',
          }}
        >
          Consulta y descarga tus desprendibles de nómina.
        </p>

        {empleado && (
          <div
            style={{
              marginBottom: '20px',
              padding: '15px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <strong>{empleado.nombre}</strong>
            <br />
            ID: {empleado.id_provision || 'N/A'}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
            marginBottom: '25px',
            alignItems: 'center',
          }}
        >
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            style={inputStyle}
          />

          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            style={inputStyle}
          />

          <button
            onClick={() => cargarDatos(fechaDesde, fechaHasta)}
            style={buscarBtn}
          >
            Buscar
          </button>

          <button
            onClick={mostrarTodos}
            style={todosBtn}
          >
            Mostrar todos
          </button>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          }}
        >
          {cargando ? (
            <div style={{ padding: '30px' }}>{mensaje}</div>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead
                style={{
                  background: '#0C3B75',
                  color: 'white',
                }}
              >
                <tr>
                  <th style={th}>Periodo</th>
                  <th style={th}>Tipo Pago</th>
                  <th style={th}>Fecha</th>
                  <th style={th}>Documento</th>
                </tr>
              </thead>

              <tbody>
                {desprendibles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: 'center',
                        padding: '30px',
                      }}
                    >
                      No se encontraron documentos.
                    </td>
                  </tr>
                ) : (
                  desprendibles.map((d, i) => (
                    <tr key={i}>
                      <td style={td}>{d.periodo}</td>
                      <td style={td}>{d.tipo_pago}</td>
                      <td style={td}>
                        {new Date(d.fecha_subida).toLocaleDateString('es-CO')}
                      </td>
                      <td style={td}>
                        <a
                          href={d.url_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#16A34A',
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          ⬇ Descargar PDF
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  padding: '10px',
  border: '1px solid #CBD5E1',
  borderRadius: '8px',
}

const buscarBtn = {
  background: '#0C3B75',
  color: 'white',
  border: 'none',
  padding: '10px 18px',
  borderRadius: '8px',
  cursor: 'pointer',
}

const todosBtn = {
  background: '#64748B',
  color: 'white',
  border: 'none',
  padding: '10px 18px',
  borderRadius: '8px',
  cursor: 'pointer',
}

const th = {
  padding: '15px',
  textAlign: 'left' as const,
}

const td = {
  padding: '15px',
  borderBottom: '1px solid #E2E8F0',
}