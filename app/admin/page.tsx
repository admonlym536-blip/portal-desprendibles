'use client'
import { useState } from 'react'

export default function AdminUploadMultiple() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [subiendo, setSubiendo] = useState(false)

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMensaje('⚠️ Por favor selecciona uno o más archivos PDF.')
      return
    }

    setSubiendo(true)
    setMensaje('📤 Subiendo archivos...')

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    try {
      const res = await fetch('/api/upload-multiple', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()

      // ✅ Ajuste: Mostrar resultados detallados
      if (result.resultados && Array.isArray(result.resultados)) {
  // Si el backend devuelve solo strings (no objetos)
  const resumen = result.resultados
    .map((r: any) => (typeof r === 'string' ? `• ${r}` : `• ${r.archivo || 'Archivo'}: ${r.status || r.mensaje || 'OK'}`))
    .join('\n')
  setMensaje(resumen)
      } else if (result.error) {
        setMensaje('❌ Error: ' + result.error)
      } else {
        setMensaje('❌ Ocurrió un error desconocido.')
      }
    } catch (error) {
      console.error(error)
      setMensaje('❌ Error de conexión con el servidor.')
    }

    setSubiendo(false)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 650, margin: 'auto' }}>
      <h1 style={{ color: '#0C3B75', textAlign: 'center' }}>Carga masiva de Desprendibles</h1>

      <p style={{ fontSize: '0.9rem', color: '#555' }}>
        📂 Selecciona varios archivos PDF con el formato:
        <br />
        <strong>Documento_Periodo.pdf</strong> — ejemplo: <em>10000001_Enero2025.pdf</em>
      </p>

      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        style={{ marginBottom: '1rem', width: '100%' }}
      />

      <button
        onClick={handleUpload}
        disabled={subiendo}
        style={{
          backgroundColor: subiendo ? '#ccc' : '#4BB543',
          color: 'white',
          padding: '0.8rem 1.5rem',
          border: 'none',
          borderRadius: '8px',
          cursor: subiendo ? 'not-allowed' : 'pointer',
          width: '100%',
          fontSize: '1rem',
        }}
      >
        {subiendo ? 'Subiendo...' : 'Subir Todos los Desprendibles'}
      </button>

      {mensaje && (
        <pre
          style={{
            marginTop: '1.5rem',
            background: '#f4f4f4',
            padding: '1rem',
            borderRadius: '8px',
            whiteSpace: 'pre-wrap',
            fontSize: '0.9rem',
            color: '#333',
          }}
        >
          {mensaje}
        </pre>
      )}
    </div>
  )
}
