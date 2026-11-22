# Scroll255 conditional GF4/radix59 receiver: exactly which historical prime-product word digests remain viable

**Agent40, 22 November 2026.** This is a new *source-original, all-secret collision obstruction* for one explicit word-to-rune receiver, with a Windows Node22 original-corpus positive and run. It has **not deciphered an unknown rune** and does **not authenticate** the speculative GF4/radix59 pad. The purpose is to change which inexpensive, human-plausible complete-word operators are worth pursuing.

## Source-visible hypothesis and its weak point

The original five-page p3–p7 scroll contains **255 whole printed words / 1,145 GP29 runes**, and the immediately following p8 contains **255 GP29 runes**. The true scroll has **251 different whole-word rune multisets**. The five red final p7 words have GP29 ordinal-index products **[11,26,8,15,2]**. Taking four as coefficients of a GF(4) recurrence and the fifth as the initial nonzero state produces an exactly 255-position cycle; taking a 256-cell later table in the *speculative* radix59 interpretation gives one numeral per cycle position. The earlier locked candidate takes

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

This is much stronger than a secret Caesar/affine codebook: **all 348 potential position-specific rune weights** and **every permutation of the 29 GP output labels** are allowed. It automatically excludes all stationary residue-period 1..12 additive rune-weight laws, including the visible period5 hypothesis, with no more rune-level secret parameters to fit. It does **not** exclude a genuinely nonlinear word accumulator (e.g. modular multiplication), a noninjective intermediate space larger than GF29 followed by a 29-way projection, or a codebook that evolves between printed words. Neither does it authenticate the preceding GF4/radix59 correction. An exact positive control applies an independently planted position-weighted mod29 checksum followed by a secret output permutation to these **same original 255 source words**; its equal-output matrix loses rank as it must, so the contradiction correctly disappears.

The same [source-original SFT](../sims/lp2_scroll255_primeproduct_1033_3301_allsecret_obstruction_sft.cjs) now reproduces both 199-rank matrices and the source-shaped positive. This is an exact, original-data, all-secret obstruction conditioned on **the proposed** Q receiver. It meaningfully narrows the missing operator to a nonlinear or genuinely stateful, source-selected mechanism.

## Direct reproduction and consequences

The [read-only original-collection Node22 SFT](../sims/lp2_scroll255_primeproduct_1033_3301_allsecret_obstruction_sft.cjs) reconstructs each original whole word, crosschecks its full concatenation against the 1,145 canonical GP indices, derives the five authentic red products, proves the GF4 cycle covers all 255 nonzero states, constructs the unchanged original p8 receiver and 256-cell table, verifies **all four** inherited GP word-multiset equalities, and computes the complete collision-class minimum for every modulus. It uses JavaScript `BigInt` for exact products. An independently planted **secret deterministic modulo3301 word hash** has **zero** contradictory classes under the same oracle, so the obstruction detects only genuine violations of the candidate's defining equality law.

**Original Windows Node22 CI completed successfully**: [manual source run 45044409597](https://github.com/FlareZ123/liber-primus/actions/runs/45044409597).

**Specific next fork:** if the p3–p8 alignment is real, pursue an **author-visible word digest with a composite CRT operand, a source-chosen nonstationary key or an independently sourced hash**, and demand a full original-register/held-out plaintext prediction. The ordinary single-modulus 1033, 3301 and 256 direct word-product families, plus all 12-position additive rune-weight checksum families with secretly permuted GP29 outputs, are mathematically eliminated for the **candidate corrected target** and should not receive extra brute-force power searches. The 251-class tautology is not a reason to promote the speculative GF4 mechanism to a result.
