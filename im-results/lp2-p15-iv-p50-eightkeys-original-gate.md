# P15 16-cell square as AES-CTR IV for eight P50 column keys: original-cipher gate

**Agent 2, 13 November 2026. Original 12,956-rune negative under an exact source-shaped binary cipher model. No unknown plaintext, authentic cipher key or destination recovered.** The [self-contained CommonJS SFT](../sims/lp2_p15_iv_p50_eightkeys_original_sft.cjs) and [successful manual GitHub Actions run 43520041006](https://github.com/FlareZ123/liber-primus/actions/runs/43520041006) preserve the complete tests and planted inverses.

## Causal premise and independent visible inputs

The original LP2 physical p15 presents **16 integers in a 4×4 square**, with the red **3299** fixing the recovered Fibonacci-prime spiral start. The original physical pp49–51 present **256 two-symbol numerical cells**, conventionally read as 32 rows × eight base60 bytes. Every vertical column therefore has precisely **32 bytes**, the key size of AES-256. A possible and very concrete combination is to use the p15 square as the **16-byte AES-CTR IV** and eight independently printed grid columns as eight independent AES-256 keys for the eight complete unknown rune sections.

This is a *hypothesis*, not an authenticated authorial instruction. No original source specifies AES, truncating each four-digit p15 integer modulo256, column order as keys, the counter mode, or the GP29 byte-to-letter consumer. The test fixes one simple, explicit candidate without guessing an external password or searching over IV bytes.

Input assertions:

- P15 printed row-major sixteen original integers: `[3258,3222,3152,3038,3278,3299,3298,2838,3288,3294,3296,2472,4516,1206,708,1820]`; the established center-out 3299 spiral order uses original offsets `[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]`.
- Original row-major 256 base60 table bytes SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`; construct eight 32-byte AES-256 keys by taking each of the eight table columns top to bottom without modifying the original values.
- Exact unknown LP2 ciphertext **12,956 GP29 runes** split by original section delimiter into `[729,1145,1729,9,1894,1021,1524,1589,3316]` rune groups. The stand-alone 9-rune p15 interlude attaches either to its preceding or following section, yielding exactly eight sections with lengths `[729,1145,1738,1894,1021,1524,1589,3316]` or `[729,1145,1729,1903,1021,1524,1589,3316]`. Both concatenations are checked against all 12,956 original GP indices.

## Direct inverse, outcomes and controls

For each IV, take the sixteen source numbers in printed row-major or independently documented spiral order, **reduce each modulo256** into the 16-byte IV, and generate exact `AES-256-CTR(key_j, IV)` output for the corresponding original section. Test two fixed reversible GP streams:

1. **GP29 additive:** `P_i=(C_i ± (stream_i mod29)) mod29`.
2. **GP28 differential:** map nonzero `(C_i − C_(i−1)) mod29` to one of 28 exponents of primitive root 15 mod29, then add or subtract `stream_i mod28`; map zero transition to GP symbol 28. The section predecessor starts at zero.

The sixteen original combinations are **2 p15 IV orders × 2 source-valid interlude attachment choices × 2 GP inverse conventions × 2 signs**. Every run processes all eight independently keyed sections. No arbitrary key fitting, phase sweep, plaintext substitutions, or edit of the original input is permitted.

| Full original-source statistic | GP index of coincidence | Shakespeare-GP trained trigram average |
| --- | ---: | ---: |
| Unmodified LP2 unknown source | 0.0344783979 | −6.29656948 |
| **Best candidate by language score**: p15 row-major, interlude with previous, GP29 subtraction | **0.0344890982** | **−6.24395270** |
| **Highest-IoC candidate**: p15 spiral, interlude with following, GP28 subtraction | **0.0352758361** | −6.29007512 |
| Independent known-English GP comparison window | **0.0595007131** | **−2.24588166** |

The best candidate starts `GMEABFATHEOHEATHCLNYTHAOEGOENIAJISEOMDEAXY...`; no original output yields coherent GP prose. The IoC remains near the 29-symbol uniform baseline for the GP29 additive case and the GP28 alphabet's near-uniform baseline for the differential case. These long-stream scores stand far outside the independently prepared native plaintext comparison.

Every candidate's **full original 12,956 GP rune stream** re-enciphers exactly under its chosen inverse. In addition, for **all 16 variants × all 8 sections**, a separately sourced native-GP English window is encrypted and decoded to the original rune indices without loss. The plants validate the implementation and sensitivity; roundtripping the original cannot establish a correct key.

## Decision

**Retire the literal p15-square-as-mod256-IV + p49–51-columnwise-AES256-key + reset-per-section-CTR + GP29/GP28 direct plaintext family under the two visible p15 ordering conventions.** This closes a cross-artifact consumer distinct from the prior **p15-as-AES256-key to decrypt the numeric table** and the prior **p50-column-keys with an all-zero IV**. It supplies no plaintext, creator-selected IV construction, or actual cipher. An alternative AES framing requires an independently visible instruction or real original key material before further computation.

Source and reproducibility: [SFT](../sims/lp2_p15_iv_p50_eightkeys_original_sft.cjs), [manual runner](../.github/workflows/lp2-p15-iv-p50-eightkeys-original-manual.yml), [original 2014 canonical table](../resources/liber-primus/base60-grid.json), [original LP2 corpus](../resources/liber-primus/lp2-corpus.json), [successful original-cipher GitHub Actions execution](https://github.com/FlareZ123/liber-primus/actions/runs/43520041006).
