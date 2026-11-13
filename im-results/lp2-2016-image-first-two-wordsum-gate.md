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

Width and height fix the 563-before-569 ordering only **after choosing which pages to examine**. The p0/p1 pair and the observed exact word slots were recognized retrospectively; the 6/30,000 result is therefore a *fixed-p0/p1 conditional* shuffle diagnostic, not a manuscript-wide discovery probability.

**All-page selection audit (Critic, 13 November 2026).** A separate 3,000-draw null shuffles each of the **55 rune-bearing unknown pages** independently, preserving every original page's rune inventory, printed word lengths, word-slot positions and physical location. It searches all 55 pages for the fixed 2016 image sums, while respecting runeless p50 when testing physical adjacency. The same `0x3301563` seed initializes an *independent* PRNG stream, leaving the earlier two-page test unchanged.

| Source pair event across all unknown pages | Count / 3,000 | Empirical frequency |
| --- | ---: | ---: |
| The exact p0 width563, p1 height569 pair | 0 | 0; too few trials to resolve this rare event |
| Width563 on any physical page immediately before height569 | **32** | **1.0667%** |
| Width563 on any earlier page than height569 | **492** | **16.4%** |
| Both image sums anywhere, in either order | **828** | **27.6%** |

The counts and entire original-input page layout are asserted in the existing [reproducer](../sims/lp2_2016_dimensions_firstwords_sft.cjs). This quantifies the page-pair selection opportunity missing from the fixed-p0/p1 0.0002 statistic. Even 1.0667% is conditional on the retrospectively proposed prime-sum operation, the selected historical dimensions, and this particular shuffle null; none of these probabilities proves a designer-intended instruction or yields original plaintext.

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

**Complete-opcode stop test (Director #730, 13 November 2026).** The source imposes no unique starting numeral grammar, even before choosing the new radix. The p0 word contains **11 original GP rune symbols**, transliterating to **14 ASCII letters** `NEWBASOEEOINGU`; p1 similarly has **10 GP runes** versus **13 ASCII letters** `JFINIACYEAIIA`. Thus reading the rune indices as base29 digits and reading the expanded transliterations as alphanumeric digits are *different reversible numeric codecs*. In conventional `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ` digit order, these expanded words contain `W=32` and `Y=34`, which cannot occur in direct BASE29 notation (legal digit values are 0–28, i.e. through S). For literal ASCII alphanumeric reading, **both base35 and base36 are internally valid**, and no original clue selects between them: p0 base35→base29 gives `990R7HG5GLH8CQ1`, while p0 base36→base29 gives `DC78R4369JNBH30`; p1 yields respectively `6BKC9LAG5C321F` and `8S6FSBHK1GSS8C`. These are exact standard positional conversions of the *same frozen two source words*, not a plaintext search. A third proposed grammar could use the original rune prime weights, which exceed 100 and demand another unspecified radix. The source also does not select the p50 numeric table versus p0/p1 words as **the input**, a unique **target base** (59/60 remains disputed), direction, tokenization of multi-letter runes, or a subsequent cipher/clock for 40 held-out runes. These are essential operands. Several reversible encodings fit all independently visible instructions while giving different outputs, so there is **no defined prospective 40-rune plaintext prediction**. The incomplete `NEWBAS` prefix remains a source-shaped hint, and the BASE29→59/60 consumer above is already a bounded failure. Further radix scanning would fit free degrees of freedom after observing ciphertext.

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

## Literal NEW as a historically demonstrated OutGuess key: original p0 negative

The width-selected p0 word6's first **three** original GP tokens are the independent natural-language compass abbreviation **NEW**. Unlike freely guessing a key, this furnishes a single exact, source-visible word fragment. Cicada's historical 2014 images genuinely used password-keyed OutGuess retrieval, so **NEW** is a finite hypothesis for the very first unknown LP2 JPEG, `17.jpg` (physical p0). The source still does not explicitly command OutGuess, identify this password, or say to truncate the word after three tokens.

The maintained pinned OutGuess workflow was executed **once** on exactly original image `17.jpg` and exact case-sensitive password `NEW`, with no other key or carrier search. The extractor reports success and a nominal header of **28,054 bytes** with seed **37,809**. Actual output is **28,054 bytes**, SHA-256 `8aaa439cf2aaf585fe8247b75f984adc932f0a1111f2291c83ced8230133eaf8`, first32 bytes `b193966d15496003dcb652423349ece93c21b450f0de5bb5c86e943ac2179932`. Its ASCII-printable fraction is **0.382833**, Shannon byte entropy **7.992297 bits**, and there is **no recognized PGP, ZIP, gzip, PNG or printable message**.

The decisive **false-header negative control** uses a freshly algorithmically generated JPEG that never had a payload embedded, under the **same password NEW**. It also returns a nominal successful OutGuess header with seed **49,346**, length **28,442** and a random-looking binary extraction (SHA-256 `d4c5be6758789848630cd424631ede7e9e1bee3ab7acfd6dbb7e1c5caa9dae8e`). An actually embedded password-79 message is recovered byte-exactly from source image17, alongside the original historical unkeyed LP1 controls; these verify the extractor and demonstrate that header success alone does **not** authenticate a hidden message.

**Decision:** the one-step source-visible `NEW` → password-keyed OutGuess on original p0 produces no authenticated content, genuine PGP object or original LP2 key. The high-entropy candidate is indistinguishable from the demonstrated clean-image false-header mechanism under the available checks; its purposeful encryption cannot be universally excluded. Do not extrapolate to arbitrary capitals, substrings, password variants or other pages without an independent printed instruction. Exact [manual original-source Actions run 43393269611](https://github.com/FlareZ123/liber-primus/actions/runs/43393269611) specifies `custom_password=NEW` and `custom_image=17`, with raw extraction and three positive/negative controls; the source implementation is [`sims/outguess_lp2_keyed_probe.cjs`](../sims/outguess_lp2_keyed_probe.cjs).

## Direct source-addressed 11+10-key inverse on p32: negative

The **11** runes of p0 word6 and **10** runes of p1 word33 fit the natural p32 **11×11** matrix as one complete horizontal key (11 columns) and keys for its **ten remaining rows** (the first row gets vertical offset zero). This is a stronger potential *consumer* than a numerical collision: the two unique source-addressed words determine all key symbols, and a two-dimensional additive cipher can be executed reversibly on the 121 original p32 runes.

Freeze all keys and p32's natural row-major order. For each original GP29 rune \`C[r,c]\`, compute either:

- an additive separable candidate \`P[r,c] = C[r,c] ± horizontal[c] ± vertical[r]\` modulo29, with \`vertical[0]=0\`; or
- a multiplicative outer-product candidate \`P[r,c] = C[r,c] ± horizontal[c]×vertical[r]\` modulo29, allowing vertical row0 factor 0 or 1.

Read each key rune either as its GP index or its corresponding prime weight modulo29. These form **16** fixed reversible original-cipher candidates with no key search, offsets, word selections or language-fitted exceptions. Both plain↔cipher directions round-trip all original **121/121** runes exactly by construction.

The original p32 output GP29 IoC ranges **0.032369–0.039394** over all 16. The best is GP-index additive \`(+horizontal,+vertical)\`, **IoC 0.039394**, starting **\`FLOALTGISEAOEEAWGENGMOERMAEMJYASEATHAEOIAOIATHWTMOYHJTHC...\`**. The actual untranslated original p57 *native GP English* source has IoC above 0.055 on its 95 runes (standalone reproducer prints its exact score). None of the 16 outputs yields recognizable native GP English. The source provides no further operation warranting rescue by rearranging key coordinates, selecting alternate word slots, or fitting cipher parameters.

**Decision:** the concrete 11+10 two-dimensional additive/multiplicative consumer does **not** decrypt p32. The two uniquely addressed original words remain a provisional numerical link, with no independently fixed use.

## P32 as an 81-rune key for p33: test the genuine two-stage alternative

The failed 11+10 source-key inference above only evaluated whether its 121-rune p32 *intermediate* was native GP English. A meaningful distinct possibility is that the tree page holds a **key**. Physical p32's 11×11 square has an independently source-selected **9×9 inner 81 runes** after removing its circumference, matching solved p57's instruction to shed our own circumferences. The following physical p33 begins with a 10-rune red heading and a 13-dot divider at local index10; its next black-body section contains **exactly 81 runes** before the next 13-dot marker at local index91. Prior work tested the **untransformed** p32 inner 81 as a Vigenère key for that exact p33 81-body segment, obtaining C−K IoC 0.04197531, but did not combine it with the newly source-dimensioned **p0/p1 11+10** key data.

This invocation therefore executed one specific source-guided **two-stage** hypothesis: first unmask all 121 original p32 runes by the exact sixteen already declared GP-index/GP-prime, additive/multiplicative two-dimensional 11+10 keys; then extract the **9×9 interior** of each resulting p32 matrix row-major as an 81-rune key, and use the historically demonstrated GP29 Vigenère subtraction or addition once against the complete independently marked p33 black-body 81 runes. This yields **32 fixed outputs** (some identical because the first-row mask is outside the 9×9). There are no fitted key phases, new source offsets, implicit resets, image thresholds, dropped output runes or language-optimized exceptions. All complete p33 outputs have a well-defined ordinary Vigenère inverse. An authentic solved-p57 81-rune native GP plant is fully recovered under every synthetic encode/decode pair.

The **best of all 32** is the GP-prime-mod29 additive 2D intermediate with both axis signs −1 and downstream C+K, p33 IoC **0.041358024691**. Its beginning is \`THEOHPHWEEOLEOTHMLEAGJFEOMBLTFOEAROEEODGEAERNEAJC...\`, which is **not coherent GP-English** (the opening is TH followed by EO). The original p33-body IoC is **0.033024691358**, and the independent native solved-p57 81-rune IoC is **0.058950617284**. All 32 original outputs remain below the native control and fail to recover recognizable sustained plaintext.

**Decision:** treating the resulting p32 matrix as a *key* instead of English does **not** rescue this source-selected p0/p1→p32→p33 two-stage additive reading. This is an actual previously untested consumer of the opening-page word selector, so it must be distinguished from the simpler first-stage nonlinguistic p32 result. It leaves nonlinear or externally keyed continuations unresolved, and supplies no evidence for inventing another layer. [Same positive-control SFT](../sims/lp2_2016_dimensions_firstwords_sft.cjs), which records every complete original-output IoC and initial GP transliteration.

## Reordering the p32 key rather than adding it: source-ranked columnar map

A structurally distinct use of the **11+10** dimension-selected opening words is as **column/row sorting keys** for the 11×11 p32 rune matrix. This is an ordinary historical transposition style and fits the visible width/height directions. The p0 11-rune word contains eleven distinct GP values, so it yields a full ordering of eleven columns; the p1 ten-rune word sorts the ten remaining rows by stable GP rank while retaining the image-selected top row as an axis. Column/row sorting itself cannot turn a flat unigram distribution into native language, so the test treats the **transposed p32 as a key**, extracts its inner9×9, then applies the one-shot ± GP29 Vigenère inverse to the independently source-marked **p33 81-rune body**. Both ascending and descending stable rank conventions give **8 fixed candidate outputs**. There is no fitted plaintext phase, image operation, or readout window.

The best of eight is ascending stable sort of both axes with p33 C−K: original IoC **0.040432098765**, opening \`ALFTTHALNGAEULEJXRNGCTHSIAIALAEAGNGNXOELOEERANGPST...\`; none of the eight outputs has sustained recognizable GP-English, against solved-p57 81-rune native IoC **0.058950617284**. Exact transposition preserves all 121 original p32 rune counts, and the independent native p57 key-encipherment controls recover their **81/81** plaintext runes. The ranked-columnar idea is a proposed operator, not an instruction attributed to the authors, so further arbitrary matrix orientations or rank tie-breaks are unlicensed.

**Decision:** this most literal source-sized 11-column/10-row transposition used as a p33 key also fails to recover plaintext. Recorded in the same [original-input SFT](../sims/lp2_2016_dimensions_firstwords_sft.cjs), without changing the established interpretation of the 2016 image dimensions.

## Source-word count as the whole p32 key: 122 opening words for 121 map cells

A distinct literal interpretation of the authenticated 2016 direction “Its words are the map” deserves one finite original-source test. The **first two physical LP2 pages**, independently selected by the two JPEG dimensions and unique word-prime-sum hits, contain exactly **59+63=122 page-local printed words**. The tree p32 has **121=11×11 rune cells**. Removing one independently dimension-addressed opening word, either p0#6 (563) or p1#33 (569), leaves exactly **121 complete words**. This is a potentially human-executable one-to-one address map. The extra-word coincidence, omission policy, prime-sum residue and cipher itself are interpretive, with no historical instruction asserting they form a key.

Freeze the original first-two-page source-order printed words, remove only p0#6 or only p1#33, sum their actual GP prime weights, reduce the remaining **121 word sums modulo29**, and apply this 121-symbol key to the 121 original tree-page rune indices using the two historically established GP29 Vigenère directions \`C±K\`. As a separate already source-selected *key-not-plaintext* alternative, take each transformed p32 matrix's inner **9×9=81** and apply it once as \`C±K\` to the next p33 ink-bounded 81-rune section. This defines exactly **4 single-stage and 8 two-stage** source-order candidates. No word reordering, other omissions, phases, key lengths, byte-conversion conventions or target selection are permitted. Authentic solved p57 GP-text plants round-trip under every respective fixed additive key.

The **best of all twelve readouts**, under p1#33 omission, first-stage plus and second-stage minus, has p33 IoC **0.039506172840** and opens \`AAEFATOEEOAOTHXPNGOEAPTHBPEAUIWIEONGYJAEAEMYEAC...\`, with no recognizable GP-English. The best single-stage p32 IoC is **0.039118457300**, also nonlinguistic. Every candidate has IoC **below 0.040**, against solved p57 native GP above0.055. This source-locked word-map literal does **not** supply a p32 key or decipher its immediate continuation. The full original output and planted controls are retained in the [same SFT](../sims/lp2_2016_dimensions_firstwords_sft.cjs).


**Simple directional-walk alternative, fixed from the signed wording.** The same 121 complete source-ordered word totals could be movement steps on the 11×11 tree cells, rather than Vigenère values. Use either \`cursor=(cursor+wordSum) mod121\` on a linear 121-cell ring or \`(row,col)+=(⌊wordSum/11⌋,wordSum mod11) mod11\` on the toroidal 11×11. Start at upper-left cell0, with neither a tuned start nor a word reordering. Exact source visits:

| Removed source word | Linear walk: distinct of 121 cells | 11×11 coordinate walk: distinct of 121 |
| --- | ---: | ---: |
| p0#6 | **79** | **78** |
| p1#33 | **75** | **74** |

The other 42–47 visits necessarily reuse cells; both modes are therefore **not** a one-word-per-cell 121-permutation under their exact definitions. Synthetic complete 121-cell walks pass the test. The original signed text does not demand Hamiltonian coverage, so repeated addresses cannot exclude a message encoded by some separately instructed non-injective path. The four direct conventional walks simply do not supply a complete ordering or recover plaintext; do not change starts and step transformations until a source command chooses them. Their full exact outputs and positive controls are in the same SFT.

**Decision:** the exactly 122→121 opening-word map is a useful source-selected finite hypothesis, now rejected in its direct GP-prime-sum modulo29 arithmetic interpretation. Do not rescue it by searching a new word omission, arbitrary reorderings or a new numeric map without independent original instruction.

## Causal relevance and stop rule

This link supplies two *uniquely source-addressed printed ciphertext words*, and the signed 2016 guidance offers a plausible human reason to inspect word sums. It may be used to **propose a concrete next reversible operation or source-derived key/clock** if an independently readable clue supplies one. The 2016 dimensions already serve as p32 11×11 orientation markers, so there is a real competing explanation: their additional collision with opening-page word sums may be incidental.

The simplest successive-prime word walk has a blocker: after unique word sums 563→569, the next prime 571 hits **two** distinct LP2 words (p12#58 and p43#25); the subsequent prime 599 hits **no** original unknown word. Thus a global unqualified "go to the next prime" route is not supplied by this observation. A source-selected branch rule or independent withheld destination would be required to claim a route. Do not run arbitrary Vigenère variants or promote this to \`results/README.md\` without such a selector.

**Reproducible input and test:** [\`sims/lp2_2016_dimensions_firstwords_sft.cjs\`](../sims/lp2_2016_dimensions_firstwords_sft.cjs) on canonical [transcription](../resources/liber-primus/lp2-transcription.txt), [GP29 corpus](../resources/liber-primus/lp2-corpus.json) and the preserved source image dimensions.
