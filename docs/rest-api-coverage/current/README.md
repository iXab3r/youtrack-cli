# Current REST coverage after M09 stabilization

[optional tracker reference: M09 delivery](https://github.com/iXab3r/youtrack-cli/issues/356)
and US076–US079 own stabilization and consolidated0.9.0 delivery. The source adds explicit local
credential cleanup and an offline freshness gate; it adds **zero REST operations**. Stage approval,
registry/install verification and final milestone closure remain separate public delivery gates.
Core remains exact0.7.1. See [release guide](../../release.md) for owner2FA and source/archive rules.

## Frozen universe and current result

The pinned JetBrains OAS3.0.1/info.version2026.4 and169reference pages captured2026-11-08 still
supply **282operations:281business plus1schema metadata**. The OAS SHA-256 remains
`08d7f307974004570acab1903d66c663710432ff70bffa6c601b70de27ccfb9b`;
[official facts](../official-operations.json) and [source lock](../source-lock.json) are unchanged.
There are **282covered,0partial,0missing,0uncertain;282reachable — 100% of this frozen universe**,
140ReadOnly/142Update. This measures operation/query-control coverage, not every payload/value,
Cloud/Server edition, deployed version or server right. Owner selected offline only; no live proof.

The complete [JSON](coverage.json), [TSV](coverage.tsv) and [summary](summary.json) retain every
method/normalized path, group, real declaration/client callsite, permission, four surfaces, query
controls, tests and status reason. There are289service leaves:280ordinary REST plus nine local/derived
workflows,291variants with two --direct selectors, and62offset lists. Password/license import and
delete are local workflows; they never advance the REST denominator or accepted-operation counter.
Original118reachable→M08/final282 means cumulative164new operations, unchanged by M09. M08's+150
checkpoint and final14 review passed before this increment; no new authoring-operation batch starts.

Frozen completion does not settle Hub, legacy/internal, dynamic app handlers or historical Reports.
Original issue1 has163historical IDs:162map and are covered; POST/api/assignedRoles/{roleID} is absent
from pinned sources. Current collection POST/api/assignedRoles is a distinct M04 operation, not its
alias. Three Reports candidates still require current official/version evidence and owner scope.
[optional tracker reference: Overall1](https://github.com/iXab3r/youtrack-cli/issues/1) remains open for
those decisions. No hidden identity rename, invented denominator or automatic won't-do is implied.

## Stabilization behavior

`user initial-password delete <alias>` and `server-settings license delete <alias>` require Update
and use the selected profile's existing Core scoped secret store. A ready configured/authenticated
profile makes no HTTP call. Namespaces protect the bearer credential and other family/profile.
Absent aliases delete idempotently; acknowledgements carry only scrubbed alias/deleted:true and
make no claim that a value previously existed. There is no automatic profile/credential cleanup.
Cancellation checked after integration lookups prevents dispatch to Core delete(). After dispatch,
Core0.7.1 may finish its internal lookup/deletion despite cancellation (exit130); no retention or
rollback is promised. Owner explicitly approved this boundary in US077/362; this is not a Core fix.
Store failures retain useful known-value-redacted causes and an unknown-deletion outcome, no retry.
The small local helper has two actual consumers; it delegates storage/diagnostics to public Core.

`npm run test:coverage` builds/runs the full offline suite once with existing request tracing,
traverses the real declaration using synthetic profiles/secrets, generates the pinned mapping twice
and compares artifacts with tracked current. Only the documented baselineHead lineage field may
differ from committed summary; repeated generation itself must match every byte. Drift rejects
without tracked overwrite and retains ignored evidence for explicit reviewed regeneration.
Successful runs clean their exact owned scratch path under the verified root. No upstream schema,
real service or profile is fetched; public source replay remains a separate hash-pinned step.

Existing Cake Verify uses this guard for its one full-suite run, retaining
registry npm ci, installed-package contracts and release-safety checks. Repository audit tooling
uses Node24+; the installed CLI retains its Node22+ engine declaration. No dependencies/Core upgrade
or TeamCity job/settings/credential change occurs. This is offline mapping freshness, not automated
upstream API discovery or a universal schema validator.

The current [command guide](../../../README.md) covers families, native controls, secret lifecycle,
paging, profiles/auth, diagnostics, human/JSON/execute/RPC and installation edition limits.
[M01–M08 native decisions/history](../../milestone-history.md) remain linked. Explicit projections,
null/false/extra native fields, separate deletion scopes, credential-origin guards, cancellation,
EPIPE141 and unknown-write outcomes remain. No runtime/HTTP/CRUD/schema framework is copied.

## Evidence and review boundary

M09 aliases have committed red-before-green acceptance on their story branch. Freshness boundary
checks pin lineage-only tolerance, missing/duplicate routes, permission/binding/surface/status drift,
malformed/missing files and TSV changes without altering tracked inputs. An end-to-end first guard
correctly rejected the old mapping after new local leaves; explicit regeneration preceded a fresh
successful whole guard. Documentation uses static completeness/link and real help checks rather
than prose-snapshot tests. Candidate identity has its own red-before-SetVersion test.

Author Cake Verify at source269350f passed **616offline tests**, installed-package SDK/executable/
JSON/RPC/EPIPE/native contracts including new alias cleanup, and two release-safety checks.
Source/test/package inputs are unchanged by later documentation/mapping-only commits. Final native
trace/probe/repeat generation/raw extraction/crosscheck receipts are kept separately for review.
These are author self-checks; full independent M09 review, exact-main Verify and actual registry
publication are recorded in356 and its review issue, not inferred from generator output.

Observed author environment is Linux/Node26; existing CI uses Node24/Linux. No current Windows/
macOS, Node22 runtime or live YouTrack compatibility proof is claimed by these receipts. Platform
storage implementation and its upstream tests remain Core ownership. Owner chose offline only;
missing live proof is not converted into availability evidence or a mandatory merge requirement.

Physical nonblank handwritten counts include comments/all helpers and exclude generated artifacts:
source5608(+29M09),tests9383(+147),scripts1328(+83),proof165(unchanged), at source269350f against
M09baselinee38a4fac91e52d32e798207036d910d802a63732. This is source/tool/test growth, with no reduction
claim. Source/test/package pin identity and existing behavior remain explicit review subjects.

Reproduce using the frozen audit README's observe/probe/generate/extract/crosscheck commands, or use
the new offline freshness gate for current inputs. The original audit artifacts remain frozen.
