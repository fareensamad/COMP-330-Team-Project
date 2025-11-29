import profileService from "../services/profileService";

describe("Top Albums Feature", () => {
  test("TC065 - Add one album to profile", async () => {
    const entry = { albumName: "The Suburbs", artistName: "Arcade Fire" };
    const result = await profileService.addTopAlbum("user123", entry);
    expect(result.success).toBe(true);
  });

  test("TC066 - Add up to 4 albums", async () => {
    for (let i = 1; i <= 4; i++) {
      const entry = { albumName: `Album ${i}`, artistName: `Artist ${i}` };
      const result = await profileService.addTopAlbum("user123", entry);
      expect(result.success).toBe(true);
    }
  });

  test("TC067 - Prevent adding more than 4 albums", async () => {
    for (let i = 1; i <= 4; i++) {
      await profileService.addTopAlbum("user123", { albumName: `Album ${i}`, artistName: `Artist ${i}` });
    }
    await expect(profileService.addTopAlbum("user123", { albumName: "Album 5", artistName: "Artist 5" }))
      .rejects.toThrow("Maximum of 4 top albums allowed.");
  });

  test("TC068 - Validation when album name is blank", async () => {
    const entry = { albumName: "", artistName: "Valid Artist" };
    await expect(profileService.addTopAlbum("user123", entry))
      .rejects.toThrow("Album name cannot be blank.");
  });

  test("TC069 - Validation when artist name is blank", async () => {
    const entry = { albumName: "Valid Album", artistName: "" };
    await expect(profileService.addTopAlbum("user123", entry))
      .rejects.toThrow("Artist name cannot be blank.");
  });

  test("TC070 - Edit existing album entry", async () => {
    await profileService.addTopAlbum("user123", { albumName: "Old Album", artistName: "Old Artist" });
    const updated = { albumName: "New Album", artistName: "New Artist" };
    const result = await profileService.editTopAlbum("user123", 0, updated);
    expect(result.success).toBe(true);
  });

  test("TC071 - Delete album from list", async () => {
    await profileService.addTopAlbum("user123", { albumName: "To Delete", artistName: "Artist" });
    const result = await profileService.deleteTopAlbum("user123", 0);
    expect(result.success).toBe(true);
  });

  test("TC072 - Albums persist after refresh or relogin", async () => {
    for (let i = 1; i <= 4; i++) {
      await profileService.addTopAlbum("user123", { albumName: `Album ${i}`, artistName: `Artist ${i}` });
    }
    await profileService.simulateRefreshAndRelogin("user123");
    const albums = await profileService.getTopAlbums("user123");
    expect(albums.length).toBe(4);
  });

  test("TC073 - Special characters and numbers accepted", async () => {
    const entry = { albumName: "H3ll0 W@rld!", artistName: "A$AP R0cky" };
    const result = await profileService.addTopAlbum("user123", entry);
    expect(result.success).toBe(true);
  });

  test("TC074 - UI layout with less than 4 albums", async () => {
    await profileService.addTopAlbum("user123", { albumName: "Only One", artistName: "Solo Artist" });
    const layout = await profileService.getTopAlbumLayout("user123");
    expect(layout.length).toBe(4);
    expect(layout[0]).toBe("Only One");
    expect(layout.slice(1).every(slot => slot === "Empty")).toBe(true);
  });
});
