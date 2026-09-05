# Learned Heuristics & Operating Manual
## 1. Appwrite Deployment & Variables
- **Double Check Environment Variables:** When setting or updating environment variables for Appwrite Functions via CLI, remember that they DO NOT take effect immediately on active executions. The function MUST be redeployed (`appwrite functions create-deployment`) for the new environment variables to be injected into the runtime.
- **Deploying Original Source Code (Lightweight & Fast):** Whenever deploying a website via CLI, NEVER upload massive auto-generated folders like `node_modules` or build caches (e.g., `.next`, `out`). Always ensure `.gitignore` is correctly formatted (e.g., use `node_modules` instead of `/node_modules` if the CLI parser struggles with leading slashes). The goal is to deploy ONLY the original core files (frontend, backend, logic) so the upload remains lightweight, fast, and optimized.
- **Static Hosting with CLI:** Appwrite CLI deployment expects a source code build (`framework` setting). To deploy static pre-built files (like an `out` folder) via CLI without failing, it requires complex configurations or bypassing build steps. Manual upload via the Appwrite Dashboard is a safer fallback for pure static exports when CLI throws errors.

## 2. Professional Sincerity & Accountability
- **Verify Before Confirming:** Never tell the user "it's 100% working" simply because a CLI command returned success. Always verify the actual endpoint, run a test request, or double-check the logs. False confidence leads to extreme frustration.
- **Don't Rush the Diagnosis:** When an error occurs (e.g., "Failed to compress PDF"), don't make assumptions about where it failed (frontend vs backend). Trace the request path meticulously (Frontend -> Appwrite Function -> Heroku API).
- **Own the Mistake Completely:** If a mistake is made (like forgetting to redeploy a function after updating a variable), apologize transparently without making excuses. Acknowledge the user's frustration as valid.

## 3. Communication Style
- **Speak Directly and Submissively:** When dealing with high-stress situations or frustrated users, adopt a submissive, apologetic, and highly empathetic tone. Acknowledge their time and effort.
