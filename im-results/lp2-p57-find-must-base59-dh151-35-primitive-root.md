# p57 FIND/MUST yields a candidate DH group in the base-59 p50 reading

**Status:** intermediate structural hypothesis; no p55 plaintext recovered.  
**Reproduction:** `node sims/lp2_p57_find_must_dh151_gate.cjs`

## Result

The p57 word sums and the p50 table admit a compact, human-motivated chain under the provisional base-59 reading:

1. The Gematria-Primus prime-weight sum of **FIND** is 151.
2. The totient is φ(151) = 150.
3. At zero-based p50 table address 150, the base-59 reading has value 151: a self-pointer selected by φ(FIND).
4. The immediately outward cell, address 151, has value 186, which is also the p57 prime-weight sum of **MUST**.
5. Reducing that neighboring value modulo 151 gives 35.

This produces the candidate finite-field parameters:

```
p = 151
g = 186 mod 151 = 35
```

151 is prime, and 35 is a primitive root modulo 151. Since 150 = 2 * 3 * 5, it is sufficient to check:

| Check | Result |
|---|---:|
| 35^75 mod 151 | 150 |
| 35^50 mod 151 | 118 |
| 35^30 mod 151 | 64 |
| 35^150 mod 151 | 1 |

The first three values are not 1, so the order is exactly 150 = φ(151).

There are two additional geometric correspondences:

- φ(186) = 60, equal to the selected 60-cell inner ring.
- The outer ring has 76 cells, equal to the 76 p55 ciphertext runes.

## Why this favors base 59

At the same two table addresses, the base-60 reading gives 153 and 189. The first value, 153, is composite and cannot be the prime modulus of the ordinary finite-field Diffie–Hellman construction.

The base-59 table contains one occurrence of 151 and two occurrences of 186. Under a uniform random permutation of that same 256-value multiset, the probability of the *fixed* ordered pair 151,186 landing at addresses 150,151 is:

```
(1 / 256) * (2 / 255) = 1 / 32640
```

This is a conditional, fixed-selector calculation, not a discovery-wide p-value. The base-59 radix itself remains an interpretation, not an established fact; the selection was made after inspecting the p57 wording and table.

A separate deterministic 100,000-shuffle test searched the broader event of any eligible prime p57 word-sum self-pointer followed by another p57 word sum that is a primitive-root candidate. It found 2 hits for the base-59 multiset and 6 for base 60. The actual base-60 arrangement has no FIND self-pointer. These counts support specificity but do not remove the post-selection caveat.


## Original-scan qualification

The original scan set for this table is JPEGs 66–68 (LP2 pages 49–51), with **10, 13 and 9** complete rows of eight tokens respectively. The source resource declares the 60-character alphabet `0–9, A–Z, a–x`, but the **256 printed tokens use exactly 59 of those 60 characters: lowercase `f` is absent**. This is the concrete reason to test the alternate 59-symbol alphabet with `f` removed. It is not proof that the creator intended radix 59: the existing resource labels its conventional interpretation as a base-60 byte table, and both readings remain hypotheses until an independent instruction selects one.

The p49 scan has a **red ten-dot punctuation mark arranged in three columns of 3/4/3 dots** immediately after its third runic line and before the numeric rows begin. It is the already-censused p49 ten-dot mark (original scan 66.jpg, approximate center x=1710,y=1106), not a 3×3 nine-dot square or an additional selector. The identical ten-dot stencil also occurs on original physical pp36,38,56 (see `im-results/lp2-original-dot-punctuation-physical-census.md`); the known p56 cipher does not reset its prime-totient clock at this punctuation type. The p49 placement visibly marks the transition to the numerical insert, but no first-party cipher rule for it has been found.

## Historical DH operation: which party owns which values?

The **PGP-authenticated 26 January 2013 TCP challenge** requires a connecting client to send `DH [p]` and thus **select modulus p**. The server chooses its own **base b and private exponent**, replies with the base and server public share, receives a **client public share**, and replies with the resulting shared value. The original signed *illustration* is `DH 23 → 01 OK 5 8 → 19 → 03 DATA 2`. A separate March 2013 participant-test log shows `DH 3301` with **participant-selected** base2757 and secret331, public share1264, remote-client share2800 and result1067. The log does not authenticate these generated values as an author-selected 2014 key. No signed Cicada source identifies `DH 151`, base35, a participant/client key for later LP2, or a 76-rune receiver. The same signed challenge's `BASE29 3301 → 3QO` illustrates a conventional *alphanumeric numeral*, never a Gematria Primus rune encoder. `NEXT` simply accepts participant-selected text. [Verified signed-source report](../resources/external/2013-tcp-server-signed-source.md) · [original challenge as published](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/other/2013_TCP_Server.md) · [independent participant log witness](../resources/external/2013-tcp-live-test-vectors.json).

The proposed source arithmetic makes **(p=151,g=35)** a valid finite-field DH *parameter candidate*. Its multiplicative group order is `150`, of which exactly **φ(150)=40** nonzero residues are primitive roots (**26.67%**). Thus the primitive-root condition is compatible with DH, without being a rare independent confirmation. **29, 60 and 76 do not divide 150:** none can be a subgroup order. Stronger, because `gcd(150,29)=1`, **every homomorphism of this DH group to additive GP29 is constant**. A reversible 29-rune DH output needs an independently selected, nonhomomorphic byte/rune conversion; the prime pair alone cannot furnish a full 29-symbol group-preserving alphabet or 60-/76-cycle. This does not exclude explicitly authored key derivation or output conversion.

## A conditional private-exponent candidate: OUR = 21

The original 60-cell inner ring (selected by `φ(MUST)=60`) contains **60 two-digit source numerals**. Concatenate their digits into one 120-digit base-59 integer and reduce modulo the candidate DH group order `150`. Clockwise and counterclockwise from original cell149 both give **21**. The independently printed p57 word **OUR** has GP-prime sum21. One possible speculative private/public pair is `a=21, A=35^21 mod151=107`. Value107 is also a GP prime weight (rune IA) and appears **exactly once** on the numeric table's outermost ring at original zero-based cell24. The source gives no instruction to concatenate all ring tokens, select OUR as a private exponent, or interpret that outer cell as a DH public-share message. Agent23's already executed direct a21 consumers produce no p55 plaintext, and the obvious `q^21 mod151 mod29` symbol map reaches only 16 of the 29 GP values, so it is not a reversible 29-symbol substitution.

**Exact conditional-null correction to the apparent two-direction corroboration.** Each source table *token* is two base59 digits. Concatenating tokens modulo150 therefore applies `59² ≡ 31 (mod150)` per token, and `31^k ≡ 1+30k (mod150)`. The 60 original inner-ring token **values sum to 6,951**, so their sum mod150 is **51** and mod30 is **21**, irrespective of reading order. Let `E_forward` be the 60-token 120-digit numeral modulo150 and `E_backward` the reversed ring traversal keeping the source-selected first cell149 in place. For **every permutation of the same source tokens**, an algebraic identity gives

`(E_forward + E_backward) mod150 = (92×6951) mod150 = 42`.

Both outputs must equal 21 modulo30, limiting each to **{21,51,81,111,141}**. Thus **`E_forward=21` if and only if `E_backward=21`**, independently of the token order. The two observed 21 outputs are *one* event, not two independent hits. In exact matched 200,000-trial deterministic permutations of all source ring tokens, the dual-21 result occurs **39,807 times (19.9035%)**. Holding the original first cell fixed and shuffling only the remaining 59 values gives **40,176/200,000 (20.088%)**. The sole distinct p57 printed word-sum below150 congruent to the source-invariant 21 mod30 is **OUR** (other distinct eligible sums:55,66,72,86,115). This specific start/word equality is therefore a low-discrimination conditional checksum, although it could in principle still be an intentional selector.

The [exact algebraic original-input SFT](../sims/lp2_p57_our21_ring120digit_orientation_null_sft.cjs) establishes the identity for **all 400,000** shuffled original arrangements with exact source-retention, distinguishes a single 1-in-5 match from two apparent corroborations, and uses no unknown ciphertext score. This downgrades the `OUR21` exponent clue's independent strength. It does not change the earlier direct consumer negatives or disprove another independently authenticated LP2 DH operation.

## New source-crossing p57 prime-rank/DH triple and 5×5 square (17 November, Agent44)

The previously separate FIND/MUST pair now has a more constrained, still
**hypothetical**, cross-round connection to the complete solved p57 parable:

1. In the exact original 95-rune p57, the first 2013-parable clause spells
   **TUNNELING** is printed in the original English. Its **ING** sequence is one source-authenticated ᛝ rune (inventory-transliterated NG), and the three
   source-native clause GP-prime sums are **1259, 1031, 1229**, prime ordinals
   **205, 173, 201**. All 95 rune indices agree with the source fixture.
   The genuine original 2013 `761.MP3` TXXX description prints
   `Parable 1,595,277,641`, exactly **1259 × 1031 × 1229**.
2. Use each *one-based* prime ordinal directly as a *zero-based* flat
   cell address in the original 256-entry p49–51 table. Those three
   printed tokens are **1G, 1v, 1E**, which read **75, 115, 73**
   under the independently conceivable base59 alphabet (the
   declared base60 alphabet minus the absent lowercase f). Under
   conventional base60 they read **76, 117, 74**; under base59 at
   indices rank-minus-one they read **191, 146, 108**.
3. The p57 author-visible words give **FIND=151**, **MUST=186** and
   **OUR=21** in GP-prime weights. As in the earlier result, choose
   `p=151`, `g=186 mod151=35` and candidate local exponent
   `a=OUR=21`. **The original table itself already supplies the
   other participant's public share `B=115`, at the second
   prime-counted clause address173.** Therefore compute the
   candidate shared secret **directly from source-selected inputs**:
   `K=B^a modp=115^21 mod151=73`. This equals the
   value of the original table at the *third* clause address201.
   The first value75 is exactly `(p−1)/2`, with
   `35^75 mod151=150`, and the optional local public share is
   `A=35^21 mod151=107`. Because g35 is primitive modulo151,
   the **discrete logarithm** of source B115 to base35 is
   **13**, explaining the retrospective identity
   `35^13 mod151=115`. **Guessing b=13 or interpreting thirteen-dot
   stencils as a private key is unnecessary** to derive K73.
   Thus the table's three addresses directly give
   **[(p−1)/2, B, K] = [75,115,73]** under this hypothesis.
4. The original **2013** ID3 number supplies an independent
   arithmetical comparison: `1,595,277,641 mod256=73`, with
   **256** cells explicitly visible in the 2014 original table.
   The **76-cell outermost rectangular ring**, clockwise from the
   printed upper-left source cell, has at ring index `K=73` the
   original flat cell24, printed token **1n**, base59 value
   **107=A**. This closes a source-number → shared-key → original
   ring-index → DH public-share cycle.

### Geometric closure to the solved p56 PAGE word

The **same three clause prime-ordinal addresses**, without inspecting their
table values, occupy 32×8 grid coordinates **(25,5), (21,5), (25,1)**
in zero-based row, column order. They are three corners of a **5×5**
axis-aligned square (rows21–25, columns1–5). Its uniquely determined
fourth corner is source flat cell **169=(21,1)**, original
printed token **3m**, which under the *same* proposed base59
alphabet has value **224**. The genuinely solved p56 text
uses **PAGE twice** and `GP-prime(PAGE)=224`. This is a
new cross-page original-word match with no adjustable cell once the
three prime-rank addresses and the 32×8 grid were selected.

The four literal base59 corner values in printed geometry are:

| | Column1 | Column5 |
|---|---:|---:|
| Row21 | **224** = PAGE | **115** = B |
| Row25 | **73** = K | **75** = (151−1)/2 |

The left minus right column-corner sum is
`(224+73)−(115+75)=107=A`, exactly the proposed
21-exponent DH public share. The same table **under base60**
places value228 at this fourth corner and destroys both the
PAGE224 and A107 identities. Using `prime rank−1`
as each index shifts the whole 5×5 square one column left:
its missing corner is source cell168 with base59 value236,
and its corresponding column difference is7. Therefore **square
shape itself does not resolve the mixed-index convention**.
The corner values add a conditional, source-correct distinction.

This 5×5 geometry gives an inexpensive, human-visible reason to
reconsider the manuscript's instruction to **shed circumferences**
and its historically authenticated 2014 magic-square work. No
original caption explicitly joins the 2013 Parable's **prime
ordinals** to a 5×5 selection in the 2014 table. The selected **5×5 table frame itself is not a magic square**:
its five base59 row sums are **788,646,480,684,612**, with
nonconstant column and diagonal sums. Ranking its 25 distinct
entries from 1 to25 also gives unequal row sums
**78,65,48,71,63**. Thus the 2014 authentic magic squares can
motivate *noticing a five-by-five shape* but cannot identify this
numeric block as another valid 3301/1033 magic square. The internal
3×3 block has non-magic unequal row sums, and the original
76-rune receiver remains unidentified. ### Original p55 5×5 Hill-cipher recipient: complete original negative

The 76-rune physical p55 begins with one rune carried from the
previous p54 printed word. Its 75 remaining exact original runes form
**three consecutive 25-rune squares**. The source-selected table frame
above contains **25 base59 integers**; taking their canonical
row/column order modulo29 produces a concrete **5×5 GP29 Hill key**
with exact nonzero determinant **17 mod29**.

Treat the original 75-rune suffix as three 5×5 ciphertext matrices.
For each, apply either **left** or **right** key multiplication,
with the mathematically correct inverse K⁻¹ or the direct K
(as both minimal encrypt/decrypt orientations). All four original
outcomes are below the clear source-native p57 IoC:
**0.034234, 0.036396, 0.034595, 0.031712**, versus original
p55 suffix **0.038559** and clear p57 **0.062710**; all
decode to nonlinguistic rune sequences. The key inversion and
p55 75/75 exact forward reencryption pass. Independently
encrypting the first 75 genuinely clear p57 runes in the same
four conventions recovers **75/75** on every inverse.

The same original-source script also tests the simpler historically
plausible **GP29 additive consumer** with a repeating 25-value key,
using either the 5×5 source row-major order or a literal
**clockwise circumference peel** starting at the source-selected
bottom-left K73 corner. Both signs are frozen. All four
original 75-rune outputs remain nonprose with IoCs
**0.033153, 0.036036, 0.034595, 0.033153**, despite exact
original 75/75 roundtrips and native p57 positive plants.
The full p54–55 chapter is 308 runes, so a p55-only reset is
not authenticated; these experiments reject the exact 75-rune
page-local receivers, not a source-selected continuous chapter cipher.
[Windows PASS for both source-square consumers](https://github.com/FlareZ123/liber-primus/actions/runs/44150231888).

This excludes **only the exact 5×5 matrix receiver** from
the newly fixed source frame. It does not exclude a
keyed/byte-level role of that frame, the square as a navigation
instruction, or a differently authored cipher with supplied
plaintext controls. [Original 5×5 Hill source SFT](../sims/lp2_p50_clauseprime_square_p55_hill_sft.cjs) · [successful Windows run 44149368874](https://github.com/FlareZ123/liber-primus/actions/runs/44149368874).

The extra PAGE / A107
connections were also discovered retrospectively and cannot
be treated as independent cryptographic confirmation.

The three exact indexed table values each occur sparsely in the
unmodified original 256-value base59 multiset: 75 occurs twice, 115
twice, and 73 once. If both the three **fixed distinct zero-based
addresses** and the radix were specified *before* seeing their cell
contents, an exact multiset permutation would hit that triple with
probability `(2/256)*(2/255)*(1/254) = 1/4,145,280`. This figure is
**not an adjusted significance claim**: the radix, prime-counting
offsets, selected word sums, and DH interpretation were assembled
retrospectively, with other numerical alignments already searched.
The discrete log13 is a derived consistency check, not a required
key-selection degree of freedom.
The three clause sums were simultaneously used to construct the
original 2013 decimal, so those four source numbers are dependent.

The useful advance is a **fully specified source-derived candidate
DH tuple and cross-round key scalar** with several independent
artifact-typed checks; none of them is a decryption. Its most severe
missing selector is interpreting the prime-counting function
`π(sum)` as an offset in the original zero-based table, together with
the base59 codec and word-specific roles. The **other private exponent
b=13 is optional**, recoverable as the discrete log of the table's
own `B=115` in the candidate g35 group. The source needs to select
`OUR=21` as a private exponent and explain why the 2013 DH
protocol should be applied to the 2014 table; neither is established. Existing direct p55 DH/ring consumers remain
nonlinguistic, including the new frozen K73 ring receiver below.
One original 76-rune plaintext interval with independently identifiable
meaning or a genuine first-party decoder selector is required before
promoting the hypothesis. The new square geometry selects a *candidate
source-sized 5×5 frame*, not a decryption key schedule.

**Reproduction:** [Windows Node22 original-source SFT](../sims/lp2_p57_primeordinal_dh73_source_sft.cjs)
and [successful manual Windows CI run 44146610169](https://github.com/FlareZ123/liber-primus/actions/runs/44146610169).
This SFT checks exact 95/95 source runes using the authenticated ING→ᛝ source spelling, all three original table
tokens and both rival encodings, the historical ID3 string, the
full DH equalities and the outer-ring selected share. It is a
reproducible arithmetic correspondence, not recovered ciphertext.

## Frozen outer-ring K=73 self-index and p55 receiver (Agent44, 17 November)

A subsequent original-source question asked whether the proposed DH shared scalar
`K=35^(21×113) mod151=73` could select a 76-cell key for p55, and whether the
unique outer-ring value 107 could be an independently confirming DH public share.
This is **conditional on the earlier speculative p=151, g=35 and a=21**
selection, with no authenticated instruction for private exponent b or ring start.

Using the 76 literal outer cells of the source 32×8 table, clockwise from the
printed top-left corner gives a 152-digit base-59 concatenation with
`b mod150=53`; anticlockwise from the same corner gives `b=143`.
Neither gives b=113. Of **all 152 circular starts and both traversal directions**,
32 produce b=113 and K=73. Exactly **one** additionally has the value
`107=35^21 mod151` at its own `K mod76` ring index: counterclockwise from
outer-ring index70. Its selected key-index is 73, original flat source cell24
(token `1n`, base59 value107). The starting index70 and counterclockwise
orientation are not selected by an independent first-party clue.

**Exponent-equivalence audit (Critic, 17 November):** Since `35` has multiplicative order 150 modulo 151 and `a=21`, the purported public share `A=35^21 mod151=107` has order `150/gcd(150,21)=50`. Consequently `K=A^b mod151` depends only on `b mod50`: **b=13, 63 and 113 all give K=73**. Their actual `g^b` public shares differ: **115, 131 and 56**, respectively. The original table value `B=115` corresponds to the specific `b=13` choice; a ring-concatenation `b=113` reproducing the *shared K* alone is mathematically forced by its congruence to 13 modulo50 and is **not a second confirmation of the original table triple**. This exact degeneracy strengthens the already recorded stop decision on post-selected ring-start and exponent searches. It leaves the arithmetic triple intact but supplies no independent source-selected private exponent or p55 decoder.

The correct comparison is the *searched* event across those 152 starts, rather
than a fixed-start 1/76 coincidence. An exact original-multiset-preserving
10,000-shuffle test with frozen seeded xorshift found **8,960/10,000** trials
having *some* DH self-index and **3,623/10,000** having at least one
`b=113, K=73, value=107` match. The preselected original `start70,
counterclockwise` position matched in 141/10,000 shuffles, but this position
was chosen from the original success and is **not** a valid predeclared p-value.
The original observed `1/152` self-index is therefore not distinctive under
the actual post-selected search.

A single bounded, reversible p55 receiver was also tested on the **76 original
ciphertext runes**: shift the clockwise 76-cell outer-ring key by the proposed
shared K=73, reduce each base59 value mod29, and add or subtract it from the
corresponding GP29 rune; reverse the geometric ring direction as the only
orientation alternative. The four resulting original-cipher IoCs are
**0.03544, 0.03018, 0.03439, 0.03439**, versus original p55 0.03789
and genuinely clear p57 0.06271. All four produce nonprose, though all
76/76 original ciphertext runes re-encrypt exactly and a separate native-GP
p57 plaintext plant is recovered exactly. These are necessary implementation
checks, not key authentication. No actual p55 plaintext was recovered.
This excludes only this fixed ring-rotation additive consumer.

**Reproduce:** [original corpus plus deterministic SFT](../sims/lp2_p50_outerring_dh73_selfindex_sft.cjs).
**Decision:** the outer-ring DH cycle should not receive further cryptanalytic
priority without a first-party ring start, integer/byte serialization and
decipherment rule. The independent 2013 ID3 integer/prime-rank/73
correspondences remain interesting hypotheses, but they do not repair the
missing receiver.

## Direct tests already made

The reproducible script tests both clockwise and counterclockwise ring traversal and both additive signs for three low-parameter DH consumers:

- Treat inner-ring values as exponents and derive a stream from 35^v mod 151, reduced modulo 29.
- Treat p55 GP-prime weights as public shares and inner-ring values as exponents; derive each DH value q^v mod 151, reduced modulo 29.
- Treat outer-ring values as public shares and inner-ring values as exponents; derive each value^v mod 151, reduced modulo 29.

None yields intelligible p55 plaintext. These are bounded negative results, not an exhaustive rejection of every possible DH construction.


A known-clear-text control was also run against the natural 180-cell interior left after removing the outer ring. The p57 95-rune clear text was aligned to the final 95 cells under inner-rectangle row-major order and under the radial ring orders (outside-in / inside-out, both directions). The direct encodings
`tableValue mod 151 = 35^(GP rune index) mod 151` and
`tableValue mod 151 = 35^(GP prime weight) mod 151`
produce at most **2/95** and **1/95** matches respectively; no ordering gives a coherent encoding, and the three p57 F positions do not all map to a common transparent/identity value. This rejects the simplest exponential-substitution reading of the group pair on the known p57 control. It does not reject a keyed or transposed use of the group.

A separate BASE29 length check also fails to produce a direct 76-symbol key: converting the 60 raw inner-ring values gives 110 digits; converting their defined totients (omitting the zero input) gives 102 digits.

A 38-pair interpretation of p55 as BASE29 public-share integers was also tried with the first 38 inner-ring exponents. Its fixed-width BASE29 output is 76 symbols but is not readable, and one pair reduces to zero modulo 151, which is not a valid DH public share.

## K73 as a p56 prime-totient start: bounded p55 receiver test (Agent8, 17 November)

The candidate DH73 scalar K=73 suggests one tightly bounded reuse of the already solved p56 receiver: begin the p56 \(\varphi(p)\bmod29\) key stream at prime 73, or at the 73rd prime (367), and retain the exact p56 rule that literal plaintext F is transparent and does not consume a prime. The original p55 page has 76 runes and 17 printed word groups; the first group is a one-rune **NG** carry from p54, leaving 16 complete words. Ciphertext-F positions are 15, 25, and 41 (zero-based).

The test enumerates every legal transparent-F mask for four fixed cases: both prime-start readings, each with the full 76-rune page or the 75-rune complete-word suffix after the carry. No sign, key offset, page phase, or alternate cipher is searched. The native p56 positive control (85 runes, start prime 2, literal-F mask 8 at offset 56) recovers the established plaintext exactly.

| K=73 interpretation | p55 input | Legal F masks | Result |
|---|---:|---:|---|
| prime value 73 | 76 runes | 0 | no legal inverse |
| prime value 73 | 75 complete-word runes | 0 | no legal inverse |
| 73rd prime = 367 | 76 runes | 1 | nonlinguistic output |
| 73rd prime = 367 | 75 complete-word runes | 3 | all nonlinguistic |

The only candidate after excluding the carry begins WANTH RIA LB OIAJYEAE; the full-page candidate begins O UECAE AED EOW. Neither is readable prose under the original word boundaries. This rejects only the direct transfer of the solved p56 prime-totient receiver with K=73 interpreted as a prime start. It does **not** disprove the DH73 arithmetic candidate or another independently selected receiver. In particular, the 2013 signed TCP specification authenticates DH as an available protocol operation but does not prescribe how its shared scalar should consume LP2.

**Reproducer:** [original-source Node SFT](../sims/lp2_p55_dh73_prime_totient_start_sft.cjs). It reparses the original transcription, checks the exact p55 page and word boundaries, verifies the p56 known-plaintext positive control, and enumerates only the four fixed K73 start/boundary cases.

## Assessment and next decision

**Exact original-source observations:** the adjacent base59 FIND/MUST table pair
at cells150–151; the p57 three-clause GP-prime sums and prime ordinals;
the source-prime-rank 5×5 square whose missing fourth corner is
base59 **PAGE=224**, with column-corner difference **A=107**;
original base59 token values **[75,115,73]** at addresses **[205,173,201]**;
the 2013 ID3 decimal product and its residue73 modulo256; and a clockwise
outer-ring cell at offset73 with value107. The proposed **source-computable shared value**
`K=115^21 mod151=73` uses table-public B115, p57 OUR21,
and FIND151; optional A107 uses g35 from MUST186.
The B-base-g discrete log13 is mathematical confirmation,
not an input or first-party private key.

**Historical inference remains provisional:** neither the signed 2013
DH example nor LP2's printed instructions selects base59 over base60,
the prime-counting function π(sum) as a zero-based table offset,
the ID3-to-grid modulo operation, the role of OUR as a private
exponent, or a GP29 key/receiver.
The 13-dot stencils are widespread and have no authenticated
DH role; **their count is not needed** to compute the candidate K73. The alternative ring
concatenation exponent b113 requires postselected ring starts and
fails the shuffled-source original-multiset gate.

**Original unknown-page outcome:** none of the completed p55 direct
DH, ring, fixed additive, or direct BASE29 receivers has produced
authentic unknown plaintext. A mathematically closed 2013–2014
correspondence is now worth preserving and considering as an
independent clue, while a new cipher campaign is unjustified until
some source selects its **recipient and reversible operation**.
The direct K73-to-p56-prime-totient start transfer is now rejected in both natural prime-start readings. The first new decisive step should identify a first-party operation
for the scalar73 or recover an actual original 76-rune p55 plaintext
interval. Do not treat test-fitted keys, synthetic plants, or a
matching original cipher round-trip as successful decryption.

## Reproduction inputs

- `resources/liber-primus/base60-grid.json` — original two-character p50 tokens.
- `resources/liber-primus/lp2-corpus.json` — rune indices, transliterations, and prime weights.
- `resources/liber-primus/lp2-transcription.txt` — p57 word boundaries.
- `resources/external/2013-tcp-server-signed-source.md` — historical BASE29/DH protocol transcription.
- `sims/lp2_p57_find_must_dh151_gate.cjs` — historical FIND/MUST arithmetic and direct-consumer reproduction.
- `sims/lp2_p57_primeordinal_dh73_source_sft.cjs` — exact 2013/p57 three-clause DH73 source cross-check.
- `sims/lp2_p50_outerring_dh73_selfindex_sft.cjs` — original p55 K73 receiver and ring-start original-multiset null.
