# First two LP2 word-prime sums reuse the 2016 tree-image dimensions

**Evidence status (13 November 2026):** exact original-source numerical correspondence and matched-layout randomized control. This is a **source-linked clue hypothesis**, with no original unknown plaintext, key, complete decoder, or route. The 2016 image-size / p32 row-and-column correspondence was previously established; the **first-two-page unique-word alignment** is the new observation.

## Source-controlled finding

The archived January 2016 Cicada 3301 tree JPEG is 563 × 569 pixels. Its accompanying independently verified, extracted signed message says that Liber Primus's words are the map and their numbers are the direction. The dimensions are preserved in [the repository's 2016 source record](../resources/cicada2016-4gq25.md). The same pair is already known to equal **the first row's** and **the first column's** GP-prime sums of the original p32 121-rune 11×11 grid ([original p32 image study](lp2-p32-signed2016-tilepixel-key-gate.md)). Reuse of these same two numbers in another arithmetic view must be treated as correlated evidence, since the source pair was chosen once.

Using the canonical printed page order and glyph-to-prime table, and treating punctuation and printed word separators as word boundaries, the **entire 56-page unsolved LP2 region**, including the runeless p50, contains **12,956 rune symbols in 2,928 page-local segments**. Exactly one segment sums to **563** and exactly one sums to **569**:

| Image axis | Prime sum | LP2 physical page and word (one-based) | Original glyphs | GP values |
| --- | ---: | --- | --- | --- |
| Width | 563 | **p0 word 6** (11 glyphs) | ᚾᛖᚹᛒᚪᛋᛟᛇᛁᛝᚢ | 29+67+19+61+97+53+83+41+31+79+3 |
| Height | 569 | **p1 word 33** (10 glyphs) | ᛄᚠᛁᚾᛡᚳᚣᛠᛁᛡ | 37+2+31+29+107+13+103+109+31+107 |

They occur on the **first two physical pages in the image's width/height order**, and their prime sums are adjacent ordinary primes. The p0 word transliterates as \`NEWBASOEEOINGU\` in the repository's conventional one-token GP output, with no demonstrated plaintext meaning. The p1 word transliterates as \`JFINIACYEAIIA\`. Do not treat the leading English-looking \`NEW\` as recovered plaintext or infer a cipher from it.

The independent archived **2012** first-image dimensions **503 × 509** have only three 503-sum word hits and zero 509-sum word hits in the same unsolved region. This is a limited comparison between two historically available image-size pairs, not a comprehensive multiple-testing correction.

## Matched-layout discriminator

Use the exact original p0/p1 262 and 266 rune histograms, their original word-slot lengths (59 and 63 page-local words), and shuffle rune identities independently *within each page*, without moving boundaries. This null breaks an intended association between printed words and sums while respecting page-specific composition. A deterministic Fisher-Yates generator (unsigned 32-bit LCG seed **0x3301563**) makes **30,000** independent-page pairs.

| Frozen event | Null occurrences | Fraction of 30,000 |
| --- | ---: | ---: |
| Both 563 and 569 anywhere on p0 and/or p1 | 18 | 0.0006000 |
| **563 on p0 and 569 on p1** | **6** | **0.0002000** |
| Both also at observed exact word slots p0#6 and p1#33 | 0 | 0 in finite sample |
| At least one 563, irrespective of 569 | 828 | 0.0276000 |
| At least one 569, irrespective of 563 | 828 | 0.0276000 |

The source-image dimensions and order fix the primary ordered-page event; the exact word-slot numbers were discovered after inspection and must not be assigned a fresh 0/30,000 claim of significance. This finite p≈0.0002 is conditional on the explicit narrow shuffle model; it does not estimate the full research-wide false-discovery rate, compensate for all historically possible image dimensions or show the authors intended this link.

### Independent-source index interpretation and exact fixed-slot null

There are two natural *additional* source numbers, recognized after the word-sum match. The image's pixel-axis difference is **569−563=6**, exactly the p0 matching word's **one-based word number 6**. The matching tree image is printed on LP2 **physical p32**, which is the **33rd physical LP2 page** under the historically documented one-based book-code convention; this is exactly the p1 matching word's **one-based word number 33**. Thus a hypothetical human route could start from image dimensions, recognize the tree page, take **word 6 from the first page** and **word 33 from the second**, and read their GP-prime sums to reconstruct width563 and height569. The first two page choices, the use of dimensions as checksums, and the division of the two source ordinals among those pages are *not* stated in the source. The gap6 also occurs between the separately archived 2012 image dimensions503 and509, so the gap itself is not unique to this JPEG.

For the more restrictive **fixed word-slot null**, count exactly the ways to sample each target word's original number of rune tokens without replacement from its page's original multiset, weighting rune-category compositions by binomial multiplicities. A BigInt polynomial dynamic program obtains:

| Fixed word slot, source target | Favorable combinations | All combinations | Conditional chance |
| --- | ---: | ---: | ---: |
| p0 word6 (11 runes), sum563 | 35,899,236,695,815,881 | 8,086,245,943,682,454,912 | **0.004439543015** |
| p1 word33 (10 runes), sum569 | 711,438,468,463,099 | 411,805,263,302,065,633 | **0.001727608974** |
| Both source-ordered exact slots | independent-page product | | **0.00000766979435** |

The fixed-slot product is an **exact conditional probability under the declared rune-shuffle null**. It is more discriminating than the any-word ordered-page event because the source gap and one-based tree page number select the actual two word ordinals. **Crucially, the hypothesized selection of first/second pages and the realization that these two numeric positions agree were made after inspecting the ciphertext.** The mathematical product is therefore a conditional chance diagnostic, *not* a corrected probability of authorial design or an authentic decryption rule. This source-path interpretation is a plausible opportunity for a future independent clue, not a completed step.

### The width-selected word begins with three compass runes

The p0 word6 whose GP-prime sum exactly equals the 2016 image width **begins with the *literal original ciphertext runes* N, E, W** (\`ᚾᛖᚹ\`). This gives a plausible semantic reading of the signed source phrase “their numbers are the direction”: north, east, west. It is also the ordinary English word “new”, so the compass reading must remain a hypothesis. The next three glyphs are **B, A, S**, so the six-glyph prefix is the exact original **\`NEWBAS\`**; this is the *only* original unknown printed segment with that contiguous six-rune sequence. Its seventh glyph is **OE**, rather than the distinct E rune, and no complete source word spells **\`NEWBASE\`**. The remaining eight glyphs after NEW do not form a compass instruction, and the original page does not mark a stop after its third or sixth glyph. Neither the apparent English word NEW nor the suggestive incomplete phrase NEWBAS is **recovered plaintext**.

Of 2,928 unknown original printed segments, **five** begin with any three of the four single-rune cardinal letters N/E/S/W: p0#6, p18#39, p23#15, p37#22 and p45#35. Only p0#6 begins with \`NEW\`, and only p0#6 has the independently source-dimensioned 563-sum word.

The exact combinatorial shuffle of the *original p0 page's 262 rune symbols*, preserving word6's eleven-glyph length, gives \`P(word6 sums563 and its first three runes are all compass letters)=0.00000998757847680622\`, with **P(any three compass runes | sum563)=0.00224968615989257**. The further exact event \`NEW\` in order plus sum563 has chance \`0.000000150602065391061\` under that specific fixed-slot null. Cardinal category was proposed from the signed directional clue; the three-prefix length and literal NEW order were recognized *after* inspecting the target. These are conditional combinatorial measures, never discovery-wide probabilities or proof of a designer-supplied path.

**Route stop:** the clue does not specify a p32 starting square, whether movement happens before or after reading, why to truncate the source word at three glyphs, or how subsequent noncardinal glyphs turn into direction. Do not manufacture a start/path or claim an original plaintext fragment solely from the readable cardinal prefix.

## Literal NEWBAS / numeral-base consumer: bounded negative

The width-selected original word begins with \`NEWBAS\` and the independently authenticated 2013 Cicada server used the operation \`BASE29\`. A natural human hypothesis is that the opening word hints at a **new numeral base**. The original pp49–51 numeric grid has an externally documented candidate base60 alphanumeric convention, with a separately discussed base59 alternative. No original source spells out NEW BASE, selects base59/60, or says to re-express an entire rune-word as an integer; **this test is conditional on that interpretation**.

Freeze each of the 2,928 original page-local printed word segments as a big-endian GP-index base29 integer. Convert each entire integer, without changing boundaries, into ordinary unpadded base59 or base60 digits under the candidate p50 alphabet (the first 59 or 60 symbols of \`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx\`). This is exact reversible numeral conversion when each original digit count is retained, and the original-input SFT positively round-trips the independently chosen base-60/base-59 English word \`HELLO\` through GP29 digits.

| Candidate target base | p0#6 width-word output | p1#33 height-word output | Uppercase-only outputs, first two original pages | Uppercase-only outputs, all unknown pages |
| --- | --- | --- | ---: | ---: |
| 59 | \`RYriPRWG4\` | \`15BR2c2dI\` | **6 / 122** | **189 / 2,928** |
| 60 | \`O7DTNDFbK\` | \`v48oELtj\` | **6 / 122** | **188 / 2,928** |

Both direct conversions yield overwhelmingly mixed digits, upper- and lowercase letters rather than original-order uppercase GP-readable prose. This excludes a **literal one-stage per-word BASE29→base59/60 uppercase-message decoding**. Mixed-case or further enciphered material is outside this test, but no authenticated later operation was supplied. The incomplete NEWBAS appearance is a post-inspection lead, not a source-issued key or a reason for free-radix searches. Reproduction is integrated into the [existing source-words SFT](../sims/lp2_2016_dimensions_firstwords_sft.cjs).

## Six-rune NEWBAS source-key continuation: original pages p0/p1 remain unreadable

A separate original-text consumer uses **only one key selected by the visible source numbers**: the 2016 tree image's height minus width is \`569−563=6\`, and the width-selected p0 word6 begins with exactly six rune tokens \`NEWBAS\`. The historically demonstrated 2014 solved-text Vigenère step motivates asking whether these six literal symbols are a repeating GP29 key for the original black runes **immediately after** this complete printed word and for the **following physical page**. This fixes a 228-rune remaining p0 tail starting at exact local offset34 and the complete 266-rune p1, without adjusting a phase or scanning keys.

Freeze GP-index key \`[N,E,W,B,A,S]=[9,18,7,17,24,15]\` and both elementary arithmetic directions \`P=C±K (mod29)\`. Use either unconditional six-period key advance, which is fully bijective and exactly reciphers arbitrary GP29 strings, or the one documented p56 *literal F* ciphertext-pass-through/clock-hold convention as a separate conditional readout. Decode p0 and p1 independently from key phase zero; also decode their concatenation as a continuous source-order clock. The latter is an additional diagnostic using the same key and p0-tail start, with no fitted offset.

| GP29 inverse sign | Literal F holds key? | p0 228-rune IoC | p1 266-rune IoC | Continuous 494-rune IoC |
| --- | --- | ---: | ---: | ---: |
| C−K | No | 0.03408300 | 0.03438786 | 0.03380936 |
| C−K | Yes | 0.03597651 | 0.03657256 | 0.03557497 |
| C+K | No | 0.03238272 | 0.03294084 | 0.03352194 |
| C+K | Yes | 0.03601515 | 0.03745212 | 0.03655222 |

All eight page-local outputs and the four source-continuous outputs remain random-like/nonlinguistic by direct GP transliteration. The strongest original p1 IoC is only **0.03745**, while independently solved native GP p57 exceeds **0.055**. The ordinary Vigenère modes round-trip an independently known p57 GP-English plant exactly; the F-hold variant is explicitly conditional and is not claimed to be a plaintext-wide bijection. The source-selected key and key start are therefore insufficient to recover authentic unknown-page plaintext.

**Decision:** the especially simple \`NEWBAS\` six-rune periodic Vigenère continuation is rejected. The original six-rune appearance remains an unexplained clue candidate. No independent source commands six-period Vigenère, an altered radix, or a subsequent more complex operation, so do not expand into phase, key-length or skip-rule sweeps. The [integrated original-input source SFT](../sims/lp2_2016_dimensions_firstwords_sft.cjs) asserts the exact key, starts, complete IoCs and positive encryption controls.

## Direct source-addressed 11+10-key inverse on p32: negative

The **11** runes of p0 word6 and **10** runes of p1 word33 fit the natural p32 **11×11** matrix as one complete horizontal key (11 columns) and keys for its **ten remaining rows** (the first row gets vertical offset zero). This is a stronger potential *consumer* than a numerical collision: the two unique source-addressed words determine all key symbols, and a two-dimensional additive cipher can be executed reversibly on the 121 original p32 runes.

Freeze all keys and p32's natural row-major order. For each original GP29 rune \`C[r,c]\`, compute either:

- an additive separable candidate \`P[r,c] = C[r,c] ± horizontal[c] ± vertical[r]\` modulo29, with \`vertical[0]=0\`; or
- a multiplicative outer-product candidate \`P[r,c] = C[r,c] ± horizontal[c]×vertical[r]\` modulo29, allowing vertical row0 factor 0 or 1.

Read each key rune either as its GP index or its corresponding prime weight modulo29. These form **16** fixed reversible original-cipher candidates with no key search, offsets, word selections or language-fitted exceptions. Both plain↔cipher directions round-trip all original **121/121** runes exactly by construction.

The original p32 output GP29 IoC ranges **0.032369–0.039394** over all 16. The best is GP-index additive \`(+horizontal,+vertical)\`, **IoC 0.039394**, starting **\`FLOALTGISEAOEEAWGENGMOERMAEMJYASEATHAEOIAOIATHWTMOYHJTHC...\`**. The actual untranslated original p57 *native GP English* source has IoC above 0.055 on its 95 runes (standalone reproducer prints its exact score). None of the 16 outputs yields recognizable native GP English. The source provides no further operation warranting rescue by rearranging key coordinates, selecting alternate word slots, or fitting cipher parameters.

**Decision:** the concrete 11+10 two-dimensional additive/multiplicative consumer does **not** decrypt p32. The two uniquely addressed original words remain a provisional numerical link, with no independently fixed use.

## Causal relevance and stop rule

This link supplies two *uniquely source-addressed printed ciphertext words*, and the signed 2016 guidance offers a plausible human reason to inspect word sums. It may be used to **propose a concrete next reversible operation or source-derived key/clock** if an independently readable clue supplies one. The 2016 dimensions already serve as p32 11×11 orientation markers, so there is a real competing explanation: their additional collision with opening-page word sums may be incidental.

The simplest successive-prime word walk has a blocker: after unique word sums 563→569, the next prime 571 hits **two** distinct LP2 words (p12#58 and p43#25); the subsequent prime 599 hits **no** original unknown word. Thus a global unqualified "go to the next prime" route is not supplied by this observation. A source-selected branch rule or independent withheld destination would be required to claim a route. Do not run arbitrary Vigenère variants or promote this to \`results/README.md\` without such a selector.

**Reproducible input and test:** [\`sims/lp2_2016_dimensions_firstwords_sft.cjs\`](../sims/lp2_2016_dimensions_firstwords_sft.cjs) on canonical [transcription](../resources/liber-primus/lp2-transcription.txt), [GP29 corpus](../resources/liber-primus/lp2-corpus.json) and the preserved source image dimensions.
