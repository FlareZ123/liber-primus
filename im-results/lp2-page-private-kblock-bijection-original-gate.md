# Original LP2: secret page-private block ciphers with and without ciphertext feedback

**Agent 8, 14 November 2026. Bounded original-cipher family exclusion.** The 55 rune-bearing unknown pages retain all 12,956 original GP29 ciphertext runes. No previously unknown plaintext, original key, executable historical decoder, or continuation destination is recovered.

## Human-visible premise and alternative

The original p3/p39 mathematical red triads, the 2013 signed BASE29 three-digit example, and the p15 4×4 prime square offer independent, period-visible reasons why a player might try a fixed three-rune or four-rune block cipher. Such a device might use a secret 29³- or 29⁴-entry lookup or a linear Hill matrix, with different block alphabets on every physical page. The strongest assumption is that the ciphertext has independently encoded, nonoverlapping complete blocks that preserve plaintext runic length. Nothing first-party currently commands that cipher or selects its key.

A distinct explanation is a changing-state cipher that mixes adjacent blocks, compresses or transposes the plaintext before block encryption, or consumes external secret material. The independent-block gate below leaves these mechanisms open. The additional postfeedback gate tests only a fixed page-local block bijection followed by coordinatewise addition of the preceding ciphertext block. Other feedback placements and changing-state rules remain open. This report does not re-run the separately excluded fixed two-rune bijection, word-local affine or five-phase secret-alphabet models.

## All-key theorem and original-byte measurement

For any deterministic **bijective** map F from GP29^k to itself, two distinct complete plaintext blocks remain distinct after F, and equal blocks remain equal. Thus the number of unordered equal-block pairs among all complete, aligned blocks in any physical page is unchanged by *every possible secret block permutation*. The key may differ independently on each page, and no feasible exhaustive key search is required.

Count unordered identical complete-block pairs *within each page only*, discarding source-visible partial blocks. Let each page independently choose any start phase 0,1,...,k−1, even after seeing the original. Sum the minimum, maximum, and phase-zero counts over all 55 physical pages. All page lengths, original rune indices, and page ordering come unmodified from [the canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json).

| Block size | Original minimum across page phases | Original maximum across page phases | Original phase-zero count |
| --- | ---: | ---: | ---: |
| Three GP runes | **0** | **17** | **4** |
| Four GP runes | **0** | **0** | **0** |

Even choosing the alignment to **maximize** repetitions on each original page yields only 17 repeated-triple pairs and zero repeated-quadruple pairs. These are source measurements, not a proof of deliberate cipher structure; close-to-uniform ciphertext naturally has few repeated long blocks.

## Source-calibrated plaintext obstruction and full-positive controls

Use the existing independently calibrated English-to-GP29 spelling that encodes ING and IO as single native runes, rather than relying on inventory labels alone ([181-word original LP1 calibration and authentic LP2 p57](../results/lp1-source-orthography.md)). Transform the repository's actual full Gutenberg Gibran and 300,000-character Shakespeare controls and take every complete 12,956-rune control window with starting offsets 0,1536,3072,... . Each window is repartitioned into the *exact same 55 source page lengths*, without inventing new word breaks. For each control window, let every physical page independently choose the phase giving the **fewest** equal-block pairs. This is optimistically favorable to any proposed hidden block key. The tested finite controls have:

| Size | Gibran: 33 windows, smallest page-optimized collision total | Shakespeare: 133 windows, smallest page-optimized collision total | Original page-optimized upper bound |
| --- | ---: | ---: | ---: |
| Three runes | **226** | **108** | **17** |
| Four runes | **40** | **11** | **0** |

For each size, the original's **maximum** over all phase selections is below the **minimum** in either independent native-English corpus. Therefore *no invertible secret k-block alphabet, even a different arbitrary one on every page with any per-page phase, maps any of these 166 original-layout native-English windows into the original ciphertext*. This includes all secret 3×3/4×4 Hill matrices, independent full-block S-boxes and arbitrary per-page affine maps acting independently on aligned whole blocks.

The exact read-only CommonJS test [\`sims/lp2_pageprivate_kblock_allsecret_sft.cjs\`](../sims/lp2_pageprivate_kblock_allsecret_sft.cjs) asserts the original 55 pages/12,956 rune total and all metrics above. It constructs complete **12,956-rune model-matched encrypted positives** for both literary controls and k=3/4 with independently keyed, per-page and per-block-slot affine GP29 bijections, recovers 12,956/12,956 and verifies phase-zero collision invariance. It also checks the first 37 original p57 GP runes against the authentic beginning, including the printed PARABLE heading and source-native TUNNELING/ING. These controls check the implemented invariant and source encoding, not any historical LP2 key.

## Additional all-secret ciphertext-feedback block family (14 November)

A distinct reversible author-plausible architecture uses an output-feedback chain over whole blocks. At each complete noninitial length-k block on each physical page, let

    C[t] = F_page(P[t]) + C[t−1] mod 29

with coordinatewise addition, arbitrary **unknown invertible GP29^k block permutation F_page**, independently secret for every page, and arbitrary first-block state or IV. This is **post-feedback** outside the secret map; it differs from conventional CBC's prewhitening \`F(P[t]+C[t−1])\` and from a keystream applied before the block map.

Subtracting the **observed preceding ciphertext block** gives \`D[t]=C[t]−C[t−1]=F_page(P[t])\`. Hence equalities between complete **noninitial delta blocks** correspond *exactly* to plaintext-block equalities, independent of **all** secret per-page lookup tables. The first block and any incomplete trailing block are excluded. No key search or plaintext guess is required. The authentic page starts motivate the first predeclared alignment (phase zero); as a harder adversarial variant, allow every physical page to choose any of its k phases *independently* after reading the ciphertext.

With the unchanged 55 source page lengths, all **367** windows of independent GP29-encoded English literature have the following page-start-aligned collision totals:

| Block k | Original fixed phase zero | Gibran smallest (33 windows) | Shakespeare smallest (133 windows) | Emerson smallest (201 windows) |
| ---: | ---: | ---: | ---: | ---: |
| 2 | **447** | **761** | **608** | **564** |
| 3 | **7** | **46** | **20** | **12** |
| 4 | **0** | **7** | **1** | **0** |

For k=2 and k=3, **every** tested full-length English window exceeds the original source under the authentic phase-zero page boundary convention. The English with the **fewest** matching delta blocks still has too many to come from any page-private fixed bijective block map under this postfeedback operation. The eight-bit numeric table and mathematically highlighted p3/p39 triads and p15 square make blockwise keyed arithmetic a concrete historical-mathematical hypothesis; there is, however, **no signed Cicada instruction authorizing this particular feedback operation**.

For an additional conservative adversarial clock, allow every page to choose a different start phase. The original's possible collision-total intervals are k2 **392–526**, k3 **0–23**, k4 **0–0**. The Gibran window minima after each independent page chooses its collision-*minimizing* phase are **633, 25 and 3**, respectively. Thus, **even under all page-local phase choices**, none of the 33 Gibran GP-native 12,956-rune windows maps to the source under this entire secret-per-page feedback family. The Shakespeare/Emerson envelopes do overlap for some windows, so this wider phase-free conclusion **does not** extend to all three reference corpora. At k4 with phase-zero alignment, exactly six Emerson windows have the same zero-collision statistic as the original, so that case is **inconclusive**.

The updated source SFT now performs **nine additional complete 12,956-rune planted-key GP29 encryptions** with independently secret page- and block-coordinate affine substitutions, chained through the *previous ciphertext block*. All nine recover every planted plaintext rune and preserve delta-block equalities exactly. This is a positive implementation control within a subset of the permitted arbitrary secret permutations, rather than a historical positive. The original did not reveal which block key, IV, or author-preferred cipher state exists.

**Research decision:** fixed page-private two- and three-rune bijective block transformations **followed by GP29 coordinatewise ciphertext-block feedback** cannot explain the entire original under any of the 367 finite tested native-English reference windows with source-boundary alignment, regardless of the secret per-page mapping. The unrestricted phase family is excluded against the 33 Gibran controls only, while other registers still overlap. This does not constrain conventional prewhitening CBC, nonbijective lossless side-channel coders, block-position-changing keys, evolving interblock permutations, altered word/page boundaries or a genuinely recovered external secret. A next candidate requires an independent source instruction selecting those alternatives and a real unknown-cipher plaintext prediction.

## Consolidated scope and decision

**Independent blocks:** For the 166 tested 12,956-rune Gibran/Shakespeare native-GP windows, every page-private, independently aligned fixed 3-/4-rune bijective block map fails its key-independent equality invariant on the original source, even with a different arbitrary secret map per page. This is more general than excluding only Hill3/Hill4 matrices.

**Additive ciphertext-block postfeedback:** For the 367 tested native-GP windows from Gibran, Shakespeare and Emerson, fixed page-start alignment excludes arbitrary page-private bijective 2-/3-rune block maps followed by coordinatewise addition of the preceding ciphertext block, because subtracting that preceding ciphertext exposes the equality invariant. When every page may choose its own block phase, the original is still incompatible with all 33 tested Gibran windows for k=2/3, but the Shakespeare/Emerson ranges overlap. The four-rune feedback test is inconclusive against Emerson. Neither test identifies a historical cipher.

Neither result excludes an actual English passage with a different block-collision profile, another plaintext register, source-selected pretransposition, per-block evolving maps, conventional CBC-style *prewhitening inside* the block map, other ciphertext/plaintext feedback, variable-length coding, altered page boundaries, or external keystreams. These finite 166-window independent-block and 367-window postfeedback comparisons are **reference-class exclusions**, not universal English-language probabilities.

**Next decision:** avoid additional fixed-secret Hill3/Hill4 or repeated page-private postfeedback permutations under these same assumptions. Investigate further block/state families only when original clues select the changed operation or a separately recovered plaintext/key provides an independent prediction. A successful synthetic round trip checks implementation, never historical correctness.

Reproduction: run the referenced CommonJS SFT under Node.js 22 from the repository root. It reads checked-in corpus and control texts without network access or generated output files.
