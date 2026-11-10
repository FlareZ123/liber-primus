# Original LP2: all-secret ternary Trifid 27-cube exclusion

**Finding and status.** The 29-symbol GP alphabet admits direct 3×3×3 Trifid with two unchanged transparent IA and EA glyphs (indices 27 and 28). Under **any book-fixed ordering of all 27 cube symbols**, an exact original-source triplet-equality invariant excludes **all 4,008 continuous standard-period lengths divisible by three, from 3 to 12,024**, as direct native-GP encodings of every window in Shakespeare, Gibran and Emerson source controls. The earlier independent nine-slice key-free frequency ceiling additionally excludes all eight 3-power reverse-orientation periods. The conclusion remains a precisely scoped original-source negative for one-layer direct-GP cipher hypotheses. **No authentic LP2 key, unknown plaintext or destination was recovered.**

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

## All tested 3-power periods: old frequency bound and stronger triple invariant

The earlier exact nine-slice argument applies to 3-power periods beyond 27. It groups every potential output symbol by its three source positions and coordinate-axis signature and relaxes shared cube constraints by solving independent maximum-weight 9×9 rectangles. The resulting correct all-key frequency caps exclude **standard periods 3,9,27,81,243** (ceilings 1,331–1,377) and **reverse periods 3,9,27,81,243,729,2187,6561** (ceilings 1,329–1,367) against the minimum **1,404** GP-E count of all fixed 12,956-symbol windows in the three reference texts. That older frequency relaxation was inconclusive for standard periods 729, 2,187 and 6,561; its finite claims remain valid.

A new, stronger invariant **requires no plaintext symbol frequency bound or secret-key search**. Write \(\psi\) for any bijection from the 27 noncontrol runes to the 27 ternary triples. For every complete standard-Trifid block of length \(n=3m\), define original ciphertext source triples

\[
X_t=(C_t,C_{m+t},C_{2m+t}),\quad t=0,\ldots,m-1.
\]

The corresponding three consecutive decoded plaintext runes are

\[
Y_t=\bigl(
\psi^{-1}(\psi(C_t)_0,\psi(C_{m+t})_0,\psi(C_{2m+t})_0),
\psi^{-1}(\psi(C_t)_1,\psi(C_{m+t})_1,\psi(C_{2m+t})_1),
\psi^{-1}(\psi(C_t)_2,\psi(C_{m+t})_2,\psi(C_{2m+t})_2)
\bigr).
\]

This transposes the nine ternary coordinates of the three input glyphs and applies the same bijective cube. Therefore \(X_t\mapsto Y_t\) is **bijective and identical in every block under a book-fixed cube**, regardless of which of the 27! secret cube orders is used. Two original triples are equal if and only if their decoded plaintext triples are equal. Thus the **entire triple-repetition partition**, its maximum multiplicity and the pair-collision count \(\sum_v {n_v\choose2}\) are exact all-key invariants. Original IA and EA source/control runes are stripped before the clock, as in the preceding tests; all trailing partial periods are ignored rather than assigned helpful symbols.

The [original-source triple-invariant SFT](../sims/trifid_triple_equality_invariant_sft.cjs) computes the source triples from the canonical 12,026 noncontrol LP2 runes. For every reference corpus it checks **every possible contiguous run of the matching number of noncontrol native-GP runes at all three start phases** using exact sliding triplet-count histograms. These windows include a superset of any reference plaintext consistent with the manuscript's original fixed 12,956-rune length and control placement, making the exclusion conservative.

| Standard Trifid period | Full original core runes | Original triple pairs | Original max identical triple | Minimum Shakespeare pairs | Minimum Gibran pairs | Minimum Emerson pairs |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | 12,024 | 434 | 4 | 6,244 | 9,019 | 6,462 |
| 9 | 12,024 | 431 | 4 | 6,244 | 9,019 | 6,462 |
| 27 | 12,015 | 413 | 4 | 6,209 | 9,012 | 6,457 |
| 81 | 11,988 | 400 | 4 | 6,191 | 8,979 | 6,433 |
| 243 | 11,907 | 396 | 4 | 6,118 | 8,825 | 6,327 |
| **729** | **11,664** | **354** | **4** | **5,912** | **8,560** | **6,078** |
| **2,187** | **10,935** | **340** | **4** | **5,208** | **7,521** | **5,256** |
| **6,561** | **6,561** | **110** | **3** | **1,826** | **2,422** | **1,809** |

### Complete original-input exclusion of all 4,008 divisible-by-three periods

The bijection just proved holds for **every period \(p=3m\)**, independently of whether \(m\) is a power of three. Original core length is **12,026** after removing the two controlled glyphs, so periods with at least one complete block comprise precisely **4,008** candidates \(p=3,6,\ldots,12,024\).

For each period the [exhaustive original-input SFT](../sims/trifid_all_multiple3_invariant_sft.cjs) constructs all complete-block triples, \(K(p)=\lfloor12026/p\rfloor p/3\), and their collision pairs \(H(p)=\sum_v {n_v\choose2}\). The exhaustive original-source enumeration establishes:

- **Minimum complete-block prefix:** \(K_{\min}=2,005\) triplets over all 4,008 periods.
- **Largest original collision-pair count:** \(H_{\max}=475\), at **period 273**.
- **Every eligible 2,005-triplet native-GP core window in Shakespeare, Gibran, Emerson:** at least **1,519/2,005/1,479** collision pairs across **209,790/56,039/314,480** distinct starts and all phases.

The same model's unknown cube induces one identical bijection on every complete source triple, so \(H(p)\) must be preserved in recovered plaintext. For any larger plaintext window \(K(p)\ge K_{\min}\), the collision count is at least that of its first 2,005 triples: adding occurrences cannot remove previously existing matching pairs. Hence each putative original-derived plaintext has at most **475** pairs and every reference-derived candidate has at least **1,479**. These bounds hold simultaneously for **all 4,008 periods and all 27! cubes**, with no parameter fitting to a decoded candidate.

The script tested synthetic hidden-cube direct-GP encryption/inversion and source-original inverse/re-encryption over **all 12,956 runes** at independent representative periods **3, 3,300, 6,015 and 12,024**. The exact source-only exhaustive computation, positive controls and short-window minima passed [manual GitHub Actions run 42923026151](https://github.com/FlareZ123/liber-primus/actions/runs/42923026151).

For the 729-rune period alone the SFT exhaustively screens **204,141 Shakespeare**, **50,390 Gibran** and **308,831 Emerson** possible source-core window starts across all phases. The original's 354 repeated-triplet pairs are far below all three independent minima. Even the shortest complete 6,561-rune case has 110 pairs versus reference minima of 1,826/2,422/1,809. This exact mismatch survives **any** fixed secret cube: none of the stated direct native-GP plaintexts could produce the original grouped triple-equality partition.

The SFT asserts equality of the full triple-frequency fingerprint and a two-way equality partition under a deterministic hidden cube on the **real original ciphertext decoded under that artificial cube**. It separately encrypts a native-GP Shakespeare plant, reverses it for **12,956/12,956** runes and checks the same triple-equality law. Thus the source result is a genuine key-independent obstruction, while an arbitrary original round trip remains only an implementation check. [Successful manual Actions run 42922098995](https://github.com/FlareZ123/liber-primus/actions/runs/42922098995).

These results close the **entire continuous standard-Trifid divisible-by-three period family** for this explicitly stated direct-GP model. They do not establish that the authors used Trifid or that all English text has the reference-corpus repetition rate. They do not restrict an evolving cube, different transparent controls, unequal/word/page-based clocks, ciphertext edits, non-GP intermediate alphabets or additional layers.

## Reproduction and scope

Run the exact original-source tests on Node 22 from the repository root:

    node sims/trifid_27cube_allsecret_gate.cjs
    node sims/trifid_27cube_periods_gate.cjs
    node sims/trifid_triple_equality_invariant_sft.cjs
    node sims/trifid_all_multiple3_invariant_sft.cjs

This source file reads the canonical physical-page-aware LP2 corpus and the three existing pinned reference texts. It prints the exact per-glyph bounds, branch counts and source-window minima. A hidden deterministic 27-cube plant recovers all **12,956/12,956** source-native GP symbols and re-encrypts them exactly in both directions. It also validates the full original-cipher round trip for an arbitrary cube, explicitly reporting that a bijective round trip **does not identify a genuine key**.

The cube model and source-controlled IA/EA passthrough are hypotheses. **Other control pairs, page or word reset clocks, evolving cubes, nonlinear preprocessing, other plaintext registers and further layers remain open.** The sample of three literary sources does not represent all possible GP-language material.
