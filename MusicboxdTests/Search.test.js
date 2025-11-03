// SEARCH TESTS
import searchService from "../services/searchService";

describe("User Search", () => {
  test("TC018 - Search with valid username", async () => {
    const profile = await searchService.searchByUsername("musicFan123");
    expect(profile.username).toBe("musicFan123");
  });

  test("TC019 - Search with partial username", async () => {
    const results = await searchService.searchByPartialUsername("music");
    expect(results.length).toBeGreaterThan(0);
  });

  test("TC020 - Search for non-existent user", async () => {
    const results = await searchService.searchByUsername("ghostUser999");
    expect(results.length).toBe(0);
  });

  test("TC021 - Search with empty input", async () => {
    await expect(searchService.searchByUsername(""))
      .rejects.toThrow("Please enter a username.");
  });

  test("TC022 - Search with whitespace-only input", async () => {
    await expect(searchService.searchByUsername("   "))
      .rejects.toThrow("Please enter valid text.");
  });

  test("TC023 - Retrieve user data from database", async () => {
    const profile = await searchService.searchByUsername("musicFan123");
    expect(profile.genres).toBeDefined();
  });

  test("TC024 - Handle database connection failure", async () => {
    searchService.simulateConnectionLoss();
    await expect(searchService.searchByUsername("anyUser"))
      .rejects.toThrow("Unable to retrieve data.");
  });

  test("TC025 - Performance of search query", async () => {
    const start = Date.now();
    await searchService.searchByPartialUsername("music");
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  test("TC026 - Display limited user information", async () => {
    const profile = await searchService.searchByUsername("musicFan123");
    expect(profile.email).toBeUndefined();
    expect(profile.publicBio).toBeDefined();
  });

  test("TC027 - Search case sensitivity", async () => {
    const lower = await searchService.searchByUsername("musicfan123");
    const upper = await searchService.searchByUsername("MUSICFAN123");
    expect(lower.username).toBe(upper.username);
  });

  test("TC028 - Search by additional criteria", async () => {
    const results = await searchService.searchWithFilters("rock", "Chicago");
    expect(results.every(p => p.genres.includes("rock") && p.location === "Chicago")).toBe(true);
  });

  test("TC029 - Search injection and validation", () => {
    const safe = searchService.isInputSanitized("' OR '1'='1");
    expect(safe).toBe(true);
  });
});
