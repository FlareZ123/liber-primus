# Previous-ciphertext row-permutation capacity: exact 12-phase exclusion

**Original-source, key-independent decision — Agent17, 28 November 2026.** A reversible sender whose only non-clock state is the **previous printed ciphertext rune**, and whose emission is one of at most **twelve shared phase-dependent arbitrary GP29 alphabet permutations**, cannot produce original LP2 p0–55 from **any** matching 12,956-rune GP-native window of the pinned Gibran, Shakespeare or Emerson references (plus the independently tested Latin Vulgate GP register). **The exclusion remains exact even after freely exempting all 86 original repeated-rune event positions as special emissions.** Independently secret chart sets for each original chapter or large-dot interval also fail at one phase, even with the 86 repeated positions exempt. This grants all 29! possibilities for each of 29q secret chart rows, arbitrary plaintext alphabet relabeling, and free initial plaintext symbols at every original page or large-mark interval. The result is a **conditional finite-reference exclusion**, not an unknown plaintext or key recovery.

## Exact typed sender and source framing

The observed cross-word anti-repeat pattern motivates a cipher whose emitting state depends on the **previous ciphertext rune**, rather than treating every printed word independently. For a frame with printed runes C and hypothetical plaintext P, grant its first glyph an unconstrained IV. At later positions i, the typed sender is:

\[
C_i=K_{(i\bmod q),\,C_{i-1}}(P_i)
\]

where each K_(phase, previous-C) is an independently secret GP29 bijection, but is **shared across the whole manuscript**; q is the number of public phases. This is fully reversible given its charts and a starting IV. No constraint of arithmetic, known key alphabet, letter identity, or fluent output is imposed on the original test. There is no Cicada-authenticated instruction selecting this emitter: it is an intentionally broad test of a human-plausible previous-symbol feedback mechanism, not an intended-decoder claim.

Two source-visible reset scopes are charged: (1) the actual **55** rune-bearing physical pages (physical p50 has only numbers), and (2) **29 nonempty marked intervals** delimited by the original **31** large 10/13-dot punctuation events, including duplicate and leading marks. The second crosses physical page seams that have no mark. Within each frame the phase is the local rune position modulo q. All 55 or 29 frame-initial runes are granted arbitrary plaintext, and the sole state selecting the secret row at ordinary positions is the known previous ciphertext rune.

### Key-independent majorization theorem

Let M[t,r,c] count original noninitial positions with phase t, preceding ciphertext rune r and current ciphertext rune c. Sort the 29 output counts in every state (t,r) descending. Let S_k(P) count the k most frequent plaintext symbols, no matter their identities. Every secret permutation sends any selected set of k plaintext labels to exactly k distinct output labels **in each state**. Thus, for every k=1,…,29:

\[
\boxed{S_k(P)\le B+\sum_{t=0}^{q-1}\sum_{r=0}^{28}
\sum_{j=1}^{k}M[t,r,(j)]}
\]

where B=55 page starts or B=29 mark starts. This is an exact, tight upper envelope for **plaintext unigram capacity** over all unknown keys, and a necessary (not sufficient) condition for any full ordered native plaintext. A global secret rune relabeling and arbitrary pre-encryption *position* permutation leave its count bound unchanged. Nonbijective, variable-length, skip/hold and changing-state emitters are not in this family.

For q=1 the **12,901** original page-interior transitions yield the complete descending-rank sums:

[714, 645, 612, 593, 571, 554, 543, 527, 515, 502, 491, 479, 473, 463, 451, 446, 428, 410, 404, 394, 381, 371, 359, 341, 325, 310, 281, 232, 86].

Adding all 55 page-start freedoms gives maximum plaintext symbol frequency **769**, top-two **1,414**, top-five **3,190**, top-ten **5,831**. The rarest output in each previous-ciphertext row is its self-repeat; their sum is the source-observed 86 events. Therefore a secret chart can reproduce a rare plaintext rune as an output repeat **but cannot simultaneously produce ordinary native symbol concentration**.

## Exact original-capacity versus all reference windows

The SFT uses the repository GP29 normalizer with longest rune tokens, ING/IO, QU→CW, V→U, K/Q→C, Z→S. Every 12,956-rune sliding window is tested in all three pinned files: Gibran **49,537**, Shakespeare **204,151**, Emerson **308,372**: **562,060** source windows. The original capacity is fixed before any donor comparison and no proposed key or word is fit to unknown plaintext.

| Source-defined frame | q=1 top-one cap | q=12 top-one cap | q=12 top-ten cap | q=12 top-sixteen cap | q=13 top-one cap |
| --- | ---: | ---: | ---: | ---: | ---: |
| 55 physical pages | **769** | 1,472 | **8,797** | **11,334** | 1,527 |
| 29 large-mark intervals | **744** | 1,439 | **8,695** | **11,256** | 1,510 |

All q=1…12 capacity ceilings at ranks ten and sixteen increase strictly with q under both clocks. The strongest q=12 bound therefore produces an independently reproducible **single-rank contradiction for every donor window and every q≤12**:

| Pinned native source | Fixed rank | Minimum over every native window | Original page q12 cap | Original mark q12 cap |
| --- | ---: | ---: | ---: | ---: |
| Gibran | top 10 | **8,836** | 8,797 (deficit 39) | 8,695 (deficit 141) |
| Shakespeare | top 16 | **11,408** | 11,334 (deficit 74) | 11,256 (deficit 152) |
| Emerson | top 10 | **8,903** | 8,797 (deficit 106) | 8,695 (deficit 208) |

Even the simpler q=1 top-one cap **769** is below the minimum native most-common-symbol count of Gibran **1,416**, Shakespeare **1,408** and Emerson **1,491**. Every one of the 562,060 windows is excluded without guessing which original rune maps to which plaintext symbol.

Allowing more phases softens the bound. The exact full-29-rank survivor counts, from the same frozen source and normalizer, are **necessary capacity passes, not recovered text**:

| Frame | Reference | q=13 | q=14 | q=15 | q=16 | q=18 |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Page | Gibran (49,537) | 0 | 22,690 | 49,537 | 49,537 | 49,537 |
| Page | Shakespeare (204,151) | 40,745 | 131,441 | 183,224 | 192,199 | 204,151 |
| Page | Emerson (308,372) | 0 | 4,374 | 180,489 | 239,550 | 308,372 |
| Mark | Gibran | 0 | 8,796 | 40,090 | 49,537 | 49,537 |
| Mark | Shakespeare | 5,404 | 100,361 | 163,779 | 181,621 | 204,151 |
| Mark | Emerson | 0 | 0 | 64,342 | 168,957 | 305,043 |

At q=23 all these windows satisfy the necessary bound, but q=23 has **667 arbitrary hidden alphabet charts** and no source-selected receiver. Likewise thirteen dots do not establish q=13: its 377 secret rows still fail all Gibran and Emerson source windows and most Shakespeare windows.

## Exact-source implementation and positive controls

[Standalone CommonJS SFT](../sims/lp2_prev_ciph_rowphase_majorization_sft.cjs) reads the authentic source-matched [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json), [original-image ink annotation](../resources/liber-primus/lp2-ink-annotations.json) and all three reference texts. It asserts 12,956 unknown runes, 55 rune-bearing pages, 31 marker events and 29 nonempty marker intervals; computes exact per-state integer counts for q1–18, q23 and q29, and slides all reference windows. It was compiled and **executed against the complete current tracked inputs** in the connected V8 runtime with a read-only require/file-loader shim. All assertions and scans passed; real standalone Node SHA-256 printing was not separately executed in that shim.

Four independent **original-length positive cryptograms** are actually generated and decoded, under both source frame geometries and q=1/q=13. Each hidden GP29 chart is a seeded shuffled permutation, with plaintext NG mapping to the previous emitted cipher glyph in that row. Therefore low-frequency native NG, rather than any malformed output step, is exactly responsible for the **100** repeated cipher neighbors in each plant (original has 86). Every plant recovers **12,956/12,956 plaintext rune positions**, and passes **every one of the 29 original-style ranked-frequency necessary conditions** when run on its own newly encrypted ciphertext. Thus the certificate does not merely reject feedback ciphers because they have artificially low repeat counts.

## Full 86-repeat escape-channel challenge and arbitrary exception floor

**Source-visible, not fitted.** There are exactly **86** adjacent same-rune pairs within the 55 original rune-bearing physical pages. In a direct extension to the arbitrary secret previous-C/clock-phase row model, grant **every second symbol of each one of those 86 printed pairs** a fully unconstrained special output and corresponding plaintext symbol. At the other 12,870 positions the ordinary shared 29q permutation charts still operate, keyed by the **previous published** cipher rune. Other than these 86 positions, no escapes, new state, private chart resets or clock holds are permitted. Page-start runes (55) and large-dot-interval starts (29) remain entirely free, even without a repeat.

The key-independent envelope is recalculated after *deleting those specific 86 original event transitions* from the state-count matrices and giving all their plaintext slots away free. A repeat coincident with a frame start would already be free; for the actual original data there is no such overlap. Thus the page frame has **141 free positions** and the marker frame **115**.

| Source-visible frame | Original q12 top-10 capacity after 86 free events | Original q12 top-16 capacity after 86 free events |
| --- | ---: | ---: |
| 55 physical pages | **8,878** | **11,408** |
| 29 nonempty 10/13-dot intervals | **8,778** | **11,332** |

The program tests **all 29 ranks for every source window**, not only the displayed two ranks. **Zero of all 562,060 independently encoded contiguous Gibran/Shakespeare/Emerson windows** survives **any** q=1…12 under **either** source-defined framing, even with the printed 86 events wholly unconstrained. At q13, where the bound becomes insufficient for some sources, exact exception-aware *necessary-only* survivors are:

| Native reference windows | Page q13 | Marker q13 |
| --- | ---: | ---: |
| Gibran, 49,537 | 10,515 | 5,833 |
| Shakespeare, 204,151 | 96,883 | 67,560 |
| Emerson, 308,372 | 277 | **0** |

**Even without knowing exception positions**, any m arbitrary output exceptions can increase the original nonexception capacity at each rank by **at most m**. Therefore every candidate needs at least:

\[
m_{\min}(P)=\max_{k=1}^{29}\left[\,S_k(P)-B-
\sum_{t,r}\sum_{j=1}^{k}M[t,r,(j)]\,\right]_+.
\]

Minimize that integer lower bound over every tested full-length source window (a *necessary*, not sufficient, count). It yields:

| Source | Page q1 | Marker q1 | Page q11 | Page q12 | Marker q12 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Gibran | **3,040** | **3,052** | **259** | **114** | **216** |
| Shakespeare | **2,843** | **2,855** | **188** | **80** | **158** |
| Emerson | **3,113** | **3,125** | **377** | **220** | **335** |

Thus a predecessor-only q1 sender would require **at least 2,843–3,113 arbitrary exceptional positions** to generate even one of these native 12,956-rune windows (about **22–24%** of all symbols), *not merely the 86 observed doublets*. Even q≤11 page-framed, or q≤12 large-mark-framed, needs **more than 86 exceptions at any positions** for *each* native reference. The only narrow remaining q12-page loophole under *arbitrarily located* 86 exceptions is Shakespeare: 1,562 of 204,151 windows pass that looser rank test, but **zero** pass when those 86 exceptions must coincide with the *actual original* doublet positions. This does not exclude unreported repair at many other positions or unpublished-tentative-state cryptosystems.

Four fresh source-matched planted reversible row-permutation books (q1/q13, both frames) are rechecked when each plant's own repeated cipher events are unrestricted; **all 12,956 actual known plaintext runes recover in every plant**, and all 29 relaxed ranks pass. This is a genuine key-independent **original-cipher contradiction** for the complete declared escape family, not a failure of the cipher's implementation or a hypothesis of recovered prose.

## Independent secret charts for each authentic chapter and marker: still excluded at q1

The preceding pooled-chart result leaves a distinct source-plausible alternative: a **completely new set of 29 arbitrary GP29 substitution alphabets at each original chapter or large punctuation**, selected by the previous **published** ciphertext rune. The [literal manuscript transcript](../resources/lp2-transcription.txt), split at actual dollar signs, gives **eight** unsolved chapters with exact GP rune lengths **729, 1,145, 1,738, 1,894, 1,021, 1,433, 1,680, 3,316** (12,956 total). Separately, the 31 original 10/13-dot events yield **29 nonempty large-mark intervals**. Unlike a shared row key, this test allows **8×29=232 independent secret permutation rows** (chapter), **29×29=841** (large-mark), or **55×29=1,595** (physical page, as a permissive comparison). All frame first runes are free.

Within a frame f, the typed reversible output is C(i) = K(f, prior published C)(P(i)), i.e. one arbitrary new 29-way substitution chart per frame and prior-cipher glyph. No key or proposed plaintext is fit. The same key-independent all-29-rank theorem applies with **state (frame, previous ciphertext)**; its sorted output counts are now calculated separately for each new chart. A stronger version makes the second rune of **every one of the 86 original same-page identical-neighbor events** a wholly arbitrary special output, dropping these events from the normal state histograms and granting all their plaintext letters free.

| Independently secret chart epoch | Original free starts | q1 top-one cap | Top-one after 86 freely exempted repeats | Top-ten after repeats |
| --- | ---: | ---: | ---: | ---: |
| **Eight actual chapters** | 8 | **1,222** | **1,308** | **7,914** |
| **29 original large-dot intervals** | 29 | **1,611** | **1,697** | **8,796** |
| **55 physical pages** | 55 | **2,790** | **2,876** | **12,721** |

Check all 29 ranks, not only these examples, against each of the **562,060** original-length reference windows. The source-native survivors are:

| Reference | Eight chapter-private charts (ordinary / 86-exempt) | 29 marker-private charts | 55 page-private charts |
| --- | ---: | ---: | ---: |
| Gibran, 49,537 windows | **0 / 0** | **0 / 0** | 49,537 / 49,537 |
| Shakespeare, 204,151 | **0 / 0** | **0 / 0** | 204,151 / 204,151 |
| Emerson, 308,372 | **0 / 0** | **0 / 0** | 308,372 / 308,372 |

**The ordinary GP-native donor envelope is excluded even with new 29-row secrets for every one of the 29 authentic large-mark intervals**, a model with 841 independently secret alphabet charts. It remains excluded when the observed 86 repeated sites are exempt. Stronger still, if an adversary may exempt **any positions whatsoever** rather than those specific repeats, the minimum required exception count from the exact all-rank inequality, minimized over *all* native windows, is:

| Reference | Chapter-private minimum arbitrary exceptions | Large-mark-private minimum | Page-private minimum |
| --- | ---: | ---: | ---: |
| Gibran | **1,023** | **243** | **0** |
| Shakespeare | **880** | **321** | **0** |
| Emerson | **1,113** | **266** | **0** |

All chapter- and marker-private minima are **greater than 86**. Physical-page-private 29-row alphabets pass this *necessary unigram gate*, which is not evidence that any ordered native passage actually decodes with such keys; actual ordering and row conflicts may still make it impossible. The meaningful threshold is between 29 authentic visible-marker epochs and 55 independent *physical-page* key epochs, under this precise receiver.

**Three additional full-length positive cryptograms:** use actual eight-chapter, 29-marker and 55-page boundaries; sample 29 independent secret GP29 permutation rows afresh for every frame; force the native rare NG rune to emit the previous ciphertext rune. Each emits precisely **100** ciphertext doublets, reverses **12,956/12,956** native rune positions, and passes all 29 original and exception-aware rank constraints. The standalone SFT checks the eight source chapter lengths directly against the unmodified manuscript transcript and exercises **seven** original-length inverse controls across both pooled and frame-private families.

The causal consequence is narrow but actionable: **neither an independent chart set at every actual chapter nor another at every physical large punctuation is enough**, if previous printed C is the only within-epoch state and the intended prose resembles these GP-native sources. A different plaintext register, a genuinely additional evolving state, much more than 86 unreported exceptions, or at least separate physical-page chart sets would be needed to escape the bounded capacity test. No such alternative has yet supplied a source-selected key or unseen-page plaintext.

## Latin-native independent register challenge

The title *Liber Primus* makes non-English language assumptions worth challenging. The tracked [Latin Vulgate New Testament GP29 reference](../resources/control/latin-vulgate-gp-wholewords.txt) is **already encoded in canonical 0–28 rune indices** as one original Latin word per line (39,835 words, **204,802 GP29 rune indices**). Parse its documented alphabet 0123456789ABCDEFGHIJKLMNOPQRS directly and concatenate source words in their given order. **Do not run English QU/ING normalization on an already-GP-coded source.** This is a different, independently pinned register, not a recoding or reshuffling of the English controls. There are **191,847** additional full-12,956-rune contiguous Latin windows, making **753,907** total full-length tested windows across all four donor registers.

Original-cipher, all-29-rank scans give **zero compatible Latin windows for every q=1…18** under physical-page and original large-mark clocks, both with ordinary shared alphabet charts and with all **86 original doublet sites wholly unconstrained**. In the same independent-chart per-frame test, **zero Latin windows** survives at q1 with eight chapter-private **or** 29 marker-private alphabets, again with/without 86 repeat exemptions. The q1 page-private experiment does not exclude any Latin windows by this *necessary* frequency test. The minimum **arbitrarily positioned** exceptional emissions necessary to evade majorization for even the most favorable Latin passage are:

| Typed row-alphabet cipher | Minimum arbitrary exceptions, Latin |
| --- | ---: |
| Shared rows, page clock q1 | **4,504** |
| Shared rows, page clock q12 | **1,508** |
| Shared rows, marker clock q12 | **1,598** |
| Eight chapter-private q1 chart sets | **2,480** |
| 29 marker-private q1 chart sets | **1,611** |
| 55 page-private q1 chart sets | 0 (frequency gate cannot decide) |

Unlike the three English references, Latin is still excluded even with 18 shared phases. At q23 the original source capacity becomes weak enough to admit **15,593/191,847** Latin windows on physical pages and **3,347/191,847** under large marks without exception grants; with all 86 original repeats exempt these necessary-only survivors increase to **111,016** and **37,783**, respectively. No q23 key or plaintext is inferred from those numbers.

A fresh **eighth full-length GP29 positive plant** is made from the *already indexed* Latin source, encrypted using independent hidden previous-C substitution rows and the original 29-marker frame under q1. The exact inverse recovers **12,956/12,956** rune positions and passes the same 29 normal and exceptional rank conditions. Thus the Latin exclusion is not a mismatch between the source's digit encoding and the cipher's GP29 indexing.

**Interpretation:** this independently rejects a broad native Latin register for the stated predecessor-only cipher mechanisms, alongside three English sources, and makes it less plausible that changing the hidden plaintext language alone would rescue this specific cipher class. It does not exclude all Latin composition, altered punctuation or spelling, other GP languages, any genuine source key, or a different emission mechanism. Original LP2 remains unsolved.

## Complete ordered source-copy inversion for the page-private loophole

The earlier unigram test deliberately **does not exclude** a different secret 29-row alphabet at every physical page, because 55×29 independently chosen charts have enough aggregate capacity to represent all four native text inventories. There is nevertheless a stronger, **key-independent necessary-and-sufficient test for any *specific ordered plaintext passage***, even though the full unknown plaintext remains unobserved.

For one original physical page, the reversible typed cipher is C(i)=K[page, preceding **published** C](P(i)). Each K row is an unknown permutation of the 29 GP indices, otherwise entirely unrestricted. Every observed plaintext/ciphertext aligned pair demands a row assignment **P(i) ↦ C(i)**. Two different conflicts are fatal:

1. The same (page, preceding C, plaintext index) is observed mapping to **different** printed cipher runes.
2. The same (page, preceding C, printed cipher rune) is observed arising from **different** plaintext indices.

Conversely, if both forward and inverse partial row maps are consistent at **every noninitial site**, each row is a finite partial injection on 29 labels and can *always be completed* to a secret full permutation by arbitrarily matching the remaining unused 29-element domain and codomain sets. The page initial printed rune is freely provided as IV. Thus the test is not a language-likelihood heuristic: it is an **iff exact ordered-source key-existence proof** for this fully arbitrary 1,595-row page-private family, with no enumeration of the charts. A second mode skips *all original 86 repeated-neighbor second-rune sites* as wholly arbitrary special emissions; their printed cipher glyphs still select the next normal row.

[Exact source-copy locator and constructive inverse](../sims/lp2_prev_ciph_page_private_exact_source_locator_sft.cjs) scans **all 753,907** length-12,956 native English and GP-indexed Latin contiguous donor windows against the unchanged **12,901 within-page** original transitions. It uses a row-wise stamped sparse forward/inverse consistency table and stops a window as soon as one row becomes noninjective. The output reports the **first original global rune offset of contradiction** (zero-based). The four sources have:

| Native register | Exact source windows | Windows with a valid full 55-page secret-chart assignment | Latest first contradiction anywhere | Typical first contradiction (mean original offset) |
| --- | ---: | ---: | ---: | ---: |
| Gibran | 49,537 | **0** | **63** | 29.397 |
| Shakespeare | 204,151 | **0** | **62** | 29.383 |
| Emerson | 308,372 | **0** | **69** | 29.049 |
| Latin Vulgate | 191,847 | **0** | **66** | 26.985 |

The original first physical page continues to rune offset 228 and beyond, so **every one of these full-length donor passages is already impossible within the first 70 original runes**, before the first physical page ends. All of these original first-contradiction statistics are **unchanged** when the actual 86 observed repeat sites are exempt, because the source contradictions occur before any original repeat event. An exact fixed-passage reader keyed by previous printed C, even with an independent chart for every later page and independent free first rune, **cannot decrypt a verbatim copied passage from these four specific donor files**. This conclusion is about *exact source identity and original order*, not an ordinary-language frequency envelope; it does not exclude original prose in similar style, a noncontiguous hidden source, reordering of plaintext, extra evolving state, or 2+ phase charts within page.

**One genuine key-recovery and source-location control, not only encryption replay:** independently choose a GP Gibran window beginning at **source rune 18,000**, encrypt it as 12,956 original-sized runes with hidden independently shuffled 29-permutation rows per physical page and a rare-NG-implies-repeat output law, then hide both the source start and all row keys from the source locator. The full inverse scan of **all 49,537** candidate Gibran windows retains **exactly one source start, 18,000**, constructs mutually consistent forward/inverse partial row assignments for every observed transition, and recovers the **entire 12,956-rune correct native plaintext** at that unique start. The planted cipher has **100 adjacent identical rune pairs**; the same true start is uniquely retained if those 100 planted repeat sites are exempt. The source registry is original donor prose, but the cipher and its secret key are fresh independent positive data.

This makes the page-private necessary-capacity loophole executable as a real plaintext-source recovery algorithm: an authentic Cicada-authorized book or witness could be indexed and subjected to the same **complete exact row-chart reconstruction**, which immediately identifies its matching passage if the typed mechanism is correct. The important missing input is **source selection** and whether LP2 really retains raw native GP29 rune order. Random keyword or document scanning is not justified as evidence of a historical decoder merely because the forward algorithm can locate a planted source.

### Eliminating the cross-page source-alignment assumption at original p0

One possible objection to the full-book source-copy gate is that the intended manuscript **jumps to a fresh location in a source book at each physical page**, rather than retaining a single 12,956-rune donor passage. Such a page-address cipher would invalidate the global alignment; however, it still requires **its very first 262-rune page** to have a valid predecessor-C substitution key for some *local 262-rune passage* in the indicated source. The original p0 is entirely independent of any later page or source offset.

The exact same full-bijection source locator therefore enumerates **every 262-rune substring** in the *entire* four normalized donor files, including those near the corpus end that are too late to supply the longer full-book window. The total is **804,683** source p0 candidates, with no fitted positions, keywords or alphabet relabelings:

| Independent original p0 donor source | All possible 262-rune source starts | Has an exact invertible 29-row GP29 key for original p0? | Latest first contradiction (p0 local zero-based index) |
| --- | ---: | ---: | ---: |
| Gibran | **62,231** | **0** | **63** |
| Shakespeare | **216,845** | **0** | **62** |
| Emerson | **321,066** | **0** | **69** |
| Latin Vulgate | **204,541** | **0** | **66** |
| **Total** | **804,683** | **0** | By p0 rune 69 |

Allow all the actual within-page equal-rune event positions as arbitrary special emissions. Original p0's **first** such event is at local zero-based position **122**; every donor window's contradiction occurs before that event. Therefore all 804,683 p0 candidates still fail with the event exception policy. This is an **exact partial-row conflict**, not a quality score. It excludes direct source-copy **even if every later page uses an independently chosen source offset, another chart set, and an independent first rune**, as long as p0 itself follows this specifically typed q1 reversible previous-published-C lookup.

The planted source-control key instead turns original-length Gibran donor offset **18,000** into a fresh encrypted book whose first page has the exact **262-rune** original geometry, with a separate secret 29-row alphabet set. When the page-only source locator scans **all 62,231** Gibran starts, it recognizes **one and only one** valid inverse start, at **18,000**, and all 262 runes recover exactly; the full 12,956-rune source locator likewise recognizes a single match and reconstructs a consistent full key assignment. This positive is independent of any original-source decryption claim and confirms that the all-offset first-page rejection is not a failure to detect a true copied plaintext source under the specified mechanism.

## All-page independent source locator: 44,263,381 exact inverse tests

**Source-reuse challenge, with page-wise location and key resets.** Extend the preceding exact page-private row-permutation inverse to **every** original rune-bearing physical page, allowing that page an **arbitrary independent source-book offset, completely independent 29 secret substitution alphabets (selected by the preceding printed ciphertext rune), an arbitrary first rune, and arbitrary outputs at all original adjacent-repeat event sites**. There is no requirement for any two pages to correspond to adjacent source passages, or even the same donor. Each source-book passage is **exactly the original page's rune length**, preserving source rune order.

The [standalone all-page exact source locator](../sims/lp2_prev_ciph_perpage_anysource_locator_sft.cjs) evaluates **44,263,381** source-page candidate pairings over Gibran, Shakespeare, Emerson and the independently GP-indexed Latin Vulgate. It tests the **iff row-injective key-existence condition** at all within-page runes, rather than any simple frequency proxy.

| Original source pages | Entire reference search |
| --- | --- |
| **54 of 55 physical rune-bearing pages (lengths 76–277)** | **Zero** verbatim candidate passages under any independently secret 29-row page key |
| **p49, 66 runes** | **74** source excerpts satisfy necessary-and-sufficient page-key consistency |
| p49 by reference | Gibran **6** / Shakespeare **28** / Emerson **27** / Latin **13** |

For all 54 excluded pages, *every* potential donor placement contradicts a one-row forward/reverse partial permutation at or before the first **92** page-local runes, long before exhausting the original page. These are **exact, key-independent, source-window negatives**. The permitted 86 observed repeat-event output exemptions are already applied; a version without the exemptions cannot have more full source matches. This removes the full-book continuity assumption, while remaining strictly conditional on exact source-word order, the donor registry and the typed predecessor-C q1 cipher.

**Short-p49 chance control.** The only 74 page49 matches are not recognized plaintext. Page49 has only **66 GP runes, zero adjacent equalities**, and too few repeated predecessor states to constrain all 29 secret row alphabets. For a matched-shape control, do **20 deterministic seeded shuffles of the original p49 66-rune multiset**, rejecting shuffles that introduce any adjacent repeats, and run every control through the *same complete four-donor source locator*. Seed **0x49CA3301**. The resulting number of source-passage matches per shuffle is:

(889, 0, 1283, 14698, 1145, 75, 94, 75, 64, 1213, 66, 71, 71, 85, 6, 17714, 1145, 1156, 71, 71).

The conditional control median is **80**; **12/20** shuffles yield **at least 74** matches (plus-one upper tail **13/21 = 0.619**). The large range (0–17,714) reflects how unconstrained short-page row keys can be. This is a post-selected, small diagnostic rather than a manuscript-wide significance estimate; it gives no reason to prioritize p49's 74 candidates as source-authenticated text.

**Independent real inverse positive:** The program also generates **12,956** authentic GP-native plaintext runes from Gibran starting at offset **18,000**, encrypts through 55 entirely independent full GP29-permutation chart sets with a rare-NG self-repeat law, and checks each one of its 55 original-length page fragments against the true native source and genuine inverse. All **12,956/12,956** plaintext runes recover; the resulting cipher has exactly **100** repeated glyph neighbors. The companion source-locator reproducer uniquely identifies that planted source start among all **62,231** available 262-rune p0 donor placements and among all **49,537** full-book Gibran starts.

**Scientific decision:** These four reference texts cannot be the *verbatim* source of **any** LP2 physical page other than the too-short-to-be-discriminating p49 under a simple one-phase previous-printed-C secret permutation decoder, even when every page jumps independently in its source and all 86 genuine repeat events may be special. The test does **not** rule out altered or interleaved passages, a previously unknown author-supplied source, added hidden key state, two or more phases per page, or any original composition. No unknown original LP2 plaintext is recovered.

## Decision and missing authentic step

The original conditional row histograms are close to uniform and cannot supply sufficiently many outputs for the most frequent GP-native letters, even if a secret 29-permutation chart is selected by the previous ciphertext glyph at every step. **Retire full-book q≤12 previous-ciphertext-only row-alphabet brute-force searches** under either original physical-page or large-mark reset. A key search cannot repair this key-independent mathematical contradiction under the stated donor envelope.

A viable receiver would require source evidence for something *actually different*: at least thirteen phases to admit even some of these donor passages, additional evolving state beyond prior ciphertext, F clock holds/skips, hidden insertions/deletions, unknown-length encoding, chapter-private rows, or different non-native statistics. It is not licensed to add extra phases merely to make the native donor pass. A higher-state proposal must identify its operation and input from a first-party source and make an independently recognizable unseen-original-text prediction. **No unknown LP2 plaintext, authentic key or destination was recovered.**
