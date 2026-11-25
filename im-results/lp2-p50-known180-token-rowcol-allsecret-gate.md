# Terminal 180-known-rune grid: token pads and ciphertext-alphabet inversion

**Agent15, 13 November; Agent9, 25 November 2026. Exact original-input classification, including complete SHED bijection enumeration and intact-word exclusion. No unknown p55 plaintext or key recovered.**

## Source selection and receiver

The p49–51 numeric panel has 32×8 = 256 cells. Its outer perimeter has 76 cells, matching the original physical p55 ciphertext (including the incoming carry); the interior has 180 cells, matching 85 solved p56 runes plus 95 clear p57 runes. The solved p57 instruction to shed circumferences motivates the split but does not authenticate table-to-terminal alignment. The solved p56 operation is additive GP29 shifting by prime minus one with one transparent F. That provides a known **ciphertext and plaintext pair**, allowing an actual table-pad inverse test rather than fitting a static table directly to plaintext.

Use two fixed alignments: (i) printed row-major 76/180; (ii) the SHED perimeter/interior, each in physical row-major order. Let T be the exact printed token, r,c its physical row/column, X the printed terminal ciphertext rune, and P the independently known plaintext rune. All operations below are in GF(29).

Source blobs: corpus `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; grid `2550eae357442912220e05dc51147523a61dd75a`. The latter has 161 distinct tokens. Both radix59 and radix60 readings are injective on tokens, so arbitrary token-lookup results are identical under either reading. The p56 decoder replays 85/85 original glyphs with 84 consumed primes; p57 is used directly. No p55 plaintext is assumed.

## Earlier static plaintext lookup result (Agent15)

The earlier exact [stationary-token lookup gate](lp2-p50-76-perimeter-180-interior-source-partition.md) rejects a shared byte-to-plaintext mapping. The [full 2D field study](lp2-terminal256-original-inner-separable-gates.md) rejects fixed-affine byte slopes with row/column offsets and low-rank filters.

Agent15's stronger static hypothesis was P=F(T)+R(r)+S(c), with **all** 127 interior token values and 40 row/column offsets free. Its 180 SHED equations have coefficient rank161, augmented rank162; the reported 19 inconsistent residual equations are elimination-order-dependent. Thus no exact solution exists among the 29^167 formal secret assignments. The fixed scalar-affine byte/linear-row/linear-column alternative has rank4 and 168 residual contradictions. A synthetic target constructed with arbitrary F,R,S on the same 180 cells is consistent.

[Original single-file test](../sims/lp2_p50_known180_token_rowcol_allsecret_sft.cjs) · [passing Node22 CI](https://github.com/FlareZ123/liber-primus/actions/runs/43384244825).

## Distinct known-ciphertext receiver (Agent9)

Test four nested models, each of which uses the *printed ciphertext* as an input to predict plaintext:

1. P=X+F(T): direct unknown token pad.
2. P=X+F(T)+R(r)+S(c): arbitrary physical row and column adjustment.
3. P=aX+F(T)+R(r)+S(c): all 29 global slopes a (a=0 overlaps the earlier static test; the nonzero slopes are new).
4. P=H(X)+F(T)+R(r)+S(c): arbitrary 29-entry ciphertext alphabet H, followed by the same pad; H must be a permutation for a reversible fixed-cell decoder.

The p56-only equations are the development prefix; p57 is the independent known continuation. Exact GF29 elimination gives coefficient/augmented ranks (an augmented rank greater than the coefficient rank is an impossibility certificate). No original p55 plaintext or language score is used.

| Alignment | Receiver | p56 rank | p56+p57 rank |
| --- | --- | ---: | ---: |
| Row-major | Token pad | 71/72 | 129/130 |
| Row-major | Token+row+column | 85/85 | 158/159 |
| Row-major | All slopes | 85/85 | 159/160 |
| Row-major | Unrestricted H | 85/85 | 180/180 |
| SHED | Token pad | 69/70 | 127/128 |
| SHED | Token+row+column | 83/84 | 161/162 |
| SHED | All slopes | 84/85 | 162/163 |
| SHED | Unrestricted H | 85/85 | 180/180 |

Thus every token/offset/all-slope variant is exactly inconsistent on the 180 known positions. The row-major adjusted variants are underdetermined on p56 and force **zero** individual p57 predictions before failing the joint continuation. The unconstrained alphabet model fits every possible 180-symbol target, because its coefficient rank is 180. This is interpolation, not a discovered key.

### Enforce the ciphertext alphabet's invertibility

Eliminate F,R,S first, leaving only linear equations in H. Translation of H is a gauge (subtract the same constant from F), so set H(0)=0 without loss of generality. Every permutation of the 29 residues has sum 0 mod29; impose that necessary constraint. Exact reduction leaves five free H entries for row-major and eight for SHED.

For row-major, enumerate the complete ordered, distinct, nonzero assignments to the five free entries, 28P5 = **11,793,600**. Determine every other entry from the reduced equations and require all 29 to be distinct. **Zero** permutations survive. This excludes every reversible fixed-cell decoder in model 4 for the row-major alignment. A nonlinear planted alphabet under the same physical geometry and actual native plaintext was recovered uniquely by the same complete enumeration.

For SHED, the eight-dimensional permutation space has now been **exhaustively classified** (Agent9, 25 November). In the source-derived RREF with H(0)=0 and sum(H)=0, the free slots are H(21) through H(28). H(22) occurs only in the H(12) equation, with coefficient −1. Assign the seven remaining distinct nonzero free values; all 27 other H entries are then determined. If those entries are distinct, the two missing residues must fill H(12),H(22), and the sum constraint makes both orders valid. This reduces the entire 28P8 domain to 28P7 = 5,967,561,600 conceptual assignments. The exact AVX512 lane-bitset enumeration visits all 11,793,600 five-slot prefixes, considers 261,565,200 sixth-slot assignments after an exact permanent-collision prune, and retains 29 seven-slot assignments, giving **58 normalized bijections** in 29 swap-pairs. A restricted seven-slot planted control recovers its true H and agrees exactly with independent scalar enumeration over all 7! × 28 assignments (two witnesses). All 58 original bijections are independently checked against the original 180 known-rune equations by the lexical SFT, which regenerates the RREF from source.

Reproduce the executed native search on an AVX512/OpenMP-capable host with `g++ -O3 -march=native -fopenmp sims/lp2_terminal_shed_permutation_exact.cpp -o shed-exact` and `OMP_NUM_THREADS=4 ./shed-exact`. [Exact C++ enumerator](../sims/lp2_terminal_shed_permutation_exact.cpp) · [Source-derived lexical/reconstruction SFT](../sims/lp2_terminal_shed_permutation_lexical_sft.cjs) · [All 58 witnesses, regenerated coefficients, controls and results](lp2-terminal-shed-permutation-lexical-output.json). The enumeration was executed locally; the CJS core was executed in connected V8. No separate CI run is claimed.

### Exact p55 output-space obstruction

For every compatible key, the possible p55 outputs constitute an affine space under changes to the unknown pad. Compute its dimension by projecting the known-equation kernel through the 76 p55 rows; equivalently use the rank increment when those rows are added. A coordinate is uniquely determined only if its row lies in the known row span.

| Alignment | Arbitrary H: dimension / individually fixed runes | Even with H fixed: dimension / individually fixed runes |
| --- | ---: | ---: |
| Row-major | 47 / 0 | 41 / 0 |
| SHED | 47 / 0 | 38 / 0 |

For SHED, each of the 58 compatible normalized permutations permits exactly 29^38 distinct p55 plaintext tapes. Each individual output coordinate can attain every GP29 value. The 38 independent parity-check syndromes on the exterior distinguish all 58 permutations, so their affine output cosets are pairwise disjoint: the entire normalized model permits exactly **58 × 29^38** distinct p55 tapes. This counts algebraically attainable tapes, not English candidates or an authenticated key.

### Exact intact-word constraints for every SHED bijection

Eliminate the token, row and column pads against the known180 and project the remaining linear relations onto the 76 original p55 positions. The 38 independent target constraints have row support sizes 2–5 in the elimination basis. For each complete printed group, eliminate every column outside it to obtain all internal linear conditions; repeat for each pair of complete groups to include cross-group constraints. The first p55 rune belongs to an 11-rune carried group and is left unrestricted. The other **16 complete groups** are matched to the pre-existing 35,944-form GP spelling register (same donor/register recipe as the [prime-clock long-anchor SFT](../sims/lp2_postshuffle_prime_clock_long_anchor_sft.cjs)). In particular, local zero-based positions 23–35 form a 13-rune group with four independent internal checks and 581 register candidates. **None of the 58 H values supports any of these 581 forms.**

For each H, let every unsupported single group be OOV; among the remaining groups, connect two vertices whenever no pair of locally compatible words satisfies their complete two-group projection. Any fully compatible in-register subset must be an independent set in this graph. Exact minimum vertex cover gives an additional necessary OOV count, allowing arbitrary unknown spellings at every excluded group. Across all 58 H, the single-group lower bound is 1 for 51 and 2 for 7; the combined lower bound is **4 for 27 and 5 for 31**. Thus every H requires at least four of the 16 complete printed groups to fall outside this broad register. This is a lower bound, not a certificate that four substitutions suffice. Locally unique words under individual H are not recovered plaintext.

Three constructed same-geometry lexical controls preserve all 180 original known ciphertext/plaintext pairs, solve an admissible pad, and encode fresh 76-rune targets using a compatible H. All retain all 16 true complete groups and all 53 nonredundant cross-group checks, with complete syndrome replay; one donor lacked a registered length-13 held-out form and used a register fallback. These are lexical necessity controls, not contiguous natural-language or full blind-key recovery controls.

The exact linear trellis cut rank is at most five (rank of left and right check submatrices minus 38). This motivates a separate boundary-independent constrained-language decoder without using the printed word divisions. The four-OOV result excludes only the intact-word finite-register hypothesis, including arbitrary whole-group order if the printed groups remain the units. It does not exclude unusual spellings or H-decoy framing.

### Positive and negative controls

Three seeded plants for each of the four models and two alignments (24 total) use the original grid and native solved plaintext with independently assigned token/row/column offsets; lookup-mode plants use seeded Fisher–Yates permutations. All 24 remain consistent and every forced prediction is correct. Direct token-pad plants force 25/27 p57 runes and 40/37 p55 runes by geometry (row-major/SHED); the more flexible models force none. These are constructed native-text controls rather than historical encryption. All six true nonlinear alphabet witnesses satisfy the normalized residual constraints. The row-major seed1 plant has exactly one normalized permutation across all 11,793,600 assignments. Three small exact elimination checks test contradiction, unique linear functionals and underdetermination. The original row-major zero-permutation result also passed a separate local C++ enumeration from the same reduced coefficients.

[Read-only CommonJS SFT](../sims/lp2_terminal_grid_ciphertext_lookup_sft.cjs) · [Full executed JSON](lp2-terminal-grid-ciphertext-lookup-output.json). The complete core executed in connected V8 against source blobs; the standalone Node wrapper has not been run in CI.

### Token-specific ciphertext alphabets (25 November, separate exact necessary condition)

Instead of a common H plus token pad, let each exact printed token select an entirely independent function H_T(X)=P, allowing arbitrary nonlinear, even noninjective maps. Repeated (token,ciphertext) pairs must predict the same plaintext. Both frozen layouts violate this condition. Row-major token 2M maps ciphertext4 to both plaintext23 and4 (terminal known offset 80 and216); SHED token 3I maps ciphertext18 to both26 and18 (terminal offsets137 and255). Each has two contradictory repeated-input events, none at the p56 literal-F bypass. There are additionally 2 and 5 same-token injectivity conflicts respectively. Exhaustive 28×29 affine substitutions per token leave 8/15 incompatible token classes. Even without contradictions, known180 contains only 2/3 exact token+ciphertext overlaps with p55; these hypothetical overlaps are not plaintext predictions from a consistent key. Retire independent token-indexed substitutions for these layouts, not position- or state-dependent alphabets.

Reproduction: use the source and exact p56 reconstruction above; group known180 pairs by printed token and original ciphertext; compare plaintext values within each group. The two explicit conflicting pairs alone certify the impossibility. No language model or inferred secret is needed. The full checks were executed directly in Code Mode.

## Decision

Retire direct token pads and their arbitrary row/column/affine-ciphertext extensions in both frozen alignments. Retire the entire bijective-alphabet extension in row-major and the SHED extension under the intact-word, broad-register hypothesis with fewer than four OOV complete groups. SHED has exactly 58 admissible H values and 58 disjoint 29^38 plaintext cosets; there is no individually fixed p55 rune. No further permutation search is warranted. A constrained, boundary-independent language decoder with native recovery controls is a distinct remaining test, not evidence for this receiver. The geometry remains real, its plaintext receiver is unselected, and issue #41's complete 76-rune inverse remains unmet.
