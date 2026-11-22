# LP2 p54 red-nine / p50 degree-nine reverse or forward chapter clock: original holdout

**Agent8, 22 November 2026. Original-cipher decision: negative for the named terminal-state model. No new plaintext, author-selected key, or complete cipher found.**

## Why this was worth a real inverse

The source-original p50 32×8 base60 table factors over GF29. One exact factor is the monic primitive degree-nine polynomial with ascending coefficients

`F(X)=[11,15,0,9,1,5,10,20,12,1]`.

The original physical p54 opens with exactly nine red GP29 runes, indices

`[24,19,21,23,27,2,14,10,19]`.

This provides one **visibly motivated nine-symbol checkpoint** for a nine-stage linear-feedback stream. The existing [forward red9 LFSR test](../sims/lp2_p54_red9_grid_factor9_lfsr_sft.cjs) begins at p54 and tests p54-body/p55, without recovering plaintext. A distinct reversible prediction is that the red nine tokens are **the ending state of the preceding chapter**, p40–p53. This is a conditional hypothesis: no first-party author instruction specifically identifies p54 red9 as a terminal state or chooses an additive GP29 cipher.

Use the exact original table factor and its recurrence:

`K[n+9] = -Σ(j=0..8) F[j]K[n+j] (mod29)`.

Since `F[0]=11` and `11^(-1)=8 (mod29)`, the recurrence is **invertible backward without guessing any missing initial state**. Place the source-visible red9 at key positions 3008..3016 and solve backward for the preceding 3008 key symbols. Re-encode forward to the original red9; this is an exact full-length checkpoint. The target is the untouched consecutive 14 physical pages p40 through p53 (3,008 original runes), chosen as the immediately preceding visual chapter and with no page cuts or hidden clock advances. Reverse orientation of the red9 is also tested as a frozen two-case alternative, with no arbitrary phase fitting.

## Direct original-cipher consumer and exact controls

Decode `P_i = C_i ± K_i (mod29)` for the original order and reversed red-nine state. The original chapter has GP29 IoC **0.0345426274862201**. All four decoded original streams stay near a flat GP29 register:

| Terminal red-nine orientation | Decryption sign | Original decoder IoC |
| --- | ---: | ---: |
| Source order | minus | 0.034373695 |
| Source order | plus | 0.034412612 |
| Reverse order | minus | 0.034482042 |
| Reverse order | plus | 0.034366399 |

The naming here describes **plaintext = ciphertext ± key**, whereas the implementation's `sign` names the equivalent encryption direction, so inverse signs swap when reading its diagnostic array. The direct outputs have source-native Gibran GP29 unigram negative log likelihood **4.16–4.28 nats per rune** and no recognizable English stream. Two exact controls include the original solved p57 GP29 plaintext tiled to 3,008 symbols and a genuine source-native Gibran passage; both are encrypted and decrypted exactly, and the state is re-created backward and forward without error. The direct result is a bounded original-input failure of this frozen schedule, not a formal exclusion of every possible GP29 linear stream.

## More generous learned 29-symbol substitution, original untouched holdout

To avoid prematurely excluding an unprinted mapping between numerical LFSR states and GP29 shifts, the **second experiment grants an arbitrary 29-element key-symbol-to-shift map**. It actually permits repeated shift outputs, a strictly more flexible class than a simple unknown permutation. A 29×29 maximum-likelihood table is fit from each state symbol's original ciphertext distribution. The independent GP29 English unigram distribution is fixed from Gibran. **Training:** exactly original pages p40–p46, 1,863 runes. **Holdout:** original pages p47–p53, 1,145 runes. Each of the 29 state-symbol shifts is selected on the training pages alone. Unseen original ciphertext plays no role in the inferred map.

A stringent authentic-language positive control encrypts **3,008 unedited Shakespeare GP29 plaintext runes** under a randomly shuffled, secret 29-symbol bijection with the *same source red9-to-chapter key schedule*. All **29 / 29** secret shift assignments are recovered from the training ciphertext alone and all **3,008** plaintext runes are recovered exactly. The resulting Shakespeare native GP29 negative log likelihood is **2.97949 training / 2.95663 holdout nats per rune**.

### End-rubric initial-state alternative

The **same nine red rune symbols can be a key printed after its ciphertext**: treat them as the initial forward LFSR state for the entire earlier chapter. This independently motivated temporal direction avoids assuming the red title encodes a terminal state. No forward-mode evidence is selected from the original ciphertext. Under the same permissive 29-symbol learnt map and exact original train/holdout partition, native English remains absent:

| Supplied initial red-nine orientation | Original train NLL | Original heldout NLL | Distinct fitted shift labels |
| --- | ---: | ---: | ---: |
| Source red9, forward on p40–53 | 3.772504 | **4.104822** | 18 of 29 |
| Reversed red9, forward on p40–53 | 3.772193 | **4.230321** | 19 of 29 |
| Shakespeare source-native encrypted controls | 2.979492 | **2.956626** | 29 of 29 |

Every source-native Shakespeare planted control under either forward key recovers the entire secret 29-shift map and all plaintext exactly. This extends the original negative to both physically readable clock directions without a guessed key offset.

The corresponding original-input results:

| Original p54 terminal-state direction | Original training NLL | Untouched original holdout NLL | Distinct fitted shift labels |
| --- | ---: | ---: | ---: |
| Source | 3.795015 | **4.165591** | 20 of 29 |
| Reversed | 3.802501 | **4.134856** | 18 of 29 |
| Genuine Shakespeare encrypted control, either orientation | 2.979492 | **2.956626** | 29 of 29 |

Every actual GP29 key symbol occurs at least **51** times in training and **25** times in holdout, so every state has observations in both sets. The language-trained map fits random-looking original training symbols slightly better than the holdout, but the *entire untouched test portion remains >1.17 nats/rune worse* than the genuine English positive. The original produces no authentic recovered words or promising decoded sentence, including when the printed rubric is treated as a later-supplied initial state.

**Decision:** retire both p54-red9-backward-terminal and p54-red9-forward-initial chapter clocks with direct additive or any *fixed* independently learned 29-way state-symbol additive GP29 mapping. This is a stronger exclusion than the previously tested immediate forward nine-state key. It does **not** exclude a source-revealed different seed, a hidden nonlinear state advance, a non-additive alphabet, independently specified skip logic, non-English plaintext, or true ciphertext permutations/transpositions. A new independent source instruction is required before extending this branch. An increased search over arbitrary unseen checkpoint choices is not warranted by the original clues.

**Reproduction (Node22 CommonJS, Windows):**

- [Exact inverse and original direct four cases](../sims/lp2_p54_red9_p50_n9_reverse_chapter_sft.cjs)
- [Arbitrary learned 29-shift map and genuine untouched chapter holdout](../sims/lp2_p54_red9_reverse_n9_allsecret_holdout_sft.cjs)
- [Windows action: original direct PASS 44975449950](https://github.com/FlareZ123/liber-primus/actions/runs/44975449950)
- [Windows action: direct + 29-label holdout](https://github.com/FlareZ123/liber-primus/actions/runs/44975585418)

Both standalone programs read unchanged source JSON, recompute the p50 factor and source-red9 checkpoint, and require no configuration or local file writes.
