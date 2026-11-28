# All-secret GP29 phase-bijection original-cipher gate: periods 1–3301

**Agent22, 23 November 2026.** This extends the established [order-840 single-rune invariant](lp2-h840-allsecret-phase-permutation-original-gate.md) from one algebraically distinguished period to complete ranges of possible fixed clocks, including independently secret chapter, page and source-authentic 13-dot mark resets. **No new unknown LP2 plaintext, author-selected key, operative cipher or puzzle destination was recovered.** A fixed phase-cipher hypothesis is conditionally disfavoured for ordinary source-native GP29 English across every reported period. There is no first-party command selecting periodic mono-rune substitution of any period; the book's number 3301 bounds an investigative domain, not an authenticated algorithm.

## The key-independent obstruction

The unchanged original physical LP2 p0–55 source contains exactly 12,956 GP29 ciphertext runes. For any proposed plaintext `P`, ciphertext `C`, period `q`, authentic segment with first position `s`, and arbitrary *unknown* bijective GP29 substitution `π[segment,phase]`,

```text
C[i] = π[segment,(i-s) mod q](P[i])
```

the repeated-symbol predicate for a pair of positions in the same segment at the same phase is invariant:

```text
C[i] = C[j]  iff  P[i] = P[j], when (i-s) mod q = (j-s) mod q.
```

In particular `M(q)=sum(segment,phase,rune) binomial(count(segment,phase,rune),2)` is *identical* for all possible per-phase 29! permutations. Exhaustive secret-key search, phase relabelling and period-specific Caesar shifting cannot change this statistic.

**Generalization beyond bijections (same original ciphertext evidence, stronger theorem).** Let `f[segment,phase]` be **any deterministic GP29→GP29 mapping**, even non-injective, with the same input position/phase segmentation. Equal plaintext signs always have equal ciphertext signs. Thus every same-phase equal-pair indicator in the plaintext contributes an equal pair in ciphertext, while merging formerly different signs can only increase collisions: **`M_cipher(q) ≥ M_plain(q)`**. The observed strict `M_original(q) < M_control(q)` contradicts *all* such deterministic phase maps for those frozen GP-native donors. No permutation or injectivity assumption is needed for this stronger necessary condition, although non-injective maps alone would also require extra information for a lossless decoder. Synthetic 29→15 many-to-one donor positives assert the inequality at every tested period. The [Windows Node22 positive/invariant run 45275582331](https://github.com/FlareZ123/liber-primus/actions/runs/45275582331) completed successfully. This **does not** cover randomized/homophonic emission where one plaintext rune can produce several ciphertext runes, dynamic state within a phase, or moving/mixing rune positions.

This does not assume that the original printed ciphertext words are the plaintext words; it constrains each rune's position. It does assume one unchanged ciphertext rune maps to one plaintext GP29 rune, injectively at each fixed phase, with the declared genuine reset semantics. Randomized or state-dependent homophones, polygraphic transforms, variable clocks, state-dependent resets, altered rune positions, extra language channels, compressed data and other cipher architectures escape this bound; **deterministic non-injective fixed-phase maps do not**.

## Exact original registers and five literary controls

Read original `resources/liber-primus/lp2-corpus.json`, concatenate physical pages p0–55 including p50's **zero runes**, and retain source order (N=12,956). Use original GP29 `translit` with longest-token-first greedy matching and historical `V→U`, `K→C` normalization to encode the project's dated source-relevant texts:

- The three `resources/external/2013-book-of-law-{I,II,III}.txt` chapters, concatenated (21,611 GP runes); fixed original-length donor windows starting at 0, 4,327, 8,655.
- `resources/external/cicada2012-blake-marriage-gutenberg45315.txt`, from `THE ARGUMENT` to the Gutenberg end marker excluding license (18,631 GP runes); fixed donor windows starting at 0, 5,675. This is a 2014 Gutenberg-derived control, not independently established as the exact 2012 source edition.

These five spans deliberately represent two historically relevant *authors*, and overlap within each work. They are finite author-native language controls, **not five independent literature samples, a universal model of English, or an authenticated LP2 expected plaintext**. No English language score or candidate private alphabet was optimized.

The distinct authentic clock scopes are:

1. One entire book-global continuous period: all `q=1..3301`.
2. Nine authentically illustrated chapter ranges with GP indices `[0,729,1874,3603,5506,6761,7960,9640,12648,12956]`: `q=1..1033`, with independent unrelated secret per-phase alphabets and phase zero after every chapter boundary.
3. The physical **28 original thirteen-dot marks** on unknown p0–55, from [the actual original-image mark inventory](../resources/liber-primus/lp2-ink-annotations.json): `q=1..1033`, every marker starts a new *independently secret* clock and all GP29 alphabets are separately private. The two co-located p7 black/red marks, p14-terminal and p15-initial marks at one stream offset, and the p55-terminal mark produce **three legitimate zero-rune intervals**; preserve them rather than inventing nonempty tokens. The 28 events produce 29 source intervals, 26 nonempty. No mark or rune is ignored, including those lying across physical pages.
4. Each of 56 original physical pages as a separate key/clock segment: `q=1..130` with 56 independent unrelated alphabets, p50 carrying no runes.
5. **594 original printed lines** from the original master transcription's explicit `/` line separators, with page splitting at `%`: independently secret alphabet/clock restarted at each physical line, `q=1..22`. The script verifies *every rune on all 58 pages* matches `lp2-corpus.json` before deriving 594 unknown-page nonempty lines; maximum line width is **26**. This gate is intentionally **limited to q1–22**. At q23, original M=8 but one historical control gives M=7, so blanket finite-control exclusion already fails; q24 ties and q26 onward become all-zero/uninformative because no printed line exceeds 26 runes.

The finite maxima cover the canonical 3301 motif under a global clock, both genuine 2014 **840 and 1033** source numbers under chapter and mark clocks, and clocks shorter than approximately half a physical page in the page-local case. These are five **independent conditional reset policies**: no author source selects fixed-period substitution at any of these boundaries. The longest original thirteen-dot-delimited interval is **3,008 runes**. Consequently, a 3,301-period mark-private alphabet yields one or zero observations per phase per interval, **M(3301)=0 for every possible plaintext**. That untested high-period case is intrinsically *unidentifiable from equality invariants* and would require authentic 3,301-phase key material; invoking it cannot constitute a decryptor without that external source. **No claim about untested q above the respective limits or alternative word/line/hand-tuned reset rules is made.**

## Complete original-control comparisons

Every single period `q` in each tested interval yielded `M_original(q) < min_j M_control_j(q)`. Thus **3,301/3,301** continuous, **1,033/1,033** authentic-chapter-reset, **1,033/1,033** thirteen-dot mark-reset and **130/130** physical-page-reset clocks and **22/22** printed-line-reset clocks separate the original from *each* of the five controls. This result is exact for the finite source registers, not a frequentist p-value for human English.

| Reset semantics; tested q | Original M(q) | Five genuine-source donor M(q) | Smallest control-minus-original gap in entire interval |
| --- | ---: | --- | --- |
| Book-global q=840 | 3,277 / 93,540 eligible pairs | 5,781; 5,802; 5,799; 5,835; 5,680 | 404 at q=3151 |
| Book-global q=3301 | **634 / 19,062** eligible pairs | **1,198; 1,175; 1,140; 1,160; 1,164** | same complete interval |
| Nine chapters q=840 | 267 / 8,127 eligible pairs | 478; 497; 494; 502; 475 | 101 at q=932 |
| Nine chapters q=1000 | 212 | 387; 369; 378; 370; 367 | same complete interval |
| Nine chapters **q=1033** | **211** | **360; 342; 394; 348; 344** | same complete interval |
| Authentic thirteen-dot intervals q=840 | 256 | 444; 457; 452; 470; 438 | **84 at q=1030** |
| Authentic thirteen-dot intervals q=1000 | 193 | 363; 342; 364; 345; 352 | same complete interval |
| Authentic thirteen-dot intervals **q=1033** | **196** | **338; 324; 357; 336; 312** | same complete interval |
| Printed lines q=13 | 180 | 354; 340; 336; 355; 329 | 5 at q=22 |
| Printed lines q=22 | 16 | 26; 24; 24; 35; 21 | same complete q1–22 interval |
| Physical pages q=64 | 636 | 1,179; 1,106; 1,199; 1,154; 1,187 | 131 at q=129 |
| Physical pages q=130 | 224 | 401; 427; 425; 403; 397 | same complete interval |

The exact original book-global q840 count 3,277 reproduces the earlier [H840 result](lp2-h840-allsecret-phase-permutation-original-gate.md) as an internal crosscheck. The previously documented ten Crowley controls and five Blake controls remain the broader period840-specific benchmark; the five particular windows above are chosen for a common all-period comparison, not claimed to supersede that work.

The entire calculation and nonaffine positive control **PASS on actual Windows Node22 [original three-scope run 45266786087](https://github.com/FlareZ123/liber-primus/actions/runs/45266786087)**; the source-mark clock added on 23 November 2026 independently **PASSES** in [expanded four-scope CI 45273859213](https://github.com/FlareZ123/liber-primus/actions/runs/45273859213). The authentic 2014 **1033** period on both mark/chapter clocks **PASSES** in the [final extended Windows run 45274383447](https://github.com/FlareZ123/liber-primus/actions/runs/45274383447). The [complete Windows Node22/CommonJS reproducer](../sims/lp2_allperiod_secret_phase_bijection_original_sft.cjs) computes the entire original-versus-control interval with full per-q assertions and frozen anchor counts. It also constructs a genuinely **non-affine 29-rune permutation** independently for each phase and each reset segment, encrypts one original-length authentic-language donor, and checks exact inverse recovery and unchanged pair statistics. The positive is synthetic cipher text over real historical native plaintext; it validates the theorem's application, **not a historical Liber Primus encryption mechanism**.

## Decision and useful next action

Further searches for an unknown 29-rune Caesar mask or even an arbitrarily secret deterministic mono-rune map, bijective or many-to-one, at a constant book, chapter, thirteen-dot interval or physical-page clock within these ranges cannot reduce the original's equality count toward any of the frozen GP-native controls. Bijections preserve this count exactly; non-injective mappings only increase it. Recovering *ordinary* GP-native prose consistent with the above five donors requires a different architecture, for example an authenticated state-dependent nonperiodic cipher, a transform mixing or moving runes, or demonstrable additional side-information. An extremely atypical source-native English plaintext with original-like collision statistics remains mathematically possible.

The original printed-line result establishes that direct short-row substitution is also incompatible with these five ordinary literary GP29 donors at q≤22; **the original q23 line counterexample forbids extending this claim to every line clock**. The actual author-issued operation remains the central missing input; a novel ciphertext-language model cannot supply it. Use this broad conditional result to **avoid more fixed-phase private-key sweeps**, not to claim any recovered rune or to exclude all possible English strings.


## Arbitrary positional transport before the fixed phase maps (Director #2889, Agent8, 26 November)

The aligned equality invariant above need not survive a secret position permutation. However, a stricter *multiset* bound survives **every** such permutation, including unrelated permutations for each chapter, without knowledge of the transposition. This is a separate necessary condition motivated by the historical 2014 columnar transposition and [Notebook Session 224](https://cicadanotebook.com/sessions/224.html)'s one-rune maximum. Scope: ordinary consuming clocks, not selective-F clocks. The q8/q13 case includes constructive terminal feasibility; the all-period extension below gives broader exact necessary bounds.

For phase j, let h_j(c) count ciphertext symbol c. Under arbitrary phase bijection pi_j, the plaintext histogram is H(p)=sum_j h_j(pi_j(p)). For any k-symbol set S, its total count is bounded by sum_j of the k largest entries of h_j. Thus the sorted prefix vector of **every** possible H is bounded componentwise by B(k)=sum_j prefix_k(sort_desc(h_j)). Rearranging positions cannot alter H, so this excludes even arbitrary, secret pre-encryption position transport. The same formula allows private chapter maps by summing over (chapter,phase). It also gives a common-key impossibility wherever the more permissive private-key model fails.

**Frozen inputs:** canonical 12,956-rune GP29 source blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; nine exact physical chapter starts (pages 0,3,8,15,23,28,33,40,54,56 terminal), cumulative rune offsets [0,729,1874,3603,5506,6761,7960,9640,12648,12956]. Reuse the five frozen Crowley/Blake windows from the aligned test, not a new post-selected language corpus. Each full donor is 12,956 runes; chapter targets use its corresponding same-length slice. One supplemental cyclic native control repeats the complete 2,979-rune concatenation of nine pinned solved GP sections (blob 1b064ef6d85819b7d96adaff31a82d1ec551598f) to the same length; this is explicitly a synthetic repeated control, not an independent natural 12,956-rune book. For each target report the maximum positive prefix deficit max_k(H_sorted_prefix(k)-B(k)); zero means not excluded.

| Scope | Length | q8 smallest maximum deficit across five literature donors | q13 smallest maximum deficit |
|---|---:|---:|---:|
| Whole, shared phase maps | 12956 | 3946 | 3751 |
| Ch1 p0–2 | 729 | 119 | 67 |
| Ch2 p3–7 | 1145 | 210 | 161 |
| Ch3 p8–14 | 1729 | 346 | 314 |
| Ch4 p15–22 | 1903 | 425 | 349 |
| Ch5 p23–27 | 1255 | 222 | 160 |
| Ch6 p28–32 | 1199 | 220 | 169 |
| Ch7 p33–39 | 1680 | 371 | 315 |
| Ch8 p40–53 | 3008 | 735 | 642 |
| Ch9 p54–55 | 308 | 10 | 0 |
| Whole, all chapter-private maps and cross-chapter transport | 12956 | 2700 | 2217 |

All 19 of 20 (period,global/chapter) scopes with positive deficits exclude all five historical donor histograms and the supplemental cyclic native control. The whole-book chapter-private envelope also excludes all six: native cyclic deficits 2699 and 2223, respectively. For a shared continuous q8/q13 key the strongest global comparison does not require preservation of chapter membership. For each separately constrained chapter, the original eight long chapters fail even unrelated private keys. These are conditional reference-histogram exclusions, not universal English-language bounds.

**The genuine residual case: terminal chapter q13.** Its entire 29-prefix capacity is [42,74,102,128,153,173,189,202,215,228,241,254,267,280,292,301,305,307,308,308,308,308,308,308,308,308,308,308,308]. Every one of the five frozen terminal slices passes this necessary bound. Three additional fixed direct-native targets use the first 308 runes of WELCOME, KOAN1, and LOSS OF DIVINITY: WELCOME passes; the other two violate the capacity by 4 and 6 respectively. No language scoring or order search.

Exact integer feasibility on the surviving cases:
- **Additive shifts:** binary x[j,s] selects one rotation s per phase. For a fixed target histogram (a zero-width band) or a declared interval [L(p),U(p)], enforce L(p)≤sum_j,s h_j((p+s) mod29)x[j,s]≤U(p). Every one of the five exact terminal donor histograms has at least one phase with **zero** possible rotations even against its upper bound. This remains true when the band is widened to componentwise minima/maxima across all five donors (phase 1 has no rotation), and for exact native WELCOME (phase 1). This is an exact single-row certificate independent of a numerical optimizer.
- **Arbitrary bijections:** binary z[j,p,v] assigns one ciphertext count magnitude v to each plaintext symbol p, using each magnitude exactly as often as it occurs in h_j. Constrain the sum across j to the target interval. This compressed assignment is equivalent to explicit permutations because bins of equal count are interchangeable. SciPy 1.17.0 HiGHS MILP finds feasible integer solutions for **all five** exact literary terminal histograms, their widened band, and exact native WELCOME. All seven keys reconstruct concrete phase permutations, recover the specified histogram and reencrypt all 308 original ciphertext runes exactly. A specific WELCOME [witness](lp2-phase-histogram-terminal-witness.json) is independently replayed directly in JavaScript. It is not meaningful plaintext. Even fixing that entire exact histogram and the assigned count values, permuting equal-count ciphertext bins independently produces at least product_(j,v) count(h_j=v)! = about 10^240.258 possible keys. The exact 241-digit integer appears in the witness. Histograms alone cannot select an authentic key.
- **Positive plants:** shuffle the first 308 authentic WELCOME runes by seeded arbitrary position permutations, encrypt with hidden q8/q13 rotations or arbitrary phase bijections. Solver gets only phase counts and the target histogram. All four cases yield an exact integer witness and 308/308 forward replay; the two rotation plants recover the actual hidden shifts, the two arbitrary cases return distinct keys with the same histograms. This proves the witness search can succeed on the specified model and illustrates nonidentifiability, not recovery of actual word order. Seed 3301.

**Decision:** do not invest in additional short ordinary additive-period searches hidden behind arbitrary transposition to match these native controls, even on the short terminal chapter. The arbitrary-bijection q13 terminal case survives with massive ambiguity and no independent selector; no automatic order recovery successor follows. A dynamic F-hold phase register or alternate non-native representation is separate.

Reproduction: [original-source envelope generator](../sims/lp2_phase_histogram_envelope_sft.cjs) emits JSON including full 29-prefix envelopes and target vectors. [Exact integer solver](../sims/lp2_phase_histogram_feasibility.py) consumes it (numpy/scipy required). The generator was executed in connected V8, the exact original terminal matrices and fixed controls were transferred to local Python for MILP; integer witness replay and the four plants were executed locally. The terminal WELCOME witness was additionally checked directly against the remotely fetched corpus. No combined Windows CI run is claimed. No new unknown plaintext, historical key or source-selected transposition.


### All-period extension under arbitrary positional transport

The same exact majorization formula is evaluated for **every q=1–3301**, keeping the full-book histogram targets fixed and allowing arbitrary transport across physical pages and chapters. For shared phase maps, first add ciphertext count vectors at the same local phase across all reset units, then sort. For independent phase maps, sort each unit's phase histogram separately and sum its prefix capacities. All resets have the same phase-zero origin; independent unit starting offsets under a shared key are not covered by the shared-reset result. For private maps the origin choice is immaterial.

The table lists the first period not rejected by the necessary condition, **not** the first proven feasible cipher. Feasibility in q is nonmonotonic, so do not interpret any listed period as a sufficient threshold.

| Ordinary consuming clock | Crowley 0 | Crowley 4327 | Crowley 8655 | Blake 0 | Blake 5675 | Solved cyclic |
|---|---:|---:|---:|---:|---:|---:|
| Continuous, shared | 616 | 586 | 500 | 520 | 475 | 495 |
| Chapter reset, shared | 651 | 596 | 520 | 536 | 467 | 509 |
| Page reset, shared | none | none | none | none | none | none |
| Chapter reset, private | 75 | 72 | 64 | 60 | 60 | 60 |
| Page reset, private | 13 | 12 | 10 | 10 | 10 | 10 |

The longest original page has 277 runes. For shared phase-zero page resets, all q≥277 have exactly the same nonempty phase columns, so the failure of **every tested q** extends to **every positive integer q** under this exact reset convention. Even at q≥277 the smallest five-donor maximum-prefix deficit is 866 runes. This excludes a common, arbitrary alphabet-per-position-of-page transformation with unrestricted prior rune reordering, for these reference histograms. Other phase origins and nonordinary clocks are outside the shared-reset claim.

Consequently the book-wide ordinary shared clock must have q≥475 (continuous) or ≥467 (chapter resets) to admit even one of these five controls in the majorization relaxation. Chapter-private clocks require q≥60; page-private clocks can evade the bound at q=10. This gives a practical architectural lower bound independent of the transposition complexity, with no new plaintext or key. Do not turn the large surviving arbitrary-map space into an unselected key search.

[Reproducer](../sims/lp2_phase_histogram_allperiod_transport_sft.cjs) and [complete nonmonotonic passing-period ranges](lp2-phase-histogram-allperiod-transport-output.json). Executed directly in V8 against the pinned repository sources with total-count assertions and exact previous q8/q13 checkpoint reproduction. No separate Windows CI run.


## Shared physical-page origin: full-window capacity and affine inverse (Agent1, 28 November)

The earlier Agent8 all-period transport proof already excludes the fixed phase-zero shared physical-page architecture for five Crowley/Blake histograms. This extension **does not claim a new majorization theorem**: it makes the q≥277 endpoint sharp on the original corpus, exhausts every contiguous matching-length window in three other pinned literature controls, and attempts actual affine key recovery with whole physical pages withheld.

**Original input and clock.** All 55 nonempty physical LP2 p0–55 pages, 12,956 runes, p50 empty; every page restarts at its first printed rune, and the longest page has 277 runes. No F bypass, per-page IV, origin tuning, or assumption that printed groups represent plaintext words. Original source blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`. Native language model: 2,916-rune editorial-derived GP LP1 reference `resources/derived/dukotah-r37-lp1-map-runes.json` blob `0fb8fcaaf793628e0e76c6b17e9643170bbb9508`, not independently source-transcribed here. Literary conversion uses uppercase words, ING→NG, QU→CW, Q/K→C, V→U, Z→S, greedy longest GP chart token within each word; strips Gutenberg wrapper where marked. This is one explicit GP spelling convention.

**Sharp capacity.** For page-local column j let h_j be its 29 ciphertext counts. Sort h_j descending and sum componentwise across columns to obtain
```
M = [1277,1064,954,862,797,736,701,650,583,534,509,493,467,447,408,
     364,324,284,266,255,244,223,190,145,100,54,18,6,1]
```
For any possible shared arbitrary GP29 bijection at each column, its plaintext histogram sorted prefix is at most the corresponding prefix of M (the prior theorem). This envelope is simultaneously **attainable**: at every column send the most common ciphertext rune to GP0, second most common to GP1, etc., breaking ties by ciphertext index; the reproducer constructs that full mapping and verifies exact global histogram M. Hence the maximum global modal count is exactly 1,277 (9.8564%), and Schur-convexity gives exact maximum global IoC 0.05266137837425939. The LP1-derived reference has IoC 0.06286531751241745. The observed aligned column collision count is 10,751/311,132 = 0.034554465628736354. The arbitrary-bijection capacity is independent of plaintext order, printed spaces and page order; it does require the fixed local origin, one rune per position and a common bijection at each position.

| Pinned donor, GP stream length | All contiguous 12,956-rune windows | Windows passing prefix bound | Minimum maximum-prefix deficit | Minimum modal count | Minimum IoC |
|---|---:|---:|---:|---:|---:|
| Gibran, 47,703 | 34,748 | 0 | 816 | 1,414 | 0.05949359 |
| Emerson, 308,478 | 295,523 | 0 | 871 | 1,486 | 0.06099260 |
| Shakespeare, 217,644 | 204,689 | 0 | 631 | 1,404 | 0.05748714 |
| Total | 534,960 | 0 | 631 | 1,404 | 0.05748714 |

Every donor window fails the modal count and IoC bounds separately. The maximum-prefix deficit also lower-bounds the number of symbol replacements required to bring a donor histogram within the feasible envelope: one replacement can reduce any fixed top-k count by at most one. It is a necessary bound, not a claim of exact edit distance or feasibility. The exact negative survives any pre-encryption permutation of these donor windows. It does not exclude novel prose with a much flatter histogram, variable origins, page-private maps, selective F, polygraphic maps, homophones or a non-GP intermediate.

**Actual affine inverse.** Decode as `P[p,j] = a[j]*C[p,j]+b[j] mod29`, with all 812 nonzero-slope affine maps available independently at each of the 277 columns. No periodic key assumption. Train on physical p0–39 (9,640 runes); freeze the entire fitted action and decode p40–55 excluding empty p50 (3,316 runes). Start with exact per-column unigram maximization, then eight alternating-direction coordinate-ascent passes, exhaustively checking all 812 maps at each position using the frozen LP1-derived bigram model (8 unigram-backoff pseudocounts). This optimizer is not a certificate of the global joint optimum. A seeded xorshift32 constructs original-length plants cut from Gibran and Emerson; the same plaintext is independently keyed per cell for the wrong-family control. Test all four controls and original under identical fitting rules.

| Input | Hidden columns recovered | Held plaintext recovered | Held bigram nats/rune |
|---|---:|---:|---:|
| Gibran shared affine plant | 270/277 | 3,300/3,316 | −2.74545 |
| Emerson shared affine plant | 264/277 | 3,251/3,316 | −2.84880 |
| Gibran independent-cell plant | N/A | 106/3,316 | −5.20691 |
| Emerson independent-cell plant | N/A | 99/3,316 | −5.20120 |
| Original LP2 | unknown | nonprose | −5.21445 |

Original training score improves from −4.17281 to −3.96635, but the held score lies with independent-cell controls. All 12,956 runes re-encrypt in every test (automatic for bijections, not authentication). Control true held scores are −2.73066 and −2.80404. No recovered original phrase is promoted. This supports retiring the shared phase-zero page-position affine receiver for the tested native prose family, rather than trying more seeds of the same coordinate optimizer.

**Reproduction and output.** [Affine SFT](../sims/lp2_shared_page_affine_sft.cjs) · [full original candidate, keys and controls](lp2-shared-page-affine-output.json) · [sharp capacity SFT](../sims/lp2_shared_page_bijection_majorization_sft.cjs) · [complete-window results and pinned source blobs](lp2-shared-page-bijection-majorization-output.json). Both pure computational cores ran on the exact fetched repository inputs in connector V8; the filesystem/Node wrapper has not been separately executed. The all-window scan uses a rolling histogram, not a sampled approximation. Prior #1519 additive and #2485 insect-only arbitrary-bijection work remain separate evidence. The earlier phase-zero majorization derivation was rediscovered during this invocation; new value is the sharpness witness, full 534,960-window extension and positive-calibrated affine decoder, not its general formula. The underlying route was already disfavoured and remains so. No CI dispatched.
