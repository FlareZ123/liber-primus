# Reused page-local GP29 pad: source-original, key-free recovery gate

## Research question and exact models

As a direct attempt to recover unknown plaintext without knowing a historical key, treat the 55 rune-bearing unsolved LP2 physical pages as independent ciphertexts whose local rune positions reuse a secret GP29 keystream. This is the classic many-time-pad weakness applied to original page geometry:

- **M1:** `C[p,j] = (P[p,j] + K[j]) mod 29`, with completely arbitrary unknown key values at all `j=0..276`, reset at every physical page.
- **M2:** `C[p,j] = (P[p,j] + K[j] + S[p]) mod 29`, allowing an additional arbitrary secret Caesar offset for every physical page.

Page-reset reuse is a hypothesis, not an authenticated Cicada instruction. These two models are valuable because, if true, they expose the unknown plaintext using the 55 encrypted pages as mutual controls and require **no recovered external secret**. The stronger M2 pair test even removes both the unknown arbitrary key and all consistency constraints on page salts. It is therefore a discriminating direct attack rather than a stream-key catalog sweep.

The original source is `resources/liber-primus/lp2-corpus.json`, precisely pages p0–p55 excluding the rune-free p50, **12,956 runes**, with **55** input rows, maximum 277 runes per row and no synthetic page ordering. Source-native letter frequencies are estimated from the editor-normalized solved LP1 text `resources/liber-primus/lp1-plaintext-reference.txt` and the actual clear LP2 p57 runes. The reference yields **3,074** GP29 runes from **768** Latin words whose orthography supports a direct GP29 greedy mapping, plus the p57 clear source. Unsupported English spellings are dropped rather than remapped speculatively. Each of the 29 rune frequencies receives pseudocount 0.5.

## Original-cipher evidence and independent power checks

### M1: fivefold blind actual plaintext recovery

For each page-holdout fold `p mod 5`, train 277 fully independent key residues `K[j]` by maximizing native-GP unigram log likelihood over the other 44 pages. Decode **only held-out physical pages** for the reported score. Each held-out rune has never contributed to its key estimate. There is no key-period, phase or dictionary optimization.

- Authentic untouched LP2: held-out mean log likelihood **−4.284478** nats/rune over all 12,956 held-out runes, with fold values near **−4.23 to −4.32**. This is essentially the untouched ciphertext baseline of **−4.288704**.
- Independently planted reusable page pads: **six** deterministic source-shaped native GP29 controls each use the exact original page lengths, contiguous independently sampled solved-source GP29 plaintext and a fresh shared random 277-rune pad. Each fully held-out score is **−2.9432 to −2.9561** nats/rune, near the actual native plaintext values **−2.94 to −2.95**.
- Independent random-per-rune pads on the same six plaintext samples yield held-out scores **−4.2403 to −4.2918**, close to the authentic original.

The candidate reusable page pad is directly exploitable on positives using a blind, completely source-independent maximum-likelihood key; it yields no unknown original plaintext and no credible original key.

### M2: arbitrary secret page salts removed algebraically

For any two original pages `p,q`, at every common local position `j`:

`C[p,j] − C[q,j] = (P[p,j] − P[q,j]) + (S[p] − S[q]) (mod 29)`.

The *entire* secret, aperiodic shared key `K[j]` disappears. The convolution of the source-native letter frequencies with its inverse defines a fixed 29-symbol difference distribution. For each original pair, score all 29 possible Caesar differences and report the **best** likelihood. Critically, this grants **each** of the 1,485 page pairs an independently optimal relative salt, so it is strictly more favorable to M2 than enforcing globally consistent 55 page salts.

- Original LP2: **−3.365063** average best log likelihood per paired rune over **311,132** aligned rune pairs.
- Three independent planted M2 samples with the same original geometry, shared aperiodic pads and *fresh arbitrary secret page salts*: **−3.33838 to −3.33908**.
- Three independent nulls with independent per-rune pads: **−3.36480 to −3.36522**.
- Uniform 29-symbol difference baseline: `−ln(29) = −3.367296`.

M2 originals remain indistinguishable from the null under a generously overfitted necessary-condition screen. The salts cannot rescue the model without altering its within-page position clock, input register or plaintext distribution.

## Decision and exact limitations

Both source-original trials reject **a single position-indexed additive pad reused across all physical pages** as a receiver for ordinary GP29 English, with or without one arbitrary per-page additive salt. In M2, the pairwise test is independent of the *values*, *period*, or *source* of the 277 secret keystream symbols. The result gives a useful reason **not** to hunt longer secret keys for this fixed page-restart architecture.

This is a finite rejection, not recovered unknown plaintext. An independently keyed pad per page, altered page clocks, rank28 skipping, nonlinear state, F-transparent bypasses, another language/register, or a source-selected changing pad remain open. The positive samples take contiguous solved-English GP29 spans and preserve the actual original *page lengths*, while not enforcing original printed-word boundaries. The hypothesis is not selected by a first-party source clue. The screen assumes GP29-native output and conventional additive arithmetic.

## Reproduction

Read-only Node.js 22 CommonJS SFT: [`sims/lp2_reused_pagepad_manytime_source_sft.cjs`](../sims/lp2_reused_pagepad_manytime_source_sft.cjs). It loads only committed source files, trains the M1 recovered key on disjoint pages, computes the key-independent M2 pairwise difference bound, plants six fixed-source positive/null families and asserts separation. No external downloads, learned secret, CLI arguments, or CI writes are required.

The SFT uses only `workflow_dispatch` through the existing [manual read-only runner](../.github/workflows/manual-readonly-commonjs-sft.yml). The exact committed SFT **passed** the original-source Windows Node.js 22 manual workflow [run 44072806761](https://github.com/FlareZ123/liber-primus/actions/runs/44072806761), independently of the earlier direct V8 original-corpus calculation. The source data, finite original decisions, and planted controls are preserved in the SFT.