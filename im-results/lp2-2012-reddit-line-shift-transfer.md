# Exact 2012 Reddit line-shift transfer to LP2 — 28 November 2026

## Decision

A first-party-selected earlier Cicada cipher now supplies a genuinely authored **operation, 23-value clock, and reset rule** for one direct LP2 transfer. In the 2012 Reddit stage, the visible page identifier/header determines the integer key

\[
(10,2,14,7,19,6,18,12,7,8,17,0,19,7,14,18,14,19,13,0,1,2,0).
\]

The archived worked solve says each letter is shifted by the value at its position. Replaying the archived ciphertext shows the sequence repeats every 23 letters and, crucially, **restarts from 10 on each displayed line**. The exact transfer to the canonical GP29 ring is therefore frozen before unknown scoring: subtract the same integer sequence modulo 29, restart at every original physical LP2 line, advance only on runes, leave punctuation/non-runes inert, and add no F exception, phase, keyword, secret alphabet, or fitted parameter.

That exact original inverse is nonprose on the repository's finite native-GP29 register. Its 12,956 recovered ranks have mode **491**, top-three mass **1,437**, and IoC **0.0344824492**. All **532,721** full-length windows from the three pinned native literary controls are more concentrated; **0/532,721** meet both original thresholds. This rejects this literal 2012 line-reset shift transfer as unchanged native GP29 plaintext. It recovers no unknown plaintext or authentic LP2 key.

This is useful for Director task #3335 because it resolves one source-selected **rotating-alphabet** branch without inventing a clock or reset. It does **not** authenticate the remove/reinsert opcode used by the rank synchronizer. A global alphabet rotation is a different state transition; converting these 23 values into insertion ranks would add exactly the unsupported semantic choice the task is meant to avoid.

## Historical source and worked control

The signed 2012 OutGuess message states that the key had been “right in front of your eyes.” The historical walkthrough records that the Reddit full name \`a2e7j6ic78h0j7eiejd0120\` and its image header encode the same 23 integers, and that the sequence unscrambles the Reddit lines by alphabet shifts:

- walkthrough: <https://github.com/krisyotam/cicada3301/blob/main/puzzles/2012/WALKTHROUGH.md>
- archived ciphertext: <https://github.com/krisyotam/cicada3301/blob/main/archives/cijhho/Archive/Old%20Sites/3301Archive/walkthrough/2012%20WALKTHROUGH/extra%20stuff/Subreddit-Text-Posts.txt>

The reproducer checks two independent source lines. For the first line, ciphertext \`Ukbn Txltbz ...\` decrypts to \`King Arthur ...\`. The second source line begins \`mjotukj ...\` and decrypts to \`chamber ...\`; its first letter again uses shift 10. This independently fixes line restart rather than assuming a book-continuous 23-cycle. Spaces and punctuation do not consume key positions.

No unknown LP2 symbol participates in selecting the key, sign, phase, or reset.

## Frozen LP2 recipient

Use the repository's original physical transcription at \`resources/liber-primus/lp2-transcription.txt\`. The transcription compresses out runeless physical p50, so sections 0–49 are p0–49 and sections 50–54 are p51–55. Solved p56/p57 are excluded. For rune position \(j\) within each printed line,

\[
P_j = C_j-k_{j\bmod 23}\pmod{29}.
\]

The canonical GP29 ordinal order is the alphabet. Every physical line restarts \(j=0\). Printed punctuation, word separators, digits and other non-rune material neither transform nor advance the clock.

This is the closest literal GP29 generalization of the historical operation: Latin alphabet rotation becomes GP29 alphabet rotation. A same-layout native GP29 plant is encrypted and inverted exactly before original scoring.

## Original result and native register

| Tape | N | modal count | top-three count | IoC |
|---|---:|---:|---:|---:|
| Original p0–55 exact inverse | 12,956 | **491** | **1,437** | 0.0344824492 |

The first 120 recovered GP transliterations begin:

\`C G R AE T P N B H E U NG S A Y B J I IA OE OE W B TH EA U EA EO H X A I TH D A W NG L E H T W IA O S A C NG AE G N M G F D D J P J F T T C J TH OE D A O X X G I Y E I T B E D H AE U H S G F A D F H B X Y D TH C EO AE O AE H P H J X H S B EO EO J J S T B TH R X J\`

Matched native-GP29 rolling windows:

| Donor | windows | minimum mode | minimum top-three | windows meeting both original thresholds |
|---|---:|---:|---:|---:|
| Gibran | 34,674 | 1,416 | 3,517 | **0** |
| Shakespeare | 204,151 | 1,408 | 3,376 | **0** |
| Emerson | 293,896 | 1,491 | 3,491 | **0** |
| **Total** | **532,721** | — | — | **0** |

Mode and top-three mass are unchanged by any static relabeling of the recovered GP symbols, so a post-hoc fixed plaintext alphabet permutation cannot rescue this direct transfer. The finite control is deliberately narrower than a theorem about every possible language or representation.

## Page-local held-out gate

The whole-book result could in principle hide a mechanism used on only one LP2 page, so a second frozen gate tests every runic unsolved page separately. The language model is fixed **only on Gibran**: add-one-smoothed canonical-GP29 unigram probabilities. Shakespeare and Emerson are then left untouched as empirical same-length window controls.

For each of the 55 runic pages p0–55 (p50 is runeless), the exact historical line-reset inverse is scored by mean GP29 log likelihood and compared with every same-length held-out window. The result is stronger than the whole-book concentration gate:

- **55/55 pages lie below every same-length Shakespeare+Emerson window.**
- Depending on page length, each page is compared against about 523k held-out windows.
- The closest candidate page is still separated from the worst held-out native window; no page-local native-GP29 signal survives.

Because the model is trained on Gibran while the empirical register uses two different writers, this page-local result does not reuse the held-out samples to set symbol probabilities. It rejects the natural escape hatch that the 2012 transfer might apply only to one unknown page.

Companion reproducer: [`sims/lp2_2012_reddit_line_shift_page_local_sft.cjs`](../sims/lp2_2012_reddit_line_shift_page_local_sft.cjs).

## Scope and next decision

**Retire only the exact historical transfer:** same 23 integers, historical decryption sign, modulo-29 alphabet rotation, key restart on every original physical line, rune-only advancement, unchanged length/order, canonical GP ring (or any final static relabeling).

The test does not reject a different source-selected recipient, a secret changing alphabet, different reset markers, variable-length coding, or a separate remove/reinsert mechanism. In particular, the 23 values must **not** be repurposed as insertion ranks unless an independent Cicada source specifies that mutation law.

Reproducer: [\`sims/lp2_2012_reddit_line_shift_sft.cjs\`](../sims/lp2_2012_reddit_line_shift_sft.cjs).
