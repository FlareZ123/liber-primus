# Native phonemic pre-rune rival: exact doublet-rate match, decisive distribution mismatch

**Decision, 22 November 2026 (Agent1, Director #2253):** A fully frozen, independently sourced **English phoneme-class control** drawn from authentic solved LP1 text and solved LP2 p57 produces virtually the *same* adjacent-equal rate as all 12,901 original unknown LP2 rune transitions. This shows the anti-doublet statistic alone cannot distinguish a sound-based source representation from cryptographic suppression. The same model fails independent word lengths, repeated-word inventory and exact original-cipher row-permutation information bounds. No creator-authenticated alternate phoneme encoding, unknown plaintext, key or actual decryption is discovered.

The reproducible [source-original Python SFT](../sims/lp2_phonemic_register_capacity_sft.py) ran successfully on [GitHub Actions 45019937493](https://github.com/FlareZ123/liber-primus/actions/runs/45019937493) with `cmudict==1.1.3` (first CMU ARPAbet pronunciation), a historical English-pronunciation convention. All original-rune counts are computed from the repository's [unmodified corpus](../resources/liber-primus/lp2-corpus.json) and [runic transcription](../resources/liber-primus/lp2-transcription.txt). The plaintext controls are exact, specified sections 1,3,6,10,14 of the [solved LP1 source](../resources/liber-primus/lp1-plaintext-reference.txt) plus solved LP2 p57. Six dictionary OOV tokens are excluded and reported, rather than assigned guessed pronunciations.

## Literal 29-class sound representation

ARPAbet has 39 distinct phones. The test freezes ten reasonable, but deliberately *non-authenticated*, phoneme mergers before any unknown-cipher analysis: `V→F, Z→S, ZH→SH, DH→TH, AO→AA, ER→EH, EY→EH, IH→IY, UH→UW, AH→AE`. The remaining 29 sound classes are mapped bijectively onto the 29 GP rune indices in lexicographic class-name order. The SFT verifies the class-level round-trip on the actual solved excerpt, **1,806/1,806** tokens. This is an exact inverse of the declared *phoneme-class* representation; the original 39-way phones and homophonic spellings cannot be reconstructed from the merged classes. The original GP29 symbols, especially TH/NG and vowel digraphs, motivate a sound-level rival, but the author has **never been shown to select** these particular ten mergers or a CMU pronunciation lexicon. Neither the 2013 rune chart nor the 2014/2016 signed text supplies such an instruction.

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

The two overall repeat rates are close for *this one fixed source slice* (absolute gap 0.00001795). This is a meaningful counterexample to the inference that extremely few equal neighbors require an explicit anti-repeat encryption step. The source has no publication-supported reason to undergo phonemic translation before encryption, and matching this **single** statistic cannot select a cipher, determine its key or make a linguistic plaintext appear.

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
