# P0 black249 ↔ opening-chapter 158 words ↔ original p50 reciprocal cycle

**Classification (Agent31, 21 November 2026): original-artifact cardinality bridge, conditional navigation, no recovered ciphertext plaintext or author key.** The independently source-visible opening chapter yields a two-number address pair that is *exactly* the previously verified nontrivial 2-cycle of the p50 base60 successor table. The relation has a small fixed-family table-shuffle frequency, although the count-to-cell rule was recognized retrospectively. It is evidence to investigate the intended chapter-count and table-address semantics, not evidence of a known LP2 cipher.

## A human-visible proposed route

1. LP2's first unsolved page **p0 / scan 17.jpg** has a red **13-rune** heading ending at its **13-dot** punctuation marker. Its remaining **249 runes** are visibly black. Source annotation and corpus give 262 total−13 red=**249**. The mark is a boundary between the heading and the first black body; it is not itself an instruction to take a count.
2. Source-visible chapter headings begin at physical pages **[0,3,8,15,23,27,33,40,54]**. Thus the first chapter ends at p2, immediately before the next red heading on p3. The canonical word parser, retaining cross-line and cross-page words, counts **158 original printed words** beginning in pp0–2. This includes the two opening red words; removing them gives 156 body words, which does *not* produce the cycle.
3. Original source grid tokens: **p50 row-major cell249 is `2c`**, ordinary base60 **158**, and **cell158 is `49`**, ordinary base60 **249**. Thus addressing with the black p0 length and the three-page printed-word count closes the same two-cycle: **249→158→249**. These are the exact two nodes in the p50 graph's only nontrivial 2-cycle, whose existence and source-original glyphs were previously documented. An already explored alternative **base59** interpretation yields **cell249→156, cell158→245**, so the bridge is absent under base59.

This combines previously independently reported facts: physical p0 ink adjudication, the source-visible chapter boundaries and the 158 opening word count, and the visually audited p50 two-cycle. The new candidate relation is the pairing **p0 black249 ↔ opening-chapter words158**. The same 158 occurs as the number of rune symbols on p49+p51, already examined in the separate source-only 158-flank bridge; this does not supply a missing cipher operand.

## Unfiltered source-chapter negative controls

To avoid finding a special relation only by selecting chapter 1 after the fact, apply the *same* typed comparison to all nine visible unsolved opening red-heading chapters: first-page rune count minus its **initial** red heading, and every original printed word assigned to that chapter by the canonical parser. A pair is eligible only if both numbers directly address cells0..255, without truncation or modulo operations.

| Chapter (physical pages) | First-page initial red | First-page black runes | Chapter printed words | Two-way p50 pointer |
|---|---:|---:|---:|---|
| p0–2 | 13 | **249** | **158** | **249↔158** |
| p3–7 | 16 | 201 | 255 | no |
| p8–14 | 12 | 243 | 383 | unaddressable |
| p15–22 | 9 | 150 | 437 | unaddressable |
| p23–26 | 16 | 197 | 224 | no |
| p27–32 | 19 | 215 | 326 | unaddressable |
| p33–39 | 10 | 204 | 378 | unaddressable |
| p40–53 | 8 | 223 | 669 | unaddressable |
| p54–55 | 9 | 223 | 66 | no |

Only the first chapter satisfies the full directional pair. The manuscript's runeless p50 must remain an actual physical page: the word parser has only 55 unknown rune-bearing page entries; the chapter counts here use the repository's explicit *rune page→physical page* conversion.

## Exact *conditional* baseline

Fix all nine originally observed chapter counts, the original 256-cell base60 token multiset, and the rule above. Uniformly reassign the 256 table values to the 256 cell addresses, without changing value multiplicities. Under this null, the count of values158/249 is **1/3**, giving

\[
\Pr[T(249)=158,\ T(158)=249]
=\frac{1\times3}{256\times255}
=0.0000459558823529.
\]

Of the four chapter-pairs with both addresses in range, only **(249,158)** and **(201,255)** have both required values anywhere in the original table; the other two have a missing required value. Value multiplicities of 201/255 are **2/1**. The two eligible address/target sets are disjoint, hence exact inclusion-exclusion over every original chapter gives

\[
\frac{3}{256\times255}
+\frac{2}{256\times255}
-\frac{6}{256\times255\times254\times253}
=\boxed{0.0000765917069887}.
\]

**Interpretation boundary:** these are original-multiset **fixed-hypothesis** frequencies, not discovery-adjusted evidence for deliberate encoding. The chapter choice, first-page black versus all-chapter words, omission of the 13 red heading symbols, alphabet radix, and address semantics were explored in a repository with thousands of hypotheses. A source-selected, prospective operation on a different page remains absent. Uniformly shuffled table values are also a deliberately limited null, rather than an authenticated model of Cicada's table construction.

## Source-motivated 27×27 opening half-turn: both graph-cycle residues match original ciphertext

This second relationship combines the **previously fixed** original pp0–2 rune count, 729=27², and the original cross illustrations' already established **180-degree half-turn** with the newly selected p50 249↔158 two-cycle. Existing original JPEG crop measurements already show paired cross ornaments are the same artwork under 180-degree rotation; they do not independently prescribe 27×27 rune-square arrangement or a GP29 table operation (see [prior original-geometry report](lp2-p0-cross-halfturn-original-geometry-gate.md)). The present observation checks a **different, value-level original-cipher receiver**, rather than reexamining the cross geometry.

Let `C[0..728]` be the exact 729 GP29 rune indices on pp0–2 in physical reading order, including p0's two red heading words, arranged as a row-major 27×27 matrix. Under a whole-square half-turn, zero-based row-major location `i` maps to `728−i`. For the **two already source-selected table-cycle cells**, compare the actual original rune at that rotated location with the table *successor* reduced modulo29:

| p50 cell `i` | Original printed token | `T[i]` | `T[i] mod29` | Half-turn `728−i` | Original GP29 `C[728−i]` |
|---:|---|---:|---:|---:|---:|
| 249 | `2c` | 158 | **13** | **479** | **13**, rune **P** |
| 158 | `49` | 249 | **17** | **570** | **17**, rune **B** |

**Both original rune equalities are exact.** These positions lie across original p1/p2, not only the p0 body that originally supplied the number249. Of **all eight D4 square symmetries** tested with the same fixed table-cycle indices, **only 180 degrees** has **2/2** residue matches. Other orientations have 0 or1. On the 180-degree readout, exactly **11/256** table-to-original-rune residues match, including both selected two-cycle nodes; none of the separate eleven-cycle's 11 nodes match. The two highlighted matches are special primarily because their addresses were selected by the earlier independent count bridge, not because the full 256-rune residue stream has above-background fit.

To quantify how often *some* of the eight D4 mappings would hit both exact source-cycle residues by chance, deterministic **25,000** null permutations preserving the complete first-chapter 729-rune multiset yield **232/25,000** successes, add-one **0.00931963**. Preserving each of the three physical page rune histograms yields **297/25,000**, add-one **0.01191952**. These are **conditional, retrospective** exploratory controls. They do not correct for the extensive prior 27-square, half-turn, p50, and residue investigations, and cannot establish intended author encoding. Moreover, the apparent number17 from `249=8×29+17` must **not** be treated as an author-selected reference to archive scan `17.jpg`: the 17-image offset is a later merged archive convention, not the original 2014 LP2 page numbering.

The obvious complete reversible consumer would invert the 256-rune 180-degree-rotated prefix against the original p50 table:
`P[i]=(C[728−i]−T[i]) mod29` for `0≤i<256`, with positive sign as a rival. Under subtraction, both selected cycle cells have GP29 arithmetic output **zero** while their original rotated ciphertext runes are **nonzero** (P=13 and B=17). Consequently **these two algebraic zeros cannot be literal plaintext-F skips under the authenticated p56 F-transparent cipher**, which requires ciphertext F whenever plaintext F. The candidate output has **11 zeros overall**, an **IoC 0.0340993** and LP1-native log-trigram mean **−3.4205941**, far below solved clear p57's **−2.4681447**. The opposite sign has IoC **0.0358150**, trigram mean **−3.4012635**, likewise no readable prose. Exact forward reconstruction of either trial is automatic. **This direct rotated-table additive decoder fails to recover plaintext.**

### New center-of-square GP-prime factor match

The same source-motivated original 27×27 arrangement contains a second independent link to the 249↔158 table cycle. Its unique central original rune is **NG (GP index21, prime79)** at global position364; the rune immediately **left** of it is **OE (GP index22, prime83)** at position363. They are adjacent in the GP alphabet and their prime values are consecutive ordinary primes. These original cells exactly factor the two independently observed count/table coordinates:

```text
first-chapter word count158 = 2 × prime(center NG) = 2 × 79
p0 black body count249      = 3 × prime(left OE)  = 3 × 83
```

Original pp0–2 illustrations show **two separate three-bar cross ornaments**, so the factors 2 and3 are both also source-visible *counts*. Whether the author intended the mapping “2 × centered rune prime” and “3 × left-neighbor prime” is unproved: the assignment of factors to sites remains a hypothesis. The precise center and left-neighbor are especially natural in an odd-order 27² square, although other neighboring sites and different factorizations were available to an exploratory solver.

Under a *fixed source-chapter 729-rune multiset* shuffled uniformly, the two exact ordered glyphs (left OE and center NG) have probability **29×25/(729×728) = 0.00136608933**. If the center must be NG but **any of the eight surrounding neighbors** may be OE, that event rises to **0.00974301754**. These values condition on the observed cross-geometry, two small prime multipliers, and pair of counts; they are **not discovery-adjusted** against the many center/neighbor arithmetic alternatives that could have been examined. The event changes neither the table-cipher impossibilities nor the lack of known plaintext.

The source-based prime pair also offers a frozen, minimal additive-key trial on the p0 black body: repeat `[prime(OE),prime(NG)] mod29 = [25,21]` in printed left-to-center order, using the historically solved p56 subtraction direction. The original-body output has **IoC 0.0338127** and no recognizable original-length words. The opposite sign IoC is 0.0335860. This little two-symbol clock supplies no authentic plaintext. All source prime and original-runic centre assertions are included in the 27-square SFT below.

### Further source-directed terminal-word sum, plus exact substitution obstruction

There is one more **explicitly retrospective cross-register equality** that follows the p50 two-cycle as a natural word address: T[249] points to **word number158** in the 158-word opening chapter, the terminal printed word of physical p2. Under the canonical first-chapter parser this nine-rune word is `HDNIAUPSUW` (GP spell), at the final nine rune positions `C[720..728]`. It has **GP0 index sum104** (the only one of the chapter's 158 printed words with this sum) and GP-prime sum369. The **two separately half-turn-selected original rune symbols** have GP indices P=13 and B=17, whose **GP-prime weights are 43+61=104**. Thus

```text
T[249] = 158 = one-based last word number
GP0(word158) = 104
prime(C[728-249]) + prime(C[728-158]) = prime(13)+prime(17) = 43+61 = 104
```

This ties a source-selected word *position* to the previously selected two-cycle *rune values* through two natural but **different** GP numerical registers. It is a conditional source relation, with neither an authored instruction to mix prime weights with GP0 indices nor an authenticated reason to treat the terminal word as a key. The textual spelling remains encrypted; the equality alone is not plaintext.

To expose selection effects within the same fixed D4 count-pair gate, the 25,000 source-count-preserving nulls above also test the joint event: **some D4 orientation** matches both two-cycle residue points and the final nine runes sum to104. There are **4/25,000** hits in both nulls, add-one frequency **0.0002000**. This joint frequency is conditional on the post-selected register combination and word-sum test, and is **not a discovery-adjusted claim of intentional construction**. Its value should never be multiplied by the separate earlier count↔table frequency. This is exactly the sort of multistage coincidence that requires a source-fixed held-out decoding operation before promotion.

### Typed word-pointer continuation: reaches cycles without plaintext

The source-visible count-to-graph route can at least be **executed**, without inventing a key: start at **table cell249**, read its value as a **one-based printed-word number** in the canonical original LP2 rune transcript, compute that word's simple GP0 rune-index sum, and use the sum as the next p50 table-cell address. Repeat until a cell repeats. This is a candidate operation suggested by the signed 2016 line about words, mapping and numbers, although it gives no printed instruction to combine this specific word-count seed, p50 table, and GP0 register.

Its untouched original first steps are:

```text
p0 black rune count249
  T[249]=158 → chapter word158 GP0=104
  T[104]=122 → printed word122 "U" GP0=1
  T[1]=231 → printed word231 GP0=109
  T[109]=184 → printed word184 GP0=39
  T[39]=5 → printed word5 GP0=14
  ...
```

This **one-based** fixed route has **11 transient steps** followed by a **14-address cycle** beginning at cell63, with exactly 25 distinct visited table addresses. A zero-based word-index convention using precisely the same start and GP0 operation instead reaches a **four-address cycle** after five transient steps, with 9 visited addresses. Neither route yields a readable source-word initial/terminal stream or an authenticated plaintext/key. The different cycles also show why the missing *index convention and readout rule* are material, rather than disposable details. The original table itself has distinct eleven- and two-node cycles; these 14- and four-node cycles describe the **new composed table→word→sum function** and must not be confused with its original graph.

Reproducible [CJS typed traversal](../sims/lp2_p0_count249_p50_word_gp0_chase_sft.cjs), Windows Node22 [PASS44965023003](https://github.com/FlareZ123/liber-primus/actions/runs/44965023003). Without a separate Cicada instruction selecting the readout or genuine plaintext, this is a bounded original-input route with no solution and no warrant to optimize extra transforms.

A stricter, key-independent exclusion applies to the **full 256-rune direct map** `C[728−i]=f(T[i] mod29)`: even if `f` is a completely unknown 29-input lookup with outputs fitted *after observing the entire original source*, all **29 distinct table residues** occur with multiple incompatible original ciphertext outputs. The best deterministic per-input lookup achieves **51/256** matches and must miss **205/256** original sites. Therefore any single global GP29 substitution interpreting the entire half-turned table stream as original first-chapter ciphertext is **algebraically impossible**. This does not constrain a keyed position-dependent polyalphabetic cipher, contextual state machine, or hidden-position selector.

The original-operand arithmetic and all eight D4 controls are preserved in [single-source Windows/Node22 reproducer](../sims/lp2_p0_27square_rot180_p50_249_158_residue_sft.cjs), [successful CI44964289794](https://github.com/FlareZ123/liber-primus/actions/runs/44964289794). This upgrades the **structural route from page-count correspondence to two exact original-cipher residue matches**, while retaining the unresolved critical question: what source-given operation uses these matching runes to decode new original ciphertext? The two equalities alone remain compatible with coincidence.

## Original-cipher consumer gate and next decision

The p50 cycle provides a very specific **158-rune original-source key candidate**: the printed pp49+p51 table flanks have 66+92=158 GP29 runes. The corresponding **249-rune original target** is the entire black body of p0. Rather than infer arbitrary key phases, word resets or cipher layers, freeze the simplest lossless operator before reading output:

- source key: all 158 flank rune indices in physical scan order, p49 followed by p51, repeating modulo158;
- target: p0 ciphertext indices13..261, preserving its **57 printed black words**;
- output: `P[i]=(C[i]±flank[i mod158]) mod29`, both signs, zero initial key phase, with exact inverse re-encryption;
- judge the whole 249-rune unmodified original output using the existing, source-calibrated native-GP LP1 trigram model and p57 clear control.

**Windows Node22 [PASS44963058019](https://github.com/FlareZ123/liber-primus/actions/runs/44963058019).** Exact original data and planted solved-page GP29 control pass [the independent consumer SFT](../sims/lp2_p0_black249_flank158_repeating_gp29_sft.cjs). The untuned original-cipher scores are:

| Stream | Original GP29 IoC | LP1-native log-trigram mean |
|---|---:|---:|
| Original p0 black249 ciphertext | 0.0343633 | −3.3929420 |
| `P=C−flank` | 0.0337155 | −3.4000687 |
| `P=C+flank` | 0.0346224 | −3.4126837 |
| Authentic clear p57 control | 0.0627100 | −2.4681447 |

Neither direct inverse yields recognizable original word-boundary prose; both preserve essentially ciphertext-like frequencies and trigram scores. Re-encryption succeeds by construction and cannot distinguish correct additive keys. The solved p57 native GP plaintext correctly recovers **95/95** symbols from a planted ciphertext under the same source key. Therefore **retire this direct cyclic-key GP29 addition/subtraction consumer**, including any plaintext-autokey or ciphertext-autokey extension that shares its same first158 decoded characters. Do not rescue it by fitting a phase, alphabet substitution, modified length, or trial-specific word resegmentation.

### Source-seeded original-p56 prime/totient inverse: exact impossibility

A second historically demonstrated operation is the *actual solved p56 prime/totient cipher*: the key stream is `φ(prime[j]) mod29`, ordinary prime index `j` advances after each **non-F plaintext** rune, and literal plaintext F (index0) emits F without consuming a prime. A displayed ciphertext F may independently be an encrypted non-F and consume a prime. Any valid original inverse must retain **both** branches at every such site. The p50 reciprocal pair supplies exactly two unmodified candidate zero-based prime starting indices, **158 and249**, without tuning an offset. Retain the original visible p0 red13→black249 boundary as the receiver; include both signs (the authentic p56 encryption sign `+` and a generous `−` rival).

The exact finite-state original-cipher inverse over *every possible F skip* returns:

| Prime start index | Encryption sign | First impossible black-body rune (zero based) | Printed p0 rune offset |
|---:|:---:|---:|---:|
| 158 | + | **111** | 124 |
| 158 | − | 24 | 37 |
| 249 | + | 27 | 40 |
| 249 | − | 31 | 44 |

**No full original black249 inverse exists in any of these four source-locked cases.** The independent 27-square center-prime relationship additionally fixes ordinary-prime *ordinal indices21 and22* (source runes NG=79 and OE=83). Without another free offset, their four authentic-F inverse combinations also fail at original p0 black-body index **73/17** for seed21 sign+/− and **96/12** for seed22 sign+/−. These are source-limited seed alternatives to the same proved mechanism and have all-original 249-rune planted controls. The expanded [original F-branch SFT](../sims/lp2_p0_158_249_primephi_trueF_original_sft.cjs) passed Windows Node22 [CI44965326502](https://github.com/FlareZ123/liber-primus/actions/runs/44965326502). This is an exact ciphertext-only contradiction, independent of English scoring or missing key knowledge. Native p57 GP plaintext repeated to 249 original-length positions, encrypted with the genuine F-transparent clock, gives a complete inverse for all four seed/sign combinations. [Windows Node22 PASS44963465270](https://github.com/FlareZ123/liber-primus/actions/runs/44963465270), [self-contained original-data SFT](../sims/lp2_p0_158_249_primephi_trueF_original_sft.cjs).

The completed candidate tests therefore rule out (i) the source-flank158 repeating additive pad with these exact source-order parameters and (ii) the solved-p56 prime/totient F-transparent cipher seeded by either end of this two-cycle on the p0 black-body receiver. They do not rule out other source-independent ciphers.

The structural 249↔158 two-cycle remains a coherent conditional navigation match. The original source still supplies no explicit instruction to address the numeric table with these counts, select the cyclic flank key as a cipher, or decrypt a different original page. A prospective solution needs a *separately evidenced* reversible operation that produces recognizable, withheld original plaintext and exact forward replay. The chapter-to-cell match alone does not supply that missing equation.
