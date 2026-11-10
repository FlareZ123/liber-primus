# Source red triads and the 51×127 canonical-byte gate

**Original-input bounded exclusion, 10 November 2026, Agent 42. No unknown Liber Primus plaintext, historical encryption key, complete mechanism or destination has been recovered.** The complete original-input and positive-control test is [\`sims/red_triad_51x127_byte_register_sft.cjs\`](../sims/red_triad_51x127_byte_register_sft.cjs). The separate public-state language test is [\`sims/red_triad_gf841_127cycle_inverse.cjs\`](../sims/red_triad_gf841_127cycle_inverse.cjs). These are finite tests of candidate mechanisms, not claims that the puzzle's authors used these operations.

## Why this particular register is worth testing

The two source-marked three-rune red inscriptions give two distinct exact algebraic objects:

- Physical LP2 p3 at local rune offsets 119–121: GP indices \`13,23,2\` define the irreducible \`13+23u+2u²\` in F29, so \`u²=8+3u\` defines GF(29²). The class \`u\` has exact multiplicative order 840.
- Physical p39 at the same offsets: \`27,5,15 = 15(X−24)²\` in ascending polynomial coefficients. This divides the original p49–51 256-byte numerical table polynomial over F29 when its bytes are read as descending coefficients. Fixed-width division yields exactly 254 quotient coefficients, including one zero leading pad, hence 127 field pairs.
- Physical p53 contributes a separately marked run of 51 red GP glyphs. All p0–55 unknown physical pages together have 12,956 GP runes. The arithmetic identity \`12,956 = 2 + 51 × 127 × 2\` accommodates one two-rune header and 51 complete rows of 127 two-rune field elements.

The equality of dimensions was noticed **after** the structures were found and does not establish an intended 51×127 transport. It suggests a precise byte-register hypothesis worth testing because the manuscript prints a 256-byte source table and GF841 has room for 256 canonical byte values.

## Exact original-capacity question

For each row \`r ∈ [0,50]\` and column \`j ∈ [0,126]\`, treat the two original ciphertext GP indices at book offsets \`2+254r+2j\` and \`3+254r+2j\` as a field element \`C[r,j]\`. The p39 polynomial quotient supplies field element \`Q[j]\`. Let a candidate plaintext byte \`b ∈ [0,255]\` have canonical injective base29 field representation \`B(b)=[floor(b/29), b mod29]\`. The proposed one-byte-per-pair encoder is

\`C[r,j] = alpha[r] B(b[r,j]) + Q[j] + beta[r]\` over GF(29²).

The two public row-multiplier rules are:

1. \`alpha[r]=1\`, arbitrary secret per-row field offset \`beta[r]\`.
2. \`alpha[r]=u^(R[r])\` where \`R[0..50]\` is the original p53 51-red-rune GP-index sequence; again arbitrary secret \`beta[r]\`.

The test enumerates **all 841 possible beta offsets independently for every one of the 51 rows**. A row with fewer than 127 canonical bytes under **every** beta proves that no row-secret choice produces a full direct canonical-byte plaintext under that particular public key rule. Row secret selection is arbitrary and favourable to the hypothesis; no plaintext scoring or parameter fitting is involved.

| Original input | Rows admitting all 127 bytes | Worst row's best byte count | Best row's best byte count | Mean of the 51 row maxima |
| --- | ---: | ---: | ---: | ---: |
| \`alpha=1\`, table quotient, all secret \`beta\` | **0/51** | 44/127 | 56/127 | 48.3529411765/127 |
| \`alpha=u^R\`, table quotient, all secret \`beta\` | **0/51** | 43/127 | 55/127 | 48.0980392157/127 |
| Source-native encrypted **6,477-byte positive plant** with \`alpha=u^R\` and 51 arbitrary row offsets | **51/51** | 127/127 | 127/127 | 127/127 |

The plant uses the complete source quotient and 51 real red row multipliers, deterministically chooses actual bytes \`b_i=(73i+41) mod256\`, encrypts with hidden row offsets \`[(7r+2)mod29,(17r+4)mod29]\`, and checks the exact inverse for every 6,477 byte. The same 841-offset capacity search recovers 127 valid bytes in all 51 rows. The original cannot be explained by **either defined canonical byte model**, even with all 51 per-row offsets unconstrained.

## Distinct fully reversible GP original-input experiment

The adjacent [field-state program](../sims/red_triad_gf841_127cycle_inverse.cjs) tests a separate 51-cycle, source-forced field recurrence with \`S_0\` equal to the first two original ciphertext GP indices \`[15,8]\`, \`P_t=C_t-S_t\`, and \`S_(t+1)=u S_t+Q_(t mod127)\`. It exactly re-encrypts all 12,954 payload glyphs; the original decoded GP-index IoC is **0.0344807853**, while the original payload IoC is **0.0344789617**. The first decoded passage is nonlinguistic. An independent 12,954-GP-rune Shakespeare-based plant decrypts **12,954/12,954** and has IoC **0.06632997**; rotating the 127 source quotient pairs for that plant produces only **425/12,954** correct runes, with IoC **0.03447976**. Thus the particular source-fixed direct-GP evolving-field inverse yields no readable original plaintext despite a working true-source control.

## Interpretation and open mechanism

The byte gate is an exact original-input obstruction to a **canonical one-byte-per-two-runes** field transport with only row-wise secret offsets under the two declared source-multiplier rules. It **cannot** exclude reduction modulo 256, arbitrary alternative 256-codepoint subsets, homophonic/noncanonical byte encodings, hidden within-row state, variable-rate coding, different grid orientations, or another selection of start/boundary. The public-state test is likewise a negative for one recurrence, not for GF841 altogether.

The essential missing step remains a historically discoverable **source-specified, lossless original-input decoding operation** capable of making all original glyphs and boundaries and yielding independently recognizable recovered plaintext. Extending the row key space to arbitrary alphabet permutations, or searching red-derived phase knobs without a source instruction, would erase the discriminating capacity gate.
