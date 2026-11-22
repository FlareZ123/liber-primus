# Four-ciphertext-history models: exact original-input identifiability boundary

**Classification: new finite, model-explicit non-identifiability result (12 November 2026).** No unknown LP2 plaintext, authentic key, actual cipher method or destination is recovered. This resolves [Director #547](https://github.com/FlareZ123/liber-primus/issues/547) at the source-key decision boundary. [Independent original-corpus CommonJS reproducer](../sims/lp2_cipher_history4_identifiability_sft.cjs) includes source-native reversible controls.

## Question and exact model

The independently established GP29 chapter/previous-ciphertext and plaintext-history gates eliminate several low-history ordinary-English decoder families. Could a four-previous-**ciphertext**-rune table be inferred directly from the original text, even if its 29-letter substitution at each previous-four-runic state is an arbitrary hidden bijection?

Freeze one reversible symbol per source rune, original 29-symbol alphabet, and exact printed physical pages. At position `i >= 4`, write `C_i = f_{s_i}(P_i)`, where `s_i=(C_{i-4},C_{i-3},C_{i-2},C_{i-1})`. Every `f_s` is a permutation of all 29 values, completely secret. Consider (1) independent lookup tables per physical rune-bearing page, (2) a single book-wide table with the first four runes on each physical page bypassed, and (3) a single book-wide table with ciphertext history continuous across physical page turns. In (1), physical page is part of the state. No original source independently prescribes any such four-rune table or its four initial symbols; those positions are excluded from the page-reset tests rather than assigned invented IVs.

For any observed state `s`, let `d_s` be the count of **distinct** ciphertext symbols seen immediately after it, and `n_s` the total observations. Because `f_s` is bijective, equal state+next-C forces equal P, and two distinct next-C outputs after the same state force different P. The exact number of plaintext assignments to the observed transitions compatible with some table is `∏_s 29!/(29-d_s)!`; nothing in the original prior-four-C constraints further selects those assignments. This counts complete arbitrary GP29 plaintext candidates on modeled positions; it does **not** assume native-English prose.

## Complete 12,956-original-rune census

| Frozen four-C interpretation | Modeled transitions | Occupied state records | Repeated four-C context pairs | Repeated five-C-gram pairs | Distinct observed (state,next-C) classes | Maximum next-C support |
|---|---:|---:|---:|---:|---:|---:|
| Page-specific separate tables | 12,736 | 12,735 | **1** | **0** | 12,736 | 2 |
| One table, restart prior-C at physical page | 12,736 | 12,615 | 122 | **6** | 12,730 | 3 |
| One table, carry prior-C across pages | 12,952 | 12,825 | 128 | **6** | 12,946 | 3 |

For the page-specific version, **12,734** states are observed exactly once, and the sole duplicated context is physical **p7**, `[21,5,8,22]`, with next-C values **28** and **8** at local source rune positions **95** and **174**. The table merely requires different plaintext symbols at those two positions; all other modeled positions can independently choose any of 29 plaintext values. There are **no** repeated five-rune ciphertext phrases within any single physical page under this particular state definition.

For the shared-but-page-reset table, the full next-symbol support distribution is **12,501 states with one output, 113 states with two, one with three**; state usage is 12,495 singletons, 119 doubletons and one triple. The six repeated five-grams are only six equality constraints. Four-symbol contexts have `29^4 = 707,281` possible identities, of which only **12,615** are seen globally, leaving **694,666 unseen**. Even their three largest observed supports are a small fraction of the 29-symbol table.

These exact counts correspond to `log2` valid GP29 plaintext assignments **61,871.1953 bits** (page-specific), **61,836.2236 bits** (book-wide page restart) and **62,885.2437 bits** (continuous book). The page-start symbols are held unchanged, so these are conservative ambiguity counts. A genuine plaintext must also satisfy separate linguistic constraints, but the original ciphertext and arbitrary secret rows alone cannot identify it.

## Known-solved-page key-learning check

Even if the same four-C table applied across the unknown and solved LP2 pages (a **counterfactual**, since p56 has a separately authenticated prime-totient cipher), cross-text state re-use supplies almost no table information. Within pages, the 172 distinct four-C states from original solved p56/p57 intersect the **12,615** unknown-page states in **only four** keys; all four are from solved **p57**, none from p56. They are `[18,7,18,19]` (solved p57 local40, unknown p46 local193), `[5,10,4,5]` (p57 local57, p12 local4), `[4,18,9,5]` (p57 local65, p28 local90), and `[15,0,10,9]` (p57 local70, p26 local208). For each of these four, the solved next-C differs from the unknown next-C, so at most one of the other 29 inverse-table entries is learned, and **not even a plaintext rune** is transferred directly. No four-C state in solved p56 reoccurs in the unsolved pages. The original solved controls thus cannot supply a practical free-table key under the book-shared model; a common algorithmic generator would still need to be independently identified.

## State information and historical feasibility

A freely independent, *fully specified secret* 29-way permutation uses `log2(29!)=102.8021767` bits per context. The **12,615 occupied book-wide states** would require about **1,296,849** bits of independent random permutations. Even revealing the authentic original plaintext at all modeled positions would leave roughly **1,235,013** bits of unobserved permutations across those same occupied rows (each observed output only fixes one inverse-table entry). These are descriptions of an unrestricted collection of random lookup-table rows, **never a cryptographic lower bound on a generator seed**.

A source-visible 256-cell table interpreted as bytes holds at most **2,048 literal bits** under that conditional reading. A short keyed pseudorandom algorithm can of course expand a small seed into state-dependent permutations. The original still has to name the generator, its seed derivation, page-clock semantics and first-four-symbol treatment; a huge space of mathematically possible inverse tables cannot provide those instructions. The independent-source alternative that a higher-order state *is itself* the key is likewise unsupported.

The reproducer gives an explicit counterexample to conflating independent table entropy with minimum seed size. A deliberately **synthetic** four-history Caesar map derived from a 32-bit seed by SHA-256 recovers **12,956/12,956** runes of a source-native solved-p57 GP text plant in their original physical page-length slots. Two different 32-bit seeds decode all **original ciphertext** to different candidate GP sequences, and both forward-encrypt exactly to the same original. Such algebraic round trips are guarantees of the synthetic transform, not recovered plaintext. No original Cicada source here selects SHA-256, this history width, or either seed.

## Director decision

The original four-C state table cannot be learned from ciphertext alone; its **observed** lookup rows are almost entirely singletons and its inverse is massively underdetermined. Treat a free table as a mathematical counterexample, not a promising stand-alone plaintext recovery mechanism. An independently published **compact recurrence, key input, alphabet and reset rule**, preferably verified on a solved-Cicada control, is needed before a serious original-input inversion. Additional secret-state width without a recoverable source can only make the underdetermination worse. This finite conclusion does not rule out a genuine keyed, computably generated four-history cipher; it means there is no discriminating way to select one from the present raw ciphertext alone.

**Reproduce:** `sims/lp2_cipher_history4_identifiability_sft.cjs` reads the canonical original LP2 corpus, asserts all three exact censuses including the unique page-specific repeat, evaluates the algebraic ambiguity formula, checks two full-original synthetic inverse/forward identities, and source-positively recovers 12,956 planted rune values from solved p57. It writes nothing and uses Node.js standard modules.
