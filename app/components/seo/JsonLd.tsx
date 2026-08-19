/**
 * Reusable JSON-LD structured-data script. Pass a schema.org object (or array).
 * Rendered in a Server Component so it ships in the initial HTML for crawlers.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Data is app-authored (not user input); safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
