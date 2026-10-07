# Sample API

## API Endpoints

- `GET /health` - Health check
- `GET /version` - API version
- `GET /info` - API information
## Branching Strategy

- `main` - Protected production/release branch. Changes are merged through pull requests.
- `develop` - Integration branch for completed features.
- `feature/<name>` - Short-lived feature branches created from `develop`.

## Git Workflow Commands

```bash
git switch develop
git pull origin develop

git switch -c feature/<name>

git add .
git commit -m "feat: add feature"
git commit -m "docs: document feature"

git push -u origin feature/<name>

# Create PR: feature/<name> -> develop

git switch develop
git pull origin develop

# Create PR: develop -> main

git switch main
git pull origin main

git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
