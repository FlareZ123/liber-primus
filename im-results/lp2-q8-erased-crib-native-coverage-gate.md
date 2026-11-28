# q8 missing-identity gate: seven known words need chart coverage, not merely seven word slots

**Director #3261 decision (28 November 2026):** The seven-word recovery of #3258 is a correctly calibrated *conditional full-oracle instance*, but it has no uniform erasure tolerance. Under a stronger-than-requested information grant—**exact start phases of every retained native word**—new matched native plants exhibit **provably different full GP29 q8 actions with identical source ciphertext, plaintext and phases for all seven supplied words**. No algorithm can uniquely infer the full chart from those data. Hiding one or two word identities cannot restore identifiability. Neither a larger search nor a language score repairs this information deficit; a new source-derived anchor must cover the missing chart directions or the task must explicitly restrict its goal to the action on observed symbols.

This is a constructive **negative/identifiability** result, not a claimed original LP2 key, an unknown LP2 solution, or evidence that all smaller crib sets fail.

## Reproducers and exact data

- [Exact seven-source-crib erasure and lexical completion](../sims/lp2_q8_erasured_native_action_witness_sft.cjs) · [two previously pinned planted actions](lp2-q8-erased-crib-chart-ambiguity-certificate.json).
- [New frozen-seed matched common/private worlds](../sims/lp2_q8_erasured_new_native_quotient_sft.cjs) · [complete compact results and explicit alternate charts](lp2-q8-new-native-erasure-coverage-and-private-controls.json).
- Historical input is solely `resources/external/relikd-solved-gp29-native-v1.json`. Exact original seven plaintext words, lengths and locations are taken from #3258; their independently assigned q8 starts were hidden in the actual proposed task, **but explicitly supplied here to construct a stronger oracle impossibility witness**. Chart is normalized `pi(0)=0, pi(1)=1`; each of the three chapters has its own primitive q8 key, and F bypass is preserved.
- The existing 38,938-entry GP29 lexicon is reconstructed from `resources/control/english_wordfreq_textblob.txt` with the pinned fixture additions. Distinct normalized GP strings are preserved, every retained word is exactly forward-reencrypted, and every hidden word candidate is enumerated under all eight start phases with F branches. Chart/key variables are joined through 51-column GF(29) affine constraints plus the chart permutation condition. The finite-completion class is enumerated **only where feasible and explicitly marked incomplete otherwise**.

## Frozen erasures and exact pinned cases

Erasure schedule was fixed as (a) last word #6 `EVERY`, (b) #5 `WITHIN`, and (c) both #5 and #6. Locations, lengths and ciphertext of hidden words remain supplied; their plaintext identities are unavailable to the receiver.

| Pinned chart plant | Omitted native word | True-phase affine rank / nullity | Enumerated chart permutations | Lexicon-compatible complete chart/key tuples |
| --- | --- | --- | ---: | ---: |
| #3258 common plant0 | `EVERY` | 47 / 4 | 58 | 1 |
| #3258 common plant0 | `WITHIN` | 48 / 3 | 2 | 1 |
| #3258 common plant1 | `EVERY` | 47 / 4 | 116 | **2** |
| #3258 common plant1 | `WITHIN` | 47 / 4 | 6 | 1 |

These are exhaustive **true-phase** completions, **not** full phase-blind chart recoveries. Both two-word-erasure classes are much larger (`29^8`, `29^9` possible affine assignments) and explicitly **not enumerated**; the plant1 one-word counterexample remains valid for two erased words, since erasing another plaintext constraint only broadens the consistent set. Claiming the numerical size of the entire completed action set here would be misleading.

The second chart action in pinned plant1 with `EVERY` hidden substitutes GP string `i1i7q` for true `i1i4q`: in the pinned spelling convention this is dictionary typo **EVEWY**, frequency 1, against **EVERY**, frequency 650. This matters: it is an exact *dictionary-membership* counterexample, **not a plausible human plaintext interpretation**. A frequency threshold could rule this particular substitute out without resolving the broader chart-coverage problem.

## New independent native controls and lossless full-seven counterexamples

Four newly fixed seeds `74103, 74204, 74305, 74406` independently generate a normalized shared 29-symbol chart, three unrelated primitive 8-entry keys and independent word phases for the **same** historically solved seven-word input profile. Their matched private-chart rivals use three independent charts **with exactly the same three key vectors and seven word phases** as the paired common world. The four common-world 51-variable GF29 ranks using **all seven** oracle plaintext words/phases are respectively **50, 48, 50, 49**. Thus chart rank depends on operand coverage and starts, not just the number 55 of supplied runes.

Two exact full-seven ambiguity certificates are especially decisive:

- **Seed 74204:** GP labels **12 (EO), 14 (X), 22 (OE)** do not appear anywhere in the seven plaintext *or* ciphertext words. Swapping any two of these chart coordinates leaves all seven full forward encryptions and phases identical but changes the symbolic q8 action. At least `3! = 6` distinct fully normalized action charts are consistent with **all seven** correct plaintext identities (not merely six).
- **Seed 74406:** GP labels **21 (NG), 28 (EA)** never occur in the seven plaintext/ciphertext strings. Swapping their chart coordinates also leaves all seven word encryptions exactly unchanged and changes the action. Both charts are explicitly saved.

In each certificate the exact new `pi`, unmodified planted key vectors and unchanged hidden words are available in the machine record, and the script asserts full forward replay plus non-equivalence under all q8 phase rotations. The ambiguity survives more generous oracle inputs than any one-/two-erasure task. It therefore blocks generic **full-chart** identifiability absent a new observed-symbol condition.

Under the frozen one-word true-phase tests, seed **74103** also uniquely retains the correct action after each five-rune erasure in the capped-complete scopes (`29^3` free assignments each); seed **74305** retains **two** lexicon-complete actions after erasing `EVERY` and after erasing `WITHIN` (each `29^4` free assignments). For seed74305, the alternate action even assigns the **same correct hidden plaintext identity** at the same phase; it differs elsewhere on the q8 chart. Unfinished high-nullity classes are accurately flagged `complete=false` rather than recorded as null results.

The four private-chart controls with all seven **true phase** inputs yield direct affine contradictions against a single shared chart. With one or two identities erased, some become affine-consistent at those true phases, but **no private-world full phase-blind rejection is claimed**: alternative unknown phases and the all-different chart constraint have not been exhaustively eliminated. The contrast still shows that removing a crib can erase an otherwise decisive cross-chart equation.

## Causal next decision

A future original-input q8 chart receiver needs more than a count of located plaintext words. Require **independently sourced original plaintext identities** with a pinned phase/clock rule, plus a **chart-coverage audit** that proves all 29 GP coordinates are constrained modulo only documented phase and scale gauges. Shorter anchors with coverage can help; seven long cribs without coverage can be insufficient. If coverage is missing, return the explicitly identified **equivalence class on the observed GP subalphabet**, not an invented unique chart or missing historical key.

The case is a completion of the **negative/barrier branch** of #3261, not a rescue for the failed blind q8 model or a reason to sweep guessed LP2 cribs. The independent-source-anchor acquisition route remains conditional. All unknown LP2 physical p0–55 pages remain undeciphered in the current established record.
