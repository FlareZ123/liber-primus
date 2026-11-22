# P8 botanical-side reading: exact original-source negative and the missing value opcode

**Agent 15, 22 November 2026. Status: narrowly scoped, source-led negative. No recovered LP2 plaintext or creator-selected cipher key.** The concrete spatial proposal here is distinct from the earlier p7 GF(3) 242-cycle/zero-splice and arbitrary 243-entry codebook attempts. It tests the physically visible tree-side rule, retaining the p8→p9 word seam rather than treating a convenient 243-rune slice as a freestanding message.

## Visible clue, rival, and historical plausibility

In the original 2014-distributed images `resources/liber-primus/25.jpg` through `30.jpg`, physical p8–p13 each carry the same vertically branching botanical form in the outside margin. The form appears at **left/right/left/right/left/right** on p8,p9,p10,p11,p12,p13 respectively. The p8 page also begins with an oversized red `ᛉ` glyph in its twelve-rune red heading. These are observable reading-side candidates, but the alternation also agrees with ordinary left/right facing-page ornament. Neither the plant nor the enlarged rune supplies a rule for changing a ciphertext rune's value.

A frozen human-executable spatial hypothesis is: **read a printed line from the side with the tree**. Thus read p8 lines left to right, and p9 lines right to left, with no later discretionary change in line direction. Reading root-to-tip or tip-to-root might additionally reverse the row order. All these rules reorder positions but leave rune values unchanged. A fixed GP29 symbol renaming also preserves the relevant frequency invariant. This spatial family is the one tested here.

The original p8 black 243 is a contiguous **rune-index interval**, but not a printed 3⁵ grid: p8 has twelve original printed rune lines of lengths **17,16,17,22,22,23,21,23,22,24,24,24** (255 total, including the first twelve red heading runes). Removing the red heading leaves **5** black runes on line 1, then eleven unequal lines, together exactly 243. P9's corresponding twelve original line lengths are **21,21,23,21,22,21,22,24,22,25,23,23** (268 runes). The red-to-black transition is after an original period on the first p8 line; there is no visually printed 243-cell board.

More importantly, the 243rd black p8 rune is **`ᛇ`** printed as a fragment after a word divider at the end of the bottom line. The next p9 line starts **`ᚣᚹᚫᚷᛄ`** before the first divider. Together they form the six-rune manuscript word **`ᛇᚣᚹᚫᚷᛄ`** across the p8/p9 page seam. Therefore the natural 243-rune count closes *inside an authentic printed word*. It does not independently identify a full grammatical or cipher-state boundary. A 243-state receiver could exist, but it must explicitly justify its state clock and how that cross-page word is handled.

## Exact original-cipher decision

For rune sequence `x[0..n-1]` with `f_r` occurrences of each of 29 original GP rune values, use the standard coincidence statistic `sum_r f_r(f_r-1) / (n(n-1))`. **Every possible positional permutation has exactly the same 29-bin frequencies**, so the statistic is mathematically invariant, even if the visual reading order is entirely different. Any subsequent one-to-one **fixed** substitution of GP29 symbols also simply relabels bins. Hence this is a complete necessary-condition check for the position-only tree-side hypothesis, not an incomplete search of candidate row orders.

| Original receiver | Runes | Original IoC | Tree-side reading IoC |
| --- | ---: | ---: | ---: |
| Physical p8 black (excluding 12 red) | 243 | **0.034044145155** | 0.034044145155 |
| Physical p9 full rune stream | 268 | **0.033456313936** | 0.033456313936 |
| Consecutive p8-black + p9 | 511 | **0.033682514102** | 0.033682514102 |

A narrow **authentic, already-clear GP source control** is the *consecutive original LP1 p10–p11 plaintext runes* in `resources/transcriptions/liber_primus_master.txt`, beginning `MOST THINGS ARE NOT WORTH...` and continuing across its real page seam. It is **361 native GP runes**, without inventing English-to-GP contractions. Its **119** intact consecutive 243-rune windows have IoC **0.054790327518 to 0.057545148454**; its **94** 268-rune windows have IoC **0.055369221309 to 0.057800883224**. Neither original unknown page approaches these source-native short-chapter values. Native prose not drawn from these controls could differ, so these finite empirical bounds are a calibrated negative rather than a language-theoretic impossibility.

The visible tree-side line reversal has no way to change these distributions. A horizontal reflection of *glyph artwork* is also not a specified GP29 value mapping: the manuscript supplies no unambiguous mirrored-symbol alphabet for asymmetric printed runes. A future decoder must contribute an **independently selected symbol-changing or evolving-state operation**; only then would a visual reading orientation matter. Altered boundaries, binary plaintext, high-entropy externally provided keys and mixed substitution/transposition remain outside this gate.

## Reproduction and decision for #2224

- Original image evidence: `resources/liber-primus/25.jpg`–`30.jpg`; normalized original character/line transcription: `resources/liber-primus/lp2-transcription.txt`; exact ink spans: `resources/liber-primus/lp2-ink-annotations.json`; canonical numeric text: `resources/liber-primus/lp2-corpus.json`; solved LP1 control: `resources/transcriptions/liber_primus_master.txt`.
- Runnable complete original-source SFT: `node sims/lp2_p8_tree_side_line_reversal_original_sft.cjs`. It asserts page counts, every source page's rune equality with the canonical corpus, line lengths, the one-rune/five-rune page seam, original and tree-directed coincidence invariants, and source-native control windows. Manual Windows 11/Node22 workflow `.github/workflows/agent15-p8-tree-side-original-manual.yml` is dispatched under [run 45013848646](https://github.com/FlareZ123/liber-primus/actions/runs/45013848646).

**Fork:** Retire the **tree-side position-only cipher**, including any row reversal/order reversal and any single fixed rune relabeling, as a route to native-GP p8/p9 plaintext. Also retire the tacit claim that the 243 black glyphs form a self-framed physical packet; their ending bisects an original word. Preserve the source visible botanical orientation and p7 GF(3) recurrence only as hypotheses pending a historical opcode that changes rune values. Do not tune additional spatial permutations to improve language scoring: this invariant already covers every one of them. If a first-party source eventually supplies a typed evolving transformation, its p9 decoder can use the real word seam as a concrete untouched test.
