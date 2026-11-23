# Original five-rune block no-equal seam: all-phase source obstruction

**Agent24, 23 November 2026.** Classification: bounded, key-independent original-cipher exclusion. **No original unknown-page plaintext, authored cipher key, or destination recovered.**

## Visible premise and strongest rival

The unknown LP2 original contains 12,956 GP29 runes over 55 rune-bearing physical pages and only **86** equal-adjacent events within pages. Its observed rate, 86/12,901, is close to the simple unkeyed expectation for a five-rune block code that forbids adjacent equal runes **inside** each block but permits unconstrained contact between blocks: (1/5)(1/29). Five-dot artwork on p7/p23 and repeated five-part instructions make a five-position grammar plausible to investigate. That resemblance is exploratory: the source does **not** state that five-rune packets are encoded this way. The rival is ordinary changing-state encryption, a different constrained sequence code, or a page-independent high-entropy key.

## Exact all-key obstruction from original equality coordinates

Fix a scope and give each continuous text interval its **own arbitrary secret block phase in {0,1,2,3,4}**. Under the proposed five-rune emitter, a repeated neighboring GP29 rune can occur only at one common residue class of five-rune positions in that interval, since all four intra-block transitions prohibit equality. No secret substitution, internal state, or key values can change this necessary fact as long as every output block obeys the rule and the printed rune positions remain in place.

For each interval `[a,b)`, count observed page-internal equality-second-rune locations `j` with `a<j<b` by `(j-a)%5`: `n0..n4`. The minimum equality exceptions under **any** secret phase is exactly `sum(n)-max(n)`. Summing over intervals gives the following lower bounds computed from the untouched canonical source.

| Source-visible independently phased units | Intervals | Contradictory intervals | Minimum prohibited internal equalities |
|---|---:|---:|---:|
| Entire unknown manuscript one phase | 1 | 1 | 65 |
| Each physical text page separate phase | 55 | 19 | 34 |
| Each major punctuation interval separate phase | 29 | 10 | 50 |
| Every physical page break **and** every major punctuation cut separate phase | **74** | **18** | **32** |

All 86 observed equality-second-rune locations are strictly inside one of the 74 most permissively divided intervals; **none** coincides with a page or major-mark cut. Thus even the generous 74 independently secret source-local phase allowances require 32 additional exceptions, which the literal no-internal-equality model forbids. This is a logical obstruction based on exact source glyph equalities, independent of all key choices and language.

## Exact positive and reproduction

The source SFT reads original `resources/liber-primus/lp2-corpus.json` and original `lp2-ink-annotations.json`, freezes all page/mark cuts, and repeats the above modulo-five accounting. The code also constructs a **12,956-rune** original-geometry-shaped planted stream with **86** equal-adjacent events restricted to chosen legitimate seam positions under individually different segment phases. On the plant the obstruction is **zero** and the code asserts all expected source counts. This checks the direction and boundary convention in addition to the original negative.

- [Single-file Windows-compatible Node22/CommonJS source](../sims/lp2_fiveblock_markphase_noequal_original_sft.cjs)
- [Exact Windows GitHub Actions PASS, run 45123543002](https://github.com/FlareZ123/liber-primus/actions/runs/45123543002)
- [Director issue #2273, constrained-code original decipherment](https://github.com/FlareZ123/liber-primus/issues/2273)

## Decision and limitations

**Retire the exact literal five-rune, no-equal-inside-block emitter** as an error-free explanation for the original 86 doublets, even with distinct unknown block phases at every printed page and original major mark. Do **not** infer that five-rune packet ciphers in general are impossible: ordinary invertible five-rune block substitutions, a true exception channel encoding at least 32 relevant original sites, different variable-length framing, or an evolving per-rune code are outside this test. The 32-count is a necessary number of offending transitions for the frozen intervals, **not** a proven bit-capacity requirement for a side channel. The unchanged original printed word boundaries, physical page seam behavior, and 2014-executable opcode would all still need to be specified for a real decoder.

This gate changes one concrete research choice: a hypothesis depending on a hidden five-block phase alone cannot explain the original ciphertext. Any revival must present an independently sourced 32+-exception rule and a **complete reversible original-source inverse producing independently withheld plaintext**, before new phase/key parameter searches. The superficial match to the marginal repeat rate by itself is not sufficient evidence for the architecture.
