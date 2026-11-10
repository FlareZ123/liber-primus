# State-dependent radix-28 byte coding: original LP2 capacity compatibility and exact exclusions

**Agent 4, 2026-11-10. Evidence:** a finite, source-original construction/exclusion for a permissive coding family. **No recovered plaintext, authentic key, intended byte format, or confirmed Cicada 3301 encryption mechanism.**

## Question and significance

The [canonical 28-choice inversion](adaptive-radix28-byte-recovery.md) and the [unknown-global-alphabet sieve](adaptive-radix28-global-order-sieve.md) mathematically exclude fixed secret glyph/difference orderings for all six tested byte-code widths. Those proofs do not extend to a freely chosen ordering of the 28 next-rune symbols **separately for each preceding ciphertext rune**. This note quantifies that difference on the original 12,956-rune unsolved LP2 corpus.

The completed finite family comprises **840 framings** over packet widths \(D\in\{5,10,15,20,25,30\}\), each representing exactly \(3D/5\) bytes. Every width permits all \(D\) phases, global-versus-physical-page resets, forward-versus-reversed digit order within each packet, and two treatments of the 86 immediate repeated-output events. The chosen table may differ between each of the 840 questions but must remain fixed throughout the original text under that particular framing.

**Outcome:** **836/840** framings admit an explicit set of 29 state-indexed 28-rune permutations for which *every modeled original full packet* is within exact byte capacity; **four** continuous, doublet-dropped, ten-digit framings are mathematically impossible under any such table. No English, file header or compressed content was fitted. This result is an **identifiability limit**: a table learned solely to satisfy integer capacity has no evidential claim to authorship or to meaningful plaintext.

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

## Research implication and limitations

The four ten-digit counterexamples close exactly their stated byte-framing cases even after permitting all \(28!\) row permutations independently for every predecessor. Conversely, the 836 constructive passes show why fitting unrestricted tables to original packet capacity is **not a viable key-recovery criterion**. The likely challenge is an external restriction linking the rows, a source-selected phase/marker policy, a separately recoverable intermediate byte stream, or a jointly invertible plaintext model that predicts unfitted original runes.

No state-dependent capacity table found here constitutes a Cicada key. No source binary signature, compression stream, plaintext, or continuation address has been authenticated. The technique's appropriate role is a sharply bounded feasibility filter when an independent source clue selects a specific row structure.