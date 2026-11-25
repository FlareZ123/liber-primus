# Frozen previous-ciphertext occurrence-count q8 original inverse (#2746)

**Decision: retire this exact receiver for native English-like LP2 prose.** No authentic original key or plaintext recovered. This is an exploratory all-consuming register, not an author-selected operation. It neither proves every count-driven mechanism impossible nor excludes H-decoy or independently motivated nonadditive stages.

## Mechanism and exact all-key bound

Reset 29 occurrence counters at each source chapter; set j=0. For each rune, emit C_i=(P_i+K_j) mod29, then increment count[C_i] and set j=count[C_i] mod8. On the original ciphertext every phase J_i is public, independently of K. Therefore the inverse is P_i=(C_i-K_{J_i}) mod29, and exact forward replay holds for any K, not only the correct one.

For a fixed phase j with ciphertext histogram H_j(c), the maximum possible number of decoded E runes is max_c H_j(c). Summing these eight maxima is an **exact maximum across all 29^8 common keys**: the independently maximizing shift for each phase attains the bound. Across the canonical 12,956-rune tape with chapter resets at 0,729,1874,3612,5506,6527,7960,9640,12648,12956, the maximum is **579 E** (4.47%). Every 12,956-rune contiguous window from each of three fixed reference donors has substantially more E under the same GP spelling: Gibran 1,416 minimum over 34,674 windows; Shakespeare 1,408 over 204,151; Emerson 1,491 over 293,896. This is a finite native-language reference obstruction; it is not a theorem about arbitrary plaintext. Seven of nine chapters have fewer possible E runes than the lowest matched window from all three donors, even with private chapter keys. The opening and terminal chapters are not individually excluded by this unigram bound.

The phase-pair difference histograms also give rigorous relaxed decoded-doublet limits. For a<b, combine oriented ciphertext differences into H_ab(d); decoded equality requires d=K_b-K_a. For a=b the equality count is fixed at H_aa(0). Summing the minima/maxima independently across pairs gives original bounds [86,645] on decoded adjacent repeats; these are not asserted sharp and do not alone exclude native prose. The observed original 86 ciphertext doublets, 1,840 same-phase transitions and 15 same-phase doublets compare with 24 chapter-length-matched independently keyed native occurrence-clock plants: 353–512, 1,613–1,764 and 38–62 respectively. Ordinary digitwise q8 plants produced 319–579 ciphertext doublets and independent-pad plants 391–482. These finite plants calibrate rather than prove a universal collision exclusion.

## Independent lexical obstruction

Use the frozen broad 35,944 GP word-form register (10,842 donor-training/solved forms plus two existing canonical dictionary spellings and all singleton symbols). Retain actual printed word groups with line/page carries and source chapter marks; p15 begins with nine runes before the chapter break. For each group enumerate same-length forms and reject a candidate whenever two occurrences of one known phase imply conflicting shifts. For the remaining forms project the implied key onto at most four observed phases (highest frequency, numeric tie-break). Partition the groups by their selected phase subset. For each partition, the largest support of any projected assignment upper-bounds the number of simultaneously lexical groups, even granting unrelated keys to different partitions. Add groups with empty domains to the guaranteed OOV count. This is a rigorous necessary bound for the stated finite vocabulary; no key sampling is involved.

| Chapter | Groups | Individually impossible | Lower bound OOV | Allowed 5% |
|---|---:|---:|---:|---:|
| p0–2 |158|22|42|7|
| p3–7 |255|34|86|12|
| p8–p15 first 9 |385|51|150|19|
| p15 remainder–22 |435|62|187|21|
| p23–26 |224|36|72|11|
| p27–32 |326|49|121|16|
| p33–39 |378|59|156|18|
| p40–53 |669|87|352|33|
| p54–55 |66|12|16|3|

Even each chapter privately keyed fails. The lower bounds sum to 1,082 of 2,896 groups (37.36%); the common-key restriction could only worsen coverage. The terminal p54→p55 fit is not warranted after the prerequisite fails; p55 was included only in the all-chapter necessary tests.

## Calibration and reproducibility

Authentic p56 prime-minus-one transparent-F, native WELCOME q8 and KOAN q13 known algorithms reproduce 85/85,515/515,319/319 original ciphertext runes. Those are controls under their authentic algorithms, not occurrence-clock solutions.

For each of three literary donors, train smoothed GP unigram likelihood on its first 80% (and the first 80% of the other two). Plant a distinct 8-shift key on the first 650 words of that donor's withheld final 20%, infer all eight shifts from only the first 75% of plant ciphertext via exact independent phase likelihood maxima, then decode the remaining 25% without refitting. All three keys recovered exactly and **1,898/1,898** withheld runes recovered (606/630/662). Their observed OOV counts 3/13/8 exceed or equal the rigorous projection lower bounds 3/10/5; no control is falsely rejected by this gate. All 24 full-length occurrence-clock plant tapes round-trip exactly. The whole-book original exact maximum unigram log likelihood is −4.101105 nats/rune compared with −2.991205 to −2.948857 on the 24 native occurrence-clock plants, and overlaps the independent-pad range −4.113776 to −4.083525. The maximizing original key is a likelihood diagnostic, not a recovered key.

Run `node sims/lp2_occurrence_count_q8_inverse_sft.cjs` against pinned repository inputs. [SFT](../sims/lp2_occurrence_count_q8_inverse_sft.cjs) · [Raw results](lp2-occurrence-count-q8-output.json). Native window floors include the training portions because they are reference-range bounds, not blinded inference tests; the three explicit recovery plants are the held-out inference tests. Direct model execution used the same function in the tool runtime, with Node CLI wrapper supplied for local reproduction.

No count/phase/period/feedback tuning was performed. A new count-based receiver requires an independently authored selector or a different source-supported mechanism.
