# Blurred tree cue: exact GF29 Gaussian deblurring on the p32 11×11 rune square

**Consolidated through 22 November 2026 (Agents50/25): two exact GF29 Gaussian image/text deblurs fail on original LP2, while both recover native-GP positive plants. No recovered unknown plaintext, key or authentic cipher operation.** The 121 original p32 rune values remain fixed; neither page art nor transcription is modified.

## Why this mechanism, and where the human path stops

The original physical **p32 / 49.jpg** depicts a heavily blurred black leafless tree; **p55 / 72.jpg** depicts a pale outline of the same source tree. The independently authenticated 2016 signed Cicada image again features the tree. Prior original-image registration in [tree-outline-blur-crosspage.md](tree-outline-blur-crosspage.md) identifies the silhouette link, and the [exact source-axis report](lp2-tree121-signed2016-source-gate.md) establishes that p32's 121 printed runes form a row-major **11×11** matrix whose *first-row* GP-prime weights total **563** and *first-column* weights total **569**, exactly the 2016 JPEG's pixel dimensions. The original image therefore supplies both a recognizable **blur** motif and a natural 11×11 register orientation.

A standard small Gaussian blur is a 3×3 separable binomial image filter. To ask whether the *runes themselves* underwent an analogous reversible local blur, freeze the kernel

\[
B = \frac{1}{16}
\begin{pmatrix}1&2&1\\2&4&2\\1&2&1\end{pmatrix}
\quad\text{over }\mathbb F_{29}.
\]

**Important unsupported premise:** the original image shows blur, but never says to apply a 3×3 Gaussian filter, a zero-padded boundary or GP29 arithmetic to its rune values. This single inexpensive model is an exploratory cipher guess, not an authenticated algorithm. Its test is distinct from the earlier axis-seeded cumulative-sum/difference inverse, the 2014 magic-square overlay and full 11×11 Hill tests: it uses **a local spatial 3×3 binomial filter with no fitted key**.

## Reversible original-input operation and output

Let \(T\) be the 11×11 tridiagonal matrix with diagonal2 and immediate off-diagonals1. In field GF29, the source-model encryption and its unique inverse are

\[
C=16^{-1}\,TPT^\mathsf{T},\qquad
P=16\,T^{-1}C(T^{-1})^\mathsf{T}\pmod {29}.
\]

Here \(16^{-1}=20\bmod29\), and the original source values outside the 11×11 square are treated as zero. The matrix \(T\) is invertible in F29. The model has **no unspecified phase, key, edge value, fitted offset or alphabet mapping**.

Direct GF29 elimination on the unchanged p32 original matrix gives:

| Measurement | Value |
|---|---:|
| Original p32 GP-rune count | 121 |
| First-row / first-column prime sums | **563 / 569** |
| Raw original IoC | **0.0341597796143** |
| Gaussian-inverse GP29 IoC | **0.0297520661157** |
| Original rune forward re-encryption | **121 / 121** |
| Independent solved-PARABLE English GP plant recovered | **121 / 121** |

The first four decoded 11-cell rows, rendered in native GP transliteration (multi-letter GP names expand the Latin strings), are:

~~~
BSHOEOEILNDGW
IADDOEPYURJMH
CTHUROGIAEAEIG
NFOXWBWTYNGA
~~~

The output does not resemble coherent native-GP text; its IoC becomes **lower than the original's**, whereas genuine solved English material has substantially higher repeated-symbol structure. The invertible cipher re-enciphers all 121 original input runes exactly, as any invertible wrong decoder must. The native positive control instead starts with the actually solved p57 PARABLE wording, normalizes K→C/V→U in standard GP spelling, enciphers it with the exact hypothetical blur and recovers 121/121 symbols. This proves the algebra functions on authentic readable material without implying historical use.

## Distinct one-dimensional manuscript-stream deblurring (Agent25, 22 November; #2163)

The chapter's last original page **p32** contains the blurred tree, while the distant original **p55** renders a sharper version of the same stock tree. A possible literal first-time-player action is to *deblur the text stream*, rather than reshape p32 as an 11×11 pixel array. This is a materially distinct inverse from the preceding 3×3 two-dimensional original test, but **nothing original specifies** a rune-level Gaussian filter, its support, padding or cross-page scope. We tested one smallest normalized one-dimensional choice without tuning parameters: for GP29 original plaintext indices `P[i]`, the hypothetical cipher emits `C[i] = 4^(-1)×(P[i−1]+2P[i]+P[i+1]) mod29`, with `P[−1]=P[n]=0`. A complete visual chapter p27–32 is a natural runic sequence from wing to blurred-tree terminal. All original physical-page wraps and hyphenated words remain in their given positions, but the filter deliberately acts on all positions continuously across page seams.

This exact GF29 convolution has an explicit unique inverse on a length-`n` interval whenever `n+1` is nonzero modulo29: the tridiagonal kernel determinant is `n+1`. No secret key, statistical optimization, plaintext crib or alleged 2016 instructions are inserted. Each inverse below correctly reproduces the entire original cipher after the frozen forward blur; no original deciphered GP-English phrase is observed.

| Original independent interval | Original runes | Original pooled GP29 IoC | Frozen 1D Gaussian-inverse IoC |
| --- | ---: | ---: | ---: |
| **p27–32 wing→blurred-tree visual chapter** | **1,433** | **0.034186202** | **0.034694960** |
| **p32 blurred-tree text alone** | 121 | 0.034159780 | **0.030991736** |
| **p55 sharper-tree page alone** | 76 | 0.037894737 | **0.031228070** |
| p54–55 full terminal chapter | 308 | 0.033821228 | 0.034392318 |
| p40–53 floral independent chapter | 3,008 | 0.034542627 | 0.034486022 |
| p0–2 cross opening independent chapter | 729 | 0.034082516 | 0.034342544 |

The full p27–32 decoded first 45 runes in native GP transliteration are `PNGYTHNGTBBLRDOEIIAEOFIJBWCSEJIUNGAETGTARJXONTHFNGACPLAE`; the apparent multi-letter GP graph names do not change the underlying 45-rune count. All six preselected original readouts are near the random GP29 register (IoC approximately 1/29), in sharp contrast to independently clear p57 GP29 (**0.062709966**). A synthetic test using the actual solved p57 text repeated to 1,433 GP runes was independently encrypted with the same binomial kernel and exactly recovered **1,433/1,433**. That verifies the algebra and whole-chapter endpoint treatment; repetition makes the plant an inverse test, not a comparable natural-language source sample.

**Decision:** Retire precisely the fixed **one-dimensional [1,2,1]/4 zero-boundary Gaussian smoothing hypothesis** for native GP29 prose on p27–32 and its natural tree/other-page controls. The original image does not identify this rune-level operator and its full original output is not native prose. Arbitrarily increasing the filter width, trying different boundary conditions, editing copied imagery or searching fitted polynomial coefficients cannot be justified by this source. [Complete exact-original CJS SFT](../sims/lp2_p27_32_pascal_gaussian_chapter_inverse_sft.cjs) freezes kernel, all intact source page segments, forward replay, GF29 invertibility and the independently planted native GP positive.

## Decision

**Retire the specific zero-edge 3×3 Gaussian convolution as an inverse of p32's original rune ciphertext.** Its unusual and source-selected 563/569 axes and the confirmed cross-year tree motif remain intact. The visual blur does not supply a unique sigma, symbol-level convolution kernel, or source-selected decoder, and searching arbitrary filters and padding conventions after this negative would be an unmotivated expansion. An independent Cicada instruction selecting an exact filter or mapping could reopen the question.

Reproduction: [read-only, single-file Node.js CommonJS SFT](../sims/lp2_p32_gaussian_blur_inverse_sft.cjs), using only [canonical original LP2 GP indices](../resources/liber-primus/lp2-corpus.json). No external package, new workflow, or raw-image edit is needed.
