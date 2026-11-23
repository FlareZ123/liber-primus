# Exact all-source-prime F-transparent inverses on nine original LP2 chapters

**18 November 2026, Agent31. Constructive complete finite inverse, no unknown plaintext recovered. [Passing original-source Windows Node22 SFT](https://github.com/FlareZ123/liber-primus/actions/runs/44377628739).** The solved p56 cipher supplies an *authenticated* original LP2 value-changing mechanism: subtract `φ(p_j)=p_j−1` in GP29 with a **literal plaintext-F transparent and non-consuming branch**. The original p33–39 Babylonian **3301** and period 2013 prime listing give a finite, independently visible start bound: **3301 is the 464th ordinary prime**, so test **every** zero-based start `s=0..463`. This is a generously widened version of p56's original start at prime2. The source gives no instruction to change p56's start in an unknown chapter, so this is a **conditional decoder search**, not an authenticated new mechanism.

The exact [source-initialized Node22 automaton](../sims/lp2_prime_totient_allstart_true_Fbranch_original_sft.cjs) tested all nine complete original visual chapters and both addition signs without guessing skip positions or recognizing words. Its one nonempty full-chapter inverse, on the **p54–55 308-rune terminal chapter immediately preceding the solved p56**, is exhaustively resolved to **three and only three** full original plaintext paths over all 464 starts. **None is coherent GP-native prose.**

## Original, source-typed cipher operation

Use the unmodified original GP29 indices `P,C∈0..28` and the ordinary primes indexed from `p_0=2`. For sign `σ∈{+1,−1}`, encrypt:

- If plaintext rune `P=0` (GP29 F), emit literal `C=0` and **do not advance** the prime pointer.
- If `P≠0`, emit `C=(P+σ(p_j−1)) mod29` and **advance** `j←j+1`, even if the resulting ciphertext rune happens to equal zero.

This exactly preserves the documented p56 asymmetric F rule. In particular the visible ciphertext `C=0` has *two possible inverse branches*: a nonconsuming plaintext F or an encrypted non-F whose shift wraps to zero. Treating `C=0` as automatically skipped, or treating `P=0` as a normally shifted rune, would produce an incorrect gate.

At each original ciphertext symbol, propagate a set of reachable prime indices, initially all `0..463`. For a current index `j` and observed `c`, retain `j` if `c=0` (the literal F branch). Independently permit `j+1` if `p=(c−σ(p_j−1)) mod29` is **nonzero** (the encrypted branch). Boolean state union preserves every possible initial phase and F-skip history, with no language/word-score pruning. The first empty state set is an **absolute original-cipher incompatibility for the entire tested key family**, regardless of putative plaintext register.

The original source is `resources/liber-primus/lp2-corpus.json`, keeping the 32 physically carried words intact. Full original section counts include the red headings:

| Physical LP2 chapter | Runes | Sign +: first impossible zero-based original rune | Sign −: first impossible zero-based rune |
|---|---:|---:|---:|
| p0–2 | 729 | 565 | 497 |
| p3–7 | 1,145 | 332 | 355 |
| p8–14 | 1,729 | 271 | 277 |
| p15–22 | 1,903 | 249 | 369 |
| p23–26 | 1,021 | 495 | 282 |
| p27–32 | 1,433 | 505 | 531 |
| p33–39 | 1,680 | 594 | 420 |
| p40–53 | 3,008 | 628 | 329 |
| **p54–55** | **308** | **survives to final rune** | 213 |

All eight other chapters become impossible for **both signs** under *every* seed and skip history, before reaching their ends. The final source-chapter survival under the source-authenticated arithmetic sign + is a concrete, limited receiver result worth enumerating instead of treating as a claimed decrypt.

## Exactly three possible terminal outputs, all nonprose

For the complete **308 unchanged original p54–55 ciphertext runes**, sign +, and all 464 start phases, the last 308th symbol leaves precisely **one surviving prime-state index**, **j=472**. Counting all complete paths using exact integer dynamic programming, not merely unique endpoint states, yields **three original inverse trajectories**:

| Initial prime index (zero-based) | Literal-F skips | Final key pointer | Resulting original-decoded 308-rune IoC |
|---:|---:|---:|---:|
| 167 | 3 | 472 | 0.03536528617961843 |
| 167 | 3 | 472 | 0.03492110495367824 |
| 168 | 4 | 472 | 0.035111468336224035 |

Each output was explicitly **re-encrypted**, with its exact individual skip trace and initial prime index, into **all 308 original runes**. The original's 66 printed words are preserved, including physical word carries. Crucially, **all three full-section paths converge before the p55 physical page begins**: they yield the **same exact 76-rune p55 plaintext candidate** with source GP29 IoC **0.03508771929824561**, identical prime pointer **397** at its entrance, and **one identical plaintext-F skip at p55-local rune15**. The original printed p55 has ciphertext F runes at local indices **15, 25, 41**; indices25 and41 are necessarily encrypted non-F under these three trajectories. The complete candidate p55 GP transliteration is:

```text
M NG C B I R AE I P O AE B E EO TH F IA T O T D NG H S L P B U AE O U O AE I W E B N O O I X AE R R L W O J X N U W T M E O D C U N P IA X A G E AE C H J A H OE J EA
```

The **first complete printed word on original physical p55 is exactly one rune**, originally the GP glyph NG; the unique derived candidate maps it to GP **M**. Under intact English word breaks, the only native one-letter words are A and I (or, generously, O). Therefore all three paths have an **exact terminal singleton-word incompatibility** as English plaintext even before their near-uniform IoC or longer-word gibberish is considered. This conclusion is conditional on English and original printed word boundaries. No independent source proposes an alternative plaintext segmentation for this transfer.

Thus the authentic-prime transfer yields a **fully specified, deterministic 76-rune terminal intermediate** over this bounded 464-start family, although it is not grammatical plaintext. The three full-chapter skip-position lists, zero-based from p54's first red rune, are **[41,195,247]**, **[65,195,247]**, and **[41,65,195,247]**; their common final skip247 is the p55-local index15. This is more informative than merely reporting three possible plaintexts. It still cannot be promoted to a genuine decryption absent a first-party reason to choose the prime start or an independently identified second operation. For example, the first candidate begins with GP transliterations `X | YALOETYTS | NGWAYBMCAE | TEW | UCHSPIA`; the third begins `TH | OEEEEOXLGP | JCEHPBUM | IIU | AEOGCCB`. No candidate yields an identifiable original plaintext sentence, native GP29 word register, authenticated key or destination. These short transcriptions demonstrate the negative honestly; a perfect re-encryption and a finite three-path list are necessary mechanical results, **not** proof of decipherment.

The short chapter's nonempty result remains **algebraic compatibility**, not a decryption. A post hoc source-selector candidate now points to the start-167 trajectory: 1033−p36=997 (the 168th prime), and the visible 3/5/13 counts give the literal-F positions 15,65,195, mapping to p55-local15 and p54-local65/195. This selects skips [65,195,247], but neither arithmetic instruction is explicit in the source and the resulting text remains nonprose. The ordinary p56 key starts at prime2; its documented rule may be intended solely for that solved page. Preserve the new route as a hypothesis for independent criticism and second-layer discovery, not as established plaintext or creator intent.

## Candidate source selector for the p54–55 intermediate (23 November; hypothesis, not decryption)

The three-path result admits a striking *post hoc* selector for one trajectory. It is worth preserving because it links original-page details to both the phase and the otherwise ambiguous literal-F mask, but it is **not** yet an authenticated instruction.

**Prime start.** The cuneiform header supplies **1033**, also the row-sum of the authentic 2014 7×7 magic square. The five numbered units begin on physical LP2 **p36**. Subtracting that first-unit page number gives

`1033 − 36 = 997 = the 168th prime`.

Thus the zero-based p56-style prime-stream start is **167**, one of the two surviving starts. This is a simple, testable candidate rule, but no source text explicitly says to subtract the page number from 1033.

**Literal-F selector.** Original p54 and p55 images (`resources/liber-primus/71.jpg`, `72.jpg`) show a berry cluster with **three filled circles and two outlined circles** (counts 3 and 5), alongside a **13-dot red marker**. The earlier five numbered units independently reinforce the count five. The distinct products of the visible counts include

- `3 × 5 = 15` → p55-local F at **15** (global p54–55 offset247);
- `5 × 13 = 65` → p54-local F at **65**;
- `3 × 5 × 13 = 195` → p54-local F at **195**.

These are exactly the literal-F skips of the **start-167** path `[65,195,247]`. The remaining ciphertext-F positions, p54-local41 and p55-local25/41, remain key-consuming encrypted non-F events. The competing start-167 path skips `[41,195,247]`; the start-168 path skips all four `[41,65,195,247]`. The candidate selector therefore singles out one of the three complete trajectories without fitting an English score.

**What it does and does not establish.** The selected 308-rune output still has native-GP IoC **0.03492110495367824**; its p55 suffix is the shared 76-rune nonprose candidate and begins with the one-rune word **M**. Re-encryption is exact, but that is mechanical consistency, not plaintext recovery. Wrapping the 464-prime 2013 source list cyclically at3301 changes only the final **eight** output symbols and leaves IoC **0.03473074157113245**, also nonprose. A few source-adjacent second-layer checks (the p50 five-unit lookup as an additive key; solved p56/p57 text as running keys; a second prime-totient pass starting at p15/2014 primes3299 or3301) also remain flat.

**Strongest objection:** both selectors are post hoc arithmetic interpretations. The berry/outline count may be decorative, the 13 dots may be punctuation, and neither the multiplication rule nor `1033 − page36` is explicitly stated by Cicada. The resulting text is still not plaintext. Treat `start=167, skips=[65,195,247]` as a **candidate first-layer route**, not a solved page or a proven creator-intended cipher. The next useful decision is whether an independently source-selected second operation exists; do not expand arbitrary phase, key or layer menus to rescue this path.

## Source-positive controls and boundary

The standalone program encrypts a **3,000-rune repetition of genuine, unchanged clear p57's 95-rune GP29 plaintext**, under the historically correct true-F bypass, for **both signs** and each nonzero source-start `0,167,463`. It then asserts that the all-start finite-state inverse contains the exact real final prime pointer in every case. Wrong plaintext-F branch logic would lose these controls. The terminal SFT enumerates all three original paths and checks complete forward reconstruction of the original 308 symbols.

These checks apply to one **unchanged-GP29, continuous-within-visual-chapter, direct prime-totient cipher**, with source-bounded starting rank and p56's literal F rule. They do not exclude page/line resets, a secretly permuted rune alphabet, a book-derived prime selection, another plaintext representation or layered preprocessing. A new author-authenticated key selector or value-changing operation would be required before pursuing the surviving p54 outputs as a next-layer cipher.

**Research decision:** The historical p56 cipher **alone** does not decrypt any full unknown LP2 visual chapter into prose. Its exact terminal three-path reduction is a finite, reproducible result; only independent original-source guidance could promote one path to a plaintext candidate. Do not launch wider phase menus or treat the numerical survivor as an intended decryption.
