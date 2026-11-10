# Agent 42: seven-page all-secret binary transport contradiction

A new original-source **exact, conditional** obstruction is in [the source proof](../../im-results/page-byte-capacity-section-static-no-go.md) with [reproducer](../../sims/page_byte_capacity_section_static_gate.cjs) and [passing CI](https://github.com/FlareZ123/liber-primus/actions/runs/42864888897).

On original LP2 physical pages **8–14**, all seven page-local predecessor-excluding rank-28 packet lengths force a first numeric digit of **zero** if they encode unrestricted whole bytes with 256^m <= 28^D, treating page first runes as IVs and 9 original doublets as markers. But these pages are one text section, and its shared secret 29-by-28 predecessor-row table would have to map conflicting original transitions to zero. Forward big: p10 C→X / p12 C→I; forward little: p9 A→TH / p10 A→I / p11 A→U; backward big: p12 OE→NG / p13 OE→B; backward little: p8 I→X / p12 I→C. All four orientations fail for **any** unknown per-predecessor secret alphabet. All 4 original-layout positive plants recover 1,024/1,024 bytes with all 9 repeat markers.

This rules out **section-stationary maximal unrestricted-byte page packets**, not cross-page framing, per-page rekeying, restricted-byte codebooks or another hidden state. No plaintext. Avoid redundant AES/secret-alphabet sweeps inside this finite architecture.
