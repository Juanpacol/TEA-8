# Infrastructure

A short map of where TEA-8 runs.

## The picture

```
GitHub (main)
   ├── web/ changed ──► Vercel ──► public site (preview per PR, production from main)
   └── api/ changed ──► GitHub Actions ──► Cloud Run service "tea-api"
                           (Docker build, push to Artifact Registry, deploy)
```

- **Web:** Vercel project `tea-8`, connected to this repository. Production: https://tea-8.vercel.app (public, from `main`). Every pull request gets a preview URL; previews require a Vercel login. `VITE_API_URL` points the web app to the API.
- **API:** Google Cloud Run, project `tea-8-hackathon`, region `us-central1`.
- **Images:** Artifact Registry repository `tea-api`, keeping the 2 most recent images.
- **Secrets:** Secret Manager holds `meta-model-api-key`. The deploy workflow injects it into Cloud Run as `META_MODEL_API_KEY`.
- **Deploys:** the workflow `.github/workflows/deploy-api.yml` runs on merge to `main` when `api/` changes. CI (`.github/workflows/ci.yml`) runs the web, api and pipeline checks on every pull request.

Cloud Run settings: max 1 instance, min 0, 1 vCPU, 256 MiB, concurrency 20, 30 s timeout. The API allows requests only from `https://tea-8.vercel.app` (CORS) and limits requests per client, overall and per day.

## How GitHub gets permission (no stored keys)

GitHub proves its identity to Google with a short-lived token (Workload Identity Federation). Nothing secret is stored in GitHub.

- Service account: `gh-deployer@tea-8-hackathon.iam.gserviceaccount.com`.
- It only trusts repository `Juanpacol/TEA-8` on branch `main`.
- Its roles: `run.developer`, `artifactregistry.writer` (only on `tea-api`), and `serviceAccountUser` on the default compute account.

## Quick checks

```bash
gcloud run services list --project tea-8-hackathon
curl https://tea-api-p7nky5zeba-uc.a.run.app/health   # should return {"status": "ok", ...}
```

## Still to do

- DEP-12: request the FortiGuard web filter classification for the site and open it in a private window.
- Preview deployments cannot call `/ask`: CORS only allows the production domain. Add the preview domain to `ALLOWED_ORIGINS` if previews need it.
