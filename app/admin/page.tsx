'use client'

import { useState } from 'react'

export default function AdminUploadMultiple() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [subiendo, setSubiendo] = useState(false)

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMensaje(
        '⚠️ Por favor selecciona uno o más archivos PDF.'
      )
      return
    }

    setSubiendo(true)
    setMensaje('📤 Iniciando carga...\n')

    let resumen = ''
    let montados = 0
    let noMontados = 0

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData()
      formData.append('files', files[i])

      try {
        const res = await fetch('/api/upload-multiple', {
          method: 'POST',
          body: formData,
        })

        const result = await res.json()

        if (
          result.detalles &&
          result.detalles.length > 0
        ) {
          const detalle = result.detalles[0]

          if (detalle.estado === 'MONTADO') {
            montados++
            resumen += `✅ ${files[i].name} → MONTADO\n`
          } else {
            noMontados++
            resumen += `❌ ${files[i].name} → ${detalle.mensaje}\n`
          }
        } else {
          noMontados++
          resumen += `❌ ${files[i].name} → Error inesperado\n`
        }
      } catch (error) {
        noMontados++
        resumen += `❌ ${files[i].name} → Error de conexión\n`
      }

      setMensaje(
        `📤 Procesando ${i + 1} de ${files.length}\n\n${resumen}`
      )
    }

    setMensaje(
      `✅ CARGA FINALIZADA\n\n` +
        `Total archivos: ${files.length}\n` +
        `Montados: ${montados}\n` +
        `No montados: ${noMontados}\n\n` +
        resumen
    )

    setSubiendo(false)
  }

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '40px auto',
        background: '#ffffff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow:
          '0 2px 12px rgba(0,0,0,0.08)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1
        style={{
          marginBottom: '10px',
        }}
      >
        📄 Carga Masiva de Desprendibles
      </h1>

      <p
        style={{
          color: '#555',
          marginBottom: '20px',
        }}
      >
        Cargue uno o varios desprendibles PDF.
      </p>

      <div
        style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <strong>Formato requerido:</strong>

        <br />
        <br />

        <code>
          10000001_Enero2025.pdf
        </code>
      </div>

      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={(e) =>
          setFiles(e.target.files)
        }
        style={{
          marginBottom: '20px',
        }}
      />

      <div>
        <button
          onClick={handleUpload}
          disabled={subiendo}
          style={{
            background: subiendo
              ? '#999'
              : '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: subiendo
              ? 'not-allowed'
              : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {subiendo
            ? '⏳ Subiendo desprendibles...'
            : '📤 Subir Desprendibles'}
        </button>
      </div>

      {mensaje && (
        <pre
          style={{
            marginTop: '25px',
            background: '#f8f8f8',
            padding: '15px',
            borderRadius: '8px',
            whiteSpace: 'pre-wrap',
            overflowX: 'auto',
            border: '1px solid #ddd',
          }}
        >
          {mensaje}
        </pre>
      )}
    </div>
  )
}