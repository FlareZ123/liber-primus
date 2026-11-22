# 2016-derived PRNG seed under the 2012 P.S. modulus: bounded negative

**Status: bounded negative. No unknown LP2 plaintext, authentic key, complete cipher, or destination recovered.** The exact 13-token value extracted from the 2016 signed-message analysis was tested under two source-motivated uses of the 2012 P.S. composite modulus and the repository's fixed-plaintext soft no-repeat keyskip model. Neither use produces a language signal above random-seed controls.

## Source-derived candidate

The preserved 2016 signed-message analysis in [the base-29 line:character report](lp2-2016-signed-message-base58-word-map.md) obtains the operation marker **PRNG**. Removing those three marker runes leaves the 13-token string **LCBPNGPARRTHBPC**, whose base-29 integer is:

- decimal: **7144649572585460758**
- hexadecimal: **0x6326e4eeaa9a5416**
- width: **63 bits**

The 2012 Cicada final-message P.S. supplies a 432-bit composite that has been interpreted as a candidate modulus \(N=pq\), with two published 216-bit factors. The earlier modular-squaring investigation tested six other historically salient seeds, but not this 2016-derived value. Reusing the 2012 number as an LP2 generator modulus is a hypothesis, not an instruction authenticated by the P.S.

## Test A — page/continuous key schedules on a fixed sample

The first screen used physical pages **0, 7, 23, 28, 42 and 53**, totaling **1,403 runes**. It tested 32 predeclared settings:

- two initializations: \(x_0=\text{seed}^2\bmod N\), or the seed as the already initialized state;
- four reductions to GP29: full-state residue modulo 29, low byte modulo 29, five-bit big-endian with rejection of 29–31, and five-bit little-endian with the same rejection;
- both additive signs;
- continuous key stream or physical-page key reset.

The cipher model uses the repository's exact fixed-plaintext soft no-repeat keyskip transducer: an immediately repeated proposed ciphertext rune is rejected with probability 81%, with at most 32 total hidden advances and at most three consecutive rejections per emitted rune.

The best original-cipher model was **seed-squared / full-residue / +1 / continuous**, log likelihood **−5427.179225**. The most direct five-bit-big/page-reset interpretation ranked **11th of 32**, at **−5545.186989**.

A matched null used **50 random 63-bit seeds**, each searched over the same 32 settings; **31 of 50** null maxima equaled or exceeded the observed seed's best score. Add-one empirical \(p=32/51=\mathbf{0.627451}\). The null median best score was **−5416.719418**, with range **−5463.058086 to −5373.873870**.

The 1,403-rune Gibran positive plant recovered the exact initialization, five-bit-big reduction, sign and reset in all four initialization/reset combinations. This screen can recover the mechanism at the tested length; the original seed does not.

## Test B — reset at every image-confirmed 13-dot LP2 event

A second test used the entire unsolved corpus: physical pages **0–55**, totaling **12,956 runes**. The source annotation records **28 image-confirmed 13-dot events** on these pages. Treating each printed event as a possible reset boundary creates **29 fragments**, of which **26 are nonempty and three are empty**. The 28 events include the two physically distinct coincident-offset pairs; neither is silently deduplicated. The fragment lengths are:

    13, 716, 16, 103, 3, 690, 11, 308, 0, 14,
    1729, 0, 9, 11, 1883, 16, 1005, 19, 1414, 10,
    81, 8, 1460, 3, 118, 3008, 9, 299, 0

This schedule is only a candidate interpretation of the punctuation. The test does not assume that the marks are proven section separators or that the creator intended a key reset there.

The 16 settings cover the two initializations, four GP29 reductions and both signs. At each fragment boundary, both the PRNG key and the soft-repeat state restart from the same candidate seed. To avoid an arbitrary fixed skip cap on fragments of very different lengths, each fragment's maximum hidden advances is set to **three times its observed adjacent-doublet count**, exactly covering every path allowed by the model's maximum of three rejections per emitted rune. The 12,956-rune ciphertext contains **86 adjacent doublets**, so the sum of these per-fragment caps is **258**.

The best original-cipher model was **seed-state / five-bit-big / −1**, log likelihood **−51826.884103**. The direct **seed-squared / five-bit-big / +1** interpretation ranked **13th of 16**, at **−52204.599523**.

A matched null used **25 random 63-bit seeds**, each searched over the same 16 settings; **12 of 25** null maxima equaled or exceeded the observed best score. Add-one empirical \(p=13/26=\mathbf{0.5}\). The null median best score was **−51828.532501**, with range **−51999.163885 to −51642.328866**. The candidate is essentially at the null median.

For positive controls, a 12,956-rune Gibran GP plant was encrypted with the same seed, five-bit-big reduction, +1 sign and per-fragment resets. The screen recovered the exact planted initialization and settings for both initialization conventions. The plants required **379** and **404** rejected key draws. The negative result is not caused by an underpowered screen.

## Historical cross-check correction

Do **not** use the Unicode placeholder in the earlier LP1 transcription as evidence that the LP1 0_wisdom page has the same 13-dot stencil. The source-exact [2013 0_wisdom image audit](2013-0-wisdom-punctuation-image-audit.md) establishes that its three positions transcribed as ⁜ are **11-dot** stencils, while the two prose positions transcribed as ⁘ are four-dot diamonds. The transcription symbols are not reliable numeric dot-count labels. That audit does not establish the meaning of the LP2 13-dot glyph.

## Decision

The specific chain

**2016 PRNG marker → 13-token base-29 value → 2012 P.S. candidate modulus → modular-squaring GP29 additive stream with soft no-repeat key skipping**

does not produce a credible LP2 key under the tested reductions, signs, initializations, or reset schedules. This includes continuous/page resets on the fixed sample and a reset at every image-confirmed 13-dot event across all 56 unsolved pages.

Do not expand generic seed searches or repeat direct RSA-stream/XOR/additive tests. This does **not** rule out a different PRNG family, a non-additive use of the 13 tokens, a genuinely source-selected path/permutation operation, a different historical modulus, or an independently justified state transition. It also does not prove that 13-dot marks are key-reset instructions.

## Reproduction and relationship to prior work

Run from the repository root with Node.js 22:

    node sims/lp2_2016_prng_seed_ps2012_modsquare_keyskip.cjs
    node sims/lp2_2016_prng_seed_ps2012_modsquare_fragment_reset.cjs

The first script reproduces the 32-model sample screen, 50-seed max-statistic null and four positive controls. The second script derives all 13-dot fragment boundaries from the original-image annotation file, reproduces the 16-model full-corpus screen, 25-seed max-statistic null and two positive controls.

Related source and prior tests:

- [2016 signed-message base-29 PRNG extraction](lp2-2016-signed-message-base58-word-map.md).
- [2012 P.S. modular-squaring source analysis](ps2012-modsquare-key-source.md), which tested six other historically salient seeds.
- [13-dot coincident-boundary audit](13dot-coincident-empty-fragments.md), which preserves all 31 printed events and the two coincident-offset pairs.
- [2013 0_wisdom source-exact punctuation audit](2013-0-wisdom-punctuation-image-audit.md), which corrects the transcription-to-image dot-count crosswalk.
- [Exact soft no-repeat keyskip transducer](../sims/keyskip_transducer.cjs).

No established result or overall-synthesis change is claimed.
