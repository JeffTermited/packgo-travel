import { describe, it } from "vitest";

/**
 * Manus API tests
 * NOTE: manusApi.ts has been removed as part of the architecture simplification.
 * The Manus external API integration is no longer used in this project.
 * These tests are kept as stubs for historical reference.
 */
describe.skip("Manus API (deprecated - manusApi.ts removed)", () => {
  it("should validate MANUS_API_KEY by creating a simple task", async () => {
    // This test is skipped because manusApi.ts no longer exists.
    // The Manus external API was replaced by direct LLM calls via invokeLLM().
  });
});
