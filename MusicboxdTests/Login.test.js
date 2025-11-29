import authService from "../services/authService"; // adjust path as needed

// LOGIN TESTS
describe("Login and Authentication", () => {
  test("TC001 - Login with valid credentials", async () => {
    const result = await authService.login("validUser", "validPass");
    expect(result.success).toBe(true);
  });

  test("TC002 - Login with invalid password", async () => {
    await expect(authService.login("validUser", "wrongPass"))
      .rejects.toThrow("Incorrect password.");
  });

  test("TC003 - Login with non-existent username", async () => {
    await expect(authService.login("ghostUser", "anyPass"))
      .rejects.toThrow("User not found.");
  });

  test("TC004 - Login with empty fields", async () => {
    await expect(authService.login("", ""))
      .rejects.toThrow("Please enter username and password.");
  });

  test("TC005 - Login session persistence", async () => {
    await authService.login("validUser", "validPass");
    const session = await authService.checkSession("validUser");
    expect(session.active).toBe(true);
  });

  test("TC006 - Create account with valid data", async () => {
    const result = await authService.signUp("newUser", "new@email.com", "StrongPass123");
    expect(result.success).toBe(true);
  });

  test("TC007 - Sign up with existing username", async () => {
    await expect(authService.signUp("existingUser", "new@email.com", "StrongPass123"))
      .rejects.toThrow("Username already exists.");
  });

  test("TC008 - Sign up with invalid email format", async () => {
    await expect(authService.signUp("newUser", "invalid-email", "StrongPass123"))
      .rejects.toThrow("Invalid email address.");
  });

  test("TC009 - Password strength validation", async () => {
    await expect(authService.signUp("newUser", "user@email.com", "123"))
      .rejects.toThrow("Password must meet strength requirements.");
  });

  test("TC010 - Confirm password mismatch", async () => {
    await expect(authService.signUpWithConfirmation("newUser", "user@email.com", "StrongPass123", "WrongPass123"))
      .rejects.toThrow("Passwords do not match.");
  });

  test("TC011 - Forgot password with valid email", async () => {
    const result = await authService.sendPasswordReset("user@email.com");
    expect(result.sent).toBe(true);
  });

  test("TC012 - Forgot password with unregistered email", async () => {
    await expect(authService.sendPasswordReset("ghost@email.com"))
      .rejects.toThrow("No account associated with this email.");
  });

  test("TC013 - Forgot username with valid email", async () => {
    const username = await authService.retrieveUsername("user@email.com");
    expect(username).toBe("validUser");
  });

  test("TC014 - Forgot username with unregistered email", async () => {
    await expect(authService.retrieveUsername("ghost@email.com"))
      .rejects.toThrow("No account associated with this email.");
  });

  test("TC015 - SQL injection or input sanitization", () => {
    const safe = authService.isInputSanitized("'; DROP TABLE users; --");
    expect(safe).toBe(true);
  });

  test("TC016 - Brute-force login prevention", async () => {
    for (let i = 0; i < 5; i++) {
      try { await authService.login("validUser", "wrongPass"); } catch {}
    }
    const locked = await authService.isAccountLocked("validUser");
    expect(locked).toBe(true);
  });

  test("TC017 - Token/session expiration", async () => {
    await authService.login("validUser", "validPass");
    await new Promise(res => setTimeout(res, 5000)); // Simulate time passing
    const session = await authService.checkSession("validUser");
    expect(session.active).toBe(false);
  });
});

