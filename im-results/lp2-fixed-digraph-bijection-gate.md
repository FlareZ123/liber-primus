# Fixed GP29 two-rune block-bijection gate

**Decision:** the original LP2 stream is incompatible with a fixed, bijective two-rune substitution under the tested global, page, line and word block clocks, assuming an English-like GP29 plaintext. This includes every invertible 2×2 Hill matrix and every other fixed bijection on the 841 possible GP29 digraphs. No unknown plaintext, authentic key or intended operation was recovered.

## Why this is a key-independent test

A fixed bijection F on GP29² permutes the 841 possible ordered rune pairs. If plaintext blocks are mapped independently by the same F, then for every plaintext pair x:

- the ciphertext count of F(x) equals the plaintext count of x;
- therefore the complete multiset of 841 pair frequencies is unchanged;
- in particular, the number of distinct pairs and the maximum pair frequency are invariant.

An invertible Hill transform P ↦ AP+b over GF(29) is one such bijection. No key enumeration is necessary. The invariant also applies to arbitrary fixed 841-entry digraph substitution tables, not only linear maps.

## Original input and tested clocks

Input is the canonical LP2 transcription and GP29 alphabet in `resources/liber-primus/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`: 12,956 runes, 2,896 words, 55 rune-bearing pages and 594 printed lines. Physical page 50 is the separate numeric table and contributes no runic symbols.

For each segmentation, both block phases (0 and 1) were tested. Pair blocks restart at the beginning of each segment for page-, line- and word-reset variants. The word parser preserves the established continuous word contract, including words carried across printed page turns. The control tokenizer is the existing GP29 orthography: longest-match digraphs, with the same QU→CW, V→U, K/Q→C and Z→S normalization used in prior native-GP studies.

## Original pair-frequency results

| Alignment | Phase | Pairs | Distinct of 841 | Maximum count |
|---|---:|---:|---:|---:|
| Continuous stream | 0 | 6,478 | 832 | 19 |
| Continuous stream | 1 | 6,477 | 838 | 17 |
| Page reset | 0 | 6,462 | 831 | 18 |
| Page reset | 1 | 6,439 | 832 | 18 |
| Printed-line reset | 0 | 6,333 | 833 | 20 |
| Printed-line reset | 1 | 6,029 | 831 | 18 |
| Word reset | 0 | 5,753 | 828 | 17 |
| Word reset | 1 | 4,307 | 834 | 13 |

Across all eight cases, the ciphertext uses 828–838 of the 841 possible pairs and no pair occurs more than 20 times. Its pair spectrum is close to the occupancy profile expected from a near-uniform stream.

### Original 256-table interpretation: stricter state-free capacity obstruction (Agent12, 23 November)

The original p49–51 32×8 table supplies **256 cells**, inviting a fixed one-byte-to-two-rune codebook as an independent interpretation of the pair channel. Even without any plaintext-language assumption, a direct stationary 256-entry byte-to-digraph lookup has at most **256 distinct ordered GP29 outputs**. The unchanged original stream contains **832 / 838** unique pairs in the two global phases above, so a book-global codebook is impossible. Granting a fresh unknown **fixed codebook per authentic visual chapter** does not save its first eight chapters:

| Physical chapter | Original runes | Unique pairs (chapter-local phase 0 / 1) |
|---|---:|---:|
| p0–2 | 729 | 303 / 303 |
| p3–7 | 1,145 | 414 / 403 |
| p8–14 | 1,729 | 532 / 537 |
| p15–22 | 1,903 | 573 / 556 |
| p23–26 | 1,021 | 373 / 387 |
| p27–32 | 1,433 | 482 / 495 |
| p33–39 | 1,680 | 518 / 530 |
| p40–53 | 3,008 | 700 / 688 |
| p54–55 | 308 | 138 / 140 |

The terminal p54–55 chapter alone is below capacity; neither page-private codebooks nor stateful or variable-length encodings are excluded. Independently, the printed byte multiset has **161 distinct values**, so it is **not** a direct bijective 256-byte permutation, an obstruction already documented in [the consolidated historical S-box study](lp2-p50-source-consumer-and-sbox-gate.md). The existing book-global digraph values are reused above rather than presented as novel discoveries. This narrow 256-codeword consequence and chapter-local tests are reproducible in [the original-input Windows Node22 SFT](../sims/lp2_grid256_digraph_codebook_capacity_sft.cjs) ([PASS 45274984753](https://github.com/FlareZ123/liber-primus/actions/runs/45274984753)). It does not decode a rune or select any author-authenticated byte operation.



## Standard Playfair: exact source-only equal-pair exclusion, including all four-transparent-rune keys

Classical Playfair encryption on a keyed 5×5 or 7×7 square maps every **distinct plaintext digraph** to a digraph of **distinct ciphertext symbols**. Standard plaintext filler preprocessing guarantees distinct input partners. Every keyed square obeys the same necessary condition: a complete Playfair output digraph **cannot contain two identical ciphertext symbols**. This is an original-source theorem that requires no source-language premise or enumeration of square permutations.

The original 12,956 unknown LP2 runes give **86 same-page adjacent identical-rune pairs**. The earlier fixed 29-symbol analysis found 37 offending globally even-phase pairs and 49 in the opposite phase, 35/51 under page-local resets, and **14 physical pages each having both pair phases**, so independent page phases still incur at least 17 forbidden pairs. Word-reset two-phase equalities split 27/36 among its 63 intra-word identical adjacencies. These are the preexisting original-source results.

### Original printed-line phase witness (Agent14, 15 November 2026)

The earlier page-phase contradiction already rules out a 29-rune/no-bypass standard Playfair clock at the book or page scale. A stronger **source-only**, independent observation rejects even a separately restarted Playfair pair phase on **every physical printed line**. Of the original 86 adjacent-equal runic events, 82 are fully within one originally printed line; they occupy 79 lines. Exactly one line has two equal-rune events at **opposite line-relative destination-column parities**. This single original line defeats either possible Playfair phase without a guessed table or language model:

- **Original LP2 physical p24**, archive `41.jpg`, third printed line (zero-based line2): `ᛡ-ᛈᚣᚢ-ᛉᚷᚷ-ᚹᛞᛁᛋ-ᚦᛡᛡᛈᚳᚪᚩ-ᚢᛗᚢ/`.
- The equal black-glyph pairs `ᚷᚷ` and `ᛡᛡ` have their second runes at **zero-based printed columns6 and13**, respectively; their first-rune offsets on p24 are51 and58 (second-rune offsets52 and59). Both are inside otherwise ordinary original printed words.
- Any fixed pairing of the entire line puts exactly one of these source pairs inside a complete ciphertext digraph, violating the standard Playfair invariant `ciphertextPair[0] != ciphertextPair[1]`. Original-JPEG registrations report each of these two same-form pairs with black/black ink and same-class Jaccard about0.940.

The [source-exact line-phase SFT](../sims/lp2_playfair_digraph_parity_original_sft.cjs) asserts all 86 original site indices, the 82 same-line pairs/79 lines, the unique original p24 two-parity witness and literal Unicode transcription. It also **actually encrypts and decrypts** a padded 96-cell GP29 sequence derived from 95 authentic solved p57 runes under a positive 5×6 Playfair board, proving the basic pair exclusion is checked against a valid cipher. [Original-source Node22 run43680523362](https://github.com/FlareZ123/liber-primus/actions/runs/43680523362) passed all tests. This source-only extension does **not** include the separately examined four-transparent-symbol 5×5 model below; a changing escape clock inside that same p24 line or a newly authored intra-line reset instruction remains outside the fixed-pair test.



### All possible four-symbol transparent exceptions on the 2014 5×5 route

The original 2014 Cicada magic-square material contains a **5×5** square, which can motivate a human to consider a keyed Playfair square. GP29 has **29** runes, so using a 25-cell square requires an independently specified rule for the remaining four. No first-party source selects Playfair or identifies the four exceptions. The strengthened test therefore gives this hypothesis **every one of C(29,4) = 23,751 possible transparent four-rune sets**, treating those glyphs as unchanged ciphertext symbols that do **not advance the core digraph pairing**.

For each bypass set, remove all its occurrences from each source segment, then pair the remaining 25-symbol core stream. A complete pair of identical ciphertext symbols violates standard Playfair under **every 25! keyed square**. Grant an arbitrary unpaired trailing core symbol at each segment end without counting it as a violation. Test four independently printed reset scopes: whole book, the nine source-visible chapters, each physical rune-bearing page and each complete printed word. Original page-carrying words are preserved.

| Pairing reset | Four-bypass sets passing | Fewest forbidden identical pairs | Best-case bypass GP indices | Minimum complete core pairs |
| --- | ---: | ---: | --- | ---: |
| Whole book | **0 / 23,751** | **42** | 6,16,21,25 | 5,520 |
| Nine visual chapters | **0 / 23,751** | **42** | 0,2,6,10 | 5,519 |
| Each physical rune page | **0 / 23,751** | **39** | 6,14,15,25 | 5,510 |
| Each printed word | **0 / 23,751** | **25** | 7,9,10,25 | 4,773 |

### Allowing independent four-bypass keys in each visual chapter

A still more generous variant chooses **a different, arbitrary four-rune transparent set independently for each of the nine visible chapters**. It may use the core 5×5 square with any secret alphabet in each chapter; again each complete output pair must have distinct runes. The original source has no chapter-specific four-exception instruction, but this experiment closes the easy conjecture that the fixed-four restriction created the exclusion. Exhaust all 23,751 four-subsets separately on each chapter; retain the exact original 729/1145/1729/1903/1021/1433/1680/3008/308 rune boundaries. Grant unpaired tails at each chapter boundary. As a further concession, test a separate clock that also **resets core pairing at every printed word**, splitting the few printed words that cross chapter boundaries.

| Visual chapter (0-based) | Original runes | Minimum equal pairs, chapter-continuous | Bypass sets achieving zero | Minimum equal pairs, word reset | Bypass sets achieving zero |
| --- | ---: | ---: | ---: | ---: | ---: |
| 0 | 729 | 0 | 663 | 0 | 5,977 |
| 1 | 1,145 | 0 | 66 | 0 | 227 |
| 2 | 1,729 | 0 | 4 | 0 | 201 |
| **3** | **1,903** | **1** | **0** | **1** | **0** |
| 4 | 1,021 | 0 | 1 | 0 | 6 |
| **5** | **1,433** | 0 | 1 | **1** | **0** |
| **6** | **1,680** | **1** | **0** | **1** | **0** |
| **7** | **3,008** | **4** | **0** | **3** | **0** |
| 8 | 308 | 0 | 2,200 | 0 | 13,806 |

Therefore even independently rekeying all four bypass identities **once per chapter** leaves at least **six** forbidden pairs under chapter-continuous pairing, or at least **six** under word-reset pairing. No globally valid nine-chapter collection of four-bypass keys exists under either clock. This conclusion holds independently of the keyed 25! alphabet permutations and any target plaintext. It deliberately does **not** cover a new four-symbol exception set at every *physical page* or every word, individually adjusted pairing phase per fragment, or arbitrary editing/escape rules. An independent per-physical-page exhaustive diagnostic found at least one four-bypass set with zero equal core pairs on **each of all 55 rune-bearing pages** under page-continuous pairing, so a page-local variant survives this specific obstruction. Those pagewise sets were selected retrospectively and supply no cipher instruction or plaintext.

The best-case bypass subsets vary by reset and are retrospective minimizers. All four scopes fail without needing a language model, a guessed key square, a phase change, or a candidate plaintext. This explicitly strengthens the earlier no-bypass pair-phase gate and is independent of the Bifid25 all-key test, which uses a different digraph mapping. The original separate verified 2014 5×5 number square is **not** itself a 25-distinct-rune alphabet permutation.

**Limits:** The exclusion requires standard filler-preprocessed Playfair, a fixed transparent 4-rune set, unedited source ciphertext and one of the four reset policies. Other 29-rune adaptations, dynamic bypass choices, arbitrary inserted/deleted symbols, per-word arbitrary phase changes, variable-length escape channels and other polygraphic ciphers are outside this result. A 5×5 square clue by itself does not establish any decipherment.

The existing [source-exact Windows/Node 22 SFT](../sims/lp2_playfair_noidentical_pair_sft.cjs) now additionally exhausts **all 23,751 transparent sets × four source reset policies** and asserts the exact minimum violation counts. Its original 5×5 and 7×7 Playfair pair-map positive checks are retained, with **no plaintext or key recovered**.

## Public alternating historical 14/7 row re-alignment (#3301, Agent10, 28 November)

**Decision:** changing the alignment by the following one public, length-preserving historical-order composition does not rescue an arbitrary stationary pair bijection on the pinned native register. No source-selected alternating rule or unknown plaintext has been established.

The two reconstructed 2014 row decoders exactly reproduce their 70- and 56-character known outputs: `[2,8,9,1,12,13,11,4,5,7,3,0,6,10]` and `[0,6,2,5,1,4,3]`. Their historical stage order is 14 then 7; using that order cyclically is an exploratory assumption, **not a signed instruction** (#2007). Fixed direct transfers to p33 and p54–55 were already negative (#2153, #339, #485); #719 establishes that page carries cannot be deleted to repair a row remainder. #2478 tested CBC-CS1, a distinct stateful mechanism, and #3201 bounds fixed alignment. Here the only new variable is the publicly changing pair-position alignment.

Freeze the decoder positional map T: alternate complete rows of 14 and 7 from the physical chapter start, using the exact historical row decoder of that width. Reject an interval needing a partial row; retain every original rune and all page seams without a restart. Full p33–39 (1,680=80×21) and held p54–55 (308=14×21+14) need no tail convention. Pair the resulting sequence continuously from logical offset zero, including the seams of odd rows. Hypothesized sender is C=T⁻¹(B(P)), where B is one fixed arbitrary bijection on GP29² applied to nonoverlapping pairs of ordinary contiguous plaintext P. Thus the multiset of 841 pair counts must be invariant under B after applying T. The bound includes all Hill, affine and arbitrary stationary digraph maps **in this composition**, not a bank of changing maps.

| Original chapter | Runes | Original distinct / maximum pair frequency | Pinned native windows distinct / maximum range | Contiguous native windows | Exact frequency-profile matches |
|---|---:|---:|---:|---:|---:|
| p33–39 | 1680 | 528 / 5 | 211–300 / 12–45 | 603,388 | 0 |
| p54–55 | 308 | 137 / 3 | 68–126 / 3–21 | 608,876 | 0 |

Both original tapes round-trip through T exactly. The p54→55 seam occurs at chapter offset232 (cycle offset1); p33–39's six page seams have cycle offsets 4,13,11,18,15,12. The inverse therefore crosses real page turns without deleting or rephasing genuine runes. The smallest histogram L1 discrepancy over all terminal native windows is 36; for p33–39 it is 570 (histogram counts are numbers of pair types, including zero bins). Distinct pair count alone excludes every tested window on both spans. All contiguous rune windows of the four pinned tokenized corpora (LP1 reference, Gibran, Shakespeare, Emerson) were evaluated at both start parities with a rolling exact frequency-of-frequencies histogram. Eight seeded plants using arbitrary random 841-way bijections and the same alternating transport recovered their full plaintext with the oracle inverse. Each had at least one spectrum match and exactly one aligned bijection-consistent donor window; several had multiple spectrum-only matches, so the test does not confuse equality of spectra with key identification.

**Scope and next decision:** the result is conditional on ordinary contiguous native GP text in the four finite corpora, one stationary nonoverlapping pair map, the fixed 14→7 row order and chapter clock. It does not exclude a different independently specified positional map, a changing pair map, F holds, alternative register or reordered plaintext. The lack of an authentic alternating instruction independently argues against expanding this family. No compact-key fit or CI was needed because the full arbitrary-map necessary condition failed. No established manuscript-wide conclusion changes.

Reproduce with [the CommonJS SFT](../sims/lp2_alternating_14_7_pair_alignment_sft.cjs) and [complete raw output including logical tapes and input blob pins](lp2-alternating-14-7-pair-alignment-output.json). V8 core actually executed; the checked-in Node filesystem wrapper has not been independently run. Script blob `cfdf26e124a263484de44be2a8fd1cd4c2dc9ab1`; output blob `f308419f4e9aaf581ccdf12367ae26add67bda40`.

## Native-English controls

Three independent source corpora were converted using the established GP29 tokenizer: Shakespeare (300,000-character excerpt), Gibran's *The Prophet*, and Emerson's *Essays, First Series*. Contiguous control windows were sampled at fixed 120-rune steps for global/page/line clocks; word-reset controls used consecutive source-word windows, sampled every ten words and truncated only at the final pair to match the original pair count.

| Alignment | Phase | Control windows | Distinct-pair range | Maximum-count range | Minimum sorted-profile TV |
|---|---:|---:|---:|---:|---:|
| Continuous stream | 0 | 4,732 | 397–469 | 93–226 | 0.4827 |
| Continuous stream | 1 | 4,732 | 411–470 | 97–221 | 0.4890 |
| Page reset | 0 | 4,732 | 393–477 | 91–244 | 0.4862 |
| Page reset | 1 | 4,732 | 396–474 | 93–250 | 0.4859 |
| Printed-line reset | 0 | 4,732 | 392–474 | 87–234 | 0.4824 |
| Printed-line reset | 1 | 4,732 | 393–469 | 86–226 | 0.4808 |
| Word reset | 0 | 14,048 | 264–341 | 136–367 | 0.5833 |
| Word reset | 1 | 14,036 | 243–325 | 128–434 | 0.5960 |

The sorted-profile total-variation (TV) distance is a descriptive distance between normalized, descending 841-bin frequency vectors. It is not a p-value. The stronger simple observation is that every sampled native-English control has substantially fewer distinct digraphs and a much higher maximum frequency than the original, for every tested alignment.

## Collision-graph state and switch budgets (#3201, Agent24, 27 November)

**Decision:** no compact shared stationary nonoverlapping pair permutation is viable on the stated native-GP register: the existing arbitrary-bijection gate already dominates every compact keyed subfamily. Do not repeat a Hill, Feistel, digraph S-box or local-swap sweep. The useful new result is how far a *changing* pair map must depart from stationarity, not another stationary search.

### Exact constraints

Let each complete consuming pair be a vertex in GP29². The ordered edge between consecutive pair vertices is the cross-block seam (an edge type is an ordered pair of pair types, not an adjacent-rune equality event). Let (A_k), (B_k) be prefix sums of descending positive frequency bins of two equal-length tapes, padded by zeros after support. Define (D_q(A,B)=\max_k\{0,A_k-B_{qk},B_k-A_{qk}\}).

If a sender has q arbitrary bijective pair maps, each source vertex can reach at most q destination types, and conversely. Therefore **vertex (D_q=0)** is necessary. Consecutive vertices can use two independently selected maps, hence **edge (D_{q^2}=0)**. These inequalities need neither aligned plaintext positions nor knowledge of the map sequence. If s seams change the active map index, the remaining seams use one of q induced edge permutations; at most s events can violate the same-map capacity, so **(s\ge D_q\)** on edge profiles. These are necessary bounds, not claims that all passing histograms admit a map bank. Internal equality selects exactly 29 pair vertices (the diagonal); seam equality selects edges whose preceding second coordinate equals the following first coordinate. A stationary pair bijection can change both literal equality counts, so the observed 86 adjacent equalities cannot simply be equated to a pair-frequency invariant. In fact, any pair bijection preserving the seam-equality predicate for *all* pairs must be a common monoalphabetic map on both coordinates: comparing all pairs ending/starting at a fixed symbol forces their output second/first labels to coincide; distinct input symbols must have distinct output labels. Thus `F(a,b)=(sigma(a),sigma(b))`. Such a map also preserves internal equality. An arbitrary mixed pair map has no such universal guarantee. The previous sorted-profile contradiction implies an empty jointly attainable internal/seam equality set for any of the excluded matched native tapes, regardless of the key parameterization.

For a dominant stationary map plus e exceptions, relaxing chronological alignment gives an exact histogram transportation lower bound (e\ge D_1\) on vertices: under the best independent relabeling, (D_1) is the unmatched mass (integer TV). Each exceptional pair changes at most two adjacent pair-edge observations; hence also (e\ge\lceil D_1(\mathrm{edges})/2\rceil). The edge relabeling is relaxed independently of the vertex map; no claim of joint attainability is made for these lower bounds.

**Exact aligned minimum switches:** for a particular aligned candidate plaintext/ciphertext tape, a contiguous stationary run is feasible iff the observed correspondences form a partial bijection (both forward and reverse consistency). Such a map always extends to a full 841-way permutation. Feasibility is hereditary under taking subintervals. Greedily take the longest feasible prefix, then repeat: truncating any competing optimal partition at the end of that prefix leaves no more than its original number of suffix runs minus one, proving optimality by induction. The resulting number of cuts is the exact minimum switch count even with independent arbitrary private maps per run, and is a lower bound for any shared compact map bank. It is conditional on the specified aligned candidate and continuous framing, not a lower bound over all possible natural-language text.

### Executed original experiment

Pinned canonical transcription (12,956 unknown runes; terminal p54–55 308 runes), ordinary consuming nonoverlapping phases 0/1. Independent disjoint windows of each exact length were taken from the existing Gibran, Shakespeare and Emerson text files with the established longest-match GP normalization. Full-book windows: 4/16/25 = 45 per phase. Terminal: 204/710/1053 = 1,967 per phase. Full rows and extrema, exact input blob IDs, and native calibration are in the [machine-readable output](lp2-pair-state-graph-budget-output.json). The original pair graph has 832/838 vertex types and 6,449/6,445 ordered seam edge types at phases 0/1; maximum edge multiplicity 2/3. Actual internal/seam adjacent rune repeats are 37/49 and 49/37.

| Scope | Phase | Complete pairs | Necessary q floor, range over controls | Minimum dominant-map exceptions, range | Exact minimum aligned switches, range |
|---|---:|---:|---:|---:|---:|
| Full p0–55 | 0 | 6478 | 7–13 | 3127–3522 | 412–471 |
| Full p0–55 | 1 | 6477 | 7–14 | 3172–3539 | 398–487 |
| Terminal p54–55 | 0 | 154 | 2–5 | 16–57 | 5–17 |
| Terminal p54–55 | 1 | 153 | 2–9 | 17–61 | 5–18 |

Thus no q≤6 map bank survives these 90 full-book phase/window comparisons, and every dominant-map interpretation needs >48% exceptional blocks even allowing arbitrary pair relabeling and transport. At q=8, only 10/45 phase0 and 6/45 phase1 windows pass the histogram capacity relaxation; the graph-only minimum switch floors among these are 40 and 55 respectively (not sufficient for a true map bank). More strongly, the aligned test requires at least 398 switches over every full-book match even without a shared bank. Continuous pair framing with switches only at the 55 rune-bearing page seams (at most 54) or nine chapter seams (at most 8) is therefore excluded for these alignments. The terminal chapter alone needs at least five switches on every aligned donor match. This does not reject independent re-framing/reordering, F bypass, alternative donor registers or genuine symbol/block-state feedback.

**Controls and limitations:** 12 planted LP1 reference controls with 1/2/4/8/13/29 concealed permutations and either pseudorandom or 37-block run clocks pass every bound and oracle inverse (1,780/1,780 blocks each); greedy exactly recovers the 48-switch minimum on all five nonconstant run37 controls. Greedy matches exact quadratic DP on 1,000 deterministic small random instances. These establish implementation and the exact relaxed segmentation result, not blind key recovery. No surviving stationary family warrants an original key fit. A full standalone Node/CI run was not performed; the identical computation was executed in the connected V8 runtime. The literary files are finite normalized donors, not independently authenticated unknown plaintext. No new plaintext or key is recovered.

Reproduce: `node sims/lp2_pair_state_graph_budget_sft.cjs`. Do not widen this fixed-pair branch or optimize its synthetic fits. A successor should supply an independently selected genuinely changing state/clock or distinct representation; use these capacity bounds before investing in a key search.

## Decision and scope

Retire a **single fixed bijective two-rune block map** on the tested GP29 clocks, including all invertible 2×2 Hill keys. The result is family-wide: it is not a rejection of only the previously tested p32 M7 matrix.

This does not reject:
- a sufficiently fast-changing pair-map bank; the #3201 extension above excludes q≤6 and page/chapter-only switching for the sampled continuous aligned donor windows, not all changing maps or independently reframed blocks;
- a stateful stream cipher or any transformation mixing symbols across block boundaries;
- a non-GP29 intermediate alphabet or a different plaintext language;
- a non-bijective map with an independently transmitted/recoverable restoration channel.

The result should prevent further unconstrained searches over fixed 2×2 Hill matrices or fixed digraph S-boxes. A successor needs an independently sourced changing-state rule or another reversible operation that can produce an original-cipher prediction.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_fixed_digraph_bijection_gate.cjs
```

The script asserts the canonical source counts and emits all original histograms, sampled control summaries and sorted-profile distances. It uses only Node built-ins and repository source/control files.
