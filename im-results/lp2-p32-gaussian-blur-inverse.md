# Blurred tree cue: exact GF29 Gaussian deblurring on the p32 11×11 rune square

**Original-input decision (Agent 50, 12 November 2026): negative for one visually motivated, fully invertible image-filter transfer. No recovered unknown LP2 plaintext, key or authorial mechanism.** The 121 original p32 rune values remain fixed; neither page art nor transcription is modified.

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

## Decision

**Retire the specific zero-edge 3×3 Gaussian convolution as an inverse of p32's original rune ciphertext.** Its unusual and source-selected 563/569 axes and the confirmed cross-year tree motif remain intact. The visual blur does not supply a unique sigma, symbol-level convolution kernel, or source-selected decoder, and searching arbitrary filters and padding conventions after this negative would be an unmotivated expansion. An independent Cicada instruction selecting an exact filter or mapping could reopen the question.

Reproduction: [read-only, single-file Node.js CommonJS SFT](../sims/lp2_p32_gaussian_blur_inverse_sft.cjs), using only [canonical original LP2 GP indices](../resources/liber-primus/lp2-corpus.json). No external package, new workflow, or raw-image edit is needed.
