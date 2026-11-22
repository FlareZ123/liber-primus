# Compound numeric clues: 4×4 Fibonacci square as IV, eight grid columns as section keys

**Status: bounded, executable negative; no LP2 key or plaintext recovered. Agent 45, 2026-11-10.**

The previous grid-column experiment assumed a zero IV. Here both of the manuscript's independently established **geometric numeric structures** are combined in a full AES-256-CTR / ChaCha20 decryption hypothesis:

- LP2 page 15 gives a 4×4 number square, with 16 printed integers (2258 is NOT its upper-left: the actual upper-left is **3258**). An exact candidate **16-byte IV** is made from each integer modulo256 or from |3301 − integer| modulo256, in conventional row-major layout or the independently documented red-3299 outward Fibonacci-prime spiral. Four candidate IVs, each fully specified below.
- LP2 pages 49–51 give 32×8 base-60 encoded bytes. Each column is a complete 256-bit symmetric key. There are eight substantial ciphertext groups after merging a two-word bridge with the adjacent section. Each group independently starts a counter stream with the same candidate IV; page wraps do not reset the stream.
- The 16 common settings for AES vs ChaCha, forward/reversed 32-byte column key, mod29/scaled29 byte reduction and GP sign ± are combined with exact maximum-weight assignment of all eight keys to eight sections (all 8! permutations, no greedy search).

IV candidates (hex): **row printed** 'ba9650decee3e216d8dee0a8a4b6c41c'; **row prime-complement** '2b4f9507170203cf0d07053dbf2f21c9'; **spiral printed** 'e3e2e0ded8ceba9650de16a81cc4b6a4'; **spiral prime-complement** '020305070d172b4f9507cf3dc9212fbf'. Their numeric inputs are direct reproductions of the scanned 4×4 grid; the modulo256 reduction is the explicit, unproven conjecture.

## Results

Opt-in GitHub Actions [successful run 42753834314](https://github.com/FlareZ123/liber-primus/actions/runs/42753834314), Node 22.

| Source of IV | Best weighted GP index of coincidence, with all 8! assignments |
|---|---:|
| Spiral printed numbers | **0.03479925** |
| Spiral 3301-prime complements | **0.03479330** |
| Row printed numbers | **0.03475249** |
| Row 3301-prime complements | **0.03474414** |
| Random-rune reference | Approximately **0.03448276** |

The real-best setting is AES-256-CTR, forward keys, scaled29 reduction, positive arithmetic sign and column assignment [6,4,2,0,5,7,3,1]. Its section-by-section decoded IoC values run only 0.0345638–0.0350188 and do not support English-like GP plaintext.

**Matched search null:** 100 replications each drawing four independent random 128-bit IVs, searching all 16 modes and all eight-column permutations per IV under the same actual ciphertext. Mean maximum **0.03479227**, observed **0.03479925**, corrected empirical **p=0.35644**; null maximum 0.03487345.

**Plant:** 12,956 runes of GP-encoded Shakespeare text across the same eight section lengths, encrypted under the actual eight columns in identity order, AES-256-CTR and the *spiral prime-complement* IV. A seeded independent 81%-chance anti-doublet replacement changed **382** ciphertext runes. The full 16-mode, 8!-assignment screen selects the exact original algorithm, all eight keys in correct order and true IV; weighted decoded IoC **0.05833759**. Thus the real null is not caused by the absence of the true-key configuration from the search or immediate loss of a detectable signal from a moderate anti-doublet repair rate.

The test does **not** exclude hidden key-skips/counter jumps, key derivation other than direct column bytes, alternative IV construction or order, different alphabet ordering, different source-language registers, or a ciphertext-dependent outer permutation. These are concrete ways in which the original numeric clues could still participate in a more complex scheme. The current evidence specifically disfavors the four declared literal IV-constructions under direct GP additive decoding.

**Reproduce:** 'node sims/grid_square_iv_keys.cjs'. The manual workflow is '.github/workflows/grid-square-iv-keys.yml'. Source digit grid and spiral are defined in code and printed with four IVs; no new files or regenerated corpus are required.
