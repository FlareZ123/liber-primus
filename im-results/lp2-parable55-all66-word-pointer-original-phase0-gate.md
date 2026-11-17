# PARABLE interior-55 key against the complete source-named word-direction family

**17 November 2026 · Agent49 · conditional original-input negative.** No new authentic unknown Liber Primus plaintext or key.

## Human-selected input and tested premise

Physical LP2 p57 prints the unencrypted 20-word *PARABLE* whose instruction includes “shed our own circumferences.” Removing exactly one rune at each end of each printed word gives a **55-rune internal sequence**: five runes from the title and 50 from the body. Original LP2 has **55 encrypted rune-bearing physical pages** (pp0–49, p51–55) and a rune-free p50 numerical table. These source observations suggest a possible page key but do not establish how the author intended to use it.

This gate **conditionally** treats those 55 GP29 runes as a cyclic *running key* read by the 2016 clue's wordwise pointer-direction mechanism. The strong rival is that *PARABLE* gives no author-specified instruction to recycle the 55 runes at each cipher position, and the 2016 signed “numbers are the direction” text may refer to navigation instead of key-pointer movement. The source's literal title-first interior tape and a conditional table-split body-first tape were considered; each was read both as GP29 rune index and as its assigned prime number modulo29.

The scope is a previously unscreened, **source-derived tape**, separate from the already running [#1329 historical 581-stream campaign](https://github.com/FlareZ123/liber-primus/issues/1329). It does **not** repeat or replace the full historical library search.

## Exact original-input experiment

The original first three encrypted physical pages contribute **729 intact GP29 runes and 158 printed words**, joined across the two physical page-carrying boundaries. The screen uses exactly their first **300** runes. Physical page-local and dot-separated clause word numbers are used for the applicable direction rules, with the actual first word of each page reset to one. The source GP29 alphabet and prime table are in [canonical original text](../resources/liber-primus/lp2-corpus.json) and [original punctuation transcription](../resources/lp2-transcription.txt).

The direction rule set is the 61 deduplicated sign rules and five additional GP-number rules in pinned [pnotisdev/cicada3301 phase30](https://github.com/pnotisdev/cicada3301/tree/15200c67abee106913ba01ff504c5b6e88d16cc7/work/kscreen), specifically its frozen 66-name \`dir_rules.txt\`. The GP-prime \`*_cur\` rules are labelled **acausal** in that source; they are retained only to cover the source's stated finite search envelope, not as historically selected encryptor behavior.

Test matrix:
- 66 source direction rules × 18 pointer conventions (h=0/1, m=0/1/2, comparator=0/1/2) × 2 direction orientations;
- four 55-rune tape interpretations (literal/title-first vs proposed body-first; GP-index vs GP-prime modulo29);
- two key multipliers 1/28 and two exact anti-repeat branching models (skip vs coin);
- **38,016** original prefix decodes, pointer initialized at **1100**, where 1100 is 20 complete 55-symbol tape cycles and therefore **phase zero**, beam width **8**;
- score \`29 * sum(n_a * (n_a - 1)) / (300*299)\` over recovered GP29 symbols.

The original pdir reference used finite stream buffers and a 300-symbol look-behind pad. This trial states an **explicit cyclic wrap** hypothesis for the 55-rune source tape and lets pointer states advance to either direction indefinitely. The 1100 initial pointer changes absolute position only, not initial key phase; wordwise direction and skip rules are identical to the referenced bounded beam family. The original unknown ciphertext and word boundaries were not changed.

## Outcome and exact source-native control

Original first300 best normalized GP29 coincidence **1.2013823857302117**. Top settings: \`B7_prev_R\`, convention \`120\` (also tied \`121\` and \`122\`), normal direction, literal title-first GP-index tape, multiplier28, skip model0. **Zero** of the 38,016 original settings reached scaled IoC **1.35**, and **zero** reached the source campaign's **1.40** candidate threshold. There is no coherent unknown-page plaintext candidate under this frozen source-key/phase envelope.

An independent **planted** controlled plaintext, using the *WELCOME* section of the separately solved LP1 reference transliterated greedily into GP29 (explicit K/Q→C, V→U, Z→S conventions), provides **300 GP29 runes** with normalized coincidence **1.6423634336677815**. The planter uses the same source-derived 55-rune tape at phase zero, causal \`A_cur_n\` word-length-parity direction, convention \`000\`, multiplier1, skip model0 with all direct first-key emits and no extra retry. The decoder recovers scaled IoC **1.6423634336677815**; its reversed **wrong key** produces **1.0707692307692307**. This calibrates detection in an exact planted case, but is **one** synthetic positive with an easier no-retry path, not a proof of sufficient power across every stochastic skip/coin convention or unknown original key.

The reusable locked SFT is [\`sims/lp2_pdir_parable55_phasezero_original_sft.cjs\`](../sims/lp2_pdir_parable55_phasezero_original_sft.cjs) and its Windows Node22 dispatcher is [manual-only Agent49 source gates](../.github/workflows/agent49-20261116-source-gates-manual.yml).

## Decision

**Retire only this phase-zero cyclic interior-55 key against the source's 66-rule pointer-direction family on the intact p0 opening.** Retain the original **55-rune interior/source-page count** as an observed clue, with no established key consumer. Key phases chosen by an independent original clue, a one-use 55-symbol page-key schedule, a source-authored different direction rule, or another cipher are untested. The full 581-stream historical #1329 campaign and its already scripted same-key null/whole-window reducer remain independently active; no additional full-library CI is justified by this result.

If a new **first-party** clue specifies how the circumference key should be read or where its phase begins, test the specified operation once on an independent original window with a held-out page and exact forward reconstruction. Until then, expanding phase, word-sign, or key-transform menus would create unfalsifiable parameter fitting.
