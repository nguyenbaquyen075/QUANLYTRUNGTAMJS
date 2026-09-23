# Contributing

## Branches

`main` is protected: no direct pushes, no force pushes, no branch deletion.
Every change arrives through a pull request.

Branch names follow `<type>/<short-description>` in English, kebab-case:

```
feat/mock-test-backend
fix/checkout-invoice-code
chore/setup-git-workflow
docs/deploy-guide
```

Use the same `<type>` values as the commit types below.

## Commits

Commit messages are written in **English** and follow
[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body: why the change was needed, what it affects>
```

| Type | Use for |
|------|---------|
| `feat` | a new capability for a user |
| `fix` | a bug fix |
| `perf` | a change made for speed or resource use |
| `refactor` | restructuring with no behaviour change |
| `style` | layout, colours, spacing — no logic change |
| `docs` | documentation and specs |
| `test` | tests only |
| `build` | build setup, dependencies |
| `ci` | GitHub Actions and other CI config |
| `chore` | everything else (config, housekeeping) |

Scopes used in this repo: `admin`, `auth`, `course`, `class`, `db`,
`deploy`, `exam`, `mock-test`, `home`, `lesson`, `notification`, `payment`,
`product`, `schedule`, `security`, `site-content`, `student`, `teacher`,
`test`, `tournament`, `ui`, `upload`.

Rules:

- Subject in the imperative, lower case, no trailing period.
- Say what changed for the user, not which file was edited.
- One logical change per commit. Do not bundle a refactor with a fix.
- Put the reasoning in the body when the subject cannot carry it —
  especially for bug fixes, note what was broken and why.

## Pull requests

1. Branch off an up-to-date `main`.
2. Push the branch and open a PR; the template asks for a summary and a
   test plan.
3. CI (`build`) must pass: it installs both workspaces, runs the backend
   tests and builds the frontend.
4. Merge through GitHub. `main` cannot be pushed to directly.

## Releases

Releases are tagged on `main` after the release PR merges:

```bash
git checkout main && git pull
git tag -a v1.0.0 -m "v1.0.0"
git push github v1.0.0
```

Version numbers follow [Semantic Versioning](https://semver.org/). The
`version` field in `package.json`, `backend/package.json` and
`frontend/package.json` is bumped in a `chore/release-x.y.z` branch before
the tag is created.

## Running locally

```bash
npm install          # installs root, backend and frontend
npm run seed         # seeds demo data
npm run dev          # backend + frontend together
npm test --prefix backend
```
