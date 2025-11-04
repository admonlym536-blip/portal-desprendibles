'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

export default function CambiarClavePage() {
  const [claveActual, setClaveActual] = useState('')
  const [nuevaClave, setNuevaClave] = useState('')
  const [confirmarClave, setConfirmarClave] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')
    setCargando(true)

    if (!claveActual || !nuevaClave || !confirmarClave) {
      setMensaje('❌ Debes completar todos los campos.')
      setCargando(false)
      return
    }

    if (nuevaClave !== confirmarClave) {
      setMensaje('❌ Las contraseñas no coinciden.')
      setCargando(false)
      return
    }

    try {
      // Obtener sesión activa
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setMensaje('❌ No hay sesión activa.')
        setCargando(false)
        return
      }

      // Reautenticar usuario
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: claveActual,
      })
      if (loginError) {
        setMensaje('❌ La contraseña actual no es válida.')
        setCargando(false)
        return
      }

      // Cambiar contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: nuevaClave,
      })
      if (updateError) {
        setMensaje('❌ Error al actualizar la contraseña.')
        console.error(updateError.message)
        setCargando(false)
        return
      }

      // Actualizar en la tabla empleados (debe_cambiar_password = false)
      const { error: updateEmpleadoError } = await supabase
        .from('empleados')
        .update({ debe_cambiar_password: false })
        .eq('correo', user.email)

      if (updateEmpleadoError) console.error(updateEmpleadoError)

      setMensaje('✅ Contraseña actualizada correctamente. Redirigiendo...')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
    } catch (error: any) {
      setMensaje(`❌ Error inesperado: ${error.message}`)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#0C3B75]"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-5">
          <Image
            src="/Logo_Provision.jpg"
            alt="Logo Provisión L&M"
            width={120}
            height={120}
            className="rounded-lg object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-[#0C3B75] mb-2">
          Cambiar Contraseña
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Ingresa tu clave actual y define una nueva.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <input
            type="password"
            placeholder="Contraseña actual"
            value={claveActual}
            onChange={(e) => setClaveActual(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#0C3B75] focus:outline-none"
          />

          <input
            type="password"
            placeholder="Nueva contraseña"
            value={nuevaClave}
            onChange={(e) => setNuevaClave(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#0C3B75] focus:outline-none"
          />

          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirmarClave}
            onChange={(e) => setConfirmarClave(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#0C3B75] focus:outline-none"
          />

          <button
            type="submit"
            disabled={cargando}
            className={`w-full p-3 rounded-lg text-white font-semibold transition ${
              cargando
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#0C3B75] hover:bg-[#154FA2]'
            }`}
          >
            {cargando ? 'Actualizando...' : 'Guardar nueva contraseña'}
          </button>
        </form>

        {mensaje && (
          <p
            className={`mt-4 font-medium ${
              mensaje.startsWith('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {mensaje}
          </p>
        )}

        <footer className="mt-8 text-gray-500 text-xs">
          © {new Date().getFullYear()} Provisión L&M S.A.S.
        </footer>
      </div>
    </div>
  )
}
