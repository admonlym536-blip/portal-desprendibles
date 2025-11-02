'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestPage() {
  const [empleados, setEmpleados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmpleados = async () => {
      const { data, error } = await supabase.from('empleados').select('*')
      if (error) {
        console.error('Error al obtener empleados:', error)
      } else {
        setEmpleados(data || [])
      }
      setLoading(false)
    }
    fetchEmpleados()
  }, [])

  return (
    <main
      style={{
        fontFamily: 'Segoe UI, Arial, sans-serif',
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
        padding: '40px',
        color: '#0C3B75',
      }}
    >
      {/* Encabezado */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '25px',
        }}
      >
        <div
          style={{
            width: '90px',
            height: '90px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            border: '2px solid #0C3B75',
          }}
        >
          <img src="/Logo_Provision.jpg" alt="Logo Provisión L&M" width={70} height={70} />
        </div>

        <h1 style={{ fontSize: '28px', margin: 0 }}>
          ✅ Conexión exitosa con{' '}
          <span style={{ color: '#009FE3' }}>Supabase</span>
        </h1>
      </div>

      {/* Título de la tabla */}
      <h2 style={{ marginTop: '25px', color: '#4BB543' }}>Lista de empleados</h2>

      {/* Contenido */}
      {loading ? (
        <p>Cargando datos...</p>
      ) : empleados.length === 0 ? (
        <p style={{ color: '#B58900' }}>⚠️ No hay empleados registrados.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
            boxShadow: '0 3px 12px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <thead>
            <tr style={{ background: '#0C3B75', color: '#FFFFFF' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Documento</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Correo</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((emp) => (
              <tr
                key={emp.id}
                style={{
                  background: '#F9FBFD',
                  borderBottom: '1px solid #E0E0E0',
                }}
              >
                <td style={{ padding: '12px' }}>{emp.documento}</td>
                <td style={{ padding: '12px' }}>{emp.nombre}</td>
                <td style={{ padding: '12px', color: '#009FE3' }}>{emp.correo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
