# Build and staged npm releases

This repository independently releases **@eyeauras/youtrack-cli**, executable `youtrack-cli`.
The installed CLI requires Node.js22+; repository verification uses Node.js24+ and .NET10.
TeamCity uses `node:24-bookworm`. Product and Core versions are independent: read the product
version from package.json, synchronized with package-lock.json and src/cli.ts by Cake SetVersion.
Core remains the exact published **0.7.1** dependency and lock integrity. Never publish Factory
packages or substitute a workspace/local Core build as part of a product release.

Core0.7.1 provenance remains the approved
[optional provenance: Core release](https://github.com/iXab3r/EyeAuras.CliFactory/releases/tag/v0.7.1)
and revision bf79b80636bcdd790bbd6c25648842ae5213f267. Its VerifyRegistry33314 receipt verified
registry/install/archive identity (Core archive SHA-1 b075dc6eeef9a778d3d5317b24d7a36b50ea7632).
That Core approval and archive are not approval or evidence for this product's next publication.
The Cake driver attribution is in [build/NOTICE](../build/NOTICE).

## Verification and candidate preparation

```sh
npm ci
npm test
npm run test:coverage
npm run test:package
dotnet run --project build -- --target Verify
```

`npm test` is the ordinary offline suite. `test:coverage` builds and runs that suite once with
request tracing, traverses actual handlers and regenerates the frozen operation mapping twice.
It compares JSON/TSV/summary with tracked artifacts, ignoring only the documented commit-lineage
field. Drift fails, retains ignored evidence under the verified root's `.workspace/workstreams/`
and never overwrites tracked files. Explicitly regenerate/review artifacts after a command/test
change. Public source replay uses separate hash-pinned audit scripts; CI does no schema crawl or
live-service proof. See [coverage reproduction](rest-api-coverage/README.md).

Cake Verify runs clean registry-based npm ci, this single traced offline coverage suite,
installed-package checks and release-safety checks. It does not run npm test a second time.
Installed checks use disposable npm configs/prefixes/cache, synthetic AppData/fetch/memory secrets
and exact Core0.7.1 resolved inside the prefix. They exercise SDK exports, actual executable/shims,
JSON/persistent RPC/EPIPE, paging, credential lifecycle and native contracts without real services.
Tests, source, local proof, audit evidence and build tools are excluded from the npm archive.

Select a product version through the existing driver on the release work branch, then rerun
verification and independent review. For example, after the owner has selected the release version:

```text
dotnet run --project build -- --target SetVersion --release-version <product-version>
```

SetVersion synchronizes package/lock/CLI values. It does not upgrade Core or publish anything.
The consolidated0.9.0 source includes M02–M08 and the stabilization workflows;0.8.0 was the M01
release. Current registry metadata, not a static guide example, identifies the latest published
version. Record exactly which platforms/Node versions were checked. Offline Linux checks do not
prove Windows/macOS behavior, deployed YouTrack versions, Cloud/Server editions or server rights.
Any live proof is separate, explicitly authorized, fixed ReadOnly and refuses CI; it is not a
mandatory merge gate and is never silently replaced by mocked availability claims.

## Exact archive and source identity

After reviewed merge and exact-main Verify, select the clean current remote main commit:

```sh
release_version="$(node -p "require('./package.json').version")"
release_revision="$(git rev-parse HEAD)"
RELEASE_REVISION="$release_revision" dotnet run --project build -- --target DryRun --release-version "$release_version" --dry-run
```

Pack first verifies, creates this product's tarball, records commit/SHA-1/SHA-512 in
output/release/release-manifest.json, and tests those exact bytes. `npm run test:package --
--tarball /absolute/archive.tgz` checks a supplied archive. `npm run test:registry --
<product-version>` checks an actually published version with isolated registry installation.

Every release target requires the full40-character RELEASE_REVISION to match the checkout.
Live modes require a clean tree; Stage additionally verifies current remote main. RELEASE_REVISION
is a guard, not a checkout selector. DryRun only calls npm publish with --dry-run. Stage/Release
use npm stage publish, never direct publication; Release with --dry-run follows DryRun.
Stage --dry-run rejects before staging. Cake --dryrun prints a task plan, not check evidence.
--exclusive is a reviewed recovery mechanism, not fresh Verify/Pack evidence.

## TeamCity jobs and credentials

Existing identities remain:

| Object | Identity |
|---|---|
| Project | EyeAuras_YouTrackCli |
| Public anonymous main VCS root | EyeAuras_YouTrackCli_Repo |
| Main-only automatic verification | EyeAuras_YouTrackCli_Verify |
| Manual stage/registry verification | EyeAuras_YouTrackCli_NpmStage |
| Exclusive release lock | youtrack-cli-release writeLock, quota1 |

Both jobs use the product VCS root and build/teamcity.sh in node:24-bookworm on Linux. Verify's
trigger is main-only; branch Verify may be queued manually. NpmStage has no trigger/upstream
dependency and defaults to dry-run. Explicitly supply the product version in its build-number
label; historical provisioning labels do not select a release version. The wrapper reads the
checked-out package version and RELEASE_REVISION guards that checkout.

Protected npm.token/env.NPM_TOKEN and inherited env.GITHUB_TOKEN bindings stay inside TeamCity.
Never read/resolve them, change token permissions, shared VCS roots, unrelated jobs or CI policy.
The wrapper strips ambient credentials/settings before bootstrap; Cake uses private temporary npm
configs. Only stage receives NPM_TOKEN. GitHub release requests use a private temporary header
file, not token-bearing argv or URLs. Temporary auth files are removed on exit. No GitHub Actions
or PowerShell infrastructure is added. See build/NOTICE for the original adapted driver source.

Use the existing job after selecting exact main, with the actual product version in labels:

```text
teamcity-cli jobs run EyeAuras_YouTrackCli_NpmStage --param env.RELEASE_MODE=--dry-run --param env.RELEASE_REVISION=<full-main-sha> --param release.build=<product-version>-dry-run
teamcity-cli jobs run EyeAuras_YouTrackCli_NpmStage --param env.RELEASE_MODE=--stage --param env.RELEASE_REVISION=<full-main-sha> --param release.build=<product-version>-stage
# Only after owner approval of the exact verified npm stage:
teamcity-cli jobs run EyeAuras_YouTrackCli_NpmStage --param env.RELEASE_MODE=--verify-registry --param env.RELEASE_REVISION=<full-main-sha> --param release.build=<product-version>-verify
```

Omit --branch for release jobs. If main advances, select the original reviewed checkout revision in
TeamCity custom settings for registry verification; do not change the receipt to match new code.
Never queue NpmStage merely as a branch check. Stage only from reviewed clean current main.

## Owner approval and recovery

DryRun writes dry-run-verified. Stage refuses an existing stage for the same version, writes
staged-unverified with the returned stage ID before metadata/download verification, then downloads
and compares the staged archive's SHA-512 with the tested manifest. Only a matching stage becomes
awaiting-2fa-approval. Retain output/release/* in the npm-release.zip artifact, including failures.
A generic request to release or a successful build does not approve an npm stage.

**Only the owner approves that exact verified product stage in npm Staged Packages with2FA.**
Present package/version/stage ID/tested digest/source revision for that concrete approval. Never
approve staged-unverified,0.0.0-stage or another ID. After approval, VerifyRegistry checks registry
version/latest/integrity and installed behavior, then creates/verifies GitHub Release v<product-version>
at the packed source commit with matching tarball/manifest. Existing mismatching tags/assets fail;
matching assets may be retained and missing ones resumed. These are provenance records, not OIDC
attestations. Close the release story only after registry/install/release evidence is verified.

After a lost staging response, inspect npm stage list @eyeauras/youtrack-cli --json and saved receipts
before any retry. On E403/E404 stop for owner access diagnosis; never widen credentials, disable2FA,
approve/reject a stage or switch to direct publishing. Read the
[optional API reference: npm staged publishing](https://docs.npmjs.com/staged-publishing/).
