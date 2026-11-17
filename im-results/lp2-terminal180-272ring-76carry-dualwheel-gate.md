# Terminal 180 → 272-cell prime wheel → 76-carry readout: conditional original-p55 gate

**Classification:** source-shaped intermediate experiment; negative under the current provisional p50 base60 transcription. This does not establish or disprove the broader 272/76 source relation.

## Source motivation

A recent independent handoff identified a first-party 272 selector: LP1 p05's original *SOME WISDOM* square has **272 in opposite corners**, and the same page says primes and the totient function are sacred. The known terminal sequence is p56's authenticated 85-rune plaintext followed by p57's 95 clear runes:

- GP ordinal sum: **2,204 = 29 × 76**, producing exactly 76 carries on a 29-position wheel, equal to p55's 76 ciphertext runes.
- GP-prime-value sum: **7,888 = 29 × 272**, producing 29 complete turns of a 272-position wheel.
- φ(272) = **128**, matching the length of p56's 128-hex-character hash target.

The obvious 272-cell receiver is the exact p15 clockwise Fibonacci-prime spiral (16 values) followed in physical page order by the 256 two-character p49–51 table cells. The 272 prime steps from p56||p57 move a pointer around this ring; each ordinal carry emits the current cell value modulo 29. This is a small, human-plausible two-register operation, not a broad key search.

The 272/76 arithmetic is not itself proof of author intent. Agent4's independent ordinary-GP-English window calibration found **5/279,982** 180-rune windows with both exact quotient sums; overlapping windows and post-selection prevent treating that as a discovery p-value.

## Frozen receiver

1. Restore p56 plaintext with the authenticated prime-totient clock and its literal plaintext-F nonconsuming bypass; append clear p57.
2. Initialize an ordinal cursor and a prime cursor at zero.
3. For each terminal rune, advance the ordinal cursor by its GP index modulo 29 and advance the prime cursor by that rune's GP prime value modulo 272.
4. Whenever the ordinal cursor crosses 29, read the current 272-ring cell and reduce it modulo 29. The total sums force exactly 76 outputs and return both cursors to zero.
5. Use those 76 outputs as a p55 additive key in the authenticated decryption direction, (P=C-K). Test both natural read conventions (cell before or after the current rune's prime step) and all eight literal-F assignments at p55's three ciphertext-F positions.

The ring is fixed as p15 clockwise spiral followed by the existing 256-byte p49–51 base60 decoding. No reverse ring, arbitrary offset, radix alternative, cell remapping, or fitted key phase is searched.

## Result

- Both cursor closures are exact: 76 ordinal carries and 29 prime-wheel laps.
- The two timing conventions produce 76-element key tapes (included in the reproducer).
- All **16** source-shaped p55 candidates (2 read timings × 8 literal-F masks) violate the p56 transparent-F rule at least once: the minimum is **one non-bypassed plaintext-F contradiction**.
- All 16 have **zero** exact dictionary matches in the 29,055-entry GP-native word list. The best scaled IoC is **1.05824561**, still close to the uniform-GP29 baseline rather than English.
- The two no-bypass diagnostics also produce zero dictionary matches (scaled IoCs 1.05123 and 0.93614).
- A p57-derived 76-rune method-positive round trip passes exactly.

The direct receiver therefore fails on original p55 under the current table values. This is a real negative for the frozen operation, not a decryption.

## Critical input limitation

The p15 spiral is independently exact and source-verified. The p49–51 256-cell table is weaker: `resources/liber-primus/lp2-grid-256.json` explicitly says the base60 byte interpretation remains a hypothesis distinct from radix59 and that the remaining cells are derived transcriptions not comprehensively re-adjudicated. The 76 event positions read 67 table cells in the after-step convention and 69 in the before-step convention; only **one** and **two**, respectively, fall among the 11 cell indices already adjudicated directly against original JPEG pixels. Thus a transcription error among the selected cells could change the key tape. Do not promote this to an established exclusion of the source relation without a stronger table-byte basis.

## Decision

Preserve this as a bounded, source-shaped failed receiver. It demonstrates that the simplest two-wheel readout does not solve p55 under the current base60 table and authentic p56 F semantics. It does **not** retire the p05 272 observation, the p56||p57 sum relations, or every possible use of p15/p49–51. Do not expand to reverse rings, radix59, arbitrary rotations, alternate value maps, or additional key consumers without a new first-party instruction selecting them.

## Reproduction

From the repository root, with Node.js 22:

```sh
node sims/lp2_terminal180_272ring_76carry_dualwheel_sft.cjs
```

The script reads the canonical LP2 corpus, p50 base60 grid, original transcription, p15 Fibonacci-prime square, and committed GP-English word list. It prints both key tapes, all 76 ring-read events, all 16 literal-F candidates, table-cell audit overlap, and a reversible p57 method-positive.
