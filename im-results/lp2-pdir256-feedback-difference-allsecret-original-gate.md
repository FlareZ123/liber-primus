# Word-number pointer and ciphertext-feedback difference: all-secret original exclusion

**Decision (17 November 2026, Agent 4; Director Issue #1329):** The exact all-secret exclusion for the original rune register has been extended to the independent, source-plausible **ciphertext-feedback difference** register. Across **4,752** printed-word direction/pointer models and **three** predecessor-reset conventions, **14,256 original-input receiver combinations**, even an independently arbitrary unknown GP29 substitution alphabet at every one of the 256 pointer states cannot attain the full 29-symbol coincidence concentration of any same-length native-English reference window. The Windows Node22 [single-file original-input SFT](../sims/lp2_pdir256_feedback_difference_allsecret_sft.cjs) passed [CI #44203347748](https://github.com/FlareZ123/liber-primus/actions/runs/44203347748), including complete causal encryption and exact decryption of 12,956 actual English-control GP symbols. **No new unknown plaintext, authentic key or author-selected operation recovered.**

## Source clue and precise unsupported premise

The p49–51 original source contains a **32×8=256-cell** numerical table, and the genuine signed 2016 hint speaks of words and numbers giving direction. The original ciphertext's unusually low rate of repeated adjacent runes makes a cipher keyed relative to the preceding **ciphertext** symbol a plausible operation. Earlier independent work discovered a word-local six-back affine echo and connected its numbers to a signed 2013 DH worked example; it also demonstrated that a particular overwrite-style repair is *not injective*. These clues motivate testing an actual **reversible** ciphertext-feedback rule.

No surviving original first-party instruction states that this particular 256-state cyclic pointer or feedback operation encrypts LP2. This is a bounded architectural exclusion, not a complete solve.

## Decoder and exact all-secret theorem

For each of the **66** independently published word-number direction rules, both orientations, all **18** word-pointer h/m/c conventions and **two** deterministic observed-ciphertext-equality clock updates, compute every phase s_i modulo256 **from the original ciphertext C**. This gives **66×2×18×2=4,752** source-phase-zero-reset histories, preserving all eight canonical original sections, **2,896** complete printed words and **12,956** GP29 symbols.

Compute the GP29 difference D_i = (C_i − preceding C) mod29 under three separate fixed predecessor scopes: (**a**) whole-book continuous, resetting to zero only at the very beginning; (**b**) source section reset at each of eight authentic section beginnings; and (**c**) each printed word reset to zero at each of 2,896 starts. The candidate decoder is an **unknown invertible GP29 substitution of D_i at each phase s_i**. This strictly includes all cyclic256 ciphertext-feedback additive keys: forward C_i=(preceding C + P_i + K[s_i]) mod29, and arbitrary stationery secret phase-dependent substitution alphabets, including any table-derived phase function.

For any of the 14,256 fully observed receivers, let h_s(j) be the j-th greatest source-difference histogram bin count at phase s. Set N_j=sum_s h_s(j). By **rearrangement inequality**, aligning each state's 29 local histogram bins in the same descending order simultaneously maximizes the dot product between all pairs of states, and thus **exactly maximizes decoded whole-book plaintext IoC** over **all 29! possible bijective GP29 secret alphabets at each of 256 phases**:

    IoC_max = [sum_(j=1..29) N_j*(N_j−1)] / [12956*12955].

This is a mathematical optimum, not a guessed key or sampled shift. Unlike the earlier direct-cipher register bound, the histogram here uses **ciphertext predecessor differences** and retains the **original raw ciphertext** for every pointer equality/skip test. There is no leakage of hypothetical plaintext or secret phase during construction. A pure output position permutation leaves IoC unchanged and cannot evade it.

## Original source versus complete native-English reference windows

| Original public-ciphertext register | Maximum IoC over 4,752 models and all secret phase alphabets | Highest possible ordered equal-rune pairs | Maximum single-symbol E count for its maximal-IoC model |
| --- | ---: | ---: | ---: |
| Book-continuous predecessor difference | **0.053424105981603** | **8,966,968** | 1,295 |
| Eight-section-reset difference | **0.053400727266314** | **8,963,044** | 1,294 |
| 2,896-word-reset difference | **0.053232405282541** | **8,934,792** | 1,299 |
| **Least concentrated native-GP English control** | **0.057816420842613** | **9,704,196** | At least 1,397 E (independently minimized) |

The highest book-continuous and section-reset envelopes occur for direction GP_cur, orientation reversed, h=1,m=1,c=1, observed-equality two-step clock. The best word-reset model uses E_prev_n3, h=0,m=1,c=2, normal orientation and observed-equality two-step clock. **All** 14,256 models fall below the least concentrated actual English reference window, by at least **737,228 missing ordered equal-symbol pairs**, even with the strongest possible secret substitution assignment.

The reference is exhaustive over *every overlapping source-native GP29 window of exactly 12,956 runes* in the pinned texts: Gibran *The Prophet* minimum IoC **0.05953735405134**, Emerson *Essays* **0.06114494457922**, Shakespeare first 300k source **0.05781642084261**. The GP transliterator handles the accepted digraph and non-Latin GP spellings. The code tests the actual source text, not a shuffled or simulated LP2 ciphertext. No claim is made that every possible natural-language passage must exceed the reference threshold.

## Full-length causal positive plant

Take authentic GP-encoded Gibran words and place them into all 2,896 original word-length slots, retaining the authentic eight sections. Use a genuine 256-cell secret additive key K[s]=(7s+11) mod29 and the **causal previous-cipher-word GP-prime-sum parity direction** A_prev_G with h=1,m=2,c=2,reversed orientation, observed-equality two-step clock. Emit each ciphertext rune C_i=(previous emitted ciphertext rune *in that word* + plaintext GP rune + K[s_i]) mod29. The phase pointer advances only after the ciphertext symbol is already known, so the direction and conditional clock can be reproduced from the completed ciphertext, without seeing its plaintext.

Recomputing every public pointer phase and the word-reset difference D from the output exactly recovers **12,956/12,956** planted GP-native English runes. Re-adding each phase's original secret key reconstructs every exact source difference rune. The plant's genuine GP IoC is **0.060708672967163**, below its calculated maximum over unknown secret phase alphabets **0.076450186356482**. This controlled encryption has a distinguishable true positive and proves the original all-secret obstruction is specific to the actual unknown original ciphertext.

## Decision fork

**Retire:** All 4,752 word-direction pointer histories **with stationary one-alphabet-per-cyclic256-state decoder** for (a) direct observed GP29, already proved in [the parent result](lp2-pdir-cyclic256-allsecret-capacity-original-gate.md), and now (b) ciphertext-feedback GP29 difference with book-global, section-reset or word-reset predecessor scopes. No independent secret 256-table key, 256-cell-classification derived selector, or smaller pointer period dividing256 can rescue the original registers in those same frozen pointer histories.

**Unexcluded:** Unobserved phase-changing coin/anti-repeat decisions, a dynamic inner state, a nonbijective code, a phase or output alphabet changing across sections, different source-reset rules, an independently named external key, lossless insertion/removal whose locations are recoverable from source instructions, non-GP intermediate payloads, or native prose with substantially lower overall coincidence than every measured reference. The running independent **216-shard original word-direction campaign** tests a broader hidden mechanism and **must not be rerun or prematurely reduced**.

The intended 2014 human solution still requires a **first-party clue selecting a full reversible original-cipher mechanism** and actual plaintext, rather than new searches for secret cyclic256 alphabets inside the now excluded receivers.
