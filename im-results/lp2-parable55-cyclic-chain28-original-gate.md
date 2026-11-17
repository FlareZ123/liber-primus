# PARABLE's 55-rune 28-step chain: direct key and all-secret periodic inverse

**17 November 2026 · Agent49.** Source-motivated exact reversible family plus an all-secret periodic-key invariant; all 55 encrypted physical LP2 pages remain unsolved. The second result subsumes every arbitrary 55-phase 28-symbol secret bijection under the stated chain register.

## Why a player might try this

The 2016 signed Cicada phrase “its words are the map, their meaning is the road, and their numbers are the direction” invites a conditional **directional step** reading. The encrypted pages have only **86 equal adjacent runes in 12,901 same-physical-page pairs**, far fewer than an approximately uniform independent GP29 stream, while their 29-symbol marginal counts remain almost flat. Replacing literal symbol values by consecutive **nonzero modulo29 increments** is one direct way to reproduce this exceptional no-repeat feature without a complicated cipher.

The independently clear original p57 *PARABLE* contains a source-specified phrase “shed our own circumferences.” Removing the first and last rune of each of its 20 words leaves **55 GP29 key symbols** (title 5, body 50), the number of unknown rune-bearing physical pages. The complete 55-rune internal tape contains **no last-alphabet GP29 EA rune** (index28), so it can be read directly, with no discarded symbol, as a repeated 28-symbol source key.

Neither the 2016 signed clue nor *PARABLE* specifies that the manuscript uses the following chain mode or that this tape is a running key. The coincidence is a clue-conditioned hypothesis, not an established historical instruction. This test is deliberately independent of [#1329's traditional additive key-pointer experiment](https://github.com/FlareZ123/liber-primus/issues/1329) and the [PARABLE pdir trial](lp2-parable55-all66-word-pointer-original-phase0-gate.md).

## Fully specified and reversible source-key candidate

Index the Gematria Primus alphabet 0..28. Let the 55-symbol p57 interior tape be K. For a ciphertext GP29 rune C at position i and previous ciphertext rune Cprev, let \`step = (C - Cprev) mod29\`.

Freeze the natural **EA-reserved** 28-step chain:

- \`step = 0\` means \`P = 28\` (literal EA). This permits the rare observed ciphertext repeat without an extra skip-bit channel.
- \`step in 1..28\` means \`P = (step - 1 - K[i mod55]) mod28\`, giving one of the other 28 plaintext runes.
- The corresponding forward encoder is \`C = (Cprev + 1 + ((P + K[i mod55]) mod28)) mod29\` for P≠28 and \`C=Cprev\` for P=28.

Every GP29 plaintext sequence has a unique ciphertext under this known key and initial previous symbol, and every ciphertext uniquely decodes. The rule uses the source GP prime rune indices directly: the tape has no EA, so \`K[i]<28\` is natural.

To bound simple source variations without parameter fitting, the trial grants two source-visible tape orders (literal title-first versus conditional table-split body-first), both ± key directions, both page-continuous and page-reset clocks, and both GP29 endpoint symbols EA=28 and F=0 as the zero-step escape (the latter requires shifting all 28 normal decoded rune indices by one). This is **16** complete original-cipher receivers. Cprev is zero for the first rune or at each physical-page reset; no source-specific phase offset, free permutation, inferred key or language maximization is permitted.

The input is the untouched canonical 12,956-rune ciphertext for physical LP2 pp0–55, preserving rune order and all physical page boundaries. The additional independent regions are original opening pp0–2, withheld 14-page pp40–53, and terminal pp54–55. One index-of-coincidence statistic per region suffices to reject direct GP-native English, and all 16 full candidate plaintexts can be regenerated exactly.

## Original-input outcomes

The best normalized \`29×IoC\` over all 16 direct decoders is:

| Original independent region | Best normalized GP29 IoC |
| --- | ---: |
| Opening physical pp0–2 (729 runes) | **1.035933** |
| Held-out physical pp40–53 (3,008 runes) | **1.026251** |
| Terminal pp54–55 (308 runes) | **1.028047** |
| All 55 unknown rune-bearing pages (12,956 runes) | **1.024512** |

For comparison, a fixed 300-rune source-native English plant from independently solved LP1 *WELCOME* has normalized GP29 IoC **1.642363**. A separate forward planter implements the exact frozen chain encoder with the literal 55-rune tape, sign+, EA-reserved, and a previous-ciphertext seed of zero, then exhaustively asserts **300/300 exact original-rune recovery** by the inverse. A reversed-key control yields less English-like plaintext. The real original ciphertext remains flat in every tested independent region, including the longest 3,008-rune section, for which true native GP29 English would have substantially higher coincidence.

This excludes the specified **direct one-layer** 28-step chain reading using the clear p57 55-rune tape at phase zero; it does not exclude a chain using another source key, another alphabet, a secret tableau, a second cryptographic layer, a physically indicated nonzero key phase, or plaintext that is not natural GP29 English.

## Stronger result: a key-independent impossibility for all secret 55-phase alphabets

The direct tape above is one concrete source-value assignment. A more useful decision can be made **without knowing any of the 55 key values**, and even when each position of the 55-symbol period uses its own unknown **arbitrary permutation of the 28 nonreserved runes**. This covers every secret 55-phase Vigenère, secret affine transform and all 28! possible substitutions per phase, a vastly larger family than the supplied literal p57 tape.

Let \`D_i=(C_i-C_prev) mod29\`. Remove the rare \`D_i=0\` positions; map each remaining step to \`R_i=D_i-1\` in 0..27. Under any fixed period55 unknown per-phase permutation \`f_{i mod55}\` of this 28-symbol alphabet,

\`\`\`text
R_i = f_(i mod55)(P_i),    for all P_i except the one reserved zero-step GP29 symbol.
\`\`\`

Whenever two positions share a 55-phase, their \`R\` values are equal **if and only if** the corresponding plaintext symbols are equal. Thus the sum of same-phase equal-rune pairs divided by all eligible same-phase pairs is **exactly invariant under every secret key**, regardless of which per-phase bijections were used. A global unknown phase offset merely renames the 55 bins and does not change the statistic.

The normalized conditional statistic is \`28×(sum over phases and symbols n_(phase,symbol)(n_(phase,symbol)-1)) / (sum over phases N_phase(N_phase-1))\`, excluding zero-step observations from each eligible count. Full original physical pp0–55, **12,956 ciphertext runes**, tested with two natural clocks:

| 55-phase key clock | Original GP29 chain steps, scaled conditional 28-IoC | Minimum across 44 natural-English original-length controls |
| --- | ---: | ---: |
| Continuous across physical pages | **1.0059917140** (107,742 / 2,998,808 ordered equal/eligible pairs; 86 zeros) | **1.6359185716** |
| Reset at every physical page | **0.9974646612** (107,152 / 3,007,882; 88 zero steps after resets) | **1.6382247339** |

The 44 calibration controls are disjoint 12,956-rune windows from **Gibran's *The Prophet*, Shakespeare, and Emerson**, greedily transliterated into the manuscript's GP29 alphabet using fixed K/Q→C, V→U, Z→S normalization. They are length-matched to all **55** original physical encrypted-page rune counts. They model ordinary GP29-transliterated English, not arbitrary non-English plaintext or an authentic exact GP word-spelling oracle. Across all 44 sources, no control is remotely as flat as the original at either clock.

**All-secret planted positive:** construct 55 different phase-specific invertible affine maps on the 28 nonreserve symbols using multipliers coprime to 28 and independently phase-varying translations. Encipher one native GP-English 12,956-rune source window as a *chain*, with the reserved EA mapping to zero step. Decode with the exact inverse secret permutation at each phase. Both continuous and per-page-reset plants recover **all 12,956/12,956** true plaintext runes, and their phase-conditioned 28-IoC is **bit-for-bit equal** to the unencrypted source. This verifies the all-secret invariant even for a source-unknown position-dependent substitution with entirely different keys at every phase.

**Consequence:** every *stationary 55-phase bijection* within this exact one-layer, nonzero-step 28-ary chain is incompatible with **ordinary natural GP29 English** on the original 12,956-rune source. Unknown key values, an unknown global phase rotation or arbitrary affine/tableau substitutions per phase cannot repair the observed 1.00-vs-1.64 conditional coincidence gap. Independent page-specific phase shifts, key feedback, aperiodic keys, a different treatment of zero steps, homophony, letter-order changes, and multi-layer encipherment are outside the theorem. The existing original no-doublet clue alone does not prove that this chain architecture was used.

Reproducer: [all-secret 55-phase positive and original GP29 gate](../sims/lp2_55phase_chain28_allsecret_invariant_sft.cjs).

## Reproducer and decision

[Direct-key Windows-compatible CommonJS test](../sims/lp2_parable55_chain28_original_sft.cjs) reads the original rune transcription and source pages, verifies the p57 55-rune tape, enciphers and decrypts the independent LP1 known plaintext, and tests all **16** original complete reversible models on four independent scopes. The [manual workflow](../.github/workflows/agent49-20261116-source-gates-manual.yml) runs it together with the distinct original pointer-direction source-key gate.

**Retire the direct PARABLE 55-tape cyclic 28-chain receiver and the strictly larger all-secret 55-phase bijection family in the same exact one-layer 28-step chain.** The source-visible p57 circumference tape remains a potential operand with an unidentified operation, including clocks or nonlinear state changes outside this 55-phase family. The low-doublet original cipher remains a source fact worth explaining, but applying a new free modulo, offset, table permutation or arbitrary key-phase sweep without an independent Cicada-authored selector has no justified causal path to plaintext.
