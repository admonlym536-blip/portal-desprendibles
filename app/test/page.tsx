'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestPage() {
  const [empleados, setEmpleados] = useState<any[]>([])
  const [filteredEmpleados, setFilteredEmpleados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchEmpleados = async () => {
      // ✅ Trae todos los campos relevantes (incluye id_provision)
      const { data, error } = await supabase
        .from('empleados')
        .select('id, id_provision, documento, nombre, correo')

      if (error) {
        console.error('❌ Error al obtener empleados:', error.message)
      } else {
        setEmpleados(data || [])
        setFilteredEmpleados(data || [])
      }
      setLoading(false)
    }

    fetchEmpleados()
  }, [])

  // 🔎 Filtro en tiempo real (busca por nombre, documento o id_provision)
  useEffect(() => {
    const texto = search.toLowerCase()
    const filtrados = empleados.filter(
      (emp) =>
        emp.nombre?.toLowerCase().includes(texto) ||
        emp.documento?.toString().includes(texto) ||
        emp.id_provision?.toLowerCase().includes(texto)
    )
    setFilteredEmpleados(filtrados)
  }, [search, empleados])

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
      {/* Logo centrado */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '25px',
        }}
      >
        <img
          src="/Logo_Provision.jpg"
          alt="Logo Provisión L&M"
          style={{
            width: '160px',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: '12px',
          }}
        />
      </div>

      {/* Título */}
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '15px',
          color: '#0C3B75',
          fontWeight: 700,
        }}
      >
        Lista de empleados
      </h2>

      {/* 🔎 Buscador */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '25px',
        }}
      >
        <input
          type="text"
          placeholder="Buscar por nombre, documento o ID Provisión..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '60%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '0.95rem',
            outlineColor: '#0C3B75',
          }}
        />
      </div>

      {/* Contenido */}
      {loading ? (
        <p style={{ textAlign: 'center' }}>Cargando datos...</p>
      ) : filteredEmpleados.length === 0 ? (
        <p style={{ color: '#B58900', textAlign: 'center' }}>
          ⚠️ No se encontraron empleados con ese criterio.
        </p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '10px',
            boxShadow: '0 3px 12px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <thead>
            <tr style={{ background: '#0C3B75', color: '#FFFFFF' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>ID Provisión</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Documento</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Correo</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmpleados.map((emp, index) => (
              <tr
                key={emp.id}
                style={{
                  background: index % 2 === 0 ? '#F9FBFD' : '#FFFFFF',
                  borderBottom: '1px solid #E0E0E0',
                }}
              >
                <td style={{ padding: '12px', fontWeight: 600 }}>{index + 1}</td>
                <td style={{ padding: '12px' }}>{emp.id_provision || '—'}</td>
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
