# Word-conditioned original-LP2 nonlinear autokey: exact unknown-lag and key recovery on a plant

**Classification, 10 November 2026:** a three-way heldout original-ciphertext study of an explicitly finite conditional, *reversible* GP29 cipher, motivated by the unusually frequent word-internal lag-five and lag-six echoes. **No unknown original LP2 plaintext or authentic cipher state recovered.**

## Why word-local state matters

The source LP2 manuscript has 2,896 canonical whole words (including 32 physical-page-crossing words). Existing ciphertext studies find approximately 104 word-local lag-five identical runes, with an anomalous S-specific count, and 80 lag-six affine echoes. A true cipher may condition its state or lookup key on the *displayed* word-local position even if its previous ciphertext state continues across words. Previously tested whole-page or globally clocked autokeys do not directly test that distinction.

This experiment keeps all **12,956 original runes in their original order** and reproduces the exact canonical parser contract: a slash and physical page delimiter may occur within a word; dots, hyphens, and explicit non-rune punctuation separate words. Every rune has an ordinal \(j_i\) within its canonical displayed word.

For a candidate word-local lag \(d\in\{1,\ldots,10\}\), at positions with \(j_i\ge d\) and a predecessor on the same physical page, hypothesize

\[
P_i =
\begin{cases}
EA\quad(\text{GP index }28), & C_i=C_{i-1},\\
[\log_{15}((C_i-C_{i-1})\bmod29)-F(C_{i-d})]\bmod28,& \text{otherwise.}
\end{cases}
\]

Here \(F\) is an unrestricted map from each of the 29 previous ciphertext runes to any of 28 additive shifts; the unknown 29-entry table is independently fitted per candidate lag using exact count-grouped 28-shift maximum likelihood. The inverse encoder at eligible sites is deterministic and exactly reversible, since its key depends only on previously emitted ciphertext. **Outside eligible word sites, the experiment makes no assertion about the historical key or plaintext**.

All 28-symbol GP-English unigram likelihoods come exclusively from the committed independent Shakespeare control, with 218,800 encoded GP runes. Ciphertext-derived key fitting is confined to physical p0–13. Candidate lag selection occurs on **separate p14–27**, with no refitting on that set. Key tables are then refitted on p0–27 and assessed on entirely withheld physical p28–55.

## Executed original and synthetic results

| Experiment | Lag selected using validation p14–27 | Validation eligible symbols / score per symbol | Final p28–55 eligible symbols / score | Heldout IoC |
| --- | --- | --- | --- | --- |
| Original LP2 | **7** | **175**, −3.9304216 | **336**, −4.3936967 | **0.0357321** |
| Unknown-key synthetic GP-English source | **5**, true planted lag | **526**, −2.9440649 | **970**, −2.9453317 | **0.0600449** |

The original selected model yields a source score worse than independently random 28-ary output (−4.2426076 in this frozen language model) and a heldout IoC near \(1/28\), indicating no source-English plaintext. The training-set optimism is substantial: for original lag 7, the first fourteen pages could be fitted to score −3.0784 over only 209 samples, but this drops on independent material. Do not interpret the training peak as a decipherment.

**Positive test with genuinely unknown key material:** generate a full 12,956-rune source GP-English plant in the original canonical page and word shapes. A seeded random unknown 29-entry table \(F\) applies exactly when the displayed word has at least five preceding runes; every other within-page location receives a separate unknown random 28-ary pad. All page-first values are kept as initialization symbols. The resulting ciphertext has fully deterministic original-source-shaped layout, and the decoding family has no access to the planted table during its key fit.

The exact script recovered the **hidden lag 5 from ten alternatives**, and after fitting on p0–27 it recovered **all 29 of 29 secret table entries**. On the withheld pages, it recovered **976/976 eligible plaintext rune values**, including the six zero-step EA symbols, perfectly. The **970 nonzero-step recovered values** have GP-English IoC 0.0600449, close to the original control. The other 5,219 withheld rune positions were intentionally encrypted using independent pads and are outside this partial model's decryption claim. This validates a true unknown-key, unknown-lag partial inverse without asserting a whole-source plaintext solution.

## Reproducibility, scope and research decision

- [Exact canonical word parser, train/validation/heldout implementation](../sims/word_local_exponent_autokey.cjs).
- [Successful manual GitHub Actions run 42801009671](https://github.com/FlareZ123/liber-primus/actions/runs/42801009671), including independent full control regression.
- The input GP alphabet and original physical page runes are frozen in [the corpus](../resources/liber-primus/lp2-corpus.json); [the canonical transcript](../resources/lp2-transcription.txt) defines the displayed word boundaries.

This is a **finite conditional failure** of fixed, word-local single-predecessor-key lookup under a GP-English plaintext register. It does not exclude word-based multiple taps, hidden key clocks, a different source language, variable-length input, keyed resets, or a missing independent state. Source-visible lag-five echoes remain an unexplained, measurable anomaly. Given the exact negative heldout and strong positive recovery, additional exhaustive single-lookup lag scans at the same source register have diminishing value. Future tests should require an independently sourced key and a single mechanism predicting the lag5 S-specific hits, lag6 affine echoes and the cross-word anti-repeat simultaneously.
