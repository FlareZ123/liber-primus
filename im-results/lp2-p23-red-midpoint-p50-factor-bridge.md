# P23 red midpoint recovers the 2013 H quadratic projectively, but supplies no ciphertext receiver

**21 November 2026, Agent25/Agent9; source-path update 21 November 2026, Agent21. Classification: an exact original-source GF29 factor bridge, a candidate p28→p23→p39 page-rise selector, and a second-base29-digit DH carry correspondence; all higher-level cipher interpretations remain provisional, with no recovered plaintext, author-selected key or executable original-cipher inverse. Original p23 (scan `40.jpg`) has a uniquely centered word boundary in its red 16-rune heading. A p28 readout/numbered route independently selects p23; the p23 page index plus its red-span length gives the candidate rise 23+16=39, landing on the centered red p39 triad. This strengthens the selection of the factor pair, but the addition rule is not proved to be authored and does not establish the 2-left/1-right extraction or DH scalar. The exact p23/p39 factor product divides the 256-value p49–51 table over GF(29), yielding a 252-symbol quotient. Tested Q consumers have not recovered plaintext.

## Source coordinates and the new bridge

The original LP2 p23 red heading starts at local rune 0 and has precisely sixteen runes, divided into four original printed words of lengths **[2,6,3,5]**:

```
original indices: 1 24 | 7 21 6 14 23 6 | 10 17 10 | 12 16 17 10 26
original runes:   U A   W NG G X D G       I B I       EO T B I Y
```

Its word boundary at zero-based rune offset **8** lies at the exact midpoint **8|8**. A census of **all 18** original red-rune spans recorded in `resources/liber-primus/lp2-ink-annotations.json`, with every original printed internal word break from `lp2-transcription.txt`, finds **p23 alone** with any internal word boundary exactly at the center of an even-length red span. The original scan `40.jpg` is byte-pinned at SHA-256 `d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee`.

The fixed three-rune reading formed from the **last two before** and **first after** that source-visible midpoint is the original p23 local offset **6,7,8**:

```
                 D   G | I
GP29 indices:   23   6 | 10
R(X) = 23 + 6X + 10X².
```

The PGP-signed 2013 TCP BASE29 example `3301 -> 3QO` already provides `H_2013(X)=3+26X+24X²`, with coefficients in ascending power order. In GF(29), the new independent red sequence satisfies **R(X)=27 H_2013(X)** exactly, including all three coefficients. The already recognized isolated three-rune physical p39 red group, scan `56.jpg`, remains `G_39(X)=27+5X+15X²`.

Reading the exact original 256 two-character p49–51 source cells as **conditional base60 bytes**, reducing each modulo29, and arranging them as descending polynomial coefficients gives

```
R(X)G_39(X) = 12 + 16X + 7X² + 24X³ + 5X⁴  (mod29).
B_table(X)  = [R(X)G_39(X)] Q_new(X), remainder = [0,0,0,0].
degree(Q_new) <= 251; 252 descending quotient symbols.
Q_new begins [0,23,10,15,28,2,3,4,20,15,4,6,...].
```

**Previously known p23 DH-state scalar gives a stricter literal prediction.** Agent5's 19 November [p23 five-dot / THE ORIGIN analysis](lp2-p23-fivedot-totient-origin.md) had already identified the first printed p23 line's **five word lengths [2,6,3,5,4]** with the authenticated signed-DH roles **[K,a,e,g,q]**; with physical page label p=23, these recover K=2 and A=g^a mod p=8. Consequently **R(X)=−K·H_2013(X)** exactly in GF29, and its three printed GP indices also equal the derived register selection **[p,a,A+K]=[23,6,10]**. This is a cross-register coincidence involving two different source channels (word lengths and rune values), and the K=2 role assignment was published before this triad was noticed. The p39 factor has an additional algebraic coincidence with the **same previously identified p23 state**: its g=5 and K=2 satisfy **G_39(X)=K⁻¹(X+g)²=15(X+5)²** in GF29, yielding exactly [27,5,15]. Consequently the entire observed quartic product obeys the particularly compact identity **R(X)G_39(X)=−H_2013(X)(X+g)²**, with no surviving arbitrary K scalar. The source red groups are physically complementary as well: the p23 centered 2-left/1-right triple and the p39 red3 straddling the exact midpoint of its entire 240-rune page at positions119–121. The double root −g and scalar −K are attractive retrospective readings of prior DH registers, while **neither polynomial assembly nor these scalings were dictated by a signed instruction**. Yet neither the signed DH message nor the manuscript directs solvers to multiply polynomial factors by negative K or to assemble [p,a,A+K]; both are **post-discovery choices**, and the 2-left/1-right midpoint read remains a hypothesis. The scalar connection sharpens a *candidate* human route without promoting it to proven plaintext.

This is the same established GF29 table codeword under an **internally printed second selector for H**. Because `R=27H`, its quotient is exactly `Q_new=14 Q_old` modulo29 (since 27·14=1 modulo29). The bridge adds no new entropy or independently authenticated key. It is a source connection, not a previously unknown table factor. The original base59 reading fails this H/G factorization, as documented in the earlier radix discriminator; our conclusion remains conditional on the historical choice of base60.

## Original base-29 carry beyond the factor code (Agent9, 21 November 2026)

**New independent data dimension, provisional interpretation.** The source factorization was previously evaluated only in GF(29). Retaining the **unmodified 256 original base60 byte values** and the **literal pre-LP2/source-red quadratic coefficients** gives a surprisingly compact second-order register. Treat the complete original table as descending polynomial coefficients; use each displayed quadratic's coefficients in ascending powers. The following are exact polynomial long-division remainders, with no adjusted key, phase, byte or source factor:

| Original source divisor | B mod29 | B mod841 | quotient of the remainder by29 |
| --- | --- | --- | --- |
| Signed 2013 BASE29 H = [3,26,24] | [0,0] | **[232,145]** | **[8,5] = [A,g]** |
| P23 centered R = [23,6,10] | [0,0] | **[87,783]** | **[3,27] = [e,−K]**, under the earlier p23 role labels |
| P39 red G = [27,5,15] | [0,0] | **[435,58]** | **[15,2] = [b,K]** |

Here \(841=29^2\); \(p=23\), server generator \(g=5\), public \(A=8\), shared \(K=2\) come from the signed 2013 example; \(b=15\) is **solver-derived** by \(5^{15}\bmod23=19\). The p23 heading role \(e=3\) comes from a separate earlier, provisional DH-length mapping. Thus the strongest direct four-coordinate observation is **H-carry [A,g], G-carry [b,K] = [8,5,15,2]**. The R-carry is *not* a third independent source channel: R=27H mod29, and the two literal integer lifts differ. The 2013 source never instructs taking a polynomial remainder modulo \(29^2\) or interpreting its carry as a DH tuple. The assignment of the four output integers to those particular DH roles was recognized *after* the outputs were examined.

This exact second digit **distinguishes the two previously algebraically admissible token orientations.** With the original two-character tokens reversed and the minimum admissible reverse radix 73, H/G still have zero mod29 remainders, but their mod841 carry is **[27,22,23,10]**, rather than [8,5,15,2], and the numerical values extend beyond the 0..255 byte range. With the canonical base60 orientation, the H/G third-level modulo \(29^3\) remainders are [3596,11078] and [8004,15196]; their next carry digit is **[4,13,9,18]**. No higher DH progression is inferred.

**Four-cell inverse, computed explicitly:** Holding the first 252 original table bytes unchanged, the four mod841 remainder equations associated with target [8,5,15,2] form an invertible 4×4 linear system for the last four descending coefficients. The first-252 contributions to the [H_X,H_1,G_X,G_1] remainder are [524,781,562,103] modulo841. Solving for tail \(b_{252..255}\) gives the unique mod841 vector **[180,36,189,80]**, exactly the four original printed cells and each in the valid byte range. This is an **in-sample reconstruction**, because the four-target interpretation was discovered using the full table. It does not constitute a blind prediction of untouched original ciphertext or prove that the last four cells were explicitly chosen as parity bytes.

**Preserved-source conditional null:** A deterministic 300,000-trial test (seed 0x3301bc23) shuffles complete original bytes *only between positions with identical residues modulo29*. Every trial preserves the original 256-byte multiset, every residue in its exact original cell, the entire mod29 H/G factorization, and the 0..255 range. Target **[8,5,15,2] occurs once**; H pair [8,5] occurs376 times, G pair [15,2] 348 times. However, if the association is broadened after discovery to **any** of the seven documented/derived DH integers {23,5,6,15,8,19,2} in all four carry slots, **1,001/300,000** permutations qualify (close to 1,018 expected for uniform four-symbol draws). The narrow ordered alignment is a research lead, **not a discovery-adjusted statistical significance or confirmed author intention**.

The exact original-byte, carry, four-tail inverse, byte-preserving null, third-layer and reversed-token controls are all in [the single-file Node22/CommonJS SFT](../sims/lp2_p50_base29_carry_dh_sft.cjs). The experiment adds recoverable four-symbol historical-state *candidate material* and narrows the base60-versus-reverse73 interpretation **conditional on the DH-role selector**. It does **not** recover any unknown-page plaintext, confirm a ciphertext consumer, establish a page/word clock, or convert the 252-symbol quotient into a decryption. The next decisive advance would require an original instruction independently selecting **mod29² polynomial remainders**, a payload-receiving operation, and a prospectively withheld original-source prediction. Do not use the after-the-fact DH mapping as a license for arbitrary key-family searches.

### Self-referential 32×8 receiver: the four carry digits select ASCII "IV"

A **new, inexpensive, literal source-shaped receiver** is possible without selecting a ciphertext key or varying a phase. The original panel has exactly **32 rows × 8 columns**. The H/G modulo841 carry is four digits in source order: [8,5,15,2]. Both pairs are valid **zero-based** (row,column) coordinates, because their second members 5 and 2 are smaller than 8. Read precisely those two original table entries under the previously fixed base60 byte convention:

| Original carry pair | Zero-based row,column | Table offset | Printed token | Base60 byte | ASCII |
| --- | --- | ---: | --- | ---: | --- |
| H carry [A,g]=[8,5] | (8,5) | 69 | 1D | **73** | **I** |
| G carry [b,K]=[15,2] | (15,2) | 122 | 1Q | **86** | **V** |

The exact output is **"IV"**. It may signify a cryptographic initialization vector or Roman numeral four. **No original source expressly selects either interpretation.** The one-based alternative accesses offsets60 and113, yielding bytes [106,143], which do not spell "IV". Swapping H/G makes "VI"; two-character words merit strict controls. The previously admissible reverse-token/radix73 parsing gives carry [27,22,23,10], with both columns invalid, so this receiver would conditionally select the normal table-byte direction.

A conditional shuffle was added to the existing original-byte/residue-preserving **300,000-trial** control. In every shuffled table, derive its fresh modulo841 H/G carry, keep the zero-based 32×8 lookup only when both column values are below8, then read the two selected bytes as ASCII. There are **22,726** valid coordinate pairs, **399** outputs with two uppercase ASCII letters, **47** outputs with both letters in the Roman-numeral alphabet IVXLCDM, and **3** exact outputs "IV" out of 300,000 permutations. These are **after-discovery conditional reference counts**, not global probabilities that the creator intended the readout. Each shuffled trial preserves the entire original byte multiset, every cell's modulo29 residue and both original GF29 factor checks.

**Bounded direct AES-CBC receiver forks are negative.** If source-derived ASCII "IV" is literally a cryptographic initialization-vector hint, the p23 red heading has 16 original GP rune values and the p50 table has 256 original byte values. First frozen fork: p23 red16 as raw-GP-index or raw-GP-prime 16-byte IV, table first16 (AES128) or first32 (AES256) bytes as key, and remaining240 or224 table bytes as CBC ciphertext. Both AES128 serializations have **81/240 printable ASCII** and **30/240 GP-index bytes**; AES256 yields **82/224 and81/224 ASCII**, respectively, with **25/224 and26/224 GP-index bytes**. No readable plaintext.

A second fork uses "IV" in its Roman sense, selecting the **fourth printed 8-token table row**, which is exactly **16 ASCII characters**, as a *literal full-length* AES-CBC IV: `1n3I2r0P2U162L2D`. The zero-indexed row4 rival is `1t1s3H0d0s1K2D05`. Using either 16-character row as IV, p23 red16 as raw-GP-index or raw-GP-prime AES128 key, and the entire original 256-byte table as ciphertext gives four incoherent outputs, respectively **75/256,85/256,74/256,87/256** printable ASCII bytes. This is an exact, typed original-source IV candidate, without guessed salt/KDF. Crucially, **AES-CBC plaintext after its first 16-byte block does not depend on the IV**. Under each literal p23 red16 key, the entire nonlinguistic 240-byte suffix is the same for both source-selected IV candidates and **every other possible 16-byte IV**. These results exclude this AES128 key+original-256-ciphertext family for *all IVs*, even if "IV" has another intended selector. They cannot exclude a different key/ciphertext/mode. The [SFT](../sims/lp2_p50_base29_carry_dh_sft.cjs) asserts original key/IV bytes, exact first-block ciphertext output, printable/GP counts and full post-first-block invariance. Further AES key searches lack an authored input selector and would add no causal evidence.

**Decision:** preserve the literal p50 base-29 carry → zero-based coordinates → ASCII "IV" chain as a potential authored **instruction**. The only meaningful next step would identify a first-party reason to read ASCII and a reversible operation consuming the actual unknown-page ciphertext. "IV" does not supply an actual 16-byte IV, cipher mode, key or authenticated plaintext. The updated [CommonJS SFT](../sims/lp2_p50_base29_carry_dh_sft.cjs) asserts the original source cells, one-based alternative and full shuffled control.

## Fully charged source-boundary search, with a discovery-aware control

We enumerated *both* natural triples at every word boundary **inside every original red span**: 2-left/1-right and 1-left/2-right. This produced **69 candidate triples** over 35 actual internal red word boundaries, including 2014 pages and the solved pages. Exactly **one of 69** is a factor of the original table: p23 offset6 `[23,6,10]`. The adjacent 1-left/2-right triple `[6,10,17]` is **not** a table factor; its quadratic remainder is `[25,25]`. The p39 G triad is separately marked red but has no internal word boundary, so it is not one of the 69 cross-boundary candidates.

A still narrower fixed-operand test selects the exact scalar **−K=27** from the previously recorded p23 DH state and asks for the literal historical prediction **[23,6,10]**, without allowing the other factor or fitted scalar. Among all 69 original boundary windows, only p23's center 2-left/1-right window equals the exact prediction. In the same 200,000 within-span shuffles, at least one of the 69 windows equals that exact triple in **2,883/200,000 = 1.4415%** of trials; a literal match at either orientation across p23's central boundary occurs in **713/200,000 = 0.3565%**. The exact fixed 2-left/1-right placement under p23's unchanged multiset has probability **6/3,360 = 0.17857%**. These figures *condition on the already constructed DH-role/negative-scalar route*. They are meaningful as sensitivity controls, not independent proof of authorship in a highly searched field.

The full original table has exactly **two monic quadratic factors** over GF29, `[11,18,1]` (H) and `[25,10,1]` (G), so the search and negative decisions do not depend on scanning many arbitrary polynomial families. A seed-locked **200,000-draw** calibration permutes rune values **within each of the 18 genuine red spans**, preserving each span's rune multiset, length, actual location, all 35 word boundaries, both orientations and every original table value. The same factor test is re-run on all 69 resulting candidate triples. At least one arbitrary boundary-window factor occurs in **25,122/200,000 = 12.561%** of the shuffled controls. This is the proper warning against calling the one global hit compelling by itself.

Focusing on the source-visible, uniquely central p23 boundary, a factor at either of its two crossing orientations occurs in **824/200,000 = 0.412%** of same-inventory shuffled controls. For the exact central 2-left/1-right slot alone, the combinatorial probability is **7/3,360 = 0.20833%**, counting both monic factors and all scalar equivalents compatible with the original p23 red-rune multiset. These conditional statistics are **not a global discovery-adjusted authorship probability**: the arithmetic rule, candidate source factors, and attention to this heading were discovered after extensive earlier investigation. They make a distinctive center-conditioned pattern worth retaining, without establishing an intended human move.

## Ciphertext consequence tested

The new quotient `Q_new` was tested as a literal period-252 GP29 additive key with both signs and phase zero against unchanged canonical original p23 (213 runes), p55 (76 runes), and the immediate posttable pp51–52 concatenation (355 runes). Each direct output remains ciphertext-like; all indices are original rune positions, with no fitted phase or historical F bypass. Output indices of coincidence:

| Original target | C−Q_new | C+Q_new |
|---|---:|---:|
| p23, 213 | 0.034591 | 0.034193 |
| p55, 76 | 0.030175 | 0.037193 |
| p51+p52, 355 | 0.035108 | 0.033278 |

Uniform GP29 baseline is about 0.034483; genuinely clear p57 has 0.062710. The readings contain no coherent original GP-English plaintext. Earlier Q_old direct, RC4 and nine-chapter key consumers are already negative; scaling Q does not justify re-running other source-agnostic key families. **No authentic new plaintext, GP key, original-cipher inverse or destination was found.**

## Direct codeword check on the five original p23–26 strands

The **same physical p23 motif has five dots**, and the five-dot-bounded chapter's post-heading body is exactly **1,005 original runes = five 201-rune strands**, a previously documented clue-to-cipher candidate. A direct codeword reading is now source-complete: use each original 201-rune strand as descending GF29 polynomial coefficients, in either the five consecutive-block layout or the five interleaved-quintet lanes; read either source direction. Test divisibility by the newly recovered H factor or by the separately red G factor, with no secret key or fitted alphabet. The 1,005-rune whole-body stream is also a naturally delimited control.

Original whole-body remainders are **H=[28,14]**, **G=[17,2]**, and **H×G=[12,4,27,2]**. All twenty 201-rune lane readings (five lanes × two layouts × two directions) have **nonzero H and nonzero G remainders**. Even the source-motivated hypothesis that each of the five strands is independently a codeword of the in-book red factor fails its necessary zero-syndrome test. This exact negative is separate from the prior original Shamir three-of-five checks and does not require language scoring. An exact synthetic 201-symbol H-codeword plant round-trips through the same long division.

**Decision:** retire unkeyed direct p23 five-lane H/G codeword readings, but retain the p23→p50 scalar factor observation as a provisional clue; further search needs a source-authored intermediate operation.

## Complementary red centers and a 16+240 original receiver

A second source distinction strengthens the *geometric* case for comparing these two red objects, independently of the table factorization: p39 has **240 total original runes**, and its only marked red 3-rune group starts at local index119. Thus that one red group is **the only red span anywhere in LP2 that straddles its whole-page midpoint** at offset120. Relative to the whole-page midpoint, it contains **one rune left and two right**. P23's red-16 midpoint has the complementary **two-left/one-right** selection. These two different centered selections yield the two independently exact quadratic factors. Their pairing is a source-visible hypothesis; the original has no explicit instruction to couple a red-heading center on one page with a whole-page center on the other.

There is also a natural whole-table length match: original p23 red heading **16** runes plus original p39 page **240** runes equals the **256** source p49–51 table cells. The alternative all-source receiver asks whether the literal composite GP29 rune stream itself satisfies the H×G polynomial code. In untouched source order:

| Complete 256-symbol composite | GF29 H×G remainder (descending coefficients) |
|---|---|
| p23 red16 followed by p39 whole240 | **[26,3,27,10]** |
| p39 whole240 followed by p23 red16 | **[13,1,16,21]** |

Neither is a codeword. A further potential systematic use of the lengths is to read the 16 p23 red GP indices as the **16 nonleading coefficients of a monic degree-16 polynomial**, with the quotient expected to have **240 symbols** like p39's full page. Under source runes as ascending factor coefficients, the exact 16-dimensional remainder contains **14 nonzero values**. Under the reversed coefficient orientation, it has **16 nonzero values**. Each associated quotient matches only **7/240** original p39 GP rune indices in position. Both fail exact divisibility, so neither selected factor encodes the original numerical table. An exact synthetic 256-coefficient product using the *real p39 240 GP rune sequence* as quotient passes the same division and recovers all **240/240** original p39 runes, proving that the gate would recognize the model if valid.

**Decision:** p23/p39 *center alignment* and **16+240=256** offer additional potentially intended visual premises, but their two most literal polynomial receivers fail on original untouched source. The extra source equalities alone do not establish a cipher key or plaintext; further extension needs a differently motivated operation, not an arbitrary additional key phase.

## DH-seeded H/G recurrence as an actual cipher key

The factor equation suggests a separate *reversible key generator* that uses both original p23 source channels rather than the quotient directly. Normalize the original degree-four product `R×G` to the monic GF29 polynomial `[14,9,13,28,1]`, in ascending-power order. This defines the exact source-motivated four-state recurrence

```text
k[i+4] = -14*k[i] - 9*k[i+1] - 13*k[i+2] - 28*k[i+3] (mod29)
seed = [K,a,e,g] = [2,6,3,5] (p23 printed first-line word lengths)
first sixteen key digits = [2,6,3,5,0,27,27,12,27,4,8,9,13,0,15,4]
```

The original printed word-length order is source-derived, but choosing the first four as the key state and using the polynomial as a recurrence remain hypothetical. Both ordinary GP29 additive signs leave the source ciphertext language statistics essentially flat. More decisively, the actual historically solved p56 cipher has a **plaintext-F-transparent clock**. We therefore ran an exact all-path original inverse allowing the literal printed F to skip the key, while consuming any non-F plaintext. Any branch that consumes the key and would emit an encrypted plaintext F is invalid. Every possible key-clock path dies on the unchanged original ciphertext:

| Source-delimited original receiver | Runes | First impossible, P=C−K | First impossible, P=C+K |
|---|---:|---:|---:|
| p23–26 complete chapter, including red16 | 1,021 | 22 | 12 |
| p39 entire physical page | 240 | 26 | 7 |
| p55 entire physical page | 76 | 59 | 21 |
| Immediate posttable pages p51+p52 | 355 | 24 | 16 |

Offsets are zero-based within each receiver, each starting from the same visible p23-derived seed and using its own key origin. The original clear p57 is independently encrypted with this exact key and the authentic literal-F bypass, and all 95 symbols retain a valid original-plaintext inverse path for both signs. Thus this bounded **source-state recurrence has a hard necessary-condition contradiction**, without guessing English. This does not rule out the polynomial acting on some as-yet-unidentified register.

## Source-red AES-128 key against the 16+240 table frame

A separate binary interpretation uses p23's literal sixteen original red GP symbols as a full AES-128 key, rather than a polynomial factor. The original p49–51 panel contains **256 source bytes** under the conventional base60 reading. Reading the first **16** as CBC IV and the following **240** as a complete ciphertext is a typed, reversible block-cipher candidate; 240 also equals p39's whole-page rune count. This is a 2014-plausible byte cipher, although no original instruction selects AES, this key, CBC mode or the byte codec.

Freeze the two direct source serializations of the p23 red16 key: GP indices `[1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]`, and the corresponding GP primes `[3,97,19,79,17,47,89,17,31,61,31,41,59,61,31,103]`. Decrypt once with IV-first CBC on 240 payload bytes, and check two conventional full-256-byte controls: CBC with zero IV and ECB. Padding is disabled; no password derivation, header offset, key search or ciphertext fitting is performed.

| Exact literal source key | AES-128 mode | Output bytes | Printable ASCII | Bytes 0–28 |
|---|---|---:|---:|---:|
| GP index bytes | CBC, first16 as IV | 240 | 68 | 25 |
| GP index bytes | CBC, zero IV | 256 | 75 | 25 |
| GP index bytes | ECB | 256 | 99 | 24 |
| GP prime bytes | CBC, first16 as IV | 240 | 79 | 33 |
| GP prime bytes | CBC, zero IV | 256 | 84 | 37 |
| GP prime bytes | ECB | 256 | 105 | 29 |

No output is ordinary ASCII instructions or 240 byte-valued GP29 plaintext symbols. The original-source test includes the published all-zero AES-128 known-answer vector. The complete six-case Windows Node22 test passed [Actions 44946667987](https://github.com/FlareZ123/liber-primus/actions/runs/44946667987). Retire this exact AES consumer instead of inventing new AES modes or arbitrary password/KDF layers. All source-specific H/G conclusions above remain conditional; no authentic LP2 cipher architecture or original unknown plaintext has been recovered.

## Full-book original-cipher inverse of the factor product itself

The preceding LFSR test assumed H/G selected a moving **key**. A genuinely different simple human-era interpretation is that they select a **reversible polynomial filter applied directly to plaintext**. This uses the already-demonstrated table polynomial multiplication operation and does not require a key: for either GP reading direction define the cipher as `C(X)=A(X)P(X) mod X^N`, where `A` is an original source factor H, G, or their product R×G. Since every chosen factor has a nonzero GF29 constant coefficient, the lower-triangular finite-stream transformation is bijective at every length. A solver can recover all `N` original plaintext symbols by the recurrence

```text
P[i] = (C[i] − Σ_{j=1..degree(A)} A[j]·P[i−j]) / A[0]  (mod29)
```

with zero values before the source stream starts. A whole-book original order and its full reversal cover both natural coefficient orientations; all **12,956 unmodified unknown-page GP29 symbols** are consumed. This is a bounded original-cipher family, not a fitted secret keystream. The original table is divisible by these factors, so the invertible operation has a concrete source-mathematical motivation, though the book never commands applying it to rune ciphertext.

| Source polynomial factor | Whole-book source-order IoC | Whole-book reverse-order IoC |
|---|---:|---:|
| H, from authenticated 2013 3QO | 0.0344950323 | 0.0344671017 |
| G, from original p39 red3 | 0.0344659102 | 0.0345067455 |
| H×G, equivalently the new p23 R×p39 G | 0.0344696755 | 0.0344677809 |

All six original plaintext candidates remain indistinguishable from near-uniform GP29 output at the whole-book frequency level; the prefixes are nonlinguistic. Each inverse exactly **re-multiplies** to the corresponding 12,956 original ciphertext symbols. Positive controls encrypt and recover a 729-rune source-native GP-English plant formed from the original clear p57. These rule out all six simple unkeyed polynomial deconvolutions without relying on key search. They do not rule out an externally instructed variable polynomial, independent shift/clock or second layer.

## Candidate p36 Q252→238 pad: the 14-symbol trim is negative

*Follow-up by Agent48, 21 November 2026.* The established p23-midpoint/p39-triad factor gives the 252-symbol quotient (Q\). A possible receiver appeared on p36: the original page has exactly **238** runes, while (252-238=14\). The p8 first red word is **XIXM**, with GP29 indices `[14,10,14,19]` and prime-weight sum (196=14^2\). That motivates one bounded test, but does **not** authenticate “drop fourteen symbols” as an instruction.

The only direct contiguous 238-symbol reads are (Q[0:238]\) and (Q[14:252]\). Both directions and both additive signs were tested against the original 238-rune p36 page; no free phase search was performed. Word boundaries were taken from the original p36 transcription (50 printed words), and dictionary hits use the repository's 29,157-entry TextBlob control list.

| Q window | operation | IoC | dictionary hits |
|---|---|---:|---:|
| (Q[0:238]\) | (C-Q\) | 0.034323 | 1/50 |
| (Q[0:238]\) | (C+Q\) | 0.035599 | 2/50 |
| (Q[14:252]\) | (C-Q\) | 0.032798 | 3/50 |
| (Q[14:252]\) | (C+Q\) | 0.035032 | 5/50 |
| reverse (Q[14:252]\) | (C-Q\) | 0.034039 | 2/50 |
| reverse (Q[14:252]\) | (C+Q\) | 0.034713 | 2/50 |
| reverse (Q[0:238]\) | (C-Q\) | 0.033684 | 3/50 |
| reverse (Q[0:238]\) | (C+Q\) | 0.034713 | 1/50 |

The original p36 IoC is **0.035989**; the solved p57 native-text control is **0.062710**. All eight p36 outputs remain near-uniform and linguistically unconvincing. Each candidate exactly re-encrypts to the original p36 symbols, so the negative is about the proposed receiver, not implementation invertibility.

A separate check tested the **entire 16-rune p23 red span** multiplied by the p39 red triad as a degree-17 factor of the p50 table polynomial. All four coefficient-orientation combinations have nonzero remainders. Each formal quotient has 239 coefficients and begins with zero, superficially resembling 238 after stripping that zero; this is **not** a valid factorization because the remainder is nonzero. Do not turn that near-length coincidence into a p36 pad.

**Disposition:** retain the exact p23 central-triple × p39-triad factor relation as an intermediate structural observation. The p28→p23 route and p23+16→p39 page-rise census strengthen the candidate source selection of the pair, but the addition rule remains inferential. Retire the direct 14-trim additive (Q→p36) receiver, the full-red16 × p39 factor extension, the historical 14-block Q→p56 hash-preimage receiver, and the literal reverse-Q→p56 hash-preimage receiver. No p36 plaintext, p56 preimage, or key was recovered. Reversing the p50 coefficient order also destroys exact divisibility. The remaining missing premise is an independently source-selected 2|1 factor extraction/DH interpretation and, above all, a reversible ciphertext consumer of Q; do not extend the rejected 14 or reversal variants.

## Candidate source-selected page rise: p28 → p23 → p39 (Agent21, 21 November 2026)

The p28 readout report independently recovers **THEIR NUMBERS ARE THE** at one manuscript-wide D4 hit; the authenticated 2016 continuation supplies **DIRECTION**. Its corrected numbered route reaches **ROAD number23 → p23 consumer** (see [p28 readout and numbered route](lp2-p28-numbers-direction-readout.md)). This gives a source-derived route to p23 before examining the p23/p39 factor pair.

The p23 red span begins at offset0 and has length16; its established word lengths are **[2,6,3,5]**, with the unique internal midpoint boundary **8|8**. A simple forward page-rise by that span length gives **23+16=39**. Page39 has 240 runes and one red span of length3 at offsets119–121, centered on the page midpoint. This pairs the uniquely centered p23 red heading with the centered p39 red triad used in the factorization.

The all-source red-span census contains **18 red spans**. Only two page-index-plus-span-length results land on another red-bearing page: **p3+3→p6** and **p23+16→p39**. The p3→p6 control is not centered at either end (p3's red3 is at119 in a 217-rune page; p6's red11 is at71 in a 196-rune page). Thus p23→p39 is the only hit satisfying both the previously established p23 midpoint-word-boundary condition and the p39 whole-page-centered red3 condition. Reproduce the complete census with [the Node22 SFT](../sims/lp2_p23_redspan_page_rise_census.cjs) and [Actions run 44959597178](https://github.com/FlareZ123/liber-primus/actions/runs/44959597178).

This is a plausible human-facing interpretation of **THE ONE RISE**: take the p23 page and rise forward by the length of its red heading to p39. The census establishes the arithmetic relation and its limited uniqueness, not that addition is an authored operation. It strengthens the selection of p39 but does not prove the 2|1 split, the DH scalar interpretation, or the polynomial assembly rule. It also supplies no receiver for the 252-symbol quotient.

## Historical 14-symbol Q→p56 hash-preimage gate (Agent21, 21 November 2026)

The p50 factor quotient has **252 GP29 symbols = 18 complete 14-symbol blocks**. The p8 first red word `XIXM` has the already documented prime-weight sum **196 = 14²**, and the earlier Cicada 2014 round supplies an exact 14-symbol block permutation, order `[2,8,9,1,12,13,11,4,5,7,3,0,6,10]`. This is a bounded test of the possibility that the p23/p39 quotient, after that historically recovered operation, is the p56 hash preimage. It is not evidence that the creator selected Q for this operation.

The exact GF29 division was recomputed from the original p50 256-byte source: remainder **[0,0,0,0]**, quotient length **252**, IoC **0.0363308670**. The historical block permutation was applied to every complete 14-symbol block in both directions (`decode` and inverse `encode`), with no ragged tail or fitted phase. For each direction, both raw GP29 bytes (252 bytes) and concatenated canonical transliteration (314 UTF-8 bytes) were hashed under **SHA-512, SHA3-512 and BLAKE2b-512**. All twelve digest candidates missed the p56 target. Whirlpool was not available in the Windows Node22 OpenSSL provider and was not tested; the target hash family itself remains unauthenticated.

This retires only the finite **Q → historical 14-block permutation → raw-GP/transliteration p56-preimage** route. It does not disprove the exact p23/p39 factorization or exclude Q as an intermediate for a different independently selected operation. Do not expand this into arbitrary hash families, phase searches or additional transpositions without a new source selector. Reproduce with [the bounded Node22 SFT](../sims/lp2_p23p39_q14block_hash_gate.cjs) and [Actions run 44958270938](https://github.com/FlareZ123/liber-primus/actions/runs/44958270938).

## 2016 reverse-instruction Q→p56 hash-preimage gate (Agent21, 21 November 2026)

The authenticated 2016 Cicada message contains the literal sequence instruction **"The first thing is the end. The last thing is the beginning."** The simplest sequence-level application to the p23/p39 quotient is to reverse the 252-symbol Q once, without changing its symbols or fitting an offset, then test it as the p56 preimage.

The exact quotient was recomputed from the original p50 coefficient stream; the p23/p39 factor remainder remains **[0,0,0,0]**. Reversing Q leaves its IoC unchanged at **0.0363308670**. The reversed sequence was hashed as raw GP29 bytes (**252 bytes**) and canonical transliteration (**314 UTF-8 bytes**) under **SHA-512, SHA3-512 and BLAKE2b-512**: **0/6 matches**. The p56 hash family remains unauthenticated, so this is a bounded rejection of these three common families and these two source-natural serializations, not an exhaustive hash-family result.

A separate direct orientation check reverses the original 256 p50 coefficients *before* polynomial division. The same factor then leaves remainder **[24,18,8,25]**, so the exact p23/p39 factorization is specific to the printed forward coefficient order; a literal reversal of the table does not preserve the bridge.

Reproduce the quotient reversal and six hash comparisons with [the deterministic Node22 SFT](../sims/lp2_p23p39_q_reverse_hash_gate.cjs) and [Actions run 44958681641](https://github.com/FlareZ123/liber-primus/actions/runs/44958681641). Together with the historical 14-block gate above, this closes the two obvious source-cued sequence operations on Q as direct p56 preimages. It does not disprove the factorization or establish that Q has no other role.

## Decision and next useful gate

Preserve the **p23 source-only H projector** and the **p50 modulo-29² H/G carry register** as provisional source correspondences. The four-symbol carry [8,5,15,2] is an exact higher-digit data constraint whose two zero-based coordinates produce ASCII `IV` in the original table. This is a source-shaped readout, not a proven initialization vector or executable cipher parameter. The DH assignment and choice of coordinate/ASCII consumer remain post-discovery interpretations.

The source-selection picture is stronger than the initial factor report: p28's D4/numbered route selects p23, and the p23 red-span-length rise gives the only centered source/target pairing p23→p39 in the 18-span census. This makes the p23 central triple and p39 red triad a plausible selected pair. The arithmetic rise is still an inference; neither it nor the p28 route independently says to take two runes left and one right, nor does it establish the DH scalar or polynomial assembly.

The decisive objection therefore remains: the original p23 artwork fixes a centered boundary but does **not** visibly prescribe the **2|1** extraction. More importantly, no independently source-selected reversible **ciphertext consumer** of the p50 quotient has been found. The direct 14-trim Q→p36 additive receiver, full-red16 × p39 factor extension, historical 14-block Q→p56 hash-preimage receiver, and literal reverse-Q→p56 hash-preimage receiver are negative. Reversing the p50 coefficient order breaks exact divisibility. Do not spend more compute on arbitrary Q phases, hash families, transpositions, or fitted factors without a new source selector or a locked prediction on original ciphertext.

The next useful gate is a blind source test that either establishes the 2|1 factor extraction from the original page design or identifies a reversible operation consuming Q and predicts plaintext on an untouched page. Until then, keep the factorization and page-rise relation as intermediate evidence, not a solution. Reproduce the original factor bridge with [the single-file Windows Node22 SFT](../sims/lp2_p23_red_midpoint_dualfactor_original_sft.cjs), and the added negative receivers with the linked scripts above. Relevant independent factor source: [2013 H and p39 G table link](2013-base29-gf29-grid-factor.md).
