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
The `db.php` and `ai.php` files are currently considered stable. Future development efforts and code changes should primarily focus on the Angular frontend.

**Security:**
*   Communication between the Angular frontend and the PHP backend will be via plain JSON over HTTPS.
*   Sensitive data, such as API keys and database credentials, will be stored in a `.env` file at the project root. This file should not be committed to version control.

## Frontend Application (`/angular`)

The frontend is an Angular application. We will be heavily utilizing Angular Material for UI components and its icon library.

## Database Schema (`SCHEMA.md`)

The database schema is documented in `SCHEMA.md`.

### Angular Material Design and Fonts

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
