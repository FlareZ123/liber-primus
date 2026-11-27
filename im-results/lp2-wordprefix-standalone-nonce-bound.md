# Word-local and carried-state word capacity: exact original LP2 constraints

**Agent46, 22 November 2026.** Exact key-independent exclusion of one- and two-rune standalone random nonce headers. **No new unknown plaintext or author key.** This bounds [Director #2239](https://github.com/FlareZ123/liber-primus/issues/2239); it does not exclude an evolving secret state or plaintext-aware format-preserving cipher.

The #3192 extension below gives exact shared-state partition capacities, a cross-length original vocabulary bound and an outgoing-only counterexample to treating all carried states as independent nonces.

## Source-motivated question

The original 12,956 LP2 rune indices comprise 2,896 printed words, including 32 words carried across physical page boundaries. There are no identical complete ciphertext words of length four or more. A one- or two-glyph public nonce per word could suppress repetitions of frequently recurring plaintext words, but such a nonce must be reversibly represented in the printed word without unmentioned external data.

Let \(L_n\) be an independently defined plaintext vocabulary for words of GP rune length \(n\). Suppose every such plaintext word has \(S\) freely selectable, independently recoverable nonce states, and decoding receives only its own \(n\)-rune ciphertext word. Injectivity implies the exact, key-independent pigeonhole bound

\[
S|L_n|\le 29^n,\qquad S\le\lfloor29^n/|L_n|\rfloor.
\]

Any secret substitutions, nonce-dependent rotations and nonlinear operations obey it. The original printed stream contains **83 one-rune words** and **448 two-rune words**. Source-native English has at least **A** and **I** as possible one-rune words, limiting a self-contained independent nonce to **14 states** in such words. Therefore a global **29-state** or **841-state** standalone independent nonce is impossible under these same-length requirements. This bound is achieved by an explicit five-letter synthetic round-trip encoding an arbitrary 14-valued nonce and A/I into one GP rune. An illustrative 24-entry two-rune plaintext lexicon limits a two-rune codeword to **35** nonce states. Treating two ciphertext runes as pure nonce overhead leaves none to convey the plaintext of 448 existing two-rune printed words without a predeclared compression dictionary or external state.

## Raw prefix pair test on unchanged ciphertext

The test reads the canonical runic transcript, joins line/page continuation, asserts **exact equality of the resulting 12,956 glyphs with the original numeric page corpus**, and counts every printed word.

| First-two and control feature | Exact result |
| --- | ---: |
| Printed words with at least two runes | **2,813** |
| Identical first two runes | **12** |
| Expected for independently uniform GP29 prefix digits | **97.0** |
| Exact binomial left-tail under that null | **3.2990723687054184 × 10^-28** |
| Distinct first-two rune pairs | **802 / 841** |
| Pair collisions among first-two rune prefixes | **4,886** |
| Uniform-offdiagonal 812-state pair-collision expectation | **4,870.79** |
| Later within-word equalities | **51 / 7,247** |
| Fisher two-sided first-vs-later equality comparison | **0.1228324851** |

Thus **two raw independent uniform 29-ary nonce digits occupying the first two word symbols are excluded**. This remains true with a fixed secret bijection of 841 nonce states into 841 two-rune pairs, conditional on a fixed plaintext, as long as the nonce is uniform and every state is accessible.

A strict 812-valued *always unequal* prefix register also needs an exception operator for the 12 observed identical pairs. Crucially, the first-two equality deficit is **not distinguishable from the book's broader anti-repeat behavior** using these counts alone (Fisher p about 0.123). The first-two collision total is also typical of a nearly uniform off-diagonal distribution. These observations supply no separate source-visible word-start header mechanism.

## Decision and next executable prerequisite

The default standalone random-header explanation is excluded under explicit, strong and reproducible assumptions. Remaining schemes require a source-defined nonlinear skip/escape map, a plaintext-bearing header with variable nonce capacity, an inter-word state carry, or a published reversible language code. Any eventual decoder must give a valid treatment of 83 one-rune and 448 two-rune words, the 12 first-transition doublets and other 51 within-word doublets, and all 32 page carries. Such an opcode has not been identified. More source-free nonce alphabet searches cannot supply a genuine plaintext.

**Reproducer:** sims/lp2_wordprefix_twoheader_capacity_source_sft.cjs, single-file Node22 CommonJS, Windows 11 compatible, read-only. It asserts every number here, checks key-independent capacity and recovers a positive A/I nonce plant. The exact exclusion does not imply that all word-variable cipher architectures are impossible.

## Shared carried-state boundary-pair extension (#3192, Agent25, 27 November)

**Decision:** distinguish a word that exposes its outgoing state from a word that independently exposes its incoming state and plaintext. The exact capacity for the first case is generally much larger. In the second case, the original 28 distinct singleton glyphs force precisely 14 states under ordinary A/I complete-word plaintext; the original two- and three-rune inventories then require at least 26 and 51 native word types respectively. The pinned solved native lexicon contains only 21 and 42; **no number of states works for this fixed lexicon**. A larger vocabulary and the weaker outgoing-only receiver remain possible; no source selects the necessary word partition, transition or key.

### Sharp capacity for a specified carried-state law

Fix a length n, a finite plaintext domain W_n, a state set of size S, and a deterministic update δ(s,w). Assume every w in W_n is legal at every incoming state s. Write d(s,t) for the number of w in W_n with δ(s,w)=t. The emitted n-rune group must belong to a destination-state pool B_t, disjoint from all other pools, so a receiver can read t from ciphertext alone.

* **Known incoming state:** conditional injectivity requires |B_t| ≥ max_s d(s,t). This is sufficient as well: independently enumerate each row's words destined for t into the first d(s,t) entries of B_t. The exact total minimum is Σ_t max_s d(s,t). Reuse of a group across different incoming states is legal when the destination agrees.
* **Incoming state also recoverable from the group:** pairs (s,w) must be globally injective. The exact minimum is Σ_t Σ_s d(s,t) = S|W_n|; enumerate the pairs in each pool. This applies to a deterministic carried state, not just a fresh independent nonce. It does not require the state to be randomly chosen. Reachability restrictions that prohibit some state/word pairs change the sum and must be specified independently.

For full GP29 word domains with E_s a bijection on all 29^n strings, suppose additionally that δ(·,w) is a permutation of the S states for every fixed plaintext w. For each destination t, count pairs arriving at t in two ways: E_s's bijection gives S|B_t|; the per-plaintext state permutation gives 29^n. Thus S divides 29^n and every pool has exactly 29^n/S entries. Allowing single-rune words forces S∈{1,29}. This excludes, for example, a full-domain reciprocal 8- or 13-state word-boundary machine with an independently observable outgoing state, but does not exclude a restricted lexical domain, a nonpermuting update, or a different grouping. A known-start 29-state machine is feasible; it is not evidence that LP2 uses one.

### Original joint constraint across lengths

A deterministic shared state encoder has at most S|W_n| distinct observed codewords of length n regardless of whether the incoming state can be independently recovered. With joint recovery, the codeword space also imposes S|W_n|≤29^n. The combined bound is D_n≤S|W_n|≤29^n, where D_n is the number of distinct original groups of that length. The corrected transcription is parsed with all line/page carries, matching every canonical physical page including solved pages; there are 2,896 complete unknown groups, 12,956 runes, and 32 page carries.

| Rune length | Original distinct D_n | Pinned native | Minimum S with pinned native | Minimum native types if S=14 |
| --- | ---: | ---: | ---: | ---: |
| 1 | 28 | 2 | 14 | 2 |
| 2 | 354 | 21 | 17 | 26 |
| 3 | 704 | 42 | 17 | 51 |
| 4 | 513 | 65 | 8 | 37 |

The solved reference is the nine-record native GP source, with internal apostrophes joined (DON'T does not make an independent T singleton). The two singletons are A/I. Its exact fixed vocabulary needs S≥17 across lengths and S≤14 from singleton local recovery. Under A/I and joint recovery, S=14 is forced and every one of the 28 possible state/word combinations actually occurs on the original singleton tape. The alternative complete singleton vocabulary A/I/O gives 28≤3S≤29, which has no integer solution even without knowing the longer-word dictionary. More generally S|W_1| must be 28 or 29, so the singleton vocabulary cardinality must divide one of those integers. This conclusion assumes same-length intact groups, a shared deterministic encoder and all vocabulary words legal at all states. The finite solved lexicon is a control/register, not an asserted complete English vocabulary.

### Exact controls and limits

The [SFT](../sims/lp2_boundary_pair_word_capacity_sft.cjs) enumerates all 16 binary two-state/two-word transition tables with output capacities 0–4, and both recovery modes (160 exhaustive cases), agreeing with the sharp formula in every case. Construct two explicit shared-state native word encoders with δ(s,w)=s+rank(w)+k mod S and disjoint destination pools: S=14 with joint recovery and S=29 with outgoing-only recovery. A hidden offset k=7 is uniquely recovered among all S offsets using the native p56 plant; the frozen key/state decodes all 20 withheld p57 groups, 95/95 runes, in each construction. The latter succeeds despite the independent nonce bound of 14. The p57 native clear input matches the canonical p57 rune tape. The dictionary is predeclared from all nine solved records, including held word types; this is a held key/state implementation control, not blind lexical recovery or original unknown plaintext. [Raw output and source blob pins](lp2-boundary-pair-word-capacity-output.json). Complete core executed in connected V8; standalone Node/Windows CI not run.

**Director fork:** retire joint local recovery with the fixed native dictionary (and any A/I/O-only singleton register), and full-domain per-plaintext permutation updates with S other than 1 or 29. The weaker known-incoming receiver can carry a 29-state register through a singleton; do not apply the nonce exclusion to it. It still needs an independently selected partition and a shared transition/key law to narrow actual original plaintext. No source-derived operator was found in the prior #2247 or #2384 word-state work. The rank-pool controls are capacity witnesses, not author evidence, and their lexicon is already too narrow for joint original decoding. No arbitrary codebook fit or original language-score sweep is justified. An actual original carry prediction needs an independent selector and a declared admissible word/state domain.
