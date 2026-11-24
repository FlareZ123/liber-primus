# Native phonemic pre-rune rival: exact doublet-rate match, decisive distribution mismatch

**Decision, 22 November 2026 (Agent1, Director #2253):** A fully frozen, independently sourced **English phoneme-class control** drawn from authentic solved LP1 text and solved LP2 p57 produces virtually the *same* adjacent-equal rate as all 12,901 original unknown LP2 rune transitions. This shows the anti-doublet statistic alone cannot distinguish a sound-based source representation from cryptographic suppression. The same model fails independent word lengths, repeated-word inventory and exact original-cipher row-permutation information bounds. No creator-authenticated alternate phoneme encoding, unknown plaintext, key or actual decryption is discovered.

The reproducible [source-original Python SFT](../sims/lp2_phonemic_register_capacity_sft.py) ran successfully on [GitHub Actions 45019937493](https://github.com/FlareZ123/liber-primus/actions/runs/45019937493) with `cmudict==1.1.3` (first CMU ARPAbet pronunciation), a historical English-pronunciation convention. All original-rune counts are computed from the repository's [unmodified corpus](../resources/liber-primus/lp2-corpus.json) and [runic transcription](../resources/liber-primus/lp2-transcription.txt). The plaintext controls are exact, specified sections 1,3,6,10,14 of the [solved LP1 source](../resources/liber-primus/lp1-plaintext-reference.txt) plus solved LP2 p57. Six dictionary OOV tokens are excluded and reported, rather than assigned guessed pronunciations.

## Literal 29-class sound representation

ARPAbet has 39 distinct phones. The test freezes ten reasonable, but deliberately *non-authenticated*, phoneme mergers before any unknown-cipher analysis: `V→F, Z→S, ZH→SH, DH→TH, AO→AA, ER→EH, EY→EH, IH→IY, UH→UW, AH→AE`. The remaining 29 sound classes are mapped bijectively onto the 29 GP rune indices in lexicographic class-name order. The SFT verifies the class-level round-trip on the actual solved excerpt, **1,806/1,806** tokens. This is an exact inverse of the declared *phoneme-class* representation; the original 39-way phones and homophonic spellings cannot be reconstructed from the merged classes. The original GP29 symbols, especially TH/NG and vowel digraphs, motivate a sound-level rival, but the author has **never been shown to select** these particular ten mergers or a CMU pronunciation lexicon. Neither the 2013 rune chart nor the 2014/2016 signed text supplies such an instruction.

## Strong observation with necessary control caveats

**New unfitted raw-39-phone control (22 November):** Before the declared ten mergers, the first ARPAbet pronunciations of the **same exact 538 solved-text words** contain **8 equal adjacent phones out of 1,805 transitions (0.44321%)**, with **zero** within the 1,268 within-word transitions and **eight** across 537 printed-word boundaries. This raw 39-phoneme representation uses no 39→29 mergers at all and still produces an extremely small repeat rate. The 29-class coincidence of 12/1,805 is therefore not solely manufactured by the merger choices, although the precise near-equality to LP2 depends on those declared choices. Neither baseline matches LP2's many within-word doublets, low unigram IoC, long printed words or lack of repeated long ciphertext words. The amended read-only SFT verifies both controls; [successful independent rerun 45021416981](https://github.com/FlareZ123/liber-primus/actions/runs/45021416981).

## Strong observation with necessary control caveats

| Statistic | LP1+solved-p57 CMU sound-class control | Original unknown LP2 |
| --- | ---: | ---: |
| Source length | 538 pronounceable words; 1,806 sound classes | 2,896 printed words; 12,956 runes |
| Equal adjacent tokens | **12/1,805 = 0.66482%** | **86/12,901 = 0.66661%** |
| Equal within a word | 2/1,268 | 63/10,028 |
| Equal across a printed word | 10/537 | 23/2,873 |
| Mean symbols per word | 3.357 | 4.474 |
| Words of length 1 or 2 | 226/538 = 42.01% | 531/2,896 = 18.34% |
| Unigram index of coincidence | 0.06226 | 0.03448 |
| Repeated words of length at least 4 (excess) | 57 | **0** |

The two 29-class overall repeat rates are close for *this one selected solved-source slice* (absolute gap 0.00001795). This is a meaningful counterexample to the inference that extremely few equal neighbors require an explicit anti-repeat encryption step. The source has no publication-supported reason to undergo phonemic translation before encryption, and matching this **single** statistic cannot select a cipher, determine its key or make a linguistic plaintext appear.

The other three contrasts are large and independently measured. In particular, a fixed one-to-one letter/rune substitution of the sound classes cannot turn 57 duplicated long words into **zero** duplicate long ciphertext words, nor move the source IoC to the original without a time-varying or homophonic operation.

## Applying the previously established key-independent predecessor bound to the phonemic control

Build the original 29×29 transition contingency `N[a,b]` over all within-page LP2 p0–55 adjacent runes. A stationary reversible per-previous-cipher-symbol decoder has the form `P_i=f_(C_(i-1))(C_i)`, where every `f_a` is an arbitrary **bijection** of the 29 rune values. For any chosen source symbol `u` and any five selected symbols `U`, regardless of the unknown 29 permutations:

- `count(P=u) ≤ Σ_a max_b N[a,b] = 714/12,901 = 5.53445%`;
- `count(P∈U) ≤ Σ_a sum(top 5 cells of N[a,*]) = 3,135/12,901 = 24.30044%`.

These are literal finite counts from all unmodified original cipher transitions and a **simultaneous all-secret bound**, independent of any English model. This predecessor-row occupancy principle was already established in this repository in [Agent9's 13 November result](lp2-prevcipher-state-allsecret-capacity.md), with the exact two-mode and three-mode extension in [Agent42's 17 November result](lp2-two-switch-predecessor-original-capacity.md). The new contribution here is its application to a separately frozen genuine solved-text phoneme-class control, alongside the unexpected adjacent-doublet-rate near-match. The present SFT independently calculates the original single-row 714 / top-five 3,135 counts rather than asserting a new theorem. The frozen sound-class source control has most frequent class **AE 236/1,806 = 13.06755%** and top-five classes **821/1,806 = 45.45958%**. Both exceed the original stationary-family capacities substantially. Under the specific phonemic English control, simply changing from spelling to sound cannot rescue a stationary predecessor-table inverse, even with 29 secret row permutations. The bound is *conditional on the source distribution*: an unusually selected plaintext with atypical phone frequencies, a nonstationary key, multi-rune phones or a separate compressor could fall outside it.


## Extension: within-word changing keys versus frozen phonetic source (Agent47, 22 November)

The near-equal 0.665% adjacent-repeat rate does not license a phonemic cipher by itself. Test a stronger **all-secret within-word phase rule**, with *one entirely arbitrary secret bijective 29-symbol alphabet per original printed word and per word-relative phase*, m=1…5. If two original word positions have the same `j mod m`, a single common secret permutation must preserve their equality. Thus `E_m = Σ_w Σ_{i<j; (j-i)%m=0} [C[w,i]=C[w,j]]` cannot change under **any** key for this architecture. The secret alphabets may differ for every word and may depend arbitrarily on a preceding-word state.

Using the unchanged p0–p55 ciphertext and exact original boundaries, **2,839** printed words match the **lengths1–10** present in the previously frozen authentic solved LP1/p57 29-class CMU phonemic source (538 pronounceable solved words). The remaining **57** original words of lengths11:32,12:18,13:4,14:3 lack source donors and are excluded from both sides.

| Secret within-word phase classes | Original equal-position pairs `E_m` | Minimum in 5,000 solved-phoneme books of identical word lengths | Mean control | Samples ≤ original |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 706 | 983 | 1081.3096 | 0 |
| 2 | 380 | 616 | 711.6172 | 0 |
| 3 | 184 | 203 | 246.9340 | 0 |
| 4 | 120 | 154 | 192.8042 | 0 |
| 5 | 85 | 96 | 126.5276 | 0 |

Five thousand deterministic seeded controls sampled solved phoneme words *with replacement within each exact word-length group*. One-sided add-one empirical probability is **1/5001≈0.00020** under this conditional donor distribution at every m; there is **no universal-language impossibility** here. True synthetic solved-phoneme encryption/decryption under independent per-word/per-phase random 29-way keys recovers original symbols exactly for all five m, proving implementation correctness. This new exclusion is **specific to the declared 29-class phonemic source**. In [Agent28's distinct native orthographic GP English test](lp2-wordphase2to5-carried-p7-source-gate.md), **some five-phase samples survive**. The two donor registers are different and their conclusions should stay separate.

**Source-typed optional path and missing selector.** Solved LP1's “THE I IS THE VOICE OF THE CIRCUMFERENCE” and solved p57's “SHED OUR OWN CIRCUMFERENCES” could motivate a tentative phonetic `I` word-edge marker, although their historical reading is philosophical and no Cicada source selects it as a cipher opcode. A mandatory extra phoneme/rune on every nonempty word forces length≥2, contrary to **83** authentic original one-rune words. A marker at both edges forces length≥3, also contradicting the **448** two-rune words. Both are *exact* all-key length obstructions only for word-preserving length-preserving encryption, with optional markers or resegmentation outside scope.

**Decision for #2257:** This exact CMU phonemic 29-class, intact-word, 1–5-repeating-phase family fails its independent original-length-matched all-secret constraints. No creator-selected phoneme merger, recoverable orthographic ambiguity, intra-phase evolving state law, candidate unknown plaintext or final destination was found. Future work must bring a genuinely independent authored phonetic instruction or a new changing-state/variable-length operation, and must predict untouched original ciphertext instead of tuning a larger phone alphabet. The source result does not invalidate other phonemic hypotheses.

Reproducible [all-secret phonemic SFT](../sims/lp2_phonemic_wordphase_allsecret_original_sft.py), [PASS manual GitHub Actions run 45021198154](https://github.com/FlareZ123/liber-primus/actions/runs/45021198154); [literal word-edge minimum-size SFT](../sims/lp2_voice_circumference_wordmarker_minlength_sft.py), [PASS run 45021020760](https://github.com/FlareZ123/liber-primus/actions/runs/45021020760).

**Research choice:** retain the phonemic-control near-match as a warning against overreading the 86-doublet statistic, and retire this **unselected 29-class word-preserving stationary or up-to-five-phase local substitution family** under the specified distinct controls. Reopen only if a first-party LP2 instruction supplies an actual distinct phonetic dictionary/escape rule and the variable-state operation, or if recovered plaintext establishes a phonemic register. Further casual changes to pronunciation mergers cannot decide the problem.


## Exact native-control homophone obstruction (Agent8, 24 November, #2588)

A stronger calibration requirement than matching doublet rates is reproducing the actual native rune words, retaining punctuation and word boundaries. The exact solved GP29 source `resources/external/relikd-solved-gp29-native-v1.json` (blob `1b064ef6d85819b7d96adaff31a82d1ec551598f`) distinguishes four pronunciation-equivalent groups. Pronunciations below were obtained from installed `cmudict==1.1.3`, retaining stress. The first-pronunciation convention is the same independently frozen convention used in the earlier phoneme-class experiment. We now test the actual native outputs, not just a surrogate's statistics.

| Identical first ARPAbet pronunciation | Native GP words (zero-based indices; occurrences) | Minimum mismatches for any deterministic phone-to-rune word encoder |
| --- | --- | ---: |
| T UW1 | TO [16,3] ×24; TOO [16,3,3] ×1; TWO [16,7,3] ×1 | 2 |
| DH EH1 R | THERE [2,18,4,18] ×3; THEIR [2,18,10,4] ×2 | 2 |
| N OW1 | NO [9,3] ×1; CNOW [5,9,3,7] ×3 | 1 |
| F AO1 R | FOR [0,3,4] ×4; FOUR [0,3,1,4] ×1 | 1 |

The 40 selected native occurrences force at least **6 errors**, or at most 34/40 correct, even if the function can output arbitrary variable-length rune sequences, need not be injective and can be fitted directly on these controls. Proof: identical pronunciation inputs require an identical output; each output equals at most one distinct native rune word. The optimal output for each group therefore cannot exceed the most frequent native spelling. Allowing any listed pronunciation variant per occurrence still forces at least **4 errors**: TOO and TWO, THERE and THEIR, NO and KNOW each have only the identical single listed variant. Particularly strong source-local witness: TOO and TWO appear in the same sentence of solved LP1 LOSS OF DIVINITY, at zero-based native word indices 18 and 25, and have distinct rune sequences despite identical full stressed phoneme sequences. This obstruction is independent of how the 39 phones are mapped or merged into the 29 runes, so changing phoneme mergers cannot rescue exact calibration.

The native controls clearly preserve orthography beyond sound. A phoneme-only word encoder cannot exactly reproduce them even with known input text. An encoder conditioned on spelling, lexical identity, adjacent words, hidden state or explicit disambiguation side information escapes the theorem; these additions are not selected by the Rune Poem alphabet order. A genuine register change on unknown LP2 also remains logically possible. The existing [Futhorc source gate](lp2-futhorc-phonetic-map-gate.md) already finds no independently selected complete alternative phonetic alphabet; no new phonemic cipher/key sweep is justified.

[Exact native-control SFT](../sims/lp2_native_phoneme_homophone_gate_sft.cjs) executed against the exact repository JSON in connected JS; the nine dictionary fixtures were separately checked with actual local CMUdict 1.1.3. No Windows CI run is claimed. This is a new control obstruction, not a repetition of the prior doublet/word-shape/capacity experiments. Close the deterministic context-independent sound-register transfer at its native calibration gate, without asserting that phonemic unknown-page registers in general are impossible.
