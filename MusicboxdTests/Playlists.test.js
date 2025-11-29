import listService from "../services/listService";

describe("User Album Lists", () => {
  test("TC047 - Add valid album to list", async () => {
    const result = await listService.addAlbumToList("user123", "Favorites", "The Dark Side of the Moon");
    expect(result.success).toBe(true);
  });

  test("TC048 - Add duplicate album to same list", async () => {
    await listService.addAlbumToList("user123", "Favorites", "The Wall");
    await expect(listService.addAlbumToList("user123", "Favorites", "The Wall"))
      .rejects.toThrow("Album already exists.");
  });

  test("TC049 - Add same album to different lists", async () => {
    const list1 = await listService.addAlbumToList("user123", "Favorites", "OK Computer");
    const list2 = await listService.addAlbumToList("user123", "Workout", "OK Computer");
    expect(list1.success && list2.success).toBe(true);
  });

  test("TC050 - Add album with invalid/empty name", async () => {
    await expect(listService.addAlbumToList("user123", "Favorites", ""))
      .rejects.toThrow("Please enter a valid album name.");
  });

  test("TC051 - Add album when DB connection lost", async () => {
    listService.simulateConnectionLoss();
    await expect(listService.addAlbumToList("user123", "Favorites", "Abbey Road"))
      .rejects.toThrow("Unable to add album.");
  });

  test("TC052 - Search for album by full name", async () => {
    const album = await listService.searchAlbum("Rumours");
    expect(album.title).toBe("Rumours");
  });

  test("TC053 - Search for album by partial name", async () => {
    const results = await listService.searchAlbumPartial("Rum");
    expect(results.length).toBeGreaterThan(0);
  });

  test("TC054 - Search for non-existent album", async () => {
    const results = await listService.searchAlbumPartial("FakeAlbumXYZ");
    expect(results.length).toBe(0);
  });

  test("TC055 - Search input validation", () => {
    const safe = listService.isInputSanitized("'; DROP TABLE albums; --");
    expect(safe).toBe(true);
  });

  test("TC056 - Search performance test", async () => {
    const start = Date.now();
    await listService.searchAlbumPartial("Love");
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  test("TC057 - View user’s album lists", async () => {
    const lists = await listService.getUserLists("user123");
    expect(lists.length).toBeGreaterThan(0);
  });

  test("TC058 - Remove album from list", async () => {
    const result = await listService.removeAlbumFromList("user123", "Favorites", "Thriller");
    expect(result.success).toBe(true);
  });

  test("TC059 - Edit list name", async () => {
    const result = await listService.renameList("user123", "OldName", "NewName");
    expect(result.success).toBe(true);
  });

  test("TC060 - Delete entire list", async () => {
    const result = await listService.deleteList("user123", "Chill Vibes");
    expect(result.success).toBe(true);
  });

  test("TC061 - Access another user’s list", async () => {
    await expect(listService.viewList("otherUser", "Favorites"))
      .rejects.toThrow("Access denied.");
  });

  test("TC062 - Album-list relationship stored correctly", async () => {
    await listService.addAlbumToList("user123", "Favorites", "1989");
    const entry = await listService.getAlbumListEntry("user123", "Favorites", "1989");
    expect(entry.userId).toBe("user123");
    expect(entry.listName).toBe("Favorites");
    expect(entry.albumTitle).toBe("1989");
  });

  test("TC063 - Update reflected immediately", async () => {
    await listService.addAlbumToList("user123", "Favorites", "Evermore");
    const albums = await listService.getAlbumsInList("user123", "Favorites");
    expect(albums.includes("Evermore")).toBe(true);
  });

  test("TC064 - Handle large lists efficiently", async () => {
    await listService.populateListWithAlbums("user123", "MegaList", 120);
    const start = Date.now();
    const albums = await listService.getAlbumsInList("user123", "MegaList");
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000);
    expect(albums.length).toBe(120);
  });
});
