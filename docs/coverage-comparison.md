# REST coverage comparison

How much of the official YouTrack REST API each tool can call. Measured 2026-11-10.

| Tool | Reachable operations | ReadOnly (140) | Update (142) |
|---|---:|---:|---:|
| `youtrack-cli` 0.9 (this package) | 282 of 282 (100%) | 140 | 142 |
| `yt` 0.22.2 (Python `youtrack-cli` from PyPI) | 61 of 282 (22%) | 34 | 27 |

## By API area

Percent of operations reachable, with the count in brackets.

| API area | Operations | youtrack-cli 0.9 | yt 0.22.2 |
|---|---:|---:|---:|
| Issues | 49 | 100% (49) | 43% (21) |
| Search, commands, saved queries | 8 | 100% (8) | 0% (0) |
| Tags and link types | 11 | 100% (11) | 27% (3) |
| Activity and work items | 5 | 100% (5) | 20% (1) |
| Projects | 31 | 100% (31) | 26% (8) |
| Knowledge base articles | 29 | 100% (29) | 45% (13) |
| Agile boards and sprints | 10 | 100% (10) | 30% (3) |
| Custom fields | 9 | 100% (9) | 11% (1) |
| Field value bundles | 64 | 100% (64) | 0% (0) |
| Users and groups | 22 | 100% (22) | 18% (4) |
| Roles, permissions, organizations | 15 | 100% (15) | 0% (0) |
| Time tracking settings | 8 | 100% (8) | 13% (1) |
| Server settings, backups, telemetry | 21 | 100% (21) | 29% (6) |
| **All operations** | **282** | **100% (282)** | **22% (61)** |

## By official resource group

Reachable operation counts.

| Resource group | Operations | youtrack-cli 0.9 | yt 0.22.2 |
|---|---:|---:|---:|
| `activities` | 2 | 2 | 0 |
| `activitiesPage` | 1 | 1 | 0 |
| `admin.databaseBackup` | 5 | 5 | 0 |
| `admin.globalSettings` | 14 | 14 | 6 |
| `admin.organizations` | 5 | 5 | 0 |
| `admin.projects` | 31 | 31 | 8 |
| `admin.telemetry` | 1 | 1 | 0 |
| `admin.timeTrackingSettings` | 8 | 8 | 1 |
| `agiles` | 10 | 10 | 3 |
| `articles` | 29 | 29 | 13 |
| `assignedRoles` | 4 | 4 | 0 |
| `bundles.build` | 10 | 10 | 0 |
| `bundles.enum` | 10 | 10 | 0 |
| `bundles.ownedField` | 10 | 10 | 0 |
| `bundles.state` | 10 | 10 | 0 |
| `bundles.user` | 14 | 14 | 0 |
| `bundles.version` | 10 | 10 | 0 |
| `commands` | 2 | 2 | 0 |
| `customFields` | 9 | 9 | 1 |
| `groups` | 9 | 9 | 0 |
| `issueLinkTypes` | 5 | 5 | 1 |
| `issues` | 48 | 48 | 21 |
| `issuesGetter` | 1 | 1 | 0 |
| `metadata` | 1 | 1 | 0 |
| `permissions` | 1 | 1 | 0 |
| `roles` | 5 | 5 | 0 |
| `savedQueries` | 5 | 5 | 0 |
| `search` | 1 | 1 | 0 |
| `tags` | 6 | 6 | 2 |
| `users` | 13 | 13 | 4 |
| `workItems` | 2 | 2 | 1 |

## Method

- **Denominator.** The frozen census of 282 operations (HTTP method + path template) from the
  pinned JetBrains OpenAPI document and reference pages; see the [audit](rest-api-coverage/README.md)
  and [official operation list](rest-api-coverage/official-operations.json).
- **Reachable** means a shipped command issues that exact method and path. It does not measure
  every query parameter, payload field, server edition or remote permission.
- **youtrack-cli 0.9** comes from the [current per-operation map](rest-api-coverage/current/README.md),
  where each operation also has full query-control coverage and offline request evidence.
- **yt 0.22.2** was measured by reading the published wheel's source without running it. Each
  HTTP call reachable from a `yt` command was normalized and matched to the same 282 identities.

## Caveats for the yt column

- It is a static reading of one version, not a statement about later releases.
- Calls made only as a step inside another command (attachment metadata before a download, field
  discovery before an issue write, `users/me` during sign-in) are counted as reachable.
- 12 more operations exist in shipped modules that no `yt` command calls; counting them would
  give 73 of 282 (26%).
- `yt` also issues 18 calls outside this denominator: 5 Hub routes (for example user creation)
  and 13 paths absent from the official reference. Features it emulates through another endpoint
  (user groups and roles through a user read, issue move through an issue update) are not
  credited to the dedicated operation.
- Coverage is one axis. `yt` offers things this CLI deliberately does not: reports, interactive
  tables, themes, tutorials and aliases; see the [command reference](reference.md#compared-with-yt-0222).

## Updating

The README overview, this document and the pictures follow the
[product-readme skill](https://github.com/iXab3r/EyeAuras.CliFactory/tree/main/.claude/skills/product-readme) in Factory; it holds the format, the measuring method and the
picture generator.

- Refresh when the version in a column title changes or the operation inventory changes.
- Edit the numbers in `docs/images/readme-images.json`, then regenerate the four SVGs with the
  skill's script from a Factory checkout:
  `node <factory>/.claude/skills/product-readme/scripts/readme-images.mjs docs/images/readme-images.json docs/images`.
  It prints the area table for this document and rejects columns that do not add up.
- A column for another tool is a dated measurement of one version. Re-measure it deliberately,
  with the skill's method, and update the version, the caveats and the credited list together.

<details>
<summary>The 61 operations reachable from yt 0.22.2</summary>

- `DELETE /api/articles/{p1}/attachments/{p2}`
- `DELETE /api/articles/{p1}/comments/{p2}`
- `DELETE /api/issues/{p1}`
- `DELETE /api/issues/{p1}/attachments/{p2}`
- `DELETE /api/issues/{p1}/comments/{p2}`
- `DELETE /api/issues/{p1}/links/{p2}/issues/{p3}`
- `DELETE /api/issues/{p1}/tags/{p2}`
- `GET /api/admin/customFieldSettings/customFields`
- `GET /api/admin/globalSettings/appearanceSettings`
- `GET /api/admin/globalSettings/license`
- `GET /api/admin/globalSettings/localeSettings`
- `GET /api/admin/globalSettings/notificationSettings`
- `GET /api/admin/globalSettings/systemSettings`
- `GET /api/admin/projects`
- `GET /api/admin/projects/{p1}`
- `GET /api/admin/projects/{p1}/articles`
- `GET /api/admin/projects/{p1}/customFields`
- `GET /api/admin/projects/{p1}/customFields/{p2}`
- `GET /api/admin/projects/{p1}/timeTrackingSettings/workItemTypes`
- `GET /api/admin/timeTrackingSettings/workItemTypes`
- `GET /api/agiles`
- `GET /api/agiles/{p1}`
- `GET /api/articles`
- `GET /api/articles/{p1}`
- `GET /api/articles/{p1}/attachments`
- `GET /api/articles/{p1}/attachments/{p2}`
- `GET /api/articles/{p1}/comments`
- `GET /api/issueLinkTypes`
- `GET /api/issues`
- `GET /api/issues/{p1}`
- `GET /api/issues/{p1}/attachments`
- `GET /api/issues/{p1}/attachments/{p2}`
- `GET /api/issues/{p1}/comments`
- `GET /api/issues/{p1}/links`
- `GET /api/issues/{p1}/tags`
- `GET /api/issues/{p1}/timeTracking/workItems`
- `GET /api/tags`
- `GET /api/users`
- `GET /api/users/me`
- `GET /api/users/{p1}`
- `GET /api/workItems`
- `POST /api/admin/globalSettings/localeSettings`
- `POST /api/admin/projects`
- `POST /api/admin/projects/{p1}`
- `POST /api/agiles/{p1}`
- `POST /api/articles`
- `POST /api/articles/{p1}`
- `POST /api/articles/{p1}/attachments`
- `POST /api/articles/{p1}/comments`
- `POST /api/articles/{p1}/comments/{p2}`
- `POST /api/articles/{p1}/tags`
- `POST /api/issues`
- `POST /api/issues/{p1}`
- `POST /api/issues/{p1}/attachments`
- `POST /api/issues/{p1}/comments`
- `POST /api/issues/{p1}/comments/{p2}`
- `POST /api/issues/{p1}/links/{p2}/issues`
- `POST /api/issues/{p1}/tags`
- `POST /api/issues/{p1}/timeTracking/workItems`
- `POST /api/tags`
- `POST /api/users/{p1}`

</details>
