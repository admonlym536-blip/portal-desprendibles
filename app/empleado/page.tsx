'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Vista = 'inicio' | 'desprendibles' | 'certificados' | 'servicios'

type Desprendible = {
  periodo: string
  url_pdf: string
  tipo_pago: string
  fecha_subida: string
}

type Certificado = {
  id: number
  empleado_id: number
  id_provision: string
  documento: string
  nombre_empleado: string
  tipo_certificado: string
  url_pdf: string
  fecha_subida: string
}

export default function DashboardEmpleado() {
  const router = useRouter()
  const [vista, setVista] = useState<Vista>('inicio')
  const [authLoaded, setAuthLoaded] = useState(false)

  const [autoLogoutMsg, setAutoLogoutMsg] = useState<string | null>(null)

  useEffect(() => {
    const cargarAuth = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        router.replace('/login')
        return
      }
      setAuthLoaded(true)
    }

    cargarAuth()
  }, [router])

  // Auto-cierre: 60s desde la carga y/o 60s de inactividad (cualquier interacción reinicia)
  useEffect(() => {
    if (!authLoaded) return

    const LOGOUT_MS = 60 * 1000
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let lastActivity = Date.now()
    let didLogout = false

    const touch = () => {
      lastActivity = Date.now()
      if (didLogout) return
      if (timeoutId) clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        if (didLogout) return
        // (Defensivo) asegura que realmente han pasado los ms
        if (Date.now() - lastActivity < LOGOUT_MS) return

        didLogout = true
        setAutoLogoutMsg('Sesión expirada por inactividad. Cerrando sesión...')

        supabase.auth.signOut().finally(() => {
          router.replace('/login')
        })
      }, LOGOUT_MS)
    }

    // Desde que entra también cuenta como “tiempo abierto”
    touch()

    const onUserActivity = () => touch()
    window.addEventListener('click', onUserActivity)
    window.addEventListener('keydown', onUserActivity)
    window.addEventListener('mousemove', onUserActivity)
    window.addEventListener('scroll', onUserActivity)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      window.removeEventListener('click', onUserActivity)
      window.removeEventListener('keydown', onUserActivity)
      window.removeEventListener('mousemove', onUserActivity)
      window.removeEventListener('scroll', onUserActivity)
    }
  }, [authLoaded, router])

  if (!authLoaded) return null

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#F4F7FB',
        overflowX: 'hidden',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          background: '#0C3B75',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          padding: 20,
          boxShadow: '4px 0 12px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Image
            src="/Logo_Provision.jpg"
            alt="Logo Provisión"
            width={120}
            height={120}
            style={{ objectFit: 'contain' }}
          />
        </div>

        <button
          type="button"
          onClick={() => setVista('inicio')}
          style={{
            ...menuItem,
            background:
              vista === 'inicio' ? 'rgba(255,255,255,0.14)' : 'transparent',
            border:
              vista === 'inicio'
                ? '1px solid rgba(255,255,255,0.25)'
                : '1px solid transparent',
            transform: vista === 'inicio' ? 'translateY(-1px)' : undefined,
          }}
        >
          🏠 Inicio
        </button>

        <button
          type="button"
          onClick={() => setVista('desprendibles')}
          style={{
            ...menuItem,
            background:
              vista === 'desprendibles'
                ? 'rgba(255,255,255,0.14)'
                : 'transparent',
            border:
              vista === 'desprendibles'
                ? '1px solid rgba(255,255,255,0.25)'
                : '1px solid transparent',
            transform:
              vista === 'desprendibles' ? 'translateY(-1px)' : undefined,
          }}
        >
          📄 Desprendibles
        </button>

        <button
          type="button"
          onClick={() => setVista('certificados')}
          style={{
            ...menuItem,
            background:
              vista === 'certificados'
                ? 'rgba(255,255,255,0.14)'
                : 'transparent',
            border:
              vista === 'certificados'
                ? '1px solid rgba(255,255,255,0.25)'
                : '1px solid transparent',
            transform:
              vista === 'certificados' ? 'translateY(-1px)' : undefined,
          }}
        >
          📑 Certificados
        </button>

        <button
          type="button"
          onClick={() => setVista('servicios')}
          style={{
            ...menuItem,
            background:
              vista === 'servicios'
                ? 'rgba(255,255,255,0.14)'
                : 'transparent',
            border:
              vista === 'servicios'
                ? '1px solid rgba(255,255,255,0.25)'
                : '1px solid transparent',
            transform: vista === 'servicios' ? 'translateY(-1px)' : undefined,
          }}
        >
          ⚙️ Más Servicios
        </button>

        <button
          type="button"
          onClick={cerrarSesion}
          style={{
            marginTop: 'auto',
            background: '#DC2626',
            border: 'none',
            color: 'white',
            padding: '12px 14px',
            borderRadius: 12,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          🚪 Cerrar sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main
        style={{
          flex: 1,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: '#0F172A',
          overflowX: 'hidden',
          minWidth: 0,
        }}
      >
        {autoLogoutMsg && (
          <div
            style={{
              width: '100%',
              maxWidth: 1080,
              marginBottom: 16,
              padding: 12,
              borderRadius: 12,
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              textAlign: 'center',
              fontWeight: 700,
            }}
          >
            {autoLogoutMsg}
          </div>
        )}

        {/* Bienvenida SOLO en Inicio */}
        {vista === 'inicio' && (
          <div style={{ width: '100%', maxWidth: 1080, marginBottom: 16 }}>
            <div style={{ width: '100%', textAlign: 'center', marginBottom: 24 }}>
              <h1
                style={{
                  color: '#0C3B75',
                  marginBottom: 10,
                  fontSize: 32,
                  lineHeight: 1.2,
                }}
              >
                Bienvenido al Portal del Empleado
              </h1>

              <p
                style={{
                  color: '#64748B',
                  fontSize: 16,
                  maxWidth: 700,
                  margin: '0 auto',
                }}
              >
                Desde aquí podrás consultar tus desprendibles, certificados y futuros
                servicios que Provisión L&amp;M pondrá a tu disposición.
              </p>
            </div>

            {/* Imagen principal (casi todo el cuadro) */}
            <div
              style={{
                background: 'white',
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
                width: '100%',
                height: 520,
              }}
            >
              <img
                src="/inicio.png"
                alt="Portal del Empleado"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          </div>
        )}

        {/* Vistas distintas de Inicio */}
        {vista !== 'inicio' && (
          <div
            style={{
              width: '100%',
              maxWidth: 1080,
              display: 'flex',
              justifyContent: 'center',
              overflowX: 'hidden',
            }}
          >
            {vista === 'desprendibles' && <DesprendiblesEmbedded />}
            {vista === 'certificados' && <CertificadosEmbedded />}
            {vista === 'servicios' && <ServiciosEmbedded />}
          </div>
        )}
      </main>
    </div>
  )
}

function DesprendiblesEmbedded() {
  const router = useRouter()

  const [empleado, setEmpleado] = useState<any>(null)
  const [desprendibles, setDesprendibles] = useState<Desprendible[]>([])
  const [mensaje, setMensaje] = useState('Cargando documentos...')
  const [cargando, setCargando] = useState(true)

  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  useEffect(() => {
    cargarDatos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    setDesprendibles((data as Desprendible[]) || [])
    setMensaje('')
    setCargando(false)
  }

  const mostrarTodos = () => {
    setFechaDesde('')
    setFechaHasta('')
    cargarDatos()
  }

  const inputWrapperStyle = useMemo(
    () => ({
      padding: '10px',
      border: '1px solid #CBD5E1',
      borderRadius: '10px',
      background: 'white',
    }),
    []
  )

  const buscarBtnStyle = useMemo(
    () => ({
      background: '#0C3B75',
      color: 'white',
      border: 'none',
      padding: '10px 18px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
    }),
    []
  )

  const todosBtnStyle = useMemo(
    () => ({
      background: '#64748B',
      color: 'white',
      border: 'none',
      padding: '10px 18px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
    }),
    []
  )

  const th = useMemo(
    () => ({
      padding: '14px',
      textAlign: 'left' as const,
      fontWeight: 700,
      color: 'white',
      whiteSpace: 'nowrap' as const,
    }),
    []
  )

  const td = useMemo(
    () => ({
      padding: '14px',
      borderBottom: '1px solid #E2E8F0',
      whiteSpace: 'nowrap' as const,
      maxWidth: 220,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    []
  )

  return (
    <div style={{ width: '100%', padding: 0 }}>
      <div style={{ overflowX: 'auto', borderRadius: 16 }}>
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <h2 style={{ color: '#0C3B75', margin: 0 }}>📄 Mis Desprendibles</h2>
          <p style={{ color: '#64748B', margin: 0 }}>
            Consulta y descarga tus desprendibles de nómina.
          </p>
        </div>

        {empleado && (
          <div
            style={{
              marginBottom: 16,
              padding: '14px 16px',
              background: 'white',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <strong>{empleado.nombre}</strong>
            <div style={{ color: '#64748B', marginTop: 4 }}>
              ID: {empleado.id_provision || 'N/A'}
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            style={inputWrapperStyle}
          />

          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            style={inputWrapperStyle}
          />

          <button
            onClick={() => cargarDatos(fechaDesde, fechaHasta)}
            style={buscarBtnStyle}
          >
            Buscar
          </button>

          <button onClick={mostrarTodos} style={todosBtnStyle}>
            Mostrar todos
          </button>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          }}
        >
          {cargando ? (
            <div style={{ padding: '24px', color: '#64748B' }}>{mensaje}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#0C3B75' }}>
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
                    <td colSpan={4} style={{ textAlign: 'center', padding: 28 }}>
                      No se encontraron documentos.
                    </td>
                  </tr>
                ) : (
                  desprendibles.map((d, i) => (
                    <tr key={i}>
                      <td style={td}>{d.periodo}</td>
                      <td style={td}>{d.tipo_pago}</td>
                      <td style={td}>
                        {new Date(d.fecha_subida).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          timeZone: 'UTC',
                        })}
                      </td>
                      <td style={td}>
                        <a
                          href={d.url_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#16A34A',
                            fontWeight: 700,
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

function CertificadosEmbedded() {
  const router = useRouter()

  const [empleado, setEmpleado] = useState<any>(null)
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [mensaje, setMensaje] = useState('Cargando documentos...')
  const [cargando, setCargando] = useState(true)

  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  useEffect(() => {
    cargarDatos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarDatos = async (desde?: string, hasta?: string) => {
    setCargando(true)

    const { data: userData } = await supabase.auth.getUser()

    console.log('Usuario Auth:', userData)
    const correo = userData?.user?.email
    console.log('Correo:', correo)

    if (!userData?.user) {
      router.push('/login')
      return
    }

    const { data: emp, error: empError } = await supabase
      .from('empleados')
      .select('id,nombre,documento,id_provision')
      .eq('correo', correo)
      .maybeSingle()

    if (empError) {
      console.log('Error consultando empleado:', empError)
      setMensaje(`Error consultando empleado: ${empError.message}`)
      setCertificados([])
      setCargando(false)
      return
    }

    console.log('Empleado:', emp)

    if (!emp) {
      setMensaje('No se encontró el empleado.')
      setCertificados([])
      setCargando(false)
      return
    }

    setEmpleado(emp)

    const empDocumento = String(emp.documento).trim()
    console.log(
      'Documento empleado:',
      empDocumento,
      'JSON:',
      JSON.stringify(empDocumento)
    )

    const { data, error: certError } = await supabase
      .from('certificados')
      .select(
        'id,empleado_id,id_provision,documento,nombre_empleado,tipo_certificado,url_pdf,fecha_subida'
      )
      .eq('documento', empDocumento)
      .order('fecha_subida', { ascending: false })

    console.log('Certificados encontrados (filtrados):', data)
    console.log('Error certificados (filtrados):', certError)

    if (certError) {
      setMensaje(`Error consultando certificados: ${certError.message}`)
      setCertificados([])
      setCargando(false)
      return
    }

    const filas = (data as Certificado[]) || []
    setCertificados(filas)

    // Mensaje se deja en blanco si hay datos
    setMensaje('')
    setCargando(false)
  }

  const mostrarTodos = () => {
    setFechaDesde('')
    setFechaHasta('')
    cargarDatos()
  }

  const inputWrapperStyle = useMemo(
    () => ({
      padding: '10px',
      border: '1px solid #CBD5E1',
      borderRadius: '10px',
      background: 'white',
    }),
    []
  )

  const buscarBtnStyle = useMemo(
    () => ({
      background: '#0C3B75',
      color: 'white',
      border: 'none',
      padding: '10px 18px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
    }),
    []
  )

  const todosBtnStyle = useMemo(
    () => ({
      background: '#64748B',
      color: 'white',
      border: 'none',
      padding: '10px 18px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
    }),
    []
  )

  const th = useMemo(
    () => ({
      padding: '14px',
      textAlign: 'left' as const,
      fontWeight: 700,
      color: 'white',
      whiteSpace: 'nowrap' as const,
    }),
    []
  )

  const td = useMemo(
    () => ({
      padding: '14px',
      borderBottom: '1px solid #E2E8F0',
      whiteSpace: 'nowrap' as const,
      maxWidth: 220,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    []
  )

  return (
    <div style={{ width: '100%', padding: 0 }}>
      <div style={{ overflowX: 'auto', borderRadius: 16 }}>
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <h2 style={{ color: '#0C3B75', margin: 0 }}>📑 Mis Certificados</h2>
          <p style={{ color: '#64748B', margin: 0 }}>
            Consulta tus certificados laborales disponibles.
          </p>
        </div>

        {empleado && (
          <div
            style={{
              marginBottom: 16,
              padding: '14px 16px',
              background: 'white',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <strong>{empleado.nombre}</strong>
            <div style={{ color: '#64748B', marginTop: 4 }}>
              ID: {empleado.id_provision || 'N/A'}
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            style={inputWrapperStyle}
          />

          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            style={inputWrapperStyle}
          />

          <button
            onClick={() => cargarDatos(fechaDesde, fechaHasta)}
            style={buscarBtnStyle}
          >
            Buscar
          </button>

          <button onClick={mostrarTodos} style={todosBtnStyle}>
            Mostrar todos
          </button>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          }}
        >
          {cargando ? (
            <div style={{ padding: '24px', color: '#64748B' }}>{mensaje}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#0C3B75' }}>
                <tr>
                  <th style={th}>Documento</th>
                  <th style={th}>Tipo</th>
                  <th style={th}>Fecha</th>
                  <th style={th}>Certificado</th>
                </tr>
              </thead>

              <tbody>
                {certificados.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 28 }}>
                      No se encontraron documentos.
                    </td>
                  </tr>
                ) : (
                  certificados.map((c) => (
                    <tr key={c.id}>
                      <td style={td}>{c.documento}</td>
                      <td style={td}>{c.tipo_certificado}</td>
                      <td style={td}>
                        {new Date(c.fecha_subida).toLocaleDateString('es-CO')}
                      </td>
                      <td style={td}>
                        <a
                          href={c.url_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#16A34A',
                            fontWeight: 700,
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

function ServiciosEmbedded() {
  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ color: '#0C3B75', margin: 0 }}>⚙️ Más Servicios</h2>
      <p style={{ color: '#64748B', marginTop: 8 }}>
        Próximamente tendremos más servicios disponibles para nuestros empleados.
      </p>
    </div>
  )
}

const menuItem: React.CSSProperties = {
  color: 'white',
  padding: '12px 12px',
  borderRadius: 12,
  marginBottom: 10,
  fontSize: 15,
  border: '1px solid transparent',
  cursor: 'pointer',
  background: 'transparent',
  textAlign: 'left',
  fontWeight: 700,
}
