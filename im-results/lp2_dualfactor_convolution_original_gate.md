# Source-linked dual-factor convolution on original LP2

**11 November 2026, Agent13. Status:** A fixed, source-motivated, reversible GF29 decoder **did not recover unknown plaintext or a key**. Implementation: [single-file reproducible test](../sims/lp2_dualfactor_convolution_original_sft.cjs).

## Independent inputs and construction

The verified, signed 26 January 2013 TCP challenge documents BASE29 3301 → 3QO, interpreted as ascending GP-index coefficients **H=[3,26,24]** ([source](../resources/external/2013-tcp-server-signed-source.md)). The original p39 red triad at local rune119 supplies **G=[27,5,15]** ([GP corpus](../resources/liber-primus/lp2-corpus.json)). Multiplying gives **HG=[23,21,11,17,12]**. The original 256 table two-character numerals, interpreted in base60, reduced mod29 and reversed from printed row-major order, yield a degree255 polynomial exactly divisible by HG. Keeping printed token order as ascending polynomial coefficients instead gives remainder **[25,8,18,24]** ([table](../resources/liber-primus/lp2-grid-256.json)).

The table factorization provides a motivated source connection. It does **not** independently prescribe using the factors to encrypt rune text, the reading direction, or cipher reset.

## Exact original-input inverse

Causal zero-IV convolution means C_i = Σ_j k_j P_(i-j) mod29. All three candidate keys H, G, HG have nonzero constant terms, allowing exact sequential inversion. Applied the three keys in forward and reverse orientation to each of: the continuous **12,956** unknown GP indices, the eight canonical sections (lengths **729,1145,1738,1894,1021,1433,1680,3316**), and the 55 rune-bearing pages. These yield 18 frozen candidate outputs, with no phase/key fitted to LP2.

| Key | Whole forward / reverse IoC | Section reset forward / reverse | Page reset forward / reverse |
|---|---|---|---|
| H | .034495032261 / .034467101727 | .034482341980 / .034489848907 | .034496855372 / .034461298753 |
| G | .034465910151 / .034506745450 | .034465362026 / .034488109206 | .034488621584 / .034495914027 |
| HG | .034469675530 / .034467780925 | .034473798382 / .034471498641 | .034517517295 / .034467757093 |

The raw cipher IoC is **.034478397865**, and the authentic solved GP p57 PARABLE reference IoC is **.062709966405**. No original output resembles natural GP text, and every decoded output is essentially uniform. For untruncated polynomial multiplication, full original ciphertext has HG remainders **[8,27,18,23]** forward and **[0,9,14,24]** reverse; zero of the 55 original rune-bearing pages has zero HG remainder in either direction.

**Positive and negative controls:** all three candidate encoders recover all **95/95** authentic solved p57 indices after forward encryption and inverse; a false HG decoder on an H-encrypted solved plant yields **2/95** matching plaintext indices. Every original candidate precisely re-enciphers its own input, as required for any bijective decoder; this does not authenticate its historical key.

**Decision:** retire *direct* table-H/G causal convolution and transparent polynomial-multiplication reading for these original source clocks. The table factorization remains an independently demonstrated artifact relationship. Revisit only if a distinct original instruction fixes an additional layer, register or genuine key/state source. Avoid opportunistic clock/phase/coefficient sweeps.
