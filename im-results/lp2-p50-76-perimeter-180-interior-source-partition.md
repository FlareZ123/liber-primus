# Exact p50 76-cell perimeter and 180-cell interior: two source-sized receiver candidates

**Status:** exact 76/180 original-print partition; fixed p28 H row-pair transfer to the known 180-rune terminal register is negative; the source-sized 256-rune direct byte-pad and row-wise rank-transposition, one-swap-per-cell graph, and global rank routing with arbitrary tie orders and shared alphabet receivers are also negative; shared successor-glyph-conditioned bijection, direct key, prime-removal, stationary-lookup, FOLD/MOBIUS, phase-bijection and ring-convolution candidates remain excluded only within their stated scopes; no plaintext, verified key or decoder. [Original-input SFT](../sims/lp2_p50_ring76_inner180_dual_source_gate_sft.cjs).

## Why the exact split could matter

The original LP2 p49–51 numerical table prints **32 rows × 8 columns = 256 tokens**, a single rectangle. Its outermost one-cell-wide clockwise perimeter contains exactly **76 tokens**, while the remaining inner **30×6 rectangle contains 180 tokens**. For a 256-token rectangular grid with a nonempty inner rectangle, the *only* dimensions whose one-cell perimeter is 76 are **32×8 or 8×32** (solve `rc=256` and `2(r+c)-4=76`). The printed dimensions select the former.

There are two independently known but **unproven** historical receivers of these lengths: the immediately later unknown LP2 p55 has exactly **76 GP29 runes** including the first-rune carry from p54; an anonymous 14-Jan-2013 Pastebin source separately lists **180 missing ordinary primes, 73..1223** (prime ordinals21..200) from the contemporary first-onion discussion. The solved p57 line "shed our own circumferences" can motivate attempting a perimeter/interior separation. Its wording does not identify p50, p55, the 2013 list, or a cipher. The 180-prime list is preserved as a participant transcript, without an authenticated original service capture or signature. The second count follows arithmetically from 256−76; it is not an independently chosen table dimension or a second statistical validation.

This partition is a **candidate source-sized route**, rather than a decryption. A byte-to-rune consumer, an independently authored known-tail correspondence or any missing-prime mapping must still be selected by external instructions.

## Frozen finite direct consumers

### Shared successor-glyph-conditioned inverse: exact all-secret decision (Agent39, 27 November)

A concrete alternative to the earlier address-potential and address-swap models uses the original table as a **selector of an already observed ciphertext rune**, not a byte pad or a moving state. For each physical address i, set s=C[f(i)] and recover P[i]=D_s(C[i]), where each of the 29 unknown maps D_s is an arbitrary GP29 bijection shared across the 256 terminal cells. This covers every additive shift or affine symbol map depending only on the pointed-to ciphertext glyph, as well as arbitrary state relabeling/coarsening. It does not cover a map depending on the address, a longer orbit state, or private page keys. Both published radix conventions (base59 without f, base60) and two existing frozen placements (straight row-major and clockwise p55 perimeter followed by row-major interior) are tested. The 76-rune p55 original ciphertext is used as public input only; its unknown plaintext never enters fit. The p56 known native inverse is re-encrypted 85/85, with its one transparent F and 84 consuming primes. P57 clear plaintext is reserved as a continuation. The proposed shared graph receiver would replace the native p56 decipherment and must reproduce its authenticated output; the manuscript does not authenticate that transfer or the graph opcode.

For a fixed state, two equal ciphertext inputs must decode equally, and two different ciphertext inputs must decode differently. The following counts compare each later observation with the first stored observation at that input/output; they are counts of failed checks, not independent events or p-values.

| Radix | Placement | p56 function / injectivity failures | p56+p57 failures | Affine keys fitting p56 (of 841) | Native plant held p57; p55 |
|---|---|---:|---:|---:|---:|
| 59 | row | 3 / 10 | 11 / 26 | 0 | 95/95; 76/76 |
| 59 | rim | 2 / 7 | 17 / 29 | 0 | 95/95; 76/76 |
| 60 | row | 2 / 9 | 9 / 26 | 0 | 95/95; 76/76 |
| 60 | rim | 5 / 6 | 17 / 22 | 0 | 95/95; 76/76 |

A two-record certificate for base60/rim: at physical cells 11 and 37 (terminal linear indices 78 and 98), pointers 222 and 80 both select ciphertext state 10. The original ciphertext indices 22 and 13 are distinct but both must map to authenticated plaintext 18. No bijection can do that. Each other case has its own exact certificate in the machine output. This rules out the entire (29!)^29 shared local-bijection family on p56 alone in all four cases, before p57 or p55 plaintext fitting. A stationary shift or arbitrary affine receiver cannot repair it.

**Constructive control:** for each exact original graph and placement, independently solve the global functional-graph cycle equations C_i=P_i+2C_f(i)+7 mod29 on a 256-rune GP-native plant (p57 prefix76, native p56, p57). Each cycle has invertible 1−2^L in GF29; propagate the solved values up the trees. Hide (2,7) from the decoder, enumerate 841 affine pairs using only synthetic p56 positions, and apply the unique fitted pair to the held p57 and p55 positions. All four controls recover both coefficients and all 171 held runes, and their entire sender replays exactly. The repeated solved text is a mechanism control, not independent prose calibration. The unrestricted row family passes every planted constraint. No original fit, plaintext or authentic key; retire this specific state receiver rather than tune new states after contradiction. This is independent of the earlier address-potential, graph swaps and moving-byte-state models. Core executed in connected V8, not standalone CI.

[Reproducer](../sims/lp2_p50_successor_glyph_bijection_sft.cjs) · [machine output and exact contradiction certificates](lp2-p50-successor-glyph-bijection.json).


### Pointed-plaintext feedback: exact p56-only all-secret obstruction (Agent39, 28 November)

The previous receiver selects a ciphertext glyph, available directly to the decoder. A distinct reversible alternative uses the **sender's plaintext at the successor address**, with (C_i=T_{P_{f(i)}}(P_i)) and an arbitrary common GP29 bijection for each successor-plaintext state. Its affine specialization is (C_i=aP_i+bP_{f(i)}+d) modulo 29. This is motivated only by the same source-visible 76/180 partition and table-address hypothesis; neither a plaintext feedback opcode nor a single shared terminal cipher is authenticated. Test the same base59/base60 and straight/rim-first layouts, retaining the known p56 native prime-minus-one/F replay (85/85, 84 consumed primes). Never assume the plaintext at a successor on p55 or p57 is available.

For p56 alone, group the 85 observations by **forced equal state**: if the target is also on p56, its authenticated plaintext value is known; if outside p56, repeated target addresses necessarily share the same unknown value. Distinct unknown target addresses may share values, but splitting them into separate provisional classes only relaxes constraints. For each class the bijection demands both function consistency and injectivity. Counts compare later records with the first at the corresponding state/input or state/output; they are not independent events.

| Radix | Placement | p56 internal edges | All p56 forced function / injectivity conflicts | Globally invertible affine keys fitting internal edges | Plant held runes |
|---|---|---:|---:|---:|---:|
| 59 | row | 23 | 1 / 1 | 0 / 22,736 | 171/171 |
| 59 | rim | 27 | 2 / 0 | 0 / 22,736 | 171/171 |
| 60 | row | 22 | 1 / 2 | 0 / 21,924 | 171/171 |
| 60 | rim | 29 | 1 / 2 | 0 / 21,924 | 171/171 |

**Explicit original counterexamples, zero-based physical table addresses / terminal linear indices:** base59/row cells 117 and 135 both point to address168, have P=18, and have C=24 and 4. Base59/rim cells26 and84 (linear89 and133) both point to170, have P=18, and C=2 and25. Base60/row cells100 and122 point to83 and86 respectively, whose known p56 plaintexts are both 2; P=14 and16 but C=23 in both records. Base60/rim cells26 and84 both point to173, have P=18, and C=2 and25. The first, second and fourth witnesses do not depend on any outside-page plaintext value. Thus all four arbitrary local bijection families fail on p56 alone, including the previously uncontradicted base59/row internal-edge subset.

**Constructive affine control and exact domain:** for a nonzero a define q=−b/a in GF29. The inverse recurrence is P_i=(C_i−d)/a+qP_f(i). Solve each directed cycle of length L with denominator 1−q^L, then propagate up its in-trees. Global invertibility holds exactly when no cycle denominator vanishes; a=0 cannot give a bijection because the graph's address map repeats targets. Actual cycle lengths are [1] (base59) and [11,2] (base60). Exhaust all globally invertible (a,b,d) using only the internal p56 edges. On a native-text plant comprising p57 prefix76, p56 plaintext and p57, each layout uniquely recovers hidden (3,2,7) and the inverse predicts all 76+95 withheld runes with exact forward replay. The controls exercise the global inverse and finite parameter selector, not historical authorship. No original affine fit and no original candidate p55 text. The shared receiver is rejected, not arbitrary address-private or p55-only systems. Core executed in connected JavaScript; no native Node or CI execution claimed.

[Reproducer](../sims/lp2_p50_successor_plaintext_feedback_sft.cjs). Inputs: corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, grid blob `2550eae357442912220e05dc51147523a61dd75a`.

### Sequential in-place successor update: exact two-chart obstruction (Agent39, 28 November)

The earlier ciphertext-state and plaintext-state models use static endpoint tapes. The distinct **in-place** receiver updates one cell exactly once, in the original ascending row-major table order or its inverse, with the other endpoint's *current* value. This is an ordered composition of elementary reversible maps, rather than a stationary graph polynomial or a two-cell swap. The source-visible cell order motivates the schedule, but the update opcode and common terminal receiver are still exploratory. Preserve the same two radices and row/rim-first placements, including the p55 carry. At nonself addresses define the decoding operation (P_i=D_{s}(C_i)) where (s) is the current value at (f(i)). The sender reverses the order and uses each row's inverse. Each step changes only (i), so a successor already processed contains its final plaintext; a successor not yet processed contains its original ciphertext. A self-pointer needs a bijective unary operation and is excluded from the arbitrary row collision gate.

Use p56 alone (native replay 85/85, 84 prime terms), never the withheld p57 plaintext. Known states come from raw original input anywhere or decoded values only on p56. Previously updated external targets are assigned a symbolic address ID: repeated references to that address necessarily share the same value, while distinct unresolved addresses are conservatively separated. Test both a single shared family of arbitrary GP29 bijections and a stronger relaxation with independent row families according to whether the successor has already been updated. Any two records at forced identical state (and chart type in the relaxed model) must preserve equality of input and output. Counts compare to the first matching record, not independent events.

| Radix | Placement | Decoder order | Known p56 states | Shared function/injection conflicts | Two-chart function/injection conflicts | Affine fits/tested | Native plant held |
|---|---|---|---:|---:|---:|---:|---:|
| 59 | row | ascending | 57 | 2/3 | 2/3 | 0/22,736 | 171/171 |
| 59 | row | descending | 51 | 2/5 | 2/3 | 0/22,736 | 171/171 |
| 59 | rim | ascending | 76 | 3/9 | 1/6 | 0/22,736 | 171/171 |
| 59 | rim | descending | 36 | 0/2 | 0/2 | 0/22,736 | 171/171 |
| 60 | row | ascending | 57 | 3/8 | 3/7 | 0/23,548 | 171/171 |
| 60 | row | descending | 50 | 2/2 | 1/1 | 0/23,548 | 171/171 |
| 60 | rim | ascending | 75 | 4/6 | 4/4 | 0/23,548 | 171/171 |
| 60 | rim | descending | 39 | 1/1 | 0/1 | 0/23,548 | 171/171 |

All eight schedules fail even with two separate arbitrary row-chart families. For example, base60/rim descending cells 26 and 84 point to the same already processed external address 173; their ciphertext values 2 and 25 decode to identical p56 plaintext 18. This defeats injectivity for **every** possible value of the withheld target, without using p55 or p57 plaintext.

The affine decoder specialization updates the cell in place as (x_i\leftarrow a x_i+b x_{f(i)}+d\pmod{29}). A nonself update is invertible iff a is nonzero. At a self-pointer, the multiplier is a+b and must be nonzero. Reverse the sweep and subtract the untouched current successor term before dividing by a (or divide by a+b at self). For base59 there is one self-pointer; base60 has none. Exhaust 28×28×29 or 28×29×29 legal keys respectively, fitting only p56 records with completely known states. No original key survives. For every layout, encrypt native p57 prefix76 + p56 + p57 under concealed (3,2,7); the known-state p56 records uniquely recover all three coefficients, and the sequential inverse recovers 171/171 held runes and re-encrypts all 256 exactly. These are native-text plants, not evidence of historical authorship.

**Decision:** retire this specific one-sweep receiver, including both arbitrary conditional row families; order-private, address-private, multi-update, two-endpoint and p55-only operations remain outside scope. No original candidate plaintext or authentic key. Core executed in connected JavaScript against pinned repository sources; standalone Node/CI not independently run. [SFT](../sims/lp2_p50_sequential_successor_update_sft.cjs) · [raw witnesses](lp2-p50-sequential-successor-update.json).

### Address-potential difference receiver: exact conditional image dimension (Agent50, 27 November)

Treat the printed radix59/60 table as address function f(i) on physical cells, with the existing clockwise 76-cell perimeter and row-major 180-cell interior (not an authored association). A distinct additive graph receiver assigns arbitrary hidden potentials u(i) to cells and one global b; the key is d(i)=u(i)−u(f(i))+b in GF29. Fit actual p56 prime-minus-one shifts (including the authentic literal-F hold), withhold p57's 95 zero shifts, then grant both solved pages for conditional recovery of p55. No score, dictionary or chosen plaintext is used to select the graph. The source has not selected a potential-difference opcode; this is a finite exploratory receiver, not an authentic cipher claim.

| Radix | Potential family | p56 rank / augmented | full known rank / augmented | Full matrix rank |
|---|---|---:|---:|---:|
| 59 | cell | 85/85 | 180/180 | 256 |
| 59 | token | 69/70 | 127/128 | 161 |
| 59 | gp29 | 29/30 | 29/30 | 29 |
| 59 | separableRowCol | 39/40 | 39/40 | 39 |
| 60 | cell | 85/85 | 180/180 | 255 |
| 60 | token | 69/70 | 127/128 | 160 |
| 60 | gp29 | 29/30 | 29/30 | 29 |
| 60 | separableRowCol | 37/38 | 39/40 | 39 |

The repeated-token potential u(i)=h(f(i)), address-residue potential u(i)=h(i mod29), and arbitrary additive row+column potential u(i)=r[floor(i/8)]+c[i mod8] are already inconsistent on p56, even granting a secret offset b. All eight corresponding full-frame planted potential systems replay exactly. For the unrestricted per-cell family, rank rises 85→180 for both radices: every possible p57 shift vector is attainable after fitting p56. Consequently **zero independently constrained p57 positions**. After granting the entire known terminal register, the projection onto p55 is an affine space of dimension 76 (radix59) or 75 (radix60); no individual rune is fixed when b remains unknown. Radix59 admits every one of the 29^76 possible p55 strings. Radix60 has exactly one relation on plaintext indices (0-based original p55 order):

`P[0]+P[12]+P[31]+P[37]+9P[44]+P[52] = 17 (mod 29).`

This is conditional on the speculative receiver, not a plaintext crib. The left-null certificate in the raw JSON gives every participating original table address and coefficient. Constructive checks used two native terminal-text prefixes and 30 deterministic random p55 strings: 32/32 arbitrary radix59 strings were made to reencrypt all 256 original glyphs; for radix60, adjusting only one p55 rune to satisfy the relation gives 32/32 exact full replays. This shows why apparent exact re-encryption or selected prose is meaningless here: it can be engineered. No authentic key, unknown plaintext or decoder. Retire this exact shared potential receiver absent independently supplied key information sufficient to remove the remaining 75–76 degrees of freedom; do not promote the six-rune relation as manuscript evidence. [Standalone SFT](../sims/lp2_p50_address_potential_rank_sft.cjs) · [raw result and certificate](lp2-p50-address-potential-rank.json). Core executed in connected V8 against pinned corpus/grid; standalone Node wrapper not independently dispatched.


### Outer 76 cells → original p55, source-era XOR

Read the perimeter once from the **top-left** cell, along the top edge, down the right edge, left along the bottom and up the left edge; optionally reverse this same 76-element sequence as a direction control. The existing conventional base60 interpretation gives bytes 0..255. To apply the historically genuine Cicada XOR operation to original 0..28 GP rune indices, choose either the source-native low-five-bits byte representation (`byte & 31`) or the already established GP29 residue (`byte mod29`). For each i, take `P[i] = C_p55[i] XOR K_outer[i]`. A native-GP result requires all 76 outputs within 0..28; values29..31 cannot be read as GP29 without an unselected escape code.

| Perimeter key representation | Direction | Native-GP symbols | Invalid rune positions (0-based) |
| --- | --- | ---: | --- |
| Low five bits | Clockwise | 68/76 | 8 positions |
| Low five bits | Reversed | 68/76 | 8 positions |
| Byte mod29 | Clockwise | 66/76 | 10 positions |
| Byte mod29 | Reversed | **72/76** | **29,30,43,44** |

The most promising of these four still emits the invalid values [29,31,29,30] in two pairs inside p55 words; the other 72 glyphs are not readable GP prose. All four XOR operations invert exactly when applied twice; the native alphabet viability check is the decisive negative. A direct **raw-byte XOR** using the outer key and the published p55 GP **ordinals** or **prime weights** yields only 26–32 printable ASCII characters out of 76 in the corresponding clockwise/reverse arrangements, without text.

### Outer 76 cells → p55, direct GP29 addition/subtraction

The clockwise source-native GP29 additive perimeter key was **already tested more thoroughly** using both the 2014 and original LP2 table values, two byte-to-rune maps and 22,621 held-out native-English windows, in the earlier [perimeter key report](terminal-grid-xor-anend-digest.md#direct-table-circumference-as-a-76-rune-p55-key) and [reproducer](../sims/p55_table_perimeter_key_sft.cjs). The older test rejects all eight of its source-locked candidates. This narrower calculation independently reproduces only the two canonical clockwise signs and adds the **reversed-direction** control; the clockwise arithmetic must not be counted as a new finding. The tested additive **GP29** arithmetic is also used on solved p56. Keep the same top-left clockwise perimeter, the published base60 byte values and the exact original p55 rune order. Reduce each perimeter byte **mod29**, then apply one direct symbolwise addition or subtraction (with reversed perimeter as a direction control), without tuning a phase, skip or permutation. Every output consists of 76 valid GP29 runes, and the exact inverse returns all 76 original input runes; this is automatic for every key and does **not** select a historical one.

| Perimeter reading | Operation on p55 index | Decoded IoC | First twelve GP29 symbols |
| --- | --- | ---: | --- |
| Clockwise | subtract key | 0.03298246 | NG Y Y IA Y I W C I S A U |
| Clockwise | add key | 0.03368421 | NG A EO OE B L IA D EA S F J |
| Reversed | subtract key | 0.03719298 | T L Y J X D A H F E R T |
| Reversed | add key | 0.03649123 | Y U EO N F W I L N EO L AE |

For scale, unchanged p55 IoC is **0.03789474** and authentic solved p57 GP29 prose is **0.06270997**. All four 76-rune results lack a readable GP29 text or recognizable directive. The stronger existing clockwise English-language result is authoritative; this reversed check adds no plaintext. These are exact natural-start, direct-mod29 variants only, **not** a universal exclusion of keyed table transformations. An alternative phase, operation or byte-to-rune encoding would need an independent original-source selector before testing.

### Reversible address swaps: exact all-order and all-alphabet obstruction (Agent49, 26 November)

Unlike a literal lookup permutation (impossible because the table contains repeated addresses), the printed 256 addresses can generate a reversible permutation by swapping cell `i` with cell `f(i)` exactly once for each of the 256 original row-major indices. This is a new conditional receiver, distinct from the earlier row-rank permutation or stationary graph operators. It is motivated by the 76/180 terminal layout and the need to accommodate repeated addresses, not by an explicit authored swap opcode.

Fill the top-left clockwise perimeter with the 76 original p55 runes, including the incoming carry; fill the 30×6 interior row-major with p56 then p57 (85+95). Keep each candidate radix59/60 table's original cell addresses. For a swap layer preceding the authentic p56 prime-minus-one inverse, the requisite interior output is the original p56 ciphertext plus clear p57. For a swap layer following that inverse, it is the known p56 plaintext plus clear p57; the native p56 inverse and its single F hold replay 85/85 original runes (84 consuming primes). In either case p55 is unconstrained. These two shared-layer models do not include p55-only swaps or a hidden reassignment of cells.

**Direct inverse.** Forward and reverse address iteration yield exact inverse permutations but match only 1–4 of the 85 required p56 symbols and 3–4 of 95 p57 symbols. The separate hypothesis of reading the resulting permuted identity deck values mod29 as an additive pad matches only 1–5 of the 85 authentic p56 shifts. The eight fixed p55 additive outputs and four direct transpositions have no apparent prose (descriptive, no language threshold). No fitted key.

**Exact order-free certificate.** Delete an edge connecting a pendant tree S wholly inside the known interior to the rest of the graph; require exactly one crossing swap and exactly one swap on each internal tree edge. If all its output values must equal their original values, their multiset is unchanged. At the crossing, the entering and departing values must therefore be equal. The crossing acts as the identity on the tree's values. Each tree edge occurs once, in any order; the product is a single cycle on S (inductively every edge joins two previously disjoint forest components and merges their permutation cycles). Consequently all original labels in S must be equal. A branch of size two is already enough: the sole internal swap exchanges two distinct labels, and the crossing cannot undo that while preserving both labels.

| Radix | Pendant-tree contradictions, before native inverse | After native inverse | Two-cell certificates wholly within p56, both representations |
| --- | ---: | ---: | ---: |
| 59 | 18 | 18 | 3 |
| 60 | 27 | 25 | 4 |

The simplest common certificate uses cells 34 and 99 (zero-based physical addresses), with internal swap 99→34 and unique crossing 34→194 in base59 or 34→197 in base60. They are original p56 rune offsets 19 and 68 (0-based), ciphertext indices [14,7] (X,W) and plaintext indices [2,19] (TH,M). Both pairs are unequal. The contradiction applies to every global order and arbitrary initial/final p55 labels. Exhaustive three-cell local control checked all 47,096 combinations of distinct GP29 interior labels, external label, and two relative swap orders.

**All-secret alphabet extension.** Permit an arbitrary fixed bijection M on all 29 output glyphs after the swaps, so the multiset argument above is no longer sufficient. For every known-only pendant tree of 2–8 cells, enumerate every local order of its internal edges and its unique crossing edge. Replace the entering external glyph with an unrestricted sentinel. The other output glyphs determine partial constraints M(source)=known target; reject nonfunctions and noninjective maps. Combine the finite local domains with exact injectivity-preserving constraint search. Each branch may use independent local orders and arbitrary external symbols; ignoring compatibility of local orders and external flows only enlarges the family. A contradiction in this relaxation excludes every actual global schedule and every one of the 29! possible output bijections. The original gives:

| Radix | Representation | Local domains | Satisfiable shared bijection? | Inclusion-minimal incompatible branch core (zero-based cells) |
| --- | --- | ---: | --- | --- |
| 59 | Ciphertext | 17 | No | [78,73,201]; [225,101]; [246,166,70,132] |
| 59 | Plaintext | 17 | No | [246,166,70,132] (zero local domains) |
| 60 | Ciphertext | 27 | No | [214,243]; [218,107,45]; [219,217,161] |
| 60 | Plaintext | 27 | No | [220,89,195] (zero local domains) |

The largest examined pendant tree has five cells; all permutations of its five local edges are included. Eight full-grid positive plants (four per radix, both representations and both orders, shared affine permutation M(x)=7x+11 mod29) retain the true local partial maps and a feasible common bijection. These are compatibility controls, not blind recovery of a unique alphabet.

**Decision:** retire the specified one-swap-per-cell shared terminal layer, including arbitrary global swap ordering and arbitrary shared output alphabet. A common input alphabet relabel is equivalent to an output relabel because symbolwise maps commute with position permutations. Different cell framing, selective or repeated swaps, separate page-private alphabets, or a p55-specific receiver are outside scope; no independent source selects them here. No new unknown plaintext, key, or destination. No authoritative frontier change warranted. [Exact SFT](../sims/lp2_p50_swap_network_cut_sft.cjs) executed in connected JS on canonical blobs corpus `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, grid `2550eae357442912220e05dc51147523a61dd75a`; no CI run.

### Inner 180 cells → 2013 missing-prime sequence

Retain the inner 30×6 source tokens in their printed row-major order. Compare against the 180 historically listed consecutive primes in the listing's printed order. Only **3/180** respective values satisfy `byte mod29 = prime mod29` and **5/180** satisfy `byte mod29 = (prime−1) mod29`. Direct source GP29 subtraction `(byte−prime) mod29` has rune IoC **0.03767846**; addition has **0.03333333**, compared with raw inner byte residues **0.03823712**. Neither produces a readable GP29 passage or an identifiable index/prime mapping. This excludes the obvious direct position-aligned residues, not independent nested permutations, encodings, or unpublished source instruction.

### A separate original-text receiver: p53 plus the first p54 rune (Agent42, 12 November 2026)

The original LP2 terminal motif provides an independent **180-rune receiver candidate**: p53 has exactly **179** runes, immediately followed by p54's visibly enlarged red initial **A** (GP index24). Together they supply **180** source-visible runes, equal to the **30×6** interior of the actual pp49–51 32×8 numerical rectangle. The border has exactly **76** printed cells, equal to original p55's full **76-rune** page. Thus **(p53 + p54 initial, p55) = (180, 76)** and both table regions can be tested at once, independently of the anonymous historical missing-prime witness. This remains an *inferred* pairing: p53 and p54 are separated by a marked original chapter transition, p55 is separated by 231 more p54 runes, and no authored instruction says to ignore those intermediate runes or address the grid this way. The common p53/p55 moth and p54 decorative initial motivate checking the split without authenticating the operation.

A strict source-order, **all-secret stationary lookup** gate uses the complete printed two-character base60 tokens as inputs. Every distinct token can secretly map to *any* GP29 rune, and the border and interior are granted **completely independent mapping tables**. This is more permissive than a fixed monoalphabetic permutation. The exact maximum number of matching original ciphertext runes is the sum, over repeated input-token classes, of the most frequent target symbol in each class, so the result does not depend on guessed keys or language scoring:

| Printed region and candidate receiver | Source token classes | Exact best fixed lookup fit | Forced mismatches |
| --- | ---: | ---: | ---: |
| Interior 30×6, printed row-major → p53(179)+p54 initial(1) | 127 | **130/180** | **50** |
| Interior 30×6, reversed → same receiver | 127 | **133/180** | **47** |
| Outer perimeter from top-left clockwise → p55 | 68 | **69/76** | **7** |
| Outer perimeter, best of all 76 cyclic starts × two orientations → p55 | 68 | **71/76** | **5** |

Even allowing independent choice of the **best possible unknown map for each region** and independent orientation, the combined original receiver has at most **204/256** exact positions, requiring **at least 52** unsourced overrides. A planted known stationary lookup on each original region yields **76/76** and **180/180** as an exact positive control. Byte-versus-token recoding is irrelevant to the exact-token comparison because each printed token represents one byte under the working base60 encoding; mapping the byte residues modulo29 is stricter still.

This **rules out only complete, memoryless, per-region source-token lookup under the stated printed coordinates**, including both natural interior directions and every perimeter cyclic start. Stateful/changing keys, reordering individual interior positions, intermediate ciphertext transforms and different page receivers remain possible. No recovered plaintext, real key or creator-selected ring decoder follows. [Exact all-secret source SFT](../sims/lp2_p50_dualregion_stationary_allsecret_sft.cjs). The earlier full-frame 256-value test and ring-only source-token test are independent controls rather than new successes.

### One exact p53-length transfer from solved p56 and clear p57 (Agent43, 12 November 2026)

The original p53 has exactly **179** runes. The independently solved p56 has **85** GP runes, but its actual prime-totient cipher **advances the key on only 84**: its ciphertext F at local rune56 remains literal and does not consume a prime, while the other four ciphertext F values do consume one. The immediately following clear p57 contributes **95** rune indices, so the two separately source-visible components give **84+95=179**, exactly the length of original p53. This coincidence is not an authenticated instruction: no original page tells a solver to concatenate a cryptographic *keystream* from p56 with p57's *plaintext*, or select p53 as its receiver. It is nevertheless a precise, frozen candidate for an original passage, and the full p56 cipher supplies the **84-key-rune extraction independently of any unknown-page outcome**.

Take the **84** actual p56 \((prime_j−1)\bmod29\) shifts in their authenticated consumed order, append all **95** p57 clear GP rune indices in printed order, and use the resulting **179** symbols **once**, without resets or guessed phases, as the established GP29 additive cipher key on the **179** untouched p53 ciphertext runes: \(P53_i=(C53_i−K_i)\bmod29\). This unaltered operation produces IoC **0.034837738** versus raw p53 **0.033519553**; its Shakespeare-trained native-GP conditional-trigram mean is **−4.70148718** nats/rune versus raw ciphertext **−4.38456593**, a deterioration. The **1,215** independent 179-rune source-native Shakespeare windows (179-rune strides) range from **−2.56375724** to **−1.89803208**, with **0/1,215** as low as the decoded original. The inverse encoder reproduces **179/179** actual p53 runes; a genuine 179-rune native-GP encrypted plant recovers **179/179**.

This direct historical-method key transfer fails. The 179-length relationship remains a source count observation, with no evidence for mixing the two different known-page registers. Avoid retesting signs, reversals, pad phases, or p53 subsections without an independent operator clue. [Complete original-input CJS reproducer](../sims/lp2_p53_phi84_p57_179_direct_key_sft.cjs).

### A stronger original known-plaintext receiver: solved p56 plus clear p57

The **85 GP runes of independently decrypted LP2 p56** and the **95 unencrypted GP runes of p57** occupy the two immediately following final pages. Concatenated in original page order they give exactly **180 genuinely known plaintext runes**, equal to the numerical table's full interior size, in addition to the 76 unknown p55 runes matching its perimeter. This supplies a possible *crib-driven decoder*, rather than the previously tested conjectural p53+p54 ciphertext receiver: learn a secret dictionary from known interior pairs, then apply that dictionary to p55's perimeter.

Under the strict full-token lookup hypothesis, grant every distinct original interior table token a completely arbitrary secret GP29 output, unconstrained by alphabet order, prime indices or image arithmetic. If the same input token occurs at two known positions requiring different GP runes, no deterministic stationary dictionary can fit the known plaintext and hence **no such dictionary can be recovered for p55**. Optimize exactly by the per-token majority count over all **127 distinct original printed inner tokens**. The p56 known wording is taken from the [authentic 85/85 p56 φ-prime decryption regression](../sims/authentic_lp2_p56_totient_regression.cjs), with `K→C,V→U` as established Gematria spelling; p57's visible original rune indices are used unchanged.

| Original inner 30×6 reading | Best secret dictionary → 180 solved plaintext runes | Best secret dictionary → 180 original printed ciphertext runes |
| --- | ---: | ---: |
| Printed row major | **133/180** | 130/180 |
| Reverse row major | 131/180 | 131/180 |
| Alternating row snake | 131/180 | 130/180 |
| Printed column major | 132/180 | 131/180 |
| Alternating column snake | **135/180** | 128/180 |

**None** of the five natural source traversals can fit the complete independently known p56+p57 plaintext, even if the secret lookup is allowed to be trained after seeing all its output. At least **45 original rune positions** would need an otherwise-unspecified exception in the most favorable case. The simultaneously reported printed-ciphertext receiver confirms that the negative does not depend on choosing p56 plaintext rather than its actual encrypted image. A planted full 180-rune secret dictionary is recovered exactly for each of all five traversals by the same code. [Revised dual-source CommonJS SFT](../sims/lp2_p50_dualregion_stationary_allsecret_sft.cjs).

**Decision:** The attractive `p50 inner180 → known p56+p57 → learn secret lookup → decode p55 outer76` chain fails *before* touching the unknown p55 alphabet, so no fitted decoder or actual plaintext is obtained. The two sources' matching lengths are exact geometry, not an authenticated assignment. An independently authored stateful coder, per-position pad, nonnatural reordering, unknown transformation of the known runes or different cell mapping remains outside this stationary lookup exclusion. The next useful advancement is a creator-selected operation able to handle **repeated source tokens with different target runes** without arbitrary exceptions.


### Fixed p28 Hadamard receiver on the known interior (#3079, Agent12, 26 November 2026)

The conditional p28 circumference readout supplies H(x,y)=(x−y,x+y) mod29 ([p28 report](lp2-p28-readout-p0-hadamard-dh-echo.md)). Test the Director's explicitly frozen transfer: remove the one-cell rim, pair columns (1,2),(3,4),(5,6) in every retained row 1–30 (zero-based), parse the original tokens with the f-omitted base59 or standard base60 alphabet, reduce modulo29, and emit [x−y,x+y]. Compare in printed row order against independently solved p56 plaintext (85 runes, actual prime-minus-one/F-hold at offset56) followed by clear p57 (95 runes).

| Radix | First pair residues → H | p56 matches | p57 matches | Total |
| --- | --- | ---: | ---: | ---: |
| 59 | [13,9] → [4,22] | 1/85 | 5/95 | 6/180 |
| 60 | [17,11] → [6,28] | 3/85 | 8/95 | 11/180 |

The first two source tokens are 49 and 2a (full-grid addresses 9,10); the independently known first two GP indices are [24,9] (AN). Both fixed mappings already fail there. Exact positive plants use H inverse on the same native 180-rune register, encode the results as two-character numeral tokens, and reproduce all 180 under either radix. The inverse (15(u+v),15(v−u)) mod29 replays all 841 possible input pairs and each original row-pair residue; the authentic p56 inverse re-encrypts 85/85. This replay does not invert the lossy reduction of full numeric values modulo29.

**Decision:** reject both specified H consumers. The conditional 76/180 partition and the local p28 H observation survive; neither selects a table-to-plaintext operation. The acceptance gate fails, so the perimeter remains untouched. No rotation, alternative pairing, score optimization, or p55 candidate. [SFT](../sims/lp2_p50_core180_hadamard_sft.cjs) · [raw output](lp2-p50-core180-hadamard-output.json). Executed the functional core against pinned source blobs `2550eae357442912220e05dc51147523a61dd75a` and `054f2a0f780b7d46901acbe3d9bf4f0ac1801165` in the connected runtime; standalone Node wrapper not run.

### Source-conditioned FOLD/MOBIUS test (14 November 2026)

A plausible, bounded selector combines three clues: the exploratory 2016 base58 word map sends “the” to p14 word 1, FOLD; the LP1 p05 word-number square contains MOBIUS; and clear p57 says “shed our own circumferences.” The FOLD address depends on an unproven word-map interpretation, so this is a hypothesis, not an authenticated maker instruction. It nevertheless selects one natural test of the exact 76/180 partition.

The fixed construction is:
1. Read the p50 76-cell perimeter from top-left clockwise. Split it into 38+38 cells and reverse the second half, forming a 2×38 Möbius strip.
2. Use that folded 76-byte sequence as a direct p55 key. Convert each byte to GP29 by residue mod29; test addition and subtraction. Low-five-bit XOR is a source-era operation control.
3. Remove the perimeter, leaving the 30×6 interior. For each byte B, use B=29q+r: q+1 is a standard numeric-keypad direction and r is the output GP rune. Join the six-cell top and bottom edges with a half-twist, reversing the column on wrap. Start at the top-left interior cell.
4. As a separate boundary check, treat the folded 2×38 perimeter itself as a directional Möbius strip, starting at its top-left cell.

| Fixed consumer | Result |
| --- | --- |
| Folded perimeter as p55 key, subtract byte mod29 | IoC 0.03543860; first 12 runes: NG Y Y IA Y I W C I S A U |
| Folded perimeter as p55 key, add byte mod29 | IoC 0.02912281; first 12 runes: NG A EO OE B L IA D EA S F J |
| Folded perimeter low-five-bit XOR | 69/76 outputs are valid GP29 indices; 7 positions are outside the alphabet |
| Reversed folded-key control | Mod29 outputs remain nonlinguistic; low-five-bit XOR has only 67/76 valid GP29 indices |
| Inner 30×6 directional Möbius walk | From cell 0, visits 13 distinct cells, then exits an open side boundary. Output: B IA J M OE S P R S R AE D A; 0/13 match the independently known p56+p57 receiver |
| Outer 2×38 directional Möbius walk | From cell 0, the first quotient selects keypad direction 8 (north) and immediately exits the open width boundary |

The known 180-rune comparison target is independently reconstructed as the established 85-rune p56 prime-totient plaintext plus the 95 clear p57 runes. The reproducer asserts the p56 regression before using that target. It also asserts the exact 13-cell path, output and boundary termination.

**Decision:** The straightforward FOLD/MOBIUS interpretation does not supply a p55 plaintext or a 180-rune known-plaintext decoder. This rejects only the fixed top-left Möbius folds, q/r keypad mapping, and direct mod29/XOR key consumers above. Do not tune strip width, seam, start, or byte mapping to rescue the hypothesis without a new independent selector. [Original-input reproducer](../sims/lp2_p50_mobius_fold_sft.cjs).

### Terminal 180-rune same-content test: period-32 phase bijections (#2765, Agent15, 25 November 2026)

The source-sized 180-rune count match suggested that the p53+p54-start tape might repeat the independently known p56+p57 text under a polyalphabetic substitution.

The two frozen tapes are:

- **Candidate ciphertext:** all 179 original p53 runes followed by p54's visibly enlarged red initial **A** (GP29 index 24), total 180.
- **Candidate plaintext:** the independently recovered 85-rune p56 prime-minus-one plaintext followed by the 95 clear p57 runes, total 180. The reproducer first re-encodes the fixed p56 text and verifies the original p56 ciphertext with the authentic 84-consuming-prime/literal-F clock.

The receiver grants **32 independent arbitrary GP29 bijections**, one per phase (q=1,ldots,32), continuously across the full 180-rune tape. This is more permissive than a period-32 additive, Beaufort or affine key. No offset, reordering or fitted phase origin is allowed. The first 138 positions are training; the final 42 are held out. Two clocks are tested: every rune consumes a phase, or literal plaintext F (index 0) passes unchanged and holds the phase, with each phase bijection fixing F.

| Receiver | Training conflicts / 138 | Held-out predictions | Correct predictions | Unidentified holdout | Holdout conflicts | Full-tape conflicts |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Fully consuming | 26 | 9 | 2 | 33 | 12 | 40 |
| Literal-F hold | 24 | 4 | 0 | 38 | 8 | 33 |

The F-hold model is independently contradicted at the literal-F positions: plaintext F occurs at 56, 118, 144 and 152; ciphertext F occurs at 68, 71, 79, 89 and 166. The nine positions in their symmetric difference cannot be reconciled by a literal-F-preserving bijection.

Each phase receives only four or five training observations. The first 138 positions establish 112 of 928 possible phase/input pairs in the fully consuming model and 114 of 896 non-F pairs in the F-hold model; each phase covers only two to five inputs. Even if the conflicting observations were discarded, the partial maps would still leave approximately (10^{828.807}) and (10^{781.007}) completions, respectively. These are counterfactual ambiguity counts, not surviving keys: both original models are already inconsistent.

**Controls:** 200 source-native positive plants per clock, generated by encrypting the actual p56+p57 plaintext with independent random phase bijections, all pass; their mean held-out prediction coverage is 10/10 and 5/5, respectively. Across 10,000 matched nulls per clock, no training-consistent fit occurs (the fully consuming null preserves the exact p53+p54 symbol histogram; the F-hold null preserves the known plaintext F schedule).

**Decision:** the exact p53+p54-start versus p56+p57 repeated-content hypothesis is rejected for this full 32-phase bijection family under both clocks. The 180-rune length match remains a source-sized geometric observation, not evidence that the tapes contain the same text. Do not rescue this receiver with offsets, reordered tapes, altered F rules or page-specific resets. This does not exclude unrelated plaintexts or a different independently selected mechanism.

Reproducer: [period-32 phase-bijection SFT](../sims/lp2_p53p54_vs_p56p57_period32_phase_bijection_sft.cjs), run with `node sims/lp2_p53p54_vs_p56p57_period32_phase_bijection_sft.cjs`.

## Source-sized 256-rune receiver: perimeter/interior byte pad and rowwise rank (Agent43, 26 November 2026)

The solved p57 instruction says **“we must shed our own circumferences; find the divinity within and emerge.”** The original p50 panel is 32×8: its clockwise outer ring contains 76 cells and its inner 30×6 rectangle contains 180. The original p55 has exactly 76 runes; p53 has 179, and p54 begins with the enlarged red A (GP29 index 24), giving 180. This motivates one exact, human-attemptable pairing:

- outer ring, clockwise from the top-left → p55 (76 runes);
- inner rectangle, row-major → p53 followed by p54's enlarged first rune (180 runes).

The resulting receiver and key each contain exactly 256 positions. This is a structural hypothesis, not an authored instruction: the source does not explicitly pair these page spans or specify a consumer.

**Direct byte-pad test.** Read the 256 printed tokens in perimeter-then-interior order. Test both conditional unsigned-byte interpretations already documented above (base60 and drop-lowercase-f base59), without selecting between them. Against the target p55 || p53 || p54[0], test the natural direct projections:

- P = C ± (byte mod 29);
- P = C ± (byte & 31);
- P = C XOR (byte & 31).

Neither radix nor sign produces recognizable English under either additive projection. The XOR outputs contain 22 invalid GP29 symbols under base60 and 30 under base59, so neither is a direct 29-symbol receiver. No phase, row shuffle, F-hold branch, or fitted transformation is included in this test. The full exact outputs and per-output IoCs are emitted by sims/lp2_p50_dualregion_receiver_sft.cjs.

**Rowwise rank-transposition test.** Each of the 32 physical rows contains eight distinct tokens. Sorting each row in ascending numerical order yields a permutation of its eight positions; the permutation is identical under base59 and base60 because both alphabets preserve the printed token order. Apply those 32 row-specific permutations to the 32 consecutive eight-rune blocks of the same 256-rune receiver. Test ascending/descending order and both gather/inverse conventions. None of the four outputs is recognizable English. Their IoC is 0.0343137255, exactly the receiver's IoC as expected for a pure transposition; this statistic is not evidence for or against the mapping. The script asserts both inverse round trips and the radix-invariant row permutations.

**Decision.** Retire these exact direct pad and rowwise rank-transposition receivers. This does not exclude a different source-selected nonlinear/stateful operation, nor does it identify the table's radix or purpose. Do not expand into arbitrary phases, row orders, or fitted transforms without a new original-source selector.

Reproducer: sims/lp2_p50_dualregion_receiver_sft.cjs.

### Global rank routing with arbitrary tie order and arbitrary alphabet (Agent49, 27 November 2026)

The historical 2014 transposition examples fix literal index permutations, not sorting-derived keys (#2899). This is a distinct, conditional exploratory receiver from the earlier **row-wise** rank and one-swap-per-cell receivers: sort all 256 printed tokens together, granting completely arbitrary order within each equal-token class. The proposed receiver preserves the already-fixed outer76/inner180 geometry. No first-party clue fixes global sorting as the operation. The purpose is to reject or retain the entire receiver before proposing any p55 plaintext.

All 32,640 pairwise comparisons agree between literal ASCII, base60 and drop-f base59, including equality. There are 92 singleton, 49 doubleton, 14 tripleton and six quadrupleton classes (161 distinct tokens). Thus sorting defines independent routing blocks between a token's physical cells and its contiguous rank slots; both directions are bijective after any tie-order choice. The two numerical directions (ascending/descending), identity or the source-selected horizontal reflection of the table, and gather/scatter are explicitly covered. For each, compare three shared-layer models on the solved 180 interior slots: raw→raw before the native p56 inverse, native→native afterward, or raw→native as a direct decoder. The authentic p56 prime-minus-one inverse is replayed on all 85 runes with its actual one plaintext-F hold at offset56, not holds at all ciphertext Fs. The p57 reading is unchanged.

**Exact all-alphabet decision.** In block b let a_b(x) be the number of available input runes x and n_b(y) the number of required known outputs y. For a shared bijection with inverse alphabet m(y), exact tie-order feasibility is equivalent to a_b(m(y)) >= n_b(y) for every b,y: necessity is immediate, and sufficiency follows by assigning the required copies of each label to their slots before assigning the remaining positions arbitrarily. This induces a 29-by-29 bipartite graph whose perfect matchings represent all possible shared alphabets, with no dictionary or language model. To compute the **sharp** maximum known-symbol agreement when exact matching fails, use weight W[y,x] = sum_b min(a_b(x), n_b(y)) and a maximum-weight perfect matching. Independent tie-block routing attains this optimum, verified by forward/inverse replay and the Hungarian primal/dual certificate.

| Representation | Exact variants feasible | Sharp best agreement of 180 across the eight variants | Empty inverse-label domains even with arbitrary p55 source values |
| --- | ---: | ---: | ---: |
| raw→raw | 0/8 | 54 (range 48–54) | 21–24 |
| native→native | 0/8 | 56 (range 47–56) | 17–20 |
| raw→native | 0/8 | 53 (range 46–53) | 17–20 |

**Stronger p55-independent certificate.** Replace all 76 outer source values with free GP29 variables, granting each label independent use of every wildcard in its block (a relaxation). All 24 variants still have at least 17 impossible inverse-label domains. Each variant has a two-block certificate using entirely known source cells, so no unknown p55 rune is needed to reject the shared global-sort layer. For instance, ascending/unreflected/gather raw→raw requires output F at least once in each of two classes: base60 value197 has input addresses 34,114 containing labels {4,14}; value205 has sole input address74 containing label27. The two allowed source-label sets are disjoint; no common alphabet can satisfy both, regardless of tie ordering or p55. The corresponding exact output slots are [200,201] and [211]. Full witnesses for every variant are in the JSON.

Eight deterministically generated source-geometry planted alphabet/tie controls (one per routing variant) each recover a legal full 180/180 known output and pass exact inverse replay and weighted dual checks; the chosen completions match 58–71 of the 76 withheld planted runes. The test does not assert unique tie orders or unique p55 outputs. No original candidate reaches the known control gate, so no speculative p55 plaintext is selected. This is an exact rejection of the specified common global-rank route, including both radices and all tie orders and shared GP29 alphabets, not of p55-only sorting, a different source frame, or position-dependent alphabets.

[Reproducer](../sims/lp2_p50_global_rank_ties_alphabet_sft.cjs) · [Raw results and witnesses](lp2-p50-global-rank-ties-alphabet.json). Inputs: canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, grid blob `2550eae357442912220e05dc51147523a61dd75a`. Numerical core executed in connected JavaScript; standalone Node/CI not independently dispatched. No new authentic key or plaintext.

## Decision and reproduction

The **76/180 perimeter/interior partition is exact and source-visible**, but its matching lengths do not authenticate a table-to-text assignment. The p53+p54-start 180-rune tape is now also rejected as a repeated-text receiver for the independently known p56+p57 text under 32 independent phase-specific GP29 bijections: the fully consuming model has 26/138 training contradictions and 40 full-tape conflicts; literal-F hold has 24/138 training contradictions, nine literal-F position mismatches and 33 full-tape conflicts. The 42-position holdout yields only 2/9 and 0/4 correct training-derived predictions, respectively. All 200 source-native positive plants pass per clock, while 0/10,000 matched nulls obtain a training-consistent fit. The four direct 76-place XOR inverses are **mathematically invalid as all-GP29 decoded output** and the four source-native direct additive GP29 inverses also give unreadable text; the direct 180-place prime-removal operation gives noise. The bounded FOLD/MOBIUS test also fails: the folded 76-cell key gives no readable GP29 output, the inner 30×6 directional walk exits after 13 cells, and the outer 2×38 walk exits immediately. These negatives reject only the fixed constructions documented above, not every possible transform. Retire these exact candidate transfers. Further tests should require an independently source-selected consumer and should not overinterpret matching counts or refit positions, seams, offsets or encodings.

The [standalone CommonJS SFT](../sims/lp2_p50_ring76_inner180_dual_source_gate_sft.cjs) reconstructs the 32×8 perimeter without duplicate cells, checks dimension uniqueness and p55 exact length, parses all 180 original archived primes, asserts the original source counts and direct outputs, and checks both the XOR and GP29 additive inverses. It uses [original p50 tokens](../resources/liber-primus/base60-grid.json), [original p55 runes](../resources/liber-primus/lp2-corpus.json) and [contemporaneous participant prime list](../resources/external/2013-01-14-missing-primes-pastebin.md).


## Shared affine circular ring convolution (Agent43, 25 November 2026)

The four source-visible concentric circumferences have lengths 76,68,60,52. Fit one common 76-tap circular GP29 filter with affine intercept, applying it separately to each ring (taps wrap modulo the ring length). This includes every circulant linear operator on the outer 76 positions, with the same polynomial folded down onto the three known inner rings. The hypothesized outputs are either solved plaintext p56||p57 or the physical additive mask (original p56 minus plaintext, followed by 95 zero shifts on clear p57). The latter does not require interpreting a literal Fehu as a consumed prime. The known 180 outputs are laid out in six fixed orders: inner raster, outer-to-inner clockwise peel, inner-to-outer clockwise peel, and each reversal. Both literal radices and both cyclic filter directions are tested. This is a conditional use of the source-selected peel, not an authored filter instruction.

Fit on only the first 120 known interior outputs and reserve 60 as independent continuation; p55 is never used in fitting. In all 48 cases the 120×77 design has exact GF29 rank 77, but the augmented system is inconsistent, so no common polynomial even fits the development subset. No outer-ring prediction is authorized. Full 180-row systems are also inconsistent. Two native KOAN plants independently encipher the four rings by inverting the same nonsingular 76-tap filter (nonzero taps 0,1,2,7,13), with opposite directions. Both recover all 77 coefficients exactly from 120 inner outputs and predict 60/60 reserved inner + 76/76 entirely concealed outer outputs. The plants calibrate the shared filter, not the source's actual generation process.

Retire this exact 48-case shared affine circular ring receiver, including all lower-degree polynomials in the same alignment. Different per-ring operators, arbitrary offsets/reshuffles, or nonlinear secret output alphabets are outside its scope. No new original plaintext or key.

[SFT](../sims/lp2_p50_shared_ring_convolution_sft.cjs) · core executed directly in V8 on repository JSON inputs; no Node/CI run claimed.


## Exact perimeter-key collision-null lexical inverse (Agent15, 25 November)

Unlike the earlier negative direct additive pad, this is a conditional test under the external Round47 V-NULL model, not an established LP2 encoder: on an additive ciphertext collision, with probability `supp=1-.664/3.448` emit a uniformly chosen nonrepeat null, consume a key digit and retry the same plaintext. The approximately 83% suppression is fitted to the observed doublet rate under a chosen memoryless base; it does not prove that Cicada used rejection sampling or this key-consumption rule. Use the exact 76-cell top-left-clockwise p50 ring mod29 once, conventional base60 or drop-literal-f base59, with no phase/sign/orientation search. Ring length matches the ciphertext length required by the ordinary consuming model. No independent authored selector confirms this consumer.

Each fixed-key event-DAG vertex has an immediate genuine edge and at most one null-chain edge, because pending plaintext on a null is forced by C[i−1]−K[i] mod29. Intermediate nulls must propose the previous ciphertext and emit a different one. Exact page-start convention: no previous ciphertext, first rune genuine. Literal source transcription matches one carry fragment and 16 complete groups (4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3). Exact word-level DP across all event paths minimizes OOV components, then maximizes joint lexical/insertion score among minimum-OOV paths. Native 36,210-form GP29 lexicon from Shakespeare/Emerson, solved native counts and TextBlob; A/I/O/T singletons, max24-rune words, unigram OOV backoff. Free boundaries forbid other singleton words except initial unscored carry; fixed grouping grants other singletons as OOV. No beam; selected paths replay exactly.

| Key | Event paths | Fixed minimum OOV / 16 | Fixed score | Free minimum OOV | Free score |
|---|---:|---:|---:|---:|---:|
| base60 | 8 | 14 | −5.354 | 3 | −4.281 |
| base59 | 2 | 14 | −5.192 | 3 | −4.315 |

Scores in nats per ciphertext rune, secondary to OOV count. Free optimum groups noise into three long backoff components; no prose.

Controls: 50 Gibran windows per key, initial previous-word last-rune carry and complete words, accepted when simulated insertion produces exactly76 ciphertext runes. Gibran excluded from empirical training counts (generic dictionary may contain its words). Fixed exact rune recovery 45/50 and 43/50; free 45/50 and 46/50. Correct-control fixed score ranges −2.513…−1.415 and −2.467…−1.415; free −2.528…−1.415 and −2.269…−1.415. Controls need at most 3 OOV fixed and 1 free. Wrong-key fixed score ranges −6.288…−5.240 and −6.178…−5.106. Overlapping, ciphertext-length-conditioned plants are recovery diagnostics, not independent p-values; decoder is imperfect.

**Decision:** reject the two fixed page-start ring V-NULL consumers under the finite word model even with decoy group boundaries. No unknown plaintext or authentic key; other clocks, keys, languages and initial states outside scope. Do not broaden without a new selector. [SFT](../sims/lp2_p55_perimeter_vnull_lexical_sft.cjs), [complete output](lp2-p55-perimeter-vnull-lexical-output.json). Core JS executed against fetched repo inputs in connected runtime; no standalone Node/CI claimed.


### H2 drift-free literal-token tableau: exact terminal incompatibility (#3082, Agent17, 26 November 2026)

External [H2 model (a)](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/docs/HYPOTHESES.md#h2--arbitrary-tableau) proposes a key-stream-indexed arbitrary GP29 permutation row, rather than the direct token-to-rune lookup above. The printed table supplies case-sensitive repeated token labels and row-major order; neither the art nor the signed 2016 direction selects a GP29 row permutation, a key-to-row map, or a cross-page clock. As a deliberately generous **conditional** receiver, grant an independent arbitrary bijection for each literal token and use the previously fixed clockwise perimeter / row-major inner framing. For each inner index i, require C[i] = T[token[i]](P[i]), where P is authentic p56 plaintext followed by clear p57 and C is original encrypted p56 followed by the same clear p57. The p56 transparent F prime-minus-one inverse is replayed exactly (85/85, 84 consumed primes). The shared layer over p56/p57 is a hypothesis, not an established authored instruction.

For any two equal token labels, a bijection requires P[a]=P[b] iff C[a]=C[b]. **One p56-only counterexample:** zero-based p56 positions 13 and 57, absolute grid cells 26 and 84, both printed `2r`, plaintext indices (18,18), ciphertext indices (2,25). Thus even an unrestricted nonlinear deterministic row fails before p57 is consulted. Six additional cross-page contradictions (zero-based offsets in the concatenated 180-rune tape):

| Token | Offsets | P pair | C pair |
|---|---:|---|---|
| 0s | 21,86 | 4,24 | 24,24 |
| 1Q | 33,91 | 18,18 | 11,18 |
| 2n | 47,93 | 10,10 | 0,10 |
| 2L | 17,174 | 18,18 | 20,18 |
| 0u | 65,178 | 6,6 | 28,6 |
| 3I | 61,179 | 26,18 | 18,18 |

All four p57 equal-input pair predictions from p56 fail. In a planted independent Fisher–Yates bijection per token, the exact same source plaintext and labels yield zero conflicts, all four cross-page pair predictions correct, and an exact 180/180 inverse; changing the second occurrence of the first conflict produces a detected training contradiction. Additionally 39/76 perimeter positions have token labels absent entirely from the 180 interior positions, so a hypothetical consistent fit would not by itself specify those inverse rows.

This is distinct from the previous stationary token-to-output lookup, the period-32 repeated-content gate, and the #2934/#2972 literal-token clock across p40–53. It is a hard rejection of this one terminal H2 framing, invariant under arbitrary common row relabeling, not a proof against unknown independent clocks, R3/R4 repairs, or p55-only tables. No source-selected row map or new plaintext; do not optimize arbitrary H2 rows unless independent source evidence fixes a different receiver. Reproduce: `node sims/lp2_p50_terminal_token_tableau_sft.cjs`. Core executed directly in connected JS on canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165` and grid blob `2550eae357442912220e05dc51147523a61dd75a`; standalone Node CLI/CI not run. 
