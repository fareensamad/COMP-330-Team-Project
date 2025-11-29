// REVIEWS TESTS
import reviewService from "../services/reviewService";

describe("User Reviews", () => {
  test("TC030 - Add new review with valid data", async () => {
    const review = { userId: "user123", albumId: "album456", rating: 5, text: "Amazing album!" };
    const result = await reviewService.submitReview(review);
    expect(result.success).toBe(true);
  });

  test("TC031 - Add review with empty text", async () => {
    const review = { userId: "user123", albumId: "album456", rating: 4, text: "" };
    await expect(reviewService.submitReview(review))
      .rejects.toThrow("Review cannot be empty.");
  });

  test("TC032 - Add review without rating", async () => {
    const review = { userId: "user123", albumId: "album456", rating: null, text: "Great!" };
    await expect(reviewService.submitReview(review))
      .rejects.toThrow("Please provide a rating.");
  });

  test("TC033 - Add duplicate review", async () => {
    const review = { userId: "user123", albumId: "album456", rating: 5, text: "Loved it!" };
    await reviewService.submitReview(review);
    await expect(reviewService.submitReview(review))
      .rejects.toThrow("You’ve already reviewed this album.");
  });

  test("TC034 - Input validation for review text", () => {
    const maliciousText = "<script>alert('x')</script>";
    const safe = reviewService.isTextSanitized(maliciousText);
    expect(safe).toBe(true);
  });

  test("TC035 - Display all reviews for album", async () => {
    const reviews = await reviewService.getReviewsForAlbum("album456");
    expect(reviews.length).toBeGreaterThan(0);
  });

  test("TC036 - Retrieve reviews from multiple users", async () => {
    const reviews = await reviewService.getReviewsForAlbum("album456");
    const usernames = new Set(reviews.map(r => r.username));
    expect(usernames.size).toBeGreaterThan(1);
  });

  test("TC037 - Handle empty review list", async () => {
    const reviews = await reviewService.getReviewsForAlbum("album999");
    expect(reviews.length).toBe(0);
  });

  test("TC038 - Sort reviews by date", async () => {
    const reviews = await reviewService.getReviewsForAlbum("album456");
    for (let i = 1; i < reviews.length; i++) {
      const prev = new Date(reviews[i - 1].date);
      const curr = new Date(reviews[i].date);
      expect(prev >= curr).toBe(true);
    }
  });

  test("TC039 - Handle database connection error", async () => {
    reviewService.simulateConnectionLoss();
    await expect(reviewService.getReviewsForAlbum("album456"))
      .rejects.toThrow("Unable to load reviews.");
  });

  test("TC040 - Edit existing review", async () => {
    const updated = { userId: "user123", albumId: "album456", rating: 4, text: "Still good!" };
    const result = await reviewService.editReview(updated);
    expect(result.success).toBe(true);
  });

  test("TC041 - Delete existing review", async () => {
    const result = await reviewService.deleteReview("user123", "album456");
    expect(result.success).toBe(true);
  });

  test("TC042 - Unauthorized edit attempt", async () => {
    const updated = { userId: "otherUser", albumId: "album456", rating: 3, text: "Not bad" };
    await expect(reviewService.editReview(updated))
      .rejects.toThrow("Access denied.");
  });

  test("TC043 - Unauthorized delete attempt", async () => {
    await expect(reviewService.deleteReview("otherUser", "album456"))
      .rejects.toThrow("Access denied.");
  });

  test("TC044 - Review linked to user and album", async () => {
    const review = { userId: "user123", albumId: "album456", rating: 5, text: "Perfect!" };
    await reviewService.submitReview(review);
    const stored = await reviewService.getReview("user123", "album456");
    expect(stored.userId).toBe("user123");
    expect(stored.albumId).toBe("album456");
  });

  test("TC045 - Review count updates dynamically", async () => {
    const before = await reviewService.getReviewCount("album456");
    await reviewService.submitReview({ userId: "user999", albumId: "album456", rating: 4, text: "Nice!" });
    const after = await reviewService.getReviewCount("album456");
    expect(after).toBe(before + 1);
  });

  test("TC046 - Review retrieval performance", async () => {
    const start = Date.now();
    await reviewService.getReviewsForAlbum("albumMega");
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000);
  });
});
