// MAIN MUSICBOXD FILE //
// TO COMPILE PROJECT AND RUN TESTS ONLY //
public class Main {
  
// DATABASE TESTS //
  //Every other section had tests for the database so there's nothing here
  //We can always add tests here if we need more
  
// LOGIN TESTS //
  //This is a placeholder for the authentication/login service
  //Take this out or replace it when we code the actual login
  static AuthService authService;
  public static void setup() {
    authService = new AuthService();
  }
  
    @Test
    @DisplayName("TC001 - Login with valid credentials")
    public void testLoginWithValidCredentials() {
        boolean result = authService.login("validUser", "validPass");
        assertTrue(result, "User should successfully log in with valid credentials");
    }

    @Test
    @DisplayName("TC002 - Login with invalid password")
    public void testLoginWithInvalidPassword() {
        Exception exception = assertThrows(AuthenticationException.class, () -> {
            authService.login("validUser", "wrongPass");
        });
        assertEquals("Incorrect password.", exception.getMessage());
    }

    @Test
    @DisplayName("TC003 - Login with non-existent username")
    public void testLoginWithNonExistentUsername() {
        Exception exception = assertThrows(AuthenticationException.class, () -> {
            authService.login("ghostUser", "anyPass");
        });
        assertEquals("User not found.", exception.getMessage());
    }
    
    @Test
    @DisplayName("TC004 - Login with empty fields")
    public void testLoginWithEmptyFields() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login("", "");
        });
        assertEquals("Please enter username and password.", exception.getMessage());
    }

    @Test
    @DisplayName("TC005 - Login session persistence")
    public void testLoginSessionPersistence() {
        authService.login("validUser", "validPass");
        boolean sessionActive = authService.isSessionValid("validUser");
        assertTrue(sessionActive, "Session should persist after page refresh");
    }

    @Test
    @DisplayName("TC006 - Create a new account with valid data")
    public void testCreateAccountWithValidData() {
        boolean created = authService.signUp("newUser", "new@email.com", "StrongPass123");
        assertTrue(created, "Account should be created with valid data");
    }

    @Test
    @DisplayName("TC007 - Sign up with existing username")
    public void testSignUpWithExistingUsername() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.signUp("existingUser", "new@email.com", "StrongPass123");
        });
        assertEquals("Username already exists.", exception.getMessage());
    }

    @Test
    @DisplayName("TC008 - Sign up with invalid email format")
    public void testSignUpWithInvalidEmail() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.signUp("newUser", "invalid-email", "StrongPass123");
        });
        assertEquals("Invalid email address.", exception.getMessage());
    }

    @Test
    @DisplayName("TC009 - Password strength validation")
    public void testWeakPasswordValidation() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.signUp("newUser", "user@email.com", "123");
        });
        assertEquals("Password must meet strength requirements.", exception.getMessage());
    }

    @Test
    @DisplayName("TC010 - Confirm password mismatch")
    public void testPasswordMismatch() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.signUpWithConfirmation("newUser", "user@email.com", "StrongPass123", "WrongPass123");
        });
        assertEquals("Passwords do not match.", exception.getMessage());
    }

    @Test
    @DisplayName("TC011 - Forgot password with valid email")
    public void testForgotPasswordValidEmail() {
        boolean sent = authService.sendPasswordReset("user@email.com");
        assertTrue(sent, "Password reset link should be sent to valid email");
    }

    @Test
    @DisplayName("TC012 - Forgot password with unregistered email")
    public void testForgotPasswordInvalidEmail() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.sendPasswordReset("ghost@email.com");
        });
        assertEquals("No account associated with this email.", exception.getMessage());
    }

    @Test
    @DisplayName("TC013 - Forgot username with valid email")
    public void testForgotUsernameValidEmail() {
        String username = authService.retrieveUsername("user@email.com");
        assertEquals("validUser", username);
    }
    @Test
    @DisplayName("TC014 - Forgot username with unregistered email")
    public void testForgotUsernameInvalidEmail() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.retrieveUsername("ghost@email.com");
        });
        assertEquals("No account associated with this email.", exception.getMessage());
    }

    @Test
    @DisplayName("TC015 - SQL injection or input sanitization test")
    public void testInputSanitization() {
        String maliciousInput = "'; DROP TABLE users; --";
        boolean safe = authService.isInputSanitized(maliciousInput);
        assertTrue(safe, "Input should be sanitized to prevent SQL injection");
    }

    @Test
    @DisplayName("TC016 - Brute-force login prevention")
    public void testBruteForcePrevention() {
        for (int i = 0; i < 5; i++) {
            try {
                authService.login("validUser", "wrongPass");
            } catch (AuthenticationException ignored) {}
        }
        boolean locked = authService.isAccountLocked("validUser");
        assertTrue(locked, "Account should be locked after multiple failed attempts");
    }

    @Test
    @DisplayName("TC017 - Token/session expiration")
    public void testSessionExpiration() throws InterruptedException {
        authService.login("validUser", "validPass");
        Thread.sleep(5000); // Simulate time passing; adjust as needed
        boolean sessionValid = authService.isSessionValid("validUser");
        assertFalse(sessionValid, "Session should expire after timeout");
    }

// PROFILE TESTS //
  //This is a placeholder for the profile code
  //Take out or replace when we have the actual code
  static ProfileService profileService;
  public static void setupTopSongs() {
    profileService = new ProfileService();
  }
 
    @Test
    @DisplayName("TC075 - Add one song to profile")
    public void testAddSingleTopSong() {
        TopSongEntry entry = new TopSongEntry("Bohemian Rhapsody", "Queen");
        boolean added = profileService.addTopSong("user123", entry);
        assertTrue(added, "Song should be saved and displayed on profile");
    }

    @Test
    @DisplayName("TC076 - Add up to 5 songs")
    public void testAddFiveTopSongs() {
        for (int i = 1; i <= 5; i++) {
            TopSongEntry entry = new TopSongEntry("Song " + i, "Artist " + i);
            boolean added = profileService.addTopSong("user123", entry);
            assertTrue(added, "Each song should be saved and displayed");
        }
    }

    @Test
    @DisplayName("TC077 - Prevent adding more than 5 songs")
    public void testAddSixthTopSongFails() {
        for (int i = 1; i <= 5; i++) {
            profileService.addTopSong("user123", new TopSongEntry("Song " + i, "Artist " + i));
        }
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            profileService.addTopSong("user123", new TopSongEntry("Song 6", "Artist 6"));
        });
        assertEquals("Maximum of 5 top songs allowed.", exception.getMessage());
    }

    @Test
    @DisplayName("TC078 - Validation when song name is blank")
    public void testBlankSongName() {
        TopSongEntry entry = new TopSongEntry("", "Artist Name");
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            profileService.addTopSong("user123", entry);
        });
        assertEquals("Song name cannot be blank.", exception.getMessage());
    }
  
    @Test
    @DisplayName("TC079 - Validation when artist name is blank")
    public void testBlankArtistName() {
        TopSongEntry entry = new TopSongEntry("Song Name", "");
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            profileService.addTopSong("user123", entry);
        });
        assertEquals("Artist name cannot be blank.", exception.getMessage());
    }

    @Test
    @DisplayName("TC080 - Edit existing song entry")
    public void testEditTopSongEntry() {
        profileService.addTopSong("user123", new TopSongEntry("Old Song", "Old Artist"));
        TopSongEntry updated = new TopSongEntry("New Song", "New Artist");
        boolean edited = profileService.editTopSong("user123", 0, updated);
        assertTrue(edited, "Changes should be saved and reflected instantly");
    }

    @Test
    @DisplayName("TC081 - Delete song from list")
    public void testDeleteTopSongEntry() {
        profileService.addTopSong("user123", new TopSongEntry("To Delete", "Artist"));
        boolean deleted = profileService.deleteTopSong("user123", 0);
        assertTrue(deleted, "Song should be removed from profile");
    }

    @Test
    @DisplayName("TC082 - Songs persist after refresh or relogin")
    public void testSongPersistence() {
        for (int i = 1; i <= 5; i++) {
            profileService.addTopSong("user123", new TopSongEntry("Song " + i, "Artist " + i));
        }
        profileService.simulateRefreshAndRelogin("user123");
        List<TopSongEntry> songs = profileService.getTopSongs("user123");
        assertEquals(5, songs.size(), "Songs should persist and be displayed");
    }
  
    @Test
    @DisplayName("TC083 - Special characters and numbers accepted")
    public void testSpecialCharactersInSongEntry() {
        TopSongEntry entry = new TopSongEntry("L0v3 & W@r!", "A$AP R0cky");
        boolean added = profileService.addTopSong("user123", entry);
        assertTrue(added, "Song with special characters should be displayed");
    }

    @Test
    @DisplayName("TC084 - UI layout with fewer than 5 songs")
    public void testUILayoutWithFewerSongs() {
        profileService.addTopSong("user123", new TopSongEntry("Only One", "Solo Artist"));
        List<String> layoutSlots = profileService.getTopSongLayout("user123");
        assertEquals(5, layoutSlots.size(), "Layout should show 5 slots");
        assertEquals("Only One", layoutSlots.get(0));
        assertTrue(layoutSlots.subList(1, 5).stream().allMatch(slot -> slot.equals("Empty")),
                   "Empty slots should be shown for missing songs");
    }

    @Test
    @DisplayName("TC085 - Reorder songs")
    public void testReorderSongs() {
        for (int i = 1; i <= 3; i++) {
            profileService.addTopSong("user123", new TopSongEntry("Song " + i, "Artist " + i));
        }
        boolean reordered = profileService.reorderTopSongs("user123", 0, 2);
        List<TopSongEntry> songs = profileService.getTopSongs("user123");
        assertEquals("Song 1", songs.get(2).getSongName(), "Song should be moved to new position");
    }

    @Test
    @DisplayName("TC086 - Prevent duplicate song entries")
    public void testPreventDuplicateSongs() {
        TopSongEntry entry = new TopSongEntry("Repeat Song", "Repeat Artist");
        profileService.addTopSong("user123", entry);
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            profileService.addTopSong("user123", entry);
        });
        assertEquals("Duplicate song entries are not allowed.", exception.getMessage());
    }

// PLAYLIST TESTS //
  //This is a placeholder for the playlist code
  //Take out or replace when we have the actual code
  static ListService listService;
  public static void setupLists() {
    listService = new ListService();
  }
 
    @Test
    @DisplayName("TC047 - Add valid album to list")
    public void testAddValidAlbumToList() {
        boolean added = listService.addAlbumToList("user123", "Favorites", "The Dark Side of the Moon");
        assertTrue(added, "Album should be added to the selected list");
    }

    @Test
    @DisplayName("TC048 - Add duplicate album to same list")
    public void testAddDuplicateAlbumToList() {
        listService.addAlbumToList("user123", "Favorites", "The Wall");
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            listService.addAlbumToList("user123", "Favorites", "The Wall");
        });
        assertEquals("Album already exists.", exception.getMessage());
    }

    @Test
    @DisplayName("TC049 - Add same album to different lists")
    public void testAddAlbumToMultipleLists() {
        boolean addedToList1 = listService.addAlbumToList("user123", "Favorites", "OK Computer");
        boolean addedToList2 = listService.addAlbumToList("user123", "Workout", "OK Computer");
        assertTrue(addedToList1 && addedToList2, "Album should be added to both lists");
    }

    @Test
    @DisplayName("TC050 - Add album with invalid/empty name")
    public void testAddAlbumWithEmptyName() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            listService.addAlbumToList("user123", "Favorites", "");
        });
        assertEquals("Please enter a valid album name.", exception.getMessage());
    }

    @Test
    @DisplayName("TC051 - Add album when DB connection lost")
    public void testAddAlbumWithDbFailure() {
        listService.simulateConnectionLoss();
        Exception exception = assertThrows(DatabaseException.class, () -> {
            listService.addAlbumToList("user123", "Favorites", "Abbey Road");
        });
        assertEquals("Unable to add album.", exception.getMessage());
    }
 
    @Test
    @DisplayName("TC052 - Search for album by full name")
    public void testSearchAlbumByFullName() {
        Album result = listService.searchAlbum("Rumours");
        assertNotNull(result, "Album should be displayed");
        assertEquals("Rumours", result.getTitle());
    }

    @Test
    @DisplayName("TC053 - Search for album by partial name")
    public void testSearchAlbumByPartialName() {
        List<Album> results = listService.searchAlbumPartial("Rum");
        assertFalse(results.isEmpty(), "Matching albums should be displayed");
    }

    @Test
    @DisplayName("TC054 - Search for non-existent album")
    public void testSearchNonExistentAlbum() {
        List<Album> results = listService.searchAlbumPartial("FakeAlbumXYZ");
        assertTrue(results.isEmpty(), "No albums should be found");
    }

    @Test
    @DisplayName("TC055 - Search input validation")
    public void testSearchInputSanitization() {
        String maliciousInput = "'; DROP TABLE albums; --";
        boolean safe = listService.isInputSanitized(maliciousInput);
        assertTrue(safe, "Input should be sanitized to prevent injection");
    }

    @Test
    @DisplayName("TC056 - Search performance test")
    public void testSearchPerformance() {
        long start = System.currentTimeMillis();
        listService.searchAlbumPartial("Love");
        long duration = System.currentTimeMillis() - start;
        assertTrue(duration < 2000, "Search should return results in under 2 seconds");
    }

    @Test
    @DisplayName("TC057 - View user’s album lists")
    public void testViewUserLists() {
        List<AlbumList> lists = listService.getUserLists("user123");
        assertFalse(lists.isEmpty(), "User's lists and albums should display correctly");
    }
 
    @Test
    @DisplayName("TC058 - Remove album from list")
    public void testRemoveAlbumFromList() {
        boolean removed = listService.removeAlbumFromList("user123", "Favorites", "Thriller");
        assertTrue(removed, "Album should be removed from list");
    }

    @Test
    @DisplayName("TC059 - Edit list name")
    public void testEditListName() {
        boolean renamed = listService.renameList("user123", "OldName", "NewName");
        assertTrue(renamed, "List name should be updated and stored");
    }

    @Test
    @DisplayName("TC060 - Delete entire list")
    public void testDeleteList() {
        boolean deleted = listService.deleteList("user123", "Chill Vibes");
        assertTrue(deleted, "List should be removed from database");
    }

    @Test
    @DisplayName("TC061 - Access another user’s list")
    public void testUnauthorizedListAccess() {
        Exception exception = assertThrows(SecurityException.class, () -> {
            listService.viewList("otherUser", "Favorites");
        });
        assertEquals("Access denied.", exception.getMessage());
    }

    @Test
    @DisplayName("TC062 - Album-list relationship stored correctly")
    public void testAlbumListRelationship() {
        listService.addAlbumToList("user123", "Favorites", "1989");
        AlbumListEntry entry = listService.getAlbumListEntry("user123", "Favorites", "1989");
        assertEquals("user123", entry.getUserId());
        assertEquals("Favorites", entry.getListName());
        assertEquals("1989", entry.getAlbumTitle());
    }
 
    @Test
    @DisplayName("TC063 - Update reflected immediately")
    public void testImmediateUpdateReflection() {
        listService.addAlbumToList("user123", "Favorites", "Evermore");
        List<String> albums = listService.getAlbumsInList("user123", "Favorites");
        assertTrue(albums.contains("Evermore"), "Changes should be reflected instantly");
    }

    @Test
    @DisplayName("TC064 - Handle large lists efficiently")
    public void testLargeListPerformance() {
        listService.populateListWithAlbums("user123", "MegaList", 120);
        long start = System.currentTimeMillis();
        List<String> albums = listService.getAlbumsInList("user123", "MegaList");
        long duration = System.currentTimeMillis() - start;
        assertTrue(duration < 3000, "Large list should load in under 3 seconds");
        assertEquals(120, albums.size());
    }

// REVIEWS TESTS //
  //This is a placeholder for the review code
  //Take out or replace when we have the actual code
  static ReviewService reviewService;
  public static void setupReviews() {
    reviewService = new ReviewService();
  }
  
    @Test
    @DisplayName("TC030 - Add new review with valid data")
    public void testAddValidReview() {
        Review review = new Review("user123", "album456", 5, "Amazing album!");
        boolean saved = reviewService.submitReview(review);
        assertTrue(saved, "Review should be saved and linked to user/album");
    }

    @Test
    @DisplayName("TC031 - Add review with empty text")
    public void testAddReviewEmptyText() {
        Review review = new Review("user123", "album456", 4, "");
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            reviewService.submitReview(review);
        });
        assertEquals("Review cannot be empty.", exception.getMessage());
    }

    @Test
    @DisplayName("TC032 - Add review without rating")
    public void testAddReviewNoRating() {
        Review review = new Review("user123", "album456", null, "Great!");
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            reviewService.submitReview(review);
        });
        assertEquals("Please provide a rating.", exception.getMessage());
    }
 
    @Test
    @DisplayName("TC033 - Add duplicate review")
    public void testAddDuplicateReview() {
        Review review = new Review("user123", "album456", 5, "Loved it!");
        reviewService.submitReview(review);
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            reviewService.submitReview(review);
        });
        assertEquals("You’ve already reviewed this album.", exception.getMessage());
    }

    @Test
    @DisplayName("TC034 - Input validation for review text")
    public void testReviewTextSanitization() {
        String maliciousText = "<script>alert('x')</script>";
        boolean safe = reviewService.isTextSanitized(maliciousText);
        assertTrue(safe, "Review text should be sanitized to prevent injection");
    }

    @Test
    @DisplayName("TC035 - Display all reviews for album")
    public void testDisplayAllReviews() {
        List<Review> reviews = reviewService.getReviewsForAlbum("album456");
        assertFalse(reviews.isEmpty(), "All reviews should be displayed");
    }

    @Test
    @DisplayName("TC036 - Retrieve reviews from multiple users")
    public void testRetrieveMultipleUserReviews() {
        List<Review> reviews = reviewService.getReviewsForAlbum("album456");
        Set<String> usernames = reviews.stream().map(Review::getUsername).collect(Collectors.toSet());
        assertTrue(usernames.size() > 1, "Reviews should be linked to multiple users");
    }

    @Test
    @DisplayName("TC037 - Handle empty review list")
    public void testEmptyReviewList() {
        List<Review> reviews = reviewService.getReviewsForAlbum("album999");
        assertTrue(reviews.isEmpty(), "No reviews should be found");
    }
   
    @Test
    @DisplayName("TC038 - Sort reviews by date")
    public void testReviewSortByDate() {
        List<Review> reviews = reviewService.getReviewsForAlbum("album456");
        for (int i = 1; i < reviews.size(); i++) {
            assertTrue(reviews.get(i - 1).getDate().isAfter(reviews.get(i).getDate()) ||
                       reviews.get(i - 1).getDate().isEqual(reviews.get(i).getDate()),
                       "Reviews should be sorted newest-first");
        }
    }

    @Test
    @DisplayName("TC039 - Handle database connection error")
    public void testReviewDatabaseError() {
        reviewService.simulateConnectionLoss();
        Exception exception = assertThrows(DatabaseException.class, () -> {
            reviewService.getReviewsForAlbum("album456");
        });
        assertEquals("Unable to load reviews.", exception.getMessage());
    }

    @Test
    @DisplayName("TC040 - Edit existing review")
    public void testEditReview() {
        Review updated = new Review("user123", "album456", 4, "Still good!");
        boolean success = reviewService.editReview(updated);
        assertTrue(success, "Review should be updated in database");
    }

    @Test
    @DisplayName("TC041 - Delete existing review")
    public void testDeleteReview() {
        boolean deleted = reviewService.deleteReview("user123", "album456");
        assertTrue(deleted, "Review should be removed from database");
    }
 
    @Test
    @DisplayName("TC042 - Unauthorized edit attempt")
    public void testUnauthorizedEdit() {
        Review updated = new Review("otherUser", "album456", 3, "Not bad");
        Exception exception = assertThrows(SecurityException.class, () -> {
            reviewService.editReview(updated);
        });
        assertEquals("Access denied.", exception.getMessage());
    }

    @Test
    @DisplayName("TC043 - Unauthorized delete attempt")
    public void testUnauthorizedDelete() {
        Exception exception = assertThrows(SecurityException.class, () -> {
            reviewService.deleteReview("otherUser", "album456");
        });
        assertEquals("Access denied.", exception.getMessage());
    }

    @Test
    @DisplayName("TC044 - Review linked to user and album")
    public void testReviewLinkage() {
        Review review = new Review("user123", "album456", 5, "Perfect!");
        reviewService.submitReview(review);
        Review stored = reviewService.getReview("user123", "album456");
        assertEquals("user123", stored.getUserId());
        assertEquals("album456", stored.getAlbumId());
    }

    @Test
    @DisplayName("TC045 - Review count updates dynamically")
    public void testReviewCountUpdate() {
        int before = reviewService.getReviewCount("album456");
        reviewService.submitReview(new Review("user999", "album456", 4, "Nice!"));
        int after = reviewService.getReviewCount("album456");
        assertEquals(before + 1, after, "Review count should increment automatically");
    }

    @Test
    @DisplayName("TC046 - Review retrieval performance")
    public void testReviewRetrievalPerformance() {
        long start = System.currentTimeMillis();
        reviewService.getReviewsForAlbum("albumMega");
        long duration = System.currentTimeMillis() - start;
        assertTrue(duration < 3000, "Reviews should load within 3 seconds");
    }

// SEARCH TESTS //
  //This is a placeholder for the search
  //Take this out or replace it when we have the actual code
  static UserSearchService searchService;
  public static void setupSearch() {
    searchService = new UserSearchService();
  }

    @Test
    @DisplayName("TC018 - Search with valid existing username")
    public void testSearchValidUsername() {
        UserProfile profile = searchService.searchByUsername("musicFan123");
        assertNotNull(profile, "Matching user profile should be displayed");
        assertEquals("musicFan123", profile.getUsername());
    }

    @Test
    @DisplayName("TC019 - Search with partial username")
    public void testSearchPartialUsername() {
        List<UserProfile> results = searchService.searchByPartialUsername("music");
        assertFalse(results.isEmpty(), "Matching users should be displayed for partial input");
    }

    @Test
    @DisplayName("TC020 - Search for non-existent user")
    public void testSearchNonExistentUser() {
        List<UserProfile> results = searchService.searchByUsername("ghostUser999");
        assertTrue(results.isEmpty(), "No users should be found");
    }

    @Test
    @DisplayName("TC021 - Search with empty input")
    public void testSearchEmptyInput() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            searchService.searchByUsername("");
        });
        assertEquals("Please enter a username.", exception.getMessage());
    }

    @Test
    @DisplayName("TC022 - Search with whitespace-only input")
    public void testSearchWhitespaceInput() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            searchService.searchByUsername("   ");
        });
        assertEquals("Please enter valid text.", exception.getMessage());
    }
  
    @Test
    @DisplayName("TC023 - Retrieve user data from database")
    public void testRetrieveUserData() {
        UserProfile profile = searchService.searchByUsername("musicFan123");
        assertEquals("musicFan123", profile.getUsername());
        assertNotNull(profile.getGenres());
    }

    @Test
    @DisplayName("TC024 - Handle database connection failure")
    public void testDatabaseConnectionFailure() {
        searchService.simulateConnectionLoss();
        Exception exception = assertThrows(DatabaseException.class, () -> {
            searchService.searchByUsername("anyUser");
        });
        assertEquals("Unable to retrieve data.", exception.getMessage());
    }

    @Test
    @DisplayName("TC025 - Performance of search query")
    public void testSearchPerformance() {
        long start = System.currentTimeMillis();
        searchService.searchByPartialUsername("music");
        long duration = System.currentTimeMillis() - start;
        assertTrue(duration < 2000, "Search results should display within 2 seconds");
    }

    @Test
    @DisplayName("TC026 - Display limited user information")
    public void testLimitedUserInfoDisplay() {
        UserProfile profile = searchService.searchByUsername("musicFan123");
        assertNull(profile.getEmail(), "Private info should be hidden");
        assertNotNull(profile.getPublicBio(), "Public info should be shown");
    }
 
    @Test
    @DisplayName("TC027 - Search case sensitivity")
    public void testSearchCaseInsensitivity() {
        UserProfile lower = searchService.searchByUsername("musicfan123");
        UserProfile upper = searchService.searchByUsername("MUSICFAN123");
        assertEquals(lower.getUsername(), upper.getUsername(), "Search should be case-insensitive");
    }

    @Test
    @DisplayName("TC028 - Search by additional criteria")
    public void testSearchWithFilters() {
        List<UserProfile> results = searchService.searchWithFilters("rock", "Chicago");
        assertFalse(results.isEmpty(), "Filtered results should be displayed");
        for (UserProfile profile : results) {
            assertTrue(profile.getGenres().contains("rock"));
            assertEquals("Chicago", profile.getLocation());
        }
    }

    @Test
    @DisplayName("TC029 - Search injection and validation")
    public void testSearchInputSanitization() {
        String maliciousInput = "' OR '1'='1";
        boolean safe = searchService.isInputSanitized(maliciousInput);
        assertTrue(safe, "Input should be sanitized to prevent injection");
    }

// TOP SONGS/ALBUMS TESTS //
  //This is a placeholder for the top 5
  //Take out or replace when we have the actual code
  static TopChartTracker topTracker;
  public static void setupTop() {
    topTracker = new TopChartTracker();
  }

    @Test
    @DisplayName("TC065 - Add one album to profile")
    public void testAddSingleTopAlbum() {
        TopAlbumEntry entry = new TopAlbumEntry("The Suburbs", "Arcade Fire");
        boolean added = profileService.addTopAlbum("user123", entry);
        assertTrue(added, "Album should be saved and displayed on profile");
    }

    @Test
    @DisplayName("TC066 - Add up to 4 albums")
    public void testAddFourTopAlbums() {
        for (int i = 1; i <= 4; i++) {
            TopAlbumEntry entry = new TopAlbumEntry("Album " + i, "Artist " + i);
            boolean added = profileService.addTopAlbum("user123", entry);
            assertTrue(added, "Each album should be saved and displayed");
        }
    }

    @Test
    @DisplayName("TC067 - Prevent adding more than 4 albums")
    public void testAddFifthTopAlbumFails() {
        for (int i = 1; i <= 4; i++) {
            profileService.addTopAlbum("user123", new TopAlbumEntry("Album " + i, "Artist " + i));
        }
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            profileService.addTopAlbum("user123", new TopAlbumEntry("Album 5", "Artist 5"));
        });
        assertEquals("Maximum of 4 top albums allowed.", exception.getMessage());
    }

    @Test
    @DisplayName("TC068 - Validation when album name is blank")
    public void testBlankAlbumName() {
        TopAlbumEntry entry = new TopAlbumEntry("", "Artist Name");
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            profileService.addTopAlbum("user123", entry);
        });
        assertEquals("Album name cannot be blank.", exception.getMessage());
    }
 
    @Test
    @DisplayName("TC069 - Validation when artist name is blank")
    public void testBlankArtistName() {
        TopAlbumEntry entry = new TopAlbumEntry("Album Name", "");
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            profileService.addTopAlbum("user123", entry);
        });
        assertEquals("Artist name cannot be blank.", exception.getMessage());
    }

    @Test
    @DisplayName("TC070 - Edit existing album entry")
    public void testEditTopAlbumEntry() {
        profileService.addTopAlbum("user123", new TopAlbumEntry("Old Album", "Old Artist"));
        TopAlbumEntry updated = new TopAlbumEntry("New Album", "New Artist");
        boolean edited = profileService.editTopAlbum("user123", 0, updated);
        assertTrue(edited, "Changes should be saved and reflected instantly");
    }

    @Test
    @DisplayName("TC071 - Delete album from list")
    public void testDeleteTopAlbumEntry() {
        profileService.addTopAlbum("user123", new TopAlbumEntry("To Delete", "Artist"));
        boolean deleted = profileService.deleteTopAlbum("user123", 0);
        assertTrue(deleted, "Album should be removed from profile");
    }

    @Test
    @DisplayName("TC072 - Albums persist after refresh or relogin")
    public void testAlbumPersistence() {
        for (int i = 1; i <= 4; i++) {
            profileService.addTopAlbum("user123", new TopAlbumEntry("Album " + i, "Artist " + i));
        }
        profileService.simulateRefreshAndRelogin("user123");
        List<TopAlbumEntry> albums = profileService.getTopAlbums("user123");
        assertEquals(4, albums.size(), "Albums should persist and be displayed");
    }
   
    @Test
    @DisplayName("TC073 - Special characters and numbers accepted")
    public void testSpecialCharactersInAlbumEntry() {
        TopAlbumEntry entry = new TopAlbumEntry("H3ll0 W@rld!", "A$AP R0cky");
        boolean added = profileService.addTopAlbum("user123", entry);
        assertTrue(added, "Album with special characters should be displayed");
    }

    @Test
    @DisplayName("TC074 - UI layout with less than 4 albums")
    public void testUILayoutWithFewerAlbums() {
        profileService.addTopAlbum("user123", new TopAlbumEntry("Only One", "Solo Artist"));
        List<String> layoutSlots = profileService.getTopAlbumLayout("user123");
        assertEquals(4, layoutSlots.size(), "Layout should show 4 slots");
        assertEquals("Only One", layoutSlots.get(0));
        assertTrue(layoutSlots.subList(1, 4).stream().allMatch(slot -> slot.equals("Empty")),
                   "Empty slots should be shown for missing albums");
    }

}
