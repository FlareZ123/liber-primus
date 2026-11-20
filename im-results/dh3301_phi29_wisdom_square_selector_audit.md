# DH3301 six-representative φ(e) mod 29 Wisdom-square selector audit

**Classification: intermediate, source-constrained state/navigation candidate; no p21 plaintext recovery or source-selected Hill key established.** The 5×5 φ-grid / p36 state packet and forward-H p21 word-address readout reproduce. The later determinant-one matrix maps the p21 pair numerically to THE, but its row construction is not source-selected, the target THE is already present in the H2D word-index readout, and no untouched receiver validates the key.

Under the conditional one-based row-major exponent selector, exactly one of the six DH3301 exponent representatives selects a prime-valued cell in the 5×5 Wisdom square: e=1661 → φ(e) mod29 = 21 → cell 21 = 151 → 36th prime → p36.

## Evidence and provenance

- The GPG-verified signed 26-Jan-2013 TCP-server source authenticates the general BASE29/DH/NEXT protocol. It does **not** authenticate the specific DH3301 participant exchange.
- The client share / server base data used here (base=2757, modulus=3301, client public share=2800, server secret=331) come from the separately archived **unsigned participant transcript**, summarized in [the DH11 field report](lp2-2013-base29-dh11-field-power-gate.md). The exact client-share record was publicly added to the current archive mirror in 2024, after LP2; see [the publication-timing gate](lp2-dh3301-share2800-publication-timing-gate.md). It is not a demonstrated clue available to an ordinary 2014 solver. The signed 2016 word index 36 independently points to p36 under the inferred page/fragment map, so the exponent selector is corroboration, not a necessary p36 input.
- The 5×5 Wisdom square is the derived row-major transcription [05-square.txt](../resources/external/derived/2014-stage04/05-square.txt), also discussed in [the 2013 Wisdom / 2014 Stage04 source-bound report](2013-wisdom-2014-stage04-256bytes-lp2-bound.md). The Wisdom source foregrounds primes and the totient function, motivating—but not proving—the proposed operation.
- Canonical LP2 page lengths come from [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json).

Pinned Git blob SHA-1 values:

| Input | Git blob SHA-1 |
|---|---|
| Signed 2013 TCP source note | 75fb7d95e90e4a920328ed645de930f68b71c22a |
| Unsigned DH3301 arithmetic report | 1e7218c8a51673a22544283e28dde923b013ff10 |
| 5×5 square transcription | f081bf3bd3cb45b55359fa0e8961b1f033aa10c7 |
| LP2 corpus | 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 |
| Wisdom / Stage04 source-bound report | db39dc4d7d19b2567c1145ecbf0349e6df5ef843 |

## Frozen DH and selector calculation

The six ordinary-range representatives are e=11+550k, k=0,…,5. Modular arithmetic verifies 2757^e mod 3301 = 2800 for every representative. The base has order 550: 2757^550 mod3301 = 1, while exponents 275, 110 and 50 do not produce 1. The server-side checks also reproduce public share 1264 and shared secret 1067 using server secret 331.

For each representative, compute Euler's totient φ(e), reduce it modulo 29, and use that residue as a **one-based** row-major cell number in the 25-cell square:

| DH exponent e | φ(e) | φ(e) mod29 | One-based cell | Cell value | Prime? | Prime rank |
|---:|---:|---:|---:|---:|---|---:|
| 11 | 10 | 10 | 10 | 18 | No | — |
| 561 | 320 | 1 | 1 | 272 | No | — |
| 1111 | 1000 | 14 | 14 | 245 | No | — |
| **1661** | **1500** | **21** | **21** | **151** | **Yes** | **36** |
| 2211 | 1320 | 15 | 15 | 226 | No | — |
| 2761 | 2500 | 6 | 6 | 366 | No | — |

The selected value 151 is the 36th prime. Physical page 36 contains exactly 238 runes, matching the degree of the unique monic irreducible factor R238 of the original p50 table polynomial. The same 151 also appears at the square's symmetric cell 5; cells 5 and 21 are the endpoints of its anti-diagonal.

## Indexing sensitivity and limits

The one-based convention is natural for a human reading a printed grid, but it is still an assumption. If the residue is treated as a zero-based array index instead, the six values become 226, 138, 226, 131, 18 and 199. Two are prime (131 and 199, prime ranks 32 and 46), so the selector is no longer unique. The proposed rule therefore depends materially on ordinary one-based cell numbering.

This test strengthens the proposed **page selector** but does not establish a cipher, key, or recovered plaintext. The specific DH3301 exchange is unsigned, and no authenticated instruction explicitly says to apply φ(e) mod29 as a cell address. The existing p36 direct field, phase and stream tests remain negative. The new 5×5 phi-grid consumer below is a distinct state/navigation route; it does not yield plaintext and must not be conflated with those failed field/phase/stream hypotheses.

## p36 receiver: the phi-grid emits a source-indexed DH state packet

This is a new state/navigation consumer of the 5×5 Wisdom phi-grid, not a plaintext decryption.

The signed 2016 message's zero-based word index 36 is **GOOD**. Under the already documented physical-page fragment convention (source index i selects page i and one-based local fragment i+1), this selects p36 fragment37:

\[
C=[2,22,4,1,20].
\]

The 2014 LP1 p05 / Stage04 Wisdom square is transformed entrywise by Euler's \(\varphi\) function and reduced modulo 29:

\[
M=\begin{bmatrix}
12&15&10&14&5\\
4&24&19&12&6\\
25&23&14&23&25\\
6&12&19&24&4\\
5&14&10&15&12
\end{bmatrix},
\qquad \det(M)\equiv28\pmod{29}.
\]

The column-vector product is:

\[
M C=[15,19,4,21,4]=[b,B,q,p-K,q].
\]

This exact ordered state packet is a singleton among all **318** five-rune physical-page fragments under the four simplest direct Hill conventions: \(MC\), \(CM\), \(M^{-1}C\), and \(CM^{-1}\). Only \(MC\) has a hit, and it is p36 fragment37. The other three conventions have no hit against the independently reconstructed state packet.

The five output values are also indices into the authenticated 2016 word list:

    15 19 4 21 4
    WORDS THEIR EMPTY IS EMPTY

This is an address/state vector, not a grammatical plaintext claim.

### The EMPTY endpoints select an H-bracketed receiver

The two endpoint values 4 select p4 fragment5, a literal one-rune **H** token. It is a punctuation-bounded text fragment, not a separate graphic H emblem (the enlarged red initial on the original p4 image is B). The middle value 21 selects p21 fragment22:

    p4 fragment5   = [8]       = H
    p21 fragment22 = [19,7]
    p4 fragment5   = [8]       = H

Under the proposed signed-2016 map i → physical page i / one-based fragment i+1, there are 42 extant indexed objects (p32 is absent). Exactly one is a singleton of any rune value: p4 fragment5 = H. This is not global uniqueness: a full p0–p55 scan finds four one-rune H fragments (p4/5, p7/36, p30/52, p39/35). The uniqueness is conditional to the 42 source-indexed coordinates, and makes the repeated q=4 endpoints a discriminating H bracket within that map.

Thus the tail of the matrix output selects H — [19,7] — H. Apply the already established two-dimensional transform

\[
H(x,y)=(x-y,x+y)\pmod{29}
\]

to the p21 pair:

    H([19,7]) = [12,26] = THE / NUMBERS

The output indices 12 and 26 select p12 fragment13 and p26 fragment27:

    p12 fragment13 = [28,1,0,15,20]   length 5   GP0 mod29 = 6
    p26 fragment27 = [4,19,22]        length 3   GP0 mod29 = 16

Applying the same H transform to their lengths and to their GP0 sums gives two more state pairs:

    H([5,3])  = [2,8]   = [K,A]
    H([6,16]) = [19,22] = [B,p-1].

### The numbers branch: a second state pair and the p25 convergence

The p21 H2D output [12,26] is a pair of **2016 source-word indices**: THE / NUMBERS. Their Gematria Primus values are:

    THE     -> [2,18] -> GP0 sum 20
    NUMBERS -> [9,1,19,17,18,4,15] -> GP0 sum 83 -> 83 mod29 = 25

Under the candidate modulo-29 page-address rule, these numbers select p20 fragment21 and p25 fragment26:

    p20 fragment21 = [11,10]  length 2  GP0 sum 21
    p25 fragment26 = [25,17]  length 2  GP0 sum 13

The same H transform gives:

    H([2,2])   = [0,4] = [0,q]
    H([21,13]) = [8,5] = [A,g].

The 42×42 ordered-pair census has **two** hits for this state signature: (p20,p25) and (p20,p38). The p20/p38 collision is real and must not be hidden. The p25 endpoint is independently supported by the p23 one-rise route and by the existing unique [K,g] side object on p25 (the 627-object census in [the p25 cube-route report](lp2-2013-goodluck-p25-cube-route.md)); p38 lacks that object. The GP0-sum-to-page reduction is still a hypothesis, not an explicit instruction. The separate raw-GP0/p50 prime-rank route remains an alternative reading of “their numbers”; see [the p50 page-triple report](lp2-2016-their-numbers-are-p50-prime-rank-page-triple.md).

### The determinant-one matrix is a numerical p21 candidate, not a validated decryption

The three state pairs now close a triangle:

    p12/p26 H(lengths)       = [K,A] = [2,8]
    p20/p25 H(GP0 sums)      = [A,g] = [8,5]
    p25 side-object H(outer) = [K,g] = [2,5].

Stack the source-ordered [A,g] and [K,g] pairs as rows:

\[
N=\begin{bmatrix}A&g\\K&g\end{bmatrix}
 =\begin{bmatrix}8&5\\2&5\end{bmatrix},
\qquad \det(N)=30\equiv1\pmod{29}.
\]

Its inverse is:

\[
N^{-1}=\begin{bmatrix}5&24\\27&8\end{bmatrix}.
\]

The original p21 image and canonical transcription show p21 fragment22 as glyphs ᛗᚹ, values [19,7]. The canonical GP29 alphabet maps these to M,W (not M,G: value 6 is G and value 7 is W). It is a standalone hyphen-bounded two-rune token. It also equals the state expression [B,g+K]=[19,7], and this raw pair occurs only once among the 465 two-rune fragments. The numerical inverse gives:

\[
N^{-1}\begin{bmatrix}19\\7\end{bmatrix}
=\begin{bmatrix}2\\18\end{bmatrix}.
\]

These are **Gematria Primus rune values**, not 2016 word indices: rune 2 is TH and rune 18 is E. The numerical output is therefore **THE**. Forward multiplication rechecks [TH,E] → [19,7] = MW = [B,g+K]. This is an algebraic round trip, not independent evidence that N is the intended key.

This is not a global two-rune cipher. Search all 465 two-rune physical-page fragments under N, N⁻¹, Nᵀ, and N⁻ᵀ: only N⁻¹ has a hit for the numerical target [2,18], and that hit is p21 fragment22. p21 itself has nine two-rune fragments; the other eight do not map to THE. The row-reversed state matrix also fails. However, the target THE is already present as the forward-H source-word readout [12,26], so this is a second encoding of a known clue, not a blind plaintext recovery. The p23 THE ONE RISE clue already has a source-supported operation—one application of the fixed +2 page rise, p23→p25 (with matching p33→p35 and p40→p42 uses). Reading ONE as determinant one is a retrospective analogy, not an independent selector for N.

The same key does not turn the p25 cube output OITOHL into the p28 READ OUT candidate. Keep the p21 decryption local until another source-selected receiver validates a broader mechanism.

### Independent p23 red-span state cross-check

The p36/p12/p26 route independently recovers q=4, K=2, and A=8. The first four p23 red-span fragment lengths are [2,6,3,5]. The same H operation gives:

    H([2,6]) = [25,8] = [-q,A]
    H([3,5]) = [27,8] = [-K,A]

These are exactly the p23 red-span outputs already reported in [the p23 instruction reconciliation](lp2-p23-instruction-reconciliation.md). The recovered K=2 also agrees with the [K,g]=[2,5] side object in the p25 cube route, where the p23 full-line state supplies g=5. This is cross-route state corroboration, not an additional plaintext recovery and not a change to the separate p23→p25 one-rise interpretation.

### Familywise control and stopping rule

Use every available source-indexed fragment i → page i, fragment i+1, for signed indices 0 through 42. There are 42 extant objects; p32 is the already noted missing coordinate. Charge **all 42×42 ordered pairs, including repeats**. The length channel alone is not decisive: 55 ordered pairs satisfy H(lengths)=[K,A]. In particular, the prefix [15,19] selects p15/p19; their lengths give [K,A], but their GP0 sums give [4,1], not [B,p-1].

Requiring both predeclared channels simultaneously leaves exactly one pair:

    (p12,p26) -> H(lengths) = [K,A]
              -> H(GP0 sums) = [B,p-1].

Thus the GP0-sum condition reduces 55 length-only candidates to a familywise singleton under this fixed page/fragment map and fixed H operation. In the same 42-object family, ten coordinates are two-rune fragments; applying the fixed N⁻¹ to those ten yields [2,18]=THE only at p21 fragment22. This is a restricted source-indexed confirmation of the 465-fragment census, not an independent blind crib. As a nonrecursive continuation control, the resulting [B,p-1]=[19,22] pair selects p19/p22; that pair gives H(lengths) [0,6] and H(GP0 sums) [17,9], not the state packet. Do not keep iterating the map to manufacture a path.

The first two matrix outputs [b,B]=[15,19] also agree with the independently reported p22 Bob-state receiver in [the p21–p23 corridor report](lp2-openpgp-is-the-road-pages21-23-direction-gate.md); that is corroboration from a different segmentation convention, not part of this fragment SFT. The same p36 ciphertext's earlier H5 shell [11,21,4,23,22]=[a+g,p-K,q,p,p-1] is documented in [the GOOD36 H-shell report](lp2-good36-hshell-is-road-router.md).

### Independent adversarial audit (Agent7, 20 November 2026)

The route was independently reconstructed from the canonical GP29 corpus/transcription, authenticated 2016 signed message, 2014 square transcription, and original LP2 page images. The numeric p36 and p21 observations reproduce, with the following discriminating controls.

**Word-origin and page/fragment offsets.** GOOD is source index 36 when zero-based and ordinal 37 when one-based. I charged both notations, page offsets −1/0, and fragment offsets 0/+1. The only exact M·C=[b,B,q,p−K,q] hits are the equivalent encodings (index 36, page +0, fragment +1) and (ordinal 37, page −1, fragment +0): both select the same physical object p36/f37. The other six combinations fail or do not supply a five-rune vector. Thus the physical coordinate is stable under equivalent numbering, but the map itself remains inferred rather than explicitly specified by the signed message.

**H polarity.** Forward H([19,7])=[12,26]=THE/NUMBERS is consistent with the p23 red-span route, which source-selects forward H. The natural inverse is not null: H⁻¹([19,7])=[13,23]=WAY/ROAD. Under the same page/fragment convention this selects p13/f14 and p23/f24; their lengths [6,8] and GP0 sums [11,26] map under H⁻¹ to [7,1] and [4,22]. Stacking those two pairs in the two natural row orders gives p21 inverse outputs [1,12] and [27,21], not THE. The forward branch has the stronger downstream state-pair fit, but the inverse branch is a real source-word alternative and should not be hidden.

**The p20/p25 collision and p25 side object.** The complete 42×42 ordered-pair census has two hits for the [0,q] / [A,g] signature: p20/p25 and p20/p38. P25 has independent page-level support from the already established THE ONE RISE → one +2 step p23→p25 route, and its predecessor-plus-five-rune side object is the unique [K,g]=[2,5] hit among 627 eligible side objects. This is meaningful cross-route evidence for p25, not proof that the GP0-sum-mod-29 page rule is authored. The side object is independently present in the prior cube family; no source instruction says to stack its H pair as a Hill-key row.

**All six natural state-pair row constructions.** Using only the three already derived pairs KA=[2,8], Ag=[8,5], and Kg=[2,5], I charged every ordered pair of distinct rows. The results are:

| Rows | det mod 29 | Inverse applied to p21 [19,7] | Hits for [2,18]=THE among 465 |
|---|---:|---|---|
| KA / Ag | 4 | [17,9] | p8/f10 and p41/f24 |
| KA / Kg | 23 | [8,4] | none |
| Ag / KA | 25 | [7,10] | none |
| **Ag / Kg (N)** | **1** | **[2,18]** | **p21/f22 only** |
| Kg / KA | 6 | [5,25] | p46/f15 |
| Kg / Ag | 28 | [27,22] | none |

N is the unique member of this narrow family that maps p21 to THE, and the determinant-one property is real. But no source-visible rule selects row stacking or this row order. The ONE RISE clue is already consumed by the independently reproduced +2 page operation; it does not independently select determinant one. Other row constructions also produce THE at other ciphertext fragments, so the target-word hit is not a global cipher validation.

**No untouched plaintext holdout.** The H readout has already selected THE as a 2016 source word before N is applied. The exact forward replay is guaranteed by multiplying by an inverse. The only tested secondary receiver, p25 cube output OITOHL, fails to become p28 READ OUT under N⁻¹. No second source-selected receiver or unknown plaintext is recovered.

**Decision.** Preserve the φ-grid/p36 state packet, the p4 H singleton, the p21 raw state-pair hit, and the forward-H THE/NUMBERS navigation as intermediate structural observations. Reject the determinant-one p21 Hill construction as a source-selected decipherment: the missing row-stacking rule is the first failed key selector, and the numerical THE is a re-encoding of an already-known source word.

### Evidence limits

- The 2014 LP1 p05 Wisdom instruction to treat the totient function as sacred and its 5×5 square, the signed 2016 word map, the separate LP2 p4 H marker, and the p21/p12/p26 fragments are observable source material.
- The particular 2013 DH3301 participant exponent e=1661 remains from an **unsigned** transcript; the exact client-share record was publicly added to the current archive mirror in 2024. Its \(\varphi(e)\bmod29\) selector is conditional and not an established 2014 player-visible clue. The signed 2016 word index 36 independently selects p36 under the inferred physical-page/fragment rule.
- The matrix operation is a plausible simple Hill/state transform, but no source explicitly states “multiply this matrix by this five-rune fragment.” The exact state packet and unique downstream pair materially strengthen it, but do not establish a universal cipher.
- The p20/p25 page selection depends on reducing GP0(NUMBERS)=83 modulo 29; the signed source says numbers give direction but does not explicitly specify this reduction. The p20/p38 collision means the [0,q]/[A,g] signature alone is not unique; p25 is favored by independent p23/GOOD LUCK and [K,g] evidence.
- The [A,g]/[K,g] row stacking and determinant-one Hill key are inferred. “THE ONE RISE” already has a source-supported +2 page-navigation meaning and does not independently specify det=1 or the matrix. The row-reversed key has determinant 28 and fails; all six ordered row-pair constructions are charged in the adversarial audit above.
- THE is already present as the first source-word index in the separate H2D readout [12,26]. The GP29 decryption to rune values [2,18]=THE is a second encoding of that clue, not an independent blind crib. The 465-fragment census establishes uniqueness only within the fixed source corpus and tested matrix orientations.
- This does not reopen the rejected p34–39 four-digit cuneiform 2×2 emblem Hill transfer or the global 5×5 direct-Hill scans. N is a state-derived key applied to one source-selected p21 receiver, not either of those fixed visual matrices.
- The DH state tuple is pre-existing, not a new discovery here; see [the signed-source register](lp2-dh-state-signed-source-register.md) and [the adversarial register audit](lp2-dh-state-register-adversarial-audit.md). The exact p36 state-packet hit is absent under the adversarial audit's near-miss tuple with b and K swapped.
- This does **not** reopen the rejected 7×7 Stage10 central-row phi/Stage05 composition on the 238-rune p36 body, nor the rejected 5×5 row-wise additive masks on the 553-rune numbered cuneiform enclosure. Those are different operations and remain negative; see [the bounded 7×7 composition test](lp2-cuneiform-p36-stage05-phi-composition-gate.md) and [the five-passage additive-mask audit](lp2-cuneiform-five-numbered-wisdom-inversion.md).
- The DH state is partly derived from the same 2014 square that supplies M, so the exact state echo is a cross-source structural fit, not an independent random sample. The signed 2016 word selector and the unique downstream dual-channel pair add discrimination, but do not remove the route's hypothesis status.
- No p21 plaintext recovery is established. The state-derived inverse maps p21 fragment22 numerically to THE, but the row-stacking/key selector is unsupported and THE is already present in the H2D source-word readout. No complete page plaintext or general LP2 cipher has been recovered.

**Reproducer:** node sims/lp2_wisdom_phi_grid_p36_dh_state_route_sft.cjs.

## Human solve-path hypothesis and next decision

A plausible player-visible path is:

1. The signed 2016 message supplies the “words are the map / their numbers are the direction” clue; the 2014 LP1 p05 Wisdom page supplies the prime/totient clue and 5×5 square; the separate LP2 p4 page supplies a literal one-rune H token.
2. The unsigned DH3301 exponent class plus the 5×5 Wisdom square conditionally selects p36. The signed word index 36 independently selects the same page under the proposed page/fragment convention.
3. The 5×5 φ-grid matrix on p36 fragment37 yields [b,B,q,p-K,q]=[15,19,4,21,4], which reads as source-word indices WORDS / THEIR / EMPTY / IS / EMPTY.
4. The q endpoints select the p4 one-rune H token around p21 fragment22 [19,7]. Within the 42 source-indexed page/fragment coordinates, p4 fragment5 is the only singleton and is H. H([19,7])=[12,26] selects the 2016 words THE / NUMBERS.
5. “Words are the map” sends indices 12 and 26 to p12/p26, whose two H channels recover [K,A] and [B,p−1]. “Their numbers are the direction” conditionally sends GP0 sums 20 and 83 mod29 to p20/p25, recovering [A,g] and [0,q].
6. The existing unique p25 side object supplies [K,g]. The three pairs [K,A], [A,g], [K,g] form N=[[A,g],[K,g]], with determinant one. Its inverse maps the p21 receiver to GP29 runes TH,E = THE.

This is a coherent human-solve-path hypothesis, not an established intended route. Its weakest links remain the unsigned DH participant exponent, the inferred one-based page/fragment convention, GP0(NUMBERS)=83 mod29 page reduction, and the source-unwritten row stacking used to form N. The p20/p38 collision is real; p25 is favored by independent p23 one-rise and [K,g] evidence.

**Next:** preserve the p36 state and forward-H navigation as intermediate evidence; do not describe p21 THE as recovered plaintext or generalize N. Reopen the Hill-key branch only if an original-source clue fixes the row construction before a new receiver is inspected. Do not rescue the failed p25 OITOHL→READ OUT test or recursively iterate the p19/p22 continuation.

**Reproducer:** node sims/dh3301_phi29_wisdom_square_selector_sft.cjs.