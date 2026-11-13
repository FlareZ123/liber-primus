# p32 word-prime sums as linear addresses into the p50 256-entry table

**Agent 2, 13 November 2026. Classification: bounded source-motivated original-input negative.** No unknown plaintext, authentic key, cipher mechanism, or destination is recovered.

## Proposed human solve path

The independently signed 2016 Cicada message says that Liber Primus's words are a map and their numbers are the direction. Physical p32 is the tree page linked to that signed image. The repository's established p32 analysis records **22 words visible on p32**, including one incoming word carry from p31, and gives their GP-prime sums. Physical pp49–51 contain a printed **32×8 numeric table**, represented in the repository as 256 provisional base60-to-byte values.

A simple interpretation not covered by the existing word-indexed row/column and compass-walk tests is to use each p32 word-prime sum as a **linear address** into the 256-entry table. Since the table has 256 entries, the two ordinary address conventions are zero-based sum modulo 256 and one-based (sum minus 1) modulo 256. Read the table in its printed row-major order, take the selected value modulo 29 to obtain one GP29 key symbol per p32 word, and use the resulting 22-symbol key as a repeating additive key. The standard GP29 additive inverse is a motivated consumer because the solved p56 passage demonstrates prime/totient additive encryption; the source does not, however, explicitly prescribe this p32-to-p50 transfer or a repeating 22-symbol clock.

The immediate following illustrated section pp33–39 is a natural local target for a p32-derived map. The entire unknown LP2 stream pp0–55 is also tested to avoid making the conclusion depend on that local choice.

## Frozen source values

The exact p32 visible-word GP-prime sums, including the incoming carry, are:

~~~text
[73,125,267,613,191,184,14,540,458,535,183,442,196,497,160,446,98,203,96,348,160,216]
~~~

The 256 table values are read in printed row-major order from resources/liber-primus/base60-grid.json. The resulting keys are:

| Address convention | 22 selected bytes (hex) | 22 GP29 key symbols |
|---|---|---|
| Zero-based | 4f14dee52180b796d1575113b08de9aa4844deece98e | NG L M Y R EO N C G F D M TH AE U AE X I M R U Y |
| One-based | a40d9c53aa5104194a3ba79c5990f8c096d12331f854 | M P J AE AE D R AE T U OE J TH EA T E C G G L T Y |

The key extraction is completely fixed: no selected row, orientation, phase, or table-cell offset is fitted after looking at plaintext.

## Original-input results

Both key candidates were applied continuously from the beginning of each target, with the two additive signs. No per-page or per-word reset was added.

| Target | Address convention | Operation | IoC | Adjacent equal pairs |
|---|---|---|---:|---:|
| pp0–55, 12,956 runes | Zero-based | C−K | 0.03449559 | 461 |
| pp0–55, 12,956 runes | Zero-based | C+K | 0.03452138 | 457 |
| pp0–55, 12,956 runes | One-based | C−K | 0.03446985 | 389 |
| pp0–55, 12,956 runes | One-based | C+K | 0.03445569 | 421 |
| pp33–39, 1,680 runes | Zero-based | C−K | 0.03435293 | 71 |
| pp33–39, 1,680 runes | Zero-based | C+K | 0.03458691 | 63 |
| pp33–39, 1,680 runes | One-based | C−K | 0.03445858 | 47 |
| pp33–39, 1,680 runes | One-based | C+K | 0.03445503 | 50 |
| p55 complete-word body, 75 runes | Zero-based | C−K | 0.03459459 | 3 |
| p55 complete-word body, 75 runes | Zero-based | C+K | 0.03747748 | 5 |
| p55 complete-word body, 75 runes | One-based | C−K | 0.03459459 | 3 |
| p55 complete-word body, 75 runes | One-based | C+K | 0.02954955 | 3 |

For comparison, the original unknown-book IoC is **0.03447840**, the raw pp33–39 IoC is **0.03436002**, the raw p55 75-rune body IoC is **0.03855856** (one adjacent equal pair), and the solved p57 control IoC is approximately **0.06271**. The p55 test starts the 22-symbol key at the first new rune after its incoming p54 carry; this local reset is a diagnostic convention, not a source-authenticated clock. The decoded previews are nonlinguistic. None of the twelve original-input outputs shows the symbol concentration expected from the solved GP plaintext control. The changed adjacent-repeat counts are a side effect of a periodic key, not evidence of recovered text.

The script also plants known solved-p57 GP plaintext under each fixed key and recovers every planted symbol exactly. This checks the additive implementation and key clock; it does not authenticate the key.


## Skip-aware follow-through: fixed-plaintext rejection model

A direct additive failure does not exclude a cipher in which a key position is rejected when it would reproduce the previous ciphertext symbol. The manuscript's strong adjacent-repeat suppression makes that a separate architectural question. The red-ink study records 13 dropcaps among 16 annotated red spans, so the exact ratio **13/16** is a source-derived candidate rejection probability. It is not an authenticated cipher instruction; this is a bounded hypothesis, not an established mechanism.

The 22-symbol key was therefore tested under a fixed-plaintext keyskip model on **pp33–55 as one continuous 4,996-rune stream**, starting at key phase zero on p33. If a candidate key position would reproduce the preceding ciphertext, it is rejected with probability 13/16; the same plaintext symbol is tried against the next key position. The accepted output is allowed to repeat with probability 3/16. The decoder permits at most four rejected key positions per emitted rune. It uses an English trigram model trained on the repository's Shakespeare control text; therefore this is an English-register test, not a multilingual exclusion.

| Address convention | Operation | Selected skips | Decoded IoC | Adjacent equal pairs | English trigram score/rune | Original-key rank among 21 |
|---|---|---:|---:|---:|---:|---:|
| Zero-based | C−K, keyskip | 99 | 0.03478947 | 140 | −5.81324762 | 19 |
| Zero-based | C+K, keyskip | 92 | 0.03483355 | 126 | −5.79215067 | 8 |
| One-based | C−K, keyskip | 119 | 0.03494936 | 156 | −5.80008278 | 14 |
| One-based | C+K, keyskip | 101 | 0.03484173 | 124 | −5.79884868 | 10 |

The rank compares each source-ordered key with 20 deterministic shuffles of the same 22-symbol multiset, using seed 0x20261113. None of the source-ordered keys ranks first. The best is rank 8/21; the other ranks are 10, 14 and 19. The original key order is therefore not distinguished from shuffled order by this English-trigram adjudicator. The p55 75-rune complete-word body extracted from the best path remains nonlinguistic (IoC 0.03813 for the best-scoring zero-based C+K path).

**Positive control:** for each key/sign pair, the first 75 solved p57 runes were planted through the same 13/16 rejection process, with a deterministic xorshift seed and the same four-rejection cap. The decoder recovered **75/75** planted runes in all four cases (the plants used 1–6 rejected positions). This validates the implementation on a known plaintext under the tested model; it does not authenticate the source-derived key or model.

The exact score, skip path, p33–39 preview, p55-body preview, positive-control result, and shuffled-key null summary are emitted by the reproducer. The skip-aware result does not rescue the p32→p50 key: the decoded text remains ciphertext-like, and the source-ordered key is not exceptional against its null.


## Latin-register follow-through

The English-only limitation was addressed with the repository's existing GP-encoded Latin Vulgate trigram model: eight source files, 203,357 GP symbols, and the same documented GP orthography used by the keyskip decoder. The model is loaded from resources/control/latin-vulgate-gp-trigrams.json. A positive plant uses the first 75 GP runes from Luke 1:1 in the public-domain Vulgate source file [NT_Vulgate/corpus/luc_1.txt](https://github.com/computationalstylistics/NT_Vulgate/blob/master/corpus/luc_1.txt); its source blob SHA is 6910bf1b9b97a72f570f91e705daf0a970291423. The 75-rune plant is embedded in the reproducer, so no network fetch is required to rerun the test.

The same continuous pp33–55 target, p33 key phase zero, 13/16 rejection probability, four-rejection cap, and 20 shuffled-key nulls were used. Only the language model changed.

| Address convention | Operation | Selected skips | Decoded IoC | Adjacent equal pairs | Latin trigram score/rune | Original-key rank among 21 |
|---|---|---:|---:|---:|---:|---:|
| Zero-based | C−K, keyskip | 121 | 0.03485495 | 146 | −6.51853019 | 15 |
| Zero-based | C+K, keyskip | 83 | 0.03483347 | 133 | −6.56627352 | 21 |
| One-based | C−K, keyskip | 118 | 0.03511790 | 160 | −6.51988611 | 6 |
| One-based | C+K, keyskip | 122 | 0.03491474 | 137 | −6.56009982 | 17 |

All four Latin positive plants were recovered **75/75**. Against 20 deterministic shuffles of the same key multiset, none of the source-ordered keys ranked first; the best was 6/21. The one-based C−K variant beat 15/20 shuffles but still ranked only sixth, while the other three ranked 15th, 17th and 21st. The p55-body excerpts remain nonlinguistic; the best-ranked one-based C−K path has p55-body IoC 0.03820.

This is a useful alternate-register check, not proof that every possible Latin register or historical text is excluded. It does, however, remove the simplest Latin Vulgate explanation for this exact p32-derived key under the tested 13/16 keyskip architecture.

## Decision

**Retire this exact linear-address key construction and the tested additive and 13/16 fixed-plaintext keyskip consumers.** It is distinct from the already rejected single-word self-indexed row/column lookup and previous-word compass traversal: here the 22 p32 word sums directly address 22 cells in the 256-entry table, yielding a 22-symbol key. The direct output fails on both the immediate p33–39 section and the full unknown book.

The result does not invalidate the signed 2016 navigation instruction, the p32 word-prime sums, or the 32×8 table. It only rejects the two fixed address conventions, row-major table order, byte-mod-29 symbol conversion, continuous 22-symbol key under direct addition, and the tested 13/16 fixed-plaintext keyskip consumers under English and Latin Vulgate trigram models. Both keyskip tests are capped at four rejected positions per output. Do not rescue this branch with fitted offsets, alternate cell orders, new key resets, larger skip bounds, or unrelated KDFs without a new independent source instruction.

## Reproduction

Run from the repository root:

~~~bash
node sims/p32_wordprime_linear_table_address_key_sft.cjs
~~~

The standalone script reads the canonical corpus, transcription, numeric grid, Shakespeare control and Latin Vulgate trigram counts; asserts all 22 visible p32 word sums and the 256 table cells; prints the exact extracted keys; evaluates the direct additive inverses; runs the 13/16 keyskip Viterbi on pp33–55 with 20 shuffled-key nulls per candidate under both English and Latin models; and checks solved-p57 and Latin-Vulgate positive plants. The base60-to-byte table interpretation remains conditional, as in the upstream table analyses.

Related existing work:
- [Authoritative research synthesis](../results/README.md)
- [Word-prime / 32×8 self-indexed row-column test](lp2-wordprime-grid32x8-selfindexed-gate.md)
- [Previous-word prime-sum compass traversal](lp2-wordprime-compass-grid-causal-inverse.md)
- [p32 prime-pointer and compass graph](p32-prime-pointer-compass-original-gate.md)
- [Original table interpretation](../resources/liber-primus/base60-grid.json)
- [13/16 red-ink filter-parameter gate](lp2-red-ink-1316-filter-parameter-gate.md)
- [Existing keyskip Viterbi implementation](../sims/grid_keyskip_viterbi.cjs)
- [Existing keyskip Viterbi findings](grid-keyskip-viterbi-20261110.md)
- [Anti-repeat identifiability and capacity gate](lp2-anti-repeat-lossless-capacity.md)
