// UX/UI portfolio entry: serves the static site in public/designer/uxui
// at the clean URL /designer/uxui (the entry file is home.html because
// .vercelignore drops every file named index.html).
export async function GET(request: Request) {
  const res = await fetch(new URL("/designer/uxui/home.html", request.url));
  return new Response(await res.text(), {
    status: res.status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
