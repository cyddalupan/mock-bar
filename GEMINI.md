# Project: Mock Bar

**Repository:** `git@github.com:cyddalupan/mock-bar.git`

This project consists of three main components: a PHP API, an Angular frontend, and a directory to serve the built Angular application.

## Directory Structure

*   `/api`: Contains the PHP backend files.
*   `/angular`: Contains the Angular frontend source code.
*   `/mock-bar`: Serves the built Angular application.

## Backend API (`/api`)

The API consists of three main PHP files:

*   `db.php`: Executes SQL queries (SELECT, INSERT, etc.).
*   `ai.php`: Interacts with the OpenAI API, taking a system prompt and conversation history.
*   `gitpull.php`: When accessed (`/api/gitpull.php`), pulls the latest updates from the Git repository for deployment.

**Security:**
*   All communication between the Angular frontend and the PHP backend will be encrypted. The specific encryption method needs to be defined and implemented.
*   Sensitive data, such as API keys and database credentials, will be stored in a `.env` file at the project root. This file should not be committed to version control.

## Frontend Application (`/angular`)

The frontend is an Angular application.

**Initial Homepage Functionality:**
The Angular application's initial homepage will feature test functionalities for both the `db.php` and `ai.php` APIs.
*   **Database Test:** Display results from a simple `SELECT` query on an existing table `diag_ans` with columns: `id`, `user_id`, `batch_id`, `question_id`, `answer`, `score`, `feedback`, `date_created`.
*   **AI Test:** Allow for a simple AI call using the `ai.php` endpoint.

**Build Process:**
*   The `npm run build` command will compile the Angular application.
*   The build process will move the compiled files directly into the `/mock-bar` directory for serving.

## Development Guidelines

*   **Development Workflow:**
    *   **Environment:** Development and local testing occur on your machine. However, integration and functional testing of the application (Angular frontend interacting with PHP backend) are performed on a remote server.
    *   **Build & Push:** After making any significant code changes in the Angular application, always run `npm run build` from the `/angular` directory. Subsequently, all changes, including the newly built files within the `/mock-bar` directory, must be committed and pushed to the Git repository.
    *   **Deployment & Testing:** The remote server will then pull the latest changes (e.g., via `gitpull.php`) to update the application for testing. This ensures the deployed version always reflects the latest built and pushed code.
*   **Strict Typing:** Implement strict typing throughout the Angular project, utilizing detailed interfaces and classes. This helps catch issues during `npm run build` and improves code quality.

## Development Plan




1.  **Project Setup:**

    *   [ ] Initialize a Git repository and push to `git@github.com:cyddalupan/mock-bar.git`.

    *   [x] Create `.env` file with dummy credentials.

2.  **API Development (`/api`):**

    *   [x] Implement `db.php` to securely handle database connections and queries, including `.env` loading and a basic `executeQuery` function.

    *   [ ] Create a database and `diag_ans` table for testing.

    *   [x] Implement `ai.php` to handle requests to the OpenAI API, including `.env` loading and a basic `callOpenAI` function.

    *   [ ] Define and implement the encryption/decryption mechanism for payloads between the frontend and backend in both `db.php` and `ai.php`.
    *   [ ] Implement `gitpull.php` to securely pull the latest changes from the Git repository.

3.  **Frontend Development (`/angular`):**

    *   [ ] Set up the basic Angular application structure.

    *   [ ] Create Angular services to communicate with the `/api` backend, handling encrypted payloads.

    *   [ ] Implement the initial homepage UI:

        *   Display results from a `SELECT` query to the `diag_ans` table via `db.php`.

        *   Provide an interface to trigger an AI call via `ai.php` and display the response.

    *   [ ] Implement the client-side encryption for payloads sent to the backend.

4.  **Build & Deployment (`/angular` & `/mock-bar`):**

    *   [ ] Configure the Angular build process (`angular.json`) to output the built files to the `/mock-bar` directory.

    *   [ ] Verify the `npm run build` command successfully moves compiled files to `/mock-bar`.

5.  **Refinement & Testing:**

    *   [ ] Thoroughly test both API endpoints from the Angular frontend.

    *   [ ] Ensure robust error handling and security measures are in place.

    *   [ ] Document API endpoints and usage.
