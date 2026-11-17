# PARABLE's 55-rune 28-step chain: direct key and all-secret page-seeded inverses

**17 November 2026 · Agent49.** Source-motivated exact reversible family plus an all-secret periodic-key invariant; all 55 encrypted physical LP2 pages remain unsolved. The strongest result rejects even unknown, changing within-page 28-symbol alphabets generated deterministically from any of the 55 proposed source page seeds, provided repeated seeds restart identically and one GP29 symbol remains the zero-step escape.

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

**Independent one-key-per-page model:** A more literal interpretation of the p57 55-rune source assigns one seed to each of the 55 unknown rune-bearing pages. Grant an **arbitrary secret 28-symbol substitution per physical page** on the nonzero ciphertext steps, identical throughout that page but wholly unrelated to the other 54 pages. Under each page's independently secret bijection, two nonzero steps on the **same page** remain equal exactly when their plaintext runes are equal, whatever the page's key. Pool the original source pages' ordered same-page equal pairs:

| Source key consumer | Original scaled conditional 28-IoC | Minimum over 44 length-matched English controls |
| --- | ---: | ---: |
| Any one static 28-symbol permutation separately for each of the 55 unknown physical pages | **1.0028036666** (113,000/3,155,154 eligible ordered pairs; 88 zero steps) | **1.6459615376** |

This exact result rejects every **source interior55 → independent page-key static 28-step alphabet** architecture for ordinary GP-native English without knowing *any* of the 55 keys. It remains compatible with changing alphabet within a page, feedback, page-specific phase rotations of a multi-symbol within-page cycle, a different reserved-rune convention, or another layer. Do not confuse this source-plausible page-*static* theorem with the above page-*reset* **period55** theorem, which allows 55 changing key positions *within* every page but starts the clock at position zero.

### Strongest source-shaped generalization: even an aperiodic stream repeated by the same p57 rune fails

A natural **different** use of the 55 strict interior runes is **one initial key seed per encrypted physical page**, with a potentially changing secret substitution at every position of that page. The source sequence repeats individual rune values: **106 unordered pairs of pages share the same seed** in either literal title-first or conditional body-first order.

Suppose each GP29 key rune, via **any secret deterministic generator**, defines a sequence of arbitrarily chosen 28-symbol bijections \`f_(seed,local rune position)\`; restarting a page with the **same** p57 seed restarts that same unknown sequence. The sequence can be arbitrarily long and nonperiodic. For two pages with the same seed, the nonzero ciphertext step at any same local position is equal **exactly when** the respective nonreserved plaintext runes are equal. This is true without knowing any generator, per-position key values or permutation. Compare all matching positions in the 106 repeated-seed page pairs, excluding observations where either ciphertext step is zero (the reserved EA plaintext), and normalize by 28:

| P57 strict-interior page assignment | Original nonzero chain-step equalities | Normalized original 28-IoC | Minimum of 44 GP-natural-English source controls |
| --- | ---: | ---: | ---: |
| Literal title-first, 55 seeds in physical page order | **830 / 22,420** | **1.0365744871** | **1.5666186532** |
| Conditional body-first, title5 shifted after body50 | **836 / 22,834** | **1.0251379522** | **1.6000353560** |

This **excludes an entire source-natural p57-page-seeded deterministic 28-step cipher family** for ordinary natural GP29 English, even if the individual key streams have astronomically large periods, no statistical bias and completely secret time-varying 28-alphabet permutations. It is a more general and source-fitted conditional theorem than the independent page-static or shared period55 results above. It complements [Agent49's prior GP29 raw-rune repeated-seed equality theorem](lp2-parable55-reused-seed-equality-gate.md), whose exclusion applied to direct symbolwise substitution rather than the ciphertext-step chain.

**All-secret planted positive:** derive for each (seed, local position) an independent invertible affine 28-symbol map. In a complete native-GP English corpus of **12,956** runes partitioned by the exact **55** physical page lengths, encode each page as a nonzero-step chain under the map for that seed and local index, and reserve EA as zero step. Decode each page exactly, recovering **12,956/12,956** GP29 runes, and assert the original matched-seed equality statistic equals the plaintext statistic **for both** source page-order assignments. Thus this invariant can detect a correctly seeded English cryptogram independent of its secret values.

**Required premise:** equal p57 seed runes imply identical generated keystreams and identical chain initialization at both page starts. A key derivation involving the physical page number, a per-page IV, an external entropy input, a plaintext/ciphertext-dependent key schedule, different reserved-rune mappings, or nonbijective/homophonic encoding is not ruled out. Such extensions need independent creator-supplied evidence and cannot be assumed simply to rescue the failed family.

The 44 calibration controls are disjoint 12,956-rune windows from **Gibran's *The Prophet*, Shakespeare, and Emerson**, greedily transliterated into the manuscript's GP29 alphabet using fixed K/Q→C, V→U, Z→S normalization. They are length-matched to all **55** original physical encrypted-page rune counts. They model ordinary GP29-transliterated English, not arbitrary non-English plaintext or an authentic exact GP word-spelling oracle. Across all 44 sources, no control is remotely as flat as the original at either clock.

**All-secret planted positive:** construct 55 different phase-specific invertible affine maps on the 28 nonreserve symbols using multipliers coprime to 28 and independently phase-varying translations. Encipher one native GP-English 12,956-rune source window as a *chain*, with the reserved EA mapping to zero step. Decode with the exact inverse secret permutation at each phase. The continuous period55, page-reset period55, independent page-static and repeated-source-page-seed secret-alphabet plants each recover **all 12,956/12,956** true plaintext runes, and their phase-conditioned 28-IoC is **bit-for-bit equal** to the unencrypted source. This verifies the all-secret invariant even for a source-unknown position-dependent substitution with entirely different keys at every phase.

**Consequence:** every *stationary 55-phase bijection*, every independent one-static-alphabet-per-page bijection, and every changing page-local secret stream that repeats upon a repeated p57 seed, within this exact one-layer, nonzero-step 28-ary chain is incompatible with **ordinary natural GP29 English** on the original 12,956-rune source. Unknown key values, an unknown global phase rotation or arbitrary affine/tableau substitutions per phase cannot repair the observed 1.00-vs-1.64 conditional coincidence gap. Independent page-specific phase shifts, key feedback, aperiodic keys, a different treatment of zero steps, homophony, letter-order changes, and multi-layer encipherment are outside the theorem. The existing original no-doublet clue alone does not prove that this chain architecture was used.

Reproducer: [all-secret 55-phase positive and original GP29 gate](../sims/lp2_55phase_chain28_allsecret_invariant_sft.cjs).

## Reproducer and decision

[Direct-key Windows-compatible CommonJS test](../sims/lp2_parable55_chain28_original_sft.cjs) reads the original rune transcription and source pages, verifies the p57 55-rune tape, enciphers and decrypts the independent LP1 known plaintext, and tests all **16** original complete reversible models on four independent scopes. The [manual workflow](../.github/workflows/agent49-20261116-source-gates-manual.yml) runs it together with the distinct original pointer-direction source-key gate.

**Retire the direct PARABLE 55-tape cyclic 28-chain receiver, all-secret 55-phase bijections, all-secret page-static bijections, and the larger all-secret repeated-p57-page-seed changing-alphabet family in the same exact one-layer 28-step chain.** The source-visible p57 circumference tape remains a potential operand with an unidentified operation, including clocks or nonlinear state changes outside this 55-phase family. The low-doublet original cipher remains a source fact worth explaining, but applying a new free modulo, offset, table permutation or arbitrary key-phase sweep without an independent Cicada-authored selector has no justified causal path to plaintext.
