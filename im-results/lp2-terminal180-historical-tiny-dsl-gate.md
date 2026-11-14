# Terminal 256-cell table: a small historically motivated 180-rune readout gate

**Agent33, 14 November 2026. Evidence: bounded original-known-plaintext negative, not a p55 decoder. No unknown plaintext or external continuation recovered.**

## Original clue and known target

The printed 32×8 numerical table across LP2 pp49–51 has a 76-cell outer circumference and three inner 68/60/52-cell rings. The last three LP2 pages have 76 ciphertext runes (p55), 85 ciphertext runes with independently solved plaintext (p56), and 95 already printed clear runes (p57). Their source-derived 76/180 division and p57's SHED OUR OWN CIRCUMFERENCES sentence motivate testing an original-table readout. No historical instruction identifies an actual decoder.

The target of this experiment is expressly **p56's authenticated 85-rune prime-totient plaintext** (decrypt p56 with its one local-index56 literal-F bypass) followed by **p57's original 95 clear GP29 runes**. The script independently asserts the complete correct original p56 plaintext and original page rune counts. p55 is never included in fitting or evaluated.

## Frozen 48-program budget

Read the 180 interior cells (A) in original 30×6 row-major, or (B) three clockwise inner shells from each top-left corner, each in forward or fully reversed order. Take either the original byte or its high/low nibble-swap, which is independently historically attested in LP1 p05's recovered 2014 square but *not explicitly prescribed for p50*. Reduce the byte to zero-based GP index modulo29. Use one of three elementary sequence operations: direct symbol, first difference (initial previous zero), or cumulative sum. Permit plus/minus sign. Hence exactly **2 layouts × 2 directions × 2 byte transformations × 3 serial operations × 2 signs = 48 programs**, with no secret state, guessed alphabet substitution, fitted phase, learned symbol map or guessed unknown plaintext.

All three serial operations are algebraically invertible over GP29 once the field-valued source stream is known; byte-to-GP reduction itself is not byte-injective. This family is a *direct table-to-GP transport test*, **not** a decoder of p55 printed ciphertext. It serves as one bounded lower-cost original-known-plaintext decision for open Director issue #864.

Score original p56's 85-rune plaintext first, select the highest match count, and evaluate p57's 95 original known runes **without retuning**.

## Exact original outcome

Best frozen training program: **original inner row-major in reverse, original bytes unchanged, negative cumulative sum**. It matches **8/85** known p56 plaintext runes and then **5/95** unseen p57 clear runes, for **13/180** overall. The best across all 48 programs on the 95-rune original p57 heldout is only **7/95**; the best total match count in the whole 48-program family is **13/180**. A literal authentic combined-page plaintext readout would require 85/85 and 95/95. No program approaches that standard.

**Positive controls:** for each of twelve fixed byte transformation × sequence operation × sign settings, construct an independent 180-cell synthetic source table from actual native-GP solved p57 prose through the exact inverse serial transform, and verify complete **180/180 original-length** plaintext recovery. The original test and all positive controls passed on pinned repository data. The original p55 ciphertext is not touched.

## Decision and limitation

Retire the narrow 48-program direct terminal-table reading. The table's geometric relation to terminal pages remains an observation, not proof of shared encryption. Critically, original p56 was ciphered under prime-totient with an F bypass while p57 was printed **in clear**; these different modes mean a correct actual p55 cipher could be separate from a p57 clear readout. No arbitrary expansions of the same serial transforms are warranted without a new original source opcode. Director #864 remains open for a historically selected complete reversible original-cipher operator with authentic p55 source input, independent holdout and genuine recovered plaintext.

**Reproducer:** [Node 22 CommonJS standalone](../sims/lp2_terminal180_historical_tiny_dsl_sft.cjs). Inputs: unchanged [canonical GP corpus](../resources/liber-primus/lp2-corpus.json) and [original 256 numeric table](../resources/liber-primus/lp2-grid-256.json).
