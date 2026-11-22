# Original p50 integer: conditional last-four-byte reconstruction and GP29 running-key gate

**Agent35, 22 November 2026. Exact extension of an already established p50 factorization and bounded original-cipher negative. No recovered unknown plaintext, historical key, cipher mechanism, or destination.** Reproducer: [`sims/lp2_p50_2013bit_factor_suffix_sft.cjs`](../sims/lp2_p50_2013bit_factor_suffix_sft.cjs).

## Why this was considered

The physical manuscript supplies a 256-token 32×8 numerical panel across pp49–51. A conventional base60 interpretation gives 256 byte values. The full 2048-bit integer `N`, its exact six-prime small-factor product and **2,013-bit composite quotient** had already been published in [the earlier original-grid factorization report](grid-bigint-factor-page53.md), under its integer-factor section. The same earlier report identifies physical p53's 179 runes and the factor `179²`. Those quantities are **pre-existing findings**, not new contributions here. This invocation tests a previously unrecorded *conditional uniqueness consequence* for the final four source bytes and one explicit quotient-based GP29 key consumer. The factor was selected retrospectively from the entire table; it is not an authenticated checksum instruction.

## Previously established factorization and its new conditional suffix consequence

The earlier report's source table bytes are pinned by SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Its **complete valuations at six small primes** are:

| Prime | Exact exponent |
| ---: | ---: |
| 2 | 4 |
| 3 | 3 |
| 7 | 1 |
| 13 | 1 |
| 29 | 1 |
| 179 | 2 |

As previously established, `N` is divisible by the product `F = 2⁴ × 3³ × 7 × 13 × 29 × 179² = 36,528,277,968`. The previously reported composite quotient `Q = N/F` has **exactly 2013 bits**. That bit length and its resonance with Cicada's earlier 2013 round were already documented. Neither is independent evidence of authorial intention.

Because `F > 2³²`, fixing `F` and the first 252 original bytes leaves *at most one* legal four-byte suffix that makes the complete `N` divisible by `F`. The exact residue equation is

`last4 = [−(prefix252 × 2³²)] mod F`.

It yields **`0xB424BD50`**, bytes **`[180,36,189,80]`**, exactly the original source's final four table cells. This is a mathematically correct **conditional suffix reconstruction**. It is **not an independently predicted checksum**: the factor `F` was assembled *after the entire 256-byte table was inspected*, including the suffix. The reconstruction therefore adds no independent evidence that the authors deliberately designed the factorization. A source-authenticated instruction independently selecting precisely these factors, their multiplicities and their order would be needed before a checksum claim could be promoted.

## Can the quotient reveal an existing rune key or plaintext?

Convert the 2013-bit quotient directly to **415 canonical base29 digits**, without fitting an offset or substitution. Compare the resulting sequence against all **12,956** original unknown GP29 runes, permitting exact contiguous matches across the book. Four simple fixed orientations were checked: forward, reverse, symbol negation modulo29, and reversal after negation. The **longest exact overlap is four runes in every orientation**. Thus the unmodified quotient is not a reusable long original-ciphertext segment under these four direct canonical projections, and there is no visible recovered GP29 plaintext or key in the quotient. This narrowly scoped negative does not rule out keyed transformations of the quotient, though nothing in the source currently selects one.

## Named pseudorandom running-key consumer: source-conditional rejection

The 2013-bit quotient might be a long integer seed for a widely available pseudorandom generator, rather than a readable text register. An **unselected**, finite follow-through tests Python 3's standard `random.Random(Q)` MT19937 seeding (including all 64 original seed limbs). The SFT first matches twelve independent Python 32-bit generator words and twenty independent `randrange(29)` and `floor(29*random())` outputs exactly; a mismatched PRNG implementation therefore cannot explain its negative result.

For the unchanged 12,956 source GP29 runes, test 36 explicit decoders: three GP29 samplers (`randrange(29)`, `floor(29*random())`, direct `getrandbits(32) % 29`), three clocks (continuous, page-reset, nine-chapter-reset), two additive signs, and original ciphertext versus predecessor-differenced ciphertext. The whole-book GP29 collision index starts at **0.0344783979** and all 36 outputs stay in **[0.034454, 0.034518]**, far below ordinary native-GP English. This is a restricted negative against this exact named PRNG consumer, **not** a general pseudorandom-key exclusion, and Python/MT19937 are not selected by any known original clue. Do not expand to unmotivated generator shopping.

## Decision

Preserve only the newly specified conditional suffix algebra and finite quotient-key rejection as an **extension of the established factorization**, without modifying `results/README.md` or claiming a decipherment. A productive successor requires either a first-party source that selects the factor product without looking at p50, or a **previously fixed reversible operation** that maps the quotient to at least one substantial unknown-page plaintext passage with independent holdout. Digging for more coincidental prime residues in `Q` or renaming its 2013-bit size as a key would not advance the cipher.
