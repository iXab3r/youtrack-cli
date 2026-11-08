# M02: collaboration and knowledge-base contracts

M02 selects ten owner-authorized stories: US-012/016/017/018/019/021/022/023/025/026.
[optional tracker reference: delivery](https://github.com/iXab3r/youtrack-cli/issues/50) and the
[optional tracker reference: milestone](https://github.com/iXab3r/youtrack-cli/milestone/2) own acceptance and final status.
The owner requested sequential review/merge/CI/closure without per-milestone releases.
Product version remains 0.8.0; these additions are unreleased source work. Core remains exact 0.7.1.

## Universe and result

The original **282-operation** official source and 0.7.1 baseline stay frozen. M01 ended at
119 fully covered / 128 reachable. M02 completes **26 contracts: 19 new routes and seven existing
completeness improvements**. Current: **145 covered, 2 partial, 135 missing, 0 uncertain**;
**147 reachable** (110 ReadOnly / 37 Update). Full coverage **51.42%**, +9.22 percentage points;
reachability **52.13%**, +6.74 points. There are 150 leaves (145 ordinary REST leaves plus five
workflows), 152 variants including two --direct selectors, and 52 ordinary offset lists.
Leaf counts are separate from the REST denominator. Native cursor resources remain distinct.

Every operation, binding, permission, surface and test evidence is in the [JSON](coverage.json),
[TSV](coverage.tsv) and [summary](summary.json), using [pinned facts](../official-operations.json)
and [source provenance](../source-lock.json). The frozen original audit remains separate.
Current baselineHead identifies observed code lineage; product/test/package fingerprints also
prevent source drift from masquerading as that revision.

## Public contract decisions

Saved-query creation requires native name/query; updates preserve omissions and native fields.
Issue project is a single object (get), with an explicit target ID (set) and no name lookup.
VCS creation follows the primary reference's required version/state, correcting the planning
example's insufficient id-only body. Update/removal select one exact VCS relation. Native
values and subtypes are not restricted to examples or closed local enums.

Commands retain explicit issue IDs and add comment/visibility/caret/silent/runAs and notification
controls. Silent/notification flags accept omission, bare true, true and false; YouTrack owns
remote administrative rights. Global activity list/detail and cursor page stay separate.
Global filters preserve native issueQuery/author/time. Categories are mandatory in the reference,
despite the optional OAS flag. Only cursor pages take cursor/activityId. Native Long strings
retain precision; offset start is separate. No automatic feed traversal or target expansion.

Article/comment writes and upload expose declared notification controls. Only article create and
comment add take draftId; publication allows {}. Normal creation still needs project, normal
comment addition needs text. Article tags, attachments and comment reactions preserve opaque IDs,
native JSON/null/open reaction names and additional body fields.

Four new DELETE parameter tables declare fields, omitted by OAS/request syntax. Apply the M01
source disposition: optional --fields, query-free defaults, native empty/nonempty replies. This
resolves the CLI input gap without pretending mocks establish a deployed backend version.
Removing tag/reaction/VCS relations does not delete global objects. Common mutation diagnostics
retain M01 post-dispatch unknown outcomes, definite local/4xx failures, redacted codes/causes,
and no retries/compensation. The generator now checks actual command-control declarations
instead of carrying its old baseline-only partial marker.

## Verification and boundaries

All ten stories have committed red tests on separate branches before feature code; public
story issues record red/green heads. Final trace passed **472 offline tests** (16 M02 nodes),
including all 26 affected operation contracts on human/JSON/execute/RPC, exact native requests,
multipart, denial with the opposite category enabled, HTTP/ambiguous failures, offset limits,
true/false/omitted controls, cancellation, profile isolation and useful empty-reply human views.
The source uses the existing native-fetch/MSW boundary and memory secrets. Earlier shared
transport, paging, EPIPE, diagnostic and proof-preflight regressions remain green.

Local Cake Verify also checks the installed package/exports/CLI/RPC/EPIPE contracts and two
release-safety tests; final receipts are recorded in the delivery issue. No release target or
live proof is part of M02. An obsolete global-history unknown-option assertion was updated for
newly authorized filters; its cursor/no-offset/no-lookahead checks remain.

A fresh 150-leaf / 152-variant synthetic traversal observes all 147 operations. A second generation
is byte-identical; a separate raw-OAS/reference algorithm reconciles every count and historical
deferred identity. This is **author self-check, not independent review**. Independent final
verdict, reviewed merge and exact-main CI are recorded in the issue as they occur. No server,
Cloud/Server or cross-version conformance is claimed.

## Final shorter-batch authoring checkpoint

M02 baseline: 128 reachable, now 147 (+19); cumulative +29 from the original 118-operation
baseline. Core pin/integrity is unchanged, with zero local Core implementation changes.
New list/detail operations reuse readCollectionAt/readObjectAt/readPage; writes reuse mutate,
deleteObject/uploadObjectCollection and declared endpoint controls. Story wire assertions are
shared between M01/M02 instead of copied. No CRUD registry, raw proxy, framework fork or new
runtime dependency. Core owns profiles/admission/secrets/output/cancellation/EPIPE.

Physical nonblank lines, comments included and generated output excluded:

| Surface | M01 baseline | Current | Delta |
|---|---:|---:|---:|
| src | 4100 | 4270 | +170 |
| tests | 7789 | 7976 | +187 |
| integration-tests | 165 | 165 | +0 |
| scripts | 1079 | 1104 | +25 |

Tests/tooling are separate from integration source. Counts are review inputs, not proof of less
runtime authoring cost. Upstream handwritten Core source is absent; its size is not invented.
No CI, package, dependency or version changes. Independent review must assess the actual diff,
same-capability examples and simplicity before milestone closure.

After build, run probe.mjs and the observe-tests.mjs hook into an ignored capture, then
`node scripts/rest-api-audit/generate.mjs <capture> docs/rest-api-coverage/current`. The raw-source
capture/extractor and separate crosscheck.py remain public-source-only reproducibility tools.
