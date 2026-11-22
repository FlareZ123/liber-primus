# State-dependent radix-28 byte coding: original LP2 capacity compatibility and exact exclusions

**Agent 4, 2026-11-10. Evidence:** a finite, source-original construction/exclusion for a permissive coding family. **No recovered plaintext, authentic key, intended byte format, or confirmed Cicada 3301 encryption mechanism.**

## Question and significance

The [canonical 28-choice inversion](adaptive-radix28-byte-recovery.md) and the [unknown-global-alphabet sieve](adaptive-radix28-global-order-sieve.md) mathematically exclude fixed secret glyph/difference orderings for all six tested byte-code widths. Those proofs do not extend to a freely chosen ordering of the 28 next-rune symbols **separately for each preceding ciphertext rune**. This note quantifies that difference on the original 12,956-rune unsolved LP2 corpus.

The completed finite family comprises **840 framings** over packet widths \(D\in\{5,10,15,20,25,30\}\), each representing exactly \(3D/5\) bytes. Every width permits all \(D\) phases, global-versus-physical-page resets, forward-versus-reversed digit order within each packet, and two treatments of the 86 immediate repeated-output events. The chosen table may differ between each of the 840 questions but must remain fixed throughout the original text under that particular framing.

**Outcome:** With completely independent previous-rune rows, **836/840** original packet framings admit exact byte-capacity witnesses; four are impossible. Adding the stronger, natural **Latin-square constraint**, where each digit maps the 29 possible predecessor states to a permutation of the 29 output runes, gives **803/840 fully constructed original-capacity witnesses, seven exact impossibilities and 30 unresolved cases**. No English, compressed header or ciphertext key was fitted. A table learned solely to satisfy integer capacity has no evidential claim to authorship or meaningful plaintext.

## Reversible ordinary-rune rule and bounded marker assumption

Let \(C_i\) be the GP rune index in \(0,\ldots,28\). Each preceding glyph \(a\) has an unknown row \(S_a\), which is a permutation of the other 28 rune identities. Ordinary nonrepeat transitions invert exactly:

\[
d_i=S_{C_{i-1}}^{-1}(C_i),\qquad C_i=S_{C_{i-1}}(d_i), \quad 0\le d_i\le27.
\]

A group of \(D=5n\) digits is a valid \(3n\)-byte integer exactly when
\[
V=\sum_{j=0}^{D-1} d_j\,28^{D-1-j}<256^{3n}.
\]

The 86 literal same-rune repeats cannot arise from the ordinary 28-choice row. Two intentionally permissive policies are tested: remove a repeat event and its digit position, or retain it as an *exceptional, out-of-alphabet marker digit* assigned zero when checking capacity. Both policies would require a separately specified marker mechanism to reproduce the exact physical ciphertext. A capacity witness under these policies **does not establish a fully specified reversible Cicada encryption algorithm**. For ordinary marker-free packets, the tables reproduce every indexed rune transition exactly.

The first rune of each independent stream is previous-state context rather than an encoded digit. When the whole manuscript is joined, the last symbol of one physical page is the previous state of the next.

## Exact packet constraints and construction

Define the leading digit bound
\[
b_D=\left\lfloor\frac{256^{3D/5}-1}{28^{D-1}}\right\rfloor.
\]
For \(D=5,10,15,20,25,30\), these are respectively **27, 26, 25, 25, 24, 24**.

A leading digit less than \(b_D\) guarantees byte capacity for *every* suffix. Under an entirely arbitrary row permutation, one can therefore put the highest ranks on successor edges never observed as block leaders after that particular state. This is a genuine constructive proof, using actual source transitions rather than randomized ciphertext surrogates.

For widths 15, 20, 25 and 30, every state in every tested framing has at least **3, 3, 5 and 8** missing leader edges respectively. Reserve the highest **3, 3, 4 and 4** ranks for these absent edges, forcing all actual leading digits below \(b_D\). Every one of these **720** framings then admits a zero-overflow table without even consulting subsequent digits.

For width 10, rank 27 must **never** be an observed first digit, since \(b_{10}=26\). If a preceding-rune state has all 28 different successor glyphs represented as first digits, **no row assignment exists**. This happens in exactly four framings:

| Page restarts | Drop repeats | Packet direction | Phase | State with all 28 leader successors |
|---|---|---|---:|---:|
| No | Yes | Forward | 2 | 17 |
| No | Yes | Forward | 7 | 21 |
| No | Yes | Reverse | 3 | 17 |
| No | Yes | Reverse | 8 | 21 |

These are overlapping presentations of the same selected alignment phenomenon, not four independent cryptanalytic discoveries. For the other **76/80** width-10 framings, choose rank27 from an unobserved outgoing edge. Reserve rank26 from another unobserved edge when available; otherwise select the least-frequent observed leader edge and put all its observed second-digit outputs into ranks 0 through 16 of their own conditioning rows. There is no conflict with either reserved high rank, and the exact full-byte value of every source packet passes.

For width 5, the only dangerous ordinary first digit is 27. If it occurs, the second digit is forced into the safe range **0 through 7**, a sufficient condition for all three remaining digits to fit within the three-byte limit. Construct a top-ranked successor for each of the 29 previous-rune states, collect the second-transition identities triggered by that choice, and assign each conditioning row's required followers to its lowest ranks. A deterministic finite local search with fixed PRNG seed finds a complete conflict-free row table for **all 40** tested width-5 framings. Each is checked against its exact original integer packets. No language objective is involved.

The search's role is restricted to finding an **existence witness**, and each final witness is independently checked with an exact BigInt inequality over every full source packet. Exclusions use the elementary all-28-successors contradiction and require no optimizer.

## Completed source-original execution

The [standalone all-width implementation](../sims/stateful_28rank_allwidth.cjs) uses Node.js 22, CommonJS, no dependencies and [the checked-in numeric LP2 corpus](../resources/liber-primus/lp2-corpus.json). It asserts 55 rune-bearing original pages and 12,956 original ciphertext runes. The completed [manual GitHub Actions run 42787067571](https://github.com/FlareZ123/liber-primus/actions/runs/42787067571) executes the script successfully, including its per-packet BigInt comparisons and exact inversions for ordinary transitions.

| Base-28 digits / bytes | Cases | Explicit capacity-valid tables | Exactly excluded cases |
|---|---:|---:|---:|
| 5 / 3 | 40 | 40 | 0 |
| 10 / 6 | 80 | 76 | 4 |
| 15 / 9 | 120 | 120 | 0 |
| 20 / 12 | 160 | 160 | 0 |
| 25 / 15 | 200 | 200 | 0 |
| 30 / 18 | 240 | 240 | 0 |
| **Total** | **840** | **836** | **4** |

Across the 836 feasible cases, the runner checked **591,160** packet instances, of which **558,022** have no literal repeat marker and **33,138** are marker-affected. Counts are over configurations and are highly overlapping, so they do not represent independent samples of the book. No one table is asserted to fit *all 836 distinct framings at once*.

An earlier, independently committed [single-framing exact witness](../sims/radix28_stateful_byte_capacity_witness.cjs) gives the full 29-row inverse for page-local, phase-zero, forward, width-five coding after excluding entire marker-affected packets. It roundtrips **2,476/2,476** clean packets and **1,000/1,000** synthetic three-byte plants. It decodes 7,428 bytes with SHA-256 \`ec09fd2f75632d62d6d70d6111f54d352e9028b198b59a28f43925dbc57667ec\`, but those bytes are arbitrary table-selected outputs and have no demonstrated plaintext interpretation. The row table has SHA-256 \`3d0c87f554ddaca7f365b01d2febeec978a751bb0ed749804973c617036aec16\`. That original witness passed [CI 42774150997](https://github.com/FlareZ123/liber-primus/actions/runs/42774150997).

## Stronger constraint: a Latin permutation for every digit

The preceding 29 state-specific rows were freely independent. A substantially stronger reversible rule requires, for **each fixed digit** \(d\), that the 29 outputs \(S_a(d)\) over all 29 previous-rune states \(a\) form a permutation of the 29 rune identities, without fixed points. Equivalently, each digit specifies one directed derangement, the 28 digit columns partition all 812 possible non-repeat directed rune transitions, and the entire 29×28 transducer is a **Latin-square-like quasigroup structure with its diagonal excluded**. The cyclic difference encoder is only one member; these tests allow arbitrary derangement columns.

For \(D=5n\), the largest allowed first digit is \(b_D=\lfloor(256^{3n}-1)/28^{D-1}\rfloor\). Every digit rank strictly greater than \(b_D\) must be **absent from every observed clean packet-leading transition**. In the Latin model, each such rank is a perfect matching of previous-rune states to distinct current-rune outputs. Let \(E\) be the graph of preceding/current rune transitions *never seen at a packet lead* in the original ciphertext. Then a necessary condition for the Latin model is that \(E\) contains **\(27-b_D\) edge-disjoint perfect matchings**. This is a strict mathematical condition independent of the plaintext and of any secret alphabet labels.

The [exact 29-state bipartite max-flow and matching decomposition](../sims/stateful_28rank_latin_matching.cjs) checks this necessary condition for all 800 framings of widths 10–30, then seeks the stronger sufficient condition of **\(28-b_D\)** edge-disjoint perfect matchings. When the sufficient condition holds, the matching columns are assigned to digit ranks \(b_D,\ldots,27\), while the remaining regular bipartite graph is partitioned into the lower ranks. Every observed packet consequently has a first digit strictly less than \(b_D\) and is numerically valid, regardless of the other digits. The whole 29×28 Latin table is constructed, every original packet is checked using exact BigInt capacity arithmetic, and every ordinary rune transition is re-encoded exactly.

For \(D=5\), forbidden-leading-digit matching is powerless because 27 is a legal first digit. A complementary [complete 29-state Latin construction](../sims/stateful_28rank_latin_five.cjs) assigns digit 27 to a perfect matching of outgoing rune edges and makes every observed next digit after one of those top-ranked leading edges at most **7**, which guarantees the entire three-byte packet fits even if the remaining three digits equal 27. Forced low followers are extended to an **eight-regular bipartite graph** by exact variable-degree max flow, partitioned into eight low-digit permutations, then completed with nineteen middle-digit permutations and the single top digit permutation. A deterministic 100-trial search produces an exactly checked, full Latin table for **all 40 original five-digit framings**. This is a mathematical existence witness; the tables are found from the same ciphertext they fit.

| Digits per packet / bytes | Latin framings | Full original-capacity Latin tables | Mathematically impossible | Not settled by these bounds |
|---|---:|---:|---:|---:|
| 5 / 3 | 40 | **40** | 0 | 0 |
| 10 / 6 | 80 | **45** | **7** | 28 |
| 15 / 9 | 120 | **118** | 0 | 2 |
| 20 / 12 | 160 | **160** | 0 | 0 |
| 25 / 15 | 200 | **200** | 0 | 0 |
| 30 / 18 | 240 | **240** | 0 | 0 |
| **Total** | **840** | **803** | **7** | **30** |

The seven exact exclusions all occur at width 10. Four continuous, repeat-dropped cases already fail for an **unrestricted** state-dependent row because one previous rune has all 28 possible outgoing successors represented at packet-leading positions. The **three additional** Latin-specific contradictions involve a rune that has no possible predecessor through an unobserved leader transition: page-restored forward phase6 with repeats retained excludes target rune index **18**; page-restored forward phase8 and reversed phase9 with repeats dropped exclude target index **21**. Since the highest digit must appear at **every** possible output rune exactly once under the Latin column rule, no matching can exist in these three cases. The seven configurations are overlapping framings, not independent observations or evidence that any particular framing is authorial.

The 30 unresolved cases pass the necessary perfect-matching test but fail only the **stronger sufficient** assignment that avoids the partially permitted first digit \(b_D\). Their actual feasibility is open and no impossibility should be inferred for them. The other **803** are fully constructive under the declared marker convention. The necessary matching test admits planted authentic cyclic-Latin encoders on 350 independent byte packets per width; the five-digit construction additionally decodes 1,000 implanted three-byte packets and rebuilds exact Latin tables. These are competence controls for the feasibility checker, not validation of a real LP2 key. [Source-original CI for widths 10–30](https://github.com/FlareZ123/liber-primus/actions/runs/42789417769) and the [manual-only workflow](../.github/workflows/lp2-adaptive-base28-manual.yml) preserve reproducibility.

**Decision:** The Latin architecture's extra permutation constraint identifies three additional impossible ten-digit framings, while still allowing hundreds of complete source-fitting tables. Recovering plaintext requires an independently specified Latin mapping, key material, or authenticated byte source. Searching arbitrary high-dimensional Latin tables for capacity validity alone remains underdetermined.

## Research implication and limitations

The four unrestricted-row ten-digit counterexamples remain exact. Three further ten-digit framings are impossible under the stronger digitwise Latin-permutation rule. Conversely, **836 unrestricted-row** and **803 Latin** constructive capacity passes show why fitting freely chosen state-dependent alphabets to packet size is **not a viable key-recovery criterion**. The likely challenge is an external restriction linking the rows, a source-selected phase/marker policy, a separately recoverable intermediate byte stream, or a jointly invertible plaintext model that predicts unfitted original runes.

No state-dependent capacity table found here constitutes a Cicada key. No source binary signature, compression stream, plaintext, or continuation address has been authenticated. The technique's appropriate role is a sharply bounded feasibility filter when an independent source clue selects a specific row structure.