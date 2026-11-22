# LP2 pp49–51 printed table: exact 32-bit LCG-origin gate (17 November 2026)

## Decision and original source

The LP2 physical pp49–51 table has 32 rows and eight printed two-character numeral cells per row. The exact token transcription and conventional-base60 byte values are in `resources/liber-primus/base60-grid.json`. A finite, testable original-key possibility is that a common 2014-era 32-bit pseudorandom generator produced the 256 printed bytes and could be extrapolated to an encryption keystream. The later clear p57 phrase about shedding circumferences motivates, but does not prove, a perimeter-first read of the 32×8 table; its ring lengths are 76, 68, 60 and 52. The physical table does not identify a specific generator, seed, or even a unique radix.

## Executed finite experiment

For each printed source token, parse both the conventional base60 alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` and the competing base59 alphabet obtained by deleting lower-case `f`. Check row-major, row-snake, column-major, column-snake, and eight complete inward-spiral traversals (clockwise/counterclockwise, four starting corners): **24 original-source streams**.

Test six fixed modulo-`2^32` affine recurrences `state' = A*state + B` using `(A,B)` pairs `(1103515245,12345)`, `(214013,2531011)`, `(22695477,1)`, `(1664525,1013904223)`, `(134775813,1)`, and `(69069,1)`. Emit one direct byte `(state >>> s) & 255` at each step, for `s = 0,8,16,24`, with no skipped outputs or rekeying. There are **24×6×4 = 576** clearly specified generator/representation/layout combinations.

This is **all-state**, not a sparse seed-word sample. An emitted byte at bit offset `s` only depends on the lowest `s+8` bits of an LCG state; the first observed table byte fixes eight of these bits. Enumerating the remaining `2^s` possibilities exactly represents *every* 32-bit initial state, because its `2^(24-s)` high-bit completions cannot influence any output byte at that offset.

## Result

A single-file Node 22 original-source test, `sims/lp2_grid_lcg32_allstate_source_sft.cjs`, performs this exact enumeration, asserts the source's 32×8 grid and its conventional byte transcription, and first successfully recovers 256-byte synthetic LCG plants under independent ANSI-C/shift16 and MSVC/shift24 parameters. On the original 256-cell streams, **none of 576 combinations has even an eight-byte prefix match**; the longest observed prefix is **four bytes**. In particular **no complete 256-byte output or usable generator state is recovered**.

## Cryptanalytic implication and scope

The historical table cannot be *direct consecutive bytes* from any of the six specified LCG recurrences in any of the tested 12 source-shaped traversal orders, under either radix and any 32-bit starting state. This is an exact mechanism exclusion; it is not a statistical declaration that the table is cryptographically random. It does **not** cover MT19937, GLib/other nonaffine PRNGs, hashes, variable skips, unknown byte permutations/XOR, user-selected nonstandard LCG parameters, or external keys. Neither an LP2 decryption nor authentic unknown plaintext is claimed.

**Next decision:** Exclude this directly recoverable table-generation family from further key-source work. Escalate table origin only if an independent authentic clue selects a new generator, output rendering, or page-to-keystream operation; the absence of such a selector currently limits productive search.
