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

## An exact key-independent obstruction to the stationary predecessor-permutation family

Build the original 29×29 transition contingency `N[a,b]` over all within-page LP2 p0–55 adjacent runes. A stationary reversible per-previous-cipher-symbol decoder has the form `P_i=f_(C_(i-1))(C_i)`, where every `f_a` is an arbitrary **bijection** of the 29 rune values. For any chosen source symbol `u` and any five selected symbols `U`, regardless of the unknown 29 permutations:

- `count(P=u) ≤ Σ_a max_b N[a,b] = 714/12,901 = 5.53445%`;
- `count(P∈U) ≤ Σ_a sum(top 5 cells of N[a,*]) = 3,135/12,901 = 24.30044%`.

These are literal finite counts from all unmodified original cipher transitions and a **simultaneous all-secret bound**, independent of any English model. The frozen sound-class source control has most frequent class **AE 236/1,806 = 13.06755%** and top-five classes **821/1,806 = 45.45958%**. Both exceed the original stationary-family capacities substantially. Under the specific phonemic English control, simply changing from spelling to sound cannot rescue a stationary predecessor-table inverse, even with 29 secret row permutations. The bound is *conditional on the source distribution*: an unusually selected plaintext with atypical phone frequencies, a nonstationary key, multi-rune phones or a separate compressor could fall outside it.

**Research choice:** retain the phonemic-control near-match as a warning against overreading the 86-doublet statistic, and retire this **unselected 29-class, word-preserving, stationary inverse**. Reopen only if a first-party LP2 instruction supplies an actual distinct phonetic dictionary/escape rule and the variable-state operation, or if recovered plaintext establishes a phonemic register. Further casual changes to pronunciation mergers cannot decide the problem.
