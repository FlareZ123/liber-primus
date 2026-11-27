# Five-bit Fibonacci payload: all-static-injection failure or universal nonidentifiability

The earlier grid-code study packed Fibonacci codewords into five-bit groups and left a final `11` outside them. Here the same four codebooks from the [BASE29 payload study](lp2-p15-fibonacci-payload-base29.md) encode plaintext instead of the sixteen-number key. In the original experiment each complete five-bit group is a GP index (0–28); an unprinted suffix of zero through four bits may complete the final codeword in each frame. This is hypothetical, not authenticated. A prefix trie and all 31 possible suffixes give an exact inverse. DP allows every contiguous split of the original 1,883-rune p15-body–p22 tape.

| Codebook | Any suffix: max prefix | Fixed suffix 11: max prefix | Any suffix: valid printed groups / 432 |
|---|---:|---:|---:|
| ordinal | 1883 | 1 | 140 |
| gematria-prime | 4 | 0 | 24 |
| p15-fibonacci-prime | 0 | 0 | 11 |
| p15-absolute-difference | 0 | 0 | 0 |

All four fail every fixed chapter, page and physical line even with arbitrary suffixes; all fail the full tape with arbitrary cuts and fixed suffix 11. Three fail even arbitrary cuts and arbitrary suffixes. Native p57 controls round-trip with supplied suffixes and hidden-cut inverse accepts the plants.

The ordinal survivor is **universally nonidentifying**: each of all 29 possible five-bit GP digits admits at least two distinct, equal-length plaintext sequences under this free-suffix convention. Every alternative is forward-verified. Hence any N-digit ciphertext admits at least 2^N different plaintexts of the same length, even with known singleton frame cuts. The product for the original tape has 854 decimal digits, all with 3,329 plaintext runes. For example, first original digit 10: 01010 + 11 and 01010 + 011 decode to GP indices 19 and 27 respectively. Both full equal-length witness tapes re-emit the original ciphertext. Raw output lists all singleton alternatives and exact product.

A complete inverse path therefore has no discriminatory value in this model. Retire it absent independent suffix or stronger framing instructions. No intended plaintext is established.

Reproduce: `node sims/lp2_p15_fibonacci_payload_5bit_sft.cjs`. [Raw output](lp2-p15-fibonacci-payload-5bit.json).

## All-static-injection exclusion and hidden-cut lower bounds (27 November, Agent25)

The fixed GP ordinal label assumption is unnecessary for the intact-frame negative. Allow an arbitrary stationary injection from the 29 observed rune labels to **any 29 of all 32 five-bit patterns**, not merely a permutation of values 0–28. Keep each of the four source-derived plaintext codebooks fixed.

Construct the finite prefix automaton for concatenated Fibonacci codewords, immediately returning to the root on each completed word. For every internal state s and each pair of five-bit patterns a,b, permit edge (a,b) exactly when ten bits a||b can be consumed without leaving the trie. Taking the union over **every** starting state relaxes all phase and preceding-codeword constraints; no terminal suffix constraint is required. The SFT independently checks the edge table by direct ten-bit parsing from all states. Every pair inside a genuine emitted frame must lie in this graph. Relabeling ciphertext cannot change its observed distinct-pair count. Enumerate all C(32,3)=4,960 omitted triples to obtain the exact largest induced 29-pattern graph.

| Plaintext codebook | Standard 29 edges | All 32 edges | Maximum any 29 |
|---|---:|---:|---:|
| Ordinal | 547 | 722 | 660 |
| Gematria prime | 424 | 441 | 441 |
| p15 Fibonacci prime | 515 | 530 | 530 |
| p15 absolute difference | 376 | 385 | 385 |

The original p15 black body–p22 has 735 distinct directed pairs within pages, 730 within physical lines, and 687 within printed groups. Even the largest permitted graph has only 660 edges. **All four codebooks fail under every stationary five-bit injection**, including at the finest intact printed-group framing, with arbitrary frame-final suffixes. This extends the previous fixed-label result rather than assuming an authenticated cipher.

The same obstruction holds on the distinct p40–53 interval (775 within-group pairs) and the full p0–55 tape (838 within-group pairs), provided the mapping is stationary over the tested interval. The full tape contains 12,956 runes and 2,896 printed groups. These are secondary applications, not independent blind experiments.

For arbitrary extra hidden cuts, sort the observed pair occurrence counts in descending order. If M is the maximum graph support, even an unconstrained choice of the M most frequent pair types cannot preserve more than their total count. Every other occurrence requires a separate frame boundary. The following lower bounds grant that optimistic, generally unrealizable choice of edges:

| Interval / already allowed frame boundaries | Ordinal | GP prime | Fibonacci prime | Abs. difference |
|---|---:|---:|---:|---:|
| p15body–22 / printed groups | 27 | 246 | 157 | 349 |
| p40–53 / printed groups | 115 | 538 | 353 | 706 |
| p0–55 / continuous tape | 1,639 | 4,668 | 3,359 | 5,549 |
| p0–55 / printed groups | 1,198 | 3,515 | 2,503 | 4,187 |

In particular, the three nonordinal families require more than 2,895 total cuts on the full tape, even if their locations are entirely unknown and unrelated to printed groups. The ordinal family remains nonidentifying with arbitrary free singleton framing, as demonstrated above. These bounds do not exclude arbitrary dynamic alphabets, alternative codebooks, interleaving, or an independently specified hidden boundary mechanism.

Positive controls: all four codebooks encode and exactly recover all 95 native p57 runes under both the canonical pattern subset and the independently fixed alternative subset omitting 28,29,30 (thus including 31), with a nonidentity affine label permutation and supplied cuts/suffixes. All eight plants obey the graph constraint. This tests receiver legality, not blind recovery of the alphabet.

[SFT](../sims/lp2_p15_fibonacci_5bit_allinjective_sft.cjs) · [raw certificate](lp2-p15-fibonacci-5bit-allinjective.json). Exact committed core executed in connected V8; standalone Windows/CI execution was not performed. No original plaintext, key, or source-selected hidden boundary channel was recovered. Retire this stationary intact-frame route unless independent evidence supplies a materially different framing/representation.

## Arbitrary unknown codebook with printed-group resets (27 November, Agent25)

The full-tape printed-group model also fails without fixing any of the four plaintext codebooks. Permit **any 29 distinct positive integers**, with their ordinary self-delimiting Fibonacci encodings, and any stationary injection of the 29 observed rune labels into 32 five-bit values. No upper bound on the encoded integers is assumed. Each printed group begins at the root of the codeword parser, with arbitrary unprinted terminal suffix. This reset rule is a conditional receiver assumption.

There are 2,896 corrected printed groups on p0–55. Every rune label occurs as a group start. For each first label, count distinct second labels of length-at-least-two groups: the 29 row degrees range from 26 to 29 (five 26, five 27, fourteen 28, five 29).

For any allowed set S of 29 five-bit patterns:

1. A starting pattern containing 11 forces its first codeword, ending at the first occurrence of 11. Take the union of these short codewords.
2. For each starting pattern p with no 11, consider the 29 possible second patterns q in S. If p||q contains a delimiter, its first complete codeword is known and begins with p; otherwise it imposes no complete-word requirement.
3. At least 26 distinct q actually occur after each starting pattern. To minimize the required number of distinct complete words, choose all unfinished pairs first, then the largest classes of q producing identical completed first words until 26 choices are covered. This independently relaxes the choices for every p.
4. The long-word classes for different p are disjoint (their first five bits differ) and cannot overlap the short words. Sum the bounds and minimize over all 4,960 possible omitted triples.

**Minimum 36 distinct complete Fibonacci codewords**, including at least 31 long codewords alone. The minimum is attained by the relaxed bound for 24 omitted triples, with five short and 31 long words. Thus an alphabet permitting only 29 codewords is impossible even allowing arbitrary secret integer assignments and arbitrary final suffixes. The 36 is a lower bound, not a claim that some actual mapping can attain it. Uniform minimum-degree sensitivity: d=22,23,24,25,26 gives 23,24,26,30,36 required words respectively. A receiver adding hidden cuts must therefore at least reduce some original first/second pair row below 25 before this relaxed certificate ceases to exclude it.

Controls: 3,744 independent exhaustive small-carrier subset comparisons match the greedy class-size formula; a noncanonical five-bit injection with ordinal codebook round-trips all 95 native p57 runes with supplied cuts/suffixes (18 frames, including suffix-only frames when necessary). The latter control is not an original-frame or blind alphabet recovery.

[SFT](../sims/lp2_fibonacci_5bit_arbitrary_codebook_sft.cjs) · [raw certificate](lp2-fibonacci-5bit-arbitrary-codebook.json). Exact committed core executed V8. This rejects the entire one-codeword-per-GP-rune, stationary five-bit injection, printed-group reset family over the full original tape. It does not exclude a changing codebook, a codebook of more than 29 symbols, unknown frame starts, or a different prefix code. No original plaintext or key recovered.

## Self-synchronizing arbitrary-codebook exclusion without word-reset assumption (27 November, Agent25)

The preceding 36-word certificate relied on printed-group starts. A separate self-synchronization argument removes that dependence for the continuous, page-framed and physical-line-framed full LP2 tapes. The stationary five-bit injection and a shared 29-codeword Fibonacci dictionary are still the only codebook assumptions. Frame suffixes may be arbitrary up to four bits to complete the final codeword.

A valid Fibonacci codeword ends in 11, and its prior bits have no consecutive ones. The decoder consumes nonoverlapping 11 delimiters, resetting after each. Among the 32 possible five-bit patterns:

- Exactly five patterns (3,11,15,19,27) force a parser reset **at their end**, independently of the incoming trailing-bit state.
- Thirteen patterns contain no 11. Of these five start in 1 and five end in 1.
- The sets are disjoint. With three omitted patterns, if k synchronization patterns remain (2≤k≤5), at least m=15−k delimiter-free patterns remain.

For a possible assignment of the k synchronization patterns to an observed label set A, construct a directed graph H on the 29−k other observed labels. H[p,q]=1 iff at least one trigram a,p,q with a in A occurs wholly within a tested frame. Any m-element subset Z corresponding to delimiter-free patterns must then contain a certain minimum number of induced directed edges. At most 5×5=25 of these can produce 11 across the p/q bit boundary. All other edges force **distinct ten-bit prefixes of longer complete codewords**, starting immediately after a known reset. Their codewords must be longer than ten bits, so these are mutually distinct, regardless of the actual following bits or integer values.

The induced-edge lower bounds are rigorous and deliberately relaxed. For each of all 146,566 possible A subsets (sizes 2,3,4,5), first bound the number of retained edges per row by max(0, degree−(n−m)), then sum the m smallest row bounds. For weak cases strengthen using the integer symmetric adjacency M=H+H^T. Let S be its total sum, L the sum of its m smallest row sums and lambda a certified PSD shift of M. For an m-subset indicator x, write x=(m/n)1+z. Then z is orthogonal to 1 and ||z||²=m(n−m)/n, hence

```
edges(Z) = x^T M x / 2
         >= ceil((2mn L − m² S − lambda m(n−m)n)/(2n²)).
```

The shift certificate does not rely on numerical eigenvalues: floating Cholesky nominates a rounded integer factor R at scale Q=10000; the SFT checks that Q²(M+lambda I)−RR^T is symmetric diagonally dominant with nonnegative diagonal, proving PSD. All residual calculations are exact safe integers. 16,320 exhaustive induced-subset toy comparisons validate the inequality.

For an independent disjoint set of short words, enumerate all 4,960 possible allowed pattern sets S. Parse every allowed two-pattern concatenation starting from both possible incoming trailing-bit states, record only complete words after a synchronization delimiter common to both parses, and retain words forced by more distinct pattern pairs than the original observed missing-pair count. Each such short word is ≤10 bits; therefore it cannot coincide with any long-prefix codeword. The original continuous, page and line tapes all cover 840/841 distinct ordered pairs.

| Frame geometry | k=2 bound | k=3 bound | k=4 bound | k=5 bound | Global minimum |
|---|---:|---:|---:|---:|---:|
| Continuous p0–55 | 41 | 47 | 33 | 35 | **33** |
| Physical pages | 40 | 46 | 33 | 34 | **33** |
| Physical lines | 34 | 40 | 30 | 30 | **30** |
| Printed groups (root-start certificate above) | — | — | — | — | **36** |

These are conservative required distinct-codeword counts, not exact minima or recovered plaintext. All four ordinary full-book frame geometries require strictly more than 29 codewords, even with an arbitrary stationary secret five-bit injection and unrestricted secret positive-integer assignments. The result does not assume that every codeword occurs, that integer lengths are bounded, or that plaintext has any linguistic statistics. It does assume all codewords in a frame eventually complete. Arbitrary extra hidden cuts, chapter-dependent mappings/dictionaries, multiple codewords per plaintext rune, and other prefix codes remain different hypotheses. Neither p15 nor an authenticated historical instruction selects this payload carrier.

[SFT](../sims/lp2_fibonacci_5bit_selfsync_codebook_sft.cjs) · [raw certificate](lp2-fibonacci-5bit-selfsync-codebook.json). Exact committed core executed in V8: 12,717 PSD certificates including toy controls, all passed. No standalone Windows run. **Decision:** retire the shared stationary one-codeword-per-rune Fibonacci five-bit receiver across every ordinary printed framing, without further codebook or alphabet enumeration.
