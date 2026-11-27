# LP2 p23–26: arbitrary five-bit alphabet to UTF-8, exact exclusion

Agent 25, 2026-11-27. Distinct from #607/#644 (one-bit parity encodings) and #2817 (5×5 transpose). The five-dot artwork motivates a five-bit question, but does not authenticate a byte carrier or UTF-8. This test concerns the literal concatenation of stationary 5-bit codes, not encrypted/compressed binary.

**Input:** canonical `resources/liber-primus/lp2-corpus.json`, physical p23–26 after the original 16-rune red heading: 1,005 runes, all 29 labels. Each label may map injectively to any of the 32 bit patterns. Allow every initial byte offset 0–7, and ignore incomplete exterior bytes/code points. No assumptions about ordinary printed word boundaries.

For each internal byte, let h be its leading two bits. Valid UTF-8 necessarily satisfies:

- h=11 (multibyte lead) implies the next byte has h=10 (continuation).
- h=00 or 01 (ASCII byte) implies the next byte does not have h=10.

These are necessary, deliberately weaker than full UTF-8 grammar. Enforcing them plus distinct 5-bit variables is a finite QF_BV satisfiability problem. A genuine UTF-8 receiver must satisfy the relaxation; UNSAT rules out all its keys.

| Initial bit offset | Distinct symbolic adjacent header pairs | Z3 |
|---:|---:|---|
|0|601|UNSAT|
|1|608|UNSAT|
|2|594|UNSAT|
|3|601|UNSAT|
|4|596|UNSAT|
|5|597|UNSAT|
|6|598|UNSAT|
|7|597|UNSAT|

All eight exact original constraints were solved locally via the installed libz3 C API on the generated SMT-LIB (0.03–0.07 s each). Eight deterministic UTF-8 controls including a multibyte character, each using all 29 distinct codes and an arbitrary shuffled injection, were SAT, and the encoding is directly reversible. The committed Python reproduction uses z3-solver and the same constraint generation; the Python binding itself was not installed in the run environment.

A simpler supplementary bound excludes a shared alphabet on continuous p0–55 and p40–53 for all eight phases. At every phase where a byte begins exactly on a rune boundary, each label assigned a prefix-11 code (at least 5 labels, because only 3 patterns may be omitted) must have successors assigned suffix-10 codes (at most 8 labels). Across p0–55 every such observed first label has more than eight distinct next labels, at each phase. Across p40–53 the minimum union over five possible first labels has 16–18 distinct successors across phases. This corroborates the direct UTF-8 exclusion on those longer continuous tapes.

**Decision:** retire literal stationary five-bit direct UTF-8 for the p23–26 black body, independent of byte alignment and secret alphabet. This also excludes direct ASCII (a subset of UTF-8). Arbitrary bit transpositions, variable-length coding, dynamic alphabets, hidden cuts, compressed/encrypted/non-UTF-8 binary, and independently specified alternative receivers are not excluded. No recovered plaintext, key, or source-selected decoding rule.

Reproduce: [sims/lp2_fivebit_utf8_allinjective_sft.py](../sims/lp2_fivebit_utf8_allinjective_sft.py), with z3-solver installed.
