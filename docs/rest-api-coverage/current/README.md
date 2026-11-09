# M08: installation maintenance and frozen REST completion

Five approved stories US071–075 add21operations.
[optional tracker reference: Delivery](https://github.com/iXab3r/youtrack-cli/issues/321),
[optional tracker reference: review](https://github.com/iXab3r/youtrack-cli/issues/352) and
[optional tracker reference: milestone8](https://github.com/iXab3r/youtrack-cli/milestone/8)
own acceptance and delivery status. Milestones merge sequentially through independent review and
exact-main Verify without version bumps/npm publication. Product0.8.0/Core exact0.7.1 remain;
npm0.8.0 contains M01, while M02–M08 await an owner-selected future release.

## Frozen universe and result

The official denominator remains **282operations:281business plus one schema metadata route**,
from OAS3.0.1/info.version2026.4 and169reference pages captured2026-11-08. The OAS SHA-256 is
`08d7f307974004570acab1903d66c663710432ff70bffa6c601b70de27ccfb9b`;
[facts](../official-operations.json) and [source lock](../source-lock.json) remain unchanged.
M07 ended261complete/reachable; M08 adds exactly21missing→covered, with no other status changes:
**282covered,0partial,0missing,0uncertain;282reachable — 100% of this frozen universe**.
ReadOnly140/140 and Update142/142. This is operation/query-control coverage, not exhaustive schema,
payload, deployed-server, edition or version conformance. No live proof ran.

There are287service leaves:280ordinary REST plus seven workflows,289variants including two
--direct selectors, and62offset lists. The local license import is a workflow, not a REST operation.
These counts never define the denominator. The complete [JSON](coverage.json), [TSV](coverage.tsv)
and [summary](summary.json) retain every method/normalized path, group, actual declaration/client
callsite, permission, human/JSON/execute/RPC binding, test evidence and status reason. The missing
set is empty. baselineHead records verified code lineage; fingerprints guard source/test/package
changes. The original audit artifacts remain frozen separately.

Frozen completion does not imply implementation or owner disposition of Hub, legacy/internal API,
dynamic app handlers or the three historical Reports candidates. Original issue1 contains163deferred
IDs:162map to the pinned universe; historical POST/api/assignedRoles/{roleID} is absent from the
pinned sources. Current POST/api/assignedRoles is a distinct collection operation delivered in M04,
not an alias or evidence for that historical path. Those source/scope boundaries must not be closed
by silently renaming identities or calling all legacy candidates implemented.

## Native decisions and preserved contracts

US071 reads one native api/openapi.json document, telemetry and minimal root settings. Schema human
output shows metadata; machine surfaces retain the native document with concrete credential
redaction, without crawling schemas or asserting server conformance. Default telemetry avoids
installation paths/online identities. Fields projections pass unchanged except credential masking.

US072 reads backup file metadata, one ordinary offset page, settings and status. No binary download,
restore, polling or implicit trigger appears. Explicit settings writes retain nullable location,
Int32 filesToKeep, literal cronExpression, false isOn and the source's TAR_GZ/ZIP enum. Native
notifiedUsers and additional fields survive. The official backup use-case documents caller-supplied
backupStatus actions despite generic read-only annotations; only an explicit Update request sends
such a body, and a successful request does not prove completion.

US073 appearance uses native timeZone/dateFieldFormat descriptors. Locale updates require locale.id
per the method description, without a closed locale enum or conversion. Notification emailSettings
objects follow the normative POST sample despite the containing reference's read-only annotation.
Native null/false, Int32 port and SMTP/SMTPS/SMTP_TLS/MS_GRAPH_API survive. SSL keys are nullable
StorageEntry references, not uploaded private keys; no SMTP password field is invented.

US074 changes CORS/system settings through their concrete endpoints. Origin strings remain literal;
nullable baseUrl/administratorEmail, native numeric types and false flags survive. Updating remote
baseUrl never retargets or rewrites a local CLI profile. Root GlobalSettings POST follows its native
nested appearance sample; passing additional metadata does not promise all read-only fields change.

US075 reads license metadata, updates the license through a stored alias and sends native root
settings. Local env import uses selected-profile Core secrets, Update admission, YOUTRACK_LICENSE
and server-license:<alias>; no HTTP for a configured/authenticated profile, value output, plaintext
fallback or bearer overwrite. Update has no env fallback; CLI literal license strings, including
nested root writes, are rejected. Native nullable clearing/username metadata remain available.
Aliases retain exact bytes and remain after success/failure; auth-only profile deletion does not
remove auxiliary aliases. Cancellation before persistence prevents the write; after it begins no
rollback is promised. See the shipped README for the command and retained-secret lifecycle.

Password/license-bearing body dispatches require the original HTTPS origin at every hop. The
existing M06 guard now has two concrete consumers through a small local credentialConnection;
Core still owns redirect traversal. Same-origin redirects and redirects that discard the body keep
normal semantics. Known input/returned native license values are captured before key/URL masking
and scrubbed from raw/JSON/URI/escaped-control copies. Percent-triplet hex case is equivalent only
inside each candidate; ordinary characters remain literal/case-sensitive. Lone-surrogate JSON
strings remain supported. No arbitrary unknown-secret detection guarantee is added.

Server license keys and backup scheduling/retention differ from Cloud's managed single-backup
export. Edition is not guessed from hostnames and local gates never replace server management
rights. Supplemental official guides establish context, not a new denominator or compatibility
matrix: see the README's optional primary API references. Unsupported rights/edition responses fail
normally. No blanket successful skip, automatic grant or live service/version proof is claimed.

Existing profiles/auth/credential identity, permission-before-effects, human/JSON/execute/RPC,
explicit projections, raw-offset/no-lookahead paging, cancellation, EPIPE141, diagnostic causes/codes
and preflight/dispatched-unknown outcomes remain. There is no automatic retry, compensation or
transaction across separate commands. Core, dependencies, CI, proof runner and versions are unchanged.

## Verification and independent review boundary

All five stories have committed failing red acceptance on their own branches before implementation,
with public red/green heads. Author build and **604offline tests PASS**, including22M08 story/view
nodes and10credential regressions. Contracts exercise all21new operations through four surfaces,
opposite-category denial, native requests, HTTP errors and unknown writes. Additional checks cover
backup paging/overflow, native descriptors/enums/null/false, formatted sparse/default views,
explicit projections, profile-interleaved RPC, cancellation and secret lifecycle/redirect boundaries.

Fresh traversal287leaves/289variants/282operations has no failures. Fresh repeated JSON/TSV/summary
bytes match; raw extraction reproduces pinned facts/source-lock byte-for-byte. The separate raw
crosscheck has no unexplained/duplicate operations or test-evidence gaps. These are author
self-checks. Cake Verify PASS includes604offline tests, all21new installed SDK exports, installed
license env-import/update privacy, backup paging/native locale contracts, existing installed
CLI/JSON/RPC/EPIPE and two release-safety checks. No release target or live proof ran. Full independent
milestone/final14 review and exact-main Verify remain separate gates recorded in321/352; generation
alone does not imply their acceptance.

Accepted353 default-view and354 credential-copy findings have red-first corrections. The independent
+150 recheck at1a6c2ef passed47focused checks, including180matching cases; earlier independent full
587/probe/raw runs are distinct from the author's later590suite. Final M08 findings and exact-main
CI status belong to the public delivery/review records, not inferred from these earlier receipts.

## Authoring checkpoints and cost

Original baseline118reachable; M08 begins261(cumulative+143) and reaches282(cumulative+164).
US071's3+US074's4operations stop exactly at+150; that independent checkpoint passed before the
remaining14US072/073/075 began. The final shorter14 and full M08 require their own review.
Existing routes, flags, body variants, privacy fixes and local import do not advance this counter.
Core local source delta0/pin unchanged; upstream handwritten size is not present or invented.

Physical nonblank handwritten lines include comments, normal formatting and every helper/setup
cost; generated output is excluded. Exact paths are tracked files under the listed surfaces.

| Surface | Original baseline | M08 baseline | Current | Delta M08 | Delta original |
|---|---:|---:|---:|---:|---:|
| src | 3813 | 5232 | 5579 | +347 | +1766 |
| tests | 7482 | 8898 | 9236 | +338 | +1754 |
| integration-tests | 165 | 165 | 165 | +0 | +0 |
| scripts | 559 | 1226 | 1245 | +19 | +686 |

Lineage45561c2, M08baseline4987319457f72149b29a106f3f0a3e1bc1a2722b, original
1c501faf75435bc671e3ee314c1938db3dadcd9f. Later documentation changes preserve fingerprints.
This is source growth; no authoring reduction is claimed from unlike capabilities.

Same-capability samples at M08baseline4987319: getWorkItemType/readObjectAt/projectedRead versus
getBackupFile, listWorkItemTypes/readCollectionAt/pagedRead versus listBackupFiles, and
updateProjectTimeSettings/mutate/projectedBodyUpdate versus updateBackupSettings. Concrete paths,
projections and native validation remain direct. No new paging/CRUD/schema framework is added.
Native Int32 uses an existing calendar predicate shared with real settings consumers. Four default
views reuse recordView and existing accessors. License import reuses public Core environment/store
APIs and the established initial-password pattern. Credential dispatch reuses the M06 guard;
credential matching stays in the existing service scrubber. All helper and test/tool costs appear
above, including the accepted privacy/view corrections; Core output/diagnostic/runtime code is not
copied. Reproduce with the frozen audit README's observe/probe/generate/extract/crosscheck commands.
