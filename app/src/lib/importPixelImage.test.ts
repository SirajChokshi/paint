import { describe, expect, it } from "vitest";
import { getPixelImportErrorMessage } from "./importPixelImage";

describe("getPixelImportErrorMessage", () => {
  it("bounds large Error messages before showing them to users", () => {
    const payload = "A".repeat(1024 * 1024);

    const message = getPixelImportErrorMessage(new Error(payload));

    expect(message).not.toContain(payload);
    expect(message).toMatch(/^.{1,240}$/s);
    expect(message).toContain("1048576 characters");
  });

  it("redacts data URL payloads embedded in upstream error messages", () => {
    const payload = "A".repeat(1024 * 1024);
    const dataUrl = `data:image/png;base64,${payload}`;

    const message = getPixelImportErrorMessage(
      new Error(`Unable to import image from "${dataUrl}"`)
    );

    expect(message).not.toContain("A".repeat(32));
    expect(message).toContain("data URL");
    expect(message).toContain(`${dataUrl.length} characters`);
  });

  it("bounds large non-Error values before showing them to users", () => {
    const payload = "B".repeat(1024 * 1024);

    const message = getPixelImportErrorMessage(payload);

    expect(message).not.toContain(payload);
    expect(message).toMatch(/^.{1,240}$/s);
    expect(message).toContain("1048576 characters");
  });
});
