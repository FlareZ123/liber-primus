# A source-conditioned DH331 two-anchor match, with an incomplete original-cipher inverse

**Classification:** original-source arithmetic match and **provisional** 2013-to-2016 handoff hypothesis. This is not a recovered LP2 key, an authenticated radix instruction, a decrypted page, or proof of authorial design. Its two panel matches were identified retrospectively. A reproducible single-file test is at [`sims/lp2_dh331_red13_twoanchor_source_sft.cjs`](../sims/lp2_dh331_red13_twoanchor_source_sft.cjs).

## Historical operation and exact author-visible inputs

The [authenticated 2013 TCP-server challenge](../resources/external/2013-tcp-server-signed-source.md) specifies a Diffie–Hellman *server-side computation*: with modulus `p`, generator/base `g`, server secret `a` and client-provided share `B`, the server publishes `A=g^a mod p` and returns `K=B^a mod p`. Its exact worked positive control is `p=23, g=5, a=6, B=19 → A=8, K=2`. The challenge does not instruct using this operator on the 2014 book. It also lets the participant choose the server's base and secret; a historical handoff to the book is therefore an additional, unverified hypothesis.

The original LP2 opening page p0, JPEG `17.jpg`, has a confirmed **two-word, entirely red, 8+5-rune heading** with GP-prime sums **347** and **315**, and a visible **red 13-dot mark directly after those 13 heading runes**. Original source: [p0 image adjudication](../resources/liber-primus/lp2-p0-physical-ink-override.json), with [GP29 prime table](../resources/liber-primus/lp2-corpus.json). The half-sum and half-difference are `(347+315)/2=331` and `(347−315)/2=16`. The [2014 archived Stage11 distribution HTML](../resources/historical/cicada2014-onion7-original-index.html) contains `<title>133</title>` and `<div id="331">`. These first-party objects supply a candidate tuple `p=331`, `g=16`, `a=13`, `B=133`, without a numerical search over these fields.

Separately, original LP2 p6 has a red 11-rune span **starting at rune offset 71**. Its first printed red word is four GP runes with GP0 ordinal sum **71**, confirmed by [the original-ink register](../resources/liber-primus/lp2-ink-annotations.json). The *authenticated 2016* signed message contains the word `SEEKS`, whose GP0 ordinal sum is also **71**. The existing [p50 word-map/functional-graph study](lp2-p50-functional-graph-2016-wordmap.md) already establishes this index and the route starting at index71; those are prior results, not newly recovered here.

## Two exact panel observations

Under the candidate 2013 server-side operation, both output numbers are completely determined:

| Computation | Predicted output | Natural original numeric-table receiver | Printed token, base60, competing base59 |
|---|---:|---|---|
| `16^13 mod 331` → server public share `A` | **203** | First p50 table cell at index **0** | `3N` → **203** / 200 |
| `133^13 mod 331` → server returned value `K` | **108** | Cell at p6 red-word / 2016 `SEEKS` address **71** | `1m` → **108** / 106 |

A constrained counter-reading helps select the 13-dot operand over the similar HTML title: if the HTML number 133 is instead used as **the secret exponent**, with the other operands unchanged, `133^133 mod331=133`, which **fails** the independently indexed p50 cell71 value108. This does not rescue the arbitrary address-to-output mapping, but the two-cell agreement requires the physically printed **13-dot exponent**, rather than simply reusing the HTML title in both roles.

Both printed tokens occur at those original indices, without correction, in [the 32×8 source table](../resources/liber-primus/base60-grid.json). The 2014 participant byte witness in [the contemporary sexagesimal record](../resources/cicada2014-sexagesimal-source.json) independently preserves both entries. The two equalities therefore agree with the **base60** interpretation of these particular cells and disagree with the historically plausible lowercase-`f`-omitting **base59** interpretation. The broader [radix ambiguity and independent conditional p39 polynomial discriminator](lp2-grid-numeric-codec-ambiguity.md) remain relevant. No complete published key or encryption method follows from the two matching bytes.

The existing table successor graph has `71→108→14→…→32` under the base60 forward interpretation. The apparent shared value `K=108` matches its *first* edge. The graph's subsequent trip to p32 was already documented independently; this candidate supplies a possible earlier mathematical reason for its first edge, conditional on all four role assignments.

## Decisive objections and bounded original input test

1. **The role assignment is inferred.** Neither the 2013 challenge nor the May 2014 HTML says to interpret the p0 red-word half-sum as a DH modulus, the half-difference as a base, the 13 dots as a secret, and an HTML title as a client public share. No first-party source selects the two table receiver indices *as outputs of this DH exchange*. The two-cell exact agreement is retrospective and cannot be assigned a blind probability of `1/256²`.
2. **This is not a valid two-party DH exchange on the stated generator.** Although `331` is prime, the multiplicative order of `16 mod331` is only **15**, and `133` is **not** in that subgroup. No client exponent `b` could satisfy `16^b≡133 mod331`; only the **one-sided** modular exponent calculation from the documented 2013 server challenge is algebraically meaningful. This is a major reason to avoid calling `108` an authentic shared cryptographic secret.
3. **The two arithmetic equalities do not extend to a generator of the panel.** The p50 table has 161 distinct byte values; powers of base16 modulo331 can occupy at most 15 residues. The exact same-group power schedule cannot generate the remaining 254 cells.
4. **A frozen simple original-cipher inverse fails.** Taking the only immediately available evolving sequence `key_i = 133^(13+i) mod331 mod29` and applying both GP29 additive directions to the complete **121-rune original p32** yields index of coincidence **0.03126722** for `C−key` and **0.03732782** for `C+key`, with no connected readable GP-native plaintext. Both re-encrypt exactly. The p32 recipient is the established 2016 word-map terminal page, rather than a page chosen to maximize a score. This finite failure does not eliminate other consumers, but no source specifies one.

## New full-panel 13th-root inverse: exact but no plaintext

The same **source-shaped exponent 13** supplies a complete, key-free reversible operation on every one of the 256 base60 bytes because `gcd(13,331−1)=1`. The inverse exponent is **127**, since `13×127 = 5×330+1`. For each original cell `y`, compute `x=y^127 mod331`; then `x^13 mod331=y` exactly, including zero. The frozen original-image p50 table reproduces **256/256** output cells without changing their order. The two anchor roots are `root(T[0])=16` and `root(T[71])=133`, returning the earlier original red-word half-difference and HTML title.

The *complete* inverse exposes a decisive obstacle to treating the numerals as a straightforward **256-distinct-byte DH13 S-box or encrypted byte permutation**: **60** of the 256 unique-position roots are **at least256** (and so not bytes), while the original table contains only **161 distinct outputs**. Raising **256 distinct input field elements** to the invertible power13 would preserve all256 distinctions. Hence a straightforward full byte permutation is impossible. A noninjective source byte stream could of course still be transformed; the original provides no source-authored command to do so.

A small direct original-cipher consumer tests `K[i] = (T[(start+i) mod256]^127 mod331) mod29` at the **121-rune p32** recipient independently selected by the signed-2016/p50 navigation route, with both printed-order start0 and source-red/signed-SEEKS address start71. With `P=C±K mod29`, all four exactly reverse and re-encode original p32, but are gibberish:

| Table starting cell | P=C−K GP29 IoC | P=C+K GP29 IoC |
|---|---:|---:|
| 0 | 0.03223140 | 0.04063361 |
| 71 | 0.03402204 | 0.03223140 |

The lone marginally elevated 0.0406 for only 121 symbols has no connected GP-native words. The 13th-root map is therefore a **complete source-conditional numeric-table inverse**, not an identified LP2 cipher or authentic plaintext. The original 2013 DH challenge neither selects the 256-byte table as a key receiver nor authorizes repeated use of the 13-dot exponent to transform every cell. No expanded key search is warranted.

**Decision:** preserve the two exact source-conditioned arithmetic matches as a falsifiable intermediate lead. Treat any proposed use of `A=203` or `K=108` as an **unverified hypothesis** until a third *independently predeclared original source target* or an authored receiver selects the operation and recovers connected unknown plaintext. Do not broaden into modular-base, address, cipher-direction, or generator-menu searches. The authenticated 2013 TCP specification remains a historical explanation for the operator, not an authenticated command to decrypt LP2.