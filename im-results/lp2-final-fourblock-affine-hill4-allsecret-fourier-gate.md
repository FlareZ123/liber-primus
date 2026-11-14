# Original LP2 p33–55 four-rune Hill4: all-secret Fourier obstruction

**Agent17, 14 November 2026. Classification:** source-exact bounded negative for stationary GF(29) affine Hill4 on native-GP English. This report **recovers no unknown LP2 plaintext, source-authenticated key or final destination**.

## Source-visible four-rune register

The nine original visually delimited LP2 chapters are fixed by red headings and punctuation; their rune lengths are:

| Physical pages | Original runes | Modulo 4 |
|---|---:|---:|
| p0–2 | 729 | 1 |
| p3–7 | 1145 | 1 |
| p8–14 | 1729 | 1 |
| p15–22 | 1903 | 3 |
| p23–26 | 1021 | 1 |
| p27–32 | 1433 | 1 |
| p33–39 | **1680** | **0** |
| p40–53 | **3008** | **0** |
| p54–55 | **308** | **0** |

The first six lengths are odd; the final three each comprise a complete number of **four-rune** blocks (420, 752 and 77). This original-source partition was already recorded in the [visual segmentation source](../results/README.md). The **mod-four regime** is a newly noted descriptive property, not an authenticated creator instruction, and postselected arithmetic significance should not be attached to it. The p54 red heading is nine runes, so the final chapter's complete four-block alignment does not itself place the black body on a four-block boundary.

The manuscript's p15 source-verified **4×4 Fibonacci-prime square**, and its separately observed mathematical connection to p39's red double-root polynomial, make four-rune algebra worth ruling out. Several *individual* p15/p39-derived four-rune Hill transforms have already failed ([prior original-cipher study](lp2-p15-p39-signed-matrix-eigen-crosslink.md)). The present gate covers **all secret stationary invertible 4×4 matrices**, plus an arbitrary constant four-component bias, without guessing a key.

The weakest premise is architecture: no first-party clue says to apply Hill4 to p33–55. That makes this a bounded cipher-family decision rather than decipherment.

## Exact all-secret key invariant

For each chapter-local group of four ciphertext runes, take a vector C_b over GF(29). Hypothesize a decoded vector P_b = M C_b + t, with any unknown invertible 4×4 matrix M and any constant four-vector t. For a nonzero vector w define

\[
A_C(w)=\left|\frac1n\sum_{b=1}^n\exp(2\pi i(w\cdot C_b)/29)\right|.
\]

Adding t changes only the complex phase, while multiplying by M permutes the **707,280 nonzero frequencies** w. The maximum A_C(w) across the entire four-dimensional Fourier spectrum is therefore invariant under **every secret invertible affine Hill4 key**. In particular, any actual native-GP English output has four coordinate rune streams, each with a one-dimensional Fourier peak; each such peak must appear among the original ciphertext's frequencies.

The reproducer computes all 29^4 bins and applies four length-29 transforms per dimension. It tests the **entire all-secret Fourier spectrum** at each of four frozen chapter-local block starting phases 0,1,2,3. It does not infer a secret alphabet or fit a plaintext string.

## Original ciphertext measurements

| Original chapter | Blocks at phase0 | Max Fourier amplitude across all 29^4−1 nonzero frequencies and **all four phases** |
|---|---:|---:|
| p33–39 | 420 | **0.184106710139** |
| p40–53 | 752 | **0.130238563990** |
| p54–55 | 77 | **0.399205083865** |

Four phase-by-phase source measurements, in phase order:

- p33–39: 0.176755095990, 0.178794874063, 0.184106710139, 0.170758887412.
- p40–53: 0.126033120269, 0.123185588454, 0.129792248770, 0.130238563990.
- p54–55: 0.399205083865, 0.393141098789, 0.382186248796, 0.396347693602.

Because the p54–55 chapter yields only 76–77 vectors, the search across over 700,000 frequencies naturally produces large extremes. That short chapter cannot be excluded by this register alone.

## Independent ordinary-English controls

The reference is original public-domain Shakespeare in the pinned historical code-control corpus of karpathy/char-rnn, **tinyshakespeare/input.txt**, exact Git blob SHA-1 **7dcb3a2d4cc3b48b6283dd46870bfeb78f88aac9**. The SFT validates this source blob and transliterates it to **810,930 GP29 rune indices** using a fixed orthography: uppercase alphabetic words, QU→CW, V→U, K→C, Z→S and longest canonical GP token (including TH, EO, NG, OE, AE, IA, EA). This is a declared plausible English register, not a claim that every possible LP2 output uses it.

Five independent contiguous control windows start at native-GP offsets **0, 5000, 20000, 60000, 100000**. Each gives 420 or 752 complete four-rune blocks. In each control, compute the maximum one-dimensional Fourier amplitude for *each* of the four original plaintext-coordinate sequences, then take the least of those four peaks. That least native-coordinate value is a **necessary lower bound** on the ciphertext's unrestricted-secret maximum.

| Source-sized control | Smallest required peak among all 5 English controls | Largest available original peak over every secret key and phase |
|---|---:|---:|
| 420 blocks (p33–39) | **0.279409343584** | **0.184106710139** |
| 752 blocks (p40–53) | **0.302095982141** | **0.130238563990** |

**Every one of the ten independently fixed Shakespeare windows fails the necessary condition** for every possible stationary affine Hill4 key and every one of the four block phases. This is a full-key algebraic contradiction for the ten actual source text windows, and strong conditional evidence against directly recovering native-English GP plaintext from the two longer chapters.

The positive control uses the first actual **752-block** GP-native Shakespeare sample and the invertible, source-unrelated matrix

\[
E=\begin{bmatrix}1&2&3&4\\0&1&5&6\\0&0&1&7\\0&0&0&1\end{bmatrix}\pmod{29}.
\]

Encryption and the independent triangular inverse recover **3008/3008** source runes. Its complete Fourier maximum is approximately **0.340108536678**, unchanged by the hidden affine block mixing and markedly higher than the LP2 p40–53 maximum. The test therefore detects native-GP source concentration even when individual cipher rune marginals are mixed by a full-rank Hill4 transform.

## Interpretation and next research decision

**Retire stationary four-rune affine Hill coding into ordinary GP-native English for pp33–39 and pp40–53, including any unknown full-rank secret matrix and any frozen local block phase.** This closes a much broader family than trying individual keys derived from the p15 4×4 square. The tested controls are five Shakespeare windows, so the result is **not** an impossibility proof for every imaginable natural-language register.

The following remain genuinely open: the short p54–55 chapter; a separate matrix for every page or word; nonstationary key schedules and per-block masks; nonlinear block functions; feedback or interleaving between blocks; unseen earlier transformations producing a flat intermediate register; and other languages or encodings. The original p33–55 divisibility pattern itself is an observation with no demonstrated selector.

A future four-rune attack needs a *first-party instruction for changing state or extracting key material*, or an independently source-selected original plaintext crib. No further search over constant Hill4 matrices is warranted for the two longer final chapters.

**Reproduction:** [Node.js 22/CommonJS, original-source and pinned-native-English SFT](../sims/lp2_final_fourblock_fourier_allsecret_sft.cjs). It reads canonical LP2 corpus, measures every secret Fourier direction in each original chapter/phase, validates original English control source bytes, and exactly reverses an independent source-native planted Hill4 cipher. The script does not write or modify manuscript data.
