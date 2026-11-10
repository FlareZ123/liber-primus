# Original LP2: all-secret ternary Trifid 27-cube exclusion

**Finding and status.** The 29-symbol GP source alphabet admits a natural 3×3×3 = 27-cube Trifid hypothesis with two control symbols. This study fixes the last two original GP symbols IA and EA (indices 27 and 28) as one-to-one direct passthrough controls, strips them before applying a continuous period-27 cipher, and admits **every 27! cube order**, including a fully unknown rune-to-cube permutation. Both reversible Trifid orientations are excluded **as direct GP encodings of the three tested literary reference corpora**. No authentic LP2 key or unknown plaintext has been recovered.

| Constraint on original 12,956-rune ciphertext | Result |
| --- | ---: |
| Direct-GP standard Trifid, secret cube, exact one-symbol ceiling | **1,337** |
| Direct-GP reverse Trifid, secret cube, exact one-symbol ceiling | **1,340** |
| Shakespeare, 204,689 complete 12,956-rune GP windows | At least **1,404** E runes |
| Gibran, 49,741 complete windows | At least **1,414** E runes |
| Emerson, 310,128 complete windows | At least **1,486** E runes |

All caps already allow every one of the 11 leftover symbols to become the selected plaintext rune. A plaintext symbol mapped to one of the two passthrough glyphs has count no larger than the corresponding original glyph frequency, which is also below 1,337. These two possibilities cover all 29 GP plaintext symbols under the candidate's one-to-one alphabet.

## Exact key-independent argument

The original ciphertext contains **12,956** GP runes. Removing the two specified control glyphs leaves **12,026**, or 445 complete 27-rune blocks plus 11 trailing runes. Every full 27-symbol block produces nine triples of source ciphertext glyphs, repeated in three coordinate layers of the output:

- Standard inverse: (C_i, C_(9+i), C_(18+i)) for i=0..8.
- Reverse inverse: (C_(3i), C_(3i+1), C_(3i+2)) for i=0..8.

Any secret ordering of 27 cube symbols assigns exactly **nine** ciphertext glyphs to a given value of each one of the three cube coordinates. For a fixed desired decoded plaintext symbol, an output position must satisfy three corresponding nine-member source-glyph membership tests. Let T_x(y,z) count each distinct observed source triple with first glyph x. For each x, find the exact maximum R_x of the sum of **any nine rows and nine columns** in the 27×27 matrix T_x. Then the total frequency of one plaintext rune is at most **3 times the sum of the nine largest R_x, plus the 11 tail positions**. This relaxes the shared-key consistency between the three coordinate slices and across the three layers, so it is an upper bound for *every actual cube permutation*.

The rectangle maximizations are exact finite branch-and-bound computations. Each search node obtains a rigorous upper estimate by allowing each row independently to choose its best remaining columns; nodes below the incumbent are pruned. The full original-source computation yields sum-top-nine R_x **442** for standard decryption and **443** for reverse, producing 1,337 and 1,340 respectively.

## Broader 3-power period result

The same exact, key-independent nine-slice argument applies to independently fixed 3-power block periods. Rather than charging the last partial block entirely to a target plaintext rune, the extended reproducer maps **every** output rune back to its three ciphertext glyphs and their source cube-coordinate selectors. It groups output events by their exact axis signature and solves the nine-by-nine rectangle relaxation for each group. Shared cube constraints between groups are relaxed, so all listed figures remain mathematically valid for every secret 27-cube permutation.

| Continuous Trifid period after IA/EA stripping | Standard orientation ceiling | Reverse orientation ceiling |
| --- | ---: | ---: |
| 3 | 1,334 | 1,334 |
| 9 | 1,331 | 1,334 |
| 27 | 1,337 | 1,340 |
| 81 | ≤1,346 | ≤1,367 |
| 243 | ≤1,377 | 1,333 |
| 729 | Not excluded by this bound | 1,335 |
| 2,187 | Not excluded by this bound | 1,329 |
| 6,561 | Not excluded by this bound | 1,329 |

All 13 shaded finite configurations in the extended reproducer have upper bounds below **1,404**, the smallest GP-E count in any matched Shakespeare window; Gibran and Emerson minima are higher. The unequal upper-bound signs distinguish earlier conservative block-plus-tail estimates from the full axis-signature exact recomputation. The still-open larger-period standard orientations have not been decrypted.

The additional all-secret test and 12,956-symbol hidden-cube positive controls are in sims/trifid_27cube_periods_gate.cjs. GP cube symbol frequency is invariant under the unknown cube ordering only through the proven nine-slice capacity bound; this is a source-specific conditional exclusion, and does not authenticate a 3-power clock.

## Reproduction and scope

Run on Node 22 from repository root:

    node sims/trifid_27cube_allsecret_gate.cjs

This source file reads the canonical physical-page-aware LP2 corpus and the three existing pinned reference texts. It prints the exact per-glyph bounds, branch counts and source-window minima. A hidden deterministic 27-cube plant recovers all **12,956/12,956** source-native GP symbols and re-encrypts them exactly in both directions. It also validates the full original-cipher round trip for an arbitrary cube, explicitly reporting that a bijective round trip **does not identify a genuine key**.

The cube model and source-controlled IA/EA passthrough are hypotheses. **Other control pairs, page or word reset clocks, evolving cubes, nonlinear preprocessing, other plaintext registers and further layers remain open.** The sample of three literary sources does not represent all possible GP-language material.
