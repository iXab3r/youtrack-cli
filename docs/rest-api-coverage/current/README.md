# M03: iterations and working catalogs

Ten owner-authorized stories: US-029/031/032/033/034/035/014/036/037/038.
[optional tracker reference: delivery](https://github.com/iXab3r/youtrack-cli/issues/95) and its
[optional tracker reference: milestone](https://github.com/iXab3r/youtrack-cli/milestone/3) own acceptance and final status.
The owner requested sequential review/merge/main-CI/closure, with one independent read-only
reviewer per milestone/rechecks and no per-milestone release. Product stays 0.8.0, Core exact 0.7.1.
M02/M03 additions are unreleased source; npm 0.8.0 contains M01.

## Frozen universe and result

The original official source has **282 operations** (281 business plus schema metadata).
M02 ended at 145 complete / 147 reachable. M03 completes **16 contracts: 15 new routes and
one existing sprint completeness improvement**. Current: **161 covered, 1 partial, 120 missing,
0 uncertain**; **162 reachable** (112 ReadOnly / 50 Update). Full coverage **57.09%**, +5.67
percentage points; reachability **57.45%**, +5.32 points. There are 165 leaves (160 ordinary REST
leaves plus five workflows), 167 variants including two --direct selectors, and 53 offset lists.
These are separate measures; CLI leaves do not define the REST denominator.

Every operation/binding/permission/surface/test is in [JSON](coverage.json), [TSV](coverage.tsv)
and [summary](summary.json), using [pinned facts](../official-operations.json) and
[source provenance](../source-lock.json). The original 0.7.1 audit stays frozen. baselineHead is
observed code lineage; product/test/package fingerprints additionally rule out source drift.

## Contract decisions

Board creation requires native name and explicit projects(id); the planning example's name-only
body was corrected before red tests. The optional template query is preserved as native text,
with server validation. A small extra-query argument on the existing service mutate helper
serves this concrete control, retaining common preflight/dispatch/uncertainty boundaries.
No raw query/proxy command is exposed. Sprint create gets declared notification controls,
including omitted, bare true, true and false; defaults and update behavior remain intact.

Enum/version/state value creation requires name, while updates preserve omissions and extra
native fields. One small shared named-body validator avoids copying that check across actual
consumers. Native archived/released/isResolved flags, color/sharing references, dates/nulls and
metadata remain unchanged. isResolved is catalog metadata, not a synthesized state-machine event.
Tags are global objects, separate from issue/article assignment routes.

Field defaults expose common metadata by default; caller-selected --fields handles native subtype
bundle/defaultValues without type discovery. Updates preserve subtype $type and native arrays,
null and false. Project-field creation requires explicit field(id) and ProjectCustomField $type;
YouTrack owns compatibility validation. Updates use the project-instance ID, not the prototype ID.
Field instances list the associated projects through one ordinary raw-offset page, without lookahead
or automatic traversal. All mutations retain Update; new reads are ReadOnly. No implicit lookup,
permission grant, retry, compensation or new compatibility/version policy.

## Verification and limits

All ten stories have committed red runs on separate branches before code; public issues record
red/green heads. **493 offline tests** pass, including 21 M03 nodes covering all 16 contracts
through human/JSON/execute/RPC, exact native requests, opposite-category denial, remote failures,
ambiguous writes, native null/false/epoch dates, required-ID/template preflight, instance paging
and readable empty mutation replies. Existing M01/M02 transport/profile/cancellation/EPIPE/diagnostic
and proof-preflight regressions remain green. Tests use native fetch/MSW, memory secrets and synthetic
profiles; no live proof. Installed checks cover SDK exports and the actual board-template query.
Local Cake Verify receipts include installed CLI/RPC/EPIPE checks and two release-safety tests;
no release target runs. Final CI/review/merge status belongs in the delivery issue.

Fresh traversal: 165 leaves / 167 variants, all 162 operations, no failed variant. Mapping uses a
493-test native-request trace; repeat generation is byte-identical. A separate raw-OAS/reference
algorithm reconciles all identities/counts. This is **author self-check, not independent review**.
Independent verdict and exact-main CI are separate gates. No deployed-server, Cloud/Server or
cross-version conformance is claimed; full means the declared operation/input dimensions, not
exhaustive schema/value/live validation.

## Final shorter-batch authoring input

Baseline 147 reachable, now 162 (+15); cumulative +44 from the original 118. Core pin/integrity
unchanged, zero local Core implementation changes. New reads reuse existing collection/object/page
helpers; writes reuse mutate/projectedBodyUpdate and small native body checks. The existing transport's
extra-query argument handles the real board template without a framework/CRUD registry. Shared story
assertions and Core-owned profiles/admission/secrets/output/cancellation/EPIPE remain unchanged.

Physical nonblank lines, comments included, generated output excluded:

| Surface | M02 baseline | Current | Delta |
|---|---:|---:|---:|
| src | 4270 | 4433 | +163 |
| tests | 7976 | 8111 | +135 |
| integration-tests | 165 | 165 | +0 |
| scripts | 1104 | 1122 | +18 |

Tests/tooling are separate from integration source; counts are inputs to simplicity review, not
proof of reduced runtime cost. Upstream handwritten Core source is absent, so its size is not
invented. No CI, package/dependency/version changes or copied runtime implementation.

After build, run probe.mjs and observe-tests.mjs into an ignored capture, then regenerate with
`node scripts/rest-api-audit/generate.mjs <capture> docs/rest-api-coverage/current`. Capture/extract
and the separate crosscheck.py stay public-source-only reproducibility tools.


Empty successful creates retain the selected name or prototype/project identity in the human title.
The invocation-local fallback stores only labels scrubbed by the existing service response sanitizer;
it leaves the submitted body, SDK result and JSON/RPC null unchanged. Weak references avoid a persistent
label cache. This adds a small presentation-only concept because native empty results have no identity.
Regression coverage includes six create families, credential/signed-URL labels and unchanged bodies.

Same-capability authoring samples (included in the total source delta above):

- Detail: existing getIssueProject binds readObjectAt to issuePath(issueID) + "/project".
  New getFieldDefaults binds readObjectAt to defaultsPath(fieldID), ending in "/fieldDefaults".
  Both preserve projection selection, ReadOnly admission and one request; the resource path differs.
- List: existing listArticleTags and new listFieldInstances use collection → ordinary raw-offset page.
  Neither adds lookahead, aggregation or discovery; the new default projection names the project.
- Mutation: existing updateSprint is byte-unchanged. New updateEnumValue uses mutate with an explicit
  bundle/value path and namedMutationBody(input, false); both preserve native JSON through mutate and select output with fields(options, defaults). That validator shares
  object/name validation with board/tag/state/version consumers while retaining extra native properties.
  Board create adds the concrete template query argument to the same mutate boundary. These additions
  increase source size; no claimed code reduction hides domain validation or moves it into Core.
