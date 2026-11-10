# REST coverage comparison

How much of the official YouTrack REST API each tool can call. Measured 2026-11-10.

| Tool | Reachable operations | ReadOnly (140) | Update (142) |
|---|---:|---:|---:|
| `youtrack-cli` 0.9 (this package) | 282 of 282 (100%) | 140 | 142 |
| `youtrack` 0.8.1 (official JetBrains CLI, GitHub releases) | 146 of 282 (52%) | 63 | 83 |
| `yt` 0.22.2 (Python `youtrack-cli` from PyPI) | 61 of 282 (22%) | 34 | 27 |

## Tools considered

Every command-line client found on npm, PyPI, crates.io, NuGet, Homebrew and GitHub on 2026-11-10.
Popularity is what the registry or GitHub reported that day.

| Tool | Published | Latest version | Popularity | In the matrix |
|---|---|---|---|---|
| `youtrack-cli` by shanehofstetter | npm | 0.5.0, 2019-10-07 | 33 GitHub stars; 36 npm downloads a month | No: calls only the earlier `/rest/...` API, which is not the API measured here (0 of 282 on a static reading) |
| `yt` (`youtrack-cli`) by ryancheley | PyPI | 0.27.0, 2026-10-24 | 29 stars; 443 PyPI downloads a month | Measured at 0.22.2 |
| `youtrack` by JetBrains (official) | GitHub releases, Homebrew tap, Winget, Scoop, Chocolatey | 0.8.1, 2026-11-04 | 8 stars; 1,160 downloads of the 0.8.1 release files, 3,090 of 0.7.1 | Measured |
| `youtrack-commander` by pvid | crates.io | 0.2.1, 2021-05-11 | 4 stars (archived); 4,252 downloads in total, 1 recent | No: qualifies, not measured (four stars or fewer) |
| `youtrackd` by danielkbx | GitHub releases | 1.10.0, 2026-06-01 | 4 stars | No: qualifies, not measured (four stars or fewer) |
| `youtrack-python-cli` by noahp | PyPI | 0.2.0, 2024-01-09 | 3 stars; 34 PyPI downloads a month | No: qualifies, not measured (four stars or fewer) |
| `youtrack-cli` by UsingCoding | GitHub releases | 0.4.0, 2026-10-08 | 1 star; 61 release downloads | No: qualifies, not measured (four stars or fewer) |
| `goutrack` by codegoalie | GitHub releases | 1.1.0, 2016-01-06 | 1 star | No: qualifies, not measured (four stars or fewer) |
| `@apytel/youtrack-cli` | npm | 0.6.0, 2026-08-11 | 0 stars; 46 npm downloads a month | No: qualifies, not measured (four stars or fewer) |
| `@billpeet/yt-cli` | npm | 0.1.4, 2026-08-17 | 0 stars; 20 npm downloads a month | No: qualifies, not measured (four stars or fewer) |
| `yt-cli` by vaivars | crates.io | 0.2.1, 2026-10-26 | 0 stars; 76 downloads in total | No: qualifies, not measured (four stars or fewer) |
| `youtrack-cli` by BrainerVirus | GitHub releases | 0.3.2, 2026-11-05 | 0 stars; 11 release downloads | No: qualifies, not measured (four stars or fewer) |
| `youtrack-axi` | npm | 0.1.1, 2026-06-25 | no public repository; 11 npm downloads a month | No: qualifies, not measured (four stars or fewer) |
| `OotbDevteam.YoutrackConsole` | NuGet (.NET tool) | 1.1.0, 2026-05-25 | 291 downloads in total | No: qualifies, not measured (four stars or fewer) |
| `youtrack-cli` by leftys | GitHub, no release or tag | none | 0 stars | No: no pinned version to fetch |
| `youtrack-workflow-cli` (`ytw`) by udamir | npm | 1.6.0, 2026-02-01 | 8 stars; 280 npm downloads a month | No: syncs workflow scripts, not a client for the REST resources |
| `@jetbrains/youtrack-apps-tools` | npm | 1.0.3, 2026-08-20 | 4,852 npm downloads a month | No: builds and uploads YouTrack apps, not a client for the REST resources |
| `pi-youtrack` | npm | 0.1.3, 2026-11-09 | 846 npm downloads a month | No: an extension for the pi agent, not a CLI |
| MCP servers (`@vitalyostanin/youtrack-mcp`, `youtrack-mcp-rs` and others) | npm, crates.io | various | not compared | No: MCP servers |
| Libraries (`youtrack-rest-client`, `youtrack-client`, `youtrack-rs`, `YouTrackSharp`) | npm, crates.io, NuGet | various | not compared | No: libraries |

Selection rule: a tool is measured when it is a real command-line client for the current YouTrack
REST API under `/api` (not a client of the earlier `/rest` API, a library, MCP server, IDE plugin
or raw-request wrapper) and is published at a version that
can be fetched and pinned; when more than three qualify, the most starred are taken, with registry
downloads breaking ties, whatever they score. Two are shown: the remaining qualifying tools have
four stars or fewer. Tools that qualify but were
not measured are judged by their published description; their source was not read.

## By API area

Percent of operations reachable, with the count in brackets.

| API area | Operations | youtrack-cli 0.9 | JetBrains CLI 0.8.1 | yt 0.22.2 |
|---|---:|---:|---:|---:|
| Issues | 49 | 100% (49) | 80% (39) | 43% (21) |
| Search, commands, saved queries | 8 | 100% (8) | 88% (7) | 0% (0) |
| Tags and link types | 11 | 100% (11) | 55% (6) | 27% (3) |
| Activity and work items | 5 | 100% (5) | 0% (0) | 20% (1) |
| Projects | 31 | 100% (31) | 39% (12) | 26% (8) |
| Knowledge base articles | 29 | 100% (29) | 62% (18) | 45% (13) |
| Agile boards and sprints | 10 | 100% (10) | 100% (10) | 30% (3) |
| Custom fields | 9 | 100% (9) | 56% (5) | 11% (1) |
| Field value bundles | 64 | 100% (64) | 27% (17) | 0% (0) |
| Users and groups | 22 | 100% (22) | 68% (15) | 18% (4) |
| Roles, permissions, organizations | 15 | 100% (15) | 80% (12) | 0% (0) |
| Time tracking settings | 8 | 100% (8) | 50% (4) | 13% (1) |
| Server settings, backups, telemetry | 21 | 100% (21) | 5% (1) | 29% (6) |
| **All operations** | **282** | **100% (282)** | **52% (146)** | **22% (61)** |

## By official resource group

Reachable operation counts.

| Resource group | Operations | youtrack-cli 0.9 | JetBrains CLI 0.8.1 | yt 0.22.2 |
|---|---:|---:|---:|---:|
| `activities` | 2 | 2 | 0 | 0 |
| `activitiesPage` | 1 | 1 | 0 | 0 |
| `admin.databaseBackup` | 5 | 5 | 0 | 0 |
| `admin.globalSettings` | 14 | 14 | 1 | 6 |
| `admin.organizations` | 5 | 5 | 3 | 0 |
| `admin.projects` | 31 | 31 | 12 | 8 |
| `admin.telemetry` | 1 | 1 | 0 | 0 |
| `admin.timeTrackingSettings` | 8 | 8 | 4 | 1 |
| `agiles` | 10 | 10 | 10 | 3 |
| `articles` | 29 | 29 | 18 | 13 |
| `assignedRoles` | 4 | 4 | 3 | 0 |
| `bundles.build` | 10 | 10 | 3 | 0 |
| `bundles.enum` | 10 | 10 | 3 | 0 |
| `bundles.ownedField` | 10 | 10 | 3 | 0 |
| `bundles.state` | 10 | 10 | 3 | 0 |
| `bundles.user` | 14 | 14 | 2 | 0 |
| `bundles.version` | 10 | 10 | 3 | 0 |
| `commands` | 2 | 2 | 2 | 0 |
| `customFields` | 9 | 9 | 5 | 1 |
| `groups` | 9 | 9 | 5 | 0 |
| `issueLinkTypes` | 5 | 5 | 2 | 1 |
| `issues` | 48 | 48 | 38 | 21 |
| `issuesGetter` | 1 | 1 | 1 | 0 |
| `metadata` | 1 | 1 | 0 | 0 |
| `permissions` | 1 | 1 | 1 | 0 |
| `roles` | 5 | 5 | 5 | 0 |
| `savedQueries` | 5 | 5 | 5 | 0 |
| `search` | 1 | 1 | 0 | 0 |
| `tags` | 6 | 6 | 4 | 2 |
| `users` | 13 | 13 | 10 | 4 |
| `workItems` | 2 | 2 | 0 | 1 |

## Method

- **Denominator.** The frozen census of 282 operations (HTTP method + path template) from the
  pinned JetBrains OpenAPI document and reference pages; see the [audit](rest-api-coverage/README.md)
  and [official operation list](rest-api-coverage/official-operations.json).
- **Reachable** means a shipped command issues that exact method and path. It does not measure
  every query parameter, payload field, server edition or remote permission.
- **youtrack-cli 0.9** comes from the [current per-operation map](rest-api-coverage/current/README.md),
  where each operation also has full query-control coverage and offline request evidence.
- **JetBrains CLI 0.8.1** is the official `youtrack` binary, read from the source archive of the
  `v0.8.1` tag (released 2026-11-04) without building or running it. Every request it sends is
  issued from its `api` package; a call was counted when a function there is called from a
  command. Its `raw` command, which sends any method and path the caller types, is not counted.
- **yt 0.22.2** was measured by reading the published wheel's source without running it. Each
  HTTP call reachable from a `yt` command was normalized and matched to the same 282 identities.

## Caveats for the JetBrains CLI column

- It is a static reading of one version, not a statement about later releases.
- Calls made only as a step inside another command (an issue read before a visibility change, a
  tag lookup before tagging, `users/me` during sign-in) are counted as reachable.
- Its bundle commands take the bundle type as a `--type` value. The six types its source names
  (enum, state, version, build, ownedField, user) are credited for list and create, and five for
  add-value, 17 operations in all, although the path is built from the flag.
- 8 more operations exist in its `api` package that no command calls (bundle delete for the six
  types, comment reaction list, time tracking profile update); counting them would give 154 of
  282 (55%).
- It issues 72 more calls outside this denominator: 62 `/api` paths absent from the official
  reference (workflows and rules, apps, dashboards, Gantt charts, whiteboards, issue drafts,
  votes and watchers, helpdesk agents, group members, feature flags, more user profile sections),
  9 sign-in and token calls to Hub and OAuth endpoints, and the attachment file download.
- Near misses are not credited. It attaches, lists and removes project fields through
  `/api/admin/projects/{id}/fields`, while the reference lists `/customFields`; it removes an issue
  comment with a `POST` that marks it deleted rather than the `DELETE` operation; it deletes a
  user with `DELETE /api/users/{id}`, which the reference does not list.
- Coverage is one axis. The JetBrains CLI offers things this CLI does not: the resources listed
  above that have no official REST reference, browser sign-in through OAuth, a `raw` command for
  any path, bundled agent skills, self-update, and packages for Homebrew, Winget, Scoop and
  Chocolatey.

## Caveats for the yt column

- It is a static reading of one version, not a statement about later releases; PyPI lists 0.27.0
  (2026-10-24) as the latest.
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
<summary>The 146 operations reachable from the JetBrains CLI 0.8.1</summary>

- `DELETE /api/admin/customFieldSettings/customFields/{p1}`
- `DELETE /api/admin/organizations/{p1}`
- `DELETE /api/admin/projects/{p1}`
- `DELETE /api/admin/projects/{p1}/team/groups/{p2}`
- `DELETE /api/admin/projects/{p1}/team/ownUsers/{p2}`
- `DELETE /api/agiles/{p1}`
- `DELETE /api/agiles/{p1}/sprints/{p2}`
- `DELETE /api/articles/{p1}`
- `DELETE /api/articles/{p1}/attachments/{p2}`
- `DELETE /api/articles/{p1}/comments/{p2}`
- `DELETE /api/articles/{p1}/comments/{p2}/reactions/{p3}`
- `DELETE /api/articles/{p1}/tags/{p2}`
- `DELETE /api/assignedRoles/{p1}`
- `DELETE /api/groups/{p1}`
- `DELETE /api/issues/{p1}`
- `DELETE /api/issues/{p1}/attachments/{p2}`
- `DELETE /api/issues/{p1}/comments/{p2}/reactions/{p3}`
- `DELETE /api/issues/{p1}/links/{p2}/issues/{p3}`
- `DELETE /api/issues/{p1}/tags/{p2}`
- `DELETE /api/issues/{p1}/timeTracking/workItems/{p2}`
- `DELETE /api/issues/{p1}/vcsChanges/{p2}`
- `DELETE /api/roles/{p1}`
- `DELETE /api/savedQueries/{p1}`
- `DELETE /api/tags/{p1}`
- `GET /api/admin/customFieldSettings/bundles/build`
- `GET /api/admin/customFieldSettings/bundles/enum`
- `GET /api/admin/customFieldSettings/bundles/ownedField`
- `GET /api/admin/customFieldSettings/bundles/state`
- `GET /api/admin/customFieldSettings/bundles/user`
- `GET /api/admin/customFieldSettings/bundles/version`
- `GET /api/admin/customFieldSettings/customFields`
- `GET /api/admin/customFieldSettings/customFields/{p1}`
- `GET /api/admin/globalSettings`
- `GET /api/admin/organizations`
- `GET /api/admin/projects`
- `GET /api/admin/projects/{p1}`
- `GET /api/admin/projects/{p1}/team/groups`
- `GET /api/admin/projects/{p1}/team/ownUsers`
- `GET /api/admin/timeTrackingSettings/workItemTypes`
- `GET /api/admin/timeTrackingSettings/workTimeSettings`
- `GET /api/agiles`
- `GET /api/agiles/{p1}`
- `GET /api/agiles/{p1}/sprints`
- `GET /api/agiles/{p1}/sprints/{p2}`
- `GET /api/articles`
- `GET /api/articles/{p1}`
- `GET /api/articles/{p1}/attachments`
- `GET /api/articles/{p1}/comments`
- `GET /api/articles/{p1}/comments/{p2}`
- `GET /api/articles/{p1}/comments/{p2}/reactions`
- `GET /api/assignedRoles`
- `GET /api/groups`
- `GET /api/groups/{p1}`
- `GET /api/groups/{p1}/ownUsers`
- `GET /api/issueLinkTypes`
- `GET /api/issues`
- `GET /api/issues/{p1}`
- `GET /api/issues/{p1}/activities`
- `GET /api/issues/{p1}/attachments`
- `GET /api/issues/{p1}/attachments/{p2}`
- `GET /api/issues/{p1}/comments`
- `GET /api/issues/{p1}/comments/{p2}`
- `GET /api/issues/{p1}/customFields`
- `GET /api/issues/{p1}/links`
- `GET /api/issues/{p1}/links/{p2}`
- `GET /api/issues/{p1}/sprints`
- `GET /api/issues/{p1}/tags`
- `GET /api/issues/{p1}/tags/{p2}`
- `GET /api/issues/{p1}/timeTracking/workItems`
- `GET /api/issues/{p1}/timeTracking/workItems/{p2}`
- `GET /api/issues/{p1}/vcsChanges`
- `GET /api/issues/{p1}/vcsChanges/{p2}`
- `GET /api/permissions`
- `GET /api/roles`
- `GET /api/roles/{p1}`
- `GET /api/savedQueries`
- `GET /api/savedQueries/{p1}`
- `GET /api/tags`
- `GET /api/tags/{p1}/issues`
- `GET /api/users`
- `GET /api/users/me`
- `GET /api/users/{p1}`
- `GET /api/users/{p1}/profiles/general`
- `GET /api/users/{p1}/profiles/timetracking`
- `GET /api/users/{p1}/tags`
- `POST /api/admin/customFieldSettings/bundles/build`
- `POST /api/admin/customFieldSettings/bundles/build/{p1}/values`
- `POST /api/admin/customFieldSettings/bundles/enum`
- `POST /api/admin/customFieldSettings/bundles/enum/{p1}/values`
- `POST /api/admin/customFieldSettings/bundles/ownedField`
- `POST /api/admin/customFieldSettings/bundles/ownedField/{p1}/values`
- `POST /api/admin/customFieldSettings/bundles/state`
- `POST /api/admin/customFieldSettings/bundles/state/{p1}/values`
- `POST /api/admin/customFieldSettings/bundles/user`
- `POST /api/admin/customFieldSettings/bundles/version`
- `POST /api/admin/customFieldSettings/bundles/version/{p1}/values`
- `POST /api/admin/customFieldSettings/customFields`
- `POST /api/admin/customFieldSettings/customFields/{p1}`
- `POST /api/admin/organizations`
- `POST /api/admin/projects`
- `POST /api/admin/projects/{p1}`
- `POST /api/admin/projects/{p1}/team/groups`
- `POST /api/admin/projects/{p1}/team/ownUsers`
- `POST /api/admin/projects/{p1}/timeTrackingSettings`
- `POST /api/admin/timeTrackingSettings/workItemTypes`
- `POST /api/admin/timeTrackingSettings/workTimeSettings`
- `POST /api/agiles`
- `POST /api/agiles/{p1}`
- `POST /api/agiles/{p1}/sprints`
- `POST /api/agiles/{p1}/sprints/{p2}`
- `POST /api/articles`
- `POST /api/articles/{p1}`
- `POST /api/articles/{p1}/attachments`
- `POST /api/articles/{p1}/comments`
- `POST /api/articles/{p1}/comments/{p2}`
- `POST /api/articles/{p1}/comments/{p2}/reactions`
- `POST /api/articles/{p1}/tags`
- `POST /api/assignedRoles`
- `POST /api/commands`
- `POST /api/commands/assist`
- `POST /api/groups`
- `POST /api/issueLinkTypes`
- `POST /api/issues`
- `POST /api/issues/{p1}`
- `POST /api/issues/{p1}/attachments`
- `POST /api/issues/{p1}/attachments/{p2}`
- `POST /api/issues/{p1}/comments`
- `POST /api/issues/{p1}/comments/{p2}`
- `POST /api/issues/{p1}/comments/{p2}/reactions`
- `POST /api/issues/{p1}/customFields/{p2}`
- `POST /api/issues/{p1}/links/{p2}/issues`
- `POST /api/issues/{p1}/tags`
- `POST /api/issues/{p1}/timeTracking/workItems`
- `POST /api/issues/{p1}/timeTracking/workItems/{p2}`
- `POST /api/issues/{p1}/vcsChanges`
- `POST /api/issues/{p1}/vcsChanges/{p2}`
- `POST /api/issuesGetter/count`
- `POST /api/roles`
- `POST /api/roles/{p1}`
- `POST /api/savedQueries`
- `POST /api/savedQueries/{p1}`
- `POST /api/tags`
- `POST /api/users`
- `POST /api/users/{p1}`
- `POST /api/users/{p1}/profiles/general`
- `POST /api/users/{p1}/profiles/notifications`

</details>

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
