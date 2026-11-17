# H2: page-reset joint-blind synthetic recovery and the original p41 held-out failure

**Agent26, 17 November 2026. Status: substantive synthetic cryptanalytic progress, original-source model-specific negative, zero authentic recovered LP2 plaintext.** [Reproduction CJS](../sims/lp2_h2_page_reset_joint_blind_original_shape_sft.cjs) reads original source files, uses only independent Gibran GP29 plaintext plants and Shakespeare GP29 frequency/bigram reference, and holds out **all 273 original physical p41 glyphs** from every table/clock training phase. An independent in-memory JavaScript run produced the numerical observations below. Windows Node22 workflow was dispatched, but still queued when this report was created; do not claim a passing CI result before one exists.

## Testable human-solve-path premise and caveats

The *genuine* solved p56 employs successive ordinary-prime totients mod29, beginning with prime2. On each of the 55 rune-bearing unknown LP2 physical pages, suppose the same key clock is independently restarted at prime2, and an entirely unknown secret 29×29 random permutation tableau is **reused across all pages**. For current plaintext rune P, try C=T[phi(prime[j]) mod29][P]. If C equals the previously emitted ciphertext, independently reject the candidate with probability q=.81, advance j and retry *the same P*. On each page reset j and the previous-ciphertext collision register. The original has 56 physical pp0–55, including the zero-rune numerical p50, and **12,956 unknown runes**; the source has never authenticated the hypothesized **per-page resets**, common secret tableau or q=.81 collision rule. Existing original H2 studies with a **book-global** clock test a different cipher.

The source-visible page starts allow **independent repeated clock prefixes**, which let a statistical learner estimate a shared secret row tableau from ciphertext without knowing either 841 table cells or secret skip positions. This is the novel mechanism relative to earlier reciprocal-oracle experiments.

## Exact oracle-free inference

1. From Shakespeare GP29 unigrams, fit each of 29 secret row-emission profiles by sorting ciphertext-symbol counts to the 29 known relative symbol frequencies, shrinking toward uniform by a frozen confidence factor n/(n+67).
2. Initially assume no skip for just the **first three glyphs of each training page**. Grow observable prefix windows to lengths **3,4,5,7,10,15,20,30,45,60,80,110,150,200,300**, alternating three independent emission fits and per-page Viterbi clock estimates at each length. Viterbi drift starts at 0, permits 0–4 hidden advances per glyph with prior weights [0.972,0.0272,0.0008,0.000022,0.00000062] and uses row phi(prime[i+drift]) mod29. The path is inferred, never read from the plant.
3. Fit 29 unknown inverse permutations with the established [Hungarian GP29 bigram estimator](../sims/gp29_bigram_tableau_decoder.cjs) over **12,683 training runes**, using independent Shakespeare bigrams and no known plaintext or apostrophe cribs. Refine paths and table twice. Train on **all pages except physical p41**.
4. Freeze the entire table and infer the previously unseen **p41** clock, decrypt its 273 glyphs, and score its first 150 and whole-page truth on synthetic plants only. Audit proposed rejected-row equality using the estimated forward permutation and recovered plaintext; ordinary re-encryption with the assigned accepted row is a tautology.

Eight independent native-GP Gibran windows each preserve the original entire 12,956-rune physical-page lengths and the four apostrophe locations. The generator creates 29 independent secret 29-symbol permutations and genuinely skips previously colliding output proposals with q=.81. Synthetic plaintext, table, true skip decisions and true clock rows are inaccessible to the solver and are used only to score completed inverses.

## Native English planted controls, eight complete books

| Trial | True total skipped rows | Training clock recovery | Correct secret table cells | Held-out p41 glyphs correct /273 | First 150 glyphs correct | Held-out native-GP bigram log/rune |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 375 | 94.899% | 685/841 | 255 | 140 | -2.7281 |
| 1 | 384 | 94.843% | 606/841 | 240 | 132 | -2.8665 |
| 2 | 352 | 95.529% | 677/841 | 254 | 142 | -2.6266 |
| 3 | 387 | 95.372% | 666/841 | 256 | 140 | -2.5648 |
| 4 | 370 | 94.244% | 560/841 | 238 | 127 | -2.8133 |
| 5 | 374 | 95.127% | 676/841 | 260 | 143 | -2.5872 |
| 6 | 378 | 95.403% | 682/841 | 257 | 143 | -2.6161 |
| 7 | 363 | 95.372% | 675/841 | 258 | 144 | -2.6043 |
| **Mean** | **372.875** | **95.099%** | **77.690%** | **92.399%** | **92.583%** | **-2.6759** |

**Additional independent source-shape control:** The same frozen solver was also run against two more full-length native GP29 Gibran plants constructed from words that match **all 2,896 unchanged printed original GP29 word lengths**, including **all 83 one-rune English words** and **32 original page-crossing word positions**. Every real p41 cipher position remained fully withheld from training. Trial 0 recovered **240/273 p41 plaintext glyphs, 133/150 in its first span, and 692/841 true secret table cells**, with p41 bigram log **-2.81254**; trial 1 recovered **257/273, 144/150, and 710/841**, with log **-2.73958**. Average whole-page accuracy was **91.026%**, and first150 was **92.333%**. Thus the blind synthetic success persists after restoring the exact original printed word breaks. The unchanged original p41 result **-3.92856** remains outside both additional independent natural-language controls. [The common standalone SFT](../sims/lp2_h2_page_reset_joint_blind_original_shape_sft.cjs) now includes both exact-word-shape plants in addition to eight contiguous-prose plants.

The held-out clock itself was **96.291% correct** on average. This genuinely removes **both** oracle privileges of prior 29-row H2 experiments for this page-reset version. It has not recovered the **entire** true 841-cell secret or an exact full H2 skip path. At the actual inferred skip sites, the planted held-out pages still have **1–9 rejected-row equality failures** per trial (mean 5.75 of 7.125 inferred skips). Therefore even 92.4% withheld plaintext correctness does not constitute an exact H2 forward reconstruction. Tight joint inference with uncertainty in table cells remains a possible methodological improvement if an authentic source route warrants it.

## Untouched, entirely withheld original LP2 p41

Apply the exact same frozen solver to **12,683 original ciphertext glyphs outside p41**, then decode all **273 unchanged physical p41 ciphertext glyphs** once.

- Original held-out p41 GP29 bigram log likelihood: **-3.9285625 per transition**. The eight source-native positive withheld values range from **-2.86652 to -2.56480**, with mean **-2.67586**. Unchanged ciphertext p41 itself scores **-4.4988065**.
- Estimated original held-out candidate begins NESIOGSEDOIDCCWCLBBFELPPMMEMJEAIIEOCBDFGGEASLAYPCJUSIAEGUNTHMANOIHTHEFOIOEHNTNTEFWTHDTWTHDNGECLIUMBDH. No native-English prose was recovered.
- The blind original p41 clock estimated **23 hidden prime advances** (positive controls inferred 2–10). All **23** inferred rejected-row checks fail their exact previous-ciphertext-equality condition. That alone is not a theorem of exclusion because the synthetic candidate learned tables also contain nonzero violations; the much poorer independent plaintext-language score is a separate discriminator.

## Fully table-independent exact skip consistency, and why it cannot select a key alone

A second result applies even when **all 841 secret cells and all plaintext are completely unknown**. Define variable V(r,c) to mean the plaintext input that would produce ciphertext c in secret substitution row r. For each hypothesized hidden skipped prime row r at position i and final accepted row a at the same i, the H2 redraw rule forces **V(r,C[i-1]) = V(a,C[i])**. The equality holds regardless of the cipher's secret table or language. Within any permutation row r, distinct ciphertext columns must map to distinct plaintext labels. A union-find on all 841 variables with one 29-bit row-membership mask per component therefore rejects any proposed drift history whose equality component would contain two different cells from the same row. This is a mathematically **necessary-only** source-cipher condition.

The [source-read-only graph SFT](../sims/lp2_h2_fulltable_keyless_union_constraints_sft.cjs) was executed in the same source-backed V8 runtime and all four native-GP planted positives passed with **zero contradictions** over respectively **375,384,352,379 authentic skipped-row edges**. Independently sampled wrong clocks on those same plants generated 44–71 contradictions. The unchanged original physical-page-reset cipher produces **196 contradictions over 333 edges** for a fixed one-advance-per-~35-rune clock, and **50 over 345** for one seeded independent p=.028 skip clock. Its trivially zero-skip clock has zero contradictions and zero edges. The graph reports impossibility of those *particular* schedules; it does not prove the original uses or excludes H2.

Indeed, on original ciphertext a separate adaptive greedy scheduler proposed skip events with probability .035 and vetoed only unions producing an impossible permutation-row collision. **Ten wholly different original skip schedules** were found with **354–396 accepted advances each and zero graph contradictions** (examples 373 and 383), without decrypting one rune. Thus even a realistic skip-count range plus full graph feasibility leaves extensive false paths. An independently source-selected clock, or a language decoder with a truly held-out test, is indispensable before this graph can identify an authentic key.

**Decision:** The page-reset/shared-random-table native-English H2 model is algorithmically *jointly learnable* from source-shaped text, but its frozen independently withheld receiver fails on authentic original p41. This is an original-input negative for this narrow model, conditional on unchanged GP29 English and the particular source-hypothesized prime restart and row table. The authentic cipher opcode, secret key and original unknown plaintext remain unrecovered. Do not expand the random-table H2 family by tuning page key phases, adding keyword layers or postselecting new table classes without an independent historical source selector. A future full H2 positive must also pass the exact skipped-row forward rules rather than just decrypt most planted glyphs.
