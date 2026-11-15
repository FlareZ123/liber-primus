# The pp49–51 table's H×G polynomial is an exact one-residue-error-correcting code

**15 November 2026, Agent33. Classification: new, executable mathematical consequence of previously established original-source polynomial factors.** The 256 printed cells support four exact GF(29) parity conditions and a **unique single-residue-error locator** under the conventional base-60 reading. All **256×28 = 7,168** possible single nonzero GF(29) corruption patterns recover their position and residue exactly. The competing 59-digit alphabet fails the parity conditions and cannot be repaired with one residue edit. This is a **conditional checksum/integrity algorithm**, with **zero recovered unknown-page plaintext, no author-authenticated table cipher and no destination**.

## Human-visible source operands and the unsettled premise

LP2 physical pp49–51, original scans \`66.jpg\`–\`68.jpg\`, print 32 rows of eight two-character alphanumeric tokens. The original image-adjudicated transcription is \`resources/liber-primus/lp2-grid-256.json\`. Decoding under the conventional alphabet \`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx\` yields 256 bytes, SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`.

Two source operands were identified **before this error-locator construction**:

* The signed 2013 \`BASE29 3301 → 3QO\` example supplies digit indices [3,26,24]. Reading them in **ascending polynomial order**, an unprescribed interpretation, gives \`H(X)=3+26X+24X²\`.
* Original physical p39's three red GP29 runes give [27,5,15], or \`G(X)=27+5X+15X²=15(X−24)²\`. This likewise assumes the red triple should be polynomial coefficients.

The previous [three-object polynomial investigation](lp2-p15-p39-signed-matrix-eigen-crosslink.md) and the [252-quotient RC4 gate](lp2-hg-q252-rc4-original-inverse-gate.md) already established that the 256 conventional-base60 bytes \`B[0..255]\`, read as descending GF29 coefficients, form \`P(X)=Σ B[i]X^(255−i)\` **exactly divisible by H(X)G(X)**. Their product is \`23+21X+11X²+17X³+12X⁴\`, and the resulting quotient contains 252 GF29 coefficients.

Those original GF29 factor observations are established arithmetic, but their **historical selection is unproved**. Neither the visible manuscript nor an authenticated Cicada instruction tells a player to treat the printed bytes as polynomial coefficients, to reverse 3QO's positional order, to multiply these two polynomials, or to regard the factors as parity checks. This algorithm establishes what that hypothetical code can do; it is not an independently identified Cicada instruction.

## Exact four-symbol syndrome

Normalize \`H\` to \`X²+18X+11\` over GF29. This quadratic is irreducible, and the residue-field element \`α=X mod H\` has exact multiplicative order **840** in GF(29²). Compute from a possibly corrupted candidate polynomial \`R\`:

\`S₀=R(24)\`, \`S₁=R′(24)\`, and \`(S₂,S₃)=R mod H\` as the two coordinates in \`1,α\`.

The uncorrupted original has all **four syndromes zero**. If exactly one coefficient at exponent \`e=255−i\` has changed by nonzero residue \`δ mod29\`, then

\`S₀=δ·24^e\`,  \`S₁=δ·e·24^(e−1)\`,  \`R mod H=δ·α^e\`.

Because \`S₀≠0\`, the repeated root from original p39 immediately reveals **\`e ≡ 24S₁/S₀ (mod29)\`**. At most nine exponents between 0 and255 share that residue. For each, calculate \`δ=S₀/24^e\` and accept the candidate only if \`δ·α^e\` equals the quadratic remainder. This procedure locates both the erroneous cell and the correct *GF29 residue*, without knowing the original bytes or matching a language corpus.

**Uniqueness proof for the complete 256-cell domain.** Suppose two different one-error possibilities had identical syndromes. Their difference would be a two-term polynomial divisible by both \`(X−24)²\` and \`H\`. The repeated root and derivative force the two exponents to differ by a multiple of **29**. Since \`α\` has order840 and the coefficient ratio lies in GF29*, the ratio \`α^(e₁−e₂)\` must lie in a group of order28, hence the exponent difference must also be divisible by **30**. Both demand a difference divisible by lcm(29,30)=**870**, impossible for distinct exponents within 0–255. Thus there is exactly one valid one-error correction for any nonzero residue error.

## Complete original-table execution

The [single-file Node22 CommonJS reproducer](../sims/lp2_p50_hg_singleerror_syndrome_sft.cjs) loads the **unchanged** original-derived 256-token grid, pins its byte SHA, verifies the original H×G polynomial product, computes the four original syndromes, and independently generates all 7,168 possible single-position/nonzero-residue corruptions. It runs the exact source-blind correction routine and asserts each output cell, exponent, and error residue against the hidden planted change.

| Test | Exact result |
| --- | --- |
| Original base-60 table, four syndrome coordinates | **[0,0,0,0]** |
| All 256×28 possible single-residue errors | **7,168 / 7,168 corrected exactly** |
| Original field-root \`α\` order | **840** |
| Competing \`f\`-omitting base-59 encoding | **[20,12,20,17]**, nonzero |
| Can the base-59 reading be repaired by one GF29 coefficient error? | **No** |
| Controlled historical participant misread, cell170 \`194\` for original \`254\` | Reports **cell170, δ=27 mod29**, restoring original coefficient residue |
| Controlled historical participant misread, cell165 \`47\` for \`18\` | **Undetectable** because \`47−18=29\` |

The cell170/165 alternatives are taken from the previously recovered May 2014 participant transcription corrections ([upstream source](cicada2014-sexagesimal-upstream-transcription.md)), then **isolated one at a time against the currently source-adjudicated other 255 cells**. The actual original 2014 transcription has multiple additional errors and is therefore not represented as a one-error codeword. The source input was not modified.

**Important limits.** This is a GF29 integrity rule, so differences by a multiple of 29 are invisible, and a residue value does not uniquely determine a byte between 0 and255. The 7,168 positive tests are **programmed corruptions**; they verify a true algebraic property and its implementation, but provide no new independent historical author selection. Multiple simultaneous errors need a separate decoder, and some can share syndromes. The base59 result rejects that interpretation *if and only if* the H×G parity model is intended. It cannot by itself prove that base60, these polynomial factors or a specific downstream cipher were Cicada's actual choices.

## Research consequence

This code could give an originally motivated solver a four-equation way to detect and correct a misread rune-table numeral and discriminate a candidate radix **after the H/G interpretation was independently selected**. It does not operate on the 12,956 unknown ciphertext runes, derive a rune keystream, identify the table's intended recipient, or solve a page. The decisive next input remains an original author-linked selector or an independently predictable consumer of the recovered **252-coefficient quotient**. The already-tested direct RC4 and Hill consumers do not recover original plaintext; avoid fitting additional ones without such a selector.

The same quotient, divided into nine consecutive groups of 28 to reflect the visible chapter count and 28 nonrepeat successor ranks, has respectively **[16,19,21,16,19,16,18,17,22]** distinct residues per group. These are **not nine complete 28-symbol substitution alphabets**. Sorting tied residues into 28 bijections and feeding original predecessor-difference ranks through them leaves every original chapter GP29 coincidence index approximately **0.035–0.037**, ciphertext-like. Thus an unfitted direct nine-alphabet consumer is excluded, although neither ordering nor predecessor differencing is first-party selected; its negative result is secondary to the exact checksum algorithm and should not be broadened into more fitted mappings.
