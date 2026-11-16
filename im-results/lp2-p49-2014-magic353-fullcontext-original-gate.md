# The authentic 2014 3–5–3 magic-square cores do not directly decode LP2's table-flanking sentences

**Agent 4, 16 November 2026. Classification: an original-cipher, all-source-F-mask, finite negative.** The unchanged printed book admits no legal inverse under the specified one-step GP29 Hill interpretation of the three historical Cicada magic squares, irrespective of which ciphertext F positions are taken as literal plaintext-F bypasses. The original test recovers **no unknown plaintext, key, table instruction, or destination**. The approach is a new p49/table/p51 consumer and does not supersede the already completed p55 43-interior Hill-square tests.

## Human-visible proposed solve route

The Cicada 2014 Stage10/11 path required three original magic squares. Their preserved printed sizes are **5×5, 7×7, 5×5**. The authentic solved LP2 p57 instruction asks the reader to shed circumferences and find divinity within, giving a *plausible* reason to remove each square's one-cell outer border. That yields three invertible modular matrices of size **3×3, 5×5, 3×3**, in this original order. This does **not** constitute proof the creator intended to connect the historical squares to the later pp49–51 table. Direct Hill algebra is an independently selected common square-matrix operation.

The original numerical table occupies pp49–51, between complete neighboring printed sentences. Its source-order 256 two-character tokens have the conventional conditional radix60 decoding to 256 bytes, SHA-256 **`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`**. Reading these bytes modulo the 29-symbol Gematria Primus field, the first byte **203** is zero. The three proposed data units are therefore:

| Original unit | Printed source boundaries | GP29-sized symbols | Source-F (zero) positions |
| --- | --- | ---: | --- |
| First square | p48 final72 plus all p49 | **138** | 13,32,35,37,65,71,75,105 |
| Middle square | Whole 32×8 grid, conditional base60 bytes mod29 | **256** | 0,23,81,149,192,220,229 |
| Third square | All p51 plus p52 first78 | **170** | 3,57,60,91,93,133 |

The surrounding units are full complete printed sentences, **138 runes/33 words** and **170 runes/40 words**, rather than arbitrary clipped-page segments. The middle table is a numerical object, and its mapping to a rune-like GP29 stream is explicitly *hypothetical*. The missing step is an original authored instruction specifying this map, square multiplication direction, and whether F transparency carries over from the solved p56 cipher.

A contemporary solver could plausibly try the 3–5–3 cores as a single reversible linear operation. The strongest alternative is that the table's purpose is an unrelated byte payload, key schedule, or navigation map. The test below rejects only the proposed one-step operation.

## Full exhaustive original inverse, no key or crib search

Reduce each core matrix modulo29. All three are invertible. The exact inverse keys, in their historical source order, are

```text
K1^-1 = 19 12 16      K2^-1 = 20 24  7  4  1      K3^-1 = 28 15  5
        22 20 22              25 19 26  9 22              16 26 16
        16 12 19              25 11 23 11 25               5 15 28
                              22  9 26 19 25
                               1  4  7 24 20
```

Use either conventional Hill orientation, **column** `P=K^-1*C` or **row** `P=C*K^-1`, on consecutive blocks of the corresponding 3, 5 or 3 runes. Original printed positions and word breaks are held fixed. To give the proposal the most permissive interpretation of Cicada's historically genuine p56 cipher convention, at **every source-F ciphertext position** branch between (1) treating it as an unconsuming literal plaintext F and (2) consuming it as ordinary encrypted ciphertext. No other position may bypass. Exactly the masks that make the remaining symbol length divisible by the Hill block size are admitted, and **every one is exhausted**.

The authentic solved-p56 direction has the necessary law *plaintext F forces ciphertext F*. Thus every decoded candidate that contains F where the unchanged source ciphertext is non-F is formally impossible for this specified F-transparent consumer. No English scorer, subjective reading, chosen language, guessed square rotation, key phase, or fitted skip positions enter this test.

| Original input | Legal-length F-bypass masks, per orientation | Column: minimum forbidden plaintext F | Row: minimum forbidden plaintext F | Fully legal candidates |
| --- | ---: | ---: | ---: | ---: |
| Complete pre-table 138 | **85** | **5** | **3** | **0** |
| Original numeric 256 residues | **14** | **6** | **4** | **0** |
| Complete post-table 170 | **21** | **4** | **2** | **0** |

Even the most favorable source-compatible skip mask fails the key-independent historical F condition. For transparency, a minimum-contradiction row inverse of the complete **138-rune** pre-table sentence without any skip has forced plaintext Fs at source positions **12, 99, 137**, none printed as ciphertext F; the best posttable row inverse still has two forbidden F positions. The blockwise original-output GP29 distributions remain ciphertext-like; no meaningful sentence appears.

A separate exact control applies each source-derived Hill matrix and orientation to a known-GP source-native plant formed from the genuinely clear **95-rune p57** text, with literal F bypasses inserted at a known eligible mask. The same inverse recovers all **138/138**, **256/256**, or **170/170** planted positions, with zero forbidden F positions. Every tested original inverse also re-encrypts the full non-bypass original symbols exactly. These are algebraic implementation controls, not demonstrations of historical author choice.

## Interpretation and next decision

**Retire this fixed 3–5–3 whole-context Hill consumer with the historic F-transparent rule.** The source-derived square interiors remain genuine historical objects and the numerical table remains authentic printed data. Their hypothesized correspondence cannot supply a previously unknown instruction or plaintext via this operation.

The exact historical F necessity is only valid *conditional on LP2 unknown pages using the same plaintext-F bypass*. If the unsolved pages deliberately use a distinct cipher without F transparency, the same inverses still produce no readable original text under the standard orientations, but the contradiction count alone no longer excludes them algebraically. Different numeral registers, index stencils, or separate keys require independent first-party cues before further cryptanalytic effort. Do not rescue this candidate by changing square dimensions, arbitrary phases, or variable secret transformations to force English.

**Reproducer:** [source-original CommonJS/Node22 SFT](../sims/lp2_p49_2014_magic353_fullcontext_sft.cjs). Its source-file assertions, exact inverse matrices, original-length/mask/contradiction assertions, exact forward reconstructions, and 3 source-native positives passed an independent isolated JavaScript execution against the current GitHub source bytes. The source module has been committed and can be run natively with Node.js 22 in the repository root; no GitHub Actions run is claimed for it. This finding belongs in intermediate evidence, not established decipherment.
