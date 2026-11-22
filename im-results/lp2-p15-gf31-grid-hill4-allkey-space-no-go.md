# LP2 source p15 numerical grid: reversible GP31 Hill4 space cipher, then all-secret affine bound

**Agent 6, 22 November 2026 | Exact original-cipher inverse and independently held-out all-key negative; no unknown plaintext recovered.** This investigates a genuinely **rune-value-changing, printed-space-changing** mechanism that escapes prior pure transposition and intact-word assumptions: a four-token Hill cipher over the 31-symbol field formed by the 29 original Gematria Primus rune identities, the literal printed word separator \`-\`, and the original four-dot stop \`.\`. The key may be the actual p15 Fibonacci-prime square or any completely unknown invertible 4×4 matrix. The author has **not** supplied instructions selecting this operation, modulus, block orientation, phase or treatment of punctuation.

## Primary source and exact reversible operation

Original LP2 p15 is the original **32.jpg** and prints the numerical 4×4 grid:

\`\`\`text
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206  708 1820
\`\`\`

Its construction as center-out Fibonacci-indexed prime distances is independently verified in [the existing historical numeric-grid SFT](../sims/fibonacci_prime_spiral.cjs). The values reduced mod **31** form

\[
M=\begin{pmatrix}
3&29&21&0\\
23&13&12&17\\
2&8&10&23\\
21&28&26&22
\end{pmatrix}\pmod{31}.
\]

Its determinant is **20 mod31**, invertible, and its exact inverse is

\[
M^{-1}=\begin{pmatrix}
8&4&22&19\\
8&9&8&3\\
10&18&5&2\\
7&17&8&18
\end{pmatrix}\pmod{31}.
\]

This is mathematically a fully specified reversible cipher: collect printed source GP runes as 0–28, literal hyphens as29, and stops as30. Ignore physical line/page wrapping when collecting source tokens, so every carried word survives; keep red section ornaments in the source-layout sidecar. Apply either \`M\` or \`M^-1\`, in column or row-vector convention, to each consecutive block of four original symbols; return the last partial block unchanged. For either polarity, the other matrix reencrypts *every original source symbol and source punctuation mark* exactly, including all source ornaments when the tape is serialized back.

The source-selected first receiver is the complete original p16–22 visual chapter immediately after the printed p15 square: **1,744 runes, 381 hyphens and 19 stops, 400 printed words, 2,144 total movable symbols**. The independent holdout is original p40–53: **3,008 runes, 626 hyphens and 43 stops, 669 words, 3,677 symbols**. Physical p50 is a numeric page and contributes no rune prose.

## Four fixed source-grid inverses on two original regions

| Source operation on four-token blocks | p16–22 decoded word count | p16–22 longest word | p40–53 decoded word count | p40–53 longest word |
| --- | ---: | ---: | ---: | ---: |
| Source M, column vector | **133** | **81** | **239** | **99** |
| Source M, row vector | **125** | **90** | **208** | **78** |
| Inverse M, column vector | **143** | **80** | **222** | **110** |
| Inverse M, row vector | **140** | **95** | **231** | **118** |
| **Actual printed source** | **400** | **13** | **669** | **14** |

All four exact inverses make many output markers disappear into the 29 rune classes, yielding **only 125–143 nonempty words** across the 1,744-rune first chapter instead of400, and **208–239** in the 3,008-rune independent holdout instead of669. Their longest output “words” reach 78–118 GP runes and their rune IoCs remain around **0.0345**, with GP-rune top-five frequencies around **19–21%**. No direct inverse gives native-English GP29 syntax or a coherent contiguous passage. The author's numeric grid cannot serve as this particular standalone whole-chapter/holdout GP31 Hill inverse.

The source-native positive encrypts the actual complete solved p57 95-rune *PARABLE* with its **16 original hyphens and four original stops**, using each of the four candidate orientation matrices; the matching inverse restores every rune, every printed word/stop, and the full serialized source exactly. The deliberately wrong identity key does not recover the solved tape. Every source region also reencodes to its exact original symbol/ornament tape. Reproduce: [source p15 GF31 Hill4 inverse SFT](../sims/lp2_p15_grid_hill4_gp31_space_original_sft.cjs), **Windows Node22 PASS [45069629499](https://github.com/FlareZ123/liber-primus/actions/runs/45069629499)**.

## All-secret Hill4 exclusion: 30,784 possible coefficient rows, four clocks

To avoid rejecting only one visibly suggested numeric key, allow **every nonsingular hidden 4×4 matrix** over GF31, with arbitrary affine output offsets and no constraint on its coefficients. Any one output coordinate has form

\[
P_i=a_0C_0+a_1C_1+a_2C_2+a_3C_3+b\pmod{31}.
\]

A nonzero coefficient row \((a_0,\ldots,a_3)\) is defined only up to multiplication by a nonzero field scalar for the purpose of comparing *rank-sorted output symbol frequencies*. Both arbitrary nonzero row scaling and any affine intercept merely permute the 31 labels. Thus the **sum of the two largest 31-symbol output histogram bins** is a key-independent invariant of each projective coefficient row. There are exactly

\[
(31^4-1)/(31-1)=\mathbf{30,784}
\]

distinct projective rows. Enumerate *all* of them and **all four global four-token phase offsets** on both original regions, each time computing the two-bin maximum for the complete source chapter, with no English-fitted key or word resegmentation.

| Original source | Every projective row and all four possible block phases | Maximum fraction in the two most common 31-symbol bins | Highest **mixed** (2+-tap) row |
| --- | ---: | ---: | ---: |
| p16–22 | 30,784 × 4 | **0.246729** | **0.128731** |
| **p40–53 holdout** | 30,784 × 4 | **0.217865** | **0.115468** |

The global best projective rows always select a **single existing ciphertext tape coordinate**. Every genuinely mixed two-or-more-tap linear form is close to uniform: even its two most common output symbols total **at most 12.87%** in the opening region and **11.55%** in the holdout. The full original held-out chapter has **zero** candidate rows, including the trivial coordinate selectors, with top-two share at least22% in *any* of four block phases. Since any genuine inverse matrix needs four nonzero rows, the **single-row** maximum is already a complete upper bound on every secret 4×4 linear/affine decryptor, irrespective of invertibility or number of matrices tried.

## Independently sampled source-native reference controls and positive plant

Native GP29 English plaintext has highly nonuniform rune frequencies, including common E and printed spaces. Avoid assuming a theoretical English model by using pinned 2014-human-readable English donors in the repository: Gibran's *The Prophet* and Shakespeare, normalized with independently solved Gematria Primus spelling rules, including single-rune ING/IO and equivalent K/Q/V/Z changes.

Construct **128** deterministic source-native reference tapes per region. Each reference uses the *exact original printed word lengths, source hyphen/stop positions and physical carried-word structure*, but draws complete native GP29 English words with matching rune lengths from the two pinned donors. Neither the original ciphertext nor an English score selects the donor words. Repeat each control's top-two measurement at all four possible GP31 Hill block clocks. In addition, **encrypt** one full-length reference with the *actual nonsingular source M* and recover every token with its exact inverse, verifying that the true hidden inverse rows exhibit the predicted top-two concentration.

| Length/geometry-matched native-GP control | Original best across all secret Hill rows | Reference plants surpassing the original bound at **every** block phase and output coordinate | Lowest reference value in 128 |
| --- | ---: | ---: | ---: |
| p16–22, 1,744 runes | 0.246729 | **110/128** | 0.233209 |
| **p40–53, 3,008 runes** | **0.217865** | **128/128** | **0.229597** |

Thus the original held-out region lies **below even the weakest of all 128 sampled native-English controls**, in every independently considered phase. This is a control-calibrated statistical/structural exclusion of this exact GP31 affine Hill4 family as a decoder of source-native GP English with normal printed spacing; it is **not** a proof that no deliberately unusual, highly flat text could pass. The source controls are synthetic word-length-matched tapes, not the authors' lost plaintext. The opening chapter's 18/128 controls below its own upper bound prevent an overclaimed universal exclusion there, but the independently fixed floral holdout supplies a strong negative for the general four-letter model.

The [all-key original-input census and native-plant SFT](../sims/lp2_gp31_allkey_hill4_space_capacity_sft.cjs) reproduces every one of the **246,272 finite secret row+phase cases**, all 256 word-length-matched English plants, positive source-M encipher/decipher checks, and the reported control comparisons. **Windows Node22 PASS [45070104541](https://github.com/FlareZ123/liber-primus/actions/runs/45070104541)**.

## Decision and surviving causal route

The p15 numeric 4×4 grid is an authentic source-defined object and *is* invertible mod31, but neither its four direct GP31 rune/punctuation Hill4 orientations nor **any other hidden stationary GF31 4×4 affine key** produces the native-GP punctuation and character-concentration signature in the long independent held-out material under the stated whole-tape clock and source-language control. Searching numeric keys or changing the four-block phase cannot resolve this class.

**Still open:** a source-authored operation may be nonlinear, length-changing, use higher-state feedback, apply different keys inside each block, reserve separators outside its alphabet, decode to a non-GP intermediate register, or require a now-missing external key. The original p15 page does not command GF31 Hill encryption of the rune-plus-punctuation tape. The first-party clue that would justify those extra mechanisms or specify the plaintext receiver remains missing. **No unknown LP2 plaintext, genuine cipher key, or final puzzle destination recovered.**
