# Original LP2 deterministic local cut-law obstruction

**Agent13, 25 November 2026, Director [#2716](https://github.com/FlareZ123/liber-primus/issues/2716). Exact finite-class exclusion, not plaintext recovery.**

## Decision

A stationary binary boundary function of the previous up-to-three ciphertext runes and current group length cannot reproduce the original printed grouping. This remains false even if the function receives the actual observed run length at each step, the complete three-run history across earlier groups and page wraps, and all four symbols (current plus three preceding) in a stronger relaxation. Neither hidden plaintext words nor a key is assumed.

This targets deterministic local **ciphertext framing**, not the earlier word-order grammar or boundary mutual information. H-decoy (externally supplied or longer-state decoy segmentation) and H-shuffle remain distinct possibilities.

## Exact contradiction

The source is the corrected physical transcription blob `f7b534a33edeb212d427329798438325307463d7` and the canonical 58-page JSON blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`. All 55 rune-bearing unknown pages match their canonical rune vectors exactly, giving 12,956 runes and 2,896 groups. Ignore line/page wraps as separators; punctuation, including genuine group marks, ends a group. Exclude the book-terminal artificial decision. The dev/hold split is physical p40 at global zero-based index 9640, 9,640/3,315 decisions; development max observed run length 14. The original p50 numeral-only page adds no rune or cut.

For a given context key, let n0 and n1 be counts of continuation and cut. Every deterministic mapping of that key must mislabel at least min(n0,n1) oracle-observed events. Any exact sequential reconstruction must equal the oracle run lengths, so even one mixed key rules out that entire function family. Merging histories or clipping lengths cannot remove a contradiction. Extra independent hidden state would be a different hypothesis.

| Trailing rune count k (current included) | Development contexts | Mixed development keys | Minimum development errors | Whole tape minimum errors | Frozen majority holdout errors |
|---:|---:|---:|---:|---:|---:|
| 0 | 14 | 13 | 2144 | 2873 | 730 |
| 1 | 326 | 284 | 2061 | 2785 | 742 |
| 2 | 4673 | 1027 | 1131 | 1707 | 870 |
| 3 | 9307 | 76 | 76 | 141 | 753 |

Exact uncapped length yields the same k=3 result. Using three previous runes excluding current gives 100 mixed development keys and 165 whole-tape minimum errors. Giving the function **four** trailing symbols (current plus three preceding) still produces three mixed development keys and four whole-tape errors.

Restricting contexts and the next rune to the same physical line leaves 62 mixed development keys and 115 whole-tape minimum errors. Two independently visible same-line conflicts demonstrate that an inter-page or line-wrap artifact is not responsible:

- p35 (archive 52.jpg), one-based line 11: `ᛗ-ᛁᚱᚷᛏᛠ-ᛇᛟᚻᛟᚳᛋᛏᚾᚩ-ᛁᚱᚷ-ᚹ-ᛞᚢᚣᛚᛁ`. At global index8663, IRG is followed by T within a group; at8677 the identical three-rune IRG is followed by a printed separator. Current run length=3 both times.
- p39 (archive 56.jpg), one-based line 4: `ᛟᚢᛝᚱᚷ-ᛗᛏᚷᛒᛈᚷ-ᛗᛏ-ᛗᚣᚹᛒᛏᛒ-ᚷᚣᛈ`. At indices9475 and9481, the trailing three GP0 symbols 6,19,16 (G,M,T) and current group length2 are identical; only the second has a printed separator after MT.

Both original JPEGs in the maintainer ZIP were visually inspected; the first witness in particular is entirely within a single line and uses the same complete in-group prefix, so even a rule resetting history at each group start cannot explain it. The zero-based global positions and all contradictory contexts are emitted by the script.

## Prediction and controls

The 3-context dictionary labels alone require 9,307 bits, before representing the keys themselves, versus a 9,640-bit raw development cut mask. Its unseen holdout contexts cover 3,120/3,315 decisions, including 700/734 true cuts. Of the 195 known-context decisions, 53 are wrong; among the 34 true cuts at known contexts, 27 are missed. Frozen unseen fallback (majority continuation) gives 753 errors, worse than simply predicting no cuts (734). These are oracle-length classification scores, not sequential decoding. A sparse arbitrary lookup cannot establish a compact grammar.

| Control | Development mixed contexts | Whole minimum errors |
|---|---:|---:|
| Native solved GP sections (2,979 runes, unmatched size) | 33 | 79 |
| Deterministic local cut plant on original rune tape | 0 | 0 |
| Matched independent shuffled original lengths | 86 | 140 |
| Matched shuffled native true words, consuming q8 additive tape | 159 | 332 |

The deterministic plant uses a forced max length8 or pair-sum residue0 mod5 after length2. A learner given only development labels exhausts the frozen min1..4, max5..10, modulus2..7, all residues family and uniquely recovers all four hidden parameters. Sequential replay, with no oracle lengths or holdout adaptation, predicts all 3,315 held-out decisions correctly. This is an algorithm-level held-out plant, not independent human blinding. The generic three-context lookup itself is intentionally underpowered for unseen contexts; the compact planted family demonstrates that a low-complexity rule can transfer.

Native controls use the published solved rune transcriptions (blob `1b064ef6d85819b7d96adaff31a82d1ec551598f`); the matched shuffled-word plant repeats independently shuffled source words as necessary, and is an ordinary consuming q8, not an authentic F-hold claim. The independent-decoy plant preserves the exact full-book group-length multiset. The two negative plants have contradictory keys, so this test does not distinguish H-decoy from H-shuffle.

Reproduce: `node sims/lp2_local_cutlaw_original_gate_sft.cjs`. Exact experiment ran in connected V8 on fetched GitHub input bytes; checked-in CLI wrapper not separately run in CI. Output retains every mixed key and first contrary witnesses. No language fit or cipher receiver attempted because the exact gate failed.

**Next research decision:** retire the stated stationary local cut grammar and any refinement that remains a function of those same observable contexts. Do not rescue it with an unrestricted hidden-state machine or extra history without new independent source evidence. The global error floor (141/12,955) is not by itself a likelihood for a noisy grammar, and does not exclude a local rule plus separately supplied exception information. No unknown plaintext or key.
