# Unknown 8+5 independent F-hold layers: arbitrary-offset anchors and free word segmentation

Extends [unknown-key inference](lp2-p0-red8-red5-unknown-layer-original-gate.md). No plaintext recovered. The prior anchored exclusion depended on the fourth printed group. Here neither anchor position nor dictionary segmentation follows original group boundaries.

For all 3,442 surviving cyclic outer classes, propagate exact five-phase support from both ends of the 716-rune body. At every possible start offset, enumerate every compatible intermediate q path of length 11, 12, 13 or 14. For each lexicon encoding, group by F-position mask; the mask must be a subset of q's zeros. With non-F positions j_0,...,j_(m-1), equality of repeated inner residues implies q[j_t]-q[j_(t mod 8)] = p[j_t]-p[j_(t mod 8)] mod29, for t>=8. Index candidate words by this signature to avoid repeated full dictionary scans. All tested words have >=8 non-F runes; derive every inner residue from first eight non-F positions. Normalize inner phase zero at anchor and preserve selected outer phase. Full joint reachability now **enforces exact candidate anchor plaintext**, not merely its inferred keys.

| Anchor length | Dictionary words | Compatible outer paths over all offsets | Word/path signature matches | Surviving cyclic key pairs |
|---|---:|---:|---:|---:|
| 11 | 2,171 | 3,673,669 | 323,327 | 14 |
| 12 | 1,239 | 3,706,360 | 6,475 | 1 |
| 13 | 630 | 3,739,441 | 102 | 0 |
| 14 | 271 | 3,772,522 | 1 | 0 |

Every survivor has a complete 716-rune inverse witness. None passes native A/I singletons at original printed groups; more importantly, none can be freely segmented into native lexicon words, **without respecting printed group boundaries**. Exact trie DP states are (inner phase, outer phase, open lexicon trie node); consume each reachable plaintext rune, extend trie, and optionally reset at terminal nodes. At end only root states accept. Restrict one-rune words to A/I. Keep the inferred anchor exact. Earliest prefix failures span runes 7–12 (one-based).

| Offset (zero-based) | Inner key (base29, anchored phase 0) | Outer key (base29) | Outer phase at anchor | Anchor (base29) | Trie prefix failure |
|---:|---|---|---:|---|---:|
| 471 | 3r5l1j3c | 0006j | 2 | n4o7a96433j | 9 |
| 210 | frco0le9 | 000cs | 1 | 539fg415gal | 7 |
| 549 | o7h99hfg | 009ia | 0 | f144i9ni4in | 9 |
| 490 | mhgc4d7k | 00opa | 2 | 31i4fgiddin | 10 |
| 504 | h0f0c2j0 | 0130o | 0 | idag8ika3jo | 8 |
| 334 | 1m02c0bn | 019ia | 2 | 19f7i41alkq | 11 |
| 39 | qom07qk0 | 04ocj | 3 | 5319gi9o95i | 11 |
| 207 | 10hmf0o0 | 0ec0j | 3 | 534d34oga39 | 12 |
| 669 | 0r1h73nf | 0ic0j | 4 | ja543d8o6if | 7 |
| 622 | ij202qor | 0j0pi | 2 | 539g4ah1gal | 10 |
| 132 | lrhe0m1e | 0jgoc | 2 | ki96g8i9a96 | 8 |
| 99 | 03q5mr01 | 0ocjf | 4 | fido4ogafgf | 10 |
| 203 | 8004491f | 0pic1 | 0 | 4c551doga39 | 8 |
| 197 | ecqp7nrp | 2ikfj | 3 | hko55joakin | 12 |
| 587 | 5e04223m | 00opa | 1 | a9gi4fi5ga96 | 8 |

These are false-positive isolated lexical cribs on mathematically compatible paths; the surrounding plaintext is not native lexicon-supported. Three genuine p57 positive controls, with supplied outer keys and known anchor, admit complete free segmentation of all 95 runes. Previous SFT recovers their actual inner key uniquely with supplied outer and fixed 14-rune anchor. This is not an all-English exclusion: it requires at least one 11–14-rune word among finite encodings, lexicon coverage for complete segmentation, specified two independent F-hold periodic layers, and no insertion/deletion/reset in this body. Short-only, out-of-dictionary, different periods, and other constructions remain outside scope.

## Reproduction

`node sims/lp2_p0_red8_red5_sliding_anchor_sft.cjs` from repository root, Node and GCC/Clang C++17 compiler on PATH (CXX override). The wrapper reuses previous SFT's source parsing, lexicon and exact outer enumeration and compiles the indexed C++ search in a temporary directory. It also performs exact trie segmentation and forward replay, and provides a sliding positive-control check.

Actual original search executed using compiled C++ and Python exact trie/witness DP on the source-checked rune tape and same 35,895-word lexicon; every count shown is observed. All three p57 fixed-anchor segmentation plants passed. A separate pure JS sliding attempt timed out; compiled implementation is preferred. The repository wrapper is supplied for reproduction, not claimed as a completed standalone CI execution.
