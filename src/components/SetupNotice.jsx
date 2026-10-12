import BrandLogo from './BrandLogo';

export default function SetupNotice() {
  return (
    <div className="grid min-h-screen place-items-center bg-haus-azul p-6 text-haus-blanco">
      <div className="w-full max-w-xl space-y-5 rounded-3xl rounded-bl-none bg-haus-blanco p-8 text-haus-azul">
        <BrandLogo variant="azul" height={40} />
        <h1 className="text-2xl font-bold">Falta conectar Supabase</h1>
        <p>Crea el archivo <code className="rounded bg-haus-apoyo px-1.5 py-0.5">.env</code> en la raíz del proyecto con tus credenciales y reinicia el servidor:</p>
        <pre className="overflow-x-auto rounded-xl bg-haus-azul p-4 text-sm text-haus-arena">{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key`}</pre>
        <p className="text-sm text-haus-azul/70">También debes ejecutar <code>supabase/schema.sql</code> en el SQL Editor de tu proyecto.</p>
      </div>
    </div>
  );
}
