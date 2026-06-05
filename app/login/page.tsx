'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    const verificarSesion = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      const { data: empleado } = await supabase
        .from('empleados')
        .select('debe_cambiar_password')
        .eq('correo', data.user.email)
        .single()

      if (empleado?.debe_cambiar_password) {
        router.replace('/recuperar-clave')
      } else {
        router.replace('/empleado')
      }
    }

    verificarSesion()
  }, [router])

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setMensaje('')
    setCargando(true)

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      setMensaje('❌ Credenciales incorrectas')
      setCargando(false)
      return
    }

    const { data: empleado } = await supabase
      .from('empleados')
      .select('debe_cambiar_password')
      .eq('correo', email)
      .single()

    if (
      password === 'temporal123' ||
      empleado?.debe_cambiar_password
    ) {
      router.replace('/recuperar-clave')
      return
    }

    router.replace('/empleado')
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #0C3B75 40%, #0A2E5A 100%)',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '2.5rem',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
          boxShadow:
            '0 10px 25px rgba(0,0,0,0.2)',
        }}
      >
        <Image
          src="/Logo_Provision.jpg"
          alt="Logo"
          width={120}
          height={120}
        />

        <h2
          style={{
            color: '#0C3B75',
            marginTop: '1rem',
          }}
        >
          Portal de Empleados
        </h2>

        <form
          onSubmit={handleLogin}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '1.5rem',
          }}
        >
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button
            type="submit"
            disabled={cargando}
          >
            {cargando
              ? 'Ingresando...'
              : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop: '1rem' }}>
          <a href="/recuperar-clave">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {mensaje && (
          <p style={{ marginTop: '1rem' }}>
            {mensaje}
          </p>
        )}
      </div>
    </div>
  )
}