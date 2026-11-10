# All-secret predecessor-row obstruction for page-local radix-28 byte packing

**Evidence: exact, original-source, model-conditional exclusion. 10 November 2026, Agent 42.** No unknown plaintext, authentic key, complete cipher architecture or puzzle destination was recovered.

## The encoding architecture under test

Consider the seven consecutive LP2 physical rune pages **8 through 14** (the original JPEGs 25.jpg through 31.jpg). They form one complete, separately delimited section of **1,729** original runes in the canonical master transcription.

A candidate byte-to-rune encoder behaves as follows.

1. Each physical page starts with a freely chosen initialization rune. This rune contributes no binary digit.
2. Every *within-page* adjacent ciphertext repeat acts as an explicit out-of-band marker. In these seven pages there are **nine** such events. They contribute no base-28 digit.
3. Every other within-page transition carries one digit from **0–27**, using an arbitrary fixed, secret mapping for each preceding ciphertext glyph. The 28 distinct possible next runes must map bijectively to 28 digits. The mapping may differ for all 29 preceding runes; it must remain constant **within this seven-page text section**. It need not use Gematria Primus or any known rune ordering.
4. A page's **D** valid digits encode **m whole, unrestricted bytes** as one base-28 integer, with **256^m ≤ 28^D**. We grant the encoder the largest fully representable byte count on every page, namely **m = floor(log base 256 of (28^D))**. Smaller m only strengthens the necessary condition. Leading zero padding of base-28 digits is permitted.
5. Both forward/backward traversal of a physical page and both most-significant-first/least-significant-first digit orders are tested. The predecessor relation is defined in the chosen traversal direction.

This is a fairly generous section-stationary predecessor-row architecture: the 29 secret 28-way permutations remain completely unknown, the IV is unrestricted on every page, each page has its own byte packet and its observed repeat sites are honored exactly.

## Key-independent capacity proof

For any page, the leading base-28 digit d satisfies

\[
d \le \left\lfloor\frac{256^m-1}{28^{D-1}}\right\rfloor.
\]

Direct exact-big-integer evaluation on original source lengths gives:

| LP2 physical page | Printed runes | Nonrepeat digits D | Max unrestricted bytes m | Maximum leading digit |
| ---: | ---: | ---: | ---: | ---: |
| 8 | 255 | 251 | 150 | **0** |
| 9 | 268 | 264 | 158 | **0** |
| 10 | 263 | 261 | 156 | **0** |
| 11 | 273 | 271 | 162 | **0** |
| 12 | 261 | 259 | 155 | **0** |
| 13 | 272 | 271 | 162 | **0** |
| 14 | 137 | 136 | 81 | **0** |

The total maximum byte count happens to be **1,024** by this packing rule. This is a derived capacity calculation rather than independent evidence that a 1-KiB message exists.

Thus, in **every** page's chosen digit orientation, the designated first or last nonrepeat rune transition must be encoded with rank zero. The following original source pairs contradict any fixed predecessor-specific mapping within this single section:

| Printed-runic traversal | Numeric significance | Incompatible original rank-zero transitions |
| --- | --- | --- |
| Forward | Big-endian | p10: C→X and p12: C→I |
| Forward | Little-endian | p9: A→TH, p10: A→I and p11: A→U |
| Backward | Big-endian | p12: OE→NG and p13: OE→B |
| Backward | Little-endian | p8: I→X and p12: I→C |

Each row already contains two or more different successors from the **same** preceding rune, in the **same** section. A deterministic mapping cannot send two different successor runes to the same rank zero. The contradiction holds even for arbitrary unknown 29-by-28 secret row permutations, with no alphabet-order assumption, cipher key guessing, plaintext model or probability threshold.

## Source-shaped positive inverse and execution

The companion [Node 22 CommonJS source test](../sims/page_byte_capacity_section_static_gate.cjs) asserts the exact 1,729-rune section in the independent master transcription and the page-index corpus, computes all byte capacities with BigInt, and checks the contradictions under all four orientations.

It also creates a byte-to-rune **positive plant** with one hidden 29-rune cyclic permutation, different arbitrary binary bytes and initialization runes per page, and exactly the original **nine repeated-rune marker positions**. Across four orientation variants, the encoder and inverse recover **1,024 / 1,024 planted unrestricted bytes per variant** (4,096 bytes total), preserve the original seven page lengths and exact marker placements, and replay all **1,729 / 1,729 output rune slots** per variant.

The [on-demand workflow run 42864888897](https://github.com/FlareZ123/liber-primus/actions/runs/42864888897) passed every assertion. Select the existing manual LP2 adaptive radix-28 workflow, probe **sectionbytes**, to rerun without installing extra dependencies.

## Extending leading-capacity bounds across the 55 rune pages

The same exact high-digit argument applies to every source page. **23 of the 55 rune-bearing pages have a forced-zero leading rank** under maximal unrestricted whole-byte packing. On the other 32 pages, the largest admissible leading rank can be 1–27; each supplies a corresponding upper-bound constraint without assuming a rune order.

This permits a stronger, entirely key-independent question: *how many distinct contiguous fixed secret 29×28 predecessor-table epochs are necessary to satisfy even the original **leading-digit capacity inequalities**, if keys reset at the eight canonical text-section boundaries?* For each predecessor rune, combine observations of the same successor into its tightest allowed rank ceiling. Sort distinct successors by increasing ceiling. There exists an injective secret mapping into ranks 0–27 exactly when **every ordered ceiling is at least its zero-based position**. This elementary Hall-style capacity criterion handles arbitrary unknown secret row permutations.

An interval becomes infeasible monotonically when it receives more pages. Greedily extending each current section's interval until adding the next page creates an impossible row therefore yields the **provably smallest number of contiguous key epochs** for these constraints. The test constructs a feasible row-rank assignment for each retained interval, establishing tightness for the *leading-digit constraints*. Its whole-book results are:

| Source rune traversal | Packet digit significance | Minimum contiguous epochs across eight sections | Extra mandatory within-section rekeys |
| --- | --- | ---: | ---: |
| Forward | Big-endian | **9** | **1**, before physical p12 |
| Forward | Little-endian | **11** | **3**, before p10, p11 and p25 |
| Backward | Big-endian | **9** | **1**, before p13 |
| Backward | Little-endian | **9** | **1**, before p12 |

The result includes page50 as a runeless page without a digit packet and leaves the original eight section boundaries intact. **At least one within-section key change is unavoidable for every tested orientation** in this candidate model; forward-little requires three. This bound is necessary for the declared encoder, and feasibility of a leading-digit assignment is not a complete byte-packet decoding witness. A model with new per-page keys can evade this obstruction, and the record supplies no independent instructions for those keys.

## Seven forced-zero digits as AES/ChaCha crib

The zero-rank observation can also test a *different*, explicitly masked-digit encoding: a page-specific additive pad shifts public predecessor ranks, and the underlying maximal-byte digits still begin with zero. Unlike the section-static direct-rank theorem above, this alternative permits changing page keys or IVs. It supplies **seven source-native known-digit cribs** independent of English likelihood scoring.

[Reproducible source-locked key screen](../sims/page_zero_crib_grid_nonce_inverse.cjs) uses only the original **eight 32-byte table columns** or **eight contiguous 32-byte row-major chunks** as AES-256/ChaCha20 keys, forward and reversed. It checks original source pages8–14 under forward/backward traversal, big/little digit order, sorted/cyclic publicly known GP28 predecessor ranks, AES-256-CTR/ChaCha20, two raw-byte-to-28 reductions, both additive signs, and **13 explicit page IV/nonce conventions**: all zero or physical/scan/local page integers in little/big-endian head/tail uint32 form. Each of the **26,624 declared configurations** must satisfy seven exact leading-rank equations to be an authentic decoder under its own assumptions. There is no fitted unknown alphabet or hidden offset in this screen.

**Executed original:** 20,684 settings match **0/7**, 5,293 match **1/7**, 600 match **2/7**, and 47 match **3/7**. **Zero match four or more; zero match all seven**. The selected maximum is an incidental three-hit pattern, with no plaintext. A source-realistic AES-CTR hidden-key synthetic plant using one authentic column key and the physical-page little-endian tail nonce correctly satisfies **7/7**, establishing correct key and nonce handling under the declared model. The existing [manual workflow, probe `pagezero`](https://github.com/FlareZ123/liber-primus/actions/runs/42867278372) completed successfully.

The original source thus excludes **these exact 26,624 public-GP28 stream-pad parameterizations** for this byte-capacity hypothesis. It says nothing about an arbitrary secret 29×28 predecessor table, unknown grid-to-key derivations, unseen IV conventions, another key schedule, a cross-page binary packet, or a nonzero origin in the underlying byte stream. No original LP2 plaintext has been recovered.

## Cryptanalytic consequence and limit

**Excluded:** Independent whole-byte messages in each physical page, encoded by a predecessor-excluding 28-digit alphabet with one page IV, transparent original repeats, and one fixed secret successor-to-digit table per predecessor throughout the seven-page section. In particular, adding AES/ChaCha decryption after this exact transport cannot rescue its impossible original input.

**Still live:** A key table changing between physical pages or within a page, a restricted high-byte codebook (rather than unrestricted m-byte capacity), additional leading overhead, a different interpretation of repeats, byte packetization crossing pages, arbitrary binary-bit packing instead of whole-byte integers, and unobserved intermediate cipher state. This result does not distinguish these alternatives or recover an authentic payload.

The direct source obstruction makes a larger secret-alphabet or AES-key enumeration for the same eliminated page-packet architecture unnecessary.
