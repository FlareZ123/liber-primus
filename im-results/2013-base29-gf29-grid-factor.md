# The 2013 BASE29 3301 example is an exact LP2 numerical-grid quadratic factor

**Classification (11 November 2026): exact, newly connected historical-source-to-original-manuscript polynomial identity. No unsolved LP2 plaintext, authentic encryption key or cipher reconstruction.** The equation is reproducible directly from the 2013 archival source example and the 256 original transcribed grid bytes. The interpretation as an intended solve instruction remains open.

## Previously unconnected historical input

The preserved 2013 Cicada server-programming challenge explicitly defines a `BASE29 [n]` command. Its worked example says `BASE29 3301` and answers `3QO`. This is preserved in a participant's [7 December 2013 code-and-instructions gist](https://gist.github.com/navinpai/7837596), which quotes an earlier instruction source `pastebin.com/CrRvGrkT`; the quoted challenge specifies a submission deadline of 3 February 2013. The gist contains a real server implementation using 29 digits with `0..9, A..S` as values 0..28. The particular example predates the 2014 Liber Primus release in that archive. **The quoted challenge is not independently OpenPGP authenticated here**, and an archived participant copy is a weaker source than an original signed puzzle artifact.

The example's digit values are therefore fixed without consulting LP2:

```text
3QO -> [3, 26, 24]
3*29^2 + 26*29 + 24 = 3301
```

The historical source also specifies `RAND [n]` returning random integers 0..255, `DH [p]` for Diffie–Hellman, and `KOAN`. Its `RAND` byte width is compatible with, although does not explain, the independently printed 256-cell byte table. There is no archived fixed random output, seed, recipient key, or explicit instruction to apply the server's operations to the later manuscript.

## Exact polynomial match on the independent LP2 grid

Read the same canonical 256-byte row-major LP2 table in `resources/liber-primus/lp2-grid-256.json`. Its byte-stream SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Over \(\mathbb F_{29}\), take the original byte sequence as descending coefficients \(
P(X)=\sum_{i=0}^{255}(b_i\bmod29)X^{255-i}.
\)
The leading byte is 203=7×29, so the formal polynomial degree is 254.

Using the **printed historical digits as ascending-power coefficients**, the convention previously used on the actual LP2 red rune triads, defines:

\[
H_{2013}(X)=3+26X+24X^2
=24(X^2+18X+11)\pmod {29}.
\]

**Exact division gives \(P(X)\bmod H_{2013}(X)=0\).** This is precisely the complete original-grid factor \((X^2+18X+11)\) identified in the [independent full factorization](lp2-grid-complete-gf29-factorization.md), now supplied by a pre-LP2 published numerical operation without choosing an arbitrary factor. The previously published factorization had no identified 2013 `BASE29 3301` provenance.

The choice of coefficient orientation is material. If `3QO` is interpreted in the conventional left-to-right **descending** polynomial orientation, \(3X^2+26X+24\), the source table's exact Euclidean division remainder, in descending slots, is **\([1,6]\)**. Only the ascending-coefficient convention gives zero remainder. Its motivation comes from the independent red-triad reading; the 2013 BASE29 specification itself is a numeral operation and does not prescribe turning its digits into polynomial coefficients.

Another independent original-source quadratic is the physical p39 red inscription, GP index values \([27,5,15]\), read in the same ascending coefficient order:

\[
G_{p39}(X)=27+5X+15X^2
=15(X-24)^2\pmod {29}.
\]

This is also an exact factor of \(P(X)\), and its root **24 = 3301 mod 29** is independently supplied by the oversized Ac GP rune on p54. The two distinct factors are coprime. Their product divides the unchanged original table exactly, as checked by multiplication back to all 256 original mod29 coefficients.

Dividing out both source-linked quadratic factors removes four formal polynomial degrees. The fixed-width 256 original slots become **252 quotient slots**; the first remains the original leading-zero slot, leaving a degree-250 polynomial with **251 canonical coefficients**. The 252-slot quotient has GP29 index of coincidence **0.0363308670**, much closer to uniform \(1/29\) than an ordinary GP-English text. Its rune transliteration is not readable plaintext. The exact quotient is therefore an actionable, source-restricted candidate **intermediate register**, not a recovered message.

## The other 2013 worked example generates the p39 factor

The same historical server specification gives the **literal, fully worked DH exchange**:

```text
C: DH 23
S: 01 OK 5 8
C: 19
S: 03 DATA 2
```

This defines modulus \(p=23\), generator \(g=5\), server public share \(A=8\), client public share \(B=19\), and shared key \(K=2\). The previously unstated private exponents are uniquely recovered in the 22-element multiplicative group: \(5^6\bmod23=8\), \(5^{15}\bmod23=19\), and \(19^6\bmod23=8^{15}\bmod23=2\).

There is now a **single source-number construction of the other original LP2 quadratic**. Take the client exponent **15** from that 2013 example and \(r=3301\bmod29=24\) from the separately specified BASE29 example:

\[
15(X-r)^2=15(X-24)^2=27+5X+15X^2\pmod{29}.
\]

The resulting coefficient vector \([27,5,15]\) is **exactly** the p39 red three-rune inscription under the source-established ascending-power convention. Moreover, its constant 27 is \(-K\pmod{29}\) for the 2013 exchange's shared secret \(K=2\), while the linear coefficient 5 is the original 2013 DH generator. The leading coefficient is the actual recovered client exponent 15. These identities are independently executable without reading off the p39 rune coefficients as parameters.

This is a stronger, more constrained interpretation than choosing an arbitrary quadratic factor from a precomputed list. **The square-of-a-shift operation was itself recognized from the p39 red polynomial before discovering the historical DH link.** Accordingly, the data do not prove that the author intended the DH example as a key schedule. The derived 15 is the private exponent of a tiny illustrative DH exchange, **not an independently recovered LP2 encryption key**.

A further arithmetic alignment, treated as less diagnostic, maps the 2013 DH example to the p3 red triad: \([g+A,p,K]=[5+8,23,2]=[13,23,2]\). Nothing in the 2013 instructions prescribes summing the base and public share, so this identity must not be counted as independent confirmation. Likewise, the discrete logarithm \(z=u^{433}\) in the p3 GP29² extension has \(433\bmod23=19\), matching the DH client share only after selecting a different modulus for a retrospective residue check.

## Source-linked field representation, with a scope warning

The physical p3 red triad \([13,23,2]\), also beginning at local rune offset 119, defines \(\mathbb F_{29}[u]\) with \(u^2=3u+8\). The p3 root \(u\) is primitive of order 840. The concrete element \(z=23-2u\) satisfies the historical quadratic **\(H_{2013}(z)=0\)**; its canonical power relative to \(u\) is \(z=u^{433}\). The log is computed by direct enumeration of the complete 840-element multiplicative cycle, and \(\gcd(433,840)=1\), so \(z\) is also primitive. Its trace and norm are each 11, matching the monic 2013 polynomial \(X^2+18X+11\).

This gives one precise way to perform the 2013 challenge's historically mentioned **Diffie–Hellman operation** in the same 29²-element field that p3's mark independently suggests. It does **not** identify an actual exchanged exponent, a key, a mapping from quotient symbols to text, or a reason to prefer the specific affine root change \(z=23-2u\) over other field-coordinate changes. All irreducible quadratics over the same field extension admit affine root correspondences. The field isomorphism and exponent 433 alone cannot be advertised as independent statistical confirmation.

## Intended-path appraisal and next experiment

A plausible contemporary solver could remember the 2013 `BASE29` operation, notice the previously established LP2 `29` rune field and `3301` magic-square constant, then use a red-triad ascending polynomial convention to test `3QO` against the 2014 grid. The two exact quadratic factors could be a designed checksum or quotient-construction cue. A genuinely predictive next operation would have to identify, from the historical protocol or physical artwork, how the **252 fixed quotient slots / 251 nonpadded field coefficients** are ordered, encoded, or keyed. The 2013 `DH` example may be worth examining only if it fixes the field generator, exponent and output rule without ciphertext fitting.

This connection was itself found *after* the repository had completely factored the table, so the probability of a chance match cannot be based on a single predeclared 1/29² test. No newly deciphered original GP rune, hash preimage or destination follows from the equality. Do not redo source-agnostic red-triad GF841 trace-pad sweeps or direct 127-pair lookup attacks; both are already extensively negative in [the prior grid/red-triad synthesis](grid-bigint-factor-page53.md) and [integrated original-inversion challenge](../workplace/integrated-original-inversion-challenge.md).

**Reproduce:** `node sims/base29_2013_grid_factor_sft.cjs` from repository root (Node 22, standard libraries), which asserts the 2013 digits, both exact zero remainders, the opposite-orientation failure, full 256-slot polynomial reconstruction, source red triads, 252-slot quotient, and GF29² field change.
