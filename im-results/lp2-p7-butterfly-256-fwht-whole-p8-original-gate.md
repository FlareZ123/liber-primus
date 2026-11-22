# Original p7 butterfly extended to an eight-stage 256-state transform over p8

**Agent17, 22 November 2026. Classification: original-input complete reversible transform and original 255-word source-to-source negative.** No LP2 unknown-page plaintext, historical cipher operation, private key or destination recovered.

## Causal source hypothesis

A human looking at the original p7 ending sees exactly five whole-red-word GP29 index products `[11,26,8,15,2]`. The independently established exact relation

`(u,v)=(a+b,b−a)=(8,15) mod29` for `(a,b)=(11,26)`

has determinant2, supplied by the fifth original word. It is the elementary reversible 2×2 butterfly `B=[[1,1],[-1,1]]` over GF29. A natural *distinct* use of the printed operation is to **recursively apply eight butterfly stages**, giving a 256-point transform (2^8). This is materially different from the previously tested independent 2-rune butterflies and seven-phase rotations.

Immediately adjacent p8 has **255 original runes** (12 red and 243 black). The preceding p3–p7 scroll has **255 genuine complete printed words**, another possible same-sized input register. The later p49–p51 numeric table contains **256 original cells**. These are source shapes, not instructions to add a dummy 256th symbol, choose a sender, or apply an FFT. Two minimal 256-state completions can nevertheless be tested without introducing secret keys.

## Full-source experiment 1: original p8 plus the first original p9 rune

Take the exact **255** physical p8 GP29 indices and immediately adjacent **first** p9 rune, giving a contiguous **256-rune original ciphertext tape**. Apply all eight consecutive butterfly levels of lengths 1,2,4,8,16,32,64,128 to all256 indices, and separately the reverse-order full inverse using `B^-1=15[[1,-1],[1,1]] mod29`. No fitted phase, key, alphabet, variable padding or scoring loop.

| Complete original 256-rune transform | Native GP29 IoC | Full exact forward replay? | First output symbols |
| --- | ---: | --- | --- |
| Eight forward `B` stages | **0.0332414216** | Yes | `H N X O Y N J OE A E AE F T N E TH …` |
| Eight inverse `B^-1` stages | **0.0346507353** | Yes | `J S C EO X IA EA O I N O Y I I E P …` |

Both outputs remain near-uniform nonprose. The p8→p9 actual complete word continues **five p9 runes after its final p8 rune**: using only the first p9 rune achieves a length256 window but **does not respect the entire crossing word**. This is a significant source-hypothesis weakness, disclosed rather than hidden.

## Full-source experiment 2: exact invertible 255-coordinate projection, without inserting a guessed cipher rune

A separate *exact 255-to-255 reversible original-cipher* variant eliminates the arbitrary borrowed first p9 rune. Take the original p8 ciphertext as 255 known coordinates of the 256-state butterfly output and constrain the missing **plaintext** coordinate to GP0. Because the diagonal inverse coefficient is a unit of GF29, solve the missing ciphertext coordinate **algebraically** from that condition. The decoder thereby remains lossless and length-preserving, with no post-hoc filled secret or English-selected extra glyph. Two physical placement hypotheses (leftmost or trailing missing zero) and two source matrix directions are fully enumerated.

| Missing GP0 input/output coordinate | Mode | Algebraically recovered missing ciphertext index | Decoded 255-symbol IoC |
| --- | --- | ---: | ---: |
| trailing 255 | `B^-1` | **18** | **0.0337810715** |
| trailing 255 | `B` | **23** | **0.0332561371** |
| leading 0 | `B^-1` | **12** | **0.0359734445** |
| leading 0 | `B` | **18** | **0.0343677629** |

All four reconstruct *every* original GP rune exactly, as a necessary bijection check. All four decoded outputs are nonprose. The highest IoC **0.03597** is substantially below solved native p57 GP text IoC **0.06271**. The missing symbol is a mathematical consequence of the chosen transform and zero condition, not a newly recovered author key.

## Full-source experiment 3: preceding scroll 255 complete-word products as sender

The source actually contains 255 complete p3–p7 words. Their GP29 zero-based rune-index **products** are motivated by the p7 marked operands themselves. Take their literal source word order and add one GP0 at the leading or trailing slot to obtain a 256-entry word product tape. Transform through the same eight-stage source matrix, remove the corresponding artificial output slot, and compare all **255 predicted p8 ciphertext runes**, without scoring language.

- Trailing zero, forward **9/255** equal original rune positions; inverse **12/255**.
- Leading zero, forward **7/255**; inverse **7/255**.

No version produces the original p8 stream. The comparison is an exact source-to-source prediction, more decisive for this proposed scroll→p8 transmission than a short postselected English word. It does not exclude an independently keyed nonlinear scroll hash or a source-chosen different 255-state transition.

## Decision

The original five p7 red words furnish a real reversible pair operation. **The natural direct eight-layer extension fails on the entire authentic p8 source**, even when preserving a mathematically lossless 255-coordinate decoder. The visually adjacent 255/256 registers do not by themselves select this operation, its zero placement or its intended recipient. This specific full-butterfly architecture is retired; do not add reorderings, fitted phases, secret channel signs or an arbitrary extra key to rescue the observed gibberish. A genuinely first-party traversal/receiver opcode would be new evidence and should be tested against an untouched substantial original section.

## Reproduction

[Single read-only Windows11/Node22/CommonJS SFT](../sims/lp2_p7_p8_255_to_256_fwht_full_original_sft.cjs) reads the exact original [GP29 corpus](../resources/liber-primus/lp2-corpus.json) and [page-word punctuation transcription](../resources/liber-primus/lp2-transcription.txt), checks all 255 original source words, p7 exact red operands, original p8 and first p9 rune, direct and constrained inverse replays, four 255-register source predictions, exact IoCs and output excerpts. [Pre-existing source p7 butterfly reconstruction and independent earlier two-rune tests](lp2-p7-red-polynomial-seven-cycle-original-gate.md).
