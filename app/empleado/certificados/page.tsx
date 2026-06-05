'use client'

export default function CertificadosPage() {
  return (
    <div
      style={{
        padding: '20px',
      }}
    >
      <h1
        style={{
          color: '#0C3B75',
          marginBottom: '10px',
        }}
      >
        📑 Certificados
      </h1>

      <p
        style={{
          color: '#64748B',
          marginBottom: '30px',
        }}
      >
        Desde aquí podrás generar tus certificados laborales.
      </p>

      <div
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        }}
      >
        <h3>📄 Certificado Laboral</h3>

        <p>
          Genera tu certificado laboral actualizado.
        </p>

        <button
          style={{
            background: '#0C3B75',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Generar Certificado
        </button>
      </div>
    </div>
  )
}