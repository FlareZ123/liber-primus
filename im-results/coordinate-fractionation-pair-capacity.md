# Rectangular coordinate fractionation: all-secret original-source capacity exclusions

**Current decision, 10 November 2026.** Two independently specified, exactly reversible coordinate-mixing cipher architectures cannot produce any of the tested native-GP prose windows from original LP2 under the finite clocks below, regardless of how a completely unknown 28- or 30-symbol key square is populated. The exact bounds rule out entire key families without trying permutations. They neither recover unknown plaintext nor identify a Cicada key.

The two models test different source-level hypotheses:

- **28-symbol, nonrepeating GP-rank channel:** remove the 55 first runes on rune-bearing pages and treat each of the 86 printed identical-rune successors as a source-carried marker. The remaining **12,815 = 55 × 233** predecessor steps are 28-rank payloads in cyclic or sorted-deletion order. This does not assert that repeats actually mean plaintext GP-EA.
- **30-symbol, literal word-space channel:** parse the eight canonical unsolved sections as 29 runes plus one word-boundary token, collapsing multiple punctuation separators between adjacent words. The result has **12,956 runes + 2,888 word boundaries = 15,844 symbols**. This cipher hypothesis allows original spaces to be encrypted and to move; it does not presume they are plaintext spaces.

The original GP-rank source and solved-text normalizers are in the independently committed [canonical corpus](../resources/liber-primus/lp2-corpus.json), [physical-page parser](../sims/lp2_word_pages.cjs), [transcription](../resources/lp2-transcription.txt) and three reference sources under [resources/control](../resources/control/). The two self-contained Node scripts below read those files without editing them.

## Exact cipher family and all-key theorem

Let the unknown key be **any** bijection S from an alphabet of size q into an r-by-c rectangular grid, with r*c=q. A normal reversible coordinate fractionation takes the row of a plaintext symbol at position i and the column of another plaintext symbol at source-determined position i+shift, then translates the two coordinates back through the key. Consequently, its **exact inverse** is:

~~~
P[i] = S^-1( c * floor(S[Y[i]] / c)
             + (S[Y[j(i)]] mod c) )
~~~

Here Y is the observed ciphertext channel, and j(i) is the source position at fixed backward cyclic shift within each period block. All blocks use the same secret S. The mapping is lossless: columns are merely reallocated within each block, and the inverse restores them at the original positions.

For any particular plaintext value p, its row imposes that Y[i] lies in **exactly c** possible ciphertext labels; its column imposes that Y[j(i)] lies in **exactly r** possible ciphertext labels. Therefore **only q=c*r distinct ordered ciphertext pairs** could produce p. If F[a,b] counts the original observed pairs, then for every one of the q! possible key permutations:

~~~
count_plaintext(p) <= sum of the q largest values in F.
~~~

This is an exact key-independent necessary condition, albeit a deliberately generous one. The 28-register script uses it directly, allowing every possible 28-symbol rectangular orientation and key ordering.

For the source's natural **5×6 30-symbol alphabet**, the arbitrary ordered-pair top-30 bound is unnecessarily loose. The true rectangular key constrains a plaintext value to one fixed six-label row A and one fixed five-label column B. Define:

~~~
u[a] = sum of 5 largest counts in F[a, *]
v[b] = sum of 6 largest counts in F[*, b]

count_plaintext(p) <= min(
    sum of 6 largest u[a],
    sum of 5 largest v[b]
)
~~~

The two expressions independently relax the constraint that every row shares the *same* column set and every column shares the *same* row set. Their minimum is still an **upper bound for every one of 30! hidden keys**. Even an incorrect candidate key cannot evade these counts.

The theorem applies to stationary secret rectangles, with two ciphertext coordinates and exactly specified j(i). It also holds when the secret grid entries are chosen nonuniformly, when the plaintext has arbitrary letter order, and when the attacker knows none of the key. It makes no universal statement about dynamic grids, more taps or binary intermediates.

## Exhaustive finite original clocks

Every named test is evaluated on all original symbols, with no key fitting. Two reset clocks are allowed: continuous across the book or restarted independently at each physical rune-bearing page (28 register), or each of the eight canonical sections (30 register). The clock period is one of the listed values, and the column shift is nonzero modulo its period. Equivalent shifts that reduce to the same residue within a period are counted once. The final partial block at a reset boundary wraps cyclically within its own actual length.

| Register | Periods | Proposed shifts, reduced modulo each period | Exact original variants |
| --- | --- | --- | ---: |
| GP28 predecessor ranks, both cyclic and sorted | 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 14, 16, 17, 23, 28, 29, 32, 41, 55, 79, 128, 233, 256, 466 | 1, 2, 3, 5, 7, 11; skip zero | **492** |
| GP29 plus literal word space, fixed 5×6 grid | 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 23, 28, 29, 30, 32, 41, 55, 79, 128, 233, 256, 466 | 1, 2, 3, 5, 7, 11; skip zero | **280** |

There is no p-value and no claim that these parameters were selected before looking at original LP2. Each inequality is a deterministic falsification of the *specified mathematical family* for the reference plaintext windows.

### Original 28-symbol channel

Among all **492** original rank-channel variants, the largest upper bound on the count of the most frequent decoded plaintext rune is **766 out of 12,815**. Its generous maximum occurs for cyclic predecessor ranks, page-local reset, period16 and shift2. The minimum bound is **689**, at sorted ranks with book-global period17, shift11.

For every length-12,815 contiguous native-GP source window with GP-EA omitted, compute the frequency of the most common rune. The exact minimum among the three independently archived sources is **1,393**. Therefore no secret rectangular grid and no shift/period from the tested list can generate any of these original source windows, irrespective of all 28! possible key placements.

A source-native secret-grid positive used a 4×7 grid, period7, shift1 and 12,815 genuine Shakespeare GP28 symbols. It recovered **12,815/12,815** plaintext symbols exactly, retained **55** independently carried first-page symbols and **86** source-specified adjacent-repeat sites, and re-encrypted **12,956/12,956** synthetic source-layout GP29 ciphertext positions exactly. Its authentic most-frequent plaintext symbol appeared **1,488** times; the same pair-bound correctly allowed at least **2,632** occurrences. This validates the direction and power of the original-input capacity test under a true specimen of the proposed family. Re-encryption itself is an implementation invariant, not an authentic-key witness.

- [Executable all-secret original GP28 proof and synthetic-key reproducer](../sims/gp28_coordinate_fractionation_gate.cjs)
- [Successful Windows Node 22 manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42853693057)

### Original 30-symbol GP-plus-space channel

The separate 30-symbol parser recovers eight section lengths **886, 1,399, 2,122, 2,328, 1,244, 1,758, 2,057, 4,050**. The exact section total is **15,844**, including **2,888** single word-space tokens. The all-secret 5×6 row/column upper bounds for **280** tested clocks lie between **1,440 and 1,867 occurrences** of any one plaintext symbol. The generous maximum is book-global period15, shift11, where independently relaxed row and column bounds are **1,882 and 1,867** respectively. A looser top30-pairs-only test gives **3,070** for that case and sometimes admits source controls, demonstrating why the rectangular row/column constraint matters.

The source-native GP-plus-space windows have the following *exact* minimum maximum-symbol counts. The most frequent token in the relevant control windows is the word-space marker; it is permitted to move during encryption.

| Source corpus | GP29+space symbols | All complete length-15,844 windows | Lowest count of the most frequent symbol |
| --- | ---: | ---: | ---: |
| Shakespeare | 274,206 | 258,363 | **3,113** |
| Gibran | 78,846 | 63,003 | **2,729** |
| Emerson | 402,561 | 386,718 | **2,729** |
| **Combined** | | **708,084** | **≥2,729** |

The original maximum permitted count **1,867** is below the **2,729** minimum among every tested source window. Thus every one of the **280** tested secret 5×6 fractionations is excluded as a direct source-native GP29-plus-word-space encoding. No secret key search can change the inequality.

For a true source-native control, the program generated an entirely hidden random 30-symbol 5×6 grid and encrypted **15,844** contiguous source symbols in eight original-sized sections with period15, shift11. The matching inverse recovered **15,844/15,844** source symbols and re-encrypted the entire generated ciphertext. The control's most common plaintext token occurred **3,178** times, and the original-input bound correctly admitted at least **3,537**. This checks that the negative original-source gate can accept an actual member of its hypothesized family.

- [Executable all-secret original 5×6 proof and source-native control](../sims/gp30_space_fractionation_gate.cjs)
- [Successful Windows Node 22 manual CI; both proofs](https://github.com/FlareZ123/liber-primus/actions/runs/42854616898)

## Consequence for future work

Rectangular coordinate transposition is a reversible way to mix source symbols with distinct neighbor coordinates, and it is more general than a fixed substitution at each position. Nevertheless, its fixed-grid version cannot plausibly explain the original source's nearly uniform rune distributions while yielding native-GP prose of the three tested reference forms under these clocks. A future proposal must specify a materially different original-source architecture such as a changing hidden grid, stronger multi-position mixing, a genuinely independent state/key derivation, an alternative alphabet or an encoded binary intermediary. Directly enumerating more 28!/30! secret keys within these declared fixed-grid settings has no research value.

**Claim boundary:** These exact calculations exclude finite, direct-source GP-prose families. They do not reveal even one authentic unknown original LP2 plaintext rune, historical cipher key or final destination. The 28-channel marker reading, the 30-channel encrypted-space reading, the choice of rectangle and the period list remain hypothetical interpretations of the manuscript.
