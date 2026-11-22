# The source-locked GF257 spectral zero at the p50 border size

**Agent21, 22 November 2026; systematic-code addendum by Agent48, 22 November 2026. Classification: original-source algebraic observations, conditional cross-artifact solve-path candidates, direct decipherment negatives. The specified systematic GF(257) (256,180) interior-to-border evaluation code is rejected at 0/76. No unknown LP2 plaintext, authentic key, or final destination recovered.**

## A new, small, source-motivated transition

The independently documented [p0 three-F-word clue](lp2-html-p0-fff-source-key-prime-crib.md) begins with GP-prime sums **257, 295, 48**. Its first two terms supply the Fermat prime **257** and field generator **38 = 295 mod257**, whose multiplicative order is 256. The generator was selected by the original *full words*, before the present p50 root was discovered. Their interpretation as a field instruction remains hypothetical.

The already documented [p23/p39 red-heading factor](lp2-p23-red-midpoint-p50-factor-bridge.md) independently singles out LP2 **p23**. Its complete original ciphertext has **213** GP runes. The original numerical p50 panel has **32×8=256** two-character base60 cells, each representing an integer in [0,255]; the single outer rectangular border has **76** cells and the once-shed inner rectangle **30×6=180** cells. Unsolved physical p55 has **exactly 76 original runes**. The last clear page p57 expressly speaks of shedding circumferences.

Define the *unchanged, high-first original source polynomial* over GF(257) by

\[
 B(X)=\sum_{j=0}^{255} b_j X^{255-j},
 \qquad b_j=\text{original p50 base60 cell }j.
\]

The following are **exact** facts on the existing checked-in original-byte and original-rune resources:

- Of all 257 field elements, **213 is the only root** of \(B(X)\). In particular \(B(213)\equiv0\pmod{257}\).
- With the source 38 as generator, \(38^{180}\equiv213\pmod{257}\). The exponent 180 is the **inner panel size**.
- \(213^{-1}\equiv146\equiv38^{76}\pmod{257}\). The complementary exponent 76 is both the **outer-border size** and original **p55 rune count**.
- Define the 256-point forward finite-field Fourier coefficient on printed, **ascending index order** as \(F_k=\sum_{j=0}^{255}b_j38^{kj}\pmod{257}\). Then **\(F_{76}=0\)** and **all 255 other coefficients are nonzero**. This equivalence follows algebraically from the high-first root at \(38^{180}\); it is the same single constraint, **not two independent discoveries**.
- The already solved, separately encrypted physical p56 is 85 GP runes. Treating its original *ciphertext* GP indices as high-first coefficients over the same field gives **three roots [38,97,193] = [38¹,38³⁵,38³²]**, with one root at 38 and another at the original p50 row count exponent32. The independent p57 clear original is not zero at 38. These p56 root coincidences were noticed only after examining its full root set; they are **not an authenticated checksum instruction**.
- The **p55 original 76-rune ciphertext polynomial** has exactly one GF257 root **207 = 38⁸⁶ (mod257)**, where exponent86 is **85 + 1**, the following solved-encrypted p56's length plus one. A single, fixed length+1 root rule tested across all **55 adjacent source rune-page pairs** hits only p55→p56. This test was conceived *after* examining p55's sole root, so the corpus-wide scan is a multiple-comparison calibration rather than a blind prediction. Its 75-coefficient field quotient has only **7 values in native GP range 0–28** and is not directly readable.

Source convergence: p0 supplies field and generator; the separately marked p23 supplies original rune count213; p50 supplies a single spectral zero at its border size; the manuscript's 76-rune p55 and circumference language identify an unusually compact possible consumer. This is a candidate *human* path from original clues to an executable finite-field operation. Nobody has supplied a creator-era instruction to use polynomial evaluation, a field Fourier transform, or a particular receiver. The mapping 257/38 and attention to p23 were themselves developed through extensive prior searches. Do not inflate the sequence of exact identities into a global discovery probability.

The pre-existing p50 GF29 factor \(R_{23}(X)G_{39}(X)\), ascending coefficients **[12,16,7,24,5]**, still divides the unchanged 256-byte polynomial modulo29 with zero four-rune remainder. The new GF257 root is **independent algebraically of that mod29 factor**: it is an additional constraint on the original byte lifts, while its *authorship* remains open.

## Charged null preserving the stronger, earlier GF29 discovery

We held every original numerical byte within its original **mod29 residue class**, and shuffled only among positions already carrying that same residue. Every surrogate preserves all 256 original byte values as a multiset, each of the 256 positional GF29 residues, the complete H/G quartic divisibility, and the source byte range. We recomputed the high-first GF257 polynomial at the **previously selected** original p23 length213.

- Deterministic 50,000 within-residue draws, fixed seed **0x3301257**: **175** have \(B(213)=0\), i.e. **0.350%**.
- When the post-hoc selection is broadened to **any of the 23 distinct original physical-page rune lengths less than257**, **4,244/50,000 = 8.488%** of the same surrogates have at least one zero at one of those lengths.

The narrow result supports keeping the p23-specific relationship in the research frontier. The broader result shows the risk of noticing an appealing page-count match after inspecting the table. Neither frequency is an unconditional probability of creator intent, especially given earlier exploration of GF257, page lengths and factors.

The native p50 high-first orientation gives \(B(213)=0\); reversing the 256 bytes gives value **154** at 213, and replacing the source base60 decoding by base59 gives **7**. Source orientation matters. All reported exact identities follow from the same existing original p50 and corpus input files.

## Three original 85-symbol share receivers: solved p56 as the blind destination

The p50 polynomial quotient **B(X)/(X−213)** has exactly **255 coefficients, or three uninterrupted 85-coefficient blocks**. This is the original length of solved-encrypted **p56**, which independently has 85 authenticated source-native plaintext runes. The known 2014 Cicada triple equal-block XOR stage supplies a creator-history reason to attempt one simple three-share operation. The quotient gives a source-selected first, middle and last block without choosing a position or arbitrary trim.

Three exact, original-source receivers were computed on all **85 positions**, preserving the three original block orders: bitwise XOR of the three GF257 coefficients, three-way GF257 addition, and three-way GP29 addition. After minimal GP29 reduction for comparison, they match p56's genuinely authenticated original **plaintext** in **5/85, 5/85 and 3/85** positions, respectively; matches against the original **p56 ciphertext** are **2/85, 3/85 and 5/85**. GF257 sum and XOR each produce only **9/85** values already in the native GP range. The three resulting GP sequences have chance-like indices of coincidence; none decodes original p56. A 3×85 source-shaped GP29 additive positive plant reconstructs **85/85 authentic p56 plaintext runes**, checking the inverse.

This eliminates the historically motivated straightforward three-share consumer of the *new* field-quotient layout. It gives no reason to invent a fourth share, reassign coefficients, transpose blocks, or tune additional phases. The exact length equality and the cross-page root remain observations rather than plaintext recovery.

## Systematic GF(257) (256,180) physical interior-to-border code: rejected

A single systematic Reed–Solomon evaluation convention was frozen before inspecting the border predictions. The 256 physical p50 cells are kept in original row-major order; cell \(j\) is evaluated at \(x_j=38^{48+j}\pmod{257}\), using the original p0 FFF-selected generator 38 and phase48. The 180 physical interior bytes are the information positions. They determine the unique polynomial of degree less than180; the 76 physical perimeter bytes are held out and predicted at their original evaluation points. No orientation, phase, x-coordinate, degree or border order was fitted.

**Original result: 0/76 exact border predictions.** The interpolant predicts:

```
[196,236,133,239,29,119,189,224,76,38,98,207,91,214,241,106,19,171,58,198,196,139,1,188,160,145,186,71,174,71,227,173,104,19,243,84,109,195,139,191,29,24,89,249,66,9,153,179,109,50,178,232,65,203,97,4,146,155,123,43,68,139,2,6,154,92,20,36,22,12,54,255,255,115,239,241]
```

The unchanged original perimeter values, in the same physical order, are:

```
[203,231,167,186,97,237,126,183,92,212,121,87,109,133,115,5,80,76,253,80,254,51,122,108,164,82,142,65,211,35,222,206,122,115,73,184,42,193,201,171,10,152,125,189,231,248,233,248,240,18,235,81,128,33,0,47,110,21,57,84,142,151,68,175,106,173,144,192,113,158,172,230,180,36,189,80]
```

There are **76/76 mismatches**. An independent spectral consequence agrees: if \(y_j=f(38^{48+j})\) for \(\deg f<180\), the 256-point DFT with root38 must vanish at bins **1 through76**. The original p50 table has only one zero bin, **[76]**. The single observed zero therefore does not imply this systematic code.

The implementation passes a planted degree-179 positive control: coefficients \([1,2,\ldots,180]\) recover all **76/76** held-out values and produce exactly the required DFT zero bins **1..76**. A one-byte corruption of a planted border is detected. Reproducer: [`lp2_p50_gf257_rs256_180_systematic_gate.cjs`](../sims/lp2_p50_gf257_rs256_180_systematic_gate.cjs).

This rejects only the predeclared systematic RS(256,180) convention. Do not search alternative phases, evaluation-point orders, orientations, degrees or parity placements to rescue it. The original high-first p50 root and single spectral zero remain exact algebraic observations, not a recovered code or plaintext.

## Direct original-cipher receivers and decision

A concrete potential payoff is a source-selected **76-rune p55 receiver**. We evaluated four full-76 streams with **both** canonical GP29 additive signs and phase zero:

1. The first76 source-GF257 Fourier coefficients \(F_{0..75}\).
2. The **phase48** Fourier coefficients \(F_{48..123}\), using the third full p0 F-word sum.
3. The first76 coefficients of \(B(X)/(X-213)\) over GF257.
4. The first76 coefficients of the original p56 ciphertext polynomial divided by \(X-38\) over GF257.

Each GF257 coefficient is reduced mod29 and added/subtracted against **all 76 unchanged p55 source ciphertext indices**, without rephasing, discarding unknown letters or changing printed word boundaries. All eight outputs have GP29 indices of coincidence between **0.03123 and 0.03895**, versus **0.03789** for unchanged p55, and lack authentic readable GP-native plaintext. The same exact code performs full 76-rune round trips on the genuine native-GP clear original p57 prefix planted under each candidate keystream. The direct receivers **fail** even though the mathematical source alignment is exact.

The [single-file, original-input Windows Node22 SFT](../sims/lp2_gf257_spectral_border_source_sft.cjs) checks the field order, p0 original prime sums, p23/p55/p56 rune counts, all 256 original p50 bytes, the GF29 quartic, the 257-field roots including p55's neighboring-page rule, the single spectral-zero position, the deterministic 50,000 byte-residue-preserving controls, the three p56 85-symbol share consumers, and the original p55 keystream inverse controls. The original p56 ciphertext is rebuilt from its authenticated GP-native plaintext and its exact prime-totient key including the transparent-F clock exception. It is read-only, source-locked and needs no third-party packages.

**Decision:** retain the exact original GF257 root and single spectral-zero identities as algebraic observations, but reject the specified systematic RS(256,180) physical interior-to-border code and the four direct additive p55 receivers. The 180 original interior bytes define a unique degree<180 interpolant under the source-fixed \(x_j=38^{48+j}\), but it misses all 76 original border bytes; the actual spectrum has only bin76 zero rather than the 76-bin zero band required by this code. Do not search alternate phases, x-orders, orientations or degrees to rescue it. Any new GF257 successor requires an independent original instruction selecting a different operation and a ciphertext-bearing 76/180-symbol receiver that yields authentic plaintext or a typed address. The p50 root remains an exact structural observation, not a recovered cipher or plaintext.
