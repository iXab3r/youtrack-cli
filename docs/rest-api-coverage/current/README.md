# M04: project setup and team

Ten owner-authorized stories US-039–048. [Delivery](https://github.com/iXab3r/youtrack-cli/issues/132)
and [milestone](https://github.com/iXab3r/youtrack-cli/milestone/4) own final acceptance/status.
The owner approved sequential review, merge, exact-main CI and closure with one independent
read-only reviewer per milestone/rechecks and no per-milestone releases. Product stays0.8.0,
Core exact0.7.1. npm0.8.0 contains M01; M02–M04 are source additions awaiting a future release.

## Frozen universe and result

The original official source has **282 operations**, including281business and one schema metadata
operation. M03 ended at161complete/162reachable. M04 adds23new routes, completing all23contracts:
**184covered,1partial,97missing,0uncertain;185reachable (118ReadOnly/67Update)**.
Full coverage65.25%, +8.16percentage points; reachability65.60%, +8.16points. The remaining partial
is group-members query support, assigned to the approved later milestone; no gap is silently closed.

There are188service leaves (183ordinary REST plus five workflows),190variants including two
--direct selectors, and56offset lists. These are separate measures, not the REST denominator.
Every operation/binding/permission/surface/test/reason remains in [JSON](coverage.json),
[TSV](coverage.tsv) and [summary](summary.json), using [pinned facts](../official-operations.json)
and [source provenance](../source-lock.json). Original0.7.1audit remains unchanged. baselineHead
records source lineage; per-file product/test/package fingerprints additionally guard source drift.

## Native contracts and source discrepancies

User-bundle groups/individuals POSTs add existing IDs, not new directory entities. Global custom-field
creation requires name and fieldType.id; updates preserve omitted and extra native metadata. Project
work-item-type POST attaches an existing global type by id, correcting the planning name-only example
before red tests. Project time settings retain false/null and native estimate/timeSpent references.

ReadOnly access catalogs preserve native query text, including whitespace/exact-match suffixes. They
are separate from local CLI permissions. Role assignment requires holder/role IDs and scope.$type;
known project/organization scopes require their IDs. Unknown native types/properties remain server
validation, without hidden identity lookup, role grant, fallback or closed local type registry.
The pinned reference marks access catalogs/project teams available since2026.1; this is documentation
provenance, not tested deployed-server or cross-version support.

Team ownUsers changes direct participation; group changes preserve native group types. Team updates
pass ownUsers/groups and empty lists to YouTrack without local merge, inherited-member expansion or
transaction/retry assumptions. Native body properties remain intact. Notification updates preserve
booleans such as emailNotificationsEnabled=false. Its syntax table appends profileID, conflicting
with the frozen OAS/resource path and concrete examples. The selected operation is the unchanged
/api/users/{userID}/profiles/notifications; no extra operation/profile-ID lookup is invented.

DELETE optional --fields follows the earlier source-discrepancy disposition: field tables name it
while request syntax/OAS omit it. The selected projection is forwarded; default DELETE stays
query-free. No live server conformance is inferred from this offline disposition.

All writes require Update, reads ReadOnly; server management rights remain separate. Existing
profiles/auth/secrets, native JSON/RPC/execute, raw-offset pages, no lookahead, cancellation, EPIPE,
diagnostic codes/causes, preflight and dispatched-unknown outcomes stay tested. No automatic mutation
retry/compensation or raw proxy/CRUD runtime is added. Empty human confirmations retain scrubbed
selected identities/context; selected IDs are fallbacks rather than repeated result IDs.

## Verification and review boundaries

Each story has a committed red run on its own branch before implementation; public issues record
red/green commits. Author **509offline tests (16M04nodes) PASS**, covering all23contracts across
human/JSON/execute/RPC, native encoded paths/projections/query/body, opposite-category denial, remote
failures, mutation ambiguity, local identity/scope preflight, empty/sparse confirmations, credential
labels, false flags, native scopes and raw-offset/zero-size/overflow behavior. All shipped regressions
remain green. Tests use native fetch/MSW, synthetic profiles and memory secrets; no live proof.

Local Cake Verify includes installed package tests for all23new SDK exports, native access queries,
scoped empty-create results and notification resource paths, plus existing installed CLI/RPC/EPIPE
checks and two release-safety checks. No release target/version bump/npm publication occurs.
Fresh traversal188leaves/190variants/185operations has no failed variants. Mapping uses the509-test
native-request trace; repeat generation is byte-identical. Separate raw-OAS/reference reconciliation
reports no unexplained operations/duplicates. This is **author self-check, not independent review**.
Final full-M04 review and exact-main CI are separate gates recorded in the tracker.

## +50 checkpoint and final shorter batch

Original baseline118reachable; M04 began at162 (+44). US039/040 added six unique operations; at168
(+50), implementation stopped. [Independent checkpoint](https://github.com/iXab3r/youtrack-cli/issues/173)
found one accepted MINOR: duplicate selected IDs in sparse human confirmations. [Bug174](https://github.com/iXab3r/youtrack-cli/issues/174)
was fixed with regression5094fff before correctionb414073; the same reviewer rechecked36focused tests
and reported PASS without unresolved findings. Author corrected498-test/probe/repeat/raw-source
checks also passed. Evidence and concrete sample diffs were published before operation51/US041.

The final remaining17new operations bring185reachable, cumulative+67. Final shorter-batch authoring
review remains part of the full milestone review. Core pin/integrity are unchanged with zero local
Core source changes; upstream handwritten Core source is absent, so no invented size is reported.
Physical nonblank handwritten lines, comments included, generated output excluded. src/tests/proof
are TypeScript; scripts count all tracked audit/build tooling separately:

| Surface | Original baseline | M04 baseline | Current | Delta M04 | Delta original |
|---|---:|---:|---:|---:|---:|
| src | 3813 | 4433 | 4671 | +238 | +858 |
| tests | 7482 | 8111 | 8264 | +153 | +782 |
| integration-tests | 165 | 165 | 165 | +0 | +0 |
| scripts | 559 | 1122 | 1153 | +31 | +594 |

Counts refer to source lineage73854f2 and git-tracked paths under src/,tests/,integration-tests/,scripts/;
subsequent generated-doc changes do not alter those counts. Tests/tooling stay separate from source;
source growth is not presented as an authoring reduction.

Same-capability comparisons, including all helper cost:

- Detail: original getProject/readObjectAt/projectedRead remain; new getRole/getRoleAssignment and
  getUserNotifications reuse that boundary with concrete paths/default projections. No resolver layer.
- Collection: original listProjectFields/readCollectionAt/pagedRead remain; listPermissions reuses
  them. listRoles/listRoleAssignments directly add the native query to page/readPage, because the
  ordinary collection helper does not forward query. Native whitespace and offset contracts survive.
- Mutation: M04-baseline addArticleTag (revision534cd54aa4b33aa4ba3184d0e8bcfc1e7d3f7b15) spells
  native id validation/mutate/fields directly. New team-user,
  team-group and work-type attachments use that same direct pattern. User-bundle group/individual
  share only a local memberBody check. Field/assignment creation adds real required native selectors;
  no weak validation or omitted behavior is counted as reduced glue.
- Six concrete DELETE declarations use the11-line projectedDelete binder over existing admitted
  operationCommand. It removes repeated option/argument wiring while service paths remain visible.
  No runtime policy or new transport/dependency/DSL is introduced.
- Human labels reuse the service sanitizer and invocation-local WeakMap for native empty responses.
  A small mutation view distinguishes selected identity from owner context; domain views render
  settings flags, holders and scopes without raw metadata. All state/helper cost is counted above.

No new shared Core mechanism is proposed; existing targetCommands/profiles/secrets/admission/output/
RPC/cancellation/EPIPE APIs remain service-neutral and unchanged. The complexity tradeoff is a few
local presentation/validation helpers with actual consumers, while direct service calls remain easy
to inspect. Concrete diffs/checkpoint verdict are public in173; final verdict belongs to delivery132.

Reproduce after build: run probe.mjs and observe-tests.mjs into an ignored capture, generate.mjs twice,
compare coverage JSON/TSV/summary bytes, then crosscheck.py against pinned raw OAS/reference captures.
See the frozen audit README for exact commands and source-drift limitations.
