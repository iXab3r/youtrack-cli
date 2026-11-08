# M07: schema and work-time lifecycle

Ten approved stories US061–070 and34newREST operations, allUpdate.
[Delivery](https://github.com/iXab3r/youtrack-cli/issues/264),
[review](https://github.com/iXab3r/youtrack-cli/issues/318) and
[milestone7](https://github.com/iXab3r/youtrack-cli/milestone/7) own acceptance/final status.
Milestones proceed through independent review, merge, exact-main CI and closure sequentially,
without version bumps/npm releases. Product0.8.0/Core exact0.7.1 remain; npm0.8.0 contains M01,
while M02–M07 are source additions awaiting an owner-selected future release.

## Frozen universe and result

The pinned official universe remains **282operations**,281business plus one schema metadata route.
M06 ended227complete/reachable. M07 adds **34unique operations**, exactly34missing→covered and no
other status changes: **261covered,0partial,21missing,0uncertain;261reachable**. Full coverage and
reachability are **92.55%**, both+12.06percentage points. ReadOnly127/140 and Update134/142;
remaining13ReadOnly/8Update. These are operation counts, not exhaustive payload/version conformance.

There are265service leaves:259ordinary REST plus six workflows,267variants including two --direct
selectors, and61offset lists. No new list/workflow is added by M07. Those measures do not define the
REST denominator. Complete paths, real callsites/bindings, permission/surfaces, tests and all21gap
reasons are in [JSON](coverage.json), [TSV](coverage.tsv) and [summary](summary.json), from the
[pinned facts](../official-operations.json) and [source provenance](../source-lock.json). Original
0.7.1audit stays frozen. baselineHead is code lineage; fingerprints guard product/test/package drift.

## Native decisions and preserved behavior

Global work-type creation requires native name; autoAttached is boolean. Project-specific attachment
and removal retain their distinct paths and existing contract. Calendar writes preserve native
minutesADay/workDays Int32 values, order and duplicates without locale conversion, positivity rules
or example-based ceilings. firstDayOfWeek/daysAWeek are described read-only; additional native input
is preserved without promising those fields change. Domain values and management rights remain
server-owned; tests demonstrate unchanged native input and safe rejection without retry.

Project field removal selects the project-specific field ID; global field deletion selects a global
custom-field ID. They are separate requests, not a transaction. Global deletion rejection does not
replay/compensate a completed project-field removal. Project deletion likewise uses only its selected
ID, without discovery or implicit cleanup.

Enum/state/version/build/ownedField/user bundle create/update retain native JSON values/metadata.
Name appears in normative samples but is absent from pinned bundle schemas, and their create
sections declare no required fields. No mandatory bundle name/universal schema is invented.
Enum/state/version gain selected value deletion; build/owned values gain create/update/delete.
Value creation requires name. Native assembleDate/description/owner nulls and additional fields
survive; non-null owned owner descriptors must be JSON objects, with no lookup or ID conversion.
User bundles retain native group/individual references and empty arrays. Server errors remain useful.

DELETE defaults stay query-free, with optional --fields under the existing reference-table-only
source disposition. This does not imply deployed-server projection/edition compatibility. All writes
require Update; no ReadOnly weakening, automatic retry, scan, cascade or compensation is introduced.

Author-discovered bug319 fixes a baseline empty-value human fallback that used raw positional IDs.
The shared view now uses existing scrubbed invocation-local identity for value/bundle context.
Bodies and native null JSON/RPC results are unchanged; no persistent cache or copied Core output
implementation. Separate red regression75101e7 preceded correctiona9be932, with synthetic known-token
selectors through adjacent baseline version and new build paths. All helper cost is counted below.

Existing profiles/auth/credential identity, admission before effects, human/JSON/execute/RPC,
projections, raw-offset/no-lookahead paging, cancellation, EPIPE141, diagnostic causes/codes and
preflight/dispatched-unknown outcomes remain. M06 password storage/redirect/cancellation guarantees
remain in the regression suite. No live service proof or version-support claim is made.

## Author checks and independent review boundary

Every story has a committed failing red test on its own branch before implementation and public
red/green heads. Author **572offline tests PASS**,17newM07nodes, including34exact native contracts
through all four surfaces, opposite-category denial before secret/HTTP effects, remote failures and
unknown writes. Targeted cases cover required name/boolean, native calendar types/order/server
rejection, independent project/global scope and failure, optional bundle name/sample metadata,
nullable dates/owners, empty confirmations and scrubbed selected identities.

The first full run caught an old prose-specific help expectation after adding lifecycle commands.
The test now checks the actual version-value usage and all five command names, retaining zero secret
access, rather than matching the former branch wording. The corrected full trace passes572/572.

Cake Verify PASS includes572offline tests, installed34newSDKexports, work-time/native optional bundle
metadata/nullable owner/scoped deletion/scrubbed adjacent value contracts, and existing installed
CLI/JSON/RPC/EPIPE plus two release-safety checks. No release target or live proof ran.
Fresh traversal265leaves/267variants/261operations has zero failures. Repeat coverage JSON/TSV/summary
bytes match; raw extraction reproduces frozen facts/source-lock bytes, and the separate crosscheck
has no unexplained operations or duplicates. No test-only transport operations or evidence gaps remain.

These are **author self-checks**. Independent full milestone/final shorter-batch review and exact-main
CI are separate gates, recorded in delivery264/review318. Generation does not imply their completion.

## Final shorter-batch authoring input

Original baseline118reachable; M07 begins227(cumulative+109) and reaches261(cumulative+143).
All34newoperations count once. Existing routes, body variants, flags and bug319 do not advance the
counter. M06's+100checkpoint remains passed; +150 falls in M08. Final M07 shorter34-operation review
is required before continuing. Core pin/integrity/local source delta0 are unchanged; upstream Core
handwritten source is absent, so no size is invented.

Physical nonblank handwritten lines include comments and exclude generated output. Exact paths are
tracked files under each surface; source/tests/proof are TypeScript, audit/build/installed tooling
is counted separately under scripts. Counts include every helper/setup change:

| Surface | Original baseline | M07 baseline | Current | Delta M07 | Delta original |
|---|---:|---:|---:|---:|---:|
| src | 3813 | 5066 | 5232 | +166 | +1419 |
| tests | 7482 | 8766 | 8898 | +132 | +1416 |
| integration-tests | 165 | 165 | 165 | +0 | +0 |
| scripts | 559 | 1204 | 1226 | +22 | +667 |

Lineage ff1d50f, M07baseline40b702c63a2e903e29781c2ce521eeefe420b110, original
1c501faf75435bc671e3ee314c1938db3dadcd9f. Later documentation changes do not alter fingerprints.
Growth is reported honestly, not presented as an authoring reduction from simpler capabilities.

Same-capability comparisons use M07baseline40b702c:

- Detail and collection: getWorkItemType/readObjectAt/projectedRead and listVersionValues/
  readCollectionAt/pagedRead are unchanged. M07 adds no read or paging mechanism.
- Mutation: createGroup/mutate/namedMutationBody and deleteIssue/deleteObject/projectedDelete remain.
  Work-type writes reuse the same boundary with a two-consumer native boolean check. Calendar has a
  small native Int32 predicate; no scheduler, locale layer or broad schema validator appears.
- Bundle lifecycle writes remain explicit concrete functions/paths using existing mutate/deleteObject,
  projections and command binders. The existing build/owned/version path helpers remain local.
  Required names apply to value creation; bundle JSON differs because the primary contract does not
  declare mandatory name. That difference is not claimed as a reduction for equivalent behavior.
- Owned-value validation has two actual consumers. The shared value view reuses existing scrubbed
  identity rather than adding state or another presenter framework. All cost appears in totals.

Core owns target/profile/auth/secrets/admission/output/RPC/cancellation/EPIPE; no dependency, schema
DSL, generic CRUD runtime or Core implementation copy is added. Final independent acceptance belongs
to264/318. Reproduce after build: probe/observe-tests into an ignored capture, generate twice and
compare JSON/TSV/summary, extract pinned raw source and crosscheck. Frozen audit README documents
exact commands and upstream-drift limits. All21remaining rows belong to the approved M08 scope.
