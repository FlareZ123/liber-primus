# A cyclic word-key hypothesis from p57 EMERGE: eight complete SHA-512 plaintext-feedback inverses

**22 November 2026, Agent49; [Director issue #2184](https://github.com/FlareZ123/liber-primus/issues/2184). Original-input bounded negative.** No newly solved LP2 rune, author key, full inverse or destination was recovered. The original 56 unknown physical pages p0–55 remain unsolved.

## An independent, human-plausible route to an authentic inverse

Solved p57 visibly closes with **FIND THE DIVINITY WITHIN AND EMERGE**. The nearby *SHED OUR OWN CIRCUMFERENCES* line suggests a cyclic beginning; the already-solved p56 references an external SHA-512-sized digest; and the authenticated 2016 signed instruction refers to the book's words as a map. A solver could ask whether the final *known plaintext word* **EMERGE**, GP indices **[18,19,18,4,6,18]**, initializes a word-by-word cryptographic chain that decrypts the beginning of the book. The previous recovered word would then determine the next word's hash key. This is a complete, deterministic prediction and needs no fitted key.

The **strongest objection is source selection**: neither original page specifies that the p57 ending should be fed back to p0, that SHA-512 is the word hash, how to serialize a GP29 word, nor how to consume the hash. The proposal remains exploratory. It differs crucially from the already-rejected [32 preceding-**ciphertext**-word SHA models](lp2-previous-cipherword-sha-native-plaintext-inverse.md): here the operand of each next digest is **previously recovered PLAINTEXT**, introducing a nonlinear avalanche-dependent state. Changing a word's plaintext changes the keystream for every following word.

## Frozen candidate mechanisms

Treat all **2,896 printed source words** as genuine complete units, including 32 physical-page continuations; preserve all **12,956 authentic unknown GP29 ciphertext runes**, original whitespace and word lengths. On each word, derive one 64-byte SHA-512 digest of the previous *decoded* word. The first previous word is the source-exact p57 **EMERGE**. Two source-natural serializers are tested: original Unicode GP rune glyphs in UTF-8 and comma-separated published GP prime weights. No normalization search, salt, offset, hidden key, trained plaintext, shifted alignment or word reorder is used.

Within either fixed encoding the candidate decoder is one of:

1. **Direct GP29 word-to-word hash ratchet:** \`P[w,j] = (C[w,j] ± SHA512(serialize(P[w−1]))[j] mod29) mod29\`. Spaces do not consume digest bytes; reset the 64-byte digest to offset zero per printed word. Forward inverse is \`C=P∓pad mod29\`.
2. **Explicit 28-state step architecture:** first compute the GP29 ciphertext difference \`d=(C_i−C_(i−1)) mod29\`, using preceding actual ciphertext through word boundaries and p57's final E as the first state. If \`d=0\`, emit GP rune EA (index28); otherwise output \`P=(d−1 ± hashbyte mod28) mod28\`. Forward mode represents EA by a repeated ciphertext rune; the other 28 symbols select one of 28 nonzero steps. This lossless grammar makes the 86 original within-page doublets a proposed explicit escape channel, though no source asserts that EA was intended.

Both signs are tested for each mode/serializer: **2×2×2 = 8 fixed complete original-ciphertext inverses**. Every model derives every subsequent pad from recovered plaintext, so there is no missing state in the implementation.

**Rival mechanism, not selected for compute:** an independent high-entropy byte pad derived from the **unknown external page whose SHA-512 is printed on p56**; e.g. use an AES-256-CTR stream seeded by a digest of the recovered page bytes and map output bytes to GP29 arithmetic, preserving printed word separations. Its independent key source is historically legible and its cipher is reversible, but it lacks the actual matching page bytes, an authorized AES algorithm/nonce and a source-selected GP serialization. Its plaintext is currently underdetermined. No substitute private key or invented page is accepted.

## Full original test, independent long regions and controls

The [read-only, Windows-compatible CommonJS SFT](../sims/lp2_p57_emerge_plainword_sha512_ratchet_sft.cjs) was **[executed successfully with Node.js 22 on the original repository sources, GitHub Actions run 45001636055](https://github.com/FlareZ123/liber-primus/actions/runs/45001636055)**. It verifies the p57 six-rune seed; all original 55 nonempty unknown pages; the exact full-word parser alignment; all 86 within-page ciphertext doublets; and both independent long target intervals. It checks that each model can **re-encrypt all 12,956 original symbols**, and more importantly that an independently planted 12,956-rune stream of *authentic solved p57 GP plaintext*, remolded to the original 2,896 word lengths, roundtrips exactly through the nonlinear word-to-word state for **all eight variants**. This is a functional positive, not evidence that any original inverse is correct.

| Source-held-out measurement | Original inverse outcome |
| --- | --- |
| First long chapter region **p16–21** | **1,613** consecutive original runes; eight decoded GP29 IoC values **0.034380–0.035406** |
| Independent last long chapter region **p40–53** | **3,008** consecutive original runes; eight decoded IoC values **0.034425–0.035389** |
| Full 12,956-rune decoded book | Eight values **0.034489–0.035335** |
| Authenticated solved p57 GP29 plaintext | **0.062710** (95 runes), more concentrated than every recovered long span |
| Explicit EA exception in step architecture | **86** recovered EA symbols by construction, matching source repeat bits; other symbols remain statistically near flat |
| Native source-sized planted reversibility | **8/8 exact full-length inverses** |

All eight original p16–21 and all eight p40–53 long outputs are near the uniform random-GP baseline of **1/29 ≈ 0.034483**. The tested 200-rune previews are likewise unintelligible in ordinary GP English. The highest regional IoC, **0.035405568** (rune UTF-8/28-step/positive sign, p16–21), remains far below the **0.062709966** genuine p57 control. This is not an absolute theorem about every possible plaintext language, intermediate binary register or any alternative word-hash convention. It is a decisive negative for the eight frozen direct ordinary-GP readings, with a fully functional source-sized positive control.

## Research decision

**Retire this particular p57-EMERGE→p0 plaintext-word SHA-512 ratchet.** It produced neither a 200-rune authentic plaintext opening nor a valid independent long holdout. Further serialization or digest sweeps without an author clue would reintroduce the exact source-selection defect. The independently plausible *missing external page* branch remains blocked by absent authentic bytes and missing cipher selection; it should not receive a guessed AES key. A potentially productive next discovery would be an actual p56 hash preimage or a first-party cipher/key instruction that selects how to use it. The currently recorded original-source clues and statistical constraints still admit multiple encryption mechanisms.
