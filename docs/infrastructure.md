# Infrastructure

A short map of where TEA-8 runs.

## The picture

```
GitHub (main)
   ├── web/ changed ──► Vercel ──► public site (preview per PR, production from main)
   └── api/ changed ──► GitHub Actions ──► Cloud Run service "tea-api"
                           (Docker build, push to Artifact Registry, deploy)
```

- **Web:** Vercel. Not connected yet (DEP-2).
- **API:** Google Cloud Run, project `tea-8-hackathon`, region `us-central1`.
- **Images:** Artifact Registry repository `tea-api`, keeping the 2 most recent images.
- **Secrets:** Secret Manager (none stored yet).
- **Deploys:** the workflow `.github/workflows/deploy-api.yml` runs on merge to `main` when `api/` changes. CI for the web app is `.github/workflows/ci.yml`.

Cloud Run settings: max 1 instance, min 0, 1 vCPU, 256 MiB, concurrency 20, 30 s timeout.

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

- DEP-2 and DEP-3: connect the repository to Vercel.
- DEP-8: store the AI API key in Secret Manager.
- DEP-9: CORS and rate limiting on the API.
