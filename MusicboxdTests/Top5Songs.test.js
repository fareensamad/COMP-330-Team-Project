import profileService from "../services/profileService";

describe("Top Songs Feature", () => {
  test("TC075 - Add one song to profile", async () => {
    const entry = { songName: "Bohemian Rhapsody", artistName: "Queen" };
    const result = await profileService.addTopSong("user123", entry);
    expect(result.success).toBe(true);
  });

  test("TC076 - Add up to 5 songs", async () => {
    for (let i = 1; i <= 5; i++) {
      const entry = { songName: `Song ${i}`, artistName: `Artist ${i}` };
      const result = await profileService.addTopSong("user123", entry);
      expect(result.success).toBe(true);
    }
  });

  test("TC077 - Prevent adding more than 5 songs", async () => {
    for (let i = 1; i <= 5; i++) {
      await profileService.addTopSong("user123", { songName: `Song ${i}`, artistName: `Artist ${i}` });
    }
    await expect(profileService.addTopSong("user123", { songName: "Song 6", artistName: "Artist 6" }))
      .rejects.toThrow("Maximum of 5 top songs allowed.");
  });

  test("TC078 - Validation when song name is blank", async () => {
    const entry = { songName: "", artistName: "Valid Artist" };
    await expect(profileService.addTopSong("user123", entry))
      .rejects.toThrow("Song name cannot be blank.");
  });

  test("TC079 - Validation when artist name is blank", async () => {
    const entry = { songName: "Valid Song", artistName: "" };
    await expect(profileService.addTopSong("user123", entry))
      .rejects.toThrow("Artist name cannot be blank.");
  });

  test("TC080 - Edit existing song entry", async () => {
    await profileService.addTopSong("user123", { songName: "Old Song", artistName: "Old Artist" });
    const updated = { songName: "New Song", artistName: "New Artist" };
    const result = await profileService.editTopSong("user123", 0, updated);
    expect(result.success).toBe(true);
  });

  test("TC081 - Delete song from list", async () => {
    await profileService.addTopSong("user123", { songName: "To Delete", artistName: "Artist" });
    const result = await profileService.deleteTopSong("user123", 0);
    expect(result.success).toBe(true);
  });

  test("TC082 - Songs persist after refresh or relogin", async () => {
    for (let i = 1; i <= 5; i++) {
      await profileService.addTopSong("user123", { songName: `Song ${i}`, artistName: `Artist ${i}` });
    }
    await profileService.simulateRefreshAndRelogin("user123");
    const songs = await profileService.getTopSongs("user123");
    expect(songs.length).toBe(5);
  });

  test("TC083 - Special characters and numbers accepted", async () => {
    const entry = { songName: "L0v3 & W@r!", artistName: "A$AP R0cky" };
    const result = await profileService.addTopSong("user123", entry);
    expect(result.success).toBe(true);
  });

  test("TC084 - UI layout with fewer than 5 songs", async () => {
    await profileService.addTopSong("user123", { songName: "Only One", artistName: "Solo Artist" });
    const layout = await profileService.getTopSongLayout("user123");
    expect(layout.length).toBe(5);
    expect(layout[0]).toBe("Only One");
    expect(layout.slice(1).every(slot => slot === "Empty")).toBe(true);
  });

  test("TC085 - Reorder songs", async () => {
    for (let i = 1; i <= 3; i++) {
      await profileService.addTopSong("user123", { songName: `Song ${i}`, artistName: `Artist ${i}` });
    }
    const result = await profileService.reorderTopSongs("user123", 0, 2);
    expect(result.success).toBe(true);
    const songs = await profileService.getTopSongs("user123");
    expect(songs[2].songName).toBe("Song 1");
  });

  test("TC086 - Prevent duplicate song entries", async () => {
    const entry = { songName: "Repeat Song", artistName: "Repeat Artist" };
    await profileService.addTopSong("user123", entry);
    await expect(profileService.addTopSong("user123", entry))
      .rejects.toThrow("Duplicate song entries are not allowed.");
  });
});
