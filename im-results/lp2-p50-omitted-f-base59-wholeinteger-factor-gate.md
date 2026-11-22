# LP2 p49–51 dual-radix integer: a distinct omitted-f prime-factor register

**Agent6, 22 November 2026. Intermediate original-input mathematical finding, no unknown plaintext, authentic key, or final URL.** This adds a genuinely different numeral interpretation to the existing canonical-base60 whole-integer factor work. The new base59 small-prime valuation is exact; a creator-intended interpretation remains unestablished.

## Source-selected operands and two mathematical readings

The physical LP2 pages p49–51 display **256 ordered, two-character alphanumeric cells** in a 32×8 table. Their established ordinary interpretation is the 60-digit alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, yielding the original 256 bytes `b60[i]`. The same physical tokens never use lowercase `f`, whose conventional base60 digit value is **41**. Consequently deleting precisely that absent character produces a second, unambiguous, **59-character** digit alphabet and a different 256-byte sequence `b59[i]`. This alternate alphabet is a *hypothesis*, not an authenticated Cicada instruction.

Because all printed high digits are 0–4 and all low digits avoid `f`, a complete exact relation holds at each **unaltered source token**:

`b59[i] = b60[i] − floor(b60[i] / 60) − 1[(b60[i] mod 60) > 41]`.

For each convention interpret its 256 source-ordered byte values as **one unsigned, 2048-bit, big-endian integer**, `N60` and `N59` respectively. No sorting, transposition, guessed phase, key or rune changes enter either number.

## Exact new result and contrast with established base60 data

| Source integer | All prime powers of factors <= 1,000,000 | Complete small-factor product | Quotient size |
| --- | --- | ---: | ---: |
| Canonical **base60** `N60` (previously established) | 2⁴ · 3³ · 7 · 13 · 29 · 179² | **36,528,277,968** | **2013 bits** |
| Omitted-f **base59** `N59` (**new**) | 3² · **41 · 61 · 109** | **2,453,481** | **2027 bits** |

The base59 integer is divisible by `9×41×61×109`, with each listed prime valuation exact. Its remaining 2027-bit cofactor has no prime divisor at most one million under the stated trial division. The base60 row-major source and its known 2013-bit cofactor are unchanged; this report **does not** independently rediscover them.

The factor **41** is also the source-observed omitted digit's *ordinary base60 value*. Factor **109** is the 29th published Gematria Primus prime. **61** divides the historical year number 2013. These are possible human-puzzle associations, encountered while **inspecting a factored whole integer**, so none independently authenticates radix59, a keyed operation, or a readable plaintext. The same care applies to the previously recognized 179²/base60 association. The two factor sets are **not** two independent source-selected checksums; they use the same 256 original tokens and a postselected family of arithmetic tests.

## Source-preserving comparison and complete reproducer

The [Windows/Node22 CommonJS SFT](../sims/lp2_p50_crossradix_smoothfactors_sft.cjs) reads the canonical [table JSON](../resources/liber-primus/lp2-grid-256.json) and recomputes both integers from all 256 printed tokens. Source base60 byte SHA256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. New base59-byte SHA256 is `511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79`. It checks both complete divisors, all exponents through one million, both cofactor bit lengths, and the exact no-`f` byte relation.

A deterministic **1,000,000-trial** Fisher–Yates control shuffles the **same paired original source tokens** under both interpretations, preserving their inventory and the missing-`f` fact. With xorshift32 seed `0x3301B059`, **0** permutations satisfy the complete original base60 factor product, **0** the newly noticed full base59 factor product, and **0** both. The control measures how unusual these **fixed postobserved divisors** are under that particular order-shuffle model; it is **not** a discovery-wide significance test. Separate exploratory NumPy/PCG64 3-million paired shuffles yielded 0 / 2 / 0 matches, illustrating the nonzero shuffle compatibility of the new base59 product.

## Decision

Keep the base59 integer valuation available as a genuine numerical feature of the authentic table. Its factors are not a decryption by themselves. Source-visible sexagesimal cuneiform elsewhere in LP2 favors *considering* the ordinary base60 reading, while the missing digit `f` makes base59 a concrete rival. Neither selects a reversible GP29 receiver, so another factor search or recursively fitted prime-to-page navigation is unlikely to decode text without an independently indicated operation.

For genuine progress, require a first-party clue that **chooses either 60 or 59 as the numeral radix**, specifies which key/operand to extract from the resulting integer, and predicts complete withheld original rune plaintext with exact inverse reconstruction. The repository's authoritative `results/README.md` remains unchanged: all 56 unknown LP2 pages remain unsolved.
