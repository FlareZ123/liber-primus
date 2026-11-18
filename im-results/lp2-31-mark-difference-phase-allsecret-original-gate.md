# Exact all-secret bound for LP2 mark-reset differential phase ciphers

**Classification, 18 November 2026 (Agent47): original-source, source-clock-conditional exclusion.** No unknown LP2 plaintext, genuine key or destination has been recovered. This report settles one potentially large family of 2014-playable decoders without guessing its secret alphabets: if the original 31 large punctuation events reset a GP29 first-difference cipher, and a fixed alphabet substitution is used for each *marked interval × local phase*, every phase period **1 through 25** has insufficient ciphertext frequency capacity to produce the degree of letter concentration found in any full-length window of three pinned English GP29 references. The 2013 DH23 and original 13/23-dot marks make period 23/13 concrete source-number candidates; the source itself does not instruct this cipher. An adaptive cipher, a changing plaintext register or different language remains open.

## Original observable facts and conditional cipher

The canonical original-image rune and ink census in [the 58-page LP2 corpus](../resources/liber-primus/lp2-corpus.json) and [the source-verified punctuation annotations](../resources/liber-primus/lp2-ink-annotations.json) supplies:

- **12,956** original unknown GP29 runes across physical pages 0–55.
- **31** large punctuation events on those pages, in printed order. The complete LP2 manuscript has **36** (five additional marks on solved pages 56–57), a possible but unproven pairing with the original p50 table's zero-bracketed 36 bytes.
- Split at exactly those 31 events: **32** intervals, **29** nonempty and three empty. The first rune of each nonempty interval is a completely free initial value. The remaining **12,927** within-interval runes have predecessor differences.

Test the following **conditional** reversible family, without choosing a key: for interval `s` and its zero-based local offset `i>0`, form `D[i] = (C[i]-C[i-1]) mod 29`. Let an independently secret **arbitrary GP29 alphabet permutation** `pi[s, (i-1) mod p]` decode `P[i] = pi(...)(D[i])`. Every interval starts its phase clock at zero immediately after the printed mark; `p` is a public period. To favor the hypothesis, each of the 29 first runes is permitted an entirely unconstrained plaintext value. The source shows dot counts 13 and 23, the signed 2013 worked DH uses modulus23, and earlier original magic squares use small periods; these facts motivate a bounded phase-clock question. They are not first-party instructions to use differences or substitutions.

**This family is much more permissive than a repeated base60/GP29 additive byte key:** it permits any one of `29!` independent invertible substitutions at every state. It includes arbitrary per-marker alphabet relabeling, reversal, affine shifts and any secret keyed 29-rune permutation in each phase. It assumes a fixed mapping on repeated visits to the same state, one output rune per input rune, and no unobserved skip, branching, or inserted/deleted symbols.

## Exact key-independent calculation

For each fixed `p`, count the original differences by state `(marked interval, local phase)` and GP29 symbol. Sort that state's 29 counts from largest to smallest. Add all states' sorted histograms by rank. This makes their most common symbols agree, then their second-most common, and so on. By the **rearrangement inequality** it maximizes the total equal-symbol pair count `Σ_j N_j(N_j−1)` over *every* combination of secret state-wise alphabet permutations. Give the 29 arbitrary segment-initial plaintext runes to the most populous rank, further maximizing coincidence. The resulting number is an **attainable exact upper bound**, not a sampled key guess, word score, or p-value.

Use the 29-rune normalized coincidence `29 × Σ_j N_j(N_j−1)/(12956×12955)`, which is 1 for uniform independent GP29 text. A candidate decoded text cannot exceed this mathematical limit under the stipulated family.

| Original segment-phase model | Maximum ordered equal-rune pairs | Maximum normalized IoC |
| --- | ---: | ---: |
| One fixed alphabet per marked interval, `p=1` | 6,112,530 | 1.056114 |
| Five local phases, `p=5` | 6,761,168 | 1.168184 |
| Thirteen local phases, `p=13` | 8,055,896 | 1.391885 |
| Twenty-three local phases, `p=23` | **9,356,296** | **1.616567** |
| Twenty-five local phases, `p=25` | 9,567,404 | 1.653041 |
| Twenty-six local phases, `p=26` | 9,887,410 | 1.708332 |

**All 25 individual periods 1–25** were calculated, not extrapolated from monotonicity. Each falls below the lowest native reference minimum; `p=26` is the first period in this tested family whose upper bound exceeds that minimum. A period-26 state alphabet is **not** thereby supported by an original clue or known plaintext.

For comparison, every contiguous **12,956-rune** window was enumerated in three source files, encoded with the repository's existing GP29 Runeglish normalizer, producing the following *minimum* normalized coincidence in each reference:

| GP29 English reference | Lowest 12,956-rune window ordered pairs | Lowest normalized IoC |
| --- | ---: | ---: |
| Kahlil Gibran, *The Prophet* | 9,993,046 | 1.726583 |
| Emerson, essays | 10,262,872 | 1.773203 |
| Shakespeare, first 300k | **9,704,196** | **1.676676** |

At source-suggestive `p=23`, the strongest conceivable secret-key inverse falls **347,900 ordered pairs below** even the weakest Shakespeare window. At `p=25` the gap is **136,792 pairs**. All 29 unconstrained first runes were assigned optimally to the plaintext letter most favorable to the hypothesis.

A planted full **12,956-rune** Gibran GP29 text was encrypted under an independently chosen, nonidentity invertible key in the same 23-phase marked-interval model, then decrypted and re-encrypted exactly at every position. Its true plaintext has **10,136,836** ordered equal-rune pairs and its *ciphertext's* independently evaluated all-secret upper bound is **13,784,694**, demonstrating that this gate can accept genuinely linguistic text produced by its own nominated reversible cipher.

## Decision and limits

Under this explicit model, adding or optimizing 31 marker-start keys, all `29!^{29p}` possible alphabet schedules, or the p50 36-byte bracket as phase-specific bijections **cannot produce a native-English-like GP29 output for any local period 1–25**. This includes the source-motivated 13/23 clocks. A broader cipher with latent event skips, genuine ciphertext-feedback state depending on more than `s` and phase, longer nonperiodic key, another output alphabet, different word boundaries, variable-length transport, or non-English native text remains viable. In particular this is **not** an inverse for the rare doublet or fifth-back effects, and should not be misread as evidence that the punctuation marks really are resets.

Preserve a source-selected new operation or authentic plaintext witness before investing in dependent mark-key guesses. No new original LP2 passage was deciphered.

**Exact reproducer:** [Windows/Node22 read-only CommonJS SFT](../sims/lp2_markseg_differential_allsecret_phase_capacity_sft.cjs); original-input, three reference-window and full reversible plant all **PASS** in [GitHub Actions 44210782810](https://github.com/FlareZ123/liber-primus/actions/runs/44210782810). Source inputs are committed JSON and reference text, with no fitted key, external download or ciphertext optimization.
