# LP2 wordwise 256-state pointer: key-independent capacity exclusion

**Original-input decision, 17 November 2026 (Agent 4, Issue #1329).** All **4,752** bounded deterministic cyclic-256 pointer configurations defined below fail the *same-length native-GP English* E-frequency necessary condition on the untouched **12,956 GP29 ciphertext runes**. The result grants an **arbitrary unknown 29-symbol permutation at each of the 256 pointer states**, much more power than any additive shift key from the p50 numeric table. It recovers **no original unknown plaintext or historical key**. Source-correct [single-file CommonJS reproducer](../sims/lp2_pdir_cyclic256_allsecret_capacity_sft.cjs) passed [Windows Node.js 22 CI #44198802801](https://github.com/FlareZ123/liber-primus/actions/runs/44198802801), including a complete genuine-English forward-and-backward plant.

## Causal premise and explicit model boundary

The 2016 Cicada-signed message says the book's words and numbers provide directions. The original p50 illustration contains a printed **32×8 = 256-cell** numeric table. A player could try using a printed word number to choose forward/backward key-pointer motion over that 256-cell tape. These observations *motivate* a 256-state direction-dependent receiver; no first-party instruction yet says to **wrap the pointer modulo 256**, reset its phase at every large source section, derive any one of the 66 specific sign rules, or decode GP29 by additive/substitution. Treat the test as a bounded exclusion of that executable conjecture, not as a claim about the author.

The external independently written [pointer-direction reference](https://github.com/pnotisdev/cicada3301/blob/main/work/kscreen/pdir_ref.py) and [66 registered original word-number direction rules](https://github.com/pnotisdev/cicada3301/blob/main/work/kscreen/dir_rules.txt) provide the rule labels and the **18 h/m/c** word-pointer conventions; the original [rule formulas](https://github.com/pnotisdev/cicada3301/blob/main/work/kscreen/signrules.py) identify which quantities are observable from printed current word length, position and preceding word ciphertext. Some extra original reference rules depend on *current ciphertext prime sums* and are not causally usable by an encryptor without another layer; the test generously includes them.

An exact source-section reset is fixed at the eight original delimiter groups of rune lengths

    [729,1145,1738,1894,1021,1433,1680,3316].

Within each group, the pointer starts at phase0, is advanced in **one of 66 source-number directions** or its negation, and is read modulo 256. Between words it makes **0, 1 old-direction, or 1 new-direction** extra moves (m=0/1/2). A backward word either reads immediately or first steps backwards (h=0/1). Its equality comparator may be previous emitted rune, previous rune in the same word, or last rune from an earlier backward word (c=0/1/2). For the deterministic update step, use either **exactly one step for every rune**, or **two steps precisely when the current observed ciphertext rune equals the chosen previous comparator**, one otherwise. Both are computed entirely from the observed ciphertext. Global phase shifts are just relabelings of the 256 states and cannot affect the bound. Neither model admits unobserved adaptive retries.

These choices give **66 × 2 directions × 18 h/m/c conventions × 2 deterministic equality-update clocks = 4,752** original-cipher models. The SFT derives all 66 direction rules by their documented formulas and asserts the complete original rune stream, all 2,896 printed words and eight exact source section lengths.

## Exact all-secret capacity theorem

For one fixed model, the source ciphertext and deterministic pointer rule fix the address **s(i) in {0,…,255}** at every original rune i, without knowing any secret key. Let H[s,c] count source ciphertext rune value **c in {0,…,28}** at fixed pointer state s.

Grant a secret **bijective GP29 substitution sigma_s** independently at every one of the 256 states, with prospective plaintext rune

    P[i] = inverse_sigma_{s(i)}(C[i]).

A given plaintext rune E must, at fixed state s, correspond to **one** source ciphertext glyph. Consequently, regardless of all 256 secret permutations,

    count(P=E) <= sum_s max_c H[s,c].

For two distinct plaintext runes E and O, their ciphertext preimages must also differ at every state, so their combined count is at most the sum of the two largest entries of each state's H[s,*], summed across states. These are deterministic, key-independent upper bounds. They also dominate the simpler additive GP29 key family P = C-K[state] for every possible 256-value secret key. This statement requires a *single stationary secret alphabet per pointer state*. Hidden extra state or a chapter-specific secret alphabet is outside the proof.

## Untouched original output versus independent English

| Quantity | Exact original result |
| --- | ---: |
| Unsolved original source runes | 12,956 |
| Canonical printed source words | 2,896 |
| Registered direction rules | 66 |
| Distinct deterministic pointer models examined | **4,752** |
| Smallest all-secret maximum E among those models | 941 |
| **Largest all-secret maximum E among those models** | **1,286** |
| Largest combined all-secret E+O capacity | 2,343 |
| Number of models admitting at least 1,397 E runes | **0** |

The highest E capacity, **1,286**, occurs for source direction C_cur_n, reversed orientation, h=1/m=2/c=0, and the observed-equality two-step clock. All 256 states are visited by that model. The lowest capacity model, A_cur_ws, h=0/m=2/c=1, original orientation, two-step clock, visits 159 states. The 1,286 ceiling is **111** below even the least E-rich control below.

Use the independent repository's original native-GP word encoder, including source-attested ING and IO rune forms, to measure **every contiguous window of exactly 12,956 runes** in the three already-pinned controls:

| Independent reference | Minimum GP29 E runes in any 12,956-rune window |
| --- | ---: |
| Gibran, *The Prophet* | 1,407 |
| Emerson, *Essays* | 1,482 |
| Shakespeare, first 300k source | **1,397** |

These are *defined finite corpus controls*, not a proof that every possible English author must write as frequently as those sources. The mathematical exclusion is exact **conditional on the specified ciphertext-to-plaintext family and the original-length native-English reference criterion**. A corpus with fewer E runes, non-native intermediate bytes, a separate output transposition, compression, inserted symbols or a later value-changing layer is outside the test.

### Source-native positive gate

The SFT selects genuine Gibran GP29 words in **each of all 2,896 original printed word-length slots**, splits them at the exact original eight source sections and applies a **causal** previous-cipher-word GP-prime-parity direction. Its secret 256-phase key is K[s]=(7s+11) mod29; its h=1/m=2/c=2/reversed/two-step convention is frozen. It enciphers every rune sequentially, deriving each following word's direction from *already produced ciphertext*. A second independent trace from the resulting ciphertext exactly decrypts and re-encrypts **12,956/12,956** plant runes; the plant contains **1,558 genuine GP-E** runes and its all-secret histogram correctly permits **1,882**. Thus the original-cipher bound does not mechanically forbid real English produced under the defined scheme.

## Fork for Issue #1329

**Retire:** Directly reused **cyclic 256-state** phase-zero-reset direction-guided GP29 additive keys, or *any* one stationary secret substitution alphabet for each of the 256 pointer states, with the 66 frozen word-number direction rules and deterministic no-extra-branch one-/two-step clocks. Searching the 256 table's secret bytes or its 29-rune projection cannot repair the all-secret E-capacity contradiction for these exact architectures.

**Still open:** The externally proposed *hidden* anti-repeat skip/coin branches, which make the pointer address depend on a latent choice; genuinely nonperiodic 581-library streams; independent source-section phases; a secret output alphabet that changes across sections despite a repeated pointer state; non-native/plaintext-register interpretations; and an independently sourced new operation. The ongoing **216-job source-original pointer-direction campaign** belongs to these broader models, and **is not superseded or rerun by this gate**. Its strict reducer requires all 216 successful shard artifacts before any whole-window decision.

This is a causal narrowing of a specific human-attemptable 256-table interpretation, with no unknown-page plaintext or independent Cicada destination. The next material advance requires a creator-visible key/clock or a complete original unknown-page decipherment.
