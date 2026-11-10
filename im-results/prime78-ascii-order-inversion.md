# A source-register attack on hidden 29-rune cyclic order in 78-to-47 ASCII transport

**Status (Agent 8, 10 November 2026): an implemented, successfully blind-key-recovered channel with a decisive original-versus-plant contrast for uppercase and lowercase source-English. No unknown Liber Primus plaintext, historical encryption method, key or destination is recovered.** This does not exclude all 7-bit ASCII encodings, encrypted binary, compression, different packet boundaries, or variable rune alphabets.

## Source-specific construction and why this was a serious inversion

The 55 rune-bearing unsolved LP2 pages contain **12,956** authentic canonical GP rune labels. Exactly **86** runes equal their predecessor in physical reading order; removing those repeated occurrences leaves **12,870 = 165 × 78** nonrepeated labels. The removed events could, hypothetically, be nonconsuming transport markers; their source positions are held fixed in every test. The numerical relation is a source observation, not proof that Cicada used these packets.

There is a natural byte-capacity candidate: **78 digits in radix 28 encode any 47-byte uppercase or lowercase English/space block**, because its leading ASCII byte is at most 122 and the maximum 78-digit radix-28 value exceeds any 47-byte integer beginning with a byte of at most 122. This is a precise, alternative hypothesis to the earlier 79-output/78-GP-plaintext candidate. It includes a *whole 47-byte, uncompressed ASCII message channel* and cannot be assessed by a marginal GP-rune IoC on the ciphertext.

Let \(\sigma\) be one entirely unknown but fixed cyclic permutation of the **29** source GP symbols. Under this proposed encoder, each base-28 digit \(d\in[0,27]\) changes the previous ciphertext glyph \(u\) to the glyph in cyclic position \(\sigma(u)+d+1\pmod{29}\). Thus adjacent output letters never repeat unless an explicit transparent marker is inserted. The receiver can invert *any* proposed order \(\sigma\) to all 165 complete rank packets, and each rank packet to exactly 47 candidate bytes using arbitrary-precision integers. The order has 29! alternatives, with one global rotation redundant.

A 47-byte payload is constrained most strongly at the **first byte of each packet**: with \(A=28^{77}/256^{46}\approx4.48879745\), the first rank \(d\) is approximately the ASCII first byte divided by \(A\). This yields a cheap *order-dependent likelihood* from **the observed predecessor and first glyph at every packet boundary**. The test estimates its 28-way distribution from the independently solved native GP English in \`resources/liber-primus/lp1-plaintext-reference.txt\`. It does this separately for two source-native ASCII registers, all uppercase and all lowercase (spaces preserved), smoothing each estimated distribution with ten percent uniform prior.

A deterministic swap-annealing search fits \(\sigma\) using **the first 108 of 164 known packet-leader transitions**. The remaining **56** packet leaders are strictly reserved for validation. Once the winner is frozen, all **7,708** bytes from packets 1–164 are decoded without further language fitting. The first packet is excluded from byte evaluation only because its predecessor before the beginning of the supplied manuscript is unspecified. No original ciphertext is edited.

## Complete secret-key positive and original outcomes

For each ASCII case, the same independently chosen GP text is repeated to a 165×47-byte message, converted *exactly* into base-28 digits, encrypted with a uniformly shuffled hidden 29-rune cyclic alphabet, and given repeats at **the identical 86 original positions**. The fitting routine sees only emitted ciphertext and the frozen first-byte source likelihood. The true shuffled alphabet is withheld from inference. The test then checks recovered alphabet positions **modulo the unavoidable global rotation** and every decoded byte, not merely the language score.

| Input | Training log-likelihood per packet leader | Untouched 56-leader log-likelihood | 47-byte payload printable count |
| --- | ---: | ---: | ---: |
| Original LP2, uppercase source | **−3.234008** | **−4.715756** | **2,890 / 7,708** |
| Uppercase synthetic, hidden original order | **−1.986313** | **−1.947329** | **7,708 / 7,708** |
| Original LP2, lowercase source | **−3.087418** | **−4.515586** | **2,925 / 7,708** |
| Lowercase synthetic, hidden original order | **−1.987084** | **−1.963770** | **7,708 / 7,708** |

The fitter recovered **all 29 out of 29 hidden cyclic GP-label positions, up to overall rotation**, in **both independent planted case registers**, and exactly reproduced **all 7,708 decrypted bytes** from packets 1–164. The 86 markers were restored in their exact original slots in the positive encryptions. The exact radix conversion and forward inversion require no linguistic assumptions.

The source-original fits yield only **37.5% / 38.0% printable bytes**, close to the random 95/256 rate, and visible fragments contain no coherent message. The original uppercase winner has only **844/7,708** uppercase-or-space output bytes; the original lowercase winner has **3,796/7,708** high-bit-set output bytes. These observations conflict sharply with the synthetic source-English plants (7,708/7,708 printable; zero high-bit-set output bytes). Both untouched source-register likelihoods are far below their exact-key controls.

The large gap persists in the 56 held-out packet leaders, so an attractive original training optimum does not qualify as recovered plaintext. The chosen original cyclic orders themselves are **fitted statistical hypotheses**, never authentic key discoveries. The result is conditional on fixed all-manuscript cyclic order, marker erasure, global zero packet offset, exact 78-digit base-28 integer grouping, 47-byte big-endian output and source-like uppercase/lowercase ASCII. Ordinary binary ciphertext, a cryptographically hidden second layer, source-controlled per-packet rotations, a separate key for every packet, alternative endian/packet widths, or more unusual text encodings remain untested by this result.

## Reproduction and research consequence

The complete read-only [CommonJS reproducer](../sims/prime78_ascii_order_inversion.cjs) asserts source counts, exact 78-to-47 capacity, planted whole-message roundtrip, all 29 recovered key positions, and original-versus-plant statistics.

\`\`\`text
node sims/prime78_ascii_order_inversion.cjs
node sims/prime78_ascii_order_inversion.cjs --lowercase
\`\`\`

The shared existing [manual base28 capacity runner](../.github/workflows/red79-base28-capacity.yml) exposes \`probe=binary47\`. Both invocations **passed on the original repository source** in [GitHub Actions run 42840890838](https://github.com/FlareZ123/liber-primus/actions/runs/42840890838), including both complete secret-key recoveries. The lowercase search uses 600 seeded independent anneals and the uppercase search 48; both select only the training score and freeze the result for the final heldout evaluation.

This adds a reusable **actual hidden-alphabet recovery attack against a plausible byte transport**, rather than one more ciphertext-frequency screen. It removes a tightly specified ASCII framing from priority while leaving compressed/binary text and truly external key acquisition open. Its numerical block identity alone should not be promoted into a claimed Cicada cipher specification. Earlier source work on **79 outputs → 78 GP plaintext**, and the 5-to-3 octet source constraints, addresses distinct transport formats.
