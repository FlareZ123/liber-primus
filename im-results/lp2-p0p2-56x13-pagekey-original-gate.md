# P0–p2: 729 full runes and 716 black runes as candidate page-key rows

**Status:** The original 13-dot framing makes two exact 13-rune-row counts visible. Direct, one source-anchored two-layer and one fixed integer-seeded RAND cipher-key interpretation on the original unsolved pages remain nonlinguistic. Raw rows cannot be literal per-page products of ordinary Gematria phrase sums in either digit direction, independently of their page assignment. The exact modular lift extension also rules out up to six prime phrase sums modulo 29^13, and permits at most 24/224 distinct rows for six arbitrary composite-or-prime sums under a generous universal page-length bound. **No recovered plaintext, authenticated key, or inferred creator operation.** This is a bounded hypothesis, outside the established-results record.

## Source-visible alignment

On LP2 physical p0 (original JPEG `17.jpg`), **13 initial red runes** in an 8+5 title are followed by a **red 13-dot separator**. On physical p2 (original JPEG `19.jpg`), another **red 13-dot separator** comes immediately after the last rune. The intervening entire three-page region comprises p0 262 + p1 266 + p2 201 = **729 GP29 runes**, and the span between the two separators is **716 GP29 runes**:

```text
729 = 56 × 13 + 1    (all p0–p2 runes)
716 = 55 × 13 + 1    (after p0's red heading, through p2)
```

LP2 has **56 unknown physical pages p0–p55**, of which exactly **55 are rune-bearing** (p50 contains the middle of the 256-cell numeral panel). This motivates two *competing* speculative row interpretations. In the full 729 register, 56 rows of 13 runes and a residual occupy the three pages, and row0 coincides with the **literal original red heading** when the residual is last. In the 716 black register bounded by the two 13-dot separators, 55 rows of 13 and a residual can be assigned to 55 rune-bearing unknown pages in physical order, skipping p50.

Source constraints are the original image ink, marker positions, rune counts, and page mapping. **No first-party text instructs an actual 13-rune key table, an omitted residual, a mode, or even reuse of the opening chapter as a key.** The alternative 729=27²=3⁶ is also a natural design interpretation and has existing separate investigations. Direct use of an opening-source row to decode that same opening page would be self-referential. Hence pages p3–p55 are the independent original receiver here.

## Frozen original-source test

Reproduce with [the single-file CommonJS SFT](../sims/lp2_p0p2_56x13_pagekey_original_sft.cjs) reading the repository's canonical `resources/liber-primus/lp2-corpus.json`.

The four source row placements are:

| Register | Key rows | Original rune offset of first key | Residual placement | Page-to-key address |
| --- | ---: | ---: | --- | --- |
| Full 729 | 56×13 | 0 | Last | Physical page number |
| Full 729 | 56×13 | 1 | First | Physical page number |
| Black 716 | 55×13 | 13 | Last | Rune-bearing physical-page ordinal, skipping p50 |
| Black 716 | 55×13 | 14 | First | Rune-bearing physical-page ordinal, skipping p50 |

For each placement, reverse the key or keep printed order, select addition or subtraction, and apply three familiar reversible constructions over GP29:

1. Repeating period-13 key: `P[i] = C[i] ± key[i mod 13]`.
2. Ciphertext-autokey at lag13: `P[i] = C[i] ± (i<13 ? key[i] : C[i−13])`.
3. Plaintext-autokey at lag13: `P[i] = C[i] ± (i<13 ? key[i] : P[i−13])`.

This defines exactly **48 direct source-row candidates**, without fitting unknown secrets.

### Source-crib two-layer keybook gate

The 2016 Cicada-signed message supplies the candidate printed p0 title `EPIPHANY SEECS` (native GP normalization of “EPIPHANY SEEKS”). Its pinned original 13-rune additive difference key is `K=[26,24,8,19,27,24,18,3,0,8,0,16,19]`. Its GP-prime weights sum exactly **729**, matching this three-page opening chapter. The title remains provisional because every 13-rune guessed plaintext prefix fits one 13-rune additive key; the existing full source F-transparent/autokey study rejects the simplest prose continuation. [First-party source and checksum control](../sims/lp2_p0_epiphany_signed_729_primecheck_sft.cjs).

A different, motivated possibility is that the **716 black runes represent 55 encrypted page keys**, for which native-English IoC on the first-stage output would be the wrong goal. We therefore subtract the same fixed candidate title key in standard period-13 GP29 Vigenère from all 716 black runes to get a *hypothetical encrypted keybook*. With the leftover rune alternatively first or last, parse its 715-runic remainder into 55 rows of 13 symbols. Apply each row to the independently held-out physical page with the same explicit three reversible consumers, two signs and two orientations. This creates exactly **24 additional layered tests**, with **no fitted page key** and the same independent original p3–p55 receiving ciphertext.

The first-stage stream remains near uniform (IoC **0.0341524**), which is expected for a keybook and is not grounds for rejection. The original independent **second-stage** page outputs yield whole-receiver IoC **0.0344631–0.0345237** and no long page at IoC≥0.050 (maximum **0.0396694**). Neither extra decoded residual rune is a simple additive or prime-sum checksum of the 715 purported keybook symbols: initial residual GP0=5 versus GP0 sum25, GP-prime sum23 mod29; terminal residual GP0=10 versus GP0 sum20, GP-prime sum5 mod29. These are only two obvious checksum conventions; they are not universal exclusions. The strong conclusion is limited to the exact two-stage direct cipher consumers. A genuinely encrypted keybook or another page-key expansion remains conceivable without a supporting original operation.

**Total source-motivated original receivers in this bounded experiment: 72 (48 direct, 24 layered).** All original pages **p3–p55, excluding rune-free p50**, supply **12,227 ciphertext runes on 52 independent pages**. Also test 49 pages of length≥100 separately. A genuine solved p57 GP29-language control is used for IoC comparison, and each reversible mode is checked by exactly recovering all 95 solved p57 runes from its synthetic encryption.

## Observed decision

| Diagnostic | Result over the 72 original-input candidates |
| --- | --- |
| Original full-receiver decoded GP29 IoC | **0.0344471–0.0345264** |
| Number of independently decoded long pages reaching IoC≥0.050 | **0 of 49 per candidate** |
| Largest long-page IoC across the entire candidate family | **0.0396694** |
| Length/word-preserving original runes consumed per candidate | **12,227** |
| Genuine solved p57 GP29 IoC | **above 0.050** |
| Reversible native p57 synthetic planted control | **72 of 72**, each **95/95 recovered runes** |

Both plausible source-frame registrations and the title-key-decoded keybook interpretation fail to recover ordinary GP-native natural prose under the frozen standard cipher consumers. The paired 13-dot separators make the black-register hypothesis interesting as a reading cue, but the numerology does not fix its operation and no original ciphertext was deciphered.

**Decision:** Retire these exact direct and title-crib-fed two-stage repeating/lag13 autokey inverses. Future investigation would need a source-selected 13-rune-row consumer, with a complete exact inverse and non-overfit original plaintext holdout, to justify pursuing this alignment. Do not expand the idea into unconstrained key transformation sweeps solely because of the exact count.

## Exact raw BASE29 checksum exclusion (Agent42, 26 November)

The attested 2013 Parable ID3 product 1259×1031×1229 = 1,595,277,641 predicts the 88 original p57 body runes' sums. See [historical source and exact inverse](../results/2013-761-parable-prime-products.md). Test whether raw 13-rune rows encode similar products of GP-prime sums for unknown pages.

**Necessary condition:** for N GP runes partitioned into disjoint nonempty phrases with positive GP-prime sums s_j, ∑s_j ≤109N. Every prime divisor of ∏s_j is ≤109N. Also the sum of prime factors with multiplicities cannot exceed 109N, because factorization cannot increase the sum of integer factors ≥2. Dividing by all primes ≤109N and finding residual >1 is conclusive even without knowing the plaintext or phrase boundaries. This covers subsets of disjoint phrases and composite phrase sums; it assumes a length-preserving GP29 plaintext and literal unencrypted, non-reduced product.

Test all four row placements above and the red title row0 followed by a first-black-TH sentinel at offset13, then rows1–55 from offset14. The latter maps to physical pages including p50; assigned tests use p3–55 excluding p50. The largest unknown page is p29 (277 runes); universal bound 30,193. Read BASE29 in printed or reversed digit order.

| Registration | Rows | Assigned failures (printed / reversed) | Failures with any page assignment (printed / reversed) |
| --- | ---: | ---: | ---: |
| Full, residual last | 56 | 52/52 · 52/52 | 56/56 · 56/56 |
| Full, residual first | 56 | 52/52 · 52/52 | 56/56 · 56/56 |
| Black, residual last | 55 | 52/52 · 52/52 | 55/55 · 55/55 |
| Black, residual first | 55 | 52/52 · 52/52 | 55/55 · 55/55 |
| Title + TH sentinel | 56 | 52/52 · 52/52 | 56/56 · 56/56 |

All 520 assigned tests fail the large-prime-factor condition; all 224 distinct row integers across registrations and both digit orders contain a prime divisor exceeding 30,193. Repeated rows are not independent observations. Example: full-last p3 row3 is 3,042,111,791,760,460,804; after division by every prime ≤23,653, residual 150,515,632,753 remains. The historical control passes with prime-factor sum 3,519 ≤9,592.

[Node reproducer](../sims/lp2_p0_13row_gp_phrase_product_gate.cjs) derives the inputs directly from the corpus. The connector-side equivalent returned these exact counts; the committed SFT also asserts the historical p57 control sums.

**Decision:** reject the literal per-page disjoint-phrase GP sum product hypothesis, even with arbitrary row assignment. Encrypted/reduced checksums, overlapping/reused phrases and length-changing representations remain outside scope; require an independent source selector. This algebraic exclusion is not evidence for a different key.

## Exact modular lift extension (Agent42, 26 November)

The historical three-prime phrase-product grammar suggests an alternative to a cipher key: a compact page checksum. The raw integer decision above left modular reduction open. For a fixed 13-GP29-digit field the natural place-value modulus is M=29^13=10,260,628,712,958,602,189. This modulus is a hypothesis, not a first-party instruction. Test all possible modular lifts under the same page-length-preserving/disjoint-phrase assumptions, without choosing language or boundaries.

For k positive integer phrase sums with total at most B=30,193, the exact product maximum is floor(B/k)^(k−r) × ceil(B/k)^r, r=B mod k, attained by balancing all k parts. At k=5 it is 8,029,366,952,648,952,636, smaller than M; all smaller k also cannot wrap. The q=0 lift is already excluded for all 224 distinct source rows (the new implementation independently finds no q=0 completely factored lift). Thus modulo M does not rescue the authentic three-factor grammar, or any k≤5. At k=6 the maximum is 16,237,908,602,441,954,656,256, permitting up to 1,582 positive lifts per row.

Enumerate every nonnegative integer q for which row+qM is positive and no larger than the six-factor maximum. For each prime p≤B, divide all powers of p from precisely the lifts whose q solves qM=−row (mod p); p=29 divides M and is handled separately. Residual >1 excludes the candidate. For completely factored lifts, require the sum of prime factors with multiplicity ≤B; this is necessary even for composite phrase sums. Finally exactly minimize the sum of six nonempty integer factors by assigning all prime factors to six unlabeled multiplicative bins. Symmetry-quotient sorted bins and monotone sum bounds preserve every partition. For the assigned page, require this minimum ≤109 times its actual rune count. This is a relaxation of the unknown GP representation: it does not require an actual partition of a particular plaintext, correct individual phrase lengths, or authentic clause boundaries.

| Registration | Rows with any six-factor witness under universal cap, printed/reversed | Assigned independent pages passing, printed/reversed (each denominator 52) |
| --- | ---: | ---: |
| Full, residual last | 5/6 | 4/2 |
| Full, residual first | 10/3 | 4/2 |
| Black, residual last | 5/6 | 4/2 |
| Black, residual first | 10/3 | 5/2 |
| Title + TH sentinel | 10/3 | 4/2 |

Across 224 distinct row values and 354,485 nonnegative lifts, 55 rows have 66 completely factored, prime-factor-sum-compatible lifts. **None has exactly six prime factors.** Only 24 distinct rows have any partition into six factors with total ≤30,193 (26 lifts). Just 31/520 assigned tests survive the relaxed six-factor bound; at least 489 fail. No registration can form a whole-page checksum table under these assumptions, even granting arbitrary page assignment. The surviving factors do not decode any text.

Arithmetic controls: the authentic 2013 p57 clause product 1,595,277,641 is recovered at q=0 with prime sums 1259/1031/1229. An independent wrapped six-prime plant has factors [4967,4969,4973,4987,4993,4999], sum29,888 and quotient1,488; a wrapped composite plant [4954,4969,4973,4987,4993,4999] has sum29,875 and quotient1,485. Both exact planted factorizations are retained and replay their residue. These are numerical plants, not literary controls. The first version's deliberately very smooth composite plant exceeded the JavaScript Set capacity; the revised control has seven prime factors and retains a nontrivial composite factor. The original 224-row decision is unchanged and the complete revised SFT ran through the connector's V8 environment with Node filesystem/assert adapters using the exact remote corpus and script. No native Node/Windows CI run is claimed.

Reproducer: [modular lift SFT](../sims/lp2_p0_13row_modular_phrase_product_gate.cjs). **Decision:** retire the direct and modulo-29^13 checksum branches with up to six disjoint phrase sums, including arbitrary composite sums as a whole table. This is not an exclusion of seven-or-more factors, overlapping phrases, shorter moduli, or encrypted checksums. Neither the modular extension nor those escape hatches supplies a decipherment operation. Do not invest in extending k without an independent source selector.


## Integer-seeded RAND receiver (Agent9, 26 November)

The fifth registration above (red title, first-black TH sentinel, then 55 physical-page rows) supplies an exact 13-digit BASE29 integer per page. The signed historical [BASE29/RAND vocabulary](../resources/external/2013-tcp-server-signed-source.md) motivates a fixed exploratory receiver: interpret each row in printed order as a nonnegative integer; initialize Python's integer-seeded MT19937; generate bytes via `int(random()*256)`; reduce modulo29 and subtract from ciphertext. This particular PRNG, byte extraction, reset and recipient are **not** selected by authenticated Cicada instructions. No row reversal, seed transformation, offset search or fitted key was used.

Test p3–39 and independent p40–55 (excluding p50) without training on either. A smoothed native GP29 bigram model uses the seven solved records before AN END and PARABLE, with 0.5 pseudocounts and a separate start state. Both ordinary consumption and authentic plaintext-F hold are implemented; the latter exactly retains all legal hold histories with a dynamic program keyed by cursor and previous plaintext rune, counting paths and ranking by likelihood. All retained inverses replay exactly. Scores below are mean natural log likelihood ratios against independent uniform GP29, not absolute likelihoods.

| Receiver | p3–39 legal pages / runes / gain | p40–55 legal pages / runes / gain |
| --- | --- | --- |
| Ordinary | 37/37 · 8,911 · −0.671081 | 15/15 · 3,316 · −0.662055 |
| Plaintext-F hold | 1/37 · 273 · −0.677840 | 0/15 · 0 · impossible |

The sole F-hold survivor is p11 with nine paths, best IoC .033775 and nonprose preview `LEALCMMNWTAEXGPLPEOALOLEAIPJMLPOEUTHLDWIAUOEMIAAPRFUATHURJSJPALUNGHTHAESAE`. The held AN END and PARABLE synthetic receivers recover 85/85 and 95/95 runes exactly with both consumption laws; their true log gains are +.702761 and +.744569. The transparent-F plants have three and 25 legal paths respectively and the scorer selects the actual plaintext.

As an independent auxiliary interpretation, the p50 row seed 7215211729633808439 predicts the first 104 RAND bytes. Under the existing base60 table serialization, **0/104** match the p50 numeric fragment in place; actual first 12 = [142,58,201,193,173,28,111,65,211,220,198,49], predicted = [136,71,23,195,89,126,20,237,205,199,71,220]. This rejects treating that particular row as the seed for those particular raw bytes; it does not constrain a different representation or table role.

[Python SFT](../sims/lp2_p0_base29_rand_pagekey_sft.py), frozen before the run in commit 2175a43279bab36808475727ed3caf70778b0cc1. Original corpus, native control and grid blob IDs are 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, 1b064ef6d85819b7d96adaff31a82d1ec551598f and 2550eae357442912220e05dc51147523a61dd75a respectively. The results above were executed in the connector V8 runtime via an independent equivalent MT implementation, matched against local CPython integer-seed byte vectors including >32-bit seeds. A manual Windows Python run was dispatched; its completion is not asserted here.

**Decision:** retire this exact integer-RAND page-key receiver. No recovered unknown plaintext, no new authenticated selector, no evidence that these rows are an RNG keybook. Do not broaden this to arbitrary PRNG families without a new source operand.
