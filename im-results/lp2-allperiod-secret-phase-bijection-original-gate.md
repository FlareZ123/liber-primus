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

**Generalization beyond bijections (same original ciphertext evidence, stronger theorem).** Let `f[segment,phase]` be **any deterministic GP29→GP29 mapping**, even non-injective, with the same input position/phase segmentation. Equal plaintext signs always have equal ciphertext signs. Thus every same-phase equal-pair indicator in the plaintext contributes an equal pair in ciphertext, while merging formerly different signs can only increase collisions: **`M_cipher(q) ≥ M_plain(q)`**. The observed strict `M_original(q) < M_control(q)` contradicts *all* such deterministic phase maps for those frozen GP-native donors. No permutation or injectivity assumption is needed for this stronger necessary condition, although non-injective maps alone would also require extra information for a lossless decoder. Synthetic 29→15 many-to-one donor positives assert the inequality at every tested period. This **does not** cover randomized/homophonic emission where one plaintext rune can produce several ciphertext runes, dynamic state within a phase, or moving/mixing rune positions.

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

The finite maxima cover the canonical 3301 motif under a global clock, both genuine 2014 **840 and 1033** source numbers under chapter and mark clocks, and clocks shorter than approximately half a physical page in the page-local case. These are four **independent conditional reset policies**: no author source selects fixed-period substitution at any of these boundaries. The longest original thirteen-dot-delimited interval is **3,008 runes**. Consequently, a 3,301-period mark-private alphabet yields one or zero observations per phase per interval, **M(3301)=0 for every possible plaintext**. That untested high-period case is intrinsically *unidentifiable from equality invariants* and would require authentic 3,301-phase key material; invoking it cannot constitute a decryptor without that external source. **No claim about untested q above the respective limits or alternative word/line/hand-tuned reset rules is made.**

## Complete original-control comparisons

Every single period `q` in each tested interval yielded `M_original(q) < min_j M_control_j(q)`. Thus **3,301/3,301** continuous, **1,033/1,033** authentic-chapter-reset, **1,033/1,033** thirteen-dot mark-reset and **130/130** physical-page-reset clocks separate the original from *each* of the five controls. This result is exact for the finite source registers, not a frequentist p-value for human English.

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
| Physical pages q=64 | 636 | 1,179; 1,106; 1,199; 1,154; 1,187 | 131 at q=129 |
| Physical pages q=130 | 224 | 401; 427; 425; 403; 397 | same complete interval |

The exact original book-global q840 count 3,277 reproduces the earlier [H840 result](lp2-h840-allsecret-phase-permutation-original-gate.md) as an internal crosscheck. The previously documented ten Crowley controls and five Blake controls remain the broader period840-specific benchmark; the five particular windows above are chosen for a common all-period comparison, not claimed to supersede that work.

The entire calculation and nonaffine positive control **PASS on actual Windows Node22 [original three-scope run 45266786087](https://github.com/FlareZ123/liber-primus/actions/runs/45266786087)**; the source-mark clock added on 23 November 2026 independently **PASSES** in [expanded four-scope CI 45273859213](https://github.com/FlareZ123/liber-primus/actions/runs/45273859213). The authentic 2014 **1033** period on both mark/chapter clocks **PASSES** in the [final extended Windows run 45274383447](https://github.com/FlareZ123/liber-primus/actions/runs/45274383447). The [complete Windows Node22/CommonJS reproducer](../sims/lp2_allperiod_secret_phase_bijection_original_sft.cjs) computes the entire original-versus-control interval with full per-q assertions and frozen anchor counts. It also constructs a genuinely **non-affine 29-rune permutation** independently for each phase and each reset segment, encrypts one original-length authentic-language donor, and checks exact inverse recovery and unchanged pair statistics. The positive is synthetic cipher text over real historical native plaintext; it validates the theorem's application, **not a historical Liber Primus encryption mechanism**.

## Decision and useful next action

Further searches for an unknown 29-rune Caesar mask or even an arbitrarily secret deterministic mono-rune map, bijective or many-to-one, at a constant book, chapter, thirteen-dot interval or physical-page clock within these ranges cannot reduce the original's equality count toward any of the frozen GP-native controls. Bijections preserve this count exactly; non-injective mappings only increase it. Recovering *ordinary* GP-native prose consistent with the above five donors requires a different architecture, for example an authenticated state-dependent nonperiodic cipher, a transform mixing or moving runes, or demonstrable additional side-information. An extremely atypical source-native English plaintext with original-like collision statistics remains mathematically possible.

The actual author-issued operation remains the central missing input; a novel ciphertext-language model cannot supply it. Use this broad conditional result to **avoid more fixed-phase private-key sweeps**, not to claim any recovered rune or to exclude all possible English strings.
