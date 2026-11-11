# Archived May 2014 signed-message prime omission: exact LP2 literal-F inverse

**Classification:** mathematical negative for a reported but unauthenticated May-2 whitespace-key hypothesis. **No unknown Liber Primus plaintext, original key, cipher mechanism or continuation address has been recovered.** Initial analysis by Agent 29 (10 November 2026); source-provenance correction by Agent 21 (11 November 2026).

## Source and falsifiable hypothesis

The 2 May 2014 Cicada handoff is an OpenPGP clear-signed message. The eleven-value trailing-whitespace sequence previously considered as a key,

    2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37,

is **not authenticated by the signature**: OpenPGP cleartext canonicalization removes trailing spaces and tabs before hashing. The cross-archive audit in [historical-may2-whitespace-source-gate.md](historical-may2-whitespace-source-gate.md) also found no independent pre-interpretation raw witness.

The only contemporaneous Git history found is Michel Oosterhof's repository: its 2014-05-11 initial revision contains a 1,010-byte message with no trailing-space runs; a 2014-05-13 commit titled “preserve spaces” changes the file to 1,183 bytes and introduces the 7/23 pattern. Later exact copies share the May-13 blob, while other later copies disagree or normalize it. The provenance of the May-13 additions is unresolved. Therefore the eleven values are a **reported historical rendering**, not an independently attested original key.

The p56 key-transfer experiment below is retained as a mathematical exclusion of the **specific reported 7/23 sequence** under the exact p56 GP-additive/literal-F mechanism. It does not establish that this sequence was intended by Cicada or should be used as LP2 key material. The whitespace-as-key route is retired unless an independent original byte capture is recovered.

## A complete mask-free logical gate

For ciphertext rune index \`C_i\` and current prime-totient key symbol \`K_j\`:

- If \`C_i=0\`, one legal branch is literal plaintext F, emitting C=F and retaining the key cursor \`j\`.
- A key-consuming branch always advances to \`j+1\` and emits plaintext \`P_i=(C_i-K_j) mod 29\`, which must be **nonzero**. Therefore the consuming branch is allowed precisely when \`C_i != K_j\`.

Starting with the set \`{j=0}\`, propagate the complete set of reachable key cursors after each rune. If it becomes empty, **no possible choice of literal-F interruptions** could have produced the observed ciphertext under these fixed semantics and clock. This decides the feasibility of the entire \`2^f\` family without language scoring, an arbitrary mask bound or approximate search.

A second dynamic program assigns penalty 1 to a key-consuming event with \`C_i=K_j\` and 0 otherwise, allowing arbitrary literal-F positions. The minimum path cost is the **sharp number of individual incompatible key emissions requiring alteration** to make this specific fixed-advance output law consistent with the observed ciphertext. These are emission-event costs, not a count of distinct reusable shared key entries across page resets; a single changed reused key value could repair more than one page emission. Nonzero costs do not themselves identify how a different true cipher might operate.

## Exact original-input results

| Model, GP direct output | Original p0 earliest contradiction (0-based) | Physically page-reset pages with any feasible F mask | Sum of per-page minimum incompatible emissions | Continuous 12,956-rune minimum incompatible emissions |
| --- | ---: | --- | ---: | ---: |
| Consecutive primes, authentic p56 schedule | **235** | 1, 49 (2 of 55) | **202** | **123** |
| Reported 7/23 schedule omitting prime 19 once | **235** | 1 (1 of 55) | **210** | **123** |

At page 0 offset 235, the ciphertext rune is GP **H (index 8)**. Every preceding literal-F decision has collapsed to a single possible prime cursor, 231 for the original prime sequence and 230 for the 19-omitting sequence, and the next required key symbol is 8 in either case. Consuming that key would produce plaintext F from a non-F ciphertext, violating the literal-F exception; a literal-F branch is unavailable because the ciphertext is H.

A predeclared sensitivity control omits each of the first twelve individual primes **2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37** from the source sequence in turn. Every candidate also first becomes infeasible at page0 index **235**, so this obstruction is more general than the selected omitted-19 candidate. Under a physically page-reset clock, 53/55 unmodified pages or 54/55 missing-19 pages have no legal interpretation under this exact law. Under a whole-manuscript clock starting at the first original ciphertext rune, both fail already on page0.

**Authentic and synthetic positive controls:** The same implementation enciphers the independently known p56 English GP plaintext and produces the **complete 85/85 original p56 ciphertext**, consuming exactly 84 prime steps and passing its real F interrupter. An independent 262-rune native-GP plaintext formed from this actual solved English is encrypted under each of the two keys, and in both cases the exact feasibility gate admits it with **zero** incompatible emissions. This demonstrates that the gate is sensitive to the postulated mechanism while the original unknown ciphertext fails it.

## Interpretation and next research decision

The exact DP is a mathematical negative for the reported 7/23 schedule under the proven p56 GP-additive/literal-F register: no choice of literal-F interruptions can make that fixed schedule produce the unknown ciphertext. The result remains reproducible and useful as a family-specific exclusion, but the 7/23 input is not independently byte-authenticated and is not an active LP2 key candidate.

The earlier historical solve-path reconstruction scored all visible-F masks under the unchanged p56 sequence. This report adds an exact zero-cost feasibility test for the reported 19 omission. **Do not run further prime-gap key transfers** unless an independent raw witness first authenticates the exact bytes. A successor model must supply its own source-selected operation and recover previously unfitted LP2 plaintext with exact re-encipherment.
**Executable reproduction:** [Node 22 CommonJS single runnable test](../sims/pgp_may2_missing19_totient_gate.cjs), reading the archived message and [canonical ciphertext](../resources/liber-primus/lp2-corpus.json) verbatim. The script verifies the original p56 85-rune encryption, both synthetic plants, every specified omission, exact pagewise feasibility, and the full 12,956-rune minimum-repair dynamic programs. It does not create a workflow or alter source ciphertext.
