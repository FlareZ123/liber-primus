# GP29 prime/plaintext–ciphertext autokey: a complete compact grammar, no original plaintext

**16 November 2026, Agent8.** This is a bounded original-ciphertext negative, not a decryption. The exhaustive source-native experiment and all controls are in [the CommonJS SFT](../sims/lp2_gp29_prime_plaincipher_autokey_synth_sft.cjs), which passed unchanged on **Windows Node 22** in [manual CI run 43833968179](https://github.com/FlareZ123/liber-primus/actions/runs/43833968179). It contributes a concrete finite subgrammar to Director [Issue #1215](https://github.com/FlareZ123/liber-primus/issues/1215).

## Why this grammar was worth a finite experiment

The source GP alphabet pairs each rune index with an explicit prime value, while original LP2 shows a within-printed-word excess of five-back returns. The 2014 puzzle demonstrably used GP prime-weight operations elsewhere. Those facts motivate testing previous-rune and five-back prime-valued feedback as possible small, 2014-readable programs. **They do not supply an author instruction to select this program**, its key, or its state clock. The test is deliberately finite and avoids free 29! alphabets, pseudorandom pads, and a post-hoc mixture of arbitrary functions. A source-selected key remains the overarching bottleneck.

Exactly **2,349** programs use the reversible formula

```text
C[i] = (P[i] + s*f(P[i-d]) + t*g(C[i-e]) + k) mod 29
```

Each of the independently optional plaintext and ciphertext taps has nine choices: absent, or ± the preceding rune index/its actual GP-prime residue, at delay **1** or **5**. The constant k takes all 29 values. State before the start is zero; positions continue through original physical page boundaries within a chapter. Each program has an immediate sequential inverse and an 11.20-bit choice code. This finite family expressly **does not implement plaintext-F transparency, distinct keys by word, external pads or variable-length encoding**. It also does not assert that printed separators are plaintext spaces.

## Independent original and planted results

All source runes come from `resources/liber-primus/lp2-corpus.json`; no inferred spelling or correction is introduced. The selection input is the intact original **p0–p2, 729 runes**. Two **untouched** original visual chapters, **p8–p14 (1,729 runes)** and **p40–p53 (3,008 runes)**, are scored only after selecting 20 finalists by the opening chapter. The score is a fixed GP29 trigram log-likelihood trained on the first 200,800 runes of the pinned `resources/control/shakespeare_first300k.txt` after the project's GP spelling normalization. The final held-out Shakespeare passage supplies an independent authentic-language plant. All scores below are mean natural log-probabilities per GP rune; less negative is better.

| Input or decision | Score |
| --- | ---: |
| Raw original p0–p2 | −4.46440 |
| Raw original p8–p14 | −4.44825 |
| Raw original p40–p53 | −4.41807 |
| **Best of all 2,349** on original p0–p2 | **−4.24508** |
| That best program on p8–p14 | −4.40711 |
| That best program on p40–p53 | −4.44458 |
| Best *any* of training top 20 on p8–p14 | −4.36761 |
| Best *any* of training top 20 on p40–p53 | −4.39570 |
| **Actual clear** solved LP2 p57 PARABLE, 95 runes | **−2.47953** |
| Independent 729-rune Shakespeare plant | **−2.43939** |

The highest training model was `P[i-1]` with coefficient −1 and `C[i-5]` with coefficient +1, k=9. It reencrypts the exact original p0–p2 ciphertext, which is a mandatory implementation invariant and is **not** key identification. Its language score collapses on the two independently reserved chapters. All twenty training finalists stay far below the actual clear-GP or held-out GP-English controls.

A 729-rune **independent planted-control paragraph** was encrypted with a hidden-in-search mixed model: +GPprime(P[i−1]), −C[i−5], k=13. Running the **same 2,349-model exhaustive search** retrieved precisely that program at **rank 1 of 2,349**, decoded **729/729** original plant GP symbols, and reencrypted **729/729** ciphertext runes exactly. The held-out plant scores −2.43939. The clear original p57 score −2.47953 independently verifies that the scorer can recognize genuine short GP prose despite GP ligatures.

## Decision and exact scope

This complete, reversible, low-description-length **prime/plaintext–ciphertext additive autokey subgrammar does not decipher LP2**. Replacing this conclusion with an arbitrary new map, key schedule, or per-word exception would discard its finite scope. The result does not falsify other compact programs, F-transparent branches, section-dependent clocks, higher-order nonlinear gates, textual rather than GP-English plaintext, or a key emitted by an as-yet-missing historical artifact. Because the authentic manuscript provides no independent selector for these particular taps or k, their best search score cannot establish creator intention.

The next informative experiment should require an **independently source-chosen extra opcode or key object** before enlarging this grammar. Program-search rankings alone do not justify selecting a historical cipher.
