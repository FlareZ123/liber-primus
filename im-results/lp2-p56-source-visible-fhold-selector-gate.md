# Solved p56 source-visible F-hold selector gate

**Agent16, 28 November 2026 — Director #3336. Decision: negative at the source-visible gate.** The authentic p56 prime/totient receiver is exact, but the original page and the surviving authenticated clue chain do not independently identify which printed `F` is the literal non-consuming interrupter. This is an identifiability result, not a rejection of the solved cipher.

## Exact inverse obstruction

Freeze the historically demonstrated operation: consecutive primes starting at 2, shift `phi(p)=p-1 (mod 29)`, subtractive GP29 decryption, and the strict solved-page convention that plaintext `F` prints as ciphertext `F` without consuming a prime. An ordinary encrypted non-`F` may also print as ciphertext `F`; therefore every printed `F` has a hold/consume branch, while any consuming transition that would produce plaintext `F` from a non-`F` ciphertext is illegal.

The original p56 ciphertext is 85 runes and contains printed `F` at zero-based offsets **35, 47, 51, 56, 74**. Exact dynamic programming over the unchanged ciphertext gives **22 complete legal inverse paths**, all of which forward-reencrypt to the original 85 runes. Their consumed-prime extents are:

| Consumed primes | Exact paths |
| ---: | ---: |
| 81 | 4 |
| 82 | 8 |
| 83 | 6 |
| 84 | **3** |
| 85 | 1 |

Even granting the independently correct **84-prime extent**, three exact reencrypting paths remain: the single literal hold may be at rune **51, 56, or 74**. The authentic known plaintext uses 56, but that fact is deliberately excluded from the selector test.

## Frozen source-visible discriminators

The original image/transcription supplies real structure, but none selects one of the three 84-prime paths without importing plaintext or a new rule:

- **Ink and punctuation.** The red title is runes 0–4. Large red punctuation occurs after rune offsets 5, 45 and 85. All three exact-84 candidates (51, 56, 74) are black runes in the post-hash body, so the authored color/block boundaries do not distinguish them.
- **Printed word and line geometry.** Rune 51 is the first rune of a 4-rune printed word; 56 is the second rune of a 2-rune word; 74 is the fourth rune of a 4-rune word. These are observable differences, but no first-party instruction says that hold state is encoded by word length, word offset, or line position. Choosing one after knowing the solution would be post-hoc.
- **Prime/totient clue chain.** The preserved 2014 whitespace/prime clue and the Wisdom text select the prime/totient family. They do not specify the literal-F location or the 84-prime extent independently of the recovered prose.
- **Five-dot artwork.** P56 has five printed `F` ciphertext runes and five large black dots, but the established source-image study shows the five dots are an unlabeled reflected/rotated stencil also reused on p7 and p23. No authored dot order, dot-to-rune correspondence, or F-state grammar exists. The 5-versus-5 count therefore cannot select a hold mask.
- **Ordinary glyph allographs.** Closed #3326/#1260/#231/#893/#1183 already saturate ordinary same-rune shape/junction/dot variation. No residual p56 `F` allograph channel is available to distinguish the three paths.

The exact inverse itself already incorporates every legal strict-F branch. Round-trip is therefore an implementation invariant, not a selector.

## Consequence for unknown LP2 pages

No source-visible p56 discriminator survives that can be transferred to an unknown recipient. The p56 F convention remains valuable as a **constraint** when a separately source-selected key/schedule is proposed: an impossible non-`F`→plaintext-`F` transition can reject that proposal. It does **not** bootstrap the hidden hold state when multiple exact paths survive.

Reopen this route only if a new first-party artifact supplies a typed verifier of consumed-key extent or literal-F positions (for example a checksum, explicit count, parallel encoding, or worked formatting rule). Do not select rune56 by English scoring and then present that as source-side state recovery.

**Reproduce:** `node sims/lp2_p56_source_visible_fhold_gate_sft.cjs`. The SFT reads only canonical p56 ciphertext/transcription/ink annotations, enumerates all strict-F inverses, asserts the 22-path and 84-prime three-path obstruction, and verifies exact reencryption of every path. No known plaintext is used in path selection.

Related evidence: `im-results/lp2-red-rubric-p56-totient-source-inverse.md`, `im-results/lp2-2014-whitespace-a194954-p56-clue-gate.md`, and `im-results/lp2-fivedot-source-stencil-mirror-and-p56-key-gate.md`.
