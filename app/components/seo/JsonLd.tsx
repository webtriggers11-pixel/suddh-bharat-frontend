/**
 * Reusable JSON-LD structured-data script. Pass a schema.org object (or array).
 * Rendered in a Server Component so it ships in the initial HTML for crawlers.
 *
 * `JSON.stringify` alone is NOT safe here — Next's own JSON-LD guide says so.
 * Product descriptions, materials and tags come from the admin dashboard, so a
 * value containing `</script>` would close this tag early and inject markup
 * into the page. Escaping `<` to its unicode equivalent keeps the JSON valid
 * and makes that impossible. One helper, so no call site can forget.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
