# Red-initial-seeded prime-totient gate

**Decision: reject the tested direct GP-index to prime-rank offset.** This is an intermediate negative result, not a Liber Primus decryption.

## Frozen hypothesis

The 13 monumental red initials are visible paragraph/chapter seeds. For each segment, copy the initial rune as clear text and set \(s\) to its zero-based GP29 index. Starting immediately after it, use the solved p56 prime-totient stream at offset \(s\):

\[
K_j = \varphi(p_{s+j+1}) = p_{s+j+1}-1 \pmod{29},
\]

where \(p_1=2\). The key counter advances only on key-consuming runes. A ciphertext F may be literal plaintext F and bypass the key, as on solved p56; a non-F ciphertext rune may not decrypt to plaintext F. Reset only at the next monumental red initial. Ordinary page, line and word carries do not reset.

This is the lowest-description-length direct way to let a GP29 initial select the already-solved nonperiodic p56 key stream. No offset correction, alternate prime indexing, reset schedule, sign, or recurrence was fitted.

## Source-fixed segmentation

The independent original-image audit identifies these 13 giant initials. Their GP29 indices are computed from the repository's canonical alphabet:

| Original site (page, rune offset) | Initial | GP29 index |
|---|---:|---:|
| (p0, 0) | S | 15 |
| (p3, 0) | L | 20 |
| (p3, 119) | P | 13 |
| (p6, 71) | A | 24 |
| (p8, 0) | X | 14 |
| (p15, 9) | L | 20 |
| (p23, 0) | U | 1 |
| (p27, 0) | M | 19 |
| (p33, 0) | D | 23 |
| (p33, 91) | NG | 21 |
| (p39, 119) | IA | 27 |
| (p40, 0) | F | 0 |
| (p54, 0) | A | 24 |

The nine physical chapters are p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53 and p54–55. The 13 seeds are those nine chapter openings plus four internal paragraph openings.

The page-carry parser from im-results/lp2-32-pagecarry-p56-wordprime-reset-gate.md reconstructs **12,956 runes in 2,896 words**, exactly matching resources/liber-primus/lp2-corpus.json pages p0–p55. All 13 seed offsets coincide with printed word starts. This avoids inventing page-local cuts and preserves the 32 documented cross-page word carries.

## Positive controls

- **Solved p56 control:** the unchanged repository lexical Viterbi recovers the known 85-rune plaintext exactly, selects the single literal-F bypass at position 56, consumes 84 key symbols, and forward-replays the original ciphertext exactly. The best state exceeds the runner-up by 55.66 score units. This validates the p56 operation and F rule used in the test.
- **Synthetic seed controls:** the no-F plaintext THE PRIMES ARE SACRED THE TOTIENT IS SACRED round-trips exactly with clear L (index 20) and clear P (index 13) seeds. The two ciphertexts differ; applying the wrong seed does not recover the plaintext. These are implementation controls, not LP2 evidence.

## Complete nonfloral training chapter: p3–7

The chapter has three seed segments:

| Seed site | Segment runes | Printed words | Ciphertext F sites | First impossible rune |
|---|---:|---:|---:|---|
| p3 L (index 20) | 119 | 22 | 4 | global rune 740: X (index 14) |
| p3 P (index 13) | 693 | 154 | 19 | global rune 937: P (index 13) |
| p6 A (index 24) | 333 | 79 | 3 | global rune 1553: N (index 9) |

Each segment loses every legal F-bypass state before language scoring:

- **L, p3:** the only prior consumed count is 0. The next key is \(\varphi(73)=72\equiv14\pmod{29}\). Ciphertext X is index 14, so it would decrypt to plaintext F from a non-F ciphertext. The p56 forward encoder forbids this.
- **P, p3:** the only prior consumed count is 0. The next key is \(\varphi(43)=42\equiv13\pmod{29}\). Ciphertext P is index 13, again forcing forbidden plaintext F.
- **A, p6:** the only prior consumed count is 0. The next key is \(\varphi(97)=96\equiv9\pmod{29}\). Ciphertext N is index 9, again forcing forbidden plaintext F.

These are hard reachability contradictions, not poor English scores or a weak dictionary. The complete p3–7 training chapter therefore rejects this seed-offset rule.

## Holdouts and scope

The floral p40–53 chapter and p54–55 end were **not decrypted or language-scored** after the training chapter failed. Their ciphertext was only included in the source-aligned segmentation needed to locate the 13 initials.

The result retires only this precise mechanism: a clear giant initial's zero-based GP29 index directly offsets the solved p56 prime-totient stream, with the stated F-bypass and reset behavior. It does **not** establish that the red initials are decorative, and it does not exclude a different state update independently selected by an original clue.

## Reproduction

From the repository root:

~~~sh
node sims/lp2_red_initial_prime_totient_seed_gate.cjs
~~~

The script imports the existing validated F-transparent lexical Viterbi, asserts the p56 control, checks the original page-carry transcription against the corpus, verifies all 13 seed/word boundaries, runs the three p3–7 reachability tests, and checks the L/P synthetic round trips. It deliberately does not decrypt the two holdouts.

Input Git blob SHAs at the time of the test:

- resources/liber-primus/lp2-corpus.json: 054f2a0f780b7d46901acbe3d9bf4f0ac1801165
- resources/lp2-transcription.txt and resources/liber-primus/lp2-transcription.txt: 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7
- im-results/lp2-round9-independent-unmapped-class-audit.md: db679f59470ea8d47050813c727d6d7c4208f23c
- im-results/lp2-ninechapter-predecessor-sbox-original-capacity.md: 556ceb728ac3101f1012ba60f7caf5755bfa8ae1
- im-results/lp2-32-pagecarry-p56-wordprime-reset-gate.md: 8ab67d37c5e5372aeac119eae3852b853a8ec532
- sims/lp2_ftransparent_original_lexical_viterbi_sft.cjs: fbc0cb44c0ae585f090c2aa91d7111eec1a36d49
