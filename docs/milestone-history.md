# M01–M08 delivery history

These are the per-milestone delivery notes and native contract decisions. Status/version wording
reflects the time of each milestone; the [current command guide](../README.md) owns current usage.
M01 shipped in0.8.0; the consolidated0.9.0 source includes M02–M08 and stabilization.
The original frozen audit/source facts remain separate.

## M08: installation maintenance (unreleased source)

This source includes M02–M08; npm0.8.0 contains M01. M08 adds21REST operations, reaching the
frozen **282/282** official operations: [mapping and source limits](rest-api-coverage/current/README.md).
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
npm publication. M07 adds34REST operations; [current coverage](rest-api-coverage/current/README.md)
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
npm publication. M06 adds26REST operations; [current coverage](rest-api-coverage/current/README.md)
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
npm publication. [Current coverage](rest-api-coverage/current/README.md) retains the frozen
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
bumps or npm releases. The complete [current mapping](rest-api-coverage/current/README.md)
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
[the current mapping](rest-api-coverage/current/README.md).

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
verified counts and all remaining gaps are in [the current mapping](rest-api-coverage/current/README.md).

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
nine reachable routes had deferred request controls. The [frozen audit](rest-api-coverage/README.md)
and [current mapping](rest-api-coverage/current/coverage.json) keep these measures separate.

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
