# M06: administration and scoped operations

Ten owner-authorized stories US-028/030/053–060 and the approved local initial-password import.
[Delivery](https://github.com/iXab3r/youtrack-cli/issues/213),
[review](https://github.com/iXab3r/youtrack-cli/issues/258) and
[milestone6](https://github.com/iXab3r/youtrack-cli/milestone/6) own acceptance and final status.
Milestones proceed through independent review, merge, exact-main CI and closure sequentially,
without version bumps/npm publication. Product0.8.0/Core exact0.7.1 remain. npm0.8.0 contains M01;
M02–M06 are source additions awaiting an owner-selected future release.

## Frozen universe and result

The official pinned universe remains **282operations**,281business plus one schema metadata route.
M05 ended201complete/reachable. M06 adds **26unique operations**, exactly26missing→covered and no
other status changes: **227covered,0partial,55missing,0uncertain;227reachable**. Complete coverage
and reachability are **80.50%**, both+9.22percentage points. ReadOnly127/140, Update100/142;
remaining13ReadOnly and42Update. These counts measure operations, not payload/version conformance.

There are231service leaves:225ordinary REST plus six workflows,233variants including two --direct
selectors, and61offset lists. Local initial-password import is a workflow, contributes no REST
operation and does not advance authoring counters. Complete per-operation paths/bindings, permission,
surfaces, tests and remaining-gap reasons are in [JSON](coverage.json), [TSV](coverage.tsv) and
[summary](summary.json), from [pinned facts](../official-operations.json) and
[source provenance](../source-lock.json). Original0.7.1audit artifacts stay frozen. baselineHead is
source lineage; product/test/package fingerprints independently detect source drift.

## Native decisions and preserved contracts

Project create requires native name/shortName/leader.id; template is optional scrum/kanban.
The accepted +100checkpoint finding corrected project and baseline board template handling against
explicit lists in the pinned native descriptions (board:kanban/scrum/version/custom/personal).
Absence of a Swagger enum does not override a primary reference's explicit finite list. Direct SDK
and pure CLI parser share service-specific validators; invalid CLI values fail before secret/HTTP.

Scoped issue CRUD uses /api/admin/projects/{id}/issues and child paths, preserving repeated native
customFields on lists, summary requirements, nullable update text and declared notification controls.
Organizations use native /api/admin/organizations; group, role and link-type CRUD retain direct paths.
Role permissions use native permission objects/id keys despite a conflicting generic read-only
annotation; the endpoint description/sample explicitly permits setting them. No mandatory role name
or permission-key enum is invented. Link types require name and both direction labels on create.
Selected article/board/sprint/scoped-issue cleanup has no discovery, retry, compensation or search
expansion. DELETE remains query-free by default, with optional --fields under the existing documented
field-table-only source disposition.

User creation requires login/password in the native HTTPS JSON body. The owner resolved US056
readiness by selecting an additional local Update command: user initial-password import <alias>
--from-env. It uses YOUTRACK_INITIAL_PASSWORD through Core's public invocation environment and
profile-scoped secret store, no HTTP for configured/authenticated profiles and no value output.
The user-initial-password:<alias> namespace prevents overwriting bearer identity. Exact password
bytes survive; missing/empty env or storage failure never falls back to plaintext. user create
--password-secret reads only that selected-profile alias, has no env fallback and rejects CLI
body.password. Known initial passwords are scrubbed from responses/JSON echoes/keys, human fallback
labels and causal diagnostics. Core owns storage and error rendering; no runtime implementation is
copied. Aliases remain stored after creation/rejection and require platform-store/SDK lifecycle
management. CLI profile deletion removes auth, not these auxiliary entries; no silent data deletion.

User update email follows the pinned endpoint's normative POST sample despite the generic entity
read-only annotation. This is no Hub call or broad account-writability/version guarantee. Native
extra JSON remains available; password rotation is not a CLI workflow. No Cloud/Server/deployed-version
conformance or live write is claimed by these offline source contracts.

All reads retain ReadOnly; remote writes and local import require Update. Existing profiles/auth,
credential identity, admission before effects, human/JSON/execute/RPC, projections, raw-offset paging,
no lookahead, cancellation, EPIPE141, diagnostic codes/causes and unknown write outcomes remain.
Native successful empty writes stay null in JSON/RPC; human output names scrubbed selected objects.

## Author verification and independent review boundary

Each story has a committed red test on its own branch before implementation, with public red/green
heads. Author **548offline tests PASS**,24newnodes:14M06story/edge cases,7password security/profile
cases and3template regression nodes. Native fetch/MSW checks exact paths/query/body, all four
surfaces, opposite-category denial before effects, HTTP failures and ambiguous writes without retry.
Profile-interleaved RPC/password alias isolation, env import, exact bytes, bearer collision protection,
missing/failing store, no env fallback/raw CLI password, reflected credential redaction, HTTPS
preflight and retained causal codes are separately exercised with synthetic memory secrets.

Cake Verify PASS includes the full548tests, installed26newSDKexports and import→create/scoped-delete
contracts, existing installed executable/JSON/RPC/EPIPE checks and two release-safety tests. No release
target or live proof ran. Native traversal is231leaves/233variants/227operations with no failed
variants. Fresh full-suite native-request trace supplies evidence for every bound operation.
Repeated generated JSON/TSV/summary bytes match; raw capture extraction reproduces original official
facts/source-lock bytes. The separate raw-source algorithm finds no unexplained operations or
duplicates. There are no test-only transport operations or bound-operation evidence gaps.

The probe's synthetic link-type create body was updated for the native required direction labels;
product/test/package bytes and the548-test trace remain unchanged. The local import is classified
separately as a workflow and verified in actual CLI/package tests. All preceding results are **author
self-checks**. Independent final milestone/shorter-batch review and exact-main CI are separate gates,
recorded in the delivery/review trackers; generation does not imply their completion.

## Authoring checkpoints and final shorter batch

Original baseline118reachable; M06 begins201(cumulative+83). Six whole stories add17operations to
218(cumulative+100), then independent checkpoint review/correction/recheck PASS before operation101.
Accepted bug259 covers project templates plus the author's same-contract baseline board correction.
The remaining four stories add9operations to227(cumulative+109). Final shorter-batch review covers
these nine plus the whole M06 diff and local workflow. Flags/aliases/provisioning do not count as REST.

Physical nonblank handwritten lines include comments; generated output is excluded. Exact path sets
are tracked files under each surface. Source/tests/proof are TypeScript; scripts count audit/build
and installed tooling separately. Core pin/integrity and localCore delta0 are unchanged; upstream
handwritten Core is absent, so its size is not invented.

| Surface | Original baseline | M06 baseline | Current | Delta M06 | Delta original |
|---|---:|---:|---:|---:|---:|
| src | 3813 | 4809 | 5053 | +244 | +1240 |
| tests | 7482 | 8376 | 8651 | +275 | +1169 |
| integration-tests | 165 | 165 | 165 | +0 | +0 |
| scripts | 559 | 1182 | 1204 | +22 | +645 |

Product/test lineage b82b5ef, M06baseline d2ea89676b74d2dfa2bfb22606ebf72ad26f1fa0 and original
1c501faf75435bc671e3ee314c1938db3dadcd9f. Subsequent probe fixture/docs changes do not alter product
fingerprints. Counts include all helper/setup cost; growth is not claimed as an authoring reduction.

Same-capability comparisons use the M06 baseline d2ea896:

- Detail: getProject/readObjectAt/projectedRead remain; scoped issue/organization reads reuse their
  concrete path/projection boundary. Their views retain native identity/context without extra calls.
- Collection: listUserSavedQueries/readCollectionAt/pagedRead remain; organizations reuse the pair.
  Scoped issues directly compose page/readPage/customFieldQuery, that helper's third actual consumer.
- Mutation: deleteIssue/deleteObject/projectedDelete remain; selected scoped cleanup uses the same
  binder. Group/org/role/link writes keep local native validation, mutate and explicit paths.
- User password submission adds a two-consumer service writer and extends existing response scrubbing
  with known credential values/JSON forms. Diagnostic causes use public Core diagnosticCause with
  explicit values; storage/environment/permissions/output/RPC remain Core public APIs. Human labels
  retain only scrubbed identity in an invocation-local WeakMap, never the password or a client cache.
- Template validation, local provisioning and credential safety add concrete behavior/cost rather
  than hide code behind a framework. No schema DSL, generic CRUD runtime, dependency or Core fork.

Final independent acceptance belongs to213/258. Reproduce after build: probe.mjs and observe-tests.mjs
into an ignored capture, generate.mjs twice and compare JSON/TSV/summary bytes, extract.py from
pinned raw capture, then crosscheck.py. Frozen audit README supplies exact commands and upstream-drift
limitations. All55remaining operation rows are retained for the approved M07/M08 milestones.
