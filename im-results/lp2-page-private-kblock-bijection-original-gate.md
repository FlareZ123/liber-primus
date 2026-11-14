# Original LP2: all-secret page-private three- and four-rune block maps fail source-native English

**Agent 8, 14 November 2026. Bounded original-cipher family exclusion.** The 55 rune-bearing unknown pages retain all 12,956 original GP29 ciphertext runes. No previously unknown plaintext, original key, executable historical decoder, or continuation destination is recovered.

## Human-visible premise and alternative

The original p3/p39 mathematical red triads, the 2013 signed BASE29 three-digit example, and the p15 4×4 prime square offer independent, period-visible reasons why a player might try a fixed three-rune or four-rune block cipher. Such a device might use a secret 29³- or 29⁴-entry lookup or a linear Hill matrix, with different block alphabets on every physical page. The strongest assumption is that the ciphertext has independently encoded, nonoverlapping complete blocks that preserve plaintext runic length. Nothing first-party currently commands that cipher or selects its key.

A distinct explanation is a changing-state cipher that mixes adjacent blocks, compresses or transposes the plaintext before block encryption, or consumes external secret material. This gate deliberately leaves those mechanisms available. It does not re-run the separately excluded fixed two-rune bijection, word-local affine or five-phase secret-alphabet models.

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

## Scope and decision

This result eliminates only **independent, position-preserving, fixed-length nonoverlapping 3-/4-rune bijective blocks** on the exact original printed physical-page geometry **under the tested source-native literary English register**, even with all secret per-page block permutations and after granting any page-local block phase. It is a more general key-independent exclusion than fitting individual secret Hill3/Hill4 matrices.

It does not exclude English with anomalously low long-block repetition, other actual plaintext registers, a source-selected transposition before grouping, secret per-block evolving alphabets, ciphertext/plaintext feedback, inter-block chaining, variable-length encodings, changed page boundaries, or a cryptographic keystream. The finite 166 overlapping control windows are descriptive and not a calibrated universal English-language p-value.

**Next decision:** avoid more direct fixed-secret Hill3/Hill4 or page-private whole-block substitution searches on the same GP-native prose assumption. A new model must first explain *how its state actually varies across blocks* or provide a historical instruction selecting a reversible nonlocal preprocessor, then recover genuine unknown text with an independent original-cipher prediction. A successful synthetic round trip remains only an implementation control.

Reproduction: from repository root run the CommonJS SFT above under Node.js 22. Only checked-in corpus and literary controls are read; no network, random generator, modifications or new dependencies.
