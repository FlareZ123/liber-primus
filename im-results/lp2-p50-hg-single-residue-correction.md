# The pp49–51 table's cross-source GF29 syndromes locate one error, and sometimes two

**15 November 2026, Agent33. Classification: new, executable mathematical consequence of previously established original-source polynomial factors.** The 256 printed cells support four exact GF(29) parity conditions and a **unique single-residue-error locator** under the conventional base-60 reading. All **256×28 = 7,168** possible single nonzero GF(29) corruption patterns recover their position and residue exactly. The competing 59-digit alphabet fails the parity conditions and cannot be repaired with one residue edit. Adding two previously established p15 eigenvalue evaluation targets gives a six-syndrome model that **uniquely recovers one actual pair of historical transcription-error residues**; 6 of 128 independently seeded double-error controls are ambiguous, so the two-error capability is not a universal guarantee. This is a **conditional checksum/integrity algorithm**, with **zero recovered unknown-page plaintext, no author-authenticated table cipher and no destination**.

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

## Adding the two independent p15 evaluation targets: two-error recovery

The earlier [p15 signed-matrix/p39/p50 crosslink](lp2-p15-p39-signed-matrix-eigen-crosslink.md) observed that the original source table also satisfies **\`P(8)=27\` and \`P(17)=15\`**. These use the two other eigenvalues of the Fibonacci-prime-derived signed matrix on physical p15 and the outer coefficients of p39's red triad. They are exact relations **under the original conventional-base60 polynomial**; their selection as check equations is speculative and retrospective.

Extend the four-coordinate syndrome by \`S₄=R(8)−27\` and \`S₅=R(17)−15\`, each modulo29. An isolated corruption \`δX^e\` has exact six-vector signature

\`δ × [24^e, e24^(e−1), coefficient₀(α^e), coefficient₁(α^e), 8^e, 17^e]\`.

Generate and index all 7,168 possible single-error signatures. For a received six-syndrome vector \`S\`, subtract each one-error signature \`v\` and look up \`S−v\` in that index. This examines a **complete finite one-error dictionary**, without guessing wordlists or secret keys. Report **all distinct pairs** whose signatures sum to \`S\`; a unique pair is a justified correction, and multiple pairs must remain explicitly ambiguous.

An independently recovered **May 2014 participant transcription** had already corrected two numerical errors at zero-based table positions **170** and **172**. Its old figures were \`194\` and \`174\` against original-image-adjudicated values \`254\` and \`148\`. To test this dual case, replace **only those two** original table values with their recorded pre-correction alternatives, leaving the other 254 unchanged. The six-syndrome is **[28,1,22,22,9,17]**. **Exactly one** two-error explanation exists across all 7,168² ordered single-error pairs: \`(index172,δ=26)\` and \`(index170,δ=27)\`. These correctly recover the two original **residues modulo29**.

This is a historical-input demonstration under a deliberately isolated two-error model, **not** a claim to reconstruct the entire old 2014 transcription, which had further optical discrepancies. In particular, the recorded index165 \`47↔18\` difference equals29 and is invisible to all six GF29 conditions.

In **128 deterministic, fixed-seed, two-location corruptions of the complete original table**, the exhaustive decoder includes the planted pair on **128/128**, and returns it as the **only** pair on **122/128**. The remaining **6/128** have two or three algebraically valid explanations. A global two-error guarantee is false; this 128-case result is a reproducible test sample, not an estimated historical error rate. The distinct ambiguity counterexamples and exact source run are in the same [standalone CommonJS reproducer](../sims/lp2_p50_hg_singleerror_syndrome_sft.cjs).

This extension gives a concrete additional input-validation operation tying three visible/source-linked mathematical objects together, **but a code that fits the table does not itself identify the author's intended downstream decoder**. Every ambiguity and modulo29 byte-alias limitation remains in force.

## Research consequence

This code could give an originally motivated solver a four-equation way to detect and correct a misread rune-table numeral, with two further conditional p15 equations sometimes resolving two misreads and discriminate a candidate radix **after the H/G interpretation was independently selected**. It does not operate on the 12,956 unknown ciphertext runes, derive a rune keystream, identify the table's intended recipient, or solve a page. The decisive next input remains an original author-linked selector or an independently predictable consumer of the recovered **252-coefficient quotient**. The already-tested direct RC4 and Hill consumers do not recover original plaintext; avoid fitting additional ones without such a selector.

The same quotient, divided into nine consecutive groups of 28 to reflect the visible chapter count and 28 nonrepeat successor ranks, has respectively **[16,19,21,16,19,16,18,17,22]** distinct residues per group. These are **not nine complete 28-symbol substitution alphabets**. Sorting tied residues into 28 bijections and feeding original predecessor-difference ranks through them leaves every original chapter GP29 coincidence index approximately **0.035–0.037**, ciphertext-like. Thus an unfitted direct nine-alphabet consumer is excluded, although neither ordering nor predecessor differencing is first-party selected; its negative result is secondary to the exact checksum algorithm and should not be broadened into more fitted mappings.
