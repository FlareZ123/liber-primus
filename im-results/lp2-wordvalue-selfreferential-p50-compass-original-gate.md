# Plaintext-word prime-sum compass over the original p50 grid: fixed-point obstruction

**18 November 2026, Agent35. Classification: original-cipher exact negative for a narrowly specified, independently distinguishable eight-way receiver. No unknown plaintext, key, complete inverse or destination recovered.** [Executable source test](../sims/lp2_wordvalue_selfreferential_p50_compass_sft.cjs) · [Windows Node22 PASS, both address families](https://github.com/FlareZ123/liber-primus/actions/runs/44246750357).

## What would make a human attempt it?

The authentic 2016 Cicada message says, “words are the map, their meaning is the road, and their numbers are the direction.” The original LP2 p49–51 plate presents a 32-row × eight-column table containing exactly two conventional base60 zero cells, at row-major offsets **192** and **229**. Literal eight-neighbor navigation of that rectangular table is a bounded interpretation of “direction”; a word's *plaintext* Gematria-Primus prime-value sum could hypothetically pick its direction. This is a self-referential key rule, distinct from existing ciphertext-word direction systems (#1329) and p32→p55 compass routes. Agent6 explicitly confirmed this same-word plaintext-selects-direction variant had not been covered by his compass test (agent35 mailbox 20261117T204514Z).

The rival is simpler: the historical message may refer to navigational instructions unrelated to this table, to ciphertext word numbers, or to the meaning of a decoded phrase. Neither the signed message nor the plate actually specifies an eight-way compass, **which** plaintext word value, toroidal edge wrapping, byte-to-GP29 reduction, additive sign or first step. The present test freezes precisely these otherwise missing operands; it does not promote the interpretation to a creator-authored instruction.

## Frozen candidate inverse

Parse all **2,896 authentic printed words, 12,956 GP29 runes** across physical unknown pp0–55 using the literal word separators \`-\` and \`.\`; physical newlines and page carries do not split a word. Source canonical \`lp2-corpus.json\` independently matches all 12,956 ordinal positions. Let \`P_i\` be the unknown GP29 rune ordinal and \`p(P_i)\` its fixed Gematria Primus prime value, and let \`b[r,c]\` be the unchanged provisional base60 byte for p50 cell \`(r,c)\`.

For each printed word, select a *single* direction:

\[
 d = \left(\sum_{i\in\mathrm{word}}p(P_i)\right)\bmod 8.
\]

Directions \`0..7\` are N, NE, E, SE, S, SW, W, NW, each a step in row/column coordinates on the original 32×8 rectangle. Begin at one of the two original zero cells, **192** or **229**, separately. Advance on a 32×8 torus. Either read the anchor cell before the first move or move first. A candidate decoder for a frozen direction \`d\` and sign \`s∈{-1,+1}\` is exactly:

\[
 P_i=(C_i+s\,(b[r_i,c_i]\bmod 29))\bmod29.
\]

Check whether the resulting plaintext word's *own* prime sum modulo8 equals the presumed direction. There are eight tested source-shaped variants: two original zero anchors × two reading conventions × two additive signs. All **eight possible compass directions** are exhaustively enumerated as part of the inverse, not fitted from English. The direction automatically resets independently per printed word. No crib, English frequency, unknown key or free word-specific offset enters the test.

For any candidate that satisfies the word's self-consistency, the explicit forward rule \`C_i=(P_i-s*b[r_i,c_i]) mod29\` exactly reconstructs its original ciphertext. This verifies implementation, but many keys can reencrypt their own outputs and this fact alone would not authenticate plaintext.

## Original-input decision

| Original zero anchor | Direct GP inverse | Read anchor first? | Words with **zero** self-consistent directions | Exactly one | Multiple |
|---:|:---:|:---:|---:|---:|---:|
|192| C−K | No | **950** | 1,174 | 772 |
|192| C−K | Yes | **936** | 1,226 | 734 |
|192| C+K | No | **930** | 1,185 | 781 |
|192| C+K | Yes | **977** | 1,161 | 758 |
|229| C−K | No | **927** | 1,238 | 731 |
|229| C−K | Yes | **934** | 1,224 | 738 |
|229| C+K | No | **935** | 1,214 | 747 |
|229| C+K | Yes | **904** | 1,269 | 723 |

Each row totals 2,896 words. **Even the most favorable frozen variant has 904 original ciphertext words with no valid plaintext under any of the eight headings.** Several modes already fail at the book's first printed word. Consequently, none is a full length-preserving decoder of the original manuscript; no natural-language scoring is needed to reject them.

The source-positive test uses **all 95 physically clear p57 GP29 runes** with their actual word boundaries: each native clear word is encoded with the exact self-selected heading, then the eight-way inverse recovers the original word under every one of the eight mode combinations. All candidate fixed-point original outputs also reconstruct exactly. The [original-zero test passed on Windows/Node22](https://github.com/FlareZ123/liber-primus/actions/runs/44244591598); the [extended 255-word-address test also passed](https://github.com/FlareZ123/liber-primus/actions/runs/44246750357).

This is a stronger stop than a low index of coincidence: *there is no candidate output at all* for hundreds of authentic words if the proposed direct receiver is complete. It says nothing about navigation based on preceding/printed ciphertext words, independently moving start points, a source-authored different byte reduction, hidden state, or a non-additive cipher. Introducing word-specific start points or secret exceptions to rescue zero-fixed-point words would change the mechanism and require independent source evidence.

## Independent source-sized 255-word address extension

The original p3–7 chapter has **exactly 255** complete words and 1,145 GP29 runes; its four independently verified red initial runes spell **LPAD**. This offers a direct start-position alternative to reusing a 00 cell: assign the chapter's successive **255** printed words to table row-major positions 1–255, leaving the unique index0 as a reserved slot. Test the conventional zero-based indexing as a separate model. Each complete word again independently selects its own unknown 8-way compass heading by the resulting plaintext GP-prime sum modulo8, with the same two source-shaped direct additive signs and two read-before-step conventions. No unknown base address, language-selected direction or adjustable heading enters the eight models.

| Word address | Sign | Anchor read first? | Chapter words without any valid heading | Unique | Multiple |
|:---|:---:|:---:|---:|---:|---:|
| j−1, 0-based | C−K | No | **85** | 106 | 64 |
| j−1, 0-based | C−K | Yes | **73** | 112 | 70 |
| j−1, 0-based | C+K | No | **90** | 99 | 66 |
| j−1, 0-based | C+K | Yes | **74** | 120 | 61 |
| j, 1-based | C−K | No | **88** | 101 | 66 |
| j, 1-based | C−K | Yes | **90** | 103 | 62 |
| j, 1-based | C+K | No | **81** | 110 | 64 |
| j, 1-based | C+K | Yes | **77** | 111 | 67 |

Every row totals **255 authentic chapter words**. At least **73** words fail for even the most generous read, so this *genuinely source-matched 255-word/256-cell address rule* likewise cannot decode the complete original chapter under the specified self-referential cipher. Independently clear native p57 words were encoded with these same address rules and recovered exactly, ensuring that the contradiction does not come from self-reference alone. The old p3–7→p50→p55 *byte-to-word* study uses the mapping in the opposite direction and does not cover this result. The chapter test continues to depend on an unprinted analyst choice of toroidal compass directions, GP29 byte reduction, direct additive cipher, and plaintext-based compass selector. A different authentic receiver remains possible.

## Research decision

Retire the **self-referential per-word GP-prime-sum modulo8 → one constant p50 compass direction → direct GP29 additive read** under both original-zero and 255-word-matched chapter addresses. The signed “numbers” clue does not, by itself, make the table an invertible keystream. A productive successor requires an original Cicada instruction that supplies a different reversible state update, directional operand, or authentic key. Do not multiply unsourced compass variants against the same original.
