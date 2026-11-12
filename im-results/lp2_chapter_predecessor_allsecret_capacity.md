# LP2 predecessor-state substitution: source-chapter all-secret capacity

**Agent 5, 12 November 2026. Original-input, all-secret GP29 exclusion.** Original unsolved physical pp0–55 contain 12,956 canonical GP29 rune identities across 55 rune-bearing pages. Even granting every one of the **261** observed (nine visible chapter, previous ciphertext rune) states a separate, completely arbitrary secret 29-way symbol permutation, their combined outputs cannot match the E and E+O frequencies of any of 89 pinned native-GP English windows. **The stronger result is chapter-local:** giving the cipher the original printed **word-start bit** as an *additional input* no longer rescues those 89 aligned windows. One original chapter, physical pp40–53, has an exact maximum of **300** copies of any single plaintext rune and **537** copies of any two different runes across its 3,008 output positions, even with a separate 29! secret permutation per previous-rune/word-boundary state and 13 wholly free page starts. Every aligned Shakespeare/Gibran/Emerson English control has **at least 539 E+O** in that same chapter. No original unknown plaintext, key or cipher mechanism is recovered.

[Reproducer](../sims/lp2_chapter_predecessor_allsecret_capacity_sft.cjs) · [Initial successful GitHub Actions regression](https://github.com/FlareZ123/liber-primus/actions/runs/43292429497).

## Source evidence and proof

The nine original visible chapter intervals are pp0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, and 54–55; original physical p50 contains only numerical-table cells. The canonical rune sequence and independent exact transcription agree at every position. Between the 55 page starts are **12,901** adjacent within-page transitions. **2,873** of those carry a printed word separator before the next glyph, independent of page/line wraps.

The proposed family is a *hypothetical* length-preserving, plaintext-native GP29 decoder
\[
P_i=D_{h_i,C_{i-1},b_i}(C_i),
\]
where \(h_i\) is the observed chapter, \(C_{i-1}\) the preceding printed ciphertext rune, \(b_i\) the **printed** word-start bit (optional), and every \(D\) any independently chosen unknown permutation of all 29 GP rune identities. We grant the decoder the printed bit directly, without requiring it to predict or encode punctuation. When \(b\) is absent, this is the simpler chapter+previous-rune family. No 256-cell grid key, affine form, statistical fit, or fixed substitution alphabet is assumed.

For each visible state \(s\), form the original next-rune counts \(n_{s,c}\). Under **every possible secret permutation**, the greatest possible output count of any chosen one plaintext rune is the sum of each state's largest cell count; for any two chosen distinct runes, sum the two largest counts per state. This is an **exact all-secret upper bound**, because a permutation maps each observed ciphertext identity to precisely one output identity. Add **one free plaintext rune per physical page**, ignoring actual cipher carries. For chapter \(h\), with \(N_h\) source runes and \(q_h\) pages, the respective maxima are
\[
U_{h,1} = q_h+\sum_{s\in h}n_{s,(1)},\qquad
U_{h,2} = q_h+\sum_{s\in h}(n_{s,(1)}+n_{s,(2)}).
\]

All counts below *already grant the observed printed word-boundary bit* and completely secret alphabets.

| Original chapter | GP rune positions | Freely allowed first runes | Max copies of any one GP rune | Max copies of any two GP runes |
| --- | ---: | ---: | ---: | ---: |
| pp0–2 | 729 | 3 | 119 | 215 |
| pp3–7 | 1,145 | 5 | 167 | 292 |
| pp8–14 | 1,729 | 7 | 205 | 364 |
| pp15–22 | 1,903 | 8 | 226 | 401 |
| pp23–26 | 1,021 | 4 | 141 | 247 |
| pp27–32 | 1,433 | 6 | 183 | 322 |
| pp33–39 | 1,680 | 7 | 209 | 365 |
| **pp40–53** | **3,008** | **13** | **300** | **537** |
| pp54–55 | 308 | 2 | 85 | 142 |

**Without word-boundary input**, the original entire-book class has 261 populated states and totals **1,310** single-letter and **2,344** two-letter capacities, even after adding all 55 page starts; all 89 native-English controls exceed them (minima E=1,430, E+O=2,464). With word-start input, the **global** capacities rise to **1,635/2,885** across 521 populated states. That aggregate count alone is inconclusive. The separate pp40–53 limit above is the discriminating test, independently of how surplus capacity in the other chapters is distributed.

## Original-page prediction against independent native language

Native controls are normalized to the project's fixed GP alphabet (QU→CW; V→U; K/Q→C; Z→S; longest 29-GP digraph token), then selected in *complete 12,956-rune windows* aligned to every original physical chapter boundary. The original pp40–53 chapter corresponds to GP global offsets **9,640–12,647**, a 3,008-rune interval.

| Independent native-GP source | 12,956-rune aligned windows (stride 6,478) | Minimum E in pp40–53 aligned interval | Minimum E+O there | Windows exceeding 537 E+O |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare, first 300,000 characters | 32 | 298 | **539** | **32/32** |
| Gibran, *The Prophet* | 8 | 320 | **577** | **8/8** |
| Emerson, *Essays, First Series* | 49 | 325 | **549** | **49/49** |

The independently corrected native **Old English Beowulf** fixture is a relevant register check. Its source-selected disjoint 12,956-rune positive plaintext plant has **354 E** and **541 E+O** in this same 3,008-position interval, and also violates the original chapter's 300/537 capacities.

### Exhaustive same-size source windows: important limitation

An **every-offset**, exact-length rolling check across all original native-language source windows prevents turning the 89 aligned-control exclusion into an unwarranted universal theorem. It imposes **all nine chapter bounds simultaneously** for E *and* E+O. Substrings pass this finite necessary gate at the following rates:

| Source | Every possible full-length 12,956-rune window | Windows passing the pp40–53 E+O bound alone | Windows passing both capacity bounds in every chapter |
| --- | ---: | ---: | ---: |
| Shakespeare | 205,845 | 2,202 | **52** |
| Gibran | 50,159 | 0 | **0** |
| Emerson | 311,675 | 0 | **0** |
| Corrected Old English *Beowulf* | 35,057 | 33,170 | **0** |

The 52 *frequency-compatible* Shakespeare windows cluster in one narrow local source interval, beginning at offset **100,611**. The exact state-mapping contradiction described below rejects every one.

These frequency conditions eliminate all but 52 provisional Shakespeare source windows. The stronger all-secret state-bijection check below rejects all 52 and therefore excludes all four complete finite corpora under the declared chapter-static model.

### The remaining 52 Shakespeare windows fail exact all-secret substitution

The capacity screen admits **52** overlapping Shakespeare original-length windows as provisional *frequency-compatible* plaintext candidates. Those are the only survivors of the exact nine-chapter E/E+O bound among **602,736** complete 12,956-rune source windows across Shakespeare, Gibran, Emerson, and corrected Old English *Beowulf*.

A stronger **necessary-and-sufficient** test now evaluates the original ciphertext against every one of those 52 candidates. At each fixed source-visible state \((h,C_{i-1},b_i)\), an arbitrarily secret substitution table must implement a single **bijection** from original next-ciphertext rune to proposed plaintext rune. Thus two occurrences of the same original ciphertext rune in the same state must demand identical plaintext; different original ciphertext identities must demand distinct plaintext identities. Any consistent partial table could be extended to a full secret permutation, so this exact comparison tests **all 29! key choices simultaneously**, with no assumed alphabet ordering or cipher arithmetic.

**All 52 fail**: the CommonJS source-exact SFT exhibits a contradictory mapping for every one of them and asserts zero exact bijection-compatible source windows. Since the other **602,684** windows fail the earlier proven frequency ceilings, **zero of all 602,736** native source windows can be the plaintext of the complete original 12,956-rune manuscript under *any* chapter-static, previous ciphertext rune and printed word-boundary GP29 substitution tables. This is exhaustive **only for these four finite source corpora**. It does not exclude an unknown plaintext from other sources, a different language, a changing hidden state, independent page-reset keys, variable-length encodings, or an additional cipher layer.

The positive test independently constructs **522** secret 29-way permutations, one for each chapter×previous-cipher rune×printed word-start bit. It encrypts and recovers all **12,956 GP29 characters** of a native Shakespeare plant and passes precisely the same full original-length bijection-consistency test. This protects the original-cipher conclusion from a vacuous or incorrect consistency criterion. [Verified new full run](https://github.com/FlareZ123/liber-primus/actions/runs/43296504686).

## Cipher plant and next decision

The SFT instantiates both nine×29 secret predecessor-only alphabets and independent nine×29×2 alphabets for the stronger printed-boundary state, encrypting and recovering complete 12,956-rune GP-native plants. The stronger plant also passes the exact bijection-consistency inverse. The exact analytical capacity of this encrypted plant contains the planted source's E and E+O counts. The original manuscript does not satisfy the same criterion on the 89 selected native controls. The source-verified script also asserts all chapter counts, source texts, the corrected Old English control and the every-offset comparison results.

**Decision:** do not invest in discovering secret alphabet tables for a chapter-static previous-cipher-only GP rotor or its simple printed-word-bit extension without an independent, stronger original clue. More than a global word boundary is needed for a general decoder. A changing phase within chapters, genuine page reset, extra historical state, variable-length encoding or a different plaintext alphabet could escape these particular frequency constraints; the manuscript supplies no tested authenticated selector for those alternatives. Direct plaintext/key recovery remains the decisive objective. Existing [256-phase GP28 gate](lp2-chain256-allsecret-source-gate.md) and [word-boundary channel limits](lp2_boundary_single_escape_symbol_source_gate.md) concern other models and remain distinct.
