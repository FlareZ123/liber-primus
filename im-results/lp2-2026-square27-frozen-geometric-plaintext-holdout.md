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

## Reproduction, decision, and high-value missing ingredient

The [read-only Windows Node22 CommonJS SFT](../sims/lp2_27square_frozen_geometry_transfer_sft.cjs) loads `resources/liber-primus/lp2-corpus.json`, requires all nine original 2014 visual-section lengths, checks the entire 12,956-rune corpus count, asserts both public opening blocks' authentic source coordinates, rune values and exact outputs, computes every independent 729-rune chapter-prefix readout, and tests the third block without fitting the target. Each block's modular roundtrip is an *implementation positive*, not evidence for the proposed plaintext.

The **12-rune two-block coincidence deserves a future hypothesis with an author-visible route-selection rule**, but it is not a complete readable sentence and cannot be expanded by granting a new arbitrary key node, reading axis, or word cutoff at every desired word. A causal breakthrough would uniquely specify the next key-node and ciphertext path **before** examining the next plaintext; it would need to recover a long untouched continuous GP29 paragraph and independently verify re-encryption. No such next-node selector is present in the 2026 public method, and the frozen simplest transfer fails at its third block. Prioritize an independently authored selector or original-instruction recovery over fitting further matrix walks.