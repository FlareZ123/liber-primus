# Visible ciphertext-F prime-clock restart: exact original rejection

**Status: scoped exact negative; no unknown LP2 plaintext or key recovered.** This tests one fixed, clue-motivated candidate, not the broader possibility that F has another structural role.

## Human solve-path hypothesis and frozen law

The solved p56 page establishes a recognizable operation: successive prime-minus-one shifts modulo 29, with literal plaintext F copied unchanged and not consuming a key step. A solver might notice that an observed ciphertext F (GP29 index 0) is a public event and hypothesize that it restarts this otherwise hidden prime cursor. This is a simple, observable state checkpoint, distinct from resetting at punctuation, physical lines, or adjacent-equal-rune pairs.

The tested law is frozen: start at prime 2; plaintext F emits ciphertext F; otherwise C=P+phi(prime[t]) mod 29; after any observed ciphertext F reset t=0, whether it came from literal plaintext F or a consuming non-F; after nonzero ciphertext increment t. The inverse retains both legal branches at ciphertext F: literal plaintext F, or the nonzero plaintext -phi(prime[t]) mod 29 when nonzero. A nonzero ciphertext that forces plaintext F is impossible. No alternative start, reset marker, sign, or page-local phase is tested.

## Positive controls and implementation check

The pinned plaintext reference maps to 85 GP29 symbols on p56 and 95 on p57. The ordinary, non-restarting p56 rule replays the original ciphertext **85/85**, consuming 84 prime shifts and holding the one literal plaintext F at offset 56. This preserves the established p56 positive control.

Both authentic solved plaintexts were replanted under the proposed restart law. The exact inverse retained the true plaintext in both cases, exercising both branch types:

| Native plaintext plant | Literal-F events | Consuming-zero events | Total candidate plaintexts |
|---|---:|---:|---:|
| p56, 85 runes | 1 | 1 | 4 |
| p57, 95 runes | 3 | 3 | 64 |

The growing candidate count is expected: at each ciphertext F, the two plaintext branches share the same reset state. These tests validate branch handling; they do not support the restart hypothesis on original ciphertext.

## Known p56 source contradiction

The original p56 ciphertext has zeroes at offsets 35, 47, 51, 56 and 74. Only offset 56 is the literal plaintext F. At offset 35, plaintext index 24 is a consuming non-F; prime 151 supplies shift 5, so it correctly emits ciphertext zero. The proposed rule therefore resets the cursor to prime 2.

At offset 36, the known plaintext index is 16 and the actual ciphertext index is 27. After the reset, prime 2 supplies shift 1, predicting 17 instead of 27. The ordinary p56 cipher still replays exactly; it is the new restart hypothesis that fails this source control.

## Exact original p40–p53 contradiction

The continuous p40–p53 training tape contains 3,008 runes (p50 is the numeric-only page). No page or word reset is allowed; only observed ciphertext F resets the cursor. The first five p40 ciphertext indices are [0,9,19,26,6].

At offset 0, ciphertext F permits plaintext choices 0 or 28; both reset the cursor to prime 2. The next three nonzero ciphertext symbols then force plaintext indices 8, 17 and 22. At offset 4, ciphertext index 6 is reached with cursor 3, so the required shift is phi(7)=6. The inverse would force plaintext F at a nonzero ciphertext position. That branch is forbidden, and every path is empty at this point.

This is an exact inverse contradiction, before dictionary or language scoring. The 308-rune p54–p55 continuation was not reached because the continuous p40–p53 training inverse is already empty; testing it with a new start would change the frozen law.

## Decision and scope

Retire the fixed visible-ciphertext-F restart law with initial prime 2 and the stated reset/hold semantics. The decisive original failure is p40 offset 4; the p56 mismatch is independent source evidence that the restart is not a generalization of the solved p56 cipher. No unknown plaintext, key, or continuation destination was recovered.

This does **not** exclude other F-related structures, other prime/state laws, or a different cipher family. It does not justify searching reset phases or inventing special F labels after the exact contradiction.

## Reproduction

Run from the repository root:

- SFT: [lp2_visible_cipher_f_restart_sft.cjs](../sims/lp2_visible_cipher_f_restart_sft.cjs)
- Original GP29 corpus: [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json), Git blob **054f2a0f780b7d46901acbe3d9bf4f0ac1801165**
- Solved plaintext reference: [lp1-plaintext-reference.txt](../resources/liber-primus/lp1-plaintext-reference.txt), Git blob **8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d**

The exact experiment core was executed in the connected JavaScript runtime. The committed Node SFT independently reconstructs the p56 positive control, validates p56/p57 native plants, and asserts the first original no-path certificate.
