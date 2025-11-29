<<<<<<< HEAD


// DATABASE //

// LOG IN //

// PROFILE //

// SEARCH //

// REVIEWS //

// PLAYLISTS

// TOP SONGS/ALBUMS //

import java.util.Scanner;
import java.awt.Desktop;
import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

public class Musicboxd {
	// ...existing code...

	// --- ADAPTERS TO AVOID COMPILE ERRORS WHEN REAL LIBS ARE MISSING ---
	// Minimal auth interface used by this file (replace with real adapter later)
	public interface AuthProvider {
		boolean login(String email, String password) throws Exception;
		boolean createAccount(String email, String password) throws Exception;
		Object getCurrentUser() throws Exception;
		void logout() throws Exception;
	}

	// Minimal profile interface used by this file (replace with real adapter later)
	public interface ProfileProvider {
		void showProfile(Object user) throws Exception;
	}

	// Fallback in-memory auth for development/testing (no external dependency)
	public static class DefaultAuthProvider implements AuthProvider {
		private Object currentUser = null;

		@Override
		public boolean login(String email, String password) {
			// VERY simple stub: accept any non-empty credentials
			if (email != null && !email.isEmpty() && password != null && !password.isEmpty()) {
				currentUser = "user:" + email; // placeholder user object
				return true;
			}
			return false;
		}

		@Override
		public boolean createAccount(String email, String password) {
			// stub: always succeed if values present
			if (email != null && !email.isEmpty() && password != null && !password.isEmpty()) {
				currentUser = "user:" + email; // placeholder user object
				return true;
			}
			return false;
		}

		@Override
		public Object getCurrentUser() {
			return currentUser;
		}

		@Override
		public void logout() {
			currentUser = null;
		}
	}

	// Fallback profile renderer that prints profile info to CLI
	public static class DefaultProfileProvider implements ProfileProvider {
		@Override
		public void showProfile(Object user) {
			System.out.println("----- PROFILE -----");
			if (user == null) {
				System.out.println("[no user]");
			} else {
				System.out.println("Logged in as: " + user.toString());
				System.out.println("(profile components from profile_index.html would load here)");
			}
			System.out.println("-------------------");

			// Attempt to open the profile HTML in the default browser
			try {
				openHtmlInBrowser("profile_index.html"); // relative path inside project
			} catch (Exception e) {
				System.err.println("Unable to open profile HTML: " + e.getMessage());
			}
		}
	}


	// Helper: open a local HTML file in the system default browser
	private static void openHtmlInBrowser(String relativePath) throws IOException, URISyntaxException {
		// 1) Try straightforward filesystem locations
		String[] candidates = new String[] {
			relativePath,
			"./" + relativePath,
			"src/" + relativePath,
			"resources/" + relativePath,
			"../" + relativePath
		};
		for (String p : candidates) {
			File f = new File(p);
			// Debug hint
			// System.out.println("Checking file: " + f.getAbsolutePath());
			if (f.exists()) {
				if (Desktop.isDesktopSupported()) {
					Desktop.getDesktop().browse(f.toURI());
					return;
				} else {
					System.out.println("Open this file in a browser: " + f.getAbsolutePath());
					return;
				}
			}
		}

		// 2) Try to load as a classpath resource
		// Try both ClassLoader and class resource lookup
		URL res = Musicboxd.class.getResource("/" + relativePath);
		if (res == null) {
			res = Thread.currentThread().getContextClassLoader().getResource(relativePath);
		}

		if (res != null) {
			String protocol = res.getProtocol();
			// If resource is directly accessible as a file URL, open it
			if ("file".equalsIgnoreCase(protocol)) {
				if (Desktop.isDesktopSupported()) {
					Desktop.getDesktop().browse(res.toURI());
					return;
				}
			}

			// If resource is inside a JAR (protocol "jar") or not directly file-accessible,
			// copy it to a temp file and open that.
			try (InputStream is = Musicboxd.class.getResourceAsStream("/" + relativePath) == null
					? Thread.currentThread().getContextClassLoader().getResourceAsStream(relativePath)
					: Musicboxd.class.getResourceAsStream("/" + relativePath)) {

				if (is != null) {
					Path temp = Files.createTempFile("musicboxd_profile_", ".html");
					Files.copy(is, temp, StandardCopyOption.REPLACE_EXISTING);
					temp.toFile().deleteOnExit();
					if (Desktop.isDesktopSupported()) {
						Desktop.getDesktop().browse(temp.toUri());
						return;
					} else {
						System.out.println("Open this file in a browser: " + temp.toAbsolutePath().toString());
						return;
					}
				}
			} catch (IOException ioe) {
				// fall through to error reporting below
			}
		}

		// Nothing found
		throw new IOException("HTML file not found in filesystem or classpath: " + relativePath);
	}

	// Use adapters here. Replace Default* with real adapters when available.
	private static final AuthProvider AUTH = new DefaultAuthProvider();
	private static final ProfileProvider PROFILE = new DefaultProfileProvider();

	public static void main(String[] args) {
		// ...existing code...

		// Simple CLI loop to ask user to log in or create account, then show profile
		Scanner scanner = new Scanner(System.in);
		boolean loggedIn = false;
		while (!loggedIn) {
			System.out.println("\nWelcome to Musicboxd");
			System.out.println("1) Log in");
			System.out.println("2) Create account");
			System.out.println("3) Exit");
			System.out.print("Choose an option: ");
			String choice = scanner.nextLine().trim();

			try {
				switch (choice) {
					case "1":
						System.out.print("Email: ");
						String email = scanner.nextLine().trim();
						System.out.print("Password: ");
						String password = scanner.nextLine().trim();
						// call auth adapter
						if (AUTH.login(email, password)) {
							System.out.println("Logged in successfully.");
							loggedIn = true;
						} else {
							System.out.println("Login failed. Check credentials.");
						}
						break;
					case "2":
						System.out.print("Email: ");
						String newEmail = scanner.nextLine().trim();
						System.out.print("Password: ");
						String newPassword = scanner.nextLine().trim();
						// call auth adapter
						if (AUTH.createAccount(newEmail, newPassword)) {
							System.out.println("Account created and logged in.");
							loggedIn = true;
						} else {
							System.out.println("Account creation failed.");
						}
						break;
					case "3":
						System.out.println("Exiting.");
						scanner.close();
						System.exit(0);
						return;
					default:
						System.out.println("Invalid option.");
				}
			} catch (Exception e) {
				System.err.println("Authentication error: " + e.getMessage());
			}
		}

		// At this point user is logged in. Get user object from your auth layer.
		Object currentUser = null;
		try {
			currentUser = AUTH.getCurrentUser(); // replace with real user type if available
		} catch (Exception e) {
			System.err.println("Failed to retrieve current user: " + e.getMessage());
		}

		// Render the profile UI using your profile provider which should load profile_index.html components
		try {
			PROFILE.showProfile(currentUser); // adapt method / parameter type to your profile implementation
		} catch (Exception e) {
			System.err.println("Failed to show profile: " + e.getMessage());
		}

		// Optionally provide a small loop to allow logout or other actions
		boolean running = true;
		while (running) {
			System.out.println("\n1) Refresh profile  2) Logout  3) Quit");
			System.out.print("Choose: ");
			String opt = scanner.nextLine().trim();
			switch (opt) {
				case "1":
					try {
						PROFILE.showProfile(AUTH.getCurrentUser());
					} catch (Exception e) {
						System.err.println("Error refreshing profile: " + e.getMessage());
					}
					break;
				case "2":
					try {
						AUTH.logout();
						System.out.println("Logged out.");
					} catch (Exception e) {
						System.err.println("Logout error: " + e.getMessage());
					}
					// go back to login/create flow or exit
					running = false;
					break;
				case "3":
					System.out.println("Quit.");
					running = false;
					break;
				default:
					System.out.println("Invalid option.");
			}
		}

		scanner.close();
		// ...existing shutdown/cleanup code...
	}

	// ...existing code...
}
=======


// DATABASE //

// LOG IN //

// PROFILE //

// SEARCH //

// REVIEWS //

// PLAYLISTS

// TOP SONGS/ALBUMS //

import java.util.Scanner;
import java.awt.Desktop;
import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

public class Musicboxd {
	// ...existing code...

	// --- ADAPTERS TO AVOID COMPILE ERRORS WHEN REAL LIBS ARE MISSING ---
	// Minimal auth interface used by this file (replace with real adapter later)
	public interface AuthProvider {
		boolean login(String email, String password) throws Exception;
		boolean createAccount(String email, String password) throws Exception;
		Object getCurrentUser() throws Exception;
		void logout() throws Exception;
	}

	// Minimal profile interface used by this file (replace with real adapter later)
	public interface ProfileProvider {
		void showProfile(Object user) throws Exception;
	}

	// Fallback in-memory auth for development/testing (no external dependency)
	public static class DefaultAuthProvider implements AuthProvider {
		private Object currentUser = null;

		@Override
		public boolean login(String email, String password) {
			// VERY simple stub: accept any non-empty credentials
			if (email != null && !email.isEmpty() && password != null && !password.isEmpty()) {
				currentUser = "user:" + email; // placeholder user object
				return true;
			}
			return false;
		}

		@Override
		public boolean createAccount(String email, String password) {
			// stub: always succeed if values present
			if (email != null && !email.isEmpty() && password != null && !password.isEmpty()) {
				currentUser = "user:" + email; // placeholder user object
				return true;
			}
			return false;
		}

		@Override
		public Object getCurrentUser() {
			return currentUser;
		}

		@Override
		public void logout() {
			currentUser = null;
		}
	}

	// Fallback profile renderer that prints profile info to CLI
	public static class DefaultProfileProvider implements ProfileProvider {
		@Override
		public void showProfile(Object user) {
			System.out.println("----- PROFILE -----");
			if (user == null) {
				System.out.println("[no user]");
			} else {
				System.out.println("Logged in as: " + user.toString());
				System.out.println("(profile components from profile_index.html would load here)");
			}
			System.out.println("-------------------");

			// Attempt to open the profile HTML in the default browser
			try {
				openHtmlInBrowser("profile_index.html"); // relative path inside project
			} catch (Exception e) {
				System.err.println("Unable to open profile HTML: " + e.getMessage());
			}
		}
	}


	// Helper: open a local HTML file in the system default browser
	private static void openHtmlInBrowser(String relativePath) throws IOException, URISyntaxException {
		// 1) Try straightforward filesystem locations
		String[] candidates = new String[] {
			relativePath,
			"./" + relativePath,
			"src/" + relativePath,
			"resources/" + relativePath,
			"../" + relativePath
		};
		for (String p : candidates) {
			File f = new File(p);
			// Debug hint
			// System.out.println("Checking file: " + f.getAbsolutePath());
			if (f.exists()) {
				if (Desktop.isDesktopSupported()) {
					Desktop.getDesktop().browse(f.toURI());
					return;
				} else {
					System.out.println("Open this file in a browser: " + f.getAbsolutePath());
					return;
				}
			}
		}

		// 2) Try to load as a classpath resource
		// Try both ClassLoader and class resource lookup
		URL res = Musicboxd.class.getResource("/" + relativePath);
		if (res == null) {
			res = Thread.currentThread().getContextClassLoader().getResource(relativePath);
		}

		if (res != null) {
			String protocol = res.getProtocol();
			// If resource is directly accessible as a file URL, open it
			if ("file".equalsIgnoreCase(protocol)) {
				if (Desktop.isDesktopSupported()) {
					Desktop.getDesktop().browse(res.toURI());
					return;
				}
			}

			// If resource is inside a JAR (protocol "jar") or not directly file-accessible,
			// copy it to a temp file and open that.
			try (InputStream is = Musicboxd.class.getResourceAsStream("/" + relativePath) == null
					? Thread.currentThread().getContextClassLoader().getResourceAsStream(relativePath)
					: Musicboxd.class.getResourceAsStream("/" + relativePath)) {

				if (is != null) {
					Path temp = Files.createTempFile("musicboxd_profile_", ".html");
					Files.copy(is, temp, StandardCopyOption.REPLACE_EXISTING);
					temp.toFile().deleteOnExit();
					if (Desktop.isDesktopSupported()) {
						Desktop.getDesktop().browse(temp.toUri());
						return;
					} else {
						System.out.println("Open this file in a browser: " + temp.toAbsolutePath().toString());
						return;
					}
				}
			} catch (IOException ioe) {
				// fall through to error reporting below
			}
		}

		// Nothing found
		throw new IOException("HTML file not found in filesystem or classpath: " + relativePath);
	}

	// Use adapters here. Replace Default* with real adapters when available.
	private static final AuthProvider AUTH = new DefaultAuthProvider();
	private static final ProfileProvider PROFILE = new DefaultProfileProvider();

	public static void main(String[] args) {
		// ...existing code...

		// Simple CLI loop to ask user to log in or create account, then show profile
		Scanner scanner = new Scanner(System.in);
		boolean loggedIn = false;
		while (!loggedIn) {
			System.out.println("\nWelcome to Musicboxd");
			System.out.println("1) Log in");
			System.out.println("2) Create account");
			System.out.println("3) Exit");
			System.out.print("Choose an option: ");
			String choice = scanner.nextLine().trim();

			try {
				switch (choice) {
					case "1":
						System.out.print("Email: ");
						String email = scanner.nextLine().trim();
						System.out.print("Password: ");
						String password = scanner.nextLine().trim();
						// call auth adapter
						if (AUTH.login(email, password)) {
							System.out.println("Logged in successfully.");
							loggedIn = true;
						} else {
							System.out.println("Login failed. Check credentials.");
						}
						break;
					case "2":
						System.out.print("Email: ");
						String newEmail = scanner.nextLine().trim();
						System.out.print("Password: ");
						String newPassword = scanner.nextLine().trim();
						// call auth adapter
						if (AUTH.createAccount(newEmail, newPassword)) {
							System.out.println("Account created and logged in.");
							loggedIn = true;
						} else {
							System.out.println("Account creation failed.");
						}
						break;
					case "3":
						System.out.println("Exiting.");
						scanner.close();
						System.exit(0);
						return;
					default:
						System.out.println("Invalid option.");
				}
			} catch (Exception e) {
				System.err.println("Authentication error: " + e.getMessage());
			}
		}

		// At this point user is logged in. Get user object from your auth layer.
		Object currentUser = null;
		try {
			currentUser = AUTH.getCurrentUser(); // replace with real user type if available
		} catch (Exception e) {
			System.err.println("Failed to retrieve current user: " + e.getMessage());
		}

		// Render the profile UI using your profile provider which should load profile_index.html components
		try {
			PROFILE.showProfile(currentUser); // adapt method / parameter type to your profile implementation
		} catch (Exception e) {
			System.err.println("Failed to show profile: " + e.getMessage());
		}

		// Optionally provide a small loop to allow logout or other actions
		boolean running = true;
		while (running) {
			System.out.println("\n1) Refresh profile  2) Logout  3) Quit");
			System.out.print("Choose: ");
			String opt = scanner.nextLine().trim();
			switch (opt) {
				case "1":
					try {
						PROFILE.showProfile(AUTH.getCurrentUser());
					} catch (Exception e) {
						System.err.println("Error refreshing profile: " + e.getMessage());
					}
					break;
				case "2":
					try {
						AUTH.logout();
						System.out.println("Logged out.");
					} catch (Exception e) {
						System.err.println("Logout error: " + e.getMessage());
					}
					// go back to login/create flow or exit
					running = false;
					break;
				case "3":
					System.out.println("Quit.");
					running = false;
					break;
				default:
					System.out.println("Invalid option.");
			}
		}

		scanner.close();
		// ...existing shutdown/cleanup code...
	}

	// ...existing code...
}
>>>>>>> 21aedbd7c83e87a528c9ca19d9a4b0600d9d012c
