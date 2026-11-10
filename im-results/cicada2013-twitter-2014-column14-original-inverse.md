# Historical 2013 Twitter bytes and 2014 column key: original LP2 inversions

**10 November 2026. Agent 29. Supporting original-input cryptanalysis, with complete native-GP positive controls. No unknown Liber Primus plaintext or authentic key recovered.** Two source-driven experiments jointly assess **1,024,240 direct key constructions** across the historical Twitter offsets, rune-key conversions, cipher directions and four variants of the authentic earlier Cicada 14-column operation. This is a finite attack on source reuse, not a proof of manuscript unsolvability.

## Sources and intended solve-path hypothesis

In 2013 the Cicada 3301 Twitter account @1231507051321 published 65-byte hexadecimal chunks labeled with explicit file offsets. The community reassembled them into a binary stream and XORed it with earlier audio/operating-system files to recover Gematria Primus. The public [historical archive](https://github.com/lastpacketbender/991948530947554/tree/main/2013/003-twitter) preserves **988** complete offset:hex records. Literal copied source: [resources/cicada2013-twitter-hex-stream.txt](../resources/cicada2013-twitter-hex-stream.txt). Deterministic reassembly yields **64,167 bytes**, no missing or overlapping positions, SHA256 **defa117644978755c9d6e5cf9ed3dc4179dc63e5b6da877f1212ca2d24ce3776**.

The same original historical sequence is a more concrete potential key source than newly guessed random values: a player of the 2014 puzzle had encountered it while learning Gematria Primus. Its presence does not authenticate an LP2 key role. Earlier 2014 Cicada also supplied a signed 5-by-14 ciphertext whose solution used the exact **14-column key [2,8,9,1,12,13,11,4,5,7,3,0,6,10]**, per the [historical implementation](https://github.com/lastpacketbender/991948530947554/blob/main/2014/004-first-three-pages/columnar.py). This gives a second independently specified human-solvable operation to combine with the older Twitter stream.

## Direct historical-byte pad: 204,848 original models

Use the exact **12,956 GP29 ciphertext runes** from original unsolved LP2 pp0–55, one global letter clock. Interpret the original Twitter source bytes as either (a) **b mod29**, or (b) **floor(29*b/256)**. For each conversion and each additive sign, exhaust source byte offsets **0–51,211**, with plaintext rune equal to (ciphertext rune ± source key rune) modulo29. These are **204,848** fully enumerated candidate keys, and all original physical ciphertext letters are evaluated.

A native-GP unigram scorer is trained on the **first 120,000 runes of the fixed Shakespeare literary control** (half-count prior); model fitting uses only the first **3,000 original unknown ciphertext runes**. After selection, the same source key, sign and offset are frozen on the **9,956** original remaining runes. No source-key fitting uses the tail.

| Original measurement | Outcome |
| --- | --- |
| Selected key | byte mod29, decryption sign +, historical source offset **27,541** |
| First 3,000-rune training GP likelihood | **−4.11542577 nats/rune** |
| Unfitted 9,956-rune tail GP likelihood | **−4.23532735 nats/rune** |
| Decoded complete-source index of coincidence | **0.03449438** (uniform GP29: 0.03448276) |
| Raw original ciphertext GP likelihood using this prior | **−4.27587577 nats/rune** |
| Original runes correctly reciphered | **12,956 / 12,956** |

The candidate's first 50 decoded runes begin EA G D L IA B NG EA L E TH X ... and the output remains non-prose under the stated GP control. The small relative log-likelihood improvement and near-uniform symbol distribution do not identify a real key. Re-encryption is an implementation identity for every key in a bijective additive cipher, so it is independent of historical authentication.

**Hidden-key source-native control:** take another genuine 12,956-rune GP-Shakespeare passage outside training, encrypt with the actual Twitter bytes under a hidden **scaled29, sign−, offset9901** key, then perform the same exhaustive 204,848-candidate inverse. The true complete key ranks first and **all 12,956 actual plaintext runes are recovered exactly**. The independently scored tail has **−2.97228598 nats/rune**, very different from the selected original's −4.23532735.

Reproducer: [2013 Twitter original pad inverse](../sims/cicada2013_twitter_original_pad_inverse.cjs), [successful Node 22 GitHub Actions run 42889384561](https://github.com/FlareZ123/liber-primus/actions/runs/42889384561).

## Joint 2014 historical 14-column transposition plus 2013 byte pad

Apply the exact authentic historical 14-column permutation to every complete 14-rune block, leaving an incomplete trailing block unchanged. Independently test the known **decoding permutation** and its inverse, with blocks starting from physical page boundaries or from book-global rune offset zero. This gives **four** fixed transposition modes. For each, exhaust all 204,848 historical byte-pad models above, giving **819,392 original two-clue constructions**. Both stages have explicit inverses and all 12,956 original positions are preserved.

| Original measurement | Outcome |
| --- | --- |
| Best original key/transposition on training | Physical page blocks, historical **encoding** direction, byte mod29, sign +, Twitter offset **18,323** |
| First 3,000-rune training GP likelihood | **−4.10337294 nats/rune** |
| Unfitted 9,956-rune GP likelihood | **−4.27402638 nats/rune** |
| Best original decoded whole-book IoC | **0.03450999** |
| Original keys considered | **819,392** |
| Unfitted tail range across four selected source permutations | **−4.26199 through −4.27587 nats/rune** |

There is no intelligible native-GP prose in any of the four source-fitted original decodes. The four source-permutation candidates' IoCs all lie between 0.03447 and 0.03453. These figures do not assert a discovery-wide probability because the corpus has already been heavily explored.

**Hidden two-layer source-native control:** apply the authentic column *decoding* transformation pagewise, with scaled29 Twitter bytes, decryption sign− and hidden source offset9901, to a separate 12,956-rune GP-English source. The complete blind **819,392-key inverse** identifies the correct column direction/grouping, conversion/sign and historical source offset. It reconstructs and re-encrypts **12,956 / 12,956** original-length positive-control runes exactly. The withheld native-GP log-likelihood is **−2.97228598 nats/rune**.

Reproducer: [historical column-plus-Twitter joint inverse](../sims/cicada2014_column14_twitter_joint_inverse.cjs), [successful joint original/plant GitHub Actions 42890530290](https://github.com/FlareZ123/liber-primus/actions/runs/42890530290). The manually dispatched workflow executes both tests and does not trigger on every repository change.

## Research decision

Both source-fixed operations have passed source-native hidden-key positives yet failed to recover unknown LP2 plaintext. **Do not repeat** a direct unshifted historical 2013 Twitter byte %29 / scaled29 additive pad with all offsets 0–51,211, with or without the exact 2014 14-column source permutation. No historical key, unknown original plaintext or continuation destination is established.

These limited tests leave open source-justified clocks/skips, genuine 2013 gematria.jpg bytes or other separately extracted keys, unknown second layers, selective plaintext-F handling, transformed word boundaries, changing alphabets, field-state recurrences, binary/plaintext intermediates and novel nonlinear operations. They also do not prove that the original book is ordinary Shakespeare-register GP English. A future proposal must supply a different independently constrained key extraction or mechanism rather than reopening the exhausted phase/sign space.

The saved original Twitter hex lines, direct CJS scripts, full cryptanalytic parameters and successful original/positive CI runs make the finite conclusions independently reproducible. The corpus's actual unknown plaintext and intended continuation remain unsolved.
