# Complete punctuation-span endpoint pair as alternating additive key (#2787)

**Decision:** retire the fixed phase-zero two-rune shell-key receiver with native transparent-F holds. Both global signs are exactly impossible on the original; 83/173 corrected punctuation spans are impossible even if one grants independent signs. Restricting to the 118 spans with two audited physical four-dot boundaries leaves 54 impossible under either sign. No new plaintext, key, or continuation.

## Mechanism and original input

p57's SHED language supplies an exploratory circumference interpretation, not an authenticated additive opcode. #1266 ([literal word peel](lp2-word-circumference-literal-peel.md)) and the existing `lp2_word_circumference_shell_pair_vigenere_sft.cjs` use printed **word** shells; #1279 ([paragraph peel](lp2-paragraph-completeword-circumference-original-gate.md)) removes complete first/last words at large marks; #2642 ([previous-ciphertext clause](lp2-previous-ciphertext-clause.md)) uses the entire preceding clause. These are distinct from the **current punctuation-span endpoint pair**.

Freeze the corrected transcription's 173 unique period positions, including the final stop and the start boundary at 0. Preserve every original rune, including page carries and rubrics, and do not reset at ordinary group separators or page breaks. The issue calls this the "173 small-stop corpus"; in fact 29 of those unique delimiter positions align with 31 annotated large marks, and 138 positions have independently audited four-dot small marks. Six remaining corrected delimiter positions are other transcribed stops. Thus the complete corrected punctuation-span experiment is reported alongside the pre-defined subset bounded on both sides by audited four-dot marks. This does not merge spans across large marks or alter the source segmentation.

For a span of at least three runes, preserve its first and last ciphertext symbols as plaintext shell and use them as a repeating key k=(left,right), starting at phase 0 on the first interior rune. With fixed s=+1 or −1, plaintext F (GP index 0) emits ciphertext 0 and holds the phase; otherwise C=(P+s*k[j]) mod 29 and the phase advances mod 2. Shells do not consume key phases.

The inverse transitions for each ciphertext symbol c at phase j are:
- if c=0, emit plaintext F and retain j;
- if p=(c−s*k[j]) mod 29 is nonzero, emit p and advance to 1−j.

These are exhaustive: an empty two-phase frontier proves that no plaintext can encode the span, regardless of vocabulary. Ciphertext zeros can legitimately have two different preimages, so a deterministic zero interpretation would be incorrect. Forward/backward BigInt counts agree; every reachable original path is enumerated and re-encrypted exactly.

## Exact original results

| Original scope | Spans | Interior runes | Reachable (+) | Reachable (−) | Neither sign |
|---|---:|---:|---:|---:|---:|
| p0–39, development | 129 | 9382 | 50 | 44 | 62 |
| p40–55, frozen holdout | 44 | 3228 | 17 | 13 | 21 |
| All | 173 | 12610 | 67 | 57 | 83 |
| Audited four-dot to four-dot subset | 118 | 7819 | 48 | 40 | 54 |

The 173 spans contain 346 shell runes and 12,610 interior runes. The + sign allows 2,178 interior runes in fully reachable spans; the − sign allows 1,885. There are 188 and 141 complete legal paths respectively, at most 32 per span/sign. All 329 signed paths, their GP indices, displayed word-separated transliteration, source coordinates, and exact counts are preserved in the raw output. Neither sign gives a coherent multiword continuation. As examples, the best + sign development candidate of at least 20 runes by the frozen native-GP bigram scorer is `TMOGRJOE IATU DOE EAPRO WHAPA` (offsets 3017–3038); the corresponding holdout best is `TYIAAEG LHAEOE OEEAMTH BEWESSDONCR OEO EHTH NGA SRWTHCD MFOOAE NGXTWE NGB RN` (12597–12648). The language rank is diagnostic; the exclusion is exact before scoring.

The first true p0 body span (13–154) fails at clause-local rune indices 9 (+) and 29 (−). The first impossible strictly audited-small-to-small span (154–275) fails at local indices 76 and 9 respectively. The unchanged receiver also fails on original heldout 9736–9805, indices 50 and 39. This is not a per-clause sign optimization: the union count is only a stronger necessary bound on even that relaxed model.

## Calibration and nulls

For each sign, plant the rule on 102 native solved-GP spans (2,979 runes per sign, including rubrics and table-associated rune strings as present in the native source). Every planted span retains a legal inverse and exact re-encryption. A target-section-excluded smoothed bigram Viterbi recovers 99/102 (+) and 100/102 (−) full spans, with 2,970/2,979 and 2,973/2,979 runes correct. The remaining ambiguity is genuine under the F-hold rule and is not hidden by the implementation.

At fixed shells, independently permute each original interior's observed rune multiset 128 times per span and sign. Reachability is 8,311/22,144 (+) and 7,492/22,144 (−), comparable to the original's low reachability. These are matched-order nulls, not putative historical plaintext. All original and control path counts and per-span null reachability totals are preserved; null individual output tapes are unnecessary for the exact rejection. Random seed 0x2787ab.

## Reproduction and scope

[CommonJS SFT](../sims/lp2_clause_shell_pair_sft.cjs) · [complete original paths, controls and null counts](lp2-clause-shell-pair-output.json). Run `node sims/lp2_clause_shell_pair_sft.cjs` in a repository checkout. The experiment function was executed directly in connected JavaScript and saved verbatim; no separate Node or CI execution is claimed. Original evidence commit 5756796320142947bb51603d9db43dc5fe40e373.

This exact fixed endpoint-key consumer is incompatible with original LP2 under either sign. It does not exclude a different source-selected interpretation of circumference, but the result gives no reason to sweep alternate shells, delimiters, rotations, alphabets or F rules.
