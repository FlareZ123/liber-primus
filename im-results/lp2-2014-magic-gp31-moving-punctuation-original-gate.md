# 2014 source magic squares as GP31 movable-word-boundary transforms

**Agent46, 22 November 2026 | Original-cipher negative; no unknown plaintext.** The exact historic 2014 Cicada magic-square matrices can be used as lossless GF31 5×5/7×7 Hill transforms over **29 Gematria Primus runes plus literal hyphen and period**. This genuinely changes both rune values and printed word boundaries. Across all twelve original-square direct/inverse and row/column conventions, neither original p16–21, source-related p33–39, nor held-out p40–53 produces contiguous plaintext.

## Source selection and its objection

The PGP-signed original [2014 Stage10 form](../resources/historical/cicada2014-stage10-original-form.html) instructs participants to **paste** magic squares of orders5,7,5 with sums3301,1033,1033 into web form fields. It does not say to **use their numerical entries as a cipher key on Liber Primus**, nor to decode with modulus31. The three squares are authentic [original source inputs](../resources/cicada2014-openpuff-magic-squares.txt). The GP31 interpretation is a human-plausible hypothesis obtained by adding the two actual printed word/stop symbols to the 29 runes, and only a bounded source-original test. The previously excluded p15 Fibonacci 4×4 GF31 Hill cipher has a different physical source and packet order.

The source-native tape preserves the exact 12,956 original GP runes, every actual hyphen (ordinal29) and full stop (ordinal30), cross-page word carry, and rune-free physical p50; the six Arabic numeral-heading dashes are outside the GP31 cipher channel. Three original source-square integer matrices all have full rank modulo31 and **determinants 30,9,27 modulo31**. For each square, apply M, M inverse, M transpose, or its inverse transpose to consecutive fully observed n-token packets in the first unambiguous packet phase; copy an incomplete final packet unchanged. Their opposite matrix restores each source rune and literal delimiter exactly. No secret numeric parameters or scorer-fitted rotations enter the algorithm.

| Original physical source | Source GP31 tokens | Original literal word and stop delimiters | Literal delimiters after twelve original transformations | Maximum decoded six-class (marks + top-five runes) share | Worst maximum decoded word length |
| --- | ---: | ---: | ---: | ---: | ---: |
| p16–21 | **1,985** | **372** | **103–139** | **26.700%** | **134 runes** |
| p33–39 | **2,058** | **378** | **120–146** | **26.531%** | **138 runes** |
| p40–53 independent | **3,677** | **669** | **224–254** | **25.428%** | **111 runes** |

All decoded GP31 streams have only ~5–7% literal source punctuation, repeated empty word slots, very long pseudo-words, top-five GP rune share under24%, and IoC near 0.0345. Source-native original controls have around18% punctuation and word lengths≤14. None of the twelve original-sourced operators produces coherent plaintext or an additional source instruction. The full authentic solved p57 **95 rune +16 hyphen +4 stop** native GP31 tape is independently encrypted with the exact corresponding inverse for each matrix and recovered perfectly; a deliberately wrong identity key does not recover the original solved source. This validates the operator and round-trip without claiming a real unknown-page key.

## Exact reproduction and research decision

- [Read-only Windows Node22 SFT](../sims/lp2_2014_magic_gp31_movable_wordmarkers_original_sft.cjs) performs original-corpus rune alignment, exact source 2014 magic-matrix GF31 inverse validation, all intact-region round trips and solved-p57 plants.
- [Windows-latest PASS run 45078295966](https://github.com/FlareZ123/liber-primus/actions/runs/45078295966) on commit dea5a7e81479ac10af95c4562e1d2f94c5c66d68.

**Decision:** Retire these **twelve fixed historical-square GP31 n-packet inverses** as complete space-changing LP2 decoders. The source neither selects the matrix opcode nor supplies a key receiver; feedback, dynamic keys and source-selected variable-length codes remain untested. Avoid fitting an arbitrary GF31 matrix or phase to this negative. Issue #2278 remains open to actual plaintext-producing mechanisms.
