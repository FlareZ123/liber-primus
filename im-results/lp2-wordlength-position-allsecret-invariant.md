# LP2 word-length/position and independently page-keyed alphabet: all-secret exclusion

**11 November 2026, Agent1. Status:** a bounded, key-independent original-cipher negative. No unknown LP2 plaintext, authentic key, complete cipher mechanism, or continuation was recovered.

## Motivated reversible model

The authenticated 2016 instruction names LP's words, their meaning and their numbers. The canonical unknown transcript preserves exactly **2,896** words and **12,956** runes, while LP2's numeric page and the p15 Fibonacci-prime square offer candidate length/position selectors. A simple human-constructible implementation might give each **(whole word's rune length, zero-based position within that word)** its own keyed 29-way substitution alphabet. A stronger model gives every physical rune-bearing page its **own independent alphabet at every such coordinate**, allowing page-specific secret keys. This includes a source-derived deterministic offset, table-driven S-box, or even an **arbitrary secret permutation at each such coordinate**, with unrestricted ciphertext word order among words of the same length. Such a system is exactly reversible and consumes no additional per-word state.

**Weakest assumption:** the original plaintext remains in its GP29 spelling and the printed word lengths/positions survive encryption. Independent page keys are included; a key that changes *between words of the same length on the same page*, a cross-word transposition, or a different intermediate alphabet remains outside the family.

For any bucket `b=(length,position)`, let `n_b` be its rune count and `c_{b,r}` the count of original ciphertext rune `r`. A fixed secret bijection can relabel the 29 symbols but cannot change the number of equal pairs. Therefore every proposed plaintext must satisfy the **exact key-free invariant**

```
Q = [sum_b sum_r c[b,r] (c[b,r]-1)] / [sum_b n[b] (n[b]-1)]
```

The denominator and numerator are computed only over buckets with at least 20 positions and words of length at least 2. This **gives the model more freedom** by discarding sparse buckets and all 83 one-rune words.

## Original-input result

The standalone reproducer uses the repository's canonical word parser, original rune indices and 29-symbol GP alphabet. It independently checks the 2,896-word/12,956-rune input and the original bucket tallies.

| Original invariant | Value |
| --- | ---: |
| Distinct length-position coordinate buckets | 104 |
| Buckets with at least 20 observations | **65** |
| Original runes retained in the test | **12,563** |
| Equal ordered pairs across all retained buckets | **155,338** |
| Total eligible ordered pairs | **4,506,722** |
| Original conditional collision fraction `Q` | **0.0344680679** |

This is almost the uniform GP29 baseline `1/29 = 0.0344827586`, including after conditioning on the printed lengths and within-word positions. The observed result is **invariant to all 29! possible secret alphabet choices per retained bucket**, not merely to a particular Vigenere or prime key.

For native-language controls, convert each of three checked-in independent English prose sources to GP29 using longest GP tokens (including TH/NG/EO/OE/AE/IA/EA), with the stated K→C, V→U, Z→S and Q→C folds. Draw **400 seeded source-word samples per author**, replacing each original ciphertext word by an independently chosen genuine reference word with **exactly the same GP-rune length**. Thus all 1,200 controls retain the complete original 2,896-word length pattern and its corresponding bucket sample sizes. No source word-length bucket is missing.

| Independent native-GP register | Minimum control `Q` (400 draws) | Mean `Q` | Control draws ≤ original |
| --- | ---: | ---: | ---: |
| Gibran, *The Prophet* | 0.11606573 | 0.12235628 | 0/400 |
| Emerson, *Essays* | 0.10725312 | 0.11336949 | 0/400 |
| Shakespeare excerpt | 0.10727753 | 0.11168885 | 0/400 |

**No one of the 1,200 length-matched native-language controls matches the original's near-uniform within-bucket collision rate.** This is a finite original-source/three-author exclusion; the distributional comparison does not prove that every possible plaintext is English.

A synthetic positive-control ciphertext was generated from an independent Gibran length-matched GP sequence using **105 separately generated secret 29-way permutations**, one per observed (length, position) bucket including singleton words. The decoder recovered all **12,956/12,956** plaintext runes. Its bucket collision numerator and denominator remained **562,250/4,506,722** before and after encryption (`Q=0.12475808`), confirming that even unrestricted secret substitution tables cannot flatten the native length-position fingerprint.

## Stronger all-secret exclusion: a different alphabet on every page

The more permissive model assigns **a wholly separate unknown 29-symbol bijection to each (page, whole-word length, within-word position)**. This allows a fresh 29-letter alphabet on all 55 rune-bearing physical pages for every possible printed word length and position. The same equality-pair invariant holds, now comparing only *words on the same page*.

To avoid assuming how the cipher behaves across physical page turns, discard **all 32 words that cross a page boundary**. Keep a page-local bucket only if it contains at least three runes, allowing maximum freedom to the secret tables.

| Page-specific source invariant | Original value |
| --- | ---: |
| Entirely page-contained words | **2,864** |
| Eligible page × length × position buckets | **1,734** |
| Retained rune instances | **10,936** |
| Equal ordered pairs in those buckets | **2,840** |
| Total eligible ordered pairs | **82,188** |
| Original page-conditioned collision fraction | **0.0345549229** |

The same **1,200 length-matched GP-English control samples** were scored, with each sampled word retaining its original page and length. This imposes exactly the observed page-by-word-length counts.

| Reference | Minimum page-conditioned fraction (400 draws) | Mean | Controls ≤ original |
| --- | ---: | ---: | ---: |
| Gibran | **0.11279019** | 0.12269668 | 0/400 |
| Emerson | **0.10634156** | 0.11412390 | 0/400 |
| Shakespeare | **0.10405412** | 0.11182314 | 0/400 |

Every original page-specific alphabet is free. Even with this enormous freedom, none of the sampled native-language texts has a collision fraction close to the original. **The original value is invariant under all possible per-page secret permutations**, conditional on the fixed word boundaries and direct GP register.

**Robustness to the outstanding image-reading issue.** The largest (page, length, position) bucket has **21** original runes. Changing any single rune identity in such a bucket can increase its equal-ordered-pair numerator by at most `2×(21−1)=40`, even if the new glyph is chosen adversarially. The authoritative corpus notes **79 source-annotation/red-template disagreements** still pending image-first adjudication. If *all 79* proved to be wrong rune labels and could be corrected arbitrarily without changing word boundaries, an intentionally loose universal upper bound on the original page-conditioned collision fraction is

```
(2840 + 79*40) / 82188 = 6000/82188 = 0.0730033582
```

This remains below **every** length-matched native control (`minimum = 0.10405412`). Therefore ordinary transcription-label corrections in the entire disputed 79-position set cannot overturn this page-keyed exclusion. The bound does not cover changed word boundaries, deleted or inserted runes, or a different underlying plaintext register.

A second independent positive-control plant assigns a secret 29-way permutation to *each page × word-length × position bucket*, then fully encrypts and decrypts a **12,956-rune** native-GP sequence. The page-specific collision numerator and denominator are preserved exactly by construction, and the complete plaintext round-trip is checked by the SFT.

## Stronger independent p15 route: a 16-phase word clock on every page

The original p15 **4×4 Fibonacci-prime spiral** contains sixteen source-selected positions. The complete unknown LP2 corpus contains exactly **2,896=16×181** source-printed logical words. A plausible human choice is therefore a *sixteen-phase word clock*, rotating or indexing the substitution table once per complete original word. This is a much more permissive hypothesis than one fixed alphabet per page, and stronger than the already-documented global sixteen-lane substitution gate ([Agent37's independent whole-book screen](lp2-word16-lane-substitution-gate.md)).

Give **every (physical page, local complete-word ordinal modulo16, word rune length, within-word rune position)** a *different arbitrary unknown 29-way substitution permutation*. No relation between phases, pages, lengths or positions is assumed. The clock may restart at any page-dependent phase: this permutes each page's lane labels and leaves the key-free collision invariant unchanged. As above, discard all words spanning physical pages and all one-rune words. Include even low-sample buckets with only **two** original observations, maximally permitting independently secret per-lane tables.

| Arbitrary per-page/16-phase/length/position alphabets | Original |
| --- | ---: |
| Eligible strata containing ≥2 rune instances | **1,577** |
| Retained original rune instances | **3,327** |
| Identical ordered ciphertext-rune pairs within strata | **154** |
| Eligible ordered pairs | **3,866** |
| Exact phase16 collision invariant | **0.0398344542** |
| Largest single stratum | **4 runes** |

The independently seeded (`0x16f1b`) native-GP control draws retain **each original complete word length, page and local word-clock phase**, sampling 400 length-matched words sets per author. They give:

| Independent reference | Lowest Q across 400 draws | Average Q | At or below original |
| --- | ---: | ---: | ---: |
| Gibran | **0.09001552** | 0.12296301 | 0/400 |
| Emerson | **0.08535954** | 0.11405846 | 0/400 |
| Shakespeare | **0.08794620** | 0.11267589 | 0/400 |

The nearest of all **1,200** controls is still over twice the original's collision fraction. This is an exact **key-independent necessary condition**: no choice whatsoever among the 29! secret permutations in each observed stratum can change that fraction. A second source-native positive-control plant uses independent random 29-way secret permutations in *every phase16 stratum* and recovers all 12,956/12,956 control runes; the same 154/3866-style invariant holds for its own plaintext and ciphertext pair counts.

**Consequence:** the natural p15 sixteen-state *stationary word clock* cannot explain native GP-English plaintext, **even if each physical page, word length, and within-word position independently has its own secret alphabet in each of sixteen clock phases**. This does not disprove other clock lengths, message-dependent phase evolution, a freshly varying key on every word, different alphabet registers or changed original word boundaries. The 16-phase result has relatively few comparable original pairs and, unlike the per-page-only theorem above, is **not certified against arbitrary changes to all 79 disputed glyph identities**. It is conditional on the maintained original transcript.

## Decision

**Retire direct static substitution alphabets indexed only by printed word length and within-word position, even with independent page-specific secret permutations or a stationary sixteen-phase word clock**, including arbitrary per-page table entries, GP-prime offsets and any within-length permutation of the encrypted words, for plaintext statistically comparable to the three length-matched English registers. An unknown key within this entire static family cannot rescue the original observed histogram. Do not rerun direct word-length alphabet or fixed length-position Caesar sweeps.

**Open route to actual plaintext:** a viable direct substitution decoder must change its key in a way **not fixed by the sixteen-phase word clock and page/length/position coordinates**, introduce a different intermediate register, alter the source word-boundary contract, or derive an independent key/codec selecting one of those alternatives. The original cannot fix any particular state from this invariant. This result is a research constraint and is not an unknown-page decryption.

**Reproduce:** [standalone CommonJS SFT](../sims/lp2_wordlength_position_allsecret_sft.cjs), reading the already committed corpus, parser and three GP-English controls. Invoke with `node sims/lp2_wordlength_position_allsecret_sft.cjs` under Node 22.