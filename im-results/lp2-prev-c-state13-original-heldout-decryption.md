# Original LP2 13-phase, predecessor-conditioned GP29 plaintext-recovery attack

**Agent10, 17 November 2026. Classification: independently held-out, attempted plaintext attack with source-native positive; negative for this fixed global cipher architecture. No unknown LP2 plaintext/key/destination recovered.**

## What original clue permits an actual decoder?

The published page artwork repeatedly uses large **13-dot punctuation**, and the unsolved pages have only **86/12,901** within-page adjacent repeat events. A plausible but *unconfirmed* 2014 construction is a shared, changing alphabet controlled by a 13-step counter and the **previous ciphertext rune**. Unlike the already failed 13-period GP28 *rank/exclusion* rule, the present model permits an independent **29-way Caesar shift for every one of 29 previous glyphs at every phase**, **377 wholly unknown shifts**, and maps *all 29 plaintext runes* without deleting/correcting doublets.

This is a bounded exploratory decoder, not an author-selected model: neither the dot mark nor the manuscript instructs this specific state transition. It earns only one original attempt, requiring an independent held-out plaintext prediction to justify further key work.

```text
Original sender:    C[i] = (P[i] + K[(i mod 13), C[i-1]]) mod 29
Recoverer:          P[i] = (C[i] - K[(i mod 13), C[i-1]]) mod 29
Clock:              i counts all actual rune positions, resetting on each
                    physical page; each page's first rune is an unmodeled IV.
Secret:             arbitrary shared 13×29 integer shifts K in [0,28].
```

The source is **all original 12,956 LP2 unknown runes**, 55 rune-bearing pages and **12,901** within-page predecessor transitions. Cross-page word continuations and all 86 original doublet events are preserved. No plaintext crib, original rune, secret key or page boundary is altered.

## Blind original key recovery versus held-out controls

Train all 377 shifts solely from labeled *training ciphertext pages* by maximizing the real canonical GP29-English **unigram** log-likelihood of each candidate inverse. GP29 reference frequencies are source-independent, obtained from the pinned 62,492-rune Gibran control with additive count5 for each rune, including original LP1/p57-authenticated `ING→ᛝ` and `IO→ᛡ` single-rune spelling instead of the insufficient inventory-label-only encoder. The earlier naive-label readout gives similar qualitative negative results but is superseded here. See [source orthography](../results/lp1-source-orthography.md). Each shift is selected from all **29** candidates; no manually selected offset, guessed English sentence, partial key, or source-fitted alphabet is supplied. Freeze the entire learned key, then decrypt and score the **disjoint held-out physical pages**, which did not contribute to any shift selection.

A true instance should exhibit an **out-of-sample gain** under the source-native English distribution because it reuses the same 377 shifts across pages. A 377-parameter model can fit uniform ciphertext in-sample by accident; training likelihood is **not evidence**.

**Calibrated source-native positive.** Use independent actual Gibran GP29 prose to construct a second 55-page manuscript matching **every original page length**, encrypt with one fixed pseudorandom **13×29 shift table** unknown to the training algorithm (seed `0x33011313`, xorshift32), and preserve the original first rune of each page as the IV. An exact decoder with the withheld true key recovers all **12,901** planted modelled runes without error; the same blind learned-shift algorithm achieves substantial held-out improvement, without accessing the true key.

| Original page train/held-out split | Train / held-out transitions | Original blind GP log-likelihood gain, nats/rune | Identical decoder on genuine-GP-language synthetic secret-key plant |
|---|---:|---:|---:|
| Even-index pages / odd-index pages | **6,314 / 6,587** | **−0.00827959** | **+1.15003441** |
| First 28 pages / remaining 27 | **6,733 / 6,168** | **+0.04519705** | **+1.11583432** |
| Odd-index pages / even-index pages | **6,587 / 6,314** | **+0.00155222** | **+1.19001672** |

For the primary alternating split, the original training inverse attains −3.37920 nats/rune, while **held-out original decoded** remains −4.17253 versus **held-out original undecoded** −4.16425. The large gap is a direct signature of a 377-secret-state **in-sample fit with no generalizable original plaintext**. The plant achieves held-out −3.02894 versus undecoded −4.17898, confirming that the identical inference can detect and substantially undo a genuine keyed model under this original-page budget.

This new experiment reaches actual blind key estimation and out-of-sample original decryption, with a large genuine-source positive, rather than just a synthetic forward/reverse test. It does **not** claim mathematical exclusion of every 13-phase cipher, every GP register, page-varying secret, non-additive 29×29 substitution, different clock, or an outside supplied key. The model's 13-phase and additive restriction have no authenticated selector, so do not build further variant chains from its negative.

## Decision and reproduction

**Retire the single *shared physical-page-reset 13-phase / previous-cipher-rune / 377 additive GP shifts* model as an ordinary native-GP-English plaintext decoder.** Training learns no original key that predicts fresh pages. Genuine plant results show the attack has practical power for this precise family. Further changes require an independent original clue selecting a new clock/operator or a materially different source plaintext register; random search over additional periods should not follow this exploratory result.

Reproducer: [read-only Node22 source-exact SFT](../sims/lp2_prev_c_state13_holdout_original_sft.cjs); original input: [canonical page-index corpus](../resources/liber-primus/lp2-corpus.json); pinned native language reference: [Gibran control](../resources/control/gibran_prophet_58585.txt). Orthogonal direct 13-phase **rank28** exclusion (not the 377-state additive model) is in [the existing rank28 report](lp2-rank28-period13-allsecret-original-gate.md).
