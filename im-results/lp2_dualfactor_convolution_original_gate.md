# Source-linked factor convolution on original LP2: causal and cyclic registers

**Consolidated through 13 November 2026 (Agents13/10). Status:** The independently source-linked H/G polynomials fail as direct GP29 convolutional decoders in both the ordinary causal construction and the different source-motivated *cyclic* construction. Under visually defined chapter or physical-page ring boundaries, the cyclic model is **algebraically impossible on multiple complete original units, regardless of the secret plaintext**. Its fully invertible continuous-book reading also remains ciphertext-like. No unknown plaintext, original author-selected cipher, key or destination was recovered. The separate [causal SFT](../sims/lp2_dualfactor_convolution_original_sft.cjs) and [cyclic SFT](../sims/lp2_cyclic_source_factor_sft.cjs) define the exact scopes.

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


## Cyclic, circumference-framed interpretation (Agent10, 13 November 2026)

The solved p57 explicitly instructs the reader to *shed circumferences* and the original p39 red triplet defines a quadratic with a seven-cycle root. That motivates a distinct operation from causal zero-initialized deconvolution: close each source-visible chapter, each physical page, or the entire original stream into one ring and interpret the original ciphertext as the coefficients of

\[
C(X)=K(X)\,P(X)\pmod{X^N-1}.
\]

The unchanged GP29 rune at offset \(i\) is the coefficient of \(X^i\); no rune is dropped, rotated, rephased or fitted. The four independently fixed, constant-first filters are the authenticated-2013 \(H=[3,26,24]\), original p39-red \(G=[27,5,15]\), their product \(HG=[23,21,11,17,12]\), and the complete small-degree grid factor \(F_{16}=[13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]\). The first three are also covered by the causal study; \(F_{16}\) tests the separate previously established 16-degree grid-factor connection.

**Key-independent original-input obstruction.** The root \(24\) has exact order **7** modulo29, and \(G(X)=15(X-24)^2\). Consequently, whenever an original ring contains a multiple of seven runes, \(X-24\) divides both the filter and \(X^N-1\). A necessary condition for **any** plaintext \(P\) is \(C(24)=0\). Three entire original visual chapters have such lengths and fail it:

| Physical pages | \(N\) | \(C(24)\bmod29\) | Result under \(G\), \(HG\), \(F_{16}\) |
| --- | ---: | ---: | --- |
| pp8–14 | 1,729 = 7×247 | **18** | No cyclic plaintext exists |
| pp33–39 | 1,680 = 7×240 | **2** | No cyclic plaintext exists |
| pp54–55 | 308 = 7×44 | **3** | No cyclic plaintext exists |

The field element \(u=X\bmod(X^2+18X+11)\) has exact multiplicative order **840** in \(\mathbb F_{29^2}\). The pp33–39 chapter contains exactly **1,680=2×840** runes, so \(H\) divides \(X^{1680}-1\). Its unmodified ciphertext remainder modulo the monic \(H\) is **\([0,20]\)** (constant first), again nonzero. Therefore **no** cyclic \(H\)-filter plaintext exists on this complete source chapter. The order-840/chapter-length link was already explored independently as a possible periodic state clock; the new result is the exact **cyclic-polynomial image obstruction**, not a new discovery of the length.

Among the **55 nonempty physical source pages**, **eleven** have lengths divisible by seven and likewise have nonzero \(C(24)\), so each independently invalidates a page-ring decoder using \(G\), \(HG\) or \(F_{16}\): physical pp**1, 3, 6, 11, 17, 21, 25, 36, 40, 41, 44**. There are no inconsistent or merely multiply-solvable cases hidden in these counts: the exact finite-field linear solver checks ranks of the complete cyclic boundary equations, and source-native GP positive controls pass.

**Fully invertible continuous-register branch.** A separate, whole-book cyclic model makes each of the four filters a full-rank mapping on the **12,956** unknown GP29 symbols. The unique decoded outputs recoverable from the untouched original ciphertext are:

| Cyclic filter | Original whole-book decoded GP29 IoC | Output |
| --- | ---: | --- |
| \(H\) | 0.03448860 | Nonlinguistic |
| \(G\) | 0.03447450 | Nonlinguistic |
| \(HG\) | 0.03448854 | Nonlinguistic |
| \(F_{16}\) | 0.03447702 | Nonlinguistic |

The source ciphertext IoC is **0.03447840** and independently solved p57 clear GP is **0.06270997**. Each continuous result re-encrypts **12,956/12,956** source symbols exactly, an implementation check rather than plaintext authentication. An independent positive plant encrypts the actual **95** solved p57 GP plaintext runes under each full-rank 95-rune cyclic model and then exactly recovers **95/95** in all four variants. Unlike a failed language heuristic, the chapter/page obstructions above show literal impossibility **even if the unknown plaintext were arbitrary symbols**, while continuous results are weaker linguistic negatives.

**Decision.** The circular interpretation would require a different source-selected operation, an explicit extra state/key, or a substantially different ring framing to survive; those are new models rather than repairs to this frozen one. Retire direct \(H,G,HG,F_{16}\) cyclic convolution at original chapter/page/continuous boundaries as a plaintext path. Preserve the source-linked polynomial factors independently of the rejected use as cipher filters. The [standalone CommonJS SFT](../sims/lp2_cyclic_source_factor_sft.cjs) reproduces the finite-field root checks, exact congruences, rank-based inversion, original GP IoCs and native-rune positive controls.
