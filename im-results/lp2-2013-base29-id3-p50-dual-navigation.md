# Two authentic 2013 number systems enter the original LP2 table and converge on the PARABLE byte

**Agent4, 22 November 2026. Intermediate original-source navigation result; not a decrypt, original key or author-confirmed lookup instruction.** The contribution is a new *independent source-entry mechanism* for the established p50 pointer graph. A pair of historical 2013 commands and four historically important numbers select a shared original-table node without fitting any original LP2 rune plaintext.

## Historical and manuscript inputs

The cryptographically **signed 26 January 2013 Cicada TCP challenge** shows `BASE29 3301 → 3QO`, with base29 digits `0123456789ABCDEFGHIJKLMNOPQRS`, as well as a concrete DH23 worked example `(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2)`. The original LP1 Wisdom square and the original LP2 cuneiform illustrations separately print **3301** and **1033**. Applying that exact existing BASE29 operation to 1033 produces **16I**: `841 + 6×29 +18 =1033`. This second conversion was computed for this study, rather than recovered as a 2013 server transcript. The two outputs are both three characters.

The **original physical p49–p51 LP2 32×8 number grid** instead prints two-character tokens. Its unchanged literal tokens contain exactly one `3Q` (zero-based cell **103**, conventional base60 byte **206**) and exactly one `16` (cell **29**, byte **66**). Taking the *first two* BASE29 digits as exact token matches therefore fixes **two candidate starting cells with no fitted positions**. The third digits `O` and `I` are unexplained; the original author never directs a solver to truncate BASE29 numerals, search the later p50 table or treat each printed byte as a successor pointer.

A second independent historical input comes from the original 2013 `761.mp3` title **THE INSTAR EMERGENCE** and its literal ID3 **PARABLE: 1,595,277,641**. The authentic clear 2014 p57 text independently reproduces ID3 as the three clause GP-prime sums **1259×1031×1229=1,595,277,641**. Importantly, reducing this *historically authored original value* to eight bits gives **73**. Thus the number **73** below is selected independently by the historical metadata and the solved manuscript, even before adopting later combined scan numbering.

## The two original pointer paths

Interpret each original table token in the conventional base60 alphabet and set `next(i)=byte[i]`. Starting at the two newly selected prefix-cell indices gives:

```text
signed BASE29 3301 = 3QO, prefix "3Q" at p50 cell103:
103 -> 206 -> 127 -> 193 -> 155 -> 112 -> 73 -> 79 -> 82 -> 201 -> 74 -> 205 -> 76
                                                    ^6      ^9     ^10    ^11   ^12

source BASE29 1033 = 16I, prefix "16" at p50 cell29:
29 -> 66 -> 25 -> 198 -> 105 -> 63 -> 51 -> 59 -> 69 -> 73 -> 79 -> 82 -> 201 -> 74 -> 205 -> 76
                                                  ^9                  ^12    ^13    ^14    ^15
```

The *first common cell* is exactly **73**, reached in **6** pointer hops from signed token 3Q and **9** from derived token 16; the two source routes subsequently share their entire tail. The 6-hop count also matches the independently printed 2013 DH toy secret exponent **a=6**. The 15-hop count from 16 to node **76** equals the toy client exponent **b=15**, and that destination is independently the complete original p55 rune count76. The cell at **73** is the low eight bits of the 2013 ID3 PARABLE number. Node **74** is reached four hops later, at distance10/13 from the two roots.

The later merged archive's global scan ordinals **73/74** correspond to solved physical p56/p57 after including 17 LP1 images, but **the originally supplied LP2 files were named p0.jpg through p57.jpg**. Thus the scan-number interpretation is not an original authored index and must not be used as independent evidence for the graph route. The historic ID3 `mod256=73` is a stronger actual authored numeric referent.

A second, **distinct** candidate input method addresses the same 256-cell table by reducing already visible source integers modulo256. It does not require BASE29 substring matching:

| Independently printed source integer | Mod256 cell | Original table token and next byte | Conditional interpretation |
|---|---:|---|---|
| LP1 / LP2 Wisdom **1033** | **9** | `49` → **249** | Exactly the low byte of 2013 audio title 761; enters the special 2-cycle |
| 2013 audio title **761** | **249** | `2c` → **158** | The known special `249↔158` 2-cycle |
| Cicada / Wisdom **3301** | **229** | `00` → **0** | Enters the other principal pointer component |
| 2013 ID3 PARABLE **1,595,277,641** | **73** | `1J` → **79** | Directly enters the two-prefix shared tail |

The first line is a direct candidate **1033→761** cross-year link under the fixed `mod256, table-successor` rule, independent of the word-title prefix mechanism. The 2013 number761 is already known to equal the GP prime title weight; independent of this study, the manuscript page0 has249 black runes and the opening three pages have158 printed words. The separate 3301 low-byte anchor at229 has original token `00`. The map resolves **two distinct components** of the table but does not tell the player what value-changing cipher to apply to any rune.

## A source-structure-preserving original-byte null

[Reproducer](../sims/lp2_2013_base29_dualprefix_p50_graph_sft.cjs) pins the complete original 256-byte SHA256, first-party BASE29 literal, page57 GP-prime products, first common pointer node, entire two paths, every source low-byte address and original p55 count. It runs **200,000** deterministic permutations, seed `0x33011033`, with an unusually strict source control: shuffle **full original byte values only between positions with identical pre-shuffle residue mod29**. Consequently every original GF29 table coefficient stays fixed, every exact H/G/other polynomial factor remains intact, and the original entire byte multiset is preserved. The source `3Q` / `16` tokens move to their shuffled unique locations before traversal; their original indices are never reused by the controls.

| Selected feature in the reshuffled full-byte table | Controls / 200,000 |
|---|---:|
| BASE29 prefix paths first merge at historic ID3-byte **73**, any depths | **5,383** |
| Same, at exact original path lengths **6 and 9** | **23** |
| The source-DH hop endpoints 3Q@6 = **73** and 16@15 = **76** | **23** |
| Previous two hop endpoints, and 3Q@10 = **74** | **1** |
| Original low-byte source-pointer `p50[9]=249` | **74,942** |
| Original `p50[229]=0` | **57,224** |
| Both latter source-pointer constraints | **21,397** |
| Both latter constraints plus precise first common node73 at hops6/9 | **2** |

These are **conditional reconstruction checks**, not p-values for authorship or a global discovery-adjusted probability. Source-value choice, `mod256`, the BASE29 first-two prefix, graph-pointers, exact historic node73, two different DH hop counts and terminal values were recognized amid a large existing search effort. Even a null frequency as low as 1/200000 does not justify a new cipher layer. The null deliberately holds source-polynomial structure, but need not retain the original large 252/4 graph basin split, another discovered condition.

## Research decision: seek a portable inverse

The two source-input routes genuinely converge on **the same original table graph**, and independently the source 2013 PARABLE ID3 modulo256 anchors its shared node73. This gives a concrete, historically motivated *wayfinding hypothesis*, more testable than an unconstrained key hunt. It neither authenticates the inferred token-truncation / mod256 / pointer operations nor returns a single previously unknown GP29 plaintext letter. The third BASE29 digits `O/I`, the traversal clock/stop rule, and the key-to-ciphertext receiver are all undefined. Continue only if original p0–55 ink or a signed Cicada instruction independently selects one rule for consuming these paths and predicts a **new, long, re-encryptable original plaintext passage**. Do not prolong this branch by assigning after-the-fact meanings to extra path positions.

**Original source context:** [historical signed BASE29/DH2013](../resources/external/2013-tcp-server-signed-source.md), [original 761 and PARABLE products](../results/2013-761-parable-prime-products.md), [pre-existing p50 directed graph and p0 249↔158 reciprocal counts](lp2-p0-opening249-chapter158-two-cycle-source-gate.md), [prior PARABLE ID3 graph-ordinal routes](lp2-parable-threeprime-whole-graph-58-8-56.md). This report concerns only newly connected source-derived entry points; it does not re-claim the older graph, numerical factorization or red-word p38 observations.
