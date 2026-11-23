# Five numbered cuneiform passages: a three-page-IV, full-orbit DH feedback candidate

**Agent 5, 23 November 2026; Issue #2243. Status: one bounded source-constrained negative, no recovered unknown LP2 plaintext, authentic cipher operation or key.** This specifically tests ciphertext feedback with **three original page seeds**, a receiver absent from the earlier direct additive 553-rune DH550 test. Do not interpret its finite test count as evidence of progress toward decryption.

## Why a human might attempt this exact model

The original LP2 chapter prints Babylonian-style numerals **1033** and **3301**. Cicada's independently signed 2013 TCP puzzle explicitly taught modular-exponentiation / Diffie–Hellman, and a historical participant exchange used modulus 3301. The element 1033 has order **550** modulo prime 3301; its orbit is `x_j=1033^j mod3301`, starting at `x_0=1`.

Inside the original five red-numbered messages, actual rune lengths are **[139,91,98,96,129] = 553**. The messages occupy exactly **three physical manuscript pages**: p36 [99,238), all of p37 [0,228), and p38 [0,186), with lengths **[139,228,186]**. If each physical page supplies one unencrypted initial rune as an IV for a ciphertext-feedback operation, the three seed glyphs have GP indices **[20,9,1]** (L, N, U) and precisely **[138,227,185] = 550** remaining runes consume the entire modular orbit. These coordinates were fixed by original red headings and source page boundaries, without deleting arbitrary internal glyphs.

This is a coherent *conditional* distinction from [the prior all-phase DH550 original test](lp2-cuneiform-dh550-numbered-passages-original.md): that earlier decoder fed the **553 absolute ciphertext rune values** to an additive key, including a true plaintext-F bypass variant. Here the page-open glyph establishes a state, and the cipher consumes the **550 ciphertext differences**. The strongest objection is immediate: **p38 begins in the middle of numbered message 4**, so an independent human-visible sign does not actually label its first glyph as an IV. A page-boundary restart is an investigator inference. Neither the 2013 protocol nor the LP2 art tells us to apply that feedback operation.

## Frozen complete original-data inverse

Preserve every original glyph. In each page fragment, let `C_0` be its printed first rune and `C_i` its later runes, all in GP29. The inverse reads:

`P_i = (C_i − C_(i−1) + sign * K_i) mod29`, with `sign in {-1,+1}`.

The globally consumed orbit uses either `K_i=x_(i+phase) mod29` or `K_i=phi(x_(i+phase)) mod29`, where `phase=0` or `1`. This is **eight** predeclared, keyless complete-text inverses. An independently motivated seed-register comparison restarts the orbit on each page at the exponent equal to its **actual first GP rune index** [20,9,1], giving **four** more direct inverses. No fitted phase, invented key, F skip, word deletion, ciphertext correction or plaintext template is used.

The original ciphertext-difference IoC is **0.03586024176188111**. Among all eight continuous-clock programs, the highest candidate IoC is **0.03495943036926644** (totient map, plus inverse, exponent-one first). The first 35 GP symbols are:

`EA W T IA W T TH TH IA IA TH N W G EA P AE P NG M G J EO T EA F IA NG A L EO EA E N C`.

All other continuous-clock candidates have IoC in **[0.03421096207981454, 0.03495943036926644]**. Of the four physical-IV-seeded versions, the maximum is **0.035032290114257326** (raw orbit, plus inverse). They are all nonprose, with near-uniform GP29 marginals, versus **0.0705745984434509** for a native GP benchmark formed by repeating the **actual 95-rune solved p57** to exactly 550 runes.

**Complete secret-exponent challenge:** The actual signed 2013 DH protocol used unknown participant exponents. To rule out a special hidden **initial exponent**, hold this single feedback equation, original three page IVs, GP29 maps and signs fixed, and exhaust **all 550 orbit phases** for each map and sign. The resulting **2,200** original-input ciphertext-feedback inverses have the following best, maximum GP29 index of coincidence:

| Orbit map | GP inverse sign | Best initial exponent phase | Best IoC |
| --- | ---: | ---: | ---: |
| Raw residue | − | 108 | **0.03656896837224706** |
| Raw residue | + | 383 | **0.03656896837224706** |
| Totient residue | − | 468 | **0.03671468786222885** |
| Totient residue | + | 430 | **0.03709223381354529** |

**No phase reaches aggregate IoC 0.042**, much less the 0.07057 solved-source comparison. Every direct original result remains nonprose. This is a complete **finite family of direct GP29 plaintext inversions** under the frozen mapping. It is a diagnostic language failure, not an algebraic impossibility or a proof against an unknown binary intermediary or later cipher.

**Stronger all-secret alphabet gate, at the original page seams:** The original 550 output differences are physically separated as p36 **138**, p37 **227**, and p38 **185** runes. Even allowing the experimenter to select a *different best secret exponent phase, raw/totient map and sign on each page*, the maximum within-page IoC among all 2,200 source-conditioned options is **0.04368983391515921 / 0.0391407742388211 / 0.041598119858989424** respectively. The highest *simultaneous minimum* page IoC under one global hidden phase is **0.03742544150325523**. In particular, **none of the 2,200 phases yields even one original p36/p37/p38 output page with IoC ≥0.05**. For any arbitrary **unknown private GP29 monoalphabetic permutation on each page**, symbol equality is preserved exactly, and therefore each page's IoC is **mathematically unchanged**. Thus an opaque page-specific fixed rune relabeling cannot rescue this specific DH-feedback architecture into ordinary uncompressed native-GP English at the page level. **Independent, author-authentic native-GP calibration:** Compare each candidate page with *every contiguous same-length window strictly inside* the nine externally transcribed actually solved Cicada GP29 sections pinned in [the solved source fixture](../resources/external/relikd-solved-gp29-native-v1.json), totaling **2,979** genuine source runes, without joining separate sections. The minimum solved-source IoC exceeds even the **maximum** original DH-feedback decoded IoC over every 550 hidden phase, both signs and maps:

| Physical fragment | Candidate symbols | Max source decoded IoC across all 2,200 inverse choices | Independent solved-GP windows | Minimum actual solved-GP IoC |
| --- | ---: | ---: | ---: | ---: |
| p36 | 138 | **0.04368983391515921** | 1,888 | **0.05130646355654290** |
| p37 | 227 | **0.03914077423882110** | 1,465 | **0.05387704183072785** |
| p38 | 185 | **0.04159811985898942** | 1,633 | **0.05293772032902468** |

The complete finite original family and the complete finite authentic-control windows are **strictly separated at all three page lengths**, while an arbitrary unknown page-private fixed monoalphabetic substitution *and any permutation/transposition of symbols within the same page* preserve IoC exactly. The previously established LP1 genre/layout precedent includes the decrypted **LOSS OF DIVINITY** section within the same known control fixture, so this is a period-authentic English/register calibration rather than a generic language-theory threshold. This does **not** prove a universal impossibility for all English messages: the 1,888/1,465/1,633 windows overlap and are a finite, highly dependent sample. The source is an independent published rune transcription, not an independently signed Cicada byte artifact. Unknown plaintext could have different symbol frequencies or first pass through another encoding.

More complex changing-state alphabets, multiple output bytes per source rune, altered message boundaries or a second cryptographic layer remain outside this finite gate.

**Positive control:** For each of all **twelve** frozen inverse definitions, encrypt the full 550-symbol solved-p57 GP benchmark under the exact ciphertext-feedback operation, using the original physical page seeds and fragment lengths, then invert it. All **12/12** synthetic plants recover **550/550** authentic native-GP symbols exactly. The plants are entirely separate from the original unknown ciphertext; they authenticate the implementation, never the historical cipher choice.

## Decision and next gate

The exact `553=3 page IVs + ord_3301(1033)` relation is a reproducible, source-motivated *candidate frame*, and demonstrates why the earlier three-F skip suggestion was not the only possible explanation. **Neither tested DH feedback operation decrypts any of the five numbered originals.** Retire this entire 2,200-case one-orbit additive-feedback family and the four independently page-seeded variants. A fresh decipherment route needs a first-party **operation/recipient selector**, ideally from a decrypted preceding chapter or original historical instruction. Additional DH exponent phases, arbitrary skips, modulus variants, and evolved layer stacks are unsupported.

**Reproduction:** [Windows-compatible Node.js 22 CommonJS SFT](../sims/lp2_cuneiform_dh550_pageiv_feedback_sft.cjs), reading the pinned original [GP29 corpus](../resources/liber-primus/lp2-corpus.json), validates the exact source coordinates and orbit, prints all twelve original-input outputs and controls, and asserts the two best IoCs. Previous work on direct 553-symbol DH orbit appears in [the bounded predecessor result](lp2-cuneiform-dh550-numbered-passages-original.md).
