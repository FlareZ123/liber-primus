# 2026 27×27 matrix claim: frozen source geometry and an unaided continuation

**Agent29, 16 November 2026. Classification:** independently reproduced fragments of a **post-2014 public interpretation**, followed by a strict, source-original negative on one deterministic extension. **No Cicada-authenticated LP2 plaintext, key schedule, full-book inverse, or final address recovered.** This does not rule out every 27×27 model.

## Why this is a genuinely distinct lead

The original LP2 pages 0–2 contain **exactly 729 ciphertext runes = 27²**. A [2026 public proposed decipherment](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption) independently advertises a 27×27 row-major arrangement, three-rune source keys, GP29 subtraction, Euler totients and Möbius-derived key rotations. Its opening claims `AS I GO, THE WEATHER`. Unlike a plain keyword guess, its first two blocks come with explicit original-image positions. The source is **an analyst-created method**, not an original 3301 instruction, and its author says the rule for selecting the exact next positions is still open.

The [published first block](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/plaintext-i-found/01-as-i-go-the.md) takes the 13-rune printed red header, uses `φ(13)=12` to suggest row13,col12, the actual `AE–J–EA` horizontal source node at row13 cols11–13, changes the center `J=11` to `φ(11)=10=I`, and calculates `φ(11)+φ(10)=14`. From the node's left cell row13,col11, moving 14 to the right reaches row13,col25. Original ciphertext at that cell through row14,col4 is `L AE N TH P U X`; periodic key `AE I EA`, subtracted mod29, outputs exactly **`A S I G O TH E`**, seven GP runes.

The [published second block](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/plaintext-i-found/02-weather.md) begins its next key at **the last ciphertext cell of the first block**, row14,col4. The actual next three source cells are `X OE X`; `φ(OE=22)=10=I` and the documented `μ(φ(k))` signature rotates `X I X` left twice to `X X I`. A rightward move of `φ(22)=10` reaches row14,col14. Five unaltered ciphertext cells `NG P EO O E` decode to **`W EA TH E R`**, read as WEATHER.

Both arithmetic readouts are reproducible on the repository's original corpus; the two decoded spans use **12 selected ciphertext runes out of 729**. The first and second ciphertext block lengths (7 and 5 runes), the horizontal node choice, and the allowance to change keys between blocks must themselves be discovered or specified; they are **not** determined by the GP29 arithmetic. The author offers a separate elaborate and changing route for [TURNS](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/plaintext-i-found/03-turns.md), using a vertical key tens of rows away. It cannot be inferred uniquely from the two rules used above.

## One frozen forward prediction, tested without tuning

Freeze the simplest continuation rule that works from block1 to block2: *the last ciphertext cell is the next three-rune key node's leftmost cell; apply center totient and Möbius key rotation; move to the right by the unmodified center's totient; decode the next source block*. Apply it **one more time** at the end of WEATHER, with the same fixed seven-rune output length used for block1. No manual new target, key location, axis, English substring or end-of-block adjustment is allowed.

The original row14,col18 endpoint is `E`. Its row-major three-rune node at cols18–20 is **`E A G`**, center `A=24`, `φ(24)=8=H`. Signature `(+1,0,−1)` sets phase zero, so key `E H G`. Move right eight from col18 to **row14,col26**, then subtract this source-derived three-rune key repeatedly. The exact seven-rune prediction is:

`A – T – T – P – AE – S – W`

This is **not** a coherent continuation after `AS I GO THE WEATHER` in the original GP spelling. It is the *first held-out result under the literal first-to-second transfer rule*. The source's alternative TURNS route does not refute this test; it introduces **different geometric operations** and therefore requires an independent selector. This result excludes only an unchanged endpoint-node/rightward-totient rule as a sufficient continuing decoder.

## Independent original windows with exactly the same fixed procedure

For each other visual LP2 chapter with at least 729 runes, use its **first 729 unchanged runes** as a 27×27 square and transfer the already fixed two steps and the unaided third. These pages are outside the alleged p0–2 reading and are a *transfer control*, not an assumption that the first-chapter source marker applies to every chapter.

| Original chapter | First 7 runes | Next 5 runes | Third 7 runes |
| --- | --- | --- | --- |
| **p0–2** | A S I G O TH E | W EA TH E R | A T T P AE S W |
| p3–7 | T IA B X D U R | S AE R IA X | C G T C J I EA |
| p8–14 | EO F IA IA G E B | N B J U H | N O TH T U G L |
| p15–22 | D U D I E J Y | Y EO C Y U | OE I Y M X EA I |
| p23–27 | R B P IA OE E N | unavailable (zero-valued key glyph) | unavailable |
| p28–32 | R I EA Y F EA T | P EO F W D | B H EO I Y D A |
| p33–39 | C U AE O I G J | unavailable (zero-valued key glyph) | unavailable |
| p40–53 | U IA S U EA E D | G S C NG O | D S N J IA EA F |

The original p54–55 chapter has 308 runes, below 729 and outside this control. None of the seven independent prefixes reproduces the first-chapter opening. This is expected even for a first-chapter-only intentional mechanism; it simply gives **no independent successful transfer** under this frozen rule. Zero-index-0 original nodes are excluded consistently because the published `μ(φ(k))` signature requires positive key indices.

## Fixed-phrase rarity versus adaptable phrase search

The most important distinction is between a **previously specified 7-rune target** and an **English phrase chosen after inspecting the book**. For any desired plaintext GP29 sequence `P` and fixed ciphertext window `C`, an arbitrary period-three subtraction key exists if and only if the four residues `(C[3]-C[0], C[4]-C[1], C[5]-C[2], C[6]-C[0]) mod29` equal the same differences of `P`. That is an **exact key-free necessary and sufficient condition** for seven positions. A five-rune word imposes only two such equalities; a four-rune word imposes only one. The original source positions can be exhaustively tested without guessing a key.

| Declared reading | GP29 rune length | Number of matching windows in original 729 | Exact matching start, zero-based | Illustrative iid-uniform expected matches |
| --- | ---: | ---: | --- | ---: |
| `AS I GO THE` | 7 | **1** | **348** (row13,col25) | 0.001022 |
| `WEATHER` | 5 | **1** | **364** (row14,col14) | 0.862069 |
| `TURNS` | 5 | **0** | none with row-major 5-rune reading; proposed route changes axis | 0.862069 |
| `COLD` | 4 | **22** | many; the proposed route reads vertically | 25.034483 |

The unusually specific **seven-rune match at source-position 348** deserves attention: if the words and operation had been frozen *before inspecting* the ciphertext, an iid-uniform source would satisfy that particular fixed target in a 729-rune book with probability approximately 0.001. **That is not an evidential p-value for this historical claim.** The target phrase, three-period key, square arrangement, key-node transformation, movement composition and word cutoff are part of an already searched and publicly revised interpretation; other GP29 manuscripts and hypotheses were available. The source is also anti-doublet and cannot simply be assumed iid. Nonetheless the exact coincidence, coupled with the claimed 13-header start rule, makes the first block more interesting than a generic word/number numerology fit. It still needs a blind continuation to become authentic plaintext.

**How much text can flexible three-key placement manufacture?** Freeze the source-native English orthography previously calibrated on 181 authentic LP1 words and all 95 solved LP2 p57 runes. In the checked-in *Shakespeare*, *Gibran* and *Emerson* controls, retain every sequence of **complete English words containing exactly seven GP29 runes**. There are **14,488 + 3,951 + 18,728 = 37,167** such source phrase occurrences but only **17,608 different four-residue fingerprints**. Search all 723 length-seven original p0–2 windows, allowing each position an arbitrary period-three GP29 key but imposing the exact same four invariants. **Seventeen distinct original ciphertext windows** can produce at least one verbatim source-English seven-rune phrase. Examples include `THEN BE IT` (source start231), `AS WEAK AS` (start389) and `TRUE THAT` (start671). These are **alternative phrase matches**, not decryptions; none has an independently derived source node or traversal. The specific first-block phrase `AS I GO THE` is absent from this three-corpus phrase set, so the control does not explain it as a copy from those texts. It shows that coherent seven-rune phrases arise from flexible key/position selection even in fixed original ciphertext.

**Decision:** short periodic-key English success needs a source-selected *position, key and block length*, plus a next-block prediction. The published first two blocks have some concrete source geometry, and the first seven-runic arithmetic is unusually specific for a previously specified target. The actual held-out endpoint-node extension fails and the broader 38-block route supplies no unique selector. Preserve this constrained clue; do not promote its English narrative as recovered plaintext.

## Reproduction, decision, and high-value missing ingredient

The [read-only Windows Node22 CommonJS SFT](../sims/lp2_27square_frozen_geometry_transfer_sft.cjs) loads `resources/liber-primus/lp2-corpus.json`, requires all nine original 2014 visual-section lengths, checks the entire 12,956-rune corpus count, asserts both public opening blocks' authentic source coordinates, rune values and exact outputs, computes every independent 729-rune chapter-prefix readout, and tests the third block without fitting the target. Each block's modular roundtrip is an *implementation positive*, not evidence for the proposed plaintext.

The **12-rune two-block coincidence deserves a future hypothesis with an author-visible route-selection rule**, but it is not a complete readable sentence and cannot be expanded by granting a new arbitrary key node, reading axis, or word cutoff at every desired word. A causal breakthrough would uniquely specify the next key-node and ciphertext path **before** examining the next plaintext; it would need to recover a long untouched continuous GP29 paragraph and independently verify re-encryption. No such next-node selector is present in the 2026 public method, and the frozen simplest transfer fails at its third block. Prioritize an independently authored selector or original-instruction recovery over fitting further matrix walks.