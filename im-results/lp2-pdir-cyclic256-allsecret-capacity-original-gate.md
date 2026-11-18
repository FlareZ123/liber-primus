# LP2 wordwise 256-state pointer: key-independent capacity exclusion

**Original-input decision, 17 November 2026 (Agent 4, Issue #1329).** All **4,752** bounded deterministic cyclic-256 pointer configurations defined below fail the *same-length native-GP English* E-frequency and **complete unigram coincidence majorization** necessary conditions on the untouched **12,956 GP29 ciphertext runes**. The result grants an **arbitrary unknown 29-symbol permutation at each of the 256 pointer states**, much more power than any additive shift key from the p50 numeric table. It recovers **no original unknown plaintext or historical key**. Source-correct [single-file CommonJS reproducer](../sims/lp2_pdir_cyclic256_allsecret_capacity_sft.cjs) passed [Windows Node.js 22 CI #44198802801](https://github.com/FlareZ123/liber-primus/actions/runs/44198802801) (E bound) and [CI #44201716817](https://github.com/FlareZ123/liber-primus/actions/runs/44201716817) (stronger exact all-secret coincidence majorization), including a complete genuine-English forward-and-backward plant.

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

### Exact whole-alphabet concentration bound (stronger)

The single-letter E bound might be evaded by an unusual English passage with few Es. A stronger, label-free invariant gives the **largest possible decoded GP29 unigram index of coincidence over every possible choice of all 256 secret permutations**. Sort the **29 ciphertext histogram counts** for each state independently in descending order, obtaining values h_s(1) >= ... >= h_s(29). Let N_j = sum_s h_s(j). Then the maximum plaintext coincidence numerator is exactly

    max_over_all_secret_state_permutations sum_p count(P=p)*(count(P=p)-1)
        = sum_{j=1}^{29} N_j*(N_j-1).

**Proof:** Expand sum_p count(P=p)^2 into within-state terms plus twice all between-state dot products. Rearrangement inequality says every between-state dot product is bounded above by aligning both histograms in descending order. This upper bound can be simultaneously achieved for all pairs of states by choosing every state's secret alphabet so its sorted counts land on the **same ordered plaintext rune labels**. The linear subtraction of N, which is fixed, preserves the optimum. This argument is finite, exact, does not assume English character frequencies or posit E specifically, and covers every one of 29! secret alphabet choices per state. It bounds the **overall ciphertext-to-plaintext concentration**; GP29-native English controls supply a necessary conditional reference criterion.

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
| **Greatest possible all-secret plaintext IoC among 4,752 models** | **0.05238023800295** |
| **Least native-English control-window IoC** | **0.05781642084261** |
| Number of original models capable of matching the least control IoC | **0** |

The highest E capacity, **1,286**, occurs for source direction C_cur_n, reversed orientation, h=1/m=2/c=0, and the observed-equality two-step clock. All 256 states are visited by that model. The lowest capacity model, A_cur_ws, h=0/m=2/c=1, original orientation, two-step clock, visits 159 states. The 1,286 ceiling is **111** below even the least E-rich control below. The strongest exact **29-symbol coincidence** upper bound is a *different model*: `E_cur_n3`, h=1/m=2/c=1/reversed/two-step, with all-secret maximum pair-count numerator **8,791,760** and IoC **0.05238023800295**. The smallest native-control 12,956-rune window has pair-count numerator **9,704,196**, a strict gap of **912,436 same-symbol ordered pairs**. This is an exact incompatibility for a native-control-shaped plaintext under every state-alphabet permutation, irrespective of whether E or any other particular rune is frequent.

Use the independent repository's original native-GP word encoder, including source-attested ING and IO rune forms, to measure **every contiguous window of exactly 12,956 runes** in the three already-pinned controls:

| Independent reference | Minimum GP29 E runes in any 12,956-rune window | Minimum GP29 IoC over all such windows |
| --- | ---: | ---: |
| Gibran, *The Prophet* | 1,407 | **0.05953735405134** |
| Emerson, *Essays* | 1,482 | **0.06114494457922** |
| Shakespeare, first 300k source | **1,397** | **0.05781642084261** |

These are *defined finite corpus controls*, not a proof that every possible English author must write as frequently as those sources. The mathematical exclusion is exact **conditional on the specified ciphertext-to-plaintext family and the original-length native-English reference criterion**. A corpus with fewer E runes **and a sufficiently flat overall rune-frequency histogram**, non-native intermediate bytes, a later value-changing transform, compression, inserted symbols or a different plaintext alphabet may fall outside the test. A **pure output transposition** (a permutation of rune positions) cannot help, because the whole-unigram coincidence index is itself invariant under such a transposition.

### Source-native positive gate

The SFT selects genuine Gibran GP29 words in **each of all 2,896 original printed word-length slots**, splits them at the exact original eight source sections and applies a **causal** previous-cipher-word GP-prime-parity direction. Its secret 256-phase key is K[s]=(7s+11) mod29; its h=1/m=2/c=2/reversed/two-step convention is frozen. It enciphers every rune sequentially, deriving each following word's direction from *already produced ciphertext*. A second independent trace from the resulting ciphertext exactly decrypts and re-encrypts **12,956/12,956** plant runes; the plant contains **1,558 genuine GP-E** runes and its all-secret histogram correctly permits **1,882**. Its true native-GP coincidence is **0.06070867296716**, below the plant's corresponding exact maximal secret-alphabet coincidence **0.07581415899361**. Thus both mathematical upper bounds permit a genuine independently encrypted native-English source under the defined scheme.

## Independent signed-DH23 quadratic-character direction (Agent42, 18 November 2026)

A distinct, narrowly motivated word-direction rule uses the signed 2013 Cicada worked Diffie–Hellman modulus **23** and the signed 2016 hint that word numbers provide direction. Take the Gematria-prime sum of either the preceding or current ciphertext word; use its quadratic-residue character modulo 23 to choose key-pointer direction, assigning the zero residue either sign. Euler's criterion computes the nonzero sign as `sum^11 mod23`, equal to 1 or 22. The **Legendre interpretation is an analyst hypothesis**, without first-party text asking for quadratic residues.

An original-input exact-capacity test enumerates the two word selectors × two zero policies × two direction orientations × 18 h/m/c pointer conventions × two observed-equality update clocks, totaling **288** additional source-section-reset, deterministic cyclic-256 histories. Every candidate grants **all 256 arbitrary secret bijective GP29 alphabets**, with exact histogram majorization rather than a guessed key. The maximum original **plaintext GP29 IoC is 0.05192326872093524**, below the fixed minimum **0.057816420842613** in the three complete, equal-length native-English comparison corpora. The largest possible plaintext E count across this family is **1,265**, below the minimum **1,397** in the same references. The maximizing IoC history uses the *current* word sum, zero→negative, h1/m1/c1, normal orientation and observed-double-step clock. A separate causal preceding-cipherword source-shaped 12,956-symbol known-p57 plant encrypts and decrypts **12,956/12,956** correctly; its full forward reconstruction also matches exactly.

**Decision:** This quadratic-character **cyclic256 stationary-state receiver** cannot directly reconstruct any of the pinned same-length native-English reference distributions from the original ciphertext, regardless of its hidden state alphabets. The source does not authorize the quadratic-character operation, and the result supplies **no authentic plaintext**. It does not test the 216-shard noncyclic key-library campaign, hidden retry/coin states, section-specific alphabets or other plaintext registers. [Exact CJS SFT](../sims/lp2_pdir_legendre23_allsecret_original_sft.cjs) · [Windows Node22 CI PASS #44235388481](https://github.com/FlareZ123/liber-primus/actions/runs/44235388481).

## Fork for Issue #1329

**Retire:** Directly reused **cyclic 256-state** phase-zero-reset direction-guided GP29 additive keys, or *any* one stationary secret substitution alphabet for each of the 256 pointer states, with the 66 frozen word-number direction rules and deterministic no-extra-branch one-/two-step clocks. This conclusion now follows from **both a named-letter upper bound and the stronger exact 29-symbol majorization invariant**. Searching the 256 table's secret bytes or its 29-rune projection cannot repair the all-secret E-capacity contradiction for these exact architectures.

**Still open:** The externally proposed *hidden* anti-repeat skip/coin branches, which make the pointer address depend on a latent choice; genuinely nonperiodic 581-library streams; independent source-section phases; a secret output alphabet that changes across sections despite a repeated pointer state; non-native/plaintext-register interpretations; and an independently sourced new operation. The ongoing **216-job source-original pointer-direction campaign** belongs to these broader models, and **is not superseded or rerun by this gate**. Its strict reducer requires all 216 successful shard artifacts before any whole-window decision.

### Consequence for **every deterministic 256-cell table selector**

The proof does not require the key to be additive, secret text, a repeating byte sequence, or even taken directly from the printed table. For any **arbitrary deterministic function** of the tested 256-state pointer phase, whether that function selects an original grid cell value, its first/second numeral, one of 32 rows, one of eight columns, a hidden secret rune, a source-conditioned substitution matrix or any smaller family of stationary bijective GP29 alphabets, the resulting decoder is already contained in the family granting **all 256 independent secret permutations**. Thus the exclusion also covers every pointer-period length dividing256 (1,2,4,8,16,32,64,128), with identical source word direction and pointer-update conventions. No further search over such a key or per-index table-derived stationary alphabet can repair the exact 0.05238 IoC ceiling.

This inference does **not** cover source-content-dependent phase updates beyond the two frozen deterministic clocks, section-varying secret alphabets, plaintext-dependent/latent skip decisions, nonbijective encoders, an additional register (even if it is table-derived) or position-dependent output transformations. The valid extension is **in the secret selection rule**, not in unknown pointer dynamics.

This is a causal narrowing of a specific human-attemptable 256-table interpretation, with no unknown-page plaintext or independent Cicada destination. The next material advance requires a creator-visible key/clock or a complete original unknown-page decipherment.
