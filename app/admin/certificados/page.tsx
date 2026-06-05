'use client'

import { useState } from 'react'

export default function AdminUploadCertificados() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [subiendo, setSubiendo] = useState(false)

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMensaje('⚠️ Selecciona uno o más certificados PDF')
      return
    }

    setSubiendo(true)
    setMensaje('')

    try {
      const formData = new FormData()

      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch('/api/upload-certificados', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || 'Error al subir archivos'
        )
      }

      let mensajeFinal = `✅ Proceso completado correctamente

📄 Total archivos: ${result.resumen.total}
✅ Cargados: ${result.resumen.montados}
❌ No cargados: ${result.resumen.noMontados}`

      const errores =
        result.detalles?.filter(
          (d: any) => d.estado !== 'MONTADO'
        ) || []

      if (errores.length > 0) {
        mensajeFinal += '\n\n⚠️ Archivos con error:\n'

        errores.forEach((e: any) => {
          mensajeFinal += `\n• ${e.archivo}`
        })
      }

      setMensaje(mensajeFinal)
    } catch (error: any) {
      console.error(error)

      setMensaje(
        `❌ Error al subir certificados

${error?.message || 'Error desconocido'}`
      )
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '40px auto',
        background: '#ffffff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1
        style={{
          marginBottom: '10px',
        }}
      >
        📑 Carga Masiva de Certificados
      </h1>

      <p
        style={{
          color: '#555',
          marginBottom: '20px',
        }}
      >
        Cargue uno o varios certificados PDF.
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
          1007120317_CERTIFICADO_LABORAL_20260605.pdf
        </code>
      </div>

      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={(e) => setFiles(e.target.files)}
        style={{
          marginBottom: '20px',
        }}
      />

      <div>
        <button
          onClick={handleUpload}
          disabled={subiendo}
          style={{
            background: subiendo ? '#999' : '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: subiendo ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {subiendo
            ? '⏳ Subiendo certificados...'
            : '📤 Subir Certificados'}
        </button>
      </div>

      {mensaje && (
        <div
          style={{
            marginTop: '25px',
            background: '#ecfdf5',
            border: '1px solid #86efac',
            color: '#166534',
            padding: '20px',
            borderRadius: '10px',
            lineHeight: '1.8',
            fontSize: '15px',
          }}
        >
          {mensaje.split('\n').map((linea, index) => (
            <div key={index}>{linea}</div>
          ))}
        </div>
      )}
    </div>
  )
}