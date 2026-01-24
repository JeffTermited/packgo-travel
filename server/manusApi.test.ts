import { describe, it, expect } from "vitest";
import { createManusTask, getManusTask } from "./manusApi";

describe("Manus API", () => {
  it("should validate MANUS_API_KEY by creating a simple task", async () => {
    // Skip test if API key is not configured
    if (!process.env.MANUS_API_KEY) {
      console.log("MANUS_API_KEY not configured, skipping test");
      return;
    }

    // Create a simple task to validate the API key
    const response = await createManusTask({
      prompt: "Say hello in one word",
      agentProfile: "manus-1.6-lite", // Use lite model for faster response
      taskMode: "chat", // Use chat mode for simple response
      hideInTaskList: true,
    });

    // Verify the response has required fields
    expect(response).toBeDefined();
    expect(response.task_id).toBeDefined();
    expect(typeof response.task_id).toBe("string");
    expect(response.task_id.length).toBeGreaterThan(0);

    console.log("Manus API key validated successfully!");
    console.log("Task ID:", response.task_id);
    console.log("Task URL:", response.task_url);
  }, 30000); // 30 second timeout
});
