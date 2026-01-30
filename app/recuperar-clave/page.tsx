'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function RecuperarClave() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleChangePassword = async () => {
    setMensaje('')
    setCargando(true)

    if (!email || !nueva || !confirmar) {
      setMensaje('⚠️ Todos los campos son obligatorios.')
      setCargando(false)
      return
    }

    if (nueva !== confirmar) {
      setMensaje('⚠️ Las contraseñas no coinciden.')
      setCargando(false)
      return
    }

    if (nueva.length < 6) {
      setMensaje('⚠️ La nueva contraseña debe tener al menos 6 caracteres.')
      setCargando(false)
      return
    }

    try {
      const res = await fetch('/api/recuperar-clave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, nueva }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMensaje(`❌ ${data.error || 'Error al actualizar la contraseña.'}`)
        setCargando(false)
        return
      }

      setMensaje('✅ Contraseña actualizada correctamente. Redirigiendo...')
      setTimeout(() => router.replace('/login'), 2000)

    } catch (err) {
      console.error(err)
      setMensaje('❌ Error inesperado al actualizar la contraseña.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0C3B75 40%, #0A2E5A 100%)',
        fontFamily: 'Segoe UI, Roboto, sans-serif',
      }}
    >
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
        <div style={{ marginBottom: '1.5rem' }}>
          <Image
            src="/Logo_Provision.jpg"
            alt="Logo Provisión L&M"
            width={120}
            height={120}
          />
        </div>

        <h2 style={{ color: '#0C3B75' }}>Recuperar Contraseña</h2>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          style={{ width: '100%', marginBottom: '15px' }}
        />

        <button
          type="button"
          onClick={handleChangePassword}
          disabled={cargando}
          style={{
            width: '100%',
            padding: '10px',
            background: '#0C3B75',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {cargando ? 'Actualizando...' : 'Cambiar contraseña'}
        </button>

        {mensaje && <p style={{ marginTop: '10px' }}>{mensaje}</p>}
      </div>
    </div>
  )
}
