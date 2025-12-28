# Project: Mock Bar

**Repository:** `git@github.com:cyddalupan/mock-bar.git`

This project consists of three main components: a PHP API, an Angular frontend, and a directory to serve the built Angular application.

## Directory Structure

*   `/api`: Contains the PHP backend files.
*   `/angular`: Contains the Angular frontend project files.
*   `/bar`: Serves the built Angular application (formerly `mock-bar`).

## Backend API (`/api`)

The API consists of three main PHP files:

*   `db.php`: Executes SQL queries (SELECT, INSERT, etc.).
*   `ai.php`: Interacts with the OpenAI API, taking a system prompt and conversation history.
*   `gitpull.php`: When accessed (`/api/gitpull.php`), pulls the latest updates from the Git repository for deployment.

**CRITICAL SECURITY WARNING: `db.php` allows arbitrary SQL execution.**
The current implementation of `db.php` directly accepts SQL queries from the frontend. This means any SQL query (SELECT, INSERT, UPDATE, DELETE, etc.) can be executed through this endpoint. **This is a severe SQL Injection vulnerability and should never be exposed to untrusted user input in a production environment.** For any production usage, `db.php` *must* be refactored to use prepared statements with whitelisted queries or an ORM, and restrict allowed operations.

**Backend Development Notes:**
The `db.php` is currently considered stable. `ai.php` has been updated to handle AI grading for mock exam questions. Future development efforts and code changes should primarily focus on the Angular frontend.

### AI Grading System (`ai.php` Update)

The `ai.php` endpoint has been refactored to serve specifically as an AI grading service for mock exam questions. It no longer accepts generic `system_prompt` and `history` arrays for conversational AI. Instead, it expects `user_answer` and `expected_answer` as inputs and returns a structured JSON response containing a score and detailed feedback.

**Input Payload (JSON):**
```json
{
  "user_answer": "string",
  "expected_answer": "string"
}
```

**Output Response (JSON):**
```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": ...,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "{\n  \"score\": 85,\n  \"feedback\": \"<table class=\\\"table table-bordered\\\">...\" \n}"
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": ...,
    "completion_tokens": ...,
    "total_tokens": ...
  },
  "system_fingerprint": "fp_..."
}
```
The `content` field within `choices[0].message` will contain a JSON string with `score` (integer 1-100) and `feedback` (Bootstrap-styled HTML table string with grading criteria and an "Additional Insights" section).

**Grading Prompt Logic:**
The `ai.php` script constructs a detailed system prompt for the OpenAI API (`gpt-4o` model) to compare the `user_answer` against the `expected_answer`. The prompt instructs the AI to:
*   Output only a valid JSON object with `score` and `feedback`.
*   The `feedback` should be a Bootstrap-styled HTML table evaluating criteria like Answer, Legal Basis, Application, Conclusion, and Legal Writing.
*   Each criterion is graded individually (e.g., 5/5) with explanations for mistakes.
*   An "Additional Insights" section follows the table, including:
    *   The correct `expected_answer`.
    *   A "🔎 Mistakes" section with a clear list of errors.
    *   Suggestions for improvement.
    *   A congratulatory message if the user scored perfectly.

**Security:**
*   Communication between the Angular frontend and the PHP backend will be via plain JSON over HTTPS.
*   Sensitive data, such as API keys and database credentials, will be stored in a `.env` file at the project root. This file should not be committed to version control.

### Database Interaction Notes

*   **`GROUP_CONCAT` Data Truncation:** When using MySQL's `GROUP_CONCAT` function, especially with `JSON_OBJECT` to aggregate data, it's crucial to be aware of the `group_concat_max_len` server variable. The default value (often 1024 characters) can lead to data truncation, resulting in malformed JSON strings in the application.

*   **Resolution - `db.php` Modification for Multiple Statements:**
    *   **Problem:** The initial attempt to set `SET SESSION group_concat_max_len` via a separate API call from Angular did not work because `db.php` was creating a new `mysqli` connection for each request. This meant the `SET SESSION` command in one request did not persist to the subsequent request that executed the main `SELECT` query.
    *   **Solution (Deprecated):** `db.php`'s `executeQuery` function was temporarily modified to utilize `mysqli::multi_query`. This allowed a single API call from Angular to send a query string containing both `SET SESSION group_concat_max_len = 100000;` and the main `SELECT` statement. This is no longer the case as `multi_query` has been removed in favor of a more stable aggregation pattern.
    *   **Security Implication:** The use of `mysqli::multi_query` significantly increases security risks by allowing arbitrary SQL statements. This approach has been deprecated and removed. The `db.php` file now uses the standard `mysqli::query` method.

*   **`db.php` Now Supports Prepared Statements with Parameters:**
    *   **Problem:** Initially, `db.php` directly executed SQL queries without handling parameters, leading to SQL errors when placeholders (`?`) were used from the Angular frontend.
    *   **Solution:** The `executeQuery` function in `db.php` has been refactored to support prepared statements. It now accepts an optional `$params` array.
        *   If `$params` is provided, `db.php` uses `mysqli::prepare`, `mysqli::bind_param`, and `mysqli::execute` to safely execute the query with the given parameters. This mitigates SQL injection risks for queries using parameters.
        *   If `$params` is empty, `db.php` falls back to direct query execution using `$mysqli->query()`, similar to its previous behavior.
    *   **CRITICAL SECURITY WARNING REITERATED:** While the addition of prepared statements improves security for parameterized queries, the fundamental design of `db.php` (accepting arbitrary SQL query strings from the client) remains a **severe SQL Injection vulnerability** if non-parameterized queries are sent, or if the client can manipulate the SQL string in any way. For any production usage, `db.php` *must* be refactored to use prepared statements with whitelisted queries or an ORM, and restrict allowed operations.

*   **Data Aggregation Strategy: From Complex SQL to Stable PHP**
    *   **Problem:** Initial attempts to create a nested JSON structure (categories with their courses) directly within SQL proved to be brittle and error-prone.
        1.  **`GROUP_CONCAT` with `JSON_OBJECT`:** While functional for simple cases after increasing `group_concat_max_len`, this approach can still be fragile.
        2.  **`JSON_ARRAYAGG`:** A more modern approach, `JSON_ARRAYAGG`, was attempted. However, this resulted in a 500 Internal Server Error, indicating that the server's MySQL version was likely older than 5.7 and did not support this function. This highlighted the risk of using version-dependent SQL features.
        3.  **Complex `GROUP_CONCAT` with `CONCAT`:** A third attempt using a complex `GROUP_CONCAT` query also failed silently, likely due to subtle syntax incompatibilities with the server's SQL parser.
    *   **BEST PRACTICE & FINAL SOLUTION:** The most robust and compatible solution was to **offload the aggregation logic from the database to the application layer (PHP)**.
        1.  **Simplified SQL:** The Angular `ApiService` now sends a simple `SELECT` query with a `LEFT JOIN` that returns flat data (one row per course, with its category info).
        2.  **PHP-Side Aggregation:** The `db.php` script now contains logic that checks for a specific "magic comment" (`/* AGGREGATE_COURSES */`) in the query. If present, it iterates through the flat result set and programmatically builds the nested JSON structure (grouping courses into a `courses` array for each category).
    *   **Key Takeaway:** For creating nested JSON structures from one-to-many relationships, **prefer a simple SQL query and perform the data aggregation in the server-side language (PHP)**. This approach is more portable across different database versions, easier to debug, and less prone to silent failures than complex SQL string and JSON manipulation.

*   **Frontend Handling (Angular):**
    *   **`JSON.parse` Pitfall:** The Angular `HttpClient` automatically parses the JSON response from the API into JavaScript objects. A common mistake is to try and `JSON.parse()` this data again in the component. This will fail with a `SyntaxError: "[object Object]" is not valid JSON` because the data is already an object, not a JSON string.
    *   **Current Implementation:** With the PHP backend now providing a perfectly structured JSON response, the Angular `home.component.ts` simply receives the data and uses it directly, with no need for any client-side parsing.

## Frontend Application (`/angular`)

The frontend is an Angular application. We will be heavily utilizing Angular Material for UI components and its icon library.

### Authentication and User ID

The `AuthService` (`angular/src/app/services/auth.service.ts`) is responsible for managing user authentication and providing access to the `user_id`.

**Accessing `user_id`:**
To retrieve the current user's ID within any Angular component or service:
1.  **Inject `AuthService`:** Ensure `AuthService` is injected into the constructor of your component or service.
    ```typescript
    import { AuthService } from '../services/auth.service'; // Adjust path as necessary

    // ...

    constructor(private authService: AuthService) { }
    ```
2.  **Call `getUserId()`:** Use the `getUserId()` method to obtain the ID.
    ```typescript
    const userId = this.authService.getUserId();
    if (userId) {
      // Use the userId
      console.log('Current User ID:', userId);
    } else {
      console.warn('User ID not available or user not logged in.');
    }
    ```
The `getUserId()` method reads the `user_id` from `localStorage` using the key `user_id`. It will return `null` if the `user_id` is not found or `localStorage` is unavailable.

### Login Security (Authentication Flow)

To ensure secure access to the application, a login security mechanism has been implemented. This system checks if a user is authenticated before allowing access to protected routes.

**Flow:**
1.  **Check for `user_id`:** Upon application load, or when navigating to a protected route, the system checks for the presence of a `user_id` in the browser's `LocalStorage`. This `user_id` is expected to be stored under the domain `https://premierebarreview.com`.
2.  **Redirection:** If `user_id` is *not* found, the user is immediately redirected to the login page at `https://premierebarreview.com/bar-review/login`.
3.  **Access Granted:** If `user_id` *is* found, the user is considered authenticated and can proceed to the requested protected route.

**Implementation Details:**

*   **`AuthService` (`angular/src/app/services/auth.service.ts`):**
    *   This service is responsible for determining the user's authentication status.
    *   It provides an `isLoggedIn()` method that checks `LocalStorage` for the `user_id` key.
    *   It also contains the `redirectToLogin()` method, which performs the redirection to the designated login URL.
    *   The `LOGIN_URL`, `LOCAL_STORAGE_USER_ID_KEY`, and `LOCAL_STORAGE_DOMAIN` are defined within this service for easy management.

*   **`AuthGuard` (`angular/src/app/auth.guard.ts`):**
    *   This is an Angular route guard that implements the `CanActivate` interface.
    *   Before a protected route is activated, the `canActivate` method of `AuthGuard` is called.
    *   It utilizes the `AuthService.isLoggedIn()` method. If the user is not logged in, it calls `AuthService.redirectToLogin()` and prevents access to the route. If the user is logged in, it allows navigation to the route.

*   **Routing Configuration (`angular/src/app/app.config.ts`):**
    *   The application's routes are defined in `app.config.ts`.
    *   The root path (`''`) is configured to redirect to `'/home'`.
    *   The `'/home'` route, which now loads the `HomeComponent`, is protected by the `AuthGuard` using the `canActivate` property. This ensures that the main content of the application (displayed by `HomeComponent`) is only accessible to authenticated users.

*   **`App` Component (`angular/src/app/app.ts`) and `HomeComponent` (`angular/src/app/home/home.component.ts`):**
    *   The original `App` component has been refactored to serve as a high-level shell, primarily containing a `<router-outlet>` to display routed components. It no longer holds the direct content or data-fetching logic.
    *   A new `HomeComponent` has been created. All the initial homepage functionality, including fetching and displaying course data, has been moved into this component. This separation allows the `AuthGuard` to effectively protect the core application content.

### Database Interaction Notes

Angular Material has been successfully integrated for UI components and Material Icons are enabled.

**Installation and Setup:**
1.  **Install Angular Material:**
    ```bash
    cd angular
    ng add @angular/material --skip-confirmation
    ```
    This command handles most of the setup, including adding a theme file and updating `angular.json` and `index.html`.

2.  **Enable Animations:**
    Ensure `provideAnimations()` is included in the `providers` array in `angular/src/app/app.config.ts`.
    ```typescript
    // angular/src/app/app.config.ts
    import { provideAnimations } from '@angular/platform-browser/animations';
    // ... other imports

    export const appConfig: ApplicationConfig = {
      providers: [
        // ... other providers
        provideAnimations(),
      ]
    };
    ```

3.  **Import Material Modules (Standalone Components):**
    For standalone components, import specific Material modules into the `imports` array of the component where they are used. For global availability, use `importProvidersFrom` in `app.config.ts`.
    Example for `app.config.ts` (for global availability of `MatButtonModule` and `MatIconModule`):
    ```typescript
    // angular/src/app/app.config.ts
    import { importProvidersFrom } from '@angular/core';
    import { MatButtonModule } from '@angular/material/button';
    import { MatIconModule } from '@angular/material/icon';
    // ... other imports

    export const appConfig: ApplicationConfig = {
      providers: [
        // ... other providers
        importProvidersFrom(MatButtonModule, MatIconModule)
      ]
    };
    ```
    Example for `app.ts` (standalone component):
    ```typescript
    // angular/src/app/app.ts
    import { MatButtonModule } from '@angular/material/button';
    import { MatIconModule } from '@angular/material/icon';
    // ... other imports

    @Component({
      // ...
      standalone: true,
      imports: [
        // ... other imports
        MatButtonModule,
        MatIconModule
      ],
      // ...
    })
    export class App { /* ... */ }
    ```

4.  **Material Icons and Fonts:**
    The `ng add @angular/material` command typically adds the necessary links for Material Icons and Roboto font to `angular/src/index.html`. Verify the following lines are present in the `<head>` section:
    ```html
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    ```
    Material icons can be used in templates with the `mat-icon` component: `<mat-icon>home</mat-icon>`.

**Usage Example:**
```html
<!-- angular/src/app/app.html -->
<button mat-flat-button color="primary">
  <mat-icon>home</mat-icon>
  Material Button
</button>
```

**Initial Homepage Functionality:**
The Angular application's initial homepage will feature test functionalities for both the `db.php` and `ai.php` APIs.
*   **Database Test:** Display results from a simple `SELECT` query on an existing table `diag_ans` with columns: `id`, `user_id`, `batch_id`, `question_id`, `answer`, `score`, `feedback`, `date_created`.
*   **AI Test:** Allow for a simple AI call using the `ai.php` endpoint.

**Build Process:**
*   The `npm run build` command will compile the Angular application.
*   The build process will move the compiled files directly into the `/bar` directory for serving (accessible at `/mock/bar/`).

## Development Guidelines

*   **Development Workflow:**
    *   **Environment:** Development and local testing occur on your machine. However, integration and functional testing of the application (Angular frontend interacting with PHP backend) are performed on a remote server.
    *   **Build & Push:** After making any significant code changes in the Angular application, always run `npm run build` from the `/angular` directory. Subsequently, all changes, including the newly built files within the `/bar` directory, must be committed and pushed to the Git repository.
    *   **Deployment & Testing:** The remote server will then pull the latest changes (e.g., via `gitpull.php`) to update the application for testing. This ensures the deployed version always reflects the latest built and pushed code.
    *   **Automating Build and Staging:** To streamline the build and staging process for Angular changes, a convenience script `build_and_stage.sh` has been created in the project root. This script automates running `npm run build` within the `/angular` directory and then stages the resulting files in the `/bar` directory for Git.
        *   **Usage:** After making changes in the `/angular` directory, execute the script from the project root:
            ```bash
            ./build_and_stage.sh
            ```
        *   **Next Steps:** After the script completes, the `/bar` directory will be staged. You can then proceed to commit and push your changes:
            ```bash
            git commit -m "feat: Describe your Angular changes"
            git push
            ```
    *   **Agent-Managed Build and Deployment:** The AI agent (Gemini) is responsible for automatically building the Angular application and pushing changes to the remote repository. After the agent completes any code modifications in the `/angular` directory, or when a build and deployment is required to verify changes or gather logs, it will perform the following steps:
        1.  Execute `./build_and_stage.sh` from the project root to build the Angular application and stage the `/bar` directory.
        2.  Automatically commit the changes with an appropriate commit message.
        3.  Automatically push the committed changes to the `origin/main` branch.
        This ensures that the remote repository always reflects the latest built code after agent-driven changes. This behavior overrides the agent's default instruction to not push without explicit user consent for modifications within the Angular application context.
*   **Strict Typing:** Implement strict typing throughout the Angular project, utilizing detailed interfaces and classes. This helps catch issues during `npm run build` and improves code quality.
*   **Proactive Documentation:** Maintain `GEMINI.md` as a living document. Any significant setup steps, encountered challenges, or solutions (especially related to project configurations or library integrations) should be added to this file to serve as a knowledge base and prevent re-solving the same issues.

## Development Plan




1.  **Project Setup:**

    *   [ ] Initialize a Git repository and push to `git@github.com:cyddalupan/mock-bar.git`.

    *   [x] Create `.env` file with dummy credentials.

2.  **API Development (`/api`):**

    *   [x] Implement `db.php` to securely handle database connections and queries, including `.env` loading and a basic `executeQuery` function.

    *   [ ] Create a database and `diag_ans` table for testing.

    *   [x] Implement `ai.php` to handle requests to the OpenAI API, including `.env` loading and a basic `callOpenAI` function.


    *   [ ] Implement `gitpull.php` to securely pull the latest changes from the Git repository.

3.  **Frontend Development (`/angular`):**

    *   [ ] Set up the basic Angular application structure.

    *   [ ] Create Angular services to communicate with the `/api` backend, handling plain JSON payloads.

    *   [ ] Implement the initial homepage UI:

        *   Display results from a `SELECT` query to the `diag_ans` table via `db.php`.

        *   Provide an interface to trigger an AI call via `ai.php` and display the response.



4.  **Build & Deployment (`/angular` & `/bar`):**

    *   [ ] Configure the Angular build process (`angular.json`) to output the built files to the `/bar` directory.

    *   [ ] Verify the `npm run build` command successfully moves compiled files to `/bar`.

5.  **Refinement & Testing (Angular Focus):**

    *   [x] Thoroughly test both API endpoints from the Angular frontend.
    *   [ ] Ensure robust error handling is implemented in the Angular frontend.
    *   [ ] Document API endpoints and usage (with explicit security warnings for `db.php`).
