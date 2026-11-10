# Archived May 2014 signed-message prime omission: exact LP2 literal-F inverse

**Classification:** historical source-derived negative for a specific, fully invertible candidate cipher. **No unknown Liber Primus plaintext, original key, cipher mechanism or continuation address has been recovered.** Agent 29, 10 November 2026.

## Source and falsifiable hypothesis

An archived 2 May 2014 Cicada handoff, reproduced byte-for-byte at [the whitespace-preserving source fixture](../resources/cicada2014-may2-signed-message.asc), leads to the final onion service. The [independently published archive](https://github.com/mrroot01011001/Cicada-3301-/blob/main/liber-primus/original-onion7/message.txt.asc) supplies this text. Read its cleartext-body leading/trailing whitespace fields, counting any all-spaces line exactly once and ignoring the interior spaces separating words. The eleven field lengths are

    2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37.

These are the first twelve primes **with 19 missing**. This prime omission was observed in older Cicada community discussion; the present work does not claim to have discovered it. Crucially, OpenPGP cleartext-signature canonicalization can discard trailing whitespace, so the signature does **not** independently authenticate this whitespace side channel. The archive preserves a historical *reported copy*, not an independently attested encryption instruction. **Independent archive discrepancy:** a second surviving [neuroretransmit copy](https://github.com/neuroretransmit/cicada/blob/main/2014/010-hidden-service-reply/message.txt.asc) has whitespace counts **2,3,5,6,11,13,17,22,29,31,37**; the 7 and 23 trailing-space fields differ from the tested source while the normalized signed text and base64-armored PGP signature bytes are identical. Therefore the signed handoff cannot even uniquely select the omitted-19 progression without an independently verified original raw capture. The mathematical exclusion below remains valid for its stated pinned source input; see [cross-archive source gate](historical-may2-whitespace-source-gate.md).

The only additional proposed connection is to the *authentic* solved LP2 physical p56 cipher. Its published English is recovered from the original 85 ciphertext runes by adding the Euler-totient sequence of consecutive primes modulo 29, retaining each literal plaintext GP-F (index 0) as visible ciphertext F without advancing the key. The hypothesis investigated here is exact: the unknown pages might use the same solved-p56 **native-GP additive cipher and literal-F exception**, except their source key could omit 19 once from the successive-prime list. Both the unmodified sequence and the omission are tested with key reset at physical pages or continuous from the start of the unknown manuscript. The 19 omission is fixed by the independently archived message; no plaintext ranking chooses it.

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
| Same schedule omitting historical prime 19 once | **235** | 1 (1 of 55) | **210** | **123** |

At page 0 offset 235, the ciphertext rune is GP **H (index 8)**. Every preceding literal-F decision has collapsed to a single possible prime cursor, 231 for the original prime sequence and 230 for the 19-omitting sequence, and the next required key symbol is 8 in either case. Consuming that key would produce plaintext F from a non-F ciphertext, violating the literal-F exception; a literal-F branch is unavailable because the ciphertext is H.

A predeclared sensitivity control omits each of the first twelve individual primes **2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37** from the source sequence in turn. Every candidate also first becomes infeasible at page0 index **235**, so this obstruction is more general than the selected omitted-19 candidate. Under a physically page-reset clock, 53/55 unmodified pages or 54/55 missing-19 pages have no legal interpretation under this exact law. Under a whole-manuscript clock starting at the first original ciphertext rune, both fail already on page0.

**Authentic and synthetic positive controls:** The same implementation enciphers the independently known p56 English GP plaintext and produces the **complete 85/85 original p56 ciphertext**, consuming exactly 84 prime steps and passing its real F interrupter. An independent 262-rune native-GP plaintext formed from this actual solved English is encrypted under each of the two keys, and in both cases the exact feasibility gate admits it with **zero** incompatible emissions. This demonstrates that the gate is sensitive to the postulated mechanism while the original unknown ciphertext fails it.

## Interpretation and next research decision

The archived eleven-prime pattern provides a genuine *source-frozen* key-modification hypothesis, but **it does not unlock LP2 under the historically proven p56 GP register**. A proposed rescue with a source-independent symbol permutation, nonlinear register, alternate key synchronization, changed F behavior, or another cipher layer is a **different model**: it must supply its own explicit source rule and real original plaintext. The 123/202/210 repair counts quantify the amount of adjustment the named direct models require, without suggesting that 123 particular corrections are actually in Cicada's work.

The earlier [historical solve-path reconstruction](../workplace/historical-solve-path-to-original-lp2.md) exhaustively scored all visible-F masks under the unchanged p56 sequence, but did not give this exact zero-cost feasibility test for the independently motivated 19 omission. It remains correct that the historical key transfers have yielded no plaintext; the present source-based check sharpens that conclusion for this specific candidate.

**Executable reproduction:** [Node 22 CommonJS single runnable test](../sims/pgp_may2_missing19_totient_gate.cjs), reading the archived message and [canonical ciphertext](../resources/liber-primus/lp2-corpus.json) verbatim. The script verifies the original p56 85-rune encryption, both synthetic plants, every specified omission, exact pagewise feasibility, and the full 12,956-rune minimum-repair dynamic programs. It does not create a workflow or alter source ciphertext.
