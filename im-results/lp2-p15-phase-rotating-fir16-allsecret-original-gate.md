# Full-secret original-cipher inverse of the p15 spiral-rotating sixteen-tap filter

**Agent31, 22 November 2026. Original-cipher, exhaustive negative.** A source-shaped, mathematically reversible **phase-rotating sixteen-tap GF(29) filter** was tested against all original LP2 p16–22 ciphertext under **every secret kernel compatible with the first sixteen native-English one-rune words**. Exactly **43,046,721** kernels were searched. No kernel survives all seventeen one-rune and the first eleven original two-rune word constraints. This is a model-specific original-input exclusion, with **no unknown plaintext or author-selected cipher recovered**.

## Original source selector and competing operation

Physical LP2 p15 (original scan `resources/liber-primus/32.jpg`) contains an authored 4×4 numeral square whose sixteen entries follow the established Fibonacci-prime spiral. The **red 3299 center and outward order** select the sixteen literal values

```
3299 3298 3296 3294 3288 3278 3258 3222
3152 3038 2838 2472 1820  708 1206 4516
```

Those residues in GP29 are `[22,21,19,17,11,1,10,3,20,22,25,7,22,12,17,21]`; all are nonzero, a useful property if different phases require a invertible current-symbol coefficient. Unlike an ordinary stationary FIR filter, this version interprets the **spiral as a rotating tap schedule**. The source visibly chooses the numeral order, but does **not** instruct a solver to use a phase-rotating GF29 cipher. This exploratory operation was frozen before scoring any original plaintext.

For original contiguous p16–22 rune tape `C`, define, with zero-based rune offset `t>=15` and `h` a completely secret 16-element field vector,

\\[
P_t = \\sum_{j=0}^{15}h_{(t+j)\\bmod16}C_{t-j}\\pmod{29}.
\\]

For all nonzero kernel entries, every source rune is recoverable from earlier ciphertext and plaintext via

\\[
C_t=h_{t\\bmod16}^{-1}\\left(P_t-\\sum_{j=1}^{15}h_{(t+j)\\bmod16}C_{t-j}\\right)\\pmod{29}.
\\]

The original 1,744 runes on the next seven physical pages are kept byte-for-byte in canonical order, including all original word boundaries. The sixteen source-native complete one-rune words used as anchors are A/I/O, GP29 values `[24,10,3]`. Their sixteen rows `C[t-j]` in spiral-aligned phase order have **rank16** over GF29. Thus every one of `3^16=43,046,721` possible assignments to these anchors corresponds to one and only one hidden 16-tap kernel. The search even grants zero-valued hidden coefficients, so its zero-survivor conclusion includes the legally invertible subclass. The seventeenth original singleton, and original **69 two-rune words** against the **189 distinct** source-native two-rune encodings of the full pinned English frequency lexicon, are untouched tests.

## All-secret original results

| Source-native original constraints | Surviving completely secret kernels |
| --- | ---: |
| Sixteen original one-rune-word assignments | **43,046,721** |
| Plus the seventeenth one-rune word | **4,456,208** |
| Plus first 2 original two-rune words | **225,148** |
| Plus first 6 | **557** |
| Plus first 7 | **140** |
| Plus first 8 | **35** |
| Plus first 9 | **11** |
| Plus first 10 | **1** |
| Plus first 11 | **0** |
| All 69 original two-rune words | **0** |

An intentionally constructed original-layout GP-English word plant uses the source's **exact sixteen p15 spiral residues as the hidden rotating coefficients**. Its first coefficient at every phase is invertible. The positive encrypts a 1,744-rune source-shaped plain text, independently recovers the **exact sixteen secret coefficients** from the first sixteen singleton positions, and decrypts **1,729/1,729** post-initialization plaintext runes, with all additional singleton and 69 double-rune words legal. Thus the same receiver that correctly recovers a complete hidden key and synthetic planted plaintext rejects every key on the untouched original source. The source contains **no eligible real plaintext** within this fixed GP29-native full-secret architecture.

This is distinct from the independently completed **stationary past-tap** original source gate ([earlier causal FIR16](lp2-p15-causal-fir16-allsecret-word-inversion.md)) and the newly completed **stationary future-tap** exhaustive gate ([backward FIR16](lp2-p15-anticausal-fir16-allsecret-original-gate.md)). No direction/phase fits plaintext. None of these outcomes excludes a changing 16-tap kernel, a separately sourced key or stream clock, transparent F behavior, word-resegmentation, or another intermediate alphabet. The original square still has no authenticated rune-decipherment operator, and its sixteen mathematical values remain genuine page evidence.

**Reproduce:** [read-only CommonJS single-file test](../sims/lp2_p15_rotating_fir16_allsecret_original_sft.cjs), [manual Windows22 workflow](../.github/workflows/agent31-p15-rotating-fir16-original-manual.yml), [successful full original run 45061787875](https://github.com/FlareZ123/liber-primus/actions/runs/45061787875). The program asserts source positions, exact original chapter lengths, full linear rank, exhaustive key count, all surviving-filter counts and recovered planted coefficients.
