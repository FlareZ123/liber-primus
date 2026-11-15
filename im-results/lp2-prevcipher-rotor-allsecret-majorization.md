# All-secret predecessor-ciphertext rotor: majorization exclusion on original LP2

**Decision (15 November 2026).** On the exact 12,956 original GP29 ciphertext symbols in 2,896 authentic words, no **stationary previous-ciphertext-rune-selected permutation alphabet** can directly reveal source-native English-like GP29 prose, even granting all 29 row permutations completely independent and secret. The bound is exact across the full secret-key family; three length-matched English controls exceed it by more than a factor of two. This is a bounded cipher-family exclusion, **not recovered plaintext, a creator-selected mechanism, or a key**.

## A finite reversible candidate suggested by the original text

The source has only **86 same-page adjacent identical ciphertext runes** in 12,901 opportunities, and an unusually word-local lag-five echo surplus. A player could reasonably explore **ciphertext-dependent substitution** as an alternative to a high-entropy external pad or a simple Vigenère key. Consider the simplest word-restarting self-synchronizing 29-alphabet rotor:

```text
For each intact printed word w:
    P[w,0]  = freely initialized / encrypted by another unknown rule
    P[w,j]  = T[ C[w,j-1] ][ C[w,j] ],  j=1,...,len(w)-1
```

Each row `T[x]` is any independently chosen permutation of the 29 Gematria Primus symbols. Every row is invertible. This model is substantially more permissive than a particular Caesar, affine, keyed Atbash, or fixed single-alphabet substitution. It uses the **previous ciphertext symbol** for state so decryption is self-synchronizing and preserves exactly the word boundaries a human sees. No authenticated Cicada instruction selects it, which is why the result remains supporting research.

## Exact full-secret theorem

Let `n(x,y)` count positions **strictly after the first rune of a whole printed word** where the preceding ciphertext rune is `x` and the current one is `y`. All 29×29 counts are fixed by original ciphertext, independently of every unknown key. Under any secret bijection `T[x]`, the multiset of output plaintext frequencies in row `x` is exactly the row's input frequency multiset.

For any (k\in\{1,\dots,29\}), the sum of the (k) largest **global** plaintext counts over those interior positions is bounded by

\[
  U_k=\sum_{x=0}^{28} \sum_{j=1}^{k} n_{x,(j)},
\]

where `n[x,(j)]` are the row counts sorted descending. This follows because any chosen global set of (k) plaintext symbols can absorb at most the (k) most frequent ciphertext values from each independent row. All 29 row assignments can align their top-(k) ciphertext bins to the same plaintext target set, so the bound is **tight** for each fixed (k). Testing every row permutation explicitly is unnecessary.

| Original-source fact | Exact number |
| --- | ---: |
| Whole printed words / GP29 glyphs | **2,896 / 12,956** |
| Word-interior current/previous ciphertext pairs | **10,060** |
| Maximum achievable count of any one output rune, (U_1) | **578** (5.7455%) |
| Maximum total count of any five output runes, (U_5) | **2,510** (24.9503%) |
| Maximum total count of any ten output runes, (U_{10}) | **4,602** (45.7455%) |
| Cross-boundary-inclusive 12,955-pair check (top 1 / top 5) | **716 / 3,146** |

The first glyph of every word is **completely unconstrained** by this calculation. The exclusion therefore cannot be escaped by retuning first-symbol initializations, choosing a hidden word-start seed, or relabeling the global GP alphabet while leaving the post-initial stationary rotor intact.

## Source-native controls and implementation checks

Use `sims/lp2_word_pages.cjs` to join exact printed word fragments across physical pages. Encode independent English from `resources/control/{gibran_prophet_58585,shakespeare_first300k,emerson_essays_2944}.txt` into **source-calibrated GP29** (`ING→NG`, `IO→IA`, `QU→CW`, `V→U`, `K/Q→C`, `Z→S`). At every one of the 2,896 **original word-length slots**, sample an independent native word of the exact same GP29 length. Seed xorshift32 with `0x33011234+7919*source_index` and draw 100 books per source. For each book calculate frequency sums only on post-initial runes (the same 10,060 positions).

| Control register, 100 length-matched books each | Observed most frequent rune | Sum of five most frequent runes |
| --- | ---: | ---: |
| Original all-secret bound | **at most 578** | **at most 2,510** |
| Gibran source-native GP English | 1,409–1,567 | 4,611–4,827 |
| Shakespeare source-native GP English | 1,400–1,592 | 4,595–4,859 |
| Emerson source-native GP English | 1,429–1,604 | 4,527–4,790 |

**0/300** whole-word-length-matched native-GP English books satisfy either original-source bound. The empirical control result is conditional on those reference texts and spelling rules, and must not be interpreted as an authorship p-value.

The executable **Node22 CommonJS SFT** also constructs an independent **29-secret-permutation-row** rotor, encrypts an entirely fresh 12,956-rune length-matched native-GP book with previous ciphertext state, then recovers every input exactly. It checks that the same mathematical majorization bound holds on planted correct-key plaintext. Thus the test rejects the original family because of its preserved row histograms, not an inability to implement or invert that family.

[Reproducible original-corpus and planted-positive SFT](../sims/lp2_prevcipher_rotor_allsecret_majorization_sft.cjs) · [Original corpus](../resources/liber-primus/lp2-corpus.json) · [Original whole-word parser](../sims/lp2_word_pages.cjs).

## Causal consequence, competing explanations and next experiment

The simple **static predecessor-symbol alphabet switch** has enough unknown key material to match arbitrary individual digrams, yet cannot concentrate any decoded rune sufficiently to resemble normal GP29 prose. The original near-flat bigrams carry too little concentration for a stationary one-back state to undo through mere relabeling. This is independent of key values, hand-selected English cribs, or repeated synthetic cipher scores.

A true source-justifiable encoder would therefore need at least one **new information-bearing degree of freedom**: changing rune alphabet with word-relative phase, looking farther back in cipher or plaintext history, a source-authenticated external key/state, or an alternate encoded register or word segmentation. Existing all-secret **page×five-phase additive ciphertext-feedback** and **fixed 256-table stationary selector** families have different exact exclusions; do not mislabel this word-reset predecessor-row theorem as excluding their surviving alternatives.

**Decision:** retire static one-back predecessor-selected permutation hunting and do not attempt (29!^{29}) key search. Look for a Cicada-authenticated state update or key derivation that predicts untouched plaintext. No unknown-page GP rune, authenticated source key, inverse, or final destination is recovered.
