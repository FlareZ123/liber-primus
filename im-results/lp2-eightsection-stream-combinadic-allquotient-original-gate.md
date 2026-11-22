# Exact all-quotient original-cipher gate for a continuous GP29/28 eight-section enumerator

**Agent26 · 22 November 2026 · Director [#2273](https://github.com/FlareZ123/liber-primus/issues/2273).** **Result:** two independent intact original sections, p0–2 and p23–26, admit **zero native-GP29 plaintext candidates among all 7,570,923 mathematically legal high-quotient keys** for the explicit continuous-state constrained-code family below. It is a sharp conditional rejection of this particular reversible mechanism, including any subsequent whole-section substitution or transposition. No genuine new plaintext or source-selected key has been recovered. Other stateful coding, bit-level payload formats, or additional polyalphabetic cryptographic layers are outside the theorem.

**Reproducer:** [`sims/lp2_eightsection_stream_combinadic_column_source_sft.cjs`](../sims/lp2_eightsection_stream_combinadic_column_source_sft.cjs). **Windows Node22 independent execution PASS:** [CI run 45052162752](https://github.com/FlareZ123/liber-primus/actions/runs/45052162752). Earlier complete original-inverse positive [run 45051541515](https://github.com/FlareZ123/liber-primus/actions/runs/45051541515) and original first-section exhaustive-only [run 45051997877](https://github.com/FlareZ123/liber-primus/actions/runs/45051997877) passed. A first preliminary exhaustive launch had an off-by-one expected-bound assertion; it was corrected before the cited passing runs.

## Artifact and independently motivated architecture

The unchanged original LP2 ciphertext in `resources/liber-primus/lp2-corpus.json` has 12,956 GP29 runes. The corresponding `lp2-transcription.txt` contains **eight authentic `$`-terminated complete text sections**, physically pp0–2, 3–7, 8–15, 16–22, 23–26, 27–32, 33–39, 40–55. An original numeric object across pp49–51 is printed as **32 rows × eight columns**, so one 32-byte column per source section is a possible but **unauthenticated** design hypothesis. Historical first-party material also used BASE29, supplying a reason to test big-endian GP29 integer representation, though it does **not** specify a combinadic encoder.

Unlike the separately tested [word-reset three-register coder](lp2-word63-enumerative-allsidecar-tail-gate.md), this candidate has a **single symbol-to-symbol state that advances through the printed word boundaries**. It resets only at actual printed `$` section marks. The exact ciphertext word breaks remain available for readability testing but are not assumed to reset the cipher. The genuine **86** adjacent-equal rune transitions appear **inside** the eight source sections, distributed `[4,6,9,10,11,13,12,21]`.

For a section of **n ciphertext GP29 runes**, let **k** be its authentic number of repeated predecessor-successor pairs. Build exactly three integers:

- `A = firstRuneIndex`, in `0..28`.
- `B = Σ binom(e_j, j)` for each zero-based ordered repeat site `e_j` among the `n−1` adjacent slots, numbering `j` from 1. This is the finite canonical colex subset rank in `0..binom(n−1,k)−1`.
- `D` is a big-endian base28 integer from the `n−1−k` nonrepeated destinations; at each position rank the successor among the **28 different glyphs excluding its immediate predecessor**.

Let `b=binom(n−1,k)`, `d=28^(n−1−k)`, and `M=29*b*d`. The complete authentic original ciphertext is assigned the **canonical source rank**

`R = ((A*b+B)*d + D)`, with `0 <= R < M`.

Any hypothesized native-GP29 **n-rune plaintext** is a big-endian base29 integer `S` and is recovered by **`S=Q*M+R`** for some nonnegative integer quotient `Q` such that `S < 29^n`. The inverse is fully lossless: on arbitrary GP29 plaintext S, divide by M to get (Q,R), unrank R to recover the unique original initial rune, exact positions of k repeated successors and exact 28-ranked other successors, then restore all n source ciphertext runes. No exception bits are hidden, no GP29 rune (including F, digraph runes) is omitted, and all section/chapter boundaries are original source positions.

The complete legal source-specific quotient domain is **`0 <= Q <= floor((29^n−1−R)/M)`**. Thus any external secret value, whether assembled from the actual 256-byte table, a high-entropy pad, a missing book or a different source, can only select a Q within this complete domain if the candidate operates as stated.

## Eight-section exact source consumer and native plants

The CommonJS program reads unchanged original corpus, original complete section tape and original numeral table bytes. It encodes and then uniquely decodes **all eight** genuine sections, restoring **12,956/12,956 glyphs and 86/86 genuine identical transitions**. The independent source-native control `resources/external/relikd-solved-gp29-native-v1.json` contains **2,979** genuine originally solved GP29 runes. Each original section length is planted with genuine solved-source GP29 plaintext, converted to its exact integer (Q,R), encoded into a new source-shaped ciphertext with the same repeat-count k, and then decoded with the exact Q, recovering **every planted plaintext rune**.

Each original printed 32-byte column, read big-endian, **exceeds** the possible quotient domain for its corresponding source section. The maximum possible Q bit-widths per genuine section are **[23,36,53,57,20,32,44,89]**. Therefore the literal 256-bit column cannot be the unreduced quotient. As a frozen exploratory consumer, the script also tests `Q=sourceColumnInteger mod (maxLegalQ+1)`, then independently reencodes the unchanged authentic ciphertext. All eight source-original decoded streams have nearly uniform, nonnative GP29 IoC **0.0343217–0.0346892**. This modulo reduction is speculative and the stronger exhaustive tests below make optimizing it pointless for the two sections examined.

## Every legal high-quotient candidate on p0–2 and disjoint p23–26

The exact original source gives two exceptionally small complete Q domains, allowing a **true full-keyspace search** rather than sampling. The code enumerates all Q using an exact little-endian base29 recurrence `S(Q+1)=S(Q)+M`. It maintains **all 29 rune frequencies as integer counts**, updating exact `Σ f_i(f_i−1)` on each changed GP29 digit, and checks the complete integer reconstruction against ordinary BigInt `R+Q*M` at fixed widely separated checkpoints. The search scans the complete inclusive [0,maxQ] integer range, no parameter fitting, no candidate filtering or hidden state choice.

| Original physically separated section | Original runes | True repeats k | Exhaustive legal Q | Original all-Q maximum IoC | Minimum genuine solved-source same-length-window IoC | Original Q reaching solved minimum |
|---|---:|---:|---:|---:|---:|---:|
| p0–2, source section0 | 729 | 4 | **6,585,649** | **0.0370181944** | **0.0577149188** (2,251 windows) | **0** |
| p23–26, source section4 | 1,021 | 11 | **985,274** | **0.0361794473** | **0.0593593363** (1,959 windows) | **0** |
| **Total** | **1,750** | **15** | **7,570,923** | | | **0** |

The absolute original maximal frequencies are reproducible as exact integers: at p0–2 best `Q=5,021,903`, `Σ f_i(f_i−1)=19,646`, while the **lowest** genuine 729-rune solved GP window has `30,630`. At p23–26 best `Q=823,010`, numerator **37,678** against the **lowest** 1,021-rune solved GP window numerator **61,818**. The extreme original candidates still look fully mixed. The table gives exact complete-domain maxima, so searching a missing high-entropy key, rearranging table columns, trying more Q bit serialization rules or appending a deterministic high-order sidecar cannot produce source-native prose under this architecture on these pages.

**Further all-secret consequence:** the index of coincidence is invariant under *any* permutation of the n rune positions and under *any fixed bijective permutation of the 29 GP glyph labels*. Therefore even a subsequently applied secret **section-wide monoalphabetic substitution, modular Caesar/affine monoalphabetic map, reverse readout, arbitrary keyed transposition, or composition of these** cannot rescue native GP29 prose among the tested 7,570,923 Q values. This theorem does not apply to changing alphabets, stream pads, nonlinear multi-position mixers, bit re-encoding, compression or an alternative intermediate language.

## The source-typed ending markers and what remains

Because `M` contains a factor of `29` and in some sections `29^2`, the final 1–2 base29 decoded plaintext digits are fixed regardless of Q. In section order, they are:

`P TH | E | J | OE N | Y EO | M EA | E | A M`.

This is an exact source-derived marker sequence **conditional on this rank order and BASE29 orientation**, with most endings atypical of real solved native-GP words. It is supporting language evidence, whereas the complete-Q IOC bounds are decisive for the two enumerated sections. It is not a signed hidden plaintext message.

**Director decision:** retire this **eight-authentic-section, one GP29 seed per section, complete combinadic-repeat and ranked-28-advance, BASE29 quotient** architecture as a direct decoder of native GP29 plaintext. The absence of any suitable key on two disjoint original sections is unconditional in Q, and persists under secret whole-section rune transpositions and monoalphabetic bijections. One cannot recover English by supplying more sidecar bits or scanning alternative literal 32-byte columns. This excludes precisely the source-typed architecture stated here. The actual Cicada author has not authenticated a combination rank, eight-column-to-section mapping, modulo rule or intermediate register. If pursuing an anti-repeat interpretation, future work requires an **independently visible source-selected rule** changing state or symbol counts, or a fundamentally different post-encoding cryptographic layer, with genuine withheld original plaintext. The manuscript remains unsolved.
