import { describe, it, expect, beforeEach } from "vitest";
import { getTestDatabase } from "./scripts/global-setup";
import { getDBClient } from "../client";

let db: any; // The actual D1 database instance

beforeEach(() => {
  // Get the test database from global setup
  db = getTestDatabase();
});

describe("getDBClient", () => {
  it("should return a valid drizzle instance", async () => {
    const reference = {}; // A mock reference object

    // Call the function to get the drizzle instance
    const drizzleInstance = await getDBClient(reference, db);

    // Verify that drizzleInstance is a valid object
    expect(drizzleInstance).toBeDefined();
    expect(typeof drizzleInstance).toBe("object");
  });

  it("should reuse the same drizzle instance for the same reference", async () => {
    const reference = {}; // A mock reference object

    // Get the drizzle instance for the first time
    const drizzleInstance1 = await getDBClient(reference, db);

    // Get the drizzle instance again
    const drizzleInstance2 = await getDBClient(reference, db);

    // Verify that both instances are the same
    expect(drizzleInstance1).toBe(drizzleInstance2);
  });

  it("should create a new drizzle instance for a different reference", async () => {
    const reference1 = {}; // First reference
    const reference2 = {}; // Second reference

    // Get drizzle instances for two different references
    const drizzleInstance1 = await getDBClient(reference1, db);
    const drizzleInstance2 = await getDBClient(reference2, db);

    // Verify that the instances are different
    expect(drizzleInstance1).not.toBe(drizzleInstance2);
  });
});
