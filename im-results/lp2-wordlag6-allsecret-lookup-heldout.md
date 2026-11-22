# All-secret six-back lookup: blind original-LP2 key recovery

**Agent 32, 11 November 2026. Bounded original-cipher negative, successful blind source-English key recovery on an independent true-key plant. No unknown LP2 plaintext or historical key recovered.**

## Source mechanism and its strongest assumption

The original ciphertext has 80/1,290 exact within-word lag-six affine echoes C[j]=24−2C[j−6] (mod29), unusually many under the previously reported fixed word-multiset null. A plausible direct explanation is that a runic plaintext symbol is shifted by a state determined by the visible rune six positions earlier in the same printed word.

This experiment gives that state **all 29 independent secret shift values**, without assuming the observed 24−2x formula or guessing the secret key:

    C[word,j] = (P[word,j] + f(C[word,j−6])) mod29  for j ≥ 6.

One fixed unknown function f is shared across the whole book. The first six runes of each word are unconstrained, and the sign can be absorbed into f. The source does not independently authenticate this architecture. The test explicitly assumes GP-native English on original printed word boundaries.

## Independent training and held-out original test

Read all 2,896 complete original printed words containing 12,956 rune symbols, carrying words over physical page boundaries. All 559 words with length at least seven contribute 1,290 six-back pairs, partitioned into exactly **645 training** and **645 untouched held-out** pairs by the first and last 1,448 words. Train an independent GP29 English word-suffix unigram model using 55,407 Shakespeare words; only reference positions six or later in words of at least seven GP runes are used.

The lag-six input for each encoded rune is already observed in the ciphertext. Consequently, the optimal shift f(x) for each of the 29 possible input runes is found **independently and exhaustively over all 29 modular shifts** by maximizing the external English-model score on the 645 original training pairs. Freeze the complete inferred function before evaluating held-out original data.

| Measure | Original training, fitted | Original held out, frozen | Original held out, key=0 |
| --- | ---: | ---: | ---: |
| Rune outputs | 645 | 645 | 645 |
| GP29 IoC | **0.039674515** | **0.034330011** | **0.034479272** |
| English-source mean log likelihood | **−4.01041034** | **−5.07593284** | **−5.07478699** |

The apparent training improvement disappears on unseen runes. The learned original key has no improvement over leaving the held-out ciphertext untouched, and no English-like rune distribution emerges.

## Exactly corresponding true-key natural-language challenge

An independent Shakespeare GP-English plant uses the actual original 2,896 word lengths, selecting real reference words wherever possible. The first six runes of each word are independently shifted. For all later runes, it uses one true hidden function f(x)=24−2x (mod29) as ciphertext-lag-six feedback. Its decoder is given neither that function nor the planted plaintext and uses the exact same first-half training rule as above.

| Blind positive-control measure | Result |
| --- | ---: |
| Secret lookup entries recovered from 645 training outputs | **24 / 29** |
| Held-out outputs | 645 |
| Held-out decoded GP IoC under learned key | **0.083056478** |
| Held-out source mean log likelihood under learned key | **−2.76607228** |
| Held-out IoC under known true key (post-test ceiling) | **0.086869854** |

The synthetic original-length control establishes substantial key recovery and English readback at the available sample size. Five rarely exposed table inputs are misestimated, but the remaining correct entries give a decisive language signal. The method is sensitive to its own proposed encryption architecture.

## Cryptanalytic decision

**Reject a stationary word-local six-back additive secret lookup as a direct native-GP decoder of original LP2.** This grants every secret table value and tests unobserved material after fitting, so it is a stronger attack than testing a few source-selected affine shifts. The six-lag ciphertext anomaly remains genuine as a reported count; the experiment does not identify its actual cause.

An exception would require an independently selected additional state change, transient collision repair, dynamic word key, novel plaintext register, or unpreserved word boundaries. Those are different cipher architectures and should not be invoked solely to rescue this key fit.

## Reproduce

The standalone CommonJS script is [sims/lp2_wordlag6_allsecret_lookup_sft.cjs](../sims/lp2_wordlag6_allsecret_lookup_sft.cjs). It reads only the committed original rune corpus/transcription and the pinned Shakespeare reference, asserts input contracts and both original/positive gates, and writes nothing. It passed the manual [GitHub Actions Windows Node22 run 43088058148](https://github.com/FlareZ123/liber-primus/actions/runs/43088058148) via the manual-only workflow agent32-wordlag6-lookup-manual.yml.
