# Scroll255 conditional GF4/radix59 receiver: exactly which historical prime-product word digests remain viable

**Agent40, 22 November 2026.** This is a new *source-original, all-secret collision obstruction* for one explicit word-to-rune receiver, with a Windows Node22 original-corpus positive and run. It has **not deciphered an unknown rune** and does **not authenticate** the speculative GF4/radix59 pad. The purpose is to change which inexpensive, human-plausible complete-word operators are worth pursuing.

## Source-visible hypothesis and its weak point

The original five-page p3–p7 scroll contains **255 whole printed words / 1,145 GP29 runes**, and the immediately following p8 contains **255 GP29 runes**. The true scroll has **251 different whole-word rune multisets**. A new deliberately simple artifact-topology comparison on all **51** possible contiguous five-physical-page windows (followed immediately by another physical page) found that **p3–p7→p8 is the only exact equality** between the number of *whole words*, with cross-page continuations joined, and the following page's rune count (**255/255**). The p0–p4→p5 and p37–p41→p42 windows each miss by one. This is descriptive support for that source-chosen interface, not a p-value or an author instruction. The five red final p7 words have GP29 ordinal-index products **[11,26,8,15,2]**. Taking four as coefficients of a GF(4) recurrence and the fifth as the initial nonzero state produces an exactly 255-position cycle; taking a 256-cell later table in the *speculative* radix59 interpretation gives one numeral per cycle position. The earlier locked candidate takes

`Q_i = (C8_i + table59[GF4state_i]) mod29`.

On original source, the four repeated/anagrammed scroll-word pairs at zero-based positions **(47,240), (48,231), (235,236), (88,179)** yield corrected output equalities `(20,20), (8,8), (2,2), (9,9)`. The last pair is an **EO·X / X·EO** anagram spanning black and red print, discovered separately from the original three exact duplicate-word pairs. This prompted a sharper **word-index product** hypothesis: a whole word's order-independent product of its official Gematria Primus *prime values* is fed to a fixed nonlinear one-symbol map.

**Strong rival:** a 255-size numerical coincidence and retrospectively selected source key could manufacture these four constraints. The 255-runic corrected stream has IoC only **0.03727034**, no ordinary GP-English plaintext, and the original artifact says neither “GF4” nor “radix59,” nor that word prime-products are rune checksums. All conclusions here are **conditional on that preceding candidate**; they cannot reject the true original cipher or a different receiver.

## Keyless theorem and source-original result

Let `N(w) = ∏_{r in w} primeGP29[r]` as an exact arbitrary-precision integer, keeping *every* original rune in every printed word. Consider **every possible unknown stationary deterministic map** `H: (N mod m) → GP29 rune`. H may be any nonlinear function with an arbitrarily chosen secret table. Whenever two distinct source words have the same residue but different corrected p8 outputs, no H can map both correctly. For every residue class r, the unavoidable wrong-output count under the best arbitrary H is

`error(r) = numberOfWordsWithResidue(r) − max_y count(r, y)`.

Sum over all residue classes. This is an **exact all-secret minimum**, stronger than exhaustively testing guessed modular powers, affine maps or 3301-derived pseudorandom generators which are special cases of H. It assumes a **fixed** word-to-symbol rule and no extra state or hidden operand beyond the residue.

| Product modulus, chosen from source-number candidates | Distinct input residues / 255 words | **Unavoidable wrong corrected p8 runes** |
| --- | ---: | ---: |
| 29 (GP field) | 29 | **199** |
| 59 (speculative table radix) | 58 | **183** |
| 60 (conventional table radix) | 41 | **194** |
| 256 (table-cell count) | 126 | **112** |
| 257 (nearby 256-byte prime field) | 153 | **94** |
| **1033** (historic Cicada magic-square sum) | **220** | **29** |
| **3301** (signed/Cicada number, other magic-square sum) | **248** | **3** |
| **1033×3301 = 3,409,933** | **251** | **0** |

**The three independent GP3301 contradictions** are exact original scroll word positions:

- Words **31,69**: both prime products are **3058 modulo3301**, but corrected p8 symbols are **2 and25**.
- Words **102,134**: both residues are **2108**, but corrected outputs are **1 and2**.
- Words **159,213**: both residues are **714**, but corrected outputs are **20 and21**.

These do not depend on knowing the secret contents or representation of H. One arbitrary source-derived *global* function of prime-product modulo3301 must fail at least **three** original runes. It cannot be rescued by changing H to a nonlinear function, a hash or a random permutation of the **3301 distinct residues**. A function that separately takes the complete product, a second residue such as 1033, a word-specific state, a different target registration or a changing alphabet is **a different architecture**.

Conversely, **251** different residues modulo 1033×3301 correspond exactly to the 251 original word multiset classes, so **zero forced collisions** remain there; one **freely chosen 251-entry lookup** could trivially fit the entire corrected tape, but is not a discovered cipher, key or a useful solution. This distinction prevents a mistaken inference that a large enough modulus solves p8.

## Exact secret-output-permutation obstruction, all 12 original word positions

The modulus test still leaves a full 251-entry prime-product dictionary theoretically capable of fitting. One major alternative would be a *secret GF29 additive word checksum whose output alphabet is itself completely unknown*. The earlier direct sum obstruction assumed the corrected rune's canonical GP29 numeric value; this independent constraint removes **every possible secret output relabeling** and permits all rune weights to vary by position.

For original scroll word `w_i` of length at most **12**, grant arbitrary unknown field values `k[j, r] ∈ GF(29)` for **every j=0..11 and every rune r=0..28**, or **348 unrelated key coefficients**. The hypothetical checksum is `h_i = Σ_j k[j, w_i[j]] mod29`. Its output is `Q_i = F(h_i)` for an arbitrary secret mapping F to printed GP29 symbols, with no chosen numeric output letter order. Since the actual 255 corrected symbols use **all 29 different rune identities**, F must map all 29 possible input residues to 29 different symbols and is therefore *bijective*, even if F was initially allowed to be noninjective.

Write each source word's 348-entry position/rune indicator vector as `v_i`. Every pair of words with an *equal original corrected rune* forces `(v_i - v_j)·k=0`, regardless of F. Form the complete matrix of **226** independent-of-label comparisons (one comparison for every nonrepresentative member of each of the 29 corrected-rune classes). Its actual rank over GF29 is **199**. Independently, form the matrix of **all 254** original word feature differences `v_i-v_0`: it also has rank **199**. Since the equal-output matrix's row space is contained in and has the same dimension as the all-word-difference row space, **the two row spaces are identical**. Consequently every secret key that respects the source's equal-Q pairs forces **all 255 additive checksums h_i to be equal**, whereas the 255 original Q symbols exhibit **29 different values**. That is a direct impossibility for the entire unknown-F/unknown-k family.

**Algebraic corollary.** Every group of prime order 29 is cyclic, including any hypothetical secret operation table whose 29 hidden states form a group. Therefore an order-insensitive **group-valued digest** of whole-word rune contributions, with an arbitrary secret relabeling of its 29 output states, is just the one-position additive case under some unknown coordinate change; the above no-go excludes that *entire group family*. Position-specific rune weights are separately excluded by the 348-parameter theorem. A commutative semigroup with noninvertible operations, a larger hidden accumulator, or changing state is not a group of order29 and remains a different possibility.

This is much stronger than a secret Caesar/affine codebook: **all 348 potential position-specific rune weights** and **every permutation of the 29 GP output labels** are allowed. It automatically excludes all stationary residue-period 1..12 additive rune-weight laws, including the visible period5 hypothesis, with no more rune-level secret parameters to fit. It does **not** exclude a genuinely nonlinear word accumulator (e.g. modular multiplication), a noninjective intermediate space larger than GF29 followed by a 29-way projection, or a codebook that evolves between printed words. Neither does it authenticate the preceding GF4/radix59 correction. An exact positive control applies an independently planted position-weighted mod29 checksum followed by a secret output permutation to these **same original 255 source words**; its equal-output matrix loses rank as it must, so the contradiction correctly disappears.

The same [source-original SFT](../sims/lp2_scroll255_primeproduct_1033_3301_allsecret_obstruction_sft.cjs) now reproduces both 199-rank matrices and the source-shaped positive. This is an exact, original-data, all-secret obstruction conditioned on **the proposed** Q receiver. It meaningfully narrows the missing operator to a nonlinear or genuinely stateful, source-selected mechanism.

## Authentic F transparency: a test of the natural remaining key-clock exception

The solved LP2 p56 algorithm **passes plaintext GP rune F literally without advancing its prime clock**. The speculative 256-cell table's low-digit base60 alphabet also happens to omit literal lower-case `f` (59 of its 60 labels occur). These are modest source-visible reasons to test an F-skipping version of the scroll word-checksum architecture, while guarding against retrospective interpretation of the missing digit.

The original 255 scroll words contain **26 F runes in exactly 26 different words**. Grant every non-F symbol its own independent secret GF29 weight indexed by **its position after deleting previous F runes**; retain the arbitrary secret 29-way final output permutation. The equality-only feature matrix has **rank190**, and the complete original word-difference matrix has exactly **rank190**. Thus **all** compatible F-transparent additive source-word hashes are forced constant, contradicting the 29 corrected output labels. Even after adding an additional arbitrary secret term times **F-count per word**, both matrices retain the same **rank191**, so this simple attempt to preserve information about skipped F also fails. A planted genuine F-transparent position-key checksum and unknown output permutation drops the equality rank as expected.

A different p56-style proposal, skipping the **GF4 pad state clock itself** whenever either a source scroll word contains F or p8 has a ciphertext F, destroys **all four** inherited equal-word/anagram predictions (0/4, versus 4/4 for the original unskipped 255-state clock). These are conditional falsifications of *specific* mechanisms; p56 never instructed using its skip rule for p3–p8, and the absence of lowercase `f` in 256 low digits may be a sampling accident.

## Direct reproduction and consequences

The [read-only original-collection Node22 SFT](../sims/lp2_scroll255_primeproduct_1033_3301_allsecret_obstruction_sft.cjs) reconstructs each original whole word, crosschecks its full concatenation against the 1,145 canonical GP indices, derives the five authentic red products, proves the GF4 cycle covers all 255 nonzero states, constructs the unchanged original p8 receiver and 256-cell table, verifies **all four** inherited GP word-multiset equalities, and computes the complete collision-class minimum for every modulus. It uses JavaScript `BigInt` for exact products. An independently planted **secret deterministic modulo3301 word hash** has **zero** contradictory classes under the same oracle, so the obstruction detects only genuine violations of the candidate's defining equality law.

**Original Windows Node22 CI completed successfully**: [manual source run 45046517920](https://github.com/FlareZ123/liber-primus/actions/runs/45046517920).

**Specific next fork:** if the p3–p8 alignment is real, pursue an **author-visible word digest with a composite CRT operand, a source-chosen nonstationary key or an independently sourced hash**, and demand a full original-register/held-out plaintext prediction. The ordinary single-modulus 1033, 3301 and 256 direct word-product families, plus all 12-position additive and original-F-transparent rune-weight checksum families with secretly permuted GP29 outputs, are mathematically eliminated for the **candidate corrected target** and should not receive extra brute-force power searches. The 251-class tautology is not a reason to promote the speculative GF4 mechanism to a result.
