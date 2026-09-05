import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonLd } from "./JsonLd";

const scriptOf = (data: object) => {
  const { container } = render(<JsonLd data={data} />);
  return container.querySelector("script")!;
};

describe("JsonLd", () => {
  it("renders a JSON-LD script whose content parses back", () => {
    const data = { "@type": "Product", name: "Atta" };
    const script = scriptOf(data);
    expect(script.getAttribute("type")).toBe("application/ld+json");
    expect(JSON.parse(script.innerHTML)).toEqual(data);
  });

  /**
   * The reason the escape exists. Product descriptions come from the admin
   * dashboard; a value containing `</script>` would close this tag early and
   * inject whatever followed into the page. `JSON.stringify` alone does not
   * prevent that — Next's own JSON-LD guide says so explicitly.
   */
  it("neutralises a payload that tries to close the script tag", () => {
    const script = scriptOf({
      description: "</script><img src=x onerror=alert(1)>",
    });
    expect(script.innerHTML).not.toContain("</script>");
    expect(script.innerHTML).not.toContain("<img");
    expect(script.innerHTML).toContain("\\u003c");
    // Still valid JSON carrying the original text.
    expect(JSON.parse(script.innerHTML).description).toBe(
      "</script><img src=x onerror=alert(1)>",
    );
  });

  it("escapes every < it finds, not just the first", () => {
    const script = scriptOf({ a: "<one>", b: "<two>" });
    expect(script.innerHTML.match(/\\u003c/g)).toHaveLength(2);
    expect(script.innerHTML).not.toContain("<");
  });
});
