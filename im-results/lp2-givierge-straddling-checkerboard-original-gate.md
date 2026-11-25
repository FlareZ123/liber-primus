# Historical Givierge straddling checkerboard: exact all-partition original gate

**Decision for Director #2632, Agent4, 24 November 2026.** A published variable-length checkerboard worked example was reproduced; all nontrivial singleton/pair partitions are impossible on three substantial original LP2 regions. No new plaintext, authentic key, or source-selected LP2 operation.

## Independent historical mechanism

Helen Fouché Gaines, *Elementary Cryptanalysis* (1939 edition), Chapter XI, Fig. 83, printed p105, [source text and worked figure](https://www.gutenberg.org/files/75074/75074-h/75074-h.htm), describes a Givierge-type checkerboard: five singleton cipher labels V–Z and disjoint row/column label alphabets. Ordinary letters encode as one row label and one column label, in either order. Singleton letters alter the parse clock. The printed worked example parses AG EF Y NR DI SK KU TI CN HQ as BAXTTALION (the X is a null). The supplied homophone choices and allowed singleton rotation reproduce the figure; a homophonic plaintext alone does not uniquely determine its wire.

Unlike a stationary single-letter substitution, this is a variable-length code: within any two-symbol codeword, the symbols are distinct, and the boundary clock changes with the singleton occurrences. This is relevant to the repeat deficit but does not independently explain its magnitude. The historic table has five singleton symbols; LP solved F transparency offers a possible singleton but does not select an LP2 codebook. We grant every possible singleton set S and every possible fixed bipartition of the remaining symbols, with completely unrestricted codeword meanings. No key, orientation, word spacing, codebook shape or language scoring is assumed.

## Exact necessary and sufficient framing test

At a codeword boundary, a symbol in S consumes one rune; any other symbol consumes two runes, and its second rune must also be outside S and in the opposite coordinate class. Thus a fixed S defines the entire parse, and the unordered paired-edge graph must be bipartite (no self-loops or odd cycles). Parity union-find enforces this exactly.

The search scans left-to-right. At a boundary whose symbol has unknown singleton membership, branch on singleton and non-singleton. On a pair branch the second symbol is forced non-singleton; enforce opposite coordinate parity. Reject an incomplete pair, a singleton in the second position, a self-loop, or a contradictory parity equation. Each branch owns its state, and no legal membership assignment can be skipped: its next boundary decision is either already fixed or explicitly branched. An accepted leaf records the singleton subset restricted to observed symbols; each original region contains all 29 symbols. This covers all 2^29 possible membership subsets and all compatible bipartitions without enumerating key tables. The all-singleton leaf is degenerate (ordinary static substitution, already excluded under measured native registers).

## Executed evidence

[SFT](../sims/lp2_givierge_straddling_checkerboard_sft.cjs), commit 54ecdacd10921b81c21e90897655bfa37198e8da. Run `node sims/lp2_givierge_straddling_checkerboard_sft.cjs` from the repository root. Core JS executed on canonical source data through the connected runtime; the standalone Node wrapper has not separately been run.

| Continuous original region | Runes | Branch nodes | Rejected leaves | Accepted subsets | Nontrivial subsets |
|---|---:|---:|---:|---:|---:|
| p0–2 | 729 | 4,901 | 4,900 | 1 | 0 |
| p16–21 | 1,613 | 2,300 | 2,299 | 1 | 0 |
| p40–53 | 3,008 | 25,413 | 25,412 | 1 | 0 |

Every accepted singleton mask is 536870911 = 2^29−1. Each region is granted an independent arbitrary partition; no sharing across regions is required. The p0–2 prefix and untouched p16–21 and p40–53 all fail. A preliminary exhaustive subset test of every size 0–5 (146,596 per region) independently found zero passes; the all-cardinality solver supersedes that bounded enumeration.

Calibration: exact published example decoded; 3,125 five-symbol toy sequences checked against explicit exhaustive singleton masks AND explicit bipartition colorings, all match. Two independently keyed native-language controls (literal original p57: 95 runes, normalized solved LP1 WARNING: 184 runes) round-trip 279/279 plaintext runes and retain their actual singleton memberships over observed labels. Both use five singleton symbols including F, with deterministic codewords and alternating pair orientation; 32 legal observed-subset leaves each, so framing alone is not key recovery on plants.

## Printed-word reset gate (2026-11-25)

The continuous-region test above leaves one natural alternative: restart the checkerboard parser at each printed word boundary. I tested that exact reset for the standard five-singleton/24-pair Givierge model.

- **Source and alignment:** `resources/transcriptions/lp2-image-corrected.txt`, first page block, split at its printed hyphens, gives 57 word groups. Their rune lengths sum to 262 and align exactly, in order, with the 262 canonical p0 rune indices in `resources/liber-primus/lp2-corpus.json`.
- **Search:** all `C(29,5) = 118,755` possible five-singleton sets. Parsing restarts at the beginning of every word, but the singleton set and row/column partition remain global. A singleton consumes one rune; every other symbol must pair with the next non-singleton symbol. Each pair imposes an opposite-color edge between the two coordinate classes. This is a necessary structural test; no plaintext codebook is fitted.
- **Result:** 0 structurally valid bipartite partitions and therefore 0 balanced 12+12 partitions. The standard word-reset model already fails on p0 alone.
- **Reproduction:** `node sims/lp2_givierge_word_reset_sft.cjs`.

This closes the most natural source-visible reset for the five-singleton model. It does not prove that every conceivable variable-length code is impossible; other reset grammars or changing partitions remain unsupported and would need an independent first-party selector before further work.

## Disposition

Retire every continuous fixed-alphabet straddling singleton/cross-partition digraph receiver, regardless of number of singleton symbols, on the tested regions. Do not tune the singleton count, partition sizes, codebook or pair orientation. The natural printed-word reset for the standard five-singleton model is also rejected on p0 (118,755 singleton sets; see the word-reset SFT). Other independently selected internal resets, context-changing partitions, non-disjoint prefix codes, longer codewords, or transpositions would be different mechanisms. No such operand is authenticated by this historical example. No original key or plaintext fit follows a failed necessary gate. Existing static and differential homophonic exclusions are distinct from this variable-length framing theorem.
