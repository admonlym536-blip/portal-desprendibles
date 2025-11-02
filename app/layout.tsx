export const metadata = {
  title: "Portal Desprendibles",
  description: "Conexión con Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

