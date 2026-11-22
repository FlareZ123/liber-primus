# Original p50 256-byte integer: complete small-factor suffix gate

**Agent35, 22 November 2026. Intermediate algebraic observation and negative original-cipher reuse test. No recovered unknown plaintext, historical key, cipher mechanism, or destination.** Reproducer: [`sims/lp2_p50_2013bit_factor_suffix_sft.cjs`](../sims/lp2_p50_2013bit_factor_suffix_sft.cjs).

## Why this was considered

The physical manuscript supplies a 256-token 32×8 numerical panel across pp49–51. A conventional base60 interpretation gives 256 byte values. Earlier independent work found that the resulting 2048-bit big-endian integer `N` has the unusual source-related factor `179²`, with physical p53 containing 179 runes, and independently noticed a further factor29 (the size of the GP alphabet). The source's earlier cleartext prime/totient lesson makes a **finite factorization read** a reasonable experiment, with a much stronger condition than matching stray decimal residues. What follows is a factorization noticed while inspecting the original integer. It is **retrospective**; the creator did not specify the factor product or a checksum instruction.

## Exact calculation, using original source order

The source table bytes are pinned by SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Its **complete valuations at six small primes** are:

| Prime | Exact exponent |
| ---: | ---: |
| 2 | 4 |
| 3 | 3 |
| 7 | 1 |
| 13 | 1 |
| 29 | 1 |
| 179 | 2 |

Consequently `N` is divisible by the product `F = 2⁴ × 3³ × 7 × 13 × 29 × 179² = 36,528,277,968`. The quotient `Q = N/F` has **exactly 2013 bits**, although its primality test fails. The numerical equality of this bit length with the puzzle's earlier 2013 round is an observation, **not** evidence of historical intention.

Because `F > 2³²`, fixing `F` and the first 252 original bytes leaves *at most one* legal four-byte suffix that makes the complete `N` divisible by `F`. The exact residue equation is

`last4 = [−(prefix252 × 2³²)] mod F`.

It yields **`0xB424BD50`**, bytes **`[180,36,189,80]`**, exactly the original source's final four table cells. This is a mathematically correct **conditional suffix reconstruction**. It is **not an independently predicted checksum**: the factor `F` was assembled *after the entire 256-byte table was inspected*, including the suffix. The reconstruction therefore adds no independent evidence that the authors deliberately designed the factorization. A source-authenticated instruction independently selecting precisely these factors, their multiplicities and their order would be needed before a checksum claim could be promoted.

## Can the quotient reveal an existing rune key or plaintext?

Convert the 2013-bit quotient directly to **415 canonical base29 digits**, without fitting an offset or substitution. Compare the resulting sequence against all **12,956** original unknown GP29 runes, permitting exact contiguous matches across the book. Four simple fixed orientations were checked: forward, reverse, symbol negation modulo29, and reversal after negation. The **longest exact overlap is four runes in every orientation**. Thus the unmodified quotient is not a reusable long original-ciphertext segment under these four direct canonical projections, and there is no visible recovered GP29 plaintext or key in the quotient. This narrowly scoped negative does not rule out keyed transformations of the quotient, though nothing in the source currently selects one.

## Decision

Preserve the exact factor identity and the reproducible four-byte algebra as a *source candidate*, without modifying `results/README.md` or claiming a decipherment. A productive successor requires either a first-party source that selects the factor product without looking at p50, or a **previously fixed reversible operation** that maps the quotient to at least one substantial unknown-page plaintext passage with independent holdout. Digging for more coincidental prime residues in `Q` or renaming its 2013-bit size as a key would not advance the cipher.
