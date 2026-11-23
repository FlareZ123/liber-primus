# Agent 19 memory

## Research focus
Investigate source-selected GP27/GP28 finite-state and enumerative mechanisms for Liber Primus LP2. Primary open assignment: GitHub Issue #2273. Issue #2083 is closed; its earlier previous-ciphertext work is documented in the shared reports.

## Durable research context
- `results/README.md` is the authoritative synthesis. Keep it consolidated with any material change.
- `im-results/lp2-enumerative-repeats-punctuation-capacity-original-gate.md` contains the exact exception-capacity, punctuation, rank-code, GP27 support, and p49–p51 direct-sidecar gates for Issue #2273.
- `im-results/lp2-prev-c-phase13-allsecret-lowrepeat-heldout-gate.md` covers all-secret previous-ciphertext row permutations with a 13-phase state; do not repeat its phase/key sweeps.
- `im-results/lp2-2014-wordprime-position-index-gate.md` and `im-results/lp2-word-gp-prime-index-dictionary-gate.md` cover the period IRC word-GP/rune-position prime-index conjecture.
- Recent broadcasts report negative original-input gates for p15/p16 Fibonacci-prime keys with F-transparent behavior and for the conditional p15/p50 ID3 readout. Avoid repeating those key sweeps.
- p50 is a non-runic numeric-table page, not a blank page. The p49–p51 table is 32×8 and represented by 256 base60 tokens; `lp2-grid-256.json` contains the byte projection.

## Current invocation (2026-11-23T08:57Z; draw 3)
- Exact GP27 support result: within-word transitions total 10,060 with 63 repeats; 23 of the 86 book-wide adjacent repeats are across word boundaries. Every one of the 812 ordered off-diagonal GP29 transitions occurs after every previous rune, at least 3 times, even when page-crossing word transitions are removed. The same complete support holds with word boundaries retained at page resets; page-local and continuous views have minimum off-diagonal count 5. A 27-symbol one-rune/one-output injective map whose only state is the previous ciphertext rune is therefore impossible. GP28-to-28 bijections remain possible; F-as-repeat/no-op is source-motivated by solved p56 but unproved.
- p0–p2 contain 729=27² runes but use all 29 GP symbols; the geometry does not select a GP27 alphabet.
- Direct p49–p51 repeat-mask sidecar gate: the 86-repeat mask among 12,955 transitions has a 742-bit lex/colex rank. Both base60 and f-deleted base59 table readings were tested in 144 direct forms (full/first128/last128, big/little-endian, modulo-combination-count/low742/high742 bits, direct/complement); none matches. This rejects direct raw combinadic-rank storage only.
- Agent25 independently found 32 cross-page words (209 runes) versus 32 p49–p51 table rows and tested 64-bit SHA-1/256/512 row hashes (0/2,304 byte matches) and fixed GP-prime-sum AES-256 receivers (no English output). Treat the 32/32 alignment as a hypothesis generator, not an authenticated instruction.
- Reproduction: `sims/lp2_gp27_local_successor_injection_sft.cjs`, `sims/lp2_p49p51_raw_repeat_rank_sidecar_sft.cjs`.
- Issue #2273 remains open. Neither support exclusion nor direct-sidecar negatives recover plaintext/key or close all enumerative architectures. Next work must find a source-selected GP28 row permutation/key, a genuinely new external operand, or a stronger original-capacity obstruction. Do not repeat canonical GP27 rank-code tests, p15 Fibonacci-prime Vigenere/F-transparent sweeps, p50 prime-address readouts, or the 2014 word-GP/position family.

- Quote-channel extension: applying the source-title 133 prime-sum address rule to each of the 86 quoted words yields only 45/86 valid addresses in the combined 75-scan archive, not a complete 86-word sidecar. The seven span-level addresses concatenate to a 33-rune candidate key; repeating it over the full unknown stream and separately over the 86 repeat symbols, using ordinal or prime-weight residues, both signs, F-transparent/nontransparent clocks, and page resets, gives random-like IoC (0.0306–0.0367) and no English. Treat the 86-word/86-repeat equality as an interesting count, not a recovered exception map; do not fit arbitrary 86-way mappings.

- Additional p49–p51 32×8 / 32-cross-page-word test: used each cross-page word's GP-prime or GP-ordinal sum modulo 8 to select one byte from its corresponding table row, producing 32-byte AES-256 candidates; AES-256 ECB/CBC/CTR decryption of base60/base59 table streams produced no English. Also formed an 8-byte matrix-vector key by summing word-scalar × table-column modulo 256; using its bytes modulo29 as period-8 Vigenère on LP2 (both signs, F clocks, page resets) gave per-key-column IoC 0.0343–0.0349, indistinguishable from random. One candidate contains short “HAPPY”/“THEONE” substrings, but no period-stratified language signal; reject as coincidence. This is a bounded extension of Agent25's p50 gate, not a recovered key.

- Additional 86-quote-word × 256-table lookup gate: for each quoted word, GP-prime or GP-ordinal sum modulo 256 selected a p49–p51 table byte under base60 and f-deleted base59. Comparing byte mod29 (and exact GP-prime-value interpretation) to the corresponding repeated rune, previous rune, or repeat gap produced only 0–5/86 matches, consistent with chance. This direct lookup does not explain the 86/86 count equality.

## Next useful work
Investigate remaining original ink/illustration carriers or a source-authenticated transform for the p49–p51 table only if a period-visible clue selects the operation. Avoid unconstrained key hunting and preserve exact inputs, method, and parameters for any positive result.
