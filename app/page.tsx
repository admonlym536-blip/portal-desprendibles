'use client'
import Link from 'next/link'

export default function HomePage() {
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
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '4px solid #009FE3',
          paddingBottom: '10px',
          marginBottom: '30px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/Logo_Provision.jpg"
            alt="Logo Provisión L&M"
            width={90}
            height={90}
            style={{ borderRadius: '10px' }}
          />
          <div>
            <h1 style={{ margin: 0, fontSize: '26px', color: '#0C3B75' }}>
              Portal de Desprendibles
            </h1>
            <h3 style={{ margin: 0, color: '#4BB543', fontWeight: 500 }}>
              Provisión L&M - Agencia Comercial
            </h3>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <section>
        <h2 style={{ fontSize: '22px', color: '#009FE3' }}>Bienvenido 👋</h2>
        <p style={{ fontSize: '16px', maxWidth: '600px' }}>
          Este portal te permitirá consultar información laboral como tus desprendibles de nómina,
          datos de empleado y más funcionalidades que iremos activando próximamente.
        </p>

        <div
          style={{
            marginTop: '30px',
            display: 'inline-block',
            padding: '12px 20px',
            backgroundColor: '#0C3B75',
            color: '#FFFFFF',
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'background-color 0.3s',
          }}
        >
          <Link href="/test" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: '600' }}>
            🚀 Ir a la lista de empleados
          </Link>
        </div>
      </section>

      {/* Pie de página */}
      <footer
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '40px',
          color: '#999',
          fontSize: '13px',
        }}
      >
        © {new Date().getFullYear()} Provisión L&M S.A.S — Todos los derechos reservados.
      </footer>
    </main>
  )
}
