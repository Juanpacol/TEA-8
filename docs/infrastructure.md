# Infrastructure

A short map of where TEA-8 runs and what it costs. Goal: stay inside the free tiers.

## The picture

```
GitHub (main)
   ├── web/ changed ──► Vercel ──► public site (preview per PR, production from main)
   └── api/ changed ──► GitHub Actions ──► Cloud Run service "tea-api"
                           (Docker build, push to Artifact Registry, deploy)
```

- **Web:** Vercel, free Hobby plan. Not connected yet (DEP-2).
- **API:** Google Cloud Run, project `tea-8-hackathon`, region `us-central1`.
- **Images:** Artifact Registry repository `tea-api`.
- **Secrets:** Secret Manager (none stored yet).
- **Deploys:** the workflow `.github/workflows/deploy-api.yml` runs on merge to `main` when `api/` changes. CI for the web app is `.github/workflows/ci.yml`.

## How GitHub gets permission (no stored keys)

GitHub proves its identity to Google with a short-lived token (Workload Identity Federation). Nothing secret is stored in GitHub.

- Service account: `gh-deployer@tea-8-hackathon.iam.gserviceaccount.com`.
- It only trusts repository `Juanpacol/TEA-8` on branch `main`.
- Its roles: `run.developer`, `artifactregistry.writer` (only on `tea-api`), and `serviceAccountUser` on the default compute account.

## Cost guardrails

| Guardrail | Value |
|---|---|
| Cloud Run max instances | 1 |
| Cloud Run min instances | 0 (scales to zero) |
| Size | 1 vCPU, 256 MiB, concurrency 20, 30 s timeout |
| Billing mode | per request (the one covered by the free tier) |
| Image cleanup | keeps the 2 most recent images |
| Budget alert | 4,000 COP (about 1 USD), notifies at 50%, 90%, 100% |

Free tier used (per month, per billing account): 180,000 vCPU-seconds, 360,000 GiB-seconds and 2 million Cloud Run requests; 0.5 GiB Artifact Registry; 6 secret versions and 10,000 secret accesses; 1 GiB outbound traffic in North America.

Known limits:
- The budget alert **notifies, it does not stop spending**.
- The free tier is shared by every project on the same billing account, including Ether.
- The public endpoint needs rate limiting before the URL is shared (DEP-9).
- The AI API, when chosen, is billed separately and is not part of this free tier.

## Quick checks

```bash
gcloud run services list --project tea-8-hackathon          # services and max scale
gcloud artifacts repositories list --project tea-8-hackathon # image storage size
curl https://tea-api-p7nky5zeba-uc.a.run.app/health          # should return {"status": "ok", ...}
```

## Recreate from scratch

Run once, with the personal Google account active. Order matters.

```bash
P=tea-8-hackathon; N=540884130312
gcloud config set project $P
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com cloudbuild.googleapis.com billingbudgets.googleapis.com \
  iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com

# Image repository with cleanup (policy file: keep latest 2, delete the rest)
gcloud artifacts repositories create tea-api --repository-format=docker --location=us-central1
gcloud artifacts repositories set-cleanup-policies tea-api --location=us-central1 \
  --policy=cleanup.json --no-dry-run

# Budget (the billing account is in COP)
gcloud billing budgets create --billing-account=<BILLING_ACCOUNT_ID> \
  --display-name="tea-8-hackathon-4000cop" --budget-amount=4000COP \
  --filter-projects=projects/$N \
  --threshold-rule=percent=0.5 --threshold-rule=percent=0.9 --threshold-rule=percent=1.0

# GitHub deployer identity
gcloud iam service-accounts create gh-deployer
gcloud iam workload-identity-pools create github --location=global
gcloud iam workload-identity-pools providers create-oidc github-oidc --location=global \
  --workload-identity-pool=github --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
  --attribute-condition="assertion.repository=='Juanpacol/TEA-8' && assertion.ref=='refs/heads/main'"
SA=gh-deployer@$P.iam.gserviceaccount.com
gcloud iam service-accounts add-iam-policy-binding $SA --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$N/locations/global/workloadIdentityPools/github/attribute.repository/Juanpacol/TEA-8"
gcloud projects add-iam-policy-binding $P --member=serviceAccount:$SA --role=roles/run.developer
gcloud artifacts repositories add-iam-policy-binding tea-api --location=us-central1 \
  --member=serviceAccount:$SA --role=roles/artifactregistry.writer
gcloud iam service-accounts add-iam-policy-binding $N-compute@developer.gserviceaccount.com \
  --member=serviceAccount:$SA --role=roles/iam.serviceAccountUser
```

The first image was built with Cloud Build, which needed the default compute account to have `roles/cloudbuild.builds.builder`. Normal deploys build in GitHub Actions and do not need it.

## Still to do

- DEP-2 and DEP-3: connect the repository to Vercel.
- DEP-8: store the AI API key in Secret Manager.
- DEP-9: CORS and rate limiting on the API.
