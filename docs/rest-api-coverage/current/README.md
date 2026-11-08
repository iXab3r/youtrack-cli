# M05: self-service and targeted cleanup

Ten owner-authorized stories US-049/050/051/052/010/013/015/020/024/027.
[Delivery](https://github.com/iXab3r/youtrack-cli/issues/177) and
[milestone5](https://github.com/iXab3r/youtrack-cli/milestone/5) own final acceptance/status.
The approved roadmap proceeds through independent review, merge, exact-main CI and closure one
milestone at a time, without version bumps/npm publication. Product0.8.0/Core exact0.7.1 remain.
npm0.8.0 contains M01; M02–M05 are source additions awaiting an owner-selected future release.

## Frozen universe and result

The pinned official universe remains **282 operations**,281business plus one schema metadata route.
M04 ended at184complete/185reachable. M05 completes17contracts:16newroutes and the existing
GET /api/groups query dimension. Current **201covered,0partial,81missing,0uncertain;201reachable
(123ReadOnly/78Update)**. Full coverage and reachability71.28%; full coverage+6.03percentage points,
reachability+5.67points. The M04 narrative shorthand group-members was imprecise; JSON/TSV always
identified GET /api/groups. Its native query control is now tested and complete.

There are204service leaves (199ordinary REST plus five workflows),206variants including two
--direct selectors, and59offset lists. These do not define the REST denominator. Every operation,
binding, permission, surface, test and gap reason is in [JSON](coverage.json), [TSV](coverage.tsv)
and [summary](summary.json), based on [pinned facts](../official-operations.json) and
[source provenance](../source-lock.json). The original0.7.1audit stays frozen. baselineHead is code
lineage; product/test/package fingerprints independently guard source drift.

## Native contract decisions

General profile dateFieldFormat/timezone/locale and time-tracking periodFormat use native descriptor
objects, correcting the planning string examples before red tests. IDs remain caller-selected;
non-null descriptors must be JSON objects, with native extra properties retained. No timezone/date
conversion, locale discovery or closed format catalog is synthesized. Native null is passed to the
server for its validation. Server user profiles are distinct from Core's local CLI profiles/auth.

User searches/tags and tagged issues return one ordinary raw-offset page. Tagged issues support
repeated customFields without deduplication or ordering changes. The existing issue-list validation
was extracted into a small service query helper with two real consumers; its errors/semantics remain.
Group list now forwards native query unchanged. Direct group add selects group/user path IDs; if
body.id is supplied it must match the user selector. An empty object preserves path selection; there
is no lookup or body-based retargeting. Server group/management rights are separate from CLI gates.

Cleanup selects exact issue/comment/search/tag/article IDs. No discovery, search expansion, automatic
retry or compensation is added. Child-article writes use hierarchy endpoints with declared native
notification controls, nullable summary/content and extra metadata. Child remove deletes only the
parent-child relationship; it does not call DELETE /articles/{id}. DELETE optional --fields follows
the existing field-table-only source disposition; omitted controls remain query-free. Offline
source reconciliation does not establish deployed-server or Cloud/Server/version conformance.

All reads retain ReadOnly, all remote writes Update. Existing profiles/credentials, admission before
effects, human/JSON/execute/RPC, projections, raw-offset/no-lookahead paging, cancellation, EPIPE,
diagnostic codes/causes and preflight/dispatched-unknown outcomes remain covered. Native empty
mutation replies stay null in JSON/RPC; human titles retain scrubbed selected identities/context.

## Verification and boundaries

Each story has a committed red run on its own branch before implementation; public issues record
red/green heads. Author **524offline tests (15M05nodes) PASS**, including all17contracts through
human/JSON/execute/RPC, exact encoded native requests, opposite-category denial, remote failures and
unknown writes, descriptor preflight/native objects, path/body selection, raw-page/zero-size/overflow,
repeated-field SDK validation and readable empty cleanup/profile replies. Existing regressions pass.
The former group-list unsupported-query expectation was moved to the still-unsupported member-list
query; native group query is independently pinned by the new story. Tests stay native fetch/MSW,
synthetic profiles and memory secrets; no live proof.

Cake Verify includes installed tests for16new SDK exports, native group queries/repeated fields,
child notification control/nullable body, selected issue deletion and period-profile path, plus
existing installed CLI/JSON/RPC/EPIPE contracts and two release-safety tests. No release target runs.
Fresh traversal204leaves/206variants/201operations has no failed variants. Mapping uses a524-test
native-request trace; repeat coverage JSON/TSV/summary generation is byte-identical. Raw capture
extraction reproduces original facts/source-lock bytes; separate raw-source/count reconciliation
reports no unexplained operations or duplicates. These are **author self-checks, not independent review**.
Final independent milestone/authoring review and exact-main CI are recorded in the delivery tracker.

The historical standalone-transport DELETE /issues/{id} test now has an actual shipped handler and
positive CLI wire evidence. The generator retires that known exception only when a real binding
exists; no test-only transport operations or bound-operation evidence gaps remain. The full-suite
trace is reused after the generator-only guard change because product/test/package bytes are
unchanged; fresh probe/fingerprints/repeat generation cover the updated source lineage.

## Final shorter-batch authoring input

Original baseline118reachable; M05 begins185(+67), now201(+83):16newoperations, not17 (the group
query is an existing operation completion). The prior+50 checkpoint remains passed; +100 falls in
the approved M06. Final M05 shorter-batch authoring review remains required. Core pin/integrity and
local Core source delta0 are unchanged. Upstream handwritten Core source is absent, so no size is
invented. Physical nonblank handwritten lines include comments and exclude generated output;
src/tests/proof are TypeScript, scripts count tracked audit/build tooling separately:

| Surface | Original baseline | M05 baseline | Current | Delta M05 | Delta original |
|---|---:|---:|---:|---:|---:|
| src | 3813 | 4671 | 4809 | +138 | +996 |
| tests | 7482 | 8264 | 8376 | +112 | +894 |
| integration-tests | 165 | 165 | 165 | +0 | +0 |
| scripts | 559 | 1153 | 1182 | +29 | +623 |

Counts use source lineage3016557, M05base9746b8563cbea6bb58f95bbe738449646b569fd5 and original
1c501faf75435bc671e3ee314c1938db3dadcd9f. Exact paths are tracked files under src/,tests/,
integration-tests/,scripts/; later generated-doc changes do not alter them. Tests/tooling remain
separate from source; growth is not presented as an authoring reduction.

Same-capability comparisons, including all helper cost:

- Detail: M05-baseline getUserNotifications/readObjectAt/projectedRead remain. New general/time
  profile reads reuse the concrete-path/projection boundary with domain descriptor views.
- Collection: M05-baseline listUserBundleGroups/readCollectionAt/pagedRead remain. User searches/tags
  reuse that pair. listTagIssues directly composes page/readPage with the existing issue projection
  and customFieldQuery, now shared with listIssues. Repeated fields retain identical shape/errors;
  group query directly extends page/readPage without new traversal.
- Mutation: M05-baseline removeProjectTeamGroup/deleteObject/projectedDelete remain; comment/search/
  tag/issue/link cleanup uses that boundary. The comparator revision is9746b85, not original1c501faf.
  Child writes keep direct mutate/fields/writeOptions and a two-consumer nullable-body check.
- Descriptor validation and scrubbed human labels add concrete native behavior. All setup/helper
  cost appears above. Existing Core targetCommands/profiles/secrets/admission/output/RPC/cancellation/
  EPIPE remain service-neutral and unchanged; no new Core mechanism or promotion is proposed.

The tradeoff is a few direct service functions and small helpers with real consumers while keeping
paths, native metadata and debugging visible. No new dependency/DSL/CRUD runtime/raw proxy is added.
Final independent milestone and shorter-batch authoring verdict belongs to177 and its review record.

Reproduce after build: probe.mjs and observe-tests.mjs into an ignored capture, generate.mjs twice,
compare JSON/TSV/summary bytes, extract.py from pinned raw capture, then crosscheck.py. The frozen
audit README supplies exact commands and mutable-upstream/source-drift limitations.
