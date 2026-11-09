# YouTrack CLI

The scoped package provides the `youtrack-cli` command:

Agents use the [shared YouTrack workflow](docs/agent-workflow.md):
our executable is primary; the separate Python `yt.exe` is an explicit fallback.
The guide covers field selection, paging and preserving tracker/profile ownership.

```sh
npm install --global @eyeauras/youtrack-cli
youtrack-cli --help
youtrack-cli profile configure
```

Requires Node.js 22+ and npm. Compiled JavaScript and the Core dependency are installed
automatically; no repository checkout, .NET, TypeScript compiler or browser is needed.
Interactive profile configuration guides endpoint/authentication setup; secrets use the
platform secret store. Existing `youtrack-cli` profiles and permissions are unchanged.
On Windows, Core now stores DPAPI CurrentUser encrypted files under the selected profile's
AppData `secrets/` directory. Credential Manager is no longer used or migrated. Sign in again
for each profile and reimport auxiliary secrets. Existing profiles and permissions remain.

Licensed under MIT. See the [release guide](docs/release.md).

YouTrack consumes the exact published `@eyeauras/cli-factory` version declared in package.json. The current source
provides profiles/auth/permissions and 282 REST operations: 140 ReadOnly and 142 Update.
Seven workflow leaves reuse operations or manage local secrets: issue and article attachment
downloads, article export, `issues batch validate/apply`, and initial-password/license import.
There are 287 service leaves: 280 for REST operations plus these seven. Two `--direct` selectors
each select a second REST endpoint without adding another leaf.
The foundational read projections are:

| Command | Default fields |
|---|---|
| `user me` | `id,login` |
| `project list` | `id,name,shortName` |
| `issues list [--query <query>]` | `id,idReadable,summary,project(id,name,shortName),updated,resolved` |
| `issues get <issueID>` | Issue-list fields plus `description,created` |
| `issues comments list <issueID>` | `id,text,author(id,login),created,updated` |

REST reads support explicit `--fields <projection>`, except fixed-document `api-schema get`. Projection results retain the server's
field names, `$type` and nullable values; authentication always validates fixed `id,login`.
Offset collections use `--page-size 50 --start 0` by default. Page size requests rows per HTTP
page; start is the zero-based raw offset. Both must be nonnegative safe integers, with a safe sum.
Paging accepts unsigned decimal digits, including leading zeros; signs (including `-0`), whitespace,
fractions, exponents and unsafe integers reject. Invalid syntax, range and overflow now fail before
onboarding or credential access on CLI, execute and RPC. The static errors are
`--page-size must be a nonnegative safe decimal integer.` and
`--start must be a nonnegative integer.`; they never include the supplied input.
Directly callable service methods retain their own range validation.
All 62 offset lists return `{count,items,hasMore,nextStart}` across library, CLI, execute and RPC.
Each ordinary list makes one request without lookahead and rejects an oversized server page.
Nonempty pages have `hasMore:null`, including short pages: a server cap is not end evidence.
Continue at `nextStart`, which advances by actual returned rows. A positive-size empty page has
`hasMore:false`; a zero-size request has unknown completeness and no next offset. Multi-page reads
happen only for the explicit `issues list --all` described below. Issue writes send selectors
directly to the API without nested discovery requests. Issue IDs are encoded as opaque path segments, including readable IDs such as `DEMO-1`.

`issues list --all --max-results <n>` reads every page (`--page-size` is the page size, `--start` the start)
with the same query and projection. Success means the selection is complete: the result is the
page envelope with `hasMore:false` and `nextStart:null`, in server order with repeated string `id`s
removed. Rows without IDs are preserved. Reading continues by raw rows to an empty page, even
after a short page. A duplicate-only nonempty page fails instead of claiming completeness.
More than `n` issues, responses over
the optional `--max-bytes <n>` (total decoded bytes; also valid without `--all`) or any failed page
fail the whole command without partial output or retries. `--all` and `--max-results` require each
other; complete mode requires a positive page size. Offset paging is not a snapshot: concurrent
changes can still omit issues. Activity cursor commands keep their native objects and direction.

Breaking change: replace former `--top`/`--skip` flags and library `top`/`skip` options with
`--page-size`/`--start` and `pageSize`/`start`. Consume list rows from `items`, including for
complete issue selection. There are no old aliases or array-returning modes. Profiles and
credentials need no reconfiguration and existing user files are untouched.

```powershell
npm start -- project list --page-size 3 --profile youtrack-dev
npm start -- issues list --query "project: DEMO #Unresolved" --profile youtrack-dev
npm start -- issues get DEMO-1 --fields "id,summary,description" --profile youtrack-dev
npm start -- issues comments list DEMO-1 --page-size 3 --profile youtrack-dev
```

Handlers return domain values for human, `--json` and persistent `--json-rpc` output.
Empty offset collections have an empty `items` array. Signed/credential-bearing URLs and the active bearer token are
scrubbed recursively, including explicitly projected nested fields. Unsigned URLs remain
unchanged. An HTTP error status fails with Core's `HttpError` (`YouTrack answered HTTP 404.`,
codes `http.notFound`, `http.unauthorized` with an `auth login` follow-up, `http.rateLimited` with
safe Retry-After text, and so on), never with raw server errors or authentication material.
Remote mutations require the Update gate, described below. The ReadOnly download and export
commands write only their explicitly requested local file in the invocation directory or explicit output path.

### Reading output

Human mode is for people; `--json` is the machine view. Every everyday command has a view built
from Core's formats: lists such as `issues list`, `project list`, `article list` and `issues
comments list` are tables (`ISSUE  SUMMARY  PROJECT  STATE  UPDATED`), `issues get` and
`article get` are records with a description or content section and a `Next:` command, tags and
link groups are one line each, and a mutation names the object it changed (`Created DEMO-99 · New
issue`, `Removed tag 6-1 from DEMO-7.`). An offset list with unknown completeness says
`More results may exist`, with `--start <n>` when continuation is representable.
Long work prints one progress line per page (`issues list --all`), per
failed batch row and at the start of a download on stderr, never under `--json`. An explicit
`--fields` projection prints the generic `key: value` shape, so you see exactly the fields you
asked for. Root help groups the commands into Everyday, Reference and Configuration, with examples.

JSON responses have no CLI byte ceiling. Invalid/truncated identity transfer lengths, stream failure
or cancellation fail with `The response stream failed or was cancelled.` without response content.
Compressed wire length is syntax-checked but not compared with decoded size. HTTP status,
Retry-After, empty/null mutation and UTF-8 BOM behavior are unchanged. No request is retried
automatically. Runtime memory and service limits still apply.

## M08: installation maintenance (unreleased source)

This source includes M02–M08; npm0.8.0 contains M01. M08 adds21REST operations, reaching the
frozen **282/282** official operations: [mapping and source limits](docs/rest-api-coverage/current/README.md).
Operation coverage does not prove every payload, deployed version or edition. Milestones merge
without version bumps or npm publication.

- `api-schema get` reads one native `/api/openapi.json` document; human output shows metadata.
  JSON/RPC preserve the native document with concrete credential redaction. No schema crawl or
  server-conformance check runs. `server telemetry get` reads installation status; default fields
  avoid installation paths and online identities. `server-settings get` defaults to the root ID.
- `backup file list` and `backup file get <backup>` read metadata. Lists use the ordinary offset-page contract;
  `get` does not download an archive. `backup status get` reads the current status once.
  `backup settings get/update --body <json>` exposes native settings, including TAR_GZ/ZIP,
  nullable location, Int32 filesToKeep and literal cronExpression. No polling, restore, implicit
  backup trigger or completion claim is added. A caller-supplied native backupStatus action is
  sent only by the explicit Update request.
- `server-settings appearance-settings get/update` accepts native timeZone/dateFieldFormat
  descriptor objects; for example `--body '{"timeZone":{"id":"UTC"}}'`.
  `notification-settings get/update` uses native emailSettings objects, including false/null,
  SMTP/SMTPS/SMTP_TLS/MS_GRAPH_API and nullable SSL StorageEntry references. No SMTP password
  property or private-key upload workflow is introduced. `locale-settings update` requires
  `locale.id`, for example `--body '{"locale":{"id":"en_US"},"isRTL":false}'`.
- `server-settings system-settings get/update` preserves native nullable baseUrl/administratorEmail,
  booleans and numeric types; changing remote baseUrl never rewrites the selected CLI profile.
  `rest-settings get/update` preserves CORS origin strings and false allowAllOrigins without
  rewriting hosts, paths or ports. `server-settings update --body <json>` sends one root request;
  the documented nested appearance descriptor is supported without discovery or local merging.

`server-settings license get` reads license metadata. A secure runner supplies YOUTRACK_LICENSE
for `server-settings license import server-key --from-env --profile dev`; the value goes into
that selected profile's Core secret store under `server-license:server-key`. Import requires
Update, makes no HTTP call for a configured/authenticated profile and outputs only the alias and
acknowledgement. `server-settings license update --license-secret server-key --profile dev`
reads that stored alias with no environment fallback. Optional `--body` supports username metadata;
without an alias, native `{"license":null,"username":null}` can clear nullable fields. Literal
license strings in CLI bodies, including nested root bodies, are rejected. Use the child alias
command for license material. SDK native string submissions remain supported.

Imported values preserve exact bytes; absent/empty environment input fails. The platform store
has no plaintext fallback; namespaced alias `token` cannot overwrite the bearer credential.
Aliases remain after success/failure. CLI profile deletion removes its auth token, not auxiliary
aliases; manage those retained entries through the platform store/SDK. Cancellation before
persistence starts prevents the write; cancellation after it starts makes no rollback promise.
License-bearing body dispatches require the original HTTPS origin, including every redirect hop.
Same-origin redirects and redirects that discard the body retain normal behavior. Native/input
license strings and known raw/JSON/URI/escaped-control echoes are redacted from results and causes;
this is not a guarantee of detecting arbitrary unknown secrets in explicit projections.

All reads use ReadOnly and remote writes/local imports require Update. Installation-level rights
are separate. Server licensing and backup scheduling/retention differ from Cloud's managed single
backup/export; no edition is inferred from a hostname and no compatibility matrix is claimed.
See JetBrains' [optional API reference: backup API use-case](https://www.jetbrains.com/help/youtrack/devportal/api-usecase-backup.html),
[optional API reference: Cloud backup guide](https://www.jetbrains.com/help/youtrack/cloud/database.html),
[optional API reference: Server backup guide](https://www.jetbrains.com/help/youtrack/server/back-up-the-database.html) and
[optional API reference: Server license guide](https://www.jetbrains.com/help/youtrack/server/license-details.html).
Unsupported service rights/edition responses remain errors. Existing paging, profiles/auth,
JSON/execute/RPC, cancellation, EPIPE and diagnostic/unknown-write behavior remain. No live proof ran.

## M07: schema and work-time lifecycle (unreleased source)

This source includes M02–M07; npm0.8.0 contains M01. Milestones merge without version bumps or
npm publication. M07 adds34REST operations; [current coverage](docs/rest-api-coverage/current/README.md)
retains the frozen282-operation universe and the complete21-operation remainder.

- `work-item-type create/update/delete` manages global work types, with native name and
  autoAttached. Creation requires name; project-specific attachment/removal remains under
  `project work-item-type` and does not delete the global type.
- `time-tracking work-time update --body '{"minutesADay":450,"workDays":[1,2,3,4,5]}'` updates
  the native calendar. Values use the source's Int32 representation. Order and duplicate workDays
  survive; there is no locale conversion, positive-only rule or additional limit guessed from
  examples. YouTrack validates domain constraints. firstDayOfWeek/daysAWeek remain server-owned;
  passing extra native metadata does not promise that the server changes read-only attributes.
- `project field delete <project> <field>` removes that project field instance. `field delete
  <field>` deletes the selected global custom field. These are separate IDs/scopes; no automatic
  detach, cascade, scan or compensation is added. `project delete <project>` deletes that project.
- `bundle enum/state/version/build/owned/user create/update/delete` manages the named family.
  Native values/groups/individuals and sample-supported name metadata are passed unchanged.
  The pinned create descriptions declare no required bundle name, and schemas omit it; no local
  mandatory-name constraint or universal bundle DTO is invented. YouTrack remains authoritative.
- `bundle enum/state/version value delete <bundle> <value>` removes a selected value.
  `bundle build/owned value create/update/delete` adds native lifecycle operations. Value creation
  requires name. Build assembleDate/description and owned owner/description preserve native null;
  non-null owners use descriptor objects, without user discovery. Native extra fields remain.

All M07 operations require Update; server management rights still apply. DELETE defaults are
query-free with optional --fields, under the documented field-table-only source disposition.
Successful empty replies remain null in JSON/RPC; human confirmations use scrubbed identities and
bundle context, including adjacent existing version/enum/state value commands. A later failure
never replays or rolls back an earlier user command. Existing profiles/auth, native projections,
paging, diagnostics, EPIPE and unknown-write outcomes remain. No live/version conformance is claimed.

## M06: administration and scoped operations (unreleased source)

This source includes M02–M06; npm0.8.0 contains M01. Milestones merge without version bumps or
npm publication. M06 adds26REST operations; [current coverage](docs/rest-api-coverage/current/README.md)
tracks the frozen282-operation universe and the complete remaining inventory.

- `project create --body <json> [--template scrum|kanban]` requires native name, shortName and
  leader.id; `project update <project>` preserves native metadata. Templates remain omitted when
  not selected. Board creation accepts native kanban/scrum/version/custom/personal templates.
- `project issues list/get/create/update/delete` uses the actual project-scoped endpoints,
  selected project/issue IDs, repeated `--custom-field` selectors on lists and native notification
  controls on writes. Project issue creation requires summary; updates preserve native nulls.
- `article delete <article>`, `agile delete <agile>` and `sprint delete <agile> <sprint>` act only
  on selected IDs. `group create/update/delete`, `organization list/get/create/update/delete`,
  `role create/update/delete` and `link-types create/update/delete` expose native resources.
  Role bodies retain permission objects with native id keys; no permission discovery is added.
  Link-type creation requires name, sourceToTarget and targetToSource; the inward targetToSource
  property may be null. DELETE defaults remain
  query-free, with optional --fields. Reads use ReadOnly; remote writes require Update.

`user create --body '{"login":"new-user"}' --password-secret initial-user-password` reads
an initial password from the selected CLI profile's Core secret store. Provision that alias with
`user initial-password import initial-user-password --from-env --profile dev` after configuring
and signing in to that profile. A secure runner supplies `YOUTRACK_INITIAL_PASSWORD`; do not put
its value in argv, shell history or `--body`. Import requires Update, makes no service request for
an already configured/authenticated profile, and returns only the alias and storage acknowledgement.
The namespaced alias `token` cannot overwrite the bearer credential. The password's exact bytes
are stored; an absent or empty environment value fails. The platform store is authoritative and
there is no plaintext fallback. Treat aliases as sensitive retained credentials: creation does not
erase them after success or failure, and deleting a CLI profile removes its auth token, not these
auxiliary entries. Administrators manage retained auxiliary entries through the platform store/SDK.

Cancellation before secure-store persistence starts prevents the write. Once persistence has
started, cancellation does not imply rollback; inspect the store before deciding to import again.

Creation requires Update and HTTPS, sends the password only in the native JSON body, and has no
environment fallback. Password-bearing redirects stay on the original HTTPS origin; same-origin
HTTPS redirects retain normal behavior. CLI `--body.password` is rejected. Missing aliases return a profile-specific
import follow-up. Results and diagnostic causes scrub known passwords, including JSON echoes;
JSON/RPC never return the imported value. `user update <user> --body '{"email":null}'` uses the
native user endpoint and preserves additional native fields. This email update follows the pinned
endpoint sample despite the general User model's read-only annotation; no Hub calls or universal
account-field/version compatibility are implied. Password rotation is not a CLI workflow.

## M05: self-service and targeted cleanup (unreleased main)

This source includes M02–M05; npm0.8.0 contains M01. Milestones merge without version bumps or
npm publication. [Current coverage](docs/rest-api-coverage/current/README.md) retains the frozen
282-operation denominator and the complete remaining inventory.

- `user profile general get/update <user>` reads or changes timezone, locale and date-format
  preferences. Updates use native descriptor objects, for example
  `--body '{"timezone":{"id":"Europe/Berlin"}}'`; descriptor IDs remain caller-selected.
- `user profile time-tracking get/update <user>` handles native period descriptors, for example
  `--body '{"periodFormat":{"id":"FULL"}}'`. These server profiles are separate from CLI profiles.
- `user saved-queries list <user>` and `user tags list <user>` return one ordinary offset page.
- `group list --query <query>` passes the native filter unchanged. `group member add <group> <user>
  --body <json>` selects the direct member through path IDs. If body.id is supplied it must match
  the selected user; an empty object still uses the path selector. No user lookup or additional role-assignment call occurs.
- `tags issues list <tagID>` reads usage, including repeatable `--custom-field <name>` selectors.
  Values and order remain native; this list does not become an automatic cleanup selection.
- `issues comments delete <issueID> <commentID>`, `saved-queries delete <queryID>`,
  `tags delete <tagID>`, `issues delete <issueID>` and `article comment delete <article> <comment>`
  act on those selected IDs. DELETE defaults are query-free and optional `--fields` is preserved.
- `article child add <article> --body <json>` and `update <article> <child> --body <json>` use the
  hierarchy endpoints and accept `--mute-update-notifications [boolean]`. Native null content/title
  and extra metadata survive. `article child remove <article> <child>` unlinks the relationship;
  it does not call the article deletion endpoint.

Reads use ReadOnly and remote writes require Update. YouTrack owns server rights and native-value
validation. Existing paging, profiles/auth, human/JSON/RPC, diagnostic causes, EPIPE and dispatched
unknown-write outcomes remain. Cleanup has no implicit search expansion, retry or compensation.
No live-service or cross-version conformance is claimed.

## M04: project setup and team (unreleased main)

Building this source includes M02–M04; npm 0.8.0 contains M01. Milestones merge without version
bumps or npm releases. The complete [current mapping](docs/rest-api-coverage/current/README.md)
uses the same frozen official source and separates complete coverage from reachable operations.

- `bundle user group create/remove` and `bundle user individual create/remove` add or remove
  existing IDs from a user bundle; creation bodies contain `id`. They do not create users or groups.
- `field create --body '{"name":"Severity","fieldType":{"id":"enum[1]"}}'` creates a global field.
  `field update <field> --body <json>` preserves omitted and additional native metadata.
- `project work-item-type create <project> --body '{"id":"TYPE_ID"}'` attaches an existing global
  work type. `delete <project> <type>` removes its project association. `project time-tracking update
  <project> --body <json>` changes native enabled/estimate/timeSpent settings, including false/null.
- `role-assignment list [--query <query>]` and `get <assignment>`, `role list [--query <query>]`
  and `get <role>`, and `permission-catalog list` are ReadOnly service catalogs. Access queries stay
  native, including exact-match suffixes and whitespace. Root `permissions` manages CLI safety gates.
- `role-assignment create --body <json>` requires selected holder/role IDs and native scope `$type`;
  ProjectScope/OrganizationScope also require their project/organization ID. Native extra properties
  and holder types are retained. `delete <assignment>` revokes that assignment without discovery.
- `project team user add/remove` changes direct ownUsers; `project team group add/remove` changes
  direct group associations. Add bodies contain the existing `id`. `project team update <project>
  --body <json>` passes native ownUsers/groups, including empty lists, to YouTrack; no local merge,
  inherited-membership expansion or role grant is synthesized.
- `user profile notifications get/update <user>` reads or changes that user's native preferences.
  Update takes `--body <json>`, for example `{"emailNotificationsEnabled":false}`. Boolean false
  survives in machine output and prints as “no” in the human view.

All mutations require Update; service-side management rights are separate. Writes support `--fields`;
DELETE defaults omit it unless selected. Native JSON/RPC and scrubbed human confirmations retain their
contracts. The pinned reference marks access catalogs/project teams available since YouTrack 2026.1;
this is documentation provenance, with no live or cross-version conformance claim. A conflicting
notification syntax table appends profileID; the pinned OAS/resource and concrete examples select
`/api/users/{userID}/profiles/notifications`, used here without an additional profile selector.

## M03: iterations and working catalogs (unreleased main)

These source additions follow M02; npm 0.8.0 still contains the M01 release. Milestones do not
publish npm or bump package versions. Current coverage and complete remaining gaps are in
[the current mapping](docs/rest-api-coverage/current/README.md).

- `agile create --body <json> [--template <name>]` requires native `name` and explicit
  `projects: [{"id":"PROJECT_ID"}]`. Template accepts `kanban`, `scrum`, `version`, `custom` or `personal`, as listed in the pinned reference.
  `agile update <agile> --body <json>` preserves omitted and additional native settings.
  Existing `sprint create <agile>` now accepts `--mute-update-notifications [boolean]`.
- `bundle enum value create/update`, `bundle version value create/update` and
  `bundle state value create/update` write the selected bundle/value IDs with `--body`/`--fields`.
  New values require name. Archives, colors, localized names, nulls and native extra fields survive.
  Version date values remain native JSON milliseconds/null; no date-string interpretation.
  State `isResolved` is catalog metadata; these commands do not synthesize an issue state event.
- `tags create --body <json>` and `tags update <tagID> --body <json>` maintain global working tags,
  distinct from issue/article tag assignments. Creation requires name; sharing and colors stay native.
- `field defaults get <field>` reads common settings. Use caller-selected `--fields` for native
  subtype attributes such as `bundle`/`defaultValues`; `field defaults update <field> --body <json>`
  preserves the subtype `$type`, arrays, nulls and false without prototype lookup.
- `project field create <project> --body <json>` requires explicit `field: {"id":"FIELD_ID"}`
  and the native ProjectCustomField `$type`. `project field update <project> <field> --body <json>`
  addresses the project-specific instance ID. YouTrack validates prototype/type compatibility.
- `field instance list <field>` lists projects using that field, one native offset page with the
  normal envelope, raw-row continuation and no lookahead or automatic traversal.

New reads use ReadOnly; writes use Update. Native `--fields` projections and human/JSON/RPC
surfaces stay shared. Mutation failures keep their codes/causes and known/unknown outcome distinction;
there are no implicit retries, permission grants or name-to-ID searches. Server management permissions
remain separate from the CLI gate. No live service or cross-version conformance is claimed.

## M02: collaboration and knowledge base (unreleased main)

npm 0.8.0 contains M01. Building this source revision includes M02; milestone completion
does not bump a version or publish npm. The same frozen
282-operation source had 145 complete contracts and 147 reachable operations at M02 completion; current
verified counts and all remaining gaps are in [the current mapping](docs/rest-api-coverage/current/README.md).

- `saved-queries create --body <json>` and `saved-queries update <queryID> --body <json>`
  accept `--fields`. Creation requires native `name` and `query`; updates retain omitted fields.
- `issues project get <issueID>` reads the single project relation. `issues project set <issueID>
  --body '{"id":"TARGET_PROJECT_ID"}'` moves to that exact project, without name lookup.
- `issues vcs-changes create <issueID> --body <json>` links a change using native `version`
  and `state`. `update <issueID> <changeID>` updates its state; `delete <issueID> <changeID>`
  removes only that relation. Native types and future state values are left to the server.
- `commands apply` keeps explicit `--issues`, and adds `--comment`, native JSON `--visibility`,
  signed-Int `--caret`, `--run-as` and `--silent [boolean]`. Omitted, bare-true, true and false
  retain their meaning. Update remains required; YouTrack enforces administrative/silent rights.
- `activities list --categories <categories>` reads one offset page; `activities get <activityID>`
  reads one item. Global list and cursor `activities page` accept `--issue-query`, `--author`,
  `--activity-start` and `--activity-end`; only the cursor page accepts `--activity-id`/`--cursor`.
  Time spellings, queries and cursor direction stay native; no feed traversal is automatic.
- Article create, update, comment add/update and attachment upload accept notification controls;
  only article create and comment add accept `--draft-id`. A draft can be published with `--body '{}'`.
  Normal article creation still requires project; normal comment addition requires text.
- `article tag list/get/add/remove` manages article tag relations with explicit article/tag IDs.
  `article attachment update <article> <attachmentID> --body <json>` edits native metadata;
  `article attachment delete <article> <attachment>` deletes the exact attachment.
- `article comment reaction list/get/add/remove` reads and changes reactions on a selected comment.
  Reaction strings/null and additional native body fields remain intact.

All new reads are ReadOnly; mutations are Update. Project/VCS writes, command application and
article/comment writes expose `--fields` and the API's `--mute-update-notifications [boolean]`
where declared. Notification omission sends no parameter; false is not turned into true.
New DELETE commands accept optional `--fields` from the explicit reference parameter tables;
omission retains query-free requests. Tag/reaction/VCS removal does not
delete the related global object. No automatic write retry or rollback is introduced; ambiguous
post-dispatch failures keep the unknown-outcome diagnostics added in M01.

## M01: issue workflows in 0.8.0

The API inventory is frozen at 282 published operations (281 business routes plus schema metadata).
The M01 release exposes 128 routes. At that release, complete contracts covered 119/282 (42.20%);
nine reachable routes had deferred request controls. The [frozen audit](docs/rest-api-coverage/README.md)
and [current mapping](docs/rest-api-coverage/current/coverage.json) keep these measures separate.

- `issues list --custom-field <name>` is repeatable. Names, order and duplicates are preserved
  as repeated native `customFields` parameters, including every request made by `--all`.
- `issues activity list <issueID> --categories <categories>` reads one offset page;
  `issues activity get <issueID> <activityID>` reads one item. These differ from the native
  `issues activity page` cursor resource. The issue list/page support `--author`,
  `--activity-start` and `--activity-end`; only the cursor page accepts `--activity-id`.
  Cursor values and direction remain opaque, without automatic traversal. Activity time bounds
  remain literal API strings, including native Long values.
- Issue create/update, custom-field set, comment add/update, attachment upload, link add and
  work-item add/update accept `--fields` and `--mute-update-notifications [boolean]`.
  An omitted notification flag sends no parameter; a bare flag means true, and `false` is sent
  as false. The server enforces Apply Commands Silently; this does not mute workflow notifications.
  Only issue create and comment add accept `--draft-id`. Keep `--body` required; use `{}` when
  publishing a draft without additional fields. Normal issue creation still requires project/summary.
- `work-items list` adds repeatable `--author` and `--creator`, `--start-date`, `--end-date`, `--work-start`,
  `--work-end`, `--created-start`, `--created-end`, `--updated-start`, `--updated-end`.
  `--start` stays the raw offset; `--work-start` selects the native temporal `start` filter.
  Filter values remain literal strings so a native Long does not lose precision in JavaScript.
  YouTrack validates date formats, interval semantics and applicability.
- `tags list --query <query>` searches the tag catalogue. `issues tags get <issueID> <tagID>`
  inspects one assignment; tag add and existing tag/link remove commands accept `--fields`.
- `issues attachments update <issueID> <attachmentID> --body <json>` updates native metadata.
  `issues attachments delete <issueID> <attachmentID>` and
  `issues work-items delete <issueID> <itemID>` remove only the selected resource.

Write failures after submission report an unknown outcome when the reply is lost, unreadable or
invalid, or the server returns 5xx. Check the selected object before retrying; no automatic retry
is performed. HTTP 4xx rejection and local validation keep their distinct diagnostics.
- `issues comments reaction list/get/add/remove` take issue/comment IDs, plus a reaction ID
  for get/remove. Add requires `--body` containing native `reaction`; names are not restricted
  to a hard-coded list. Reads use ReadOnly; add/remove use Update, even when remote service
  permissions call these operations reads.

Every new read/write supports `--fields`. DELETE projections follow the explicit official
parameter tables; an omitted projection preserves the prior query-free DELETE. Successful empty
write bodies return JSON null; nonempty native results are scrubbed as usual. Optional fields do
not imply response/version guarantees beyond the public contract. All writes stay Update-gated,
with no implicit lookup, automatic retry, target expansion or binary transfer follow-up.

## URL and token input

Copy the service base address, for example `https://youtrack.example.test/youtrack/`. Include any context path and port; omit `/api`, issue pages and query strings. HTTP and HTTPS are supported. Context segments named `api`, `app/rest`, `admin` or `issues` are
valid deployment contexts; the CLI appends its own service endpoints to the configured base.
Create/copy a permanent token in your YouTrack profile with the **YouTrack** service scope.
See the [optional API reference: permanent-token guide](https://www.jetbrains.com/help/youtrack/devportal/Manage-Permanent-Token.html). Paste only its value: `FICTIONAL_TOKEN_VALUE` is a fictional example.
Do not include `Bearer `, `Authorization:`, or surrounding quotes. The same guidance appears in
`profile configure --help`, `auth login --help`, and before interactive input.

New URL/token input trims outer whitespace, including pasted CRLF. URL trailing slashes are
normalized without losing the context path; internal token symbols remain unchanged. Empty input,
headers/quoted tokens and malformed transport URLs fail with a safe hint before authentication or
persistence. This applies to onboarding, profile URL writes, login, environment/stdin candidates,
`execute` and JSON-RPC (which never prompts). Existing data is retained; use `profile set` or
`profile configure` to correct an old URL. Failed configure input preserves working credentials.

## Sign in locally

Build from the repository root with `npm run build`, then use your current terminal and
the normal CLI pipeline; no wrapper or auxiliary terminal window is required:

```powershell
npm start -- profile configure youtrack-dev
```

Only if this terminal can see the existing configured profile, resume token login without changing it:

```powershell
npm start -- auth login --profile youtrack-dev
```

If login reports a missing profile, run `profile configure` first in that same terminal; do not assume
profile visibility is identical across terminal environments.

Enter the YouTrack server URL when configuring a new profile, then enter your permanent token at the
factory's masked token prompt. Never put a token in chat or command-line arguments.
Use the server origin and any context path (for example `https://youtrack.example.com/track`),
without `/api`, credentials, query or fragment. Normal redirects are followed, including
same-host HTTP-to-HTTPS upgrades with authentication. Other origin changes remove credentials.

Create a token in your YouTrack profile with the YouTrack service scope and only the
account permissions you need. See JetBrains' [optional API reference: permanent token documentation](https://www.jetbrains.com/help/youtrack/devportal/authentication-with-permanent-token.html).
The identity fields follow [optional API reference: My User Profile](https://www.jetbrains.com/help/youtrack/devportal/resource-api-users-me.html).

The candidate is validated before storage in the operating-system credential store.
Non-secret profiles live in current-user AppData for application `youtrack-cli`; the
credential namespace is separate from TeamCity and every YouTrack profile is isolated.
`ReadOnly` starts enabled and `Update` disabled. Every mutation requires an explicitly enabled Update category.

For automation, supply token input from a trusted secret source on stdin:

```powershell
npm start -- auth login --profile youtrack-dev --token-stdin
```

The factory selects a new candidate from explicit `--token-stdin`, then `YOUTRACK_TOKEN`,
then the masked prompt in an ordinary interactive CLI with all three standard streams
attached to TTYs. JSON, JSON-RPC, programmatic calls and redirected streams never prompt.
`--token-stdin` is unavailable in JSON-RPC/programmatic execution because stdin belongs to
the transport; provide the configured environment candidate instead.
Stored credentials remain available for service calls but are never configure/login candidates.
Use secret-manager stdin without putting the token in shell history; there is no token flag
or plaintext fallback.

Configure validates the proposed settings and candidate before changing an existing profile or
credential. Missing or rejected input leaves the existing pair unchanged; a new profile is not
created. After successful validation, configure removes the old credential, saves configuration,
then stores the new credential. A storage failure may leave an unauthenticated profile; no old
credential is restored against changed settings. Repeat `profile configure <name> --token-stdin`
after repairing local storage. Errors never include backend credential diagnostics.
`auth login` replaces credentials without changing endpoint settings. These rules govern the
authentication lifecycle; ordinary non-authentication `profile set` remains a separate operation.

## Controlled mutations

`Update` is disabled by default and isolated per profile. Enable it only when you deliberately
intend to write, using the standard `permissions grant Update --profile <name>` command.
This documentation does not enable it automatically. The local proof remains ReadOnly.

| Command | Required `--body` JSON object |
|---|---|
| `issues create` | Native `project` object and required `summary` (string or null); additional native fields are preserved |
| `issues update <issueID>` | Native issue JSON; known supplied field types are checked |
| `issues comments add <issueID>` | Native comment JSON; text may be a string or null |

Missing `--body` and malformed JSON fail before profile onboarding or credential access.
Description and comment text preserve multiline Markdown. Omitted fields remain unchanged;
`description: null` clears the description. Additional fields, including visibility and notification controls, reach the API unchanged.
The server decides applicability and required fields.

`customFields` is an array sent in the same single POST; empty arrays, repeated entries and
multiple identity attributes are preserved. Each entry supplies its `$type`; future types and native
metadata are forwarded. Known value types are checked as below. YouTrack resolves project, field
and value selectors inside the write; the CLI performs no catalog reads or ID rewriting.
`$type` is never inferred and nothing is cached.

```powershell
npm start -- issues create --profile youtrack-dev --body '{"project":{"shortName":"DEMO"},"summary":"Example","customFields":[{"$type":"SingleEnumIssueCustomField","name":"Priority","value":{"name":"Major"}}]}'
```

Every narrative write also accepts a UTF-8 file for its text field: `--description-file` (issue
create/update), `--content-file` (article create/update) and `--text-file` (issue/article comment
add/update). `--body` stays required (use `{}` when the file supplies the only field) and must not
also contain that field. Files are read only after Update admission, as strict UTF-8 with an
initial BOM removed and otherwise unchanged (line endings included); invalid encoding, directories
and unreadable paths fail before any request. Clearing still uses `--body` with `null`. There is no
local size ceiling, and stdin is not used because JSON-RPC owns it.

For Windows **CMD**, replace the example project ID before deliberately running a write:

```cmd
npm start -- issues create --body "{\"project\":{\"id\":\"PROJECT_ID\"},\"summary\":\"Example issue\"}" --profile youtrack-dev
```

The equivalent **PowerShell 7** command uses ordinary single quotes around JSON:

```powershell
npm start -- issues create --body '{"project":{"id":"PROJECT_ID"},"summary":"Example issue"}' --profile youtrack-dev
```

Windows **PowerShell 5.1** requires escaping the inner quotes through the npm/CMD pipeline:

```powershell
npm start -- issues create --body '{\"project\":{\"id\":\"PROJECT_ID\"},\"summary\":\"Example issue\"}' --profile youtrack-dev
```

Updates return `id,idReadable,summary,updated`; comment creation returns the same finite fields
as comment reads. An empty successful mutation response becomes JSON `null`. No mutation retries,
implicit follow-up reads or automatic permission grants occur. Malformed bodies and remote errors
use safe diagnostics without echoing submitted JSON or server response text.

## Additional commands through operation 50

The same tree is available through normal npm commands, JSON and JSON-RPC. Use leaf `--help`
for exact arguments and permission categories; no endpoint, header or arbitrary HTTP escape hatch exists.

| Family | Additional commands | Operations |
|---|---|---:|
| Queries and commands | `commands assist/apply`, `search assist`, `issues count`, `saved-queries list/get` | 6 |
| Project, users and fields | `project get`, `project field list/get`, `user list`, `issues fields list/get/set` | 7 |
| Links and tags | `link-types list/get`, `tags list/get`, `issues links list/get/issues/add/remove`, `issues tags list/add/remove` | 12 |
| Activity and context | `activities page`, `issues activity page`, `issues comments get/update`, `issues vcs-changes list/get`, `issues sprints list` | 7 |
| Work time | `issues time-tracking get`, `issues work-items list/get/add/update`, `work-items list/get` | 7 |
| Attachments | `issues attachments list/get/upload` | 3 |

`commands assist`, `search assist` and `issues count` use POST on the wire but remain ReadOnly:
they compute suggestions or counts without applying changes. Assist is not a dry run or a guarantee
that a later command will succeed. Required `--query` is preserved exactly; optional `--caret` uses the API's signed Int type; the server validates position semantics.
`commands apply` requires comma-separated explicit issue IDs via
`--issues`, never an implicit search expansion. M02 adds explicit run-as/silent controls as described above. Count returns the
server's `count`, including `-1` (pending) or `null`; the CLI never polls automatically.

Activity cursor commands require `--categories <categories>` and support `--cursor`, `--reverse` and
`--fields`. They return one server-defined page with `activities`, before/after cursors and flags.
They do not support offset or page-size flags and do not fetch a next page automatically.
Global and issue activity filters, plus offset item list/detail commands, are described in M01/M02 above.

Project fields expose field types and settings without following bundle references. Issue fields
preserve polymorphic values, including scalar, null and array values. `issues fields set` accepts
an explicit `$type` and `value`: single/multi Enum, Build, Version, Owned, Group and User types;
State, Simple, Date, Period and Text types. References use explicit identity selectors (`id`,
`name`, and `login` for users); `fields set` performs no lookup of its own. Single values can use `null`,
multi values use `[]` to clear. Period values accept signed 32-bit integer `minutes`
and/or `presentation`; dates use
integer Unix milliseconds. Text values use `{ "text": "..." }`. StateMachine fields instead
require `$type` and `{ "event": { "id": "..." } }`; inspect `possibleEvents` explicitly with
`--fields` before selecting a transition. Additional native fields and future `$type` values reach the API unchanged, including readback
metadata alongside an event. Known value types still validate JSON/scalar structure.

Relationship additions accept a native reference, such as `{ "id": "TARGET_ID" }`, and preserve metadata. Link IDs include the explicit
direction returned by YouTrack. `issues links remove <issueID> <linkID> <targetIssueID>` unlinks
the target; `issues tags remove <issueID> <tagID>` unassigns the tag. Neither deletes the issue or
tag itself. Comment updates preserve native fields, including nullable text, visibility and pinning.

Work-item creation requires `duration.minutes` (signed 32-bit integer) and/or string
`duration.presentation`. Both may be supplied; YouTrack interprets presentation text. Writable
fields are `duration`, `date`, `author`, `type`, `text`, `created` and `updated`. Dates/timestamps
use integer Unix milliseconds; `author` and `type` use `{ "id": "..." }` or `null`. Text may be
empty, multiline or null; `updated` may also be null. Updates preserve additional native fields and
leave omitted fields to the server. No client-side date, user or duration conversion is guessed. Work-item
writes accept `--fields`; only global `work-items list` supports `--query`. Native date/author filters are described in M01 above. Time-tracking inspection defaults to `id,enabled`, without
expanding work items.

Attachment reads default to `id,name,size,mimeType`; explicit read projections still scrub signed
URLs. Upload requires one explicit `--file <path>` and sends one native multipart request, returning
metadata only. Missing/empty/NUL path syntax fails before onboarding. Regular-file and read
checks occur inside the Update handler before HTTP, so denied uploads do not inspect files.
Only the basename becomes the multipart filename; errors never echo local paths. No attachment
binary download or signed-URL follow-up was included in the first 50 operations; the separate
download capability is documented below.

## Additional commands through operation 100

These add fifty REST operations. Two `--direct` switches each select between two documented
read endpoints, so at this stage the tree had 98 service leaves for 100 operations.

| Family | Additional commands | Operations |
|---|---|---:|
| Global fields and choices | `field list/get`, `field type list`, `bundle enum/state list/get`, `bundle enum/state value list/get` | 11 |
| User directory and bundles | `user get`, `bundle user list/get`, `bundle user member list`, `bundle user group list/get`, `bundle user individual list/get` | 8 |
| Groups and project teams | `group list/get`, `group member list [--direct]`, `group subgroup list`, `project team get`, `project team group list`, `project team user list [--direct]` | 9 |
| Time metadata | `time-tracking settings get`, `time-tracking work-time get`, `work-item-type list/get`, `project time-tracking get`, `project work-item-type list/get` | 7 |
| Boards and sprints | `agile list/get`, `sprint list/get/create/update` | 6 |
| Articles | `article list/get/create/update`, `article comment list/get/add/update`, `project article list` | 9 |

Every new read supports `--fields`. Offset lists retain one-page `--page-size`/`--start` behavior;
details and settings reads have no paging flags. Bundle defaults omit nested values and members:
use the matching paginated child command. Archived enum/state values are preserved; state
`isResolved` is a resolution classification, not a list of workflow transition events.
Global field, bundle and value detail IDs are opaque database IDs; no name lookup is performed.

User-bundle `member list` includes membership supplied by groups and directly added users.
`individual list/get` covers only users added directly, and `group list/get` covers attached
groups. `group member list` and `project team user list` return all visible members by default;
`--direct` selects the server's direct-membership endpoint. The CLI does not crawl groups or
infer membership locally. Project-team endpoints require YouTrack 2026.1 or later; unavailable
or denied routes remain errors, with no alternate Hub route or permission changes.

Time metadata exposes the server's work schedule and available work-item types without changing
settings or synthesizing locale/calendar defaults. Global/project type lists are paginated;
other metadata reads return one object. No new date, author, search or archive filters are added
by these directory commands.

Sprint reads use an explicit board ID; the literal sprint ID `current` goes directly to the
same documented detail/update route. Create requires a string `name`; update
preserves supplied native fields. Known fields include `name`, `goal`, `start`, `finish`,
`archived` and `isDefault`. Goal preserves empty/multiline text or null; dates are safe integer
Unix milliseconds or null; flags are booleans. Create additionally accepts
`previousSprint: { "id": "..." }`, which explicitly moves unresolved issues from that sprint.
It is never inferred; the server validates its applicability. `isDefault: true` affects where matching new
board issues go. Additional native sprint properties are forwarded; separate agile mutations and deletion remain outside
this block. Reads and writes support `--fields`; there is no carryover lookup or polling.

Article create accepts a native project reference and nullable summary. Article and comment
updates preserve additional native fields, including parent, visibility and pinning. Known text
fields preserve multiline strings and documented null values; omission leaves API defaults in charge. Article and comment reads/writes
support `--fields`; article lists have no query flag. Article attachment transfer and hierarchy
reads are documented below. Native body properties are validated by the API; separate deletion remains outside this command tree.

## Remaining bundles, article hierarchy and attachment transfer

`bundle build/owned/version list/get` and their `value list/get` children expose twelve
ReadOnly operations. Lists use the normal bounded page; bundle defaults do not expand values.
Archived values and nullable owners are preserved without local lookup or filtering. Version
value `startDate` requires YouTrack 2023.1 or later; the CLI does not substitute another field.

`article attachment list/get/upload` and `article child list/get` plus `article parent get`
add six operations. The hierarchy commands read only the selected relationship and never
recursively traverse descendants. A literal JSON null parent remains null; an empty body,
404 or malformed response is still an error. Article attachment upload requires one explicit
`--file`, the Update gate, and uses native multipart after checking that the file is regular.
It supports `--fields` for the response. No implicit file discovery is provided, and upload never
grants permissions.

```powershell
npm start -- issues attachments download DEMO-1 1-1 --profile youtrack-dev
npm start -- issues attachments download DEMO-1 1-1 --output report.txt --max-bytes 1048576 --profile youtrack-dev
npm start -- article attachment download KB-A-1 7-1 --profile youtrack-dev
```

Issue and article attachment downloads first read the exact attachment's fixed metadata, then request only
its returned URL. The file request sends neither Authorization nor cookies and follows normal HTTP redirects.
HTTP(S) URLs may use an external/CDN origin or another native file path; userinfo and raw
controls are rejected at the transport boundary. Signatures stay in memory and never
appear in metadata output, errors or the download result.

Files default to the invocation working directory using the metadata filename. Unsafe or ambiguous
default filenames are rejected. `--output <path>` chooses a relative path against that working
directory or an absolute path. The parent must exist. Existing files and symlinks are never overwritten,
regardless of the selected profile. Downloads have no default byte ceiling; optional `--max-bytes`
bounds streamed bytes and Content-Length. Core stages bytes in a fresh private `.download-*` directory
beside the output file, then hard-links only the complete identity-checked file into place. Partial files are removed when their identities remain trusted. Output
contains only sanitized ID/name, local path, byte count and content type.
No binary data is printed. Publication uses an exclusive hard link; unsupported filesystems
fail without a copy/rename fallback. Existing links or junctions in the directory chain and detectable directory/staged/destination
replacement are rejected. Unknown replacement files are never removed. This protects
the output destination; it cannot prevent every malicious same-account replacement after the
last identity check. Errors report whether publication occurred and whether private staging cleanup
failed, without raw filesystem/service details. The local proof never invokes download or upload.

`article export <article> [--output <path>]` (ReadOnly) saves the article content, with signed
URLs scrubbed like console output, as `<idReadable>.md` in the invocation working directory through the same no-overwrite
publication. Edit it and send it back with `article update <article> --body '{}' --content-file <path>`.
The result's `redacted: true` means the file contains `[redacted]` placeholders where console-output
scrubbing removed text (signed or credential-bearing URLs, undecodable URL-like text or the token);
sending it back unchanged would replace that text in YouTrack, so restore it first or edit that
article elsewhere.
The former `--name` option and `downloads list/delete/clean` commands are removed. Existing files
in profile AppData are left untouched; move or delete them explicitly if desired. New user outputs
are not owned by profile cleanup.

## Issue batches

`issues batch validate --file <manifest>` (ReadOnly; sends no requests and never uses the token,
but like every service command runs against a configured profile) and `issues batch apply --file
<manifest>` (Update, checked before the file is read) accept a `.json` array of rows or a UTF-8 `.csv`
with a header row. A row is `action` (`create`/`update`), `issue` (update only, an exact ID, never a
search) and the same body fields as `issues create/update`. CSV columns are `action`, `issue`,
`project.id`, `project.shortName`, `summary`, `description` and `customFields` (a JSON array cell);
an empty cell omits the field, so clearing needs JSON. CSV syntax errors and unknown or repeated
columns fail as a whole; malformed rows fail with the row number. Additional JSON row fields
are forwarded as native issue fields. Either way nothing
is written. The API resolves native selectors inside each row's single write.

Apply runs rows in order, one request per write without selector-discovery reads or retries,
rollback or compensation; a batch is not atomic. It stops at the first unsuccessful row unless
`--continue-on-error` is given. Each row reports `completed` (with the write result), `failed`
(rejected before the write or with HTTP 4xx: not applied), `uncertain` (connectivity, 5xx or an
invalid response: it may have been applied) or `unattempted`; the overall `status` is `completed`
or `incomplete`, with counts. Only a fully completed batch succeeds (exit code 0). Any `failed`,
`uncertain` or `unattempted` row fails the command with `batch.incomplete` (exit code 1).
The full summary, counts, rows and `failedRows` metadata stay available: ordinary CLI prints the
summary on stdout and the reason on stderr; `--json` prints the summary on stdout and one machine-error
line on stderr; JSON-RPC carries `error.data.code` and `error.data.result`; `execute` rejects with
a `CliError` carrying `.result`.

This is a breaking change: scripts that previously relied on exit 0 plus `status: incomplete`
must now handle the failure path and read the same summary from the appropriate surface.
See the [optional provenance: 0.6.1 release notes](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/CHANGELOG.md#061).

`--failed-rows <path.json>` saves the `failed` and `unattempted` rows
as a manifest at the requested path relative to the invocation working directory for deliberate resubmission; `uncertain` rows are left out and must
be checked in YouTrack first. A save failure is reported in `failedRows.error` without hiding row results.

## Compared with `yt` 0.22.2

The everyday issue and article workflows have explicit, typed commands:
- issue creation and updates with custom fields in one request;
- exact human-readable selectors;
- budgeted `issues list --all`;
- JSON/CSV batches;
- attachment downloads, article export and text-file inputs.

Deliberate differences:
- field types are never guessed and selectors never take the first match;
- field-value names are validated by YouTrack rather than pre-resolved;
- a failed batch never deletes created issues to compensate.

Not provided:
- burndown and velocity reports;
- interactive tables, themes, tutorials and aliases;
- stdin input (JSON-RPC owns stdin).

## Local proof and offline tests

After configuring a profile, explicitly run:

```powershell
npm run test:integration -- --profile youtrack-dev
```

The explicit local proof uses twenty-four fixed ReadOnly rows through the compiled CLI, named profile
and platform secret store: current user; projects and issues (up to three each); one selected issue and its
comments; one selected project and its custom fields; users; and the selected issue's custom
fields, attachments, tags, links and work items. It also reads global fields, user bundles,
groups, the selected project's team/time settings, global work-item types, agiles and articles.
It also lists build, owned-field and version bundles. No bundle values or article descendants
are followed, and no binary download is invoked.
Every collection is capped at three. Projects
exercise their default projection; all added reads request only `id`. IDs remain in memory.
Output contains only static PASS/FAIL/SKIP, endpoint templates and counts. Denied or malformed
attempted reads fail. Reads without a usable project/issue prerequisite are skipped; skipped rows
are not availability evidence, and failed prerequisites still fail the overall proof. No real
writes, automatic pagination or further resource discovery occur. CI and arbitrary URL/token/
command arguments are refused; inherited `YOUTRACK_TOKEN` is removed case-insensitively.
The shared Core proof invoker keeps the 30-second timeout and separate 64-KiB stdout/stderr bounds;
see the [shared CI and process contract](docs/testing.md).
Do not run it in CI or add it to generic test commands. A failed proof requires local
configuration/TLS/permission investigation; its payloads are deliberately not logged.

`npm test` builds and runs deterministic offline tests, including MSW against the actual
client and declaration, synthetic profile/credential isolation, JSON-RPC and proof safety.
Tests inject `AppArguments` rather than redirecting the user's data directories.

## Source development

`npm ci`, `npm test`, and `npm run test:package` build and test this repository independently.
See [release and Core adoption gates](docs/release.md) and [migration provenance](docs/migration.md).
