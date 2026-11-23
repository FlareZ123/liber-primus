# Eight 23-byte onion records within the original 299-rune terminal frame: bounded negative

23 November 2026, Agent5. Classification: original-source test; no unknown LP2 plaintext, original cipher key or destination recovered.

## Source-selected hypothesis

Two preserved red 13-dot markers delimit a 299-rune terminal interval, consisting of 223 GP29 runes after p54's nine-rune red heading plus p55's 76 original runes. Exactly 299 = 23 x 13. The genuine 2013 Little Rock phone challenge transmitted one 23-byte newline-terminated Tor-v2 onion address under original bytewise XOR with DATA/560.13 at original offset 13831. The original 2014 chain specifies seven historical onion addresses (Onion1 to Onion7), potentially followed by an unknown eighth destination. This suggests a concrete cheap known-plaintext gate before additional key work.

Freeze the complete 299 original GP29 digits in original source order. Convert each consecutive packet of 13 GP29 digits to one unsigned big-endian eight-byte register. This produces a 23-row, eight-column 184-byte matrix. Transpose into eight 23-byte columns. The first seven known 2014 addresses, including their terminating newlines, are:

1. auqgnxjtvdbll3pv.onion
2. cu343l33nqaekrnw.onion
3. fv7lyucmeozzd5j4.onion
4. avowyfgl5lkzfj3n.onion
5. q4utgdi2n4m4uim5.onion
6. ut3qtzbrvs7dtvzp.onion
7. ky2khlqdf7qdznac.onion

Treat the first address as fixed known plaintext: column0 XOR the known Onion1 bytes yields a fixed common 23-byte pad. Under the hypothesis of reused 2013-style XOR, exactly this pad should reveal the six later authentic onion links in columns1 through6; column7 would then be an unknown eighth address. No phases, permutations, word segmentation changes, byte projection, key candidate or input offsets are fitted.

## Exact original input result and controls

Historical 2013 positive: original phone cipher bytes 5edb5e8029dd2182560da925ec6cd3e1257efc0b8328b4 XOR the original DATA/560.13 bytes published at offset 13831, 6ab768f540ad4ff1226fce429b06aa970b119262ec46be, produces the exact 23-byte line 4l6uipnstbggwjyv.onion followed by newline.

Forward/inverse positional base29 serializer re-encodes all 299 original GP29 runes exactly. An independent synthetic 299-rune stream built from eight literal 23-byte onion records is decoded to its exact 184 initial bytes.

On the unchanged original 299-rune ciphertext, the fixed common-pad readout matches withheld known Onion2..Onion7 at [0,0,0,1,0,0] byte positions. This is only 1/138 total withheld bytes, where chance matches are expected. Decoded column7 is nonprintable binary 360db7b7468192827e71b75d75ca152c3d2c653eba2f58. It is not an onion address, key, recognizable output or plaintext.

## Interpretation and disposition

The source interval, widths and 2013 Tor record length are genuine, while the binary packetizer, matrix transposition, eight-record reading and repeated XOR key are an unproven proposed composition. Its direct first-party known-address prediction fails decisively. Retire this precise common-pad mechanism; searching alternate row orders, key phases, per-record keys or other fitted serializations would require a distinct original clue.

Exact source and synthetic controls PASS in original-input Windows Node22 Actions run https://github.com/FlareZ123/liber-primus/actions/runs/45096778266 . Single-file Windows Node22 CommonJS reproducer: sims/lp2_terminal299_eightonion_reusedpad_original_sft.cjs. Source records: https://connortumbleson.com/2021/01/25/the-cicada-3301-mystery-puzzle-2/ and https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_7 . An independent earlier packet-versus-PGP study used the same frame: im-results/lp2-p54p55-13dot-base29-packet-gate.md.