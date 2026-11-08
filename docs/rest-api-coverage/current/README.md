# M01: operation contracts and release-candidate evidence

M01 selects ten owner-authorized stories from Issue #1: US-001/002/003/004/006/007/008/005/009/011.
Their [optional tracker reference: delivery tracker](https://github.com/iXab3r/youtrack-cli/issues/6) owns scope and acceptance;
[optional tracker reference: Milestone 1](https://github.com/iXab3r/youtrack-cli/milestone/1) contains 26 API items, three bounded
API-group roots and ten stories. Later planning milestones remain deferred.

The frozen denominator is 282. The mechanically observed current result is **119 covered, 9 partial,
154 missing, 0 uncertain**; **128 reachable** (103 ReadOnly / 25 Update). Full coverage increases
from 32.98% to **42.20%**; reachability from 41.84% to **45.39%**. There are 131 service leaves,
133 selector variants including two --direct choices, and five workflow leaves which add no operation.
Lists now include 49 offset resources; default paging and native cursor contracts are retained.

[Current JSON mapping](coverage.json), [TSV](coverage.tsv) and [summary](summary.json) use the same
[pinned official facts](../official-operations.json) and [raw source hashes](../source-lock.json).
The original 0.7.1 audit remains unchanged as a dated baseline. `baselineHead` in current summary
identifies the observed code lineage; probe evidence additionally hashes every product/test source
and package/lock file so uncommitted source drift cannot masquerade as that commit.

## Public contract decisions

The current README documents exact new argv. API-dependent controls are exposed only where the
M01 endpoint declares them. Optional notification input accepts omitted, true, bare-true or false;
no control is synthesized by default. Only create/comment-add expose draftId; body stays required,
with {} allowed when publishing an existing draft. Native selectors/extra body fields survive.
Repeated customFields preserve order and duplicates on every complete-selection page.

Temporal work-item filters remain literal strings (including native Long spelling) and are separate
from offset --start. Date/interval/remote permission semantics are enforced by YouTrack. Activity
item offset lists and native cursor pages are distinct resources with no automatic traversal.
Reaction names remain open native strings/null; create requires the reaction property.

DELETE fields are explicitly declared in the official parameter tables. Their absence from the OAS
and Request syntax is an omission, not an explicit prohibition. M01 exposes optional caller-selected
fields, preserving query-free defaults, empty-success null and native nonempty response handling.
Thus the prior CLI completeness gap is resolved without claiming live/server-version conformance.
Removed tag/link relations never delete their target entities. Attachment/work-item deletion selects
exactly one opaque encoded path; no discovery, retries or automatic target expansion is introduced.

## Verification and retained boundaries

Every story has a committed red acceptance run before feature code on its own branch. Final local
Verify passed **453 offline tests**, installed executable/export/native-fetch checks, persistent RPC,
closed-reader EPIPE 141, file publication contracts, and **2 release-safety tests**. No live proof ran.
The installed contract covers repeated field selections, new reactions, library exports and admission.

All 26 affected operation contracts have independent request expectations at the real native-fetch/MSW
boundary through human/JSON/execute/RPC. Added tests include explicit false/true notification controls,
draft-only bodies, multipart upload, empty/null results, relation/child ID encoding, remote 4xx/5xx
without retries, denied admission on every surface, profile/RPC isolation and redaction. Existing
transport/cancellation/diagnostic/proof suites remain green. Shared regressions are reused.

Current mapping was regenerated from the existing passing-suite observations and a fresh synthetic
131-leaf traversal. A separate raw-source cross-check reconciles every operation and count, including
historical assignedRoles identity correction. M01 does not implement that deferred correction/route.

These are author verification results, **not independent review**. Review/merge/CI and exact npm-stage
receipts are recorded in the delivery issue as they occur. Version 0.8.0 is a release candidate until
the owner approves its exact verified npm stage with 2FA and registry verification succeeds.

## Final shorter-batch authoring review input

Baseline: 118 reachable operations, now 128, **+10 new operations** and 16 existing completeness
improvements. This is the final shorter batch; +50 is not crossed. Core remains the exact npm 0.7.1
dependency with unchanged integrity and **zero Core source changes**. No runtime source is copied.

Same-capability examples: reaction detail/list reuse readObjectAt/readCollectionAt and projectedRead/
pagedRead; reaction add uses one native validator plus mutate/projectedBodyUpdate. Existing and new
writes share one projected body helper, with only declared per-endpoint draft/notification options.
The now-unused unprojected body helper was removed. Repeatable query serialization is confined to
the existing transport, needed by issue customFields; no generic CRUD registry/raw proxy/DI is added.
Profile target resolution, permissions, secret store, output, EPIPE and diagnostics remain in Core.

Physical nonblank source counts (comments included, generated output excluded):

| Surface | Baseline | Current | Delta |
|---|---:|---:|---:|
| src | 3813 | 4065 | +252 |
| tests | 7482 | 7691 | +209 |
| integration-tests | 165 | 165 | +0 |
| scripts | 559 | 1079 | +520 |

Tests/support and audit tooling are listed separately from integration source. The audit-tool source
is reproducibility infrastructure, not a runtime authoring reduction. Counts include M01 completion
work on 16 existing contracts, so dividing the source delta by ten would misrepresent cost. Handwritten
Core source is absent from this product checkout; its unchanged pin establishes zero local Core delta,
not a claim about upstream source size. Fresh review must assess correctness and simplicity from the
actual diff and these same-capability examples before milestone closure.

Regeneration from the repository root after a build:

```sh
node --enable-source-maps scripts/rest-api-audit/probe.mjs .workspace/workstreams/m01/coverage
# Observe the offline suite with observe-tests.mjs into that same capture directory.
node scripts/rest-api-audit/generate.mjs .workspace/workstreams/m01/coverage docs/rest-api-coverage/current
```

The metadata capture/checker remains public-source research and never substitutes for profile-backed proof.
