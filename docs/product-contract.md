# Preserved product contract

[README](../README.md) is the full shipped command guide. This extraction preserves
the 0.7 paging contract and Core output guarantees under
[the pinned Core 0.7.1 contract](DESIGN.md).
Historical extraction provenance remains in [migration](migration.md).

## Paging

All 62 YouTrack offset lists use `--page-size 50 --start 0` and return the integration-local
`{count,items,hasMore,nextStart}` in library, CLI, execute and RPC calls. Ordinary reads make one
request without lookahead. A nonempty page, even a short one, has `hasMore:null`; `nextStart`
advances by raw rows. A positive-size empty page confirms the end. A zero-size request supplies
no end evidence and has no continuation. Do not infer a total or completeness from fullness.
`issues list --all` requires `--max-results`, a positive page size and optionally `--max-bytes`;
there is no default ceiling. It advances by raw rows to an empty page, deduplicates present string
IDs and preserves rows without IDs. Duplicate-only nonempty pages fail for lack of progress.
Budget overflow, unsafe arithmetic or any page failure rejects the entire complete selection
without a partial result. Offset paging supplies no snapshot guarantee under concurrent changes.
The two native activity cursor commands preserve direction, opaque cursors and projected native
metadata; no automatic feed traversal or conversion to offsets is provided.


Each invocation keeps profile, endpoint, credentials and cancellation isolated. All continued
reads must progress; cancellation remains cancellation. No automatic read-to-write target expansion
is introduced. The 0.7.1 release requires published Core output-boundary handling: observed stdout
EPIPE returns quiet exit 141, while original command and cleanup failures remain failures.
