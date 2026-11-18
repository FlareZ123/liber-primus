# Title133 event-class and combinadic-rank audit

**18 November 2026, Agent3, Director #1691. Classification: negative source-selection result for the red13 combinadic continuation. The numerical title/capacity equality and canonical-rank factorization remain reproducible observations, but they do not yet identify an authored event object or rank operation. No unknown plaintext, key, or authenticated hidden-service destination is recovered.**

## Decisive source-level result

The authentic 2014 delivery wrapper contains literal `<title>133</title>`. The equality

```text
bit_length(C(256,31) - 1) = 133
```

is exact.

It does **not** uniquely identify the previously chosen `225 red runes + all 31 physical thirteen-dot marks` object. Earlier original-image work established three compact, source-visible mark predicates, each selecting exactly 31 marks. Combined with the same 225 red runes, each therefore forms a distinct 31-of-256 event tape and has the identical 133-bit fixed-weight state capacity.

| class | visible predicate | selected marks | total with 225 red runes | fixed-weight capacity |
| --- | --- | ---: | ---: | ---: |
| A | all physical 13-dot marks, regardless of ink color | 31 = 30 red13 + 1 black13 | 256 | 133 bits |
| B | red large marks whose dot count is prime | 31 = 30 red13 + 1 red23 | 256 | 133 bits |
| C | original chapter/section marks | 31 = 28 dot13 + 3 dot10 | 256 | 133 bits |

The three mark sets are pairwise distinct. Their event orders and downstream cell correspondences differ.

Class B is not an arbitrary mixed punctuation set: it has a single visible predicate, red ink plus prime dot count. Class C is likewise a single typography predicate, chapter/section marks. Existing #1278/#1282 source audits found no first-party instruction that chooses A over B or C.

Therefore title133 identifies a shared **cardinality/weight property** of several natural source objects. It cannot serve as an independent selector for class A.

## Consequence for the later rank convention

The later p55/p27 route removes the black 13-dot mark and works with the red-only 30-of-255 tape. Its full fixed-weight state capacity is:

```text
bit_length(C(255,30) - 1) = 130
```

rather than 133.

The existing canonical-rank census remains arithmetically valid: among forward/reverse lex/colex and zero/one-based variants of that already-selected 30-of-255 tape, only zero-based forward lex rank has the published `19 × 31 × 103 × q35 × q79` factorization.

That fact is a **downstream factor discriminator**. The labels 19, 31, 103, 35 and 79 were recognized in the later navigation route after the rank candidate existed, and this issue has no independent pre-factorization consequence that selects lex ranking itself. The original wrapper does not name ranking, lexicographic order, combinadics, or the red-only reduction.

Accordingly, the canonical factor match can be retained as a checksum on the candidate route. It does not satisfy the stronger claim that the author-era source uniquely selected the event object and rank convention.

## Director fork

The negative fork applies:

- preserve the exact 133-bit equality and the rank/factor arithmetic;
- do not treat title133 as uniquely selecting the all-13-dot tape;
- do not use the factorization alone to authorize further combinadic, neighboring-rank, onion-label, or KDF continuation;
- reopen only if an independent source-visible rule chooses among A/B/C and supplies a rank-semantic prediction before factor inspection, or if an authenticated historical receiver consumes the exact frozen output.

The separate `SURFACE → 331` route may still lead a solver to the original wrapper. This audit only removes the stronger inference from seeing title133 to one uniquely determined combinatorial object/operation.

## Reproduction

- SFT: [`sims/lp2_title133_eventclass_uniqueness_gate_sft.cjs`](../sims/lp2_title133_eventclass_uniqueness_gate_sft.cjs)
- Windows Node22: [PASS 44425060816](https://github.com/FlareZ123/liber-primus/actions/runs/44425060816)
- Director task: [#1691](https://github.com/FlareZ123/liber-primus/issues/1691)
- Prior source-class audits: [#1278](https://github.com/FlareZ123/liber-primus/issues/1278), [#1282](https://github.com/FlareZ123/liber-primus/issues/1282)
