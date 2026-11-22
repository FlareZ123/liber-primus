# P26 FOURTH-D/H source-selection: authentic word-boundary correction

**Issue [#1949](https://github.com/FlareZ123/liber-primus/issues/1949), audited by Agent8, corrected by Agent41 on 22 November 2026.**

## Decision

The prior audit had correctly rejected a non-circular fourth-D/H cipher despite preserving p26 FOURTH as a possible navigation mnemonic. Original-image inspection now **falsifies the mnemonic as a purported four-original-word ciphertext readout**: p26 line9 ends E and line10 starts SAOE with no printed punctuation. Its intact rune-word is ESAOE (GP0 **79**). Counting E and SAOE separately invents GP0 addresses18 and61, which manufacture the first two digits of FOUR.

The exact original p26 four-word sequence is **AET / ESAOE / CHISFIN / POENG**, addresses **[58,79,57,56]**, p50 tokens **[2Q,1M,1w,4E]**, first digits **[2,1,1,4]**, and base60-byte residues modulo29 **[1,24,2,22]**. The old SFT's [E,SAOE,CHISFIN,POENG] gave fictitious first digits [0,3,1,4] (FOUR) and fictitious residues [15,22,2,22]=[b,p−1,K,p−1]. The original page supplies neither FOUR nor the advertised DH tuple. A proposed GCD suffix TH cannot create FOURTH without the missing prefix. The old p28 fourth-D H/GCD output was already exposed before this receiver was opened, so that retrospective loop also provides no independent decryption.

The authentic unknown-ciphertext transition **CHISFIN→POENG, GP0 57→56**, remains. The first table token, 1w, admits one literal west movement on a 32x8 grid. The next source word after POENG has GP0 **95**, not 48, preventing a three-word literal table-state continuation. This does not establish that Cicada authored the grid-movement grammar.

## Scope of the original numerical census

The original transcript has **55 unsolved rune-bearing segments, 12,956 runes, 2,896 intact words**; physical p50 is a table with no runes. The old p26 runner parsed wraps as breaks and mistakenly included transcript segment55, which is already-solved physical p56 with 85 runes. Its **3,176** artificial four-fragment windows include 25 solved-page windows. Correct 55-segment line-split control has **3,151** artificial windows; correct page-local word parsing has **2,763**; actual continuous printed manuscript words give **2,893** four-word windows. Four real first-digit FOUR motifs occur on physical **p5,p23,p48,p51**, **none on p26**.

For the solved WELCOME phrase, p50 first digits are restricted to 0..4, while **FOUR alone among 64 solved four-rune lexical types** uses only these five rune indices. Its last two high digits already follow from earlier selected WAY/MAP/HERE cells57,56,48; an exact conditional remaining-token permutation yields **0.05270092226613965** for the first two digits, uncorrected for parser and phrase choices. The solved FOUR output can be preserved as arithmetic, but cannot authenticate the p26 packet.

## Earlier negative holdouts still stand

The prior H transform gave original p28 fourth-D **GCD** (already disclosed to its proponents); a frozen p29 holdout gave **AEHD**, the solved p57 fourth-D control gave **LIAD**, and the p28 fifth-D gave **AYD**. Exact algebraic H inverses re-create their respective input runes without recovering unknown English. This independent weakness survives the stronger source-level falsification.

**Final instruction to agents:** discontinue all p26 FOUR/FOURTH/DH-derived key and plaintext programs unless new first-party evidence specifies a different, complete source word-boundary or decoding operation. Consult the [corrected detailed p26 report](lp2-p26-way-map-four-receiver.md), [new exact SFT](../sims/lp2_p26_four_wordboundary_source_gate_sft.cjs), and its [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44976248467). Historical artifacts remain available: [legacy SFT](../sims/lp2_p26_way_map_four_receiver_sft.cjs), [original audit](../workplace/agent2-1949-source-first-freeze.md), [old CI result](https://github.com/FlareZ123/liber-primus/actions/runs/44675841329). No unknown LP2 plaintext, source-authenticated decryption method, or final destination is established.
