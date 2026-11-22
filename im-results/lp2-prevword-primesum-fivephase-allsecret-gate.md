# Previous-word GP-prime sum as a five-phase decoder key: complete all-secret original-input obstruction

**Agent20, 18 November 2026, Director Issue #1429.** This tests one concrete *causal numerical rekey* that jointly responds to source-visible five-dot artwork and the signed 2016 Cicada text saying "Its words are the map, their meaning is the road, and their numbers are the direction." Neither source explicitly prescribes this decoder. **Status: a reproducible finite-register, all-secret negative for ordinary native-GP English. No unknown plaintext or historical key recovered.**

## The motivating, completely reversible operation

Use all **2,896** original printed words and the original **12,956** GP29 ciphertext rune indices on physical LP2 p0–55, joining all 32 words carried across physical page breaks. The original page50 numerical grid remains outside the word stream, as in the canonical source. Historical GP primes are the canonical \`lp2-corpus.json\` values.

For word w, compute an *observable, causal* numerical state from the **previous ciphertext word**:

\`S[0] = 0; S[w] = (sum_{r in C[w-1]} prime[r]) mod 29\` for w>0.

Within word w, the phase is the literal word-local rune offset \`j mod 5\`. A proposed decoder with a wholly unknown secret bijection for **each of the 29 states × five phases** is

\`P[w,j] = inverse_sigma[S[w], j mod 5](C[w,j])\`.

The sender encrypts sequentially; the receiving solver knows \`S[w]\` from an already printed ciphertext word. Thus the encoder and decoder agree on the state without knowing plaintext or future words. This class allows every non-affine permutation of all 29 GP runes in each of **145 completely independent hidden alphabets**, so it contains simple additive shifts, custom key alphabets, and many other stationary state-lookup choices. The five phases do not need equal key values. No fitting of their tables is necessary to test the family.

It is a specifically proposed *word-sum-selected*, *five-phase stationary-state* model, not an assertion that a source symbol mandates that operation. A cipher whose state additionally depends on word ordinal, page, earlier plaintext, hidden nonce, or a longer arbitrary history lies outside this test.

## Exact keyless theorem and original source

For any two positions sharing the same observed **(previous-word numerical state, current within-word phase)**, ciphertext symbols are equal **if and only if** their plaintext GP symbols are equal: the unknown map at that state is a bijection. Therefore the total same-state equal-pair count

\`H = sum_{state,phase,symbol} n[state,phase,symbol]*(n[state,phase,symbol]-1)/2\`

is **exactly invariant under all (29!)^145 permitted secret choices**.

The *unchanged* canonical LP2 gives:

| Original-input quantity | Result |
| --- | ---: |
| Fully parsed printed words | **2,896** |
| Source GP29 rune positions | **12,956** |
| Occupied state×phase groups | **145 of 145** |
| Same-state/phase pairs | **657,106** |
| Same-state/phase equal-symbol pairs | **22,442** |
| Exact conditional collision rate | **0.03415278509098989** |

The result is approximately the uniform-alphabet value **1/29** despite the state being computed from the word immediately preceding the current word. It cannot be changed by selecting any of the secret bijections.

## Genuine source-native language control

Encode independently available Gibran, Shakespeare and Emerson into the historical GP29 native spelling, including **ING→ᛝ, IO→ᛡ, QU→CW, V→U, K/Q→C, Z→S**. Partition each text into authentic GP-native words. For **48 separately sampled word lists per source**, fill every original word slot with a source word of **exactly that rune length**, retaining the original entire 2,896-word length sequence and source-defined previous-ciphertext-state/phase group allocation. Fix the LCG seed to \`0x3301a14d\`; its state advances exactly once per word sampled. The comparison allows a completely unknown table for every one of the 145 groups.

| GP-English source | Controls | Minimum collision rate | Mean | Maximum | At or below original |
| --- | ---: | ---: | ---: | ---: | ---: |
| Gibran | 48 | **0.07037525148149613** | 0.07235581093461328 | 0.07383283671127641 | **0** |
| Shakespeare | 48 | **0.07129747711936887** | 0.07281755784708503 | 0.07461809814550469 | **0** |
| Emerson | 48 | **0.06902539316335568** | 0.07047157028952203 | 0.07188946684400994 | **0** |

The 144 exact source-length-matched controls have over twice the original conditional equality rate. Their empirical results are **not universal English impossibility probabilities**: the texts, register, language assumptions and source word segmentation are explicit. Nonetheless, the entire arbitrary-unknown 145-table cipher class cannot repair the collision mismatch to the tested native-GP prose model. It has no path to sustained authentic native-English plaintext by fitting more symbol-table keys.

### Exact reversible positive plant

An independent reference plant samples **12,956** authentic Gibran GP rune positions in the exact original word-length sequence. At each new word it computes the state from the **previous synthetic ciphertext word**, then encrypts every plaintext rune using its own secret affine 29-symbol permutation from the corresponding state and phase. The receiver derives those same causal states, inverts all selected secret alphabets, and recovers **12,956/12,956** source positions. The native plant's state-dependent collision-pair count and the encrypted output's count are **identical: 47,972 equal pairs among 662,236 eligible pairs**, proving the mathematical invariant under a real forward-and-backward implementation. The plant's eligible-pair denominator differs from the original because the states arise from its distinct ciphertext.

**Read-only Windows Node22 reproduction:** [single runnable original-input source test](../sims/lp2_prevword_prime_fivephase_allsecret_sft.cjs), using the unchanged canonical original transcript, GP29 table, and the three pinned English witnesses. All exact integers, control minima, complete source stream and full inverse plant are assertions.

## Decision

**Retire the precise 29-state previous-ciphertext-word-GP-prime-sum, five-word-phase stationary bijection decoder as a direct ordinary native-GP-English solution.** It is a source-motivated, fully reversible candidate capable in principle of flattening adjacent symbols while preserving fifth-apart equalities, and it permits all 145 secret permutations. Its state-conditioned collision structure on original ciphertext contradicts the relevant native-language controls regardless of those secret permutations.

This test says nothing about a nonstationary word-number-driven pad, external keystream, changing word boundaries, higher-order word history or concealed key material. The visible five-dot motif and signed 2016 wording still lack an **authored state-update instruction or actual key**. Future effort should first identify that missing input, ideally from the original artifact or authenticated historical stage, and then require a held-out original page plaintext prediction. A fresh GP prime-sum variant with additional arbitrary resets would simply evade the tested invariant by introducing new unsourced keys.
