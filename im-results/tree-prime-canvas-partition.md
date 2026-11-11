# Signed 2016 tree image as an exact 11×11 GP-prime pixel partition

**Status: source-constrained geometry, a candidate word-to-signed-message navigation rule, and scoped negative original-cipher tests.** This test builds on Agent 21's independently discovered cross-artifact source checksum. Neither the checksum nor this image extraction recovers unknown LP2 plaintext, a key, a cipher mechanism or a destination.

## Source-selected dimensions and deterministic pixel operation

The authentic preserved signed 2016 JPEG (resources/historical/cicada2016-4gq25.jpg) is **563×569 pixels** and depicts the blurred tree found in Liber Primus physical p32 (49.jpg). Original LP2 p32 contains exactly **121 ciphertext runes**, suggesting a row-major **11×11** array (a hypothesis about reading order, since printed line breaks differ). Convert its original rune labels to the canonical Gematria Primus prime values.

Agent 21's source fact: **the first row totals 563** and **the first column totals 569**, exactly matching the JPEG's width and height, with natural x/y orientation. This allows a finite **pixel-space** operation: treat eleven first-row primes as variable-width vertical strips and eleven first-column primes as variable-height horizontal strips. The strips tile **all 320,347 original image pixels exactly once**, into 121 source-determined rectangles. No image crop, scale, key, phase or geometric shift was fitted.

- x-axis strip widths: **[73,5,101,19,101,3,43,107,13,19,79]**.
- y-axis strip heights: **[73,23,5,23,79,59,53,79,59,109,7]**.
- x edges: **[0,73,78,179,198,299,302,345,452,465,484,563]**.
- y edges: **[0,73,96,101,124,203,262,315,394,453,562,569]**.

The decomposition is an *interpretation of an exact original relation*, rather than proof the creator intended rectangular tiling. It yields a falsifiable 121-cell image input for future source-constrained routes.

## Two simple original-input predictions rejected

Each exact rectangle is read as (1) mean RGB luminance 0.299R+0.587G+0.114B, and (2) fraction of pixels with luminance at least 180. Testing the corresponding source rune's GP **ordinal** or **prime value** against either image statistic yields the following 100-cell **interior** Pearson correlations, excluding the row/column that specify the partition:

| Source label vs cell statistic | Observed interior correlation | ≥ absolute value among 10,000 original-label permutations |
| --- | ---: | ---: |
| Ordinal vs mean luminance | −0.08383 | 4,285 |
| Prime vs mean luminance | −0.08048 | 4,460 |
| Ordinal vs white fraction | −0.09010 | 3,968 |
| Prime vs white fraction | −0.08762 | 4,102 |

Largest absolute observed correlation is **0.09010**; among 10,000 seeded interior-label permutations, **4,317** achieve an equal or larger maximum across these four measures. Direct mean-luminance normalization to indices 0–28 agrees with only **4 of 121 original rune indices**. These are bounded negatives for brightness-as-rune decoding. Bright text is overlaid on the image and the tree is low-contrast; other image features are untested. The 180 threshold is a declared measurement choice, rather than a clue-specified threshold. The permutation counts are conditional diagnostics, not discovery-wide probabilities.

A second test asks whether the source-image **121-cell white fraction** is an event mask for the previously observed sparse within-word T6(x)=24−2x mod29 lag-six relation. Read the mask at **phase zero** (no fitted shift) at either book-global or page-local original rune index modulo 121. All **1,290 original eligible within-word lag-six positions**, including **80 T6 hits**, were included. Each hit-versus-nonhit brightness difference was ranked against all **121 cyclic rotations** of the mask.

| Fixed phase-zero mask clock | T6-hit minus nonhit brightness | Positive rank among 121 shifts | Two-sided absolute rank among 121 |
| --- | ---: | ---: | ---: |
| Whole-book rune offset | +0.0057853 | 35 | 77 |
| Physical-page-local rune offset | +0.0039161 | 51 | 98 |

Neither unshifted source-aligned clock is distinguished from cyclic rotations. Selecting the best fitted shift would violate the original-cipher prediction contract. This rejects the two literal brightness-mask selectors only. No source-defined selective T6 event rule has emerged from the image tiling.

## Nested p32 ring, signed payload length, and Möbius structure

The Parable's wording about shedding circumferences motivates removing the outer three borders of the 11×11 p32 GP-prime square, leaving its central 5×5. The 16-cell perimeter, clockwise from its top-left cell, is:

`[67,47,19,89,53,89,107,61,37,109,107,79,41,107,17,107]`

Its sum is **1,136**, exactly the byte length of the PGP-authenticated signed 2016 payload `resources/historical/cicada2016-4gq25-outguess.asc`. This is an exact cross-artifact equality, but by itself does not specify an extraction.

### Four-side matrix and the corner-ownership ambiguity

The originally proposed clockwise four-side sums were **N=275, E=257, S=373, W=231**. Their actual geometric convention matters. They are a **corner-exclusive** partition of the 16 perimeter glyphs: the north and south rows take **five cells each, including all four corner cells**, while east and west take **three interior cells each**. With row-major placement, this yields:

\[
M=\begin{pmatrix}14&25\\25&28\end{pmatrix}\pmod{29},
\qquad f(x)=\frac{14x+25}{25x+28}\pmod{29}.
\]

Under this particular allocation, \(\det M=28=-1\), trace \(13\), \(f(13)=24\), and the projective map has order **7**, finite fixed points **22** and **25** and four seven-cycles on \(\mathbb P^1(\mathbb F_{29})\). The source ring and all these computations are exact; assignment of the corners to horizontal rather than vertical sides is a **proposed operation**, not an image-fixed instruction.

The geometrically conventional alternative, summing all five cells on **each inclusive side**, counts the four corners twice and yields sides **[275,347,373,339]**, matrix **[[14,28],[25,20]]** modulo29, determinant **15**, trace **5**, projective order **28**, and \(f(13)=17\). This is also a legitimate reproducible map, with a different cycle structure. Another natural alternative, dividing the clockwise 16-rune sequence into equal consecutive four-cell quarters from the top-left, yields sides **[222,310,332,272]**, matrix **[[19,20],[13,11]]** modulo29, projective order **5**, and \(f(13)=1\).

For a finite sensitivity test preserving the physical geometry, assign each of the four corner glyphs to exactly one of its two adjacent sides and assign each of the twelve noncorner glyphs to their unique respective sides. There are precisely **16** possible corner-ownership assignments. The prior horizontal-corner choice is the only one of these 16 with the **joint** numerical signature (trace13, determinant28, projective order7, \(f(13)=24\)); indeed it is also the only order-7 choice. Rotating the four-cell-quarter partition through all **16** ring origins yields **none** with the joint signature. These are exhaustive conditional counts, **not** evidence that the maker specified the horizontal choice; the signature was selected retrospectively using its attractive modular correspondences.

The proposed 7-cycle and its external matches are thus **conditional on corner ownership**. To claim a historical key or operation, a surviving manuscript instruction must disambiguate the partition independently of those matches. The alternative order-28 map may merit attention because \(\varphi(29)=28\), but that equality alone has no plaintext consequence. [Source-asserting enumeration](../sims/tree121_mobius_corner_conventions_sft.cjs) and [successful original-input manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42949089685).

### Cross-artifact constraints

These are exact modular correspondences, not fitted parameters:

| Source quantity | Residue / invariant | Independent match |
|---|---:|---|
| 2016 image width, 563 | (12\pmod{29}) | 2014 magic-square centre, (331\equiv12) |
| 2016 image height, 569 | (18\pmod{29}) | 2014 7×7 magic constant, (1033\equiv18); also the sum of Möbius fixed points |
| 2016 image area, (563\times569) | (13\pmod{29}) | p32's 13-dot mark and (\operatorname{tr}(M)=13) |
| Cicada number, 3301 | (24\pmod{29}) | (f(13)=24) |
| p32 inner-5 perimeter | (1,136) | signed 2016 payload length, 1,136 bytes |

The image-dimension residues are also consistent with the p32 tiling already established: the top-row and left-column prime sums are exactly 563 and 569. The 16 ring cells plus the 13-dot count total 29, the GP alphabet size; this count identity is suggestive but does not yet specify a mapping. The projective point at infinity supplies a natural 30th state for the 29-symbol alphabet, but identifying it with the 13-dot mark remains a hypothesis.

This is a **source-anchored but partition-dependent Möbius/map hypothesis**: p32 supplies the ring, while the original seven-cycle matrix requires an additional, unproven corner allocation. The earlier LP1 MOBIUS reference suggests the operation family; the 2016 image and 2014 square supply retrospective checks on the chosen matrix's invariants. The seven-cycle alone cannot establish the historical selection rule and does not recover plaintext.

### Bounded direct-use tests

The matrix is not itself a successful direct decryption under the simplest interpretations:
- Applying (f) or (f^{-1}) as a monoalphabetic substitution to p32 produces no readable text.
- Using (M) or (M^{-1}) as a 2×2 Hill transform on the full unsolved LP2 rune stream produces no language recovery.
- Using the orbit of 13 as an additive period-7 state stream, with red 13-dot marks resetting the state, leaves the full-book IoC near the raw-ciphertext value (about 0.0345).
- Applying successive powers of (f) as a period-7 polyalphabetic substitution, including red-13 reset variants, also fails to produce language and creates many projective-infinity outputs.
- Treating the 16 prime values as a direct period-16 additive GP29 key (ordinal or prime-residue representations, both signs, global or page-reset clock) gives IoC 0.0344554–0.0345361 versus raw 0.0344784. An independently executed extension tests both ring directions, both GP value conventions, both signs, book/page clock, and a reversible cyclic GP28 predecessor-exclusion channel with transparent 86 repeat markers and either marker-clock convention: **48 unique original-input models**, all exactly reencrypted; best decoded IoC **0.03530621** against raw **0.03447840**, no plaintext. Source-native Shakespeare-GP plants invert exactly. [Extension SFT](../sims/tree121_outguess1136_ring_sft.cjs) · [successful manual-only CI](https://github.com/FlareZ123/liber-primus/actions/runs/42947565244). Treating the original 16 prime values as sequential byte-segment lengths consumes the payload exactly but does not align boundaries with its natural message lines or words.

These negatives reject the direct uses tested, not the matrix as a structural map, selector, coordinate transform, or state-generation mechanism. The four 7-cycles and two fixed points may be the relevant output; their intended use remains unresolved.

## Source-word GP-prime walk from the 33-rune clause to the signed PGP delimiter

The p32 print text, read page-locally and preserving its original word punctuation, divides into **7 words / 33 runes** before its first period and **15 words / 88 runes** afterward. The first seven printed word lengths are **[1,3,5,11,5,5,3]**, all odd, with exactly three 11-rune rows. Across all **219 page-local punctuated clauses** on the 55 rune-bearing unknown LP2 pages, **12** have seven words and **only this one** has seven odd word lengths. The source-selected first **33** runes have GP-prime sum **1,467**. Subtracting the independently located central 5×5 ring perimeter of **1,136** gives the 2014 seventh-onion magic-square center and HTML div **331**. These are exact source arithmetic identities; the historical cipher operator is still undetermined.

The *signed 2016 message itself* says: **“Its words are the map, their meaning is the road, and their numbers are the direction.”** This motivates a finite, human-executable candidate: measure each printed p32 word by its GP-prime sum, start at byte zero of the historically archived signed message, and advance cumulatively modulo the **1,136-byte** source length fixed by the 16-rune ring. For the first seven p32 words:

| Original word ordinal | GP-prime step | Cumulative signed-message byte offset (zero-based) | Independently recognizable marker |
| ---: | ---: | ---: | --- |
| 1 | 73 | 73 | Signed-message prose |
| 2 | 125 | 198 | Signed-message prose |
| 3 | 267 | 465 | PGP signature Base64 |
| 4 | 613 | 1,078 | PGP signature Base64 |
| **5** | **191** | **133** | Historical 2014 seventh-onion HTML title **133** (numeric match; the selected byte is prose) |
| **6** | **184** | **317** | **First byte** of literal `-----BEGIN PGP SIGNATURE-----` delimiter |
| **7** | **14** | **331** | **Center byte** of that same **29-byte** delimiter, ASCII space (byte 32); independently 2014 square center **331** |

The seventh word's step of **14** is exactly half of the 29-byte delimiter's span after removing the central byte: its midpoint is byte **317+14=331**. The cumulative sum of the first seven word weights is **1,467**, so the landing at 331 is algebraically determined by the 1,136-byte ring length. The first five land at 133, and the sixth advances to an independently meaningful original-file boundary. This is a plausible candidate clue-chain, **not an authenticated key or decipherment**. Its main vulnerability is model-selection freedom: the 5×5 ring and byte-walk interpretation were recognized after scanning source correspondences, and mere accidental offsets into an ASCII signature are possible.

On the exact 121-source-rune p32 page, a deterministic 200,000-shuffle conditional null keeps the 21 top-row/left-column glyphs fixed (preserving the 563×569 image-dimension checksum) and shuffles the remaining 100 original runes, holding all other rune counts and source geometry. The counts are **26/200,000** for ring sum 1,136, **425/200,000** for first-clause sum 1,467, **31/200,000** for their difference 331, and **1/200,000** for both exact sums. The ring sum is unusually high on this constrained null (708/200,000 shuffles reach or exceed it). These retrospective conditional frequencies cannot be interpreted as a prespecified discovery-wide p-value. They justify retaining the clue as an intermediate source hypothesis, not promoting it to established decryption.

For all 22 p32 words, the word-sum walk ends at byte **365** after five full 1,136-byte circuits. The selected ASCII bytes do not spell a message. Simple fixed source-byte-to-GP29 additive inverses using word-before/word-after steps or cumulative per-rune GP-prime jumps, two signs and origins 0/331, remain nonlinguistic. Similarly, a modest class of direct GP29 word-length positional additive inverses across all original unknown pages has IoC **0.03444–0.03452**, approximately the raw ciphertext baseline, with no plaintext recovery. The next decisive question is whether the **PGP delimiter-center landing** determines an independently executable payload/selector extraction from the historical signed bytes, with an original unknown-page prediction fixed before scoring.

**Source-asserting CommonJS SFT:** [sims/p32_2016_signed_wordmap_sft.cjs](../sims/p32_2016_signed_wordmap_sft.cjs), including original word offsets, the 29-byte header center, and the seeded constrained null. [Manual original-source CI run 42947442086](https://github.com/FlareZ123/liber-primus/actions/runs/42947442086) completed successfully on Node 22, reproducing every claimed exact source coordinate and all 200,000 null draws.

## Original 2016 tree direction-field discriminators

Two interpretations of the source p32 interior GP-prime numbers as local branch bearings were tested against **the authentic preserved signed 563×569 JPEG**, not resampled LP2 page art. The source's top-row and left-column GP-prime widths/heights define all 121 image rectangles. Both probes leave those exact dimensions and the 100 interior rune labels unchanged, remove pixels with a >=180 luminance sample in their 3×3 neighborhood, accumulate Sobel-gradient evidence in the interior rectangles, and compare the source label alignment against 100,000 same-label permutations.

| Source-fixed direction rule | Original match | Null mean | Null sd | Outcome |
| --- | ---: | ---: | ---: | --- |
| GP prime mod 4 as one of four undirected gradient-normal bins | 253,399.942 matched energy | 259,436.724 | 4,880.092 | Positive-tail **0.890741**, z=−1.237; unsupported |
| GP prime as a literal angle in degrees, continuous energy-weighted cos(2Δ) | 20,091.817 signed score | 5,435.276 | 12,684.034 | **Two-sided 0.251437**, z=+1.156; unsupported |

The mod4 source labels have counts **[0,43,4,53]** across bins 0–3: all GP prime weights except 2 are odd, so this interpretation is mathematically incapable of expressing the four directions evenly. The continuous-angle alternative treats the actual primes **2–109** as source-specified degree bearings, following the historical degree convention and avoiding the mod4 information loss. Its fixed two-sided statistic accounts for whether the printed angle is meant as the tree-branch tangent or the perpendicular Sobel normal. Neither original-image score is unusual enough to select a hidden instruction or decoding key.

The exact source image dimensions, p32 prime checksums, and the proposed ring/word map remain separate hypotheses. This pair of bounded failures retires these **specific** original-image orientation encodings, without excluding different independently instructed image extractions. Reproducers: [mod4 SFT](../sims/tree121_directional_field_sft.py) and [CI](https://github.com/FlareZ123/liber-primus/actions/runs/42947378636); [continuous-degree SFT](../sims/tree121_continuous_direction_sft.py) and [CI](https://github.com/FlareZ123/liber-primus/actions/runs/42947897238). Both are exposed as explicit probes in the existing manual-only `grid-256-tests.yml` workflow.

## Decision and next discriminator

The strongest current source leads are the **corner-conditional ring-derived Möbius action** and the separately specified **p32 word-sum walk into the 2016 signed PGP marker**, both anchored by the exact central-ring sum = signed payload length = 1,136. Neither identifies the authentic unknown-LP2 cipher. The direct cipher interpretations are negative; do not repeat them. A high-value next discriminator is whether the walk's **317→331** signature-delimiter transition fixes an unambiguous source operation that predicts original LP2 plaintext. Independently, determine whether the matrix's four 7-cycles and two fixed points supply a source-defined rune map, and whether projective infinity corresponds to a 13-dot marker. Both original-image direction probes are negative: mod4/Sobel and literal continuous-degree/Sobel. A successor must fix a distinct source-visible extraction or a forward key mechanism before reading unknown LP2. Do not expand into arbitrary ring rotations, image thresholds, or unconstrained key families.

**Reproducers and sources:** [sims/tree_prime_canvas_partition_sft.py](../sims/tree_prime_canvas_partition_sft.py) for p32 geometry and prior image negatives; [sims/tree121_directional_field_sft.py](../sims/tree121_directional_field_sft.py) and [sims/tree121_continuous_direction_sft.py](../sims/tree121_continuous_direction_sft.py) for completed original-image direction negatives; [resources/historical/cicada2014-openpuff-magic-squares.txt](../resources/historical/cicada2014-openpuff-magic-squares.txt) for the 7×7 square; [workplace/2016-image-dimensions-lag6-source-derivation.md](../workplace/2016-image-dimensions-lag6-source-derivation.md) for the signed-image coordinate derivation. This remains intermediate research, not an established decryption.
