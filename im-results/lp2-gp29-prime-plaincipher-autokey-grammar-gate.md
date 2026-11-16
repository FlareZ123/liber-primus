# Two complete compact GP29 prime-autokey grammars: original-source negatives

**16 November 2026, Agent8; Director [Issue #1215](https://github.com/FlareZ123/liber-primus/issues/1215).** Neither of two fully executable short GP29 programs recovers a single authenticated unknown Liber Primus line. The stronger variant transfers the real solved-p56 **transparent plaintext-F rule** and rejects **1,300 of 1,305** compact automata on original ciphertext *without language scoring*. Its five surviving key programs are self-cancelling **identity decoders** and yield the original encrypted runes unchanged. The weaker standard alphabet-wide variant uses statistical scoring and also fails on two untouched chapters. Both are complete finite-family results and do **not** establish the historical cipher or exclude a richer source-selected mechanism.

All source runes are unchanged entries of `resources/liber-primus/lp2-corpus.json`. Original selection consists of physical **p0–p2 (729 runes)**. Held-out chapters **p8–p14 (1,729 runes)** and **p40–p53 (3,008 runes)** are untouched during program choice. The original opening's byte-wise rune-index SHA-256 is `7878349fef98939f6c816d657547e7e80f1b875d83b28e239c328e67b26159c7`. The held-out original hashes appear in the SFT output.

## Why this finite family was tested

The authentic 29-symbol GP alphabet has an explicitly printed prime weighting, historically used in earlier solved Cicada operations; the original unsolved book also has a supported within-word five-back rune echo excess. Those are concrete motivations for prime lookup, delayed previous-symbol feedback and mod29 arithmetic as *human-readable candidate* instructions. **They do not prove a Cicada-selected cipher, key, reset rule or plaintext-F transfer for unknown LP2.** This experiment avoids an unconstrained 29! table search and free kilobyte-long key streams. It is a reusable finite subgrammar with a decisive source-original result, rather than a continuation of independent pure-IoC sweeps.

The common family of forward programs is

```text
C[i] = (P[i] + plaintext_tap + ciphertext_tap + k) mod 29
```

The previous-symbol `plaintext_tap` can be absent, plus or minus the preceding GP index or its authentic GP prime residue. The `ciphertext_tap` can be absent, plus or minus a preceding original ciphertext GP index or prime residue at delay one or five. All missing initial-state taps contribute zero and all clocks run across each selected visual chapter without resets. The constants `k` exhaust 0…28. The two variants differ in the treatment of F, whose GP index is zero.

## Result A. Authentic transparent-F version: exact algebraic reachability gate

[Source CJS](../sims/lp2_gp29_ftransparent_prime_autokey_reach_sft.cjs) · [successful original-input **Windows Node22** CI run 43835399132](https://github.com/FlareZ123/liber-primus/actions/runs/43835399132).

The exact solved-p56 transfer rule is implemented literally: a plaintext `F` emits ciphertext `F` **without going through the additive operation**. A *non-F* plaintext rune can still produce ciphertext `F` through the encryption formula. The inverse therefore branches on every ciphertext `F` and excludes plaintext `F` from every consuming branch. The only plaintext-dependent state is the immediately previous plaintext rune, so a precise 29-state dynamic program determines whether any legal inverse exists, without a dictionary or language model.

The source-defined grammar has **five** plaintext-tap choices, **nine** ciphertext-tap choices and **29** constant shifts, giving **1,305** complete programs (**10.350** bits of program choice). On intact original p0–p2:

- **1,300 / 1,305 have no full inverse** under the stated F-transparent rule. They fail by rune offset **480** at the latest, with median impossible prefix **38** and 95th percentile **219**.
- Exactly **five** survive all 729 original runes. Their only valid input-decoding behavior is **P=C**, for this entire source and both untouched chapters. Four of the five pair **+f(P[i−1])** with **−f(C[i−1])**, or vice versa, under k=0, with f identity or the GP-prime residue. The fifth uses no feedback and k=0. Because each surviving machine starts with P=C and has zero additive net feedback when this equality holds, the identity continues inductively for every rune. All five therefore leave the unsolved source encrypted. No original plaintext is recovered.
- All five survivors reencrypt **729/729**, **1,729/1,729**, and **3,008/3,008** original runes, a property inherent to the trivial identity and not cryptographic authentication.

A genuine nonidentity **F-transparent** positive independently demonstrates that the 29-state gate and a separate full Viterbi inverse handle its ambiguous ciphertext-F branches. A held-out 729-rune Shakespeare GP passage was encrypted with **+GPprime(P[i−1]) − C[i−5] +13**, respecting plaintext-F transparency. The plant had **19 literal plaintext Fs** and **53 ciphertext Fs**, including **34 encrypted non-F zeroes**. A GP trigram Viterbi search chose the exact **729/729 plaintext runes** and literal F positions and reencrypted exactly. The original clear LP2 p57 paragraph independently scores as recognizable GP English. This positive is *synthetic* and has no historical-key implications.

**Interpretation:** A program consisting of one previous-plaintext GP index/prime tap, one delay-1/5 preceding-ciphertext index/prime tap, a constant rotation and the solved-p56 F bypass cannot decrypt the unknown opening. This is a **hard original ciphertext reachability exclusion** for precisely those 1,300 programs. It says nothing about alternative clocks, multirune plaintext state, key streams, word-level state, missing symbols, paragraph-specific algorithms or an external authentic instruction.

## Result B. Ordinary 29-symbol additive version: English-score gate

[Source CJS](../sims/lp2_gp29_prime_plaincipher_autokey_synth_sft.cjs) · [successful original-input **Windows Node22** CI run 43833968179](https://github.com/FlareZ123/liber-primus/actions/runs/43833968179).

Here all GP runes, including F, enter the affine operation. Both plaintext and ciphertext taps independently have nine choices: absent or the signed index/prime value at delay **one or five**. Across all 29 shifts this yields **2,349** fully reversible programs (**11.198** bits). These deliberately differ from the actual p56 F-transparent cipher.

Search ranks the intact 729-rune opening by a fixed GP29 trigram model trained solely on the project's preserved Shakespeare reference, with the final held-out 729 English runes reserved for a planted-control passage. The top 20 programs on p0–p2 are evaluated unchanged on the two original withheld chapters. Scores are mean natural logarithmic likelihood per GP rune; less negative is better.

| Input or decision | Mean trigram log probability |
| --- | ---: |
| Unmodified original p0–p2 | −4.46440 |
| **Best of 2,349**, p0–p2 | **−4.24508** |
| The winning opening model, p8–p14 | −4.40711 |
| The winning opening model, p40–p53 | −4.44458 |
| Best *any* training-top-20 score, p8–p14 | −4.36761 |
| Best *any* training-top-20 score, p40–p53 | −4.39570 |
| Genuine clear GP **p57 PARABLE**, 95 runes | **−2.47953** |
| Independent GP-English 729-rune plant | **−2.43939** |

The best opening scorer is `−P[i−1] + C[i−5] + k=9`; its language score falls on untouched chapters, and it never approaches original clear GP English. The same exhaustive 2,349-model search on a 729-rune Shakespeare GP plant encoded under **+GPprime(P[i−1]) − C[i−5] +13** recovered that exact planted program at **rank 1/2,349**, with **729/729** plaintext symbols and exact ciphertext re-encryption. This establishes calibration of the fixed search within its stated family, without recovering any unknown LP2 rune.

## Decision for subsequent decipherment

Both bounded routes are complete and lack a source-selected nontrivial key/program. The F-transparent algebraic exclusion is stronger than another fitted IoC comparison, because it eliminates most of a fully specified family on the original source independent of any assumed language. The five legal survivors are a useful caution: **exact roundtrip plus full original reachability may still yield a self-cancelling identity transform**.

An actionable successor requires an original-source instruction that fixes a **different** state operation, key material, or feedback clock *before* ranking on ciphertext. The two experiments **do not** eliminate truly different compact F-transparent automata, state from authentic punctuation/marks, ciphertext-dependent segmentation, or recoverable high-entropy keys. Do not treat the 3,654 explored models as an estimate of the size of all possible historical designs.
