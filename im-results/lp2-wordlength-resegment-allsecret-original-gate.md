# GP29 word-length resegmentation: exact all-key upper bound on original LP2

**Agent 3, 22 November 2026; Director #2177. Classification: source-conditioned original-cipher exclusion of a fixed, highly permissive word-delimiter cipher family.** This investigation recovers **no unknown plaintext, author key, or destination**. Its positive controls recover genuine GP29 text exactly. **28 November update:** the separate, historically worked GEB one-symbol gap displacement and literal-F-hold extension below exclude every contiguous window in three pinned native-GP donors, including a chapter-private all-key bound on p40–53.

## Intended operation and strongest rival

The original 2016 signed message calls Liber Primus's words a map and its numbers a direction. The original LP2 stream has 2,896 printed words over 12,956 runes, with 32 authentic words continuing across a physical page break. Existing length-order work showed that their adjacent word-length syntax lacks ordinary source-English dependencies. An economical alternative is that the **spaces frame cipher operations**, rather than directly preserving plaintext word positions. This remains a hypothesis: the signed clue does not identify a particular word-length resegmentation, a per-position alphabet, or a static key.

Test one strongly favorable family of lossless delimiter interpretations. Within **each of the nine original visual chapters**, preserve the exact list of printed word lengths as public sidecar metadata, but allow four fixed readings of that list before assigning the unchanged rune stream to words:

1. Literal printed lengths in place.
2. The **next printed length** frames the current block, rotating the chapter length list left by one.
3. The **previous printed length** frames the current block, rotating right by one.
4. The chapter's printed length list is **reversed**.

These preserve all **12,956 original rune symbols and their order**, every original chapter rune total, and all physical page-crossing rune sequences. The chapter word totals are `158,255,383,437,224,326,378,669,66`; its rune totals are `729,1145,1729,1903,1021,1433,1680,3008,308`. No hidden offset or learned boundary is selected. A cipher can re-emit the original printed spaces by retaining its original length list, so the framing is reversible when the sidecar is retained.

For **every** resulting frame, define state `(L,j)`, with `L` the frame length and `j` its zero-based rune position. Grant the attacker a **completely arbitrary, independent secret bijective mapping of all 29 GP symbols for each such state**. There are 105 observed `(L,j)` states; all their alphabets are fully unknown. This contains length/position Caesar shifts, all 29-symbol affine permutations, and many other value-changing keyed operations. A literal positive implementation also includes a directly invertible `C=(P+L+j) mod29` word clock. The much larger unknown-key claim below does not assume that particular formula.

## Exact unknown-key obstruction

Let `n(s,c)` be the number of occurrences of original ciphertext rune `c` in frame-state `s`. For **any** hidden permutation `π_s` of each state's complete 29-letter alphabet, at most `top_k(n(s,*))` source positions in that state can map to any particular set of `k` plaintext letters. Adding across all states gives the **sharp attainable upper bound**

`U_k = sum over states s of the k largest ciphertext frequency counts in s.`

The bound exhausts **all 29! alphabets per state implicitly**, without scoring or fitting a key, and is unaffected by rearranging the decoded rune order afterward. It also permits known spaces to be reattached after reading. A viable native-GP plaintext must meet the bound for its own four most frequent rune classes.

| Reframing of original printed lengths | Exact source max U1 /12,956 | Max U4 /12,956 | Max top-four share |
| --- | ---: | ---: | ---: |
| Literal | 828 | **2,912** | **22.4761%** |
| Next length | 849 | **2,910** | **22.4606%** |
| Previous length | 843 | **2,920** | **22.5378%** |
| Reversed lengths | 854 | **2,954** | **22.8002%** |

For an independent native-language calibration, the SFT encodes the original repository's Gibran and Shakespeare controls into **source-calibrated GP29**, including original solved-text `ING→ᛝ` and `IO→ᛡ`. It measures successive complete 12,956-rune windows at fixed stride 503, without inspecting any LP2 decoder:

- Gibran, **99** full-length windows: **minimum 4,373/12,956 = 33.7527%** of symbols in the four most frequent GP labels.
- Shakespeare, **406** windows: **minimum 4,266/12,956 = 32.9268%**.

All four exact all-secret original upper bounds are far below **every** independently encoded native-GP control window. No choice of 105 independently secret, state-specific GP29 alphabet permutations can produce these native-English registers from the full original LP2 under any of the four framed length grammars.

## Blind chapter with a stronger independent-key allowance

The p40–53 visual chapter contains **3,008 runes and 669 complete words** and is disjoint from the p16–21 interval (1,613 runes). If the hidden alphabets instead reset and become completely independent *per chapter*, whole-book frequency concentration no longer gives a universal exclusion. On the **untouched full p40–53 chapter alone**, however, the exact literal-frames upper bound is **U4=957/3,008 =31.8152%**, even when all its `(L,j)` state maps have arbitrary separate chapter-only keys. In 3,008-rune fixed-stride controls, the minimum observed Gibran top-four count is **1,015** over 119 windows and the minimum Shakespeare count is **968** over 426 windows. Thus the literal per-chapter all-secret model cannot reproduce any of those 545 source-English controls on the full original p40–53 chapter. The next-length chapter-private bound is **974/3,008** and is not below every Shakespeare control; it must not inherit this stronger exclusion.

The fixed direct inverse `P=(C−L−j) mod29`, with the four sidecar framing rules, also decrypts p16–21 and p40–53 without key fitting. All **eight** untouched original intervals have GP29 IoC **0.03435–0.03463**; the authenticated original p57 clear reference is **0.06271**. First 40 decoded p16–21 runes remain nonlinguistic under every framing. These examples are weaker evidence than the all-secret bounds and are given only to make the reversible operation explicit.

## Positive paths and decision

The SFT tests full-rune forward/inverse recovery of a real GP29 Gibran passage with the exact visible length/position clock. Separately it constructs **105 independent planted 29-symbol secret permutations**, encrypts full-length real Gibran GP29 for each of the four source-resegmentation geometries, recovers **12,956/12,956** planted symbols under the true inverse, and asserts that the observed output capacity bound includes the true source four-rune mass. The full original corpus, cross-page word count and chapter boundaries are asserted.

**Reject the specified four word-length resegmentations followed by any globally fixed complete state-conditional GP29 permutation** as a direct restoration of ordinary GP29 English. The literal resegmentation has an additional full p40–53 independent-chapter exclusion relative to the tested controls. Space-side data remains an important alternative to literal plaintext word breaks, but no external sidecar grammar, changing secret state, nonlinear multi-rune emission, non-GP intermediary, or English plaintext is inferred by this test.

Read-only Node.js 22 Windows-compatible reproducer: [`sims/lp2_wordlength_resegment_allsecret_sft.cjs`](../sims/lp2_wordlength_resegment_allsecret_sft.cjs). Manual Windows workflow: [`.github/workflows/agent3-original-source-gates-manual.yml`](../.github/workflows/agent3-original-source-gates-manual.yml). Earlier source-length grammar findings and cross-page carry checks are in [the consolidated length study](lp2-printed-wordlength-conditional-independence-original-gate.md); the present result asks about **cipher alphabets after deterministic resegmentation**, rather than length-order mutual information or word permutation.

## GEB one-symbol gap displacement, including ambiguous F holds (Agent18, 28 November 2026)

**Decision:** The specific source-visible reading-frame shift described in the historical *Gödel, Escher, Bach* book-code dialogue is now tested, not merely the length-list rotations above. Under the explicit assumption that this shift restores word frames and the receiving cipher has a fixed bijective GP29 alphabet for each frame length and consuming clock, it cannot reproduce any contiguous native-GP histogram in the three pinned literary registers. This also holds if the alphabet is completely independent in the original p40–53 chapter and literal F can be held without advancing the clock. No new plaintext or key is recovered. Arbitrary decoy gaps, nonstationary keys, more complex state, and other language registers remain open.

**Source-selected operation.** The [period-linked GEB OCR, Git blob `da652686147aa1c8585be659c89d0db60c831571`](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/eternal-golden-braid.txt), around lines 8215–8234 in *Canon by Intervallic Augmentation*, contains the worked reading-frame shift `ONE WAR TWO EAR EWE` → `O NEW ART WOE ARE WE`. The implemented shift reproduces this example exactly: shift all gap coordinates, including the initial/final frame cut, by one rune; discard out-of-range cuts and restore the two endpoints. Using both signs covers the possible encoding/decoding direction; apply it once in each of the nine original visual chapters, retaining the original rune order and all 12,956 runes. Edge clipping is explicit, and the original printed cut sidecar remains available for exact layout replay. A reverse shift without that sidecar is not guaranteed to recover clipped edge cuts. The GEB book was authentically selected by the 2014 Onion5 multimedia/book-code operation; no LP2 instruction authenticates this particular receiving frame or cipher.

The [SFT](../sims/lp2_geb_gap_shift_fhold_capacity_sft.cjs) checks the corrected printed word parse against the canonical original tape (2,896 groups, nine chapter totals). The shifts yield 2,904 / 2,905 whole-book groups (left/right) and 670 groups each in p40–53; the unshifted control gives 2,896 / 669. It grants completely secret independent bijections for each state `(L,j)`, where L is shifted frame length and j is within-frame consuming rune index. For ordinary substitution this is the sharp top-four bound above. For historical literal-F transparency, plaintext F emits ciphertext 0 without consuming the clock; all other plaintext values consume a symbol. In the simple upper bound we credit **every position at or after the first ciphertext zero in each shifted group** to the target set for free. All earlier positions have fixed clock j and contribute the sum of the four largest state-symbol counts. This generous relaxation still excludes all full-book native windows.

| Gap displacement | Ordinary whole-book top-four maximum | F-hold whole-book top-four upper | p40–53 F-hold top-nine **non-F** upper |
|---|---:|---:|---:|
| −1 (left) | 2,917 | **4,127** | **1,777** |
| 0 (literal control) | 2,912 | **4,170** | **1,786** |
| +1 (right) | 2,911 | **4,110** | **1,790** |

The chapter-private F-hold result uses a stronger **exact integer upper-bound certificate**, not a fitted key or heuristic score. Let position i have glyph c_i and z_i prior ciphertext zeroes in its group. Its possible consuming clock set is J_i=[j−z_i,j]. Let x_{L,t,c} be 1 if the secret inverse at state (L,t) maps c into an arbitrary chosen set of k non-F plaintext labels; each state has at most k such ciphertext labels. A held F never contributes to this target. For any integer weights a_i∈[0,D], actual target membership y_i satisfies

`D*y_i ≤ D−a_i + a_i * Σ_(t∈J_i) x_(L,t,c_i)`.

Thus total target count is bounded by the floor of `[Σ_i(D−a_i) + Σ_(L,t) top_k(Σ_{i:c_i=c,t∈J_i} a_i)]/D`. This grants independent possible clocks to occurrences, hence it covers all legal jointly consistent F-hold masks. Projected subgradient search only finds useful weights; exact summation at integer D=1024 proves the bound, independently of optimization convergence. The three k=9 numerators are 1,820,260 / 1,829,706 / 1,833,848. [Raw output and 3,008 weights per certificate](lp2-geb-gap-shift-fhold-capacity-output.json) preserve the entire k=1…12 exploratory bound vector and the exact k=9 witnesses. The value k=9 was selected as the shared separating capacity from this deterministic family of inequalities, not a statistical significance test.

**All-start donor comparison, no fitted text.** Authentic GP29 normalization includes ING→NG and IO→IA as in the source-calibrated controls above; scan **every contiguous start** at each fixed length rather than merely the old stride-503 windows. The three pinned donor tapes have 62,492 / 217,106 / 321,327 GP runes. Their exact minima and start counts are:

| Donor | 12,956-rune windows | Min top-four non-F | 3,008-rune windows | Min top-nine non-F |
|---|---:|---:|---:|---:|
| Gibran | 49,537 | 4,368 | 59,485 | 1,870 |
| Shakespeare | 204,151 | 4,259 | 214,099 | 1,792 |
| Emerson | 308,372 | 4,429 | 318,320 | 1,907 |
| **Total** | **562,060** | | **591,904** | |

For each of the three original framing cases, **zero** full-book windows and **zero** chapter-length windows survive their corresponding bound. The smallest chapter gap is two runes (right-shift bound 1790 versus Shakespeare minimum 1792), so the exact integer rounding certificate matters. A permutation of any of these donor windows retains its histogram and cannot rescue it. This is not a proof against every possible English text; it is an all-start finite-donor exclusion, conditional on the shared-state and frame assumptions. The independent solved native Cicada control has 2,979 runes, top-nine non-F mass 1,958; its length is different, so this is descriptive only.

**Actual fixed-key original inverse attempts.** As a bounded transfer check, reset the historically solved `DIVINITY` and corrected `FIRFUMFERENFE` keys at each shifted group, with phase zero and both additive signs. Enumerate every legal held-F/consuming branch of each original group, forbidding consuming plaintext F. Under every shift and key/sign combination, some complete original words have **no legal inverse at all**: across the two shifts 236–386 dead whole-book groups; in the original p40–53 chapter alone 55–80 dead groups (out of 670). Even granting independent choice among all remaining inverse paths, only 15–23 shifted chapter groups match any of the 12,267 native lexical forms. This rejects the exact word-reset key transfers on support, irrespective of language scores. The original literal framing also fails under all four combinations. A known-key control retains the correct complete native word in all 400 forward/inverse cases from the solved GP29 text. Six independent native 3,008-rune plants (three ordinary arbitrary-permutation and three F-hold arbitrary-permutation, one each per framing) replay the authentic symbols with the true key/mask and satisfy the appropriate upper bounds. The held controls include 72 genuine holds each and 80–106 consuming-zero outputs, so they exercise genuine clock ambiguity. The oracle mask replay is an implementation check, not blind key recovery.

**Scope and next action:** No authentic source selects a shifted LP2 word-clock cipher; the source supplies an exact historical operation but the transfer fails. Retire these gap shifts combined with shared length/clock alphabets, including the transparent-F word-reset variants on these donor registers. Do not tune the offset or alphabet to rescue the source. Independent keys that vary per word, authentic new boundary operations, a different plaintext representation or non-native register, and unrelated transformations are not excluded. The SFT core and all-start scan were executed in V8 on the actual pinned repository inputs; the standalone Windows Node wrapper has not been independently run.
