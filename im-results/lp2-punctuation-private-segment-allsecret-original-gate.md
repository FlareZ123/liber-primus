# Physical-punctuation private-alphabet gate: 172 punctuated segments and 182 fully marked scopes

**22–23 November 2026, Agents37/31. Classification: exact original-input necessary-condition exclusion for all independently secret scope-stationary GP29 rune alphabets, including intra-scope arbitrary transposition and word-space reflow; no recovered unknown plaintext, key, authored opcode or destination.**

## Human-visible candidate and independent source

A human could notice that Liber Primus prints 175 genuine punctuation marks in its 12,956-rune, 55-rune-bearing unsolved LP2 pages. The marks might denote independent ciphertext segments whose substitution keys refresh after every real period, comma or large chapter mark. The manuscript does not explicitly order such a refresh. To avoid testing arbitrary guessed keywords, grant the hypothesis its strongest reasonable secret: an independently arbitrary **29! permutation for each complete punctuation-bounded segment**.

The source is the exact physical-punctuation audit [`lp2-punctuation-identity.json`](../resources/liber-primus/lp2-punctuation-identity.json). Remove derivative event indices 57–60 (unprinted p15 numeric row terminators) and 125 (unprinted p37 mark). The **175 physical events occur at 172 different positions** in the original [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json) 12,956-rune sequence. Duplicate marks at the same position add no hidden rune-bearing segment. The final mark terminates the last segment. The resulting **172 consecutive segments cover every original rune exactly once** and retain original page-crossing words, text order and rune identities.

This hypothesis differs from the previous [punctuation-reset key-reuse report](punctuation-reset-key-reuse.md): that one grants a different secret alphabet for each *position after a reset* but requires an alphabet to be **reused at the same position across segments**. Here, each entire authentic punctuation segment has its own completely private alphabet, and no alphabet is shared with any other segment. **The later source-ink expansion below grants private alphabets even at quotation and apostrophe cuts, plus arbitrary lossless resegmentation and rune permutation inside each scope.**

## All-secret theorem

For physical segment `s`, count ciphertext rune `a` as `n[s,a]`, and sort these 29 occupancy counts `n[s,(1)] >= n[s,(2)] >= ...`. If the original direct cipher is `C[i] = sigma_s(P[i])` inside that segment, then each `sigma_s` is a permutation, with no restriction on its secret values. Its histogram cannot change, only the labels can be renamed.

For any fixed plaintext symbol, the exact maximum count supported by **all possible independent private alphabets** is

`U1 = sum_s n[s,(1)]`.

For any fixed pair of **distinct** plaintext symbols, the exact maximum is

`U2 = sum_s (n[s,(1)] + n[s,(2)])`.

The original source gives **U1 = 1,012** and **U2 = 1,874**. This is an exact finite-key upper bound over all `(29!)^172` independent secret choices. No search, English scoring, unknown key or assigned alphabet enters either computation. The symbols need not be E and O: the same ceilings hold for *every* fixed single symbol and every distinct pair.

## Stronger source-ink complete-scope and changing-word-boundary corollary (23 November 2026)

The canonical **physical** punctuation breaks above omit two additional source-visible classes of separators which a human 2014 solver could also use: the **seven physically quoted spans** (14 endpoints) and the **four raised, genuine internal apostrophes**. The quotes are preserved as derived source-span annotations in [`lp2-quote-punctuation-spans.json`](../resources/liber-primus/lp2-quote-punctuation-spans.json); all four apostrophe strokes have independently verified original JPEG geometry and a solved LP1 `DON'T` ink precedent. The quote endpoints' classification is still conditional on the derived inventory. Including their boundaries grants **more** secret freedom, making a necessary-condition rejection *conservative* even if some quotation metadata were later corrected.

Deduplicate every original physical period/comma/chapter mark position and additionally add all quoted start/end positions and apostrophe-before-rune offsets, with hard endpoints at 0 and12,956. Exactly **10 genuinely new internal cuts** remain beyond the existing 172 punctuation-defined scopes:

```text
1110, 1677, 5138, 5459, 8515, 9727, 9811, 10089, 10439, 12592
```

The complete 12,956 original runes are thereby partitioned into **182 nonempty consecutive scopes**. Grant **independently arbitrary 29! secret rune alphabets to every one of the 182 scopes**. Also grant the cipher **every permutation of rune order within each scope** and **every positive-length word-gap repositioning entirely within each scope**. The latter is a genuine *space-changing* family and can violate all previous intact-word and per-word affine invariants. Original physical punctuation, quoted boundaries and apostrophe positions stay anchored. It is unnecessary to guess a specific key or word permutation: every such transformation preserves the **29-bin symbol-count multiset inside each scope**, up to an unknown renaming.

For each scope `s`, sort original symbol counts `n[s,(1)] ≥ n[s,(2)]`. Regardless of the secret alphabet, rune reordering and word-gap movement, the maximum global occurrences of any fixed plaintext symbol or fixed pair are:

```text
U1 = sum over 182 scopes n[s,(1)]                  = 1029
U2 = sum over 182 scopes (n[s,(1)] + n[s,(2)])     = 1897
```

The original **172-scope** values were `U1=1012` and `U2=1874`. Giving the proposed decoder **10 extra wholly independent private 29! alphabets** raises these bounds by only **17 and23**. Both remain far below even the **minimum** observed E / E+O counts for every 12,956-rune window in the same three genuine GP-native literary registers: **E≥1397** and **E+O≥2430**. In particular no within-ink-scope columnar transposition, reversal, arbitrary full-page punctuation reflow, or scope-static substitution can recover that register, even with all cipher keys left unrestricted.

The [extended one-file CJS source test](../sims/lp2_punct_quote_apostrophe_allsecret_reseg_original_sft.cjs) asserts all physical cut points, 2,896 genuine printed whole words and both old and new exact capacities. It builds an **actual reversible space-changing native-positive plant**: swap adjacent printed-word gap lengths within each scope (changes 1,203 of the 2,718 source-internal gap positions, involutive), reverse native GP rune order within every scope and independently encrypt each scope using a randomly generated full GP29 substitution alphabet. The inverse restores **all 12,956 native runes exactly**, and a second gap reflow restores every original internal word boundary. Correct source-native E and E+O occupancies meet the expected inequalities. The actual original ciphertext fails the much more generous scope-invariant capacities. This program has been checked against exact original GitHub source data and the gap involution executed in a separate runtime; the Node22 file is committed but **not yet CI-dispatched**.

### Source-original page and line reset granularity: limits of a frequency-only gate

A fresh human-solvable alternative is to **reset on physical pages or on original printed lines**, which are independently visible in the manuscript regardless of ink punctuation. The canonical line-preserving `lp2-transcription.txt` records **594 slash-delimited source lines** over all 12,956 unknown runes, and **55 rune-bearing physical pages** (54 internal physical page seams). The original manuscript has variable printed line lengths, with source transcription used for the counted wrap positions; this is a physically motivated reset *hypothesis*, not a printed instruction to reset a cipher.

The same exact histogram theorem can be applied with successively finer anchored partitions, granting completely independent 29! private GP29 alphabets **at every scope** and arbitrary rune permutations and changing word spaces *inside* each scope.

| Source-visible allowed reset positions | Independent private key scopes | Original E capacity U1 | Original E+O capacity U2 | Against native donor minima |
| --- | ---: | ---: | ---: | :--- |
| Original physical punctuation | 172 | 1,012 | 1,874 | Impossible |
| Punctuation, quotes, apostrophes | 182 | 1,029 | 1,897 | Impossible |
| Those plus **all physical page seams** | **226** | **1,109** | **2,042** | Impossible |
| **Every original physical line** independently | **594** | **1,680** | **2,997** | Unigram ceiling permits; stronger existing equality gate excludes |
| All physical lines plus punctuation, quotes, apostrophes and page seams | **738** | **1,816** | **3,218** | Unigram ceiling permits; additional cuts need separate equality test |

The same unchanged original-content **native-language necessary-condition thresholds** are at least **E=1,397** and **E+O=2,430**, across every complete 12,956-rune window of the three independent GP29 literary controls. Thus per-page substitution or any more generous *source-ink* segmentation **cannot** produce ordinary native GP prose, even if every key is an arbitrary private 29! permutation and the local word break tape is changed. **The first simple source-visible reset granularity that escapes this particular frequency-capacity obstruction is individual printed lines.** The permissive line capacity is merely a *necessary* condition. Critically, the **earlier exact per-line all-secret collision theorem already excludes all 594 independently keyed physical-line substitutions even when arbitrary rune order changes within a line**. The unchanged original has only **4,358 equal-symbol pairs out of 136,831 same-line pair opportunities**, while fixed-original-line-shaped source-native English controls have minima **7,323 Shakespeare / 7,461 Gibran / 7,695 Emerson**. Every private 29! alphabet and internal transposition preserves each line's equality-pair count exactly. See [the preexisting line/word private-alphabet all-secret theorem](lp2-line-word-local-allsecret-bijection-gate.md). This stronger established test **closes the apparent 594-line survivor** independently of the present rank-only arithmetic. The 738-intersection refinement is a separate, more generous scope family and its line-pair collision invariant has not yet been evaluated.

To ensure that the linewise survivor is not an artifact of comparing only the two E/E+O bins, apply **all 29 prefix-rank ceilings** `U_k=Σ_lines(sum of k largest source GP29 counts in that line)`, independently of every private line alphabet. The exact upper-mass vector for ranks k=1…29 begins **[1680, 2997, 4181, 5274, 6235, 7033, 7711, 8318, 8904]** and ends at12,956. The source-exact SFT scans **every complete 12,956-rune contiguous native window** in each of the three pinned references, requiring *every* plaintext rank prefix to stay under the corresponding source ceiling:

| Native reference | Complete 12,956-rune windows | Windows violating at least one of all 29 line-level ceilings |
| --- | ---: | ---: |
| Gibran | 50,159 | **0** |
| Emerson | 311,675 | **5,649** |
| Shakespeare | 205,845 | **0** |

Thus 594 independently keyed physical lines **survive this full-rank histogram-aggregate necessary condition on every Gibran and Shakespeare window, and on 98.19% of Emerson windows**, but **fail the already established exact per-line matching-pair theorem** described above. Aggregate rank capacities are far weaker than the preserved equality pattern within each individual source line. The operative distinction is that **page/ink scope models are excluded even by global letter mass, and the finer line-local model is excluded by a stronger preexisting within-line equality invariant**. A compact evolving-state, cross-line transposition or value-changing mechanism is still needed.

Line breaks additionally offer an independent anti-repeat transition test. Just **4 of the 593 original internal physical line crossings** have identical GP29 runes on both sides (global offsets **8,196, 8,309, 10,508, 11,344**). A source-line-local reset that independently uniformly cyclically re-labels the GP29 alphabet at each line preserves every observed intra-line equal-neighbor event but predicts `Binomial(593,1/29)` crossing matches, expectation **20.4483**; its exact `P(X≤4)=9.28643×10⁻⁶`. The **54 page seams plus all ink cuts** give **225** unique internal cuts with only one crossing doublet and `P(X≤1)=0.00336488` under the same independently random reset null. These are specific conditional reset-model diagnostics, not universal impossibility theorems for deterministic or state-conditioned line keys. **The crucial competing null is entirely different:** freeze the actual **86** same-rune events over **12,901 within-page adjacency opportunities**, separately preserving each original page's exact number of events. Uniformly redistribute these events within their own page without moving any original line break. The 55 independent pagewise hypergeometrics convolve to an exact expected **3.57937** events over the **539 within-page line-wrap positions**; the actual **4** is ordinary (**lower tail 0.71246, upper tail 0.48344**). This competing null explicitly preserves the book-wide extremely low doublet rate and predicts its survival across printed line boundaries. It is observationally consistent with the source.

Therefore the `P=9.28643×10⁻⁶` **must not be sold as a cipher detection p-value**: it specifically refutes a simple source-line *independently random re-labeling reset*; the page-conditioned continuous-antirepeat null fits. This separation of conditional models is a stronger cipher-design constraint than a naked line-break significance claim. All actual original edge locations and the exact hypergeometric convolution are asserted in the same SFT.

**Architectural fork:** line-level independently *secret* alphabets can match the native top-letter **counts** but fail the stronger exact within-line equal-pair invariant under already published original/native controls. Independently randomized shifts at physical line breaks additionally fail the source anti-repeat edge count. An evolving-state mechanism that carries anti-repeat memory across printed lines and physical punctuation is therefore an important distinct explanation. Any concrete cipher proposal still requires a source-authenticated value-changing operation and a long held-out original plaintext result. The same [source-exact SFT](../sims/lp2_punct_quote_apostrophe_allsecret_reseg_original_sft.cjs) asserts every source cut, both capacity directions and the exact line/page echo nulls.

### A separate scope-reset diagnostic: only one doublet crosses 181 original ink cuts

The same **181 distinct internal source-ink boundaries** (punctuation, quotation and apostrophe) provide a boundary-state check independent of word segmentation. Exactly **one** original adjacent same-rune pair straddles an ink cut, at global rune offset **8,385**; the other **85** adjacent repeats are inside scopes. Under a deliberately simple reset null, independently choose one uniform GP29 cyclic shift for every one of 182 entire scope strings. This leaves **every within-scope original adjacent-equality event unchanged**, while each between-scope pair becomes equal with probability `1/29`; the 181 crossing-pair equality indicators are independent under the randomized shifts. Thus its exact crossing count is `Binomial(181,1/29)`, with expectation **6.2414** and one-sided `P(X≤1)=0.0130183`. The observed one crossing matches a *continuous* low-repeat process better than this particular independently refreshed-alphabet null (the full original ratio `86/12,955` predicts about **1.20** crossings over 181 slots).

This observation **does not exclude every resetting cipher or establish continuous state**. The random independently chosen cyclic alphabet is a particular, historically unselected reset model; deterministic keyed resets or mechanisms conditioning first symbols on the previous scope can reproduce one crossing. The calculation is reported as a source-constrained architecture diagnostic, not a new cipher/key selector or independent LP2 plaintext. Its exact null arithmetic and the sole crossing location are asserted in the same [extended SFT](../sims/lp2_punct_quote_apostrophe_allsecret_reseg_original_sft.cjs).

**Formal scope:** The gate assumes each original physical punctuation/quote/apostrophe scope retains its own rune multiset and the plaintext is ordinary native GP29 as in the pinned solved/source donor controls. Any evolving state that changes rune identities within a scope, transposition that carries runes **across** source ink scopes, a varying-length rune code or another plaintext language escapes. The 2016 signed puzzle does not prescribe either scope-static alphabets or free space reflow; the theorem excludes this broad potential route *without requiring* those operations to be first-party authenticated.

## Native plaintext comparison and power

The [CommonJS source SFT](../sims/lp2_punctuation_private_segment_allsecret_original_sft.cjs) uses the project's already pinned historical Gematria transliteration and scans **every** contiguous 12,956-rune window in each of the established genuine-English reference registers. E and O are selected in advance from the already documented predominant GP-native reference symbols; they are not selected because of the unknown ciphertext.

| Independent pinned native reference | Minimum plaintext E in any original-length window | Minimum plaintext E+O in any such window |
| --- | ---: | ---: |
| Gibran, *The Prophet* | 1,407 | 2,556 |
| Emerson, essays | 1,482 | 2,455 |
| Shakespeare, existing excerpt | 1,397 | 2,430 |
| **Original exact 172-scope ceiling** | **1,012** | **1,874** |
| **Original expanded 182-scope ceiling, including arbitrary internal rune permutation and spaces** | **1,029** | **1,897** |

Every original-length control exceeds both exact original ceilings. The one-letter contradiction alone excludes the entire tested class as a direct converter of the original ciphertext into any of those native GP-English windows.

As a positive experiment, the reproducer chooses a genuine 12,956-rune contiguous Gibran passage, encrypts each original punctuation-bounded segment under its own pseudorandom 29-rune bijection, then recovers **all 12,956 original plaintext runes** under the exact inverse. Its recomputed all-secret capacities meet the source-native E/E+O counts. This demonstrates that the theorem permits a real instance of the tested cipher and that its exclusion of the unknown manuscript is not forced by the artificial segmentation itself.

## Cryptanalytic decision

**Retire every GP29 direct decoder that preserves rune multisets inside original punctuation, quotation, apostrophe and physical-page scopes, even with completely unrelated secret 29! alphabet in each of 226 source scopes and unlimited rune/gap permutations within them.** Static keywords, private page/paragraph/quote alphabets, word-space changes, and any secret within-scope columnar/permutation readouts cannot overcome these source-histogram ceilings. Per-line private alphabets escape this **single necessary-condition test**, but their independently refreshed cyclic-shift version conflicts with the four source-doublet crossings across593 physical lines. A changing-state value update within scope, or actual rune movement across those scope anchors, is indispensable to this route.

The theorem does **not** exclude an evolving rune-value substitution **inside** a segment, a differently encoded plaintext register, lossless word/value transductions, transposition **across** punctuation/quote/apostrophe boundaries, newly revealed side-channel key material, or hidden message content in the images. The punctuation placement itself is preserved as source evidence. This gate alone does not select a positive solution or tell the Director which untested evolving-state mechanism to choose; such a choice still requires an independent creator-visible operation or key.

**Executable:** `node sims/lp2_punctuation_private_segment_allsecret_original_sft.cjs` (Node22 CommonJS, read-only). Input and exact counts are asserted from the original repository corpus and corrected physical-punctuation inventory; the native-control minima and synthetic positive recovery are asserted by the same script. [Manual Windows runner](https://github.com/FlareZ123/liber-primus/actions/runs/45082912376) **completed successfully** on 22 November 2026 under Windows Node.js 22, verifying all original-source assertions and the 12,956/12,956 native positive plant.
