# Original LP2 printed-word BASE29 multiplication: key-independent terminal-digit obstruction

**Agent 31, 11 November 2026. Bounded original-cipher negative, independently executed on GitHub Actions. No unknown LP2 plaintext, authentic key, complete cipher or final destination recovered.** This study retires a precisely defined reversible whole-word numeric architecture, including any unknown global, start-page, word-length, or start-page-by-length-specific unit multiplier. It does not rule out position-dependent or word-specific keys, changes to the original word segmentation, transport layers or non-integer operations.

## Human-visible premise and weakest link

The authenticated 26 January 2013 Cicada TCP challenge contains a worked **BASE29(3301) = 3QO** numeral conversion. The 2016 signed instruction mentions the words, meaning and numbers of Liber Primus; LP2 prints a 29-rune alphabet and visible word delimiters. One simple, reversible extension is to regard each **complete printed word** as an integer in base 29 and multiply it by a constant integer unit modulo **29^L**, where L is that word's rune length. Under the direct source candidate, the constant is 3301, which is coprime to 29.

The decisive missing source instruction is whether a creator ever meant to treat *whole LP2 words as radix-29 integers*, use the GP rune order as the numeric digit order, apply multiplication, or preserve plaintext word boundaries. The signed 2013 command demonstrates numeric conversion of a supplied decimal operand. It does **not** authenticate this proposed LP2 cipher. This is therefore a finite source-motivated attack, not an independently established historical mechanism.

## Reversible original-cipher contract

For a word with GP29 symbols d0,...,d(L−1), use the repository's canonical rune indices 0..28 and preserve each original word's length. Two possible positional orientations are predeclared:

- **MSD-first:** V = sum of d_i × 29^(L−1−i), with the rightmost rune as the least-significant digit.
- **LSD-first:** V = sum of d_i × 29^i, with the leftmost rune as the least-significant digit.

For an integer unit k with gcd(k,29)=1, encode a word by C = k×V mod29^L, unpacking exactly L digits; decode by V = k⁻¹×C mod29^L. The modulus retains leading zeroes and makes the operation a true bijection on every fixed-length word. No ciphertext rune is discarded. For the direct signed-number candidate, k=3301. Both multiply/divide directions and the two positional orientations were frozen before scoring.

**Exact key-independent invariant:** for every such word, the output least-significant digit equals (k mod29)×the input least-significant digit mod29. Multiplication by a fixed unit is a permutation of GP29 identities, so *all equalities across least-significant word-edge symbols are preserved*, even if k is secret. If a different fixed unit is permitted for every start page, word length or start-page-by-length group, the same equality statistic is preserved **within the corresponding group**. The arithmetic works for each length L because each invertible k modulo 29^L induces a permutation of the word-edge digit modulo29. More generally, the same obstruction applies to any *compatible bijective 29-adic word transform* whose reduction modulo29 is a fixed permutation within the indicated groups, even if its higher digits involve nonlinear carries. It does **not** apply to arbitrary whole-word permutations whose low digit depends on higher digits. These facts require no key enumeration, language scoring or plaintext guess.

A full manuscript candidate must explain original plaintext word placement, so the contract uses the repository's canonical 2,896 printed rune words / 12,956 runes, including 32 words crossing pages. A cross-page word is assigned to its original start page for the page-key test; line and page wraps do not split a word.

## Original source observations

The test measures an ordered-pair collision index over one endpoint from each printed word. A numerator counts sum over symbols n(n−1), and the denominator is either N(N−1) globally or the sum of n_page(n_page−1) for start-page groups. The table provides the exact original integer counts.

| Lowest-order digit alignment | Key domain | Equal ordered pairs | Ordered pairs total | Collision rate |
| --- | --- | ---: | ---: | ---: |
| Leftmost rune (LSD-first) | Whole book | 288,592 | 8,383,920 | **0.034422084180** |
| Leftmost rune (LSD-first) | Separate start-page keys | 5,456 | 158,938 | **0.034327851112** |
| Rightmost rune (MSD-first) | Whole book | 289,624 | 8,383,920 | **0.034545176958** |
| Rightmost rune (MSD-first) | Separate start-page keys | 5,266 | 158,938 | **0.033132416414** |

Both endpoints are essentially uniform at the 29-rune level. Fixed bijections cannot change this property at the protected word edge.

## Stronger secret-key allowance: independent keys by word length and page × length

The most direct escape from the first gate is to change the multiplier when word length changes. For an arbitrary secret unit `k_L` for each distinct L, compare endpoint symbols only *between words of that length*; for an even stronger class, allow `k_{page,L}` to be chosen separately for each original start page and word length. These are **all-secret key-independent constraints**, with no enumeration of keys. Singleton words remain distinct cipher symbols under an invertible multiplier regardless of its value.

| Protected endpoint | Secret key domain | Original equal ordered pairs | Original ordered pairs total | Original collision rate |
| --- | --- | ---: | ---: | ---: |
| Leftmost rune | One key per word length | 42,462 | 1,233,444 | **0.034425560** |
| Rightmost rune | One key per word length | 42,606 | 1,233,444 | **0.034542306** |
| Leftmost rune | One key per start page × word length | 788 | 23,216 | **0.033942109** |
| Rightmost rune | One key per start page × word length | 750 | 23,216 | **0.032305307** |

Length-matched native GP-English controls in the same four independent source sets show much larger collision indices even after allowing these fine key domains:

| Native source | Mean leftmost, length keys | Mean rightmost, length keys | Mean leftmost, page × length | Mean rightmost, page × length |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 0.089874 | 0.126475 | 0.089791 | 0.126459 |
| Gibran | 0.117586 | 0.133789 | 0.117674 | 0.133675 |
| Emerson | 0.113185 | 0.135924 | 0.112992 | 0.135936 |
| Solved LP1 | 0.111970 | 0.133622 | 0.112214 | 0.133587 |
| **Actual LP2** | **0.034426** | **0.034542** | **0.033942** | **0.032305** |

For **all sixteen** additional source/endpoint/domain comparisons, **0/200** finite matched controls reach the original rate. The least-separating empirical lower tail still has an add-one estimate 1/201 per comparison. The same native-language positive plant preserves each exact length-key and page × length-key collision count. Under the direct plaintext-word/English assumption, even per-(page,length) secret key selection cannot rescue this arithmetic model.

**Concrete original-source witness:** the **83** printed one-rune words span **28 distinct rune symbols** book-wide. Physical page **17** alone contains five one-rune words with five different symbols `B, EA, I, T, R`; page19 and page28 each contain four distinct singleton glyphs. Even a unique multiplier for each page and word length must preserve that per-domain diversity. Standard native English has only a tiny one-letter-word inventory (usually A and I, with O in archaic usage). This supports the groupwise contradiction without depending on long-string language scores. It remains conditional on these being genuine plaintext single-letter words and on direct GP29 alphabet encoding.

## Independent native GP-English controls

Reference Latin prose is encoded with the same longest-token GP29 transliteration used by the existing native source tools, including QU→CW, V→U, K→C, Z→S. Each of **200 deterministic, independent length-matched manuscripts per source** samples an authentic reference word with replacement for every one of the 2,896 original word positions. Original GP word lengths, start pages and total rune count remain fixed. The reproducible xorshift32 seed for each source is 0x3301a5f0 + 2 + source index. Source vocabularies: Shakespeare 55,407 words, Gibran 15,733, Emerson 77,932, solved LP1 reference 904. Every source contains every required original rune-word length.

| Source control | Mean leftmost global index | Mean leftmost page index | Mean rightmost global index | Mean rightmost page index |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 0.056280 | 0.056173 | 0.094868 | 0.094399 |
| Gibran | 0.059570 | 0.059606 | 0.091260 | 0.090989 |
| Emerson | 0.062973 | 0.063016 | 0.099843 | 0.099513 |
| Solved LP1 reference | 0.060803 | 0.060838 | 0.093426 | 0.093314 |
| **Original LP2** | **0.034422** | **0.034328** | **0.034545** | **0.033132** |

For all four endpoint/domain statistics, **zero of 200 controls from each of the four independent sources is as low as the original**. Each source's individual one-sided add-one tail estimate is therefore 1/201≈0.004975 at the 200-sample resolution. The 16 control groups are not independent hypothesis tests and must not be treated as one pooled p-value.

A synthetic native-language source plant encodes all 12,956 GP29 runes wordwise using **k=3301** in both orientations. Both exact modular inverses recover 12,956/12,956 original planted runes. The protected endpoint collision counts match *exactly* before and after encryption for both global and start-page-grouped variants, demonstrating that the test actually detects the necessary invariant.

## Literal 3301 inverse

Directly interpreting the source operand 3301 as the multiplier or its inverse fails on the authentic unknown ciphertext. The source-wide GP29 rune index of coincidence is **0.034478398** before transformation. The four complete 12,956-rune outputs remain near the 1/29 random-register level:

| Digit orientation | On ciphertext | Result GP29 IoC |
| --- | --- | ---: |
| MSD-first | Divide by 3301 | 0.034499 |
| MSD-first | Multiply by 3301 | 0.034451 |
| LSD-first | Divide by 3301 | 0.034500 |
| LSD-first | Multiply by 3301 | 0.034447 |

Neither direct orientation yields coherent GP29 plaintext. The **key-independent protected-edge collision obstruction** is the more general result: changing the fixed multiplier, even allowing one independent multiplier for each start-page/word-length group, cannot repair the strong native/plaintext discrepancy without violating the model.

## Decision and reproducibility

The exact source-rooted wordwise unit-multiplication model is a **conditional negative** under direct GP-English, original plaintext word boundaries and an independently chosen constant multiplier globally, per start page, per word length, or per start-page/length group. The model's invertibility, positive plant and frozen original-input outputs are independently implemented and executed in [the standalone CJS SFT](../sims/lp2_word_base29_unit_invariant_sft.cjs), through the existing manual-only [word-length workflow](../.github/workflows/manual-word-length-probe.yml) (scan_mode=base29-unit), **[successful expanded run 43067212117](https://github.com/FlareZ123/liber-primus/actions/runs/43067212117)** (initial four-group control also [passed](https://github.com/FlareZ123/liber-primus/actions/runs/43065874794)). No new auto-triggering workflow was created.

This is distinct from the [noninjective original word-to-byte/p50 lookup](lp2-wordwise-base29-p50-byte-gate.md), the [word-as-address grammar test](lp2-base29-original-word-address-gate.md), and the [per-word substitution equality-pattern gate](lp2-wordwise-bijection-pattern-gate.md). Those do not test the arithmetic carries and protected least-significant digit of this reversible 29-adic multiplication.

**Follow-on requirement:** reopen this exact family only with an independently original-source-selected operation that changes the protected digit's key domain, replaces source word segmentation or specifies a nontrivial state/transport layer and makes a novel original-cipher prediction. Do not rescue the rejection by picking another constant k or reversing direction/word order.
