# The 2013 telnet missing-prime interval and the 180-cell LP2 terminal interior

**Agent13, 14 November 2026. Source-conditioned lead with a completed, bounded original-data decoder test. No authentic LP2 unknown plaintext, key or destination recovered.** The overall authoritative synthesis remains [results/README.md](../results/README.md).

## Original clue route and strongest missing premise

A preserved participant-side transcript of the 2013 Cicada telnet \`primes\` response lists ordinary primes through **71**, skips forward to **1229**, then resumes. The omitted numbers are **exactly 180 consecutive ordinary primes, 73 through 1223**, at one-based prime ordinals **21 through 200**. Their recurrence as a possible key source was already known to the project: [the earlier whole-LP2 omitted-prime decoder](../sims/telnet2013_missing_primes_holdout.cjs) tested a repeating 180-prime register without finding plaintext. The gap is recorded independently in [this historical archive](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/analysis/HINTS-NEVER-USED.md) and in [a period-event walkthrough](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282013%29#THE_PRIMES). These are **participant transcriptions**, not an authenticated author-signed instruction to use the missing interval. The contemporaneous ISO's separate \`prime_echo\` routine included all **464** primes through 3301; one cannot assume the telnet omission was a deliberate cryptographic hint.

The **new, separately printed potential receiver** is the 2014 LP2 physical pp49–51 rectangular **32×8 = 256** two-character numeric table. Removing its one-cell circumference according to the genuinely solved final PARABLE instruction leaves a complete **30×6 = 180-cell interior**. The adjacent original p55 text is exactly **76 runes**, and original p56 plus p57 has exactly **85 + 95 = 180 runes**, two independent ways of partitioning **256 = 76 + 180** ([earlier original-grid geometry](lp2-p50-concentric-ring60-red119-source-selector.md)). Thus the older 2013 **180-key** interval has the exact length of the table's *known-source* interior, where a proposed decoder can be checked against authenticated p56 plaintext and clear p57 before touching the 76 unknown p55 runes.

This gives a concrete, affordable test. Its strongest unsupported premise is the **placement of the 2013 telnet omission into the 2014 table**. The numerical length equality and the shared motif of primes are insufficient to supply a key clock, table-to-text correspondence, or decoding rule. Moreover, the first p55 rune continues a typographic word from p54, weakening the notion that p55 was designed as an independent 76-character cryptographic block.

## One fixed source-native decoder, measured on all 180 known positions

Predeclare the same straightforward GP29 arithmetic the earlier puzzles used. Let \`B_i\` be the 180 conventional-base60 table bytes at original zero-based rows **1..30** and columns **1..6**, in original printed row-major order. Let \`q_i\` be the 180 omitted ordinary primes in increasing order. Test \`P_i = B_i ± q_i (mod 29)\` and \`P_i = B_i ± (q_i−1) (mod 29)\`, where \`q_i−1\` corresponds to the historically named totient of a prime. No key phase, search, orientation, plaintext crib or offset is fitted.

The *two independent original receiver registers* are (A) 85 authenticated p56 GP29 plaintext values recovered from its ordinary-prime totient key, with the single literal-F nonconsuming position at **local index 56**, followed by all 95 original clear p57 runes; (B) all 85 p56 ciphertext runes **as printed**, followed by p57. The source-only p56 decoder reconstructs the exact opening **AN END**, consumes **84** primes, and preserves the literal F. Every candidate must match **180/180** original receiver runes to explain the complete putative encoding. The complete frozen results are:

| Original known receiver | \`−q\` | \`−(q−1)\` | \`+q\` | \`+(q−1)\` |
| --- | ---: | ---: | ---: | ---: |
| p56 **decoded** + p57 clear, matches of 180 | **4** | **4** | **7** | **8** |
| p56 **printed** + p57 clear, matches of 180 | **5** | **5** | **8** | **4** |

All eight candidates are incompatible with a complete directly additive source-prime decoder. The **best 8/180** agrees with the random GP29 expectation of roughly **6.2/180**. This eliminates only this exact, authored-simple decoder; no more general source use of the 180 primes is excluded.

A separate literal *navigation* consumer interprets each odd omitted prime's residue modulo eight as a cardinal direction, using its four possible values **1,3,5,7**. Regardless of which of the 24 bijections maps these residues to N/E/S/W, any unit-step walk on the 30×6 interior immediately reverses direction **48, 56 or 57 times** (the three possible opposite-residue partitions), necessarily revisiting its previous cell. Thus no literal cardinal \`q_i mod 8\` walk can enumerate each of the 180 interior cells once. This rejects a complete one-visit-per-cell route without trying fitted starts, orientations or boundary policies. It does not address a route with backtracking and an independently specified selection rule.

## Decision

**Retain the 180/180 cross-round equality as a source-led hypothesis, not a solution claim.** It creates a specific original known-plaintext receiver for any future source-named 2013-to-2014 cipher mechanism. The direct additive-prime operand and the straightforward cardinal Hamiltonian reading fail. Further unfitted phases, arbitrary numeral transforms, or alternate table serializations would recreate a broad key hunt. A useful successor would require an independently authenticated instruction that *selects* a different prime-gap consumer and fixes its geometry before running on the original unknown pages.

**Reproducibility:** [read-only single-file CommonJS original-source SFT](../sims/lp2_2013_telnet_primegap180_terminal_source_sft.cjs), reading the repository's canonical [grid](../resources/liber-primus/lp2-grid-256.json) and [runic corpus](../resources/liber-primus/lp2-corpus.json). Its asserted outputs include all exact match counts, the p56 key-clock control, both source lengths and all three unavoidable cardinal backtrack counts. No CI workflow was added.
