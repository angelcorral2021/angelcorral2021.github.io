import type { APIRoute } from "astro";
export const post: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const name = String(form.get("name") || "");
  const email = String(form.get("email") || "");
  const message = String(form.get("message") || "");
  if (!name || !email || !message)
    return new Response(
      JSON.stringify({ ok: false, error: "Campos requeridos" }),
      { status: 400 },
    );
  // Integrar SMTP/servicio externo aquí. Retornar OK por ahora.
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
