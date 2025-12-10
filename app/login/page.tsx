'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import { FileText } from 'lucide-react'

interface Desprendible {
  id: number
  periodo: string
  tipo_pago: string
  tipo_documento?: string
  created_at: string
  url_pdf: string
}

export default function PortalDesprendibles() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [desprendibles, setDesprendibles] = useState<Desprendible[]>([])
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [mostrarAviso, setMostrarAviso] = useState(true)   // ← NUEVO

  // ✅ Meta viewport para móviles
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=device-width, initial-scale=1'
    document.head.appendChild(meta)
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      router.replace('/recuperar-clave')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [router])

  useEffect(() => {
    const verificarSesion = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        setUser(null)
        return
      }

      const usuario = data.user
      setUser(usuario)

      const { data: empleado } = await supabase
        .from('empleados')
        .select('nombre, documento, id_provision, debe_cambiar_password')
        .eq('correo', usuario.email)
        .single()

      if (!empleado) {
        setMensaje('⚠️ No se encontró el usuario en empleados.')
        return
      }

      if (empleado.debe_cambiar_password) {
        router.replace('/recuperar-clave')
        return
      }

      await supabase.auth.updateUser({
        data: {
          nombre: empleado.nombre,
          documento: empleado.documento,
          id_provision: empleado.id_provision,
        },
      })

      await cargarDesprendibles(usuario)
    }

    verificarSesion()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')
    setCargando(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMensaje('❌ Credenciales incorrectas')
      setCargando(false)
      return
    }

    const { data: empleado, error: empError } = await supabase
      .from('empleados')
      .select('debe_cambiar_password')
      .eq('correo', email)
      .single()

    if (empError || !empleado) {
      setMensaje('⚠️ Usuario no encontrado en empleados')
      setCargando(false)
      return
    }

    if (password === 'temporal123' || empleado.debe_cambiar_password) {
      setMensaje('🔐 Debes cambiar tu contraseña antes de continuar...')
      setTimeout(() => router.push('/recuperar-clave'), 1500)
      return
    }

    setMensaje('✅ Iniciando sesión...')
    setTimeout(async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUser(data.user)
        await cargarDesprendibles(data.user)
        setMostrarAviso(true) // muestra aviso después de login
      }
      setCargando(false)
    }, 1000)
  }

  const cargarDesprendibles = async (usuario: any, desde?: string, hasta?: string) => {
    try {
      let documento = usuario.user_metadata?.documento
      if (!documento) {
        const { data: empleado } = await supabase
          .from('empleados')
          .select('documento')
          .eq('correo', usuario.email)
          .single()
        documento = empleado?.documento
      }

      let query = supabase
        .from('desprendibles')
        .select('*')
        .eq('documento', documento)
        .order('created_at', { ascending: false })

      if (desde && hasta) {
        query = query
          .gte('created_at', `${desde}T00:00:00`)
          .lte('created_at', `${hasta}T23:59:59`)
      }

      const { data } = await query
      setDesprendibles(data || [])
    } catch (err) {
      console.error('Error al cargar desprendibles:', err)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setEmail('')
    setPassword('')
    setMensaje('')
    setDesprendibles([])
    router.replace('/login')
  }

  // ---------------------------------------------------------------
  // LOGIN VISUAL
  // ---------------------------------------------------------------
  if (!user) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0C3B75 40%, #0A2E5A 100%)',
          color: 'white',
          fontFamily: 'Segoe UI, Roboto, sans-serif',
          padding: '1rem',
        }}
      >
        {/* --- Login content --- */}
        {/* (NO CAMBIÉ NADA AQUÍ) */}
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            width: '100%',
            maxWidth: '420px',
            padding: '2.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '120px', height: '120px', position: 'relative' }}>
              <Image src="/Logo_Provision.jpg" alt="Logo Provisión L&M" fill style={{ objectFit: 'contain', borderRadius: '10px' }} sizes="120px" />
            </div>
          </div>

          <h2 style={{ color: '#0C3B75', marginBottom: '0.5rem', fontWeight: '700' }}>Portal de Empleados</h2>
          <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Inicia sesión con tu correo</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #ccc', fontSize: '0.95rem' }} />

            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required
              style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #ccc', fontSize: '0.95rem' }} />

            <button type="submit" disabled={cargando}
              style={{
                background: cargando ? '#ccc' : '#0C3B75',
                color: 'white',
                border: 'none',
                padding: '0.9rem',
                borderRadius: '10px',
                cursor: cargando ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '1rem',
                transition: '0.3s',
              }}>
              {cargando ? 'Verificando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div style={{ marginTop: '1rem' }}>
            <a href="/recuperar-clave"
              style={{
                color: '#0C3B75',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {mensaje && (
            <p style={{ marginTop: '1rem', color: mensaje.startsWith('❌') ? 'red' : 'green', fontWeight: 500 }}>
              {mensaje}
            </p>
          )}

          <footer style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#777' }}>
            © {new Date().getFullYear()} Provisión L&M S.A.S.
          </footer>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------
  // PORTAL DEL EMPLEADO
  // ---------------------------------------------------------------
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F3F7FB 0%, #E8EEF5 100%)',
        fontFamily: 'Segoe UI, Roboto, sans-serif',
        color: '#333',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      <header
        style={{
          background: '#0C3B75',
          color: 'white',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '40px', height: '40px', position: 'relative' }}>
            <Image src="/Logo_Provision.jpg" alt="Logo Provisión L&M" fill style={{ objectFit: 'contain', borderRadius: '6px' }} sizes="40px" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, lineHeight: 1.1 }}>Portal del Empleado</h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#DDE6F2', lineHeight: 1.3 }}>
              {user.user_metadata?.nombre?.toUpperCase() || 'Empleado'}
              <br />
              ID: <strong>{user.user_metadata?.id_provision || 'N/A'}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: '#E53935',
            border: 'none',
            color: 'white',
            padding: '0.6rem 1.3rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          Cerrar sesión
        </button>
      </header>

      {/* 
      ───────────────────────────────
      🔔 POPUP CON IMAGEN (NUEVO)
      ───────────────────────────────
      */}
      {mostrarAviso && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              position: 'relative',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              width: '90%',          // En móviles ocupa el 90%
              maxWidth: '420px',     // En PC no supera este tamaño
              overflow: 'hidden',
            }}
          >
            {/* Botón X */}
            <button
              onClick={() => setMostrarAviso(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(255,255,255,0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                color: '#333',
              }}
            >
              ✕
            </button>

            {/* Imagen informativa */}
            <Image
              src="/inicio.png"
              alt="Aviso informativo"
              width={500}
              height={500}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>
      )}

      {/* 👋 Hola debajo del header */}
      <div style={{ textAlign: 'center', marginTop: '1.8rem', padding: '0 1rem' }}>
        <h3 style={{ color: '#0C3B75', fontWeight: 700, fontSize: '1.3rem' }}>
          👋 Hola, {user.user_metadata?.nombre?.split(' ')[0] || 'Empleado'}!
        </h3>
        <p style={{ color: '#444', fontSize: '1rem' }}>
          Aquí puedes descargar tus certificados o desprendibles y filtrarlos por rango de fechas.
        </p>
      </div>

      {/* TODO TU PORTAL SIGUE IGUAL */}
      {/* Filtro de fechas */}
      <div
        style={{
          marginTop: '1.2rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '0 1rem',
        }}
      >
        <label style={{ fontWeight: 600, color: '#0C3B75' }}>Desde:</label>
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '0.95rem',
          }}
        />
        <label style={{ fontWeight: 600, color: '#0C3B75' }}>Hasta:</label>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '0.95rem',
          }}
        />
        <button
          onClick={() => cargarDesprendibles(user, fechaDesde, fechaHasta)}
          style={{
            background: '#0C3B75',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Buscar
        </button>
        {(fechaDesde || fechaHasta) && (
          <button
            onClick={() => {
              setFechaDesde('')
              setFechaHasta('')
              cargarDesprendibles(user)
            }}
            style={{
              background: '#999',
              color: 'white',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Mostrar todos
          </button>
        )}
      </div>

      {/* Tabla con scroll horizontal */}
      <main
        style={{
          maxWidth: '850px',
          margin: '2rem auto 3rem auto',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          overflowX: 'auto',
          width: '95%',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.95rem',
            minWidth: '600px',
          }}
        >
          <thead style={{ background: '#0C3B75', color: 'white' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.9rem 1.2rem' }}>Tipo de Documento</th>
              <th style={{ textAlign: 'left', padding: '0.9rem 1.2rem' }}>Periodo</th>
              <th style={{ textAlign: 'left', padding: '0.9rem 1.2rem' }}>Tipo de Pago</th>
              <th style={{ textAlign: 'left', padding: '0.9rem 1.2rem' }}>Fecha</th>
              <th style={{ textAlign: 'center', padding: '0.9rem 1.2rem' }}>Descargar</th>
            </tr>
          </thead>
          <tbody>
            {desprendibles.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#777' }}>
                  No hay documentos disponibles
                </td>
              </tr>
            ) : (
              desprendibles.map((d) => {
                const partes = d.periodo.match(/(\d+)([A-Za-z]+)(\d+)/)
                return (
                  <tr
                    key={d.id}
                    style={{
                      borderBottom: '1px solid #eee',
                      transition: 'background 0.3s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#F6FAFF')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'white')}
                  >
                    <td style={{ padding: '0.9rem 1.2rem' }}>{d.tipo_documento || 'Desprendible'}</td>
                    <td style={{ padding: '0.9rem 1.2rem', lineHeight: '1.3rem' }}>
                      {partes ? (
                         <span>
                            <strong>{partes[1]} </strong>
                            {partes[2]} {partes[3]}
                            </span>
                          ) : (
                           d.periodo
                        )}
                    </td>
                    <td style={{ padding: '0.9rem 1.2rem' }}>{d.tipo_pago}</td>
                    <td style={{ padding: '0.9rem 1.2rem' }}>
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.9rem 1.2rem' }}>
                      <a
                        href={d.url_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          color: '#007B55',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        <FileText size={16} />
                        Descargar
                      </a>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </main>

      <footer
        style={{
          textAlign: 'center',
          padding: '1rem',
          color: '#777',
          fontSize: '0.8rem',
        }}
      >
        © {new Date().getFullYear()} Provisión L&M S.A.S. — Todos los derechos reservados.
      </footer>
    </div>
  )
}
