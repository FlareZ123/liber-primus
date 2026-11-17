# Terminal 308 / clear PARABLE 95 / terminal 23-dot direct-key gate

**Agent10, 17 November 2026. Classification: source-shaped, bounded original-cipher negative.** This investigation recovered **no unknown plaintext, key, cipher or continuation address**. The original sources support an exact three-part length identity, but give no instruction selecting the tested key register or cipher.

## Human-visible lead and the rival

Physical LP2 p54 has **232** GP29 runes and p55 has **76**, for **308** in the final encrypted chapter. The already-clear p57 PARABLE has **95** runes and ends in the source-image's unique **red 23-dot terminal punctuation**. Hence `308 = 3 × 95 + 23`: the terminal encrypted chapter is three complete 95-rune circuits plus a 23-rune tail. Since p57 speaks of tunneling and shedding circumferences, repeating its known 95-rune text is a reasonably human-visible, low-cost key hypothesis.

**Strongest rival:** this is incidental arithmetic. The 23 red dots are a terminal mark, not a printed instruction to rotate or reuse the clear text; a word count or chapter length can match many linear combinations. Neither the last mark nor the parable specifies GP29 Vigenère or XOR as an opcode. Treat the equality as a hypothesis generator only.

## Frozen direct receiver

Use exactly the 95 authentic clear p57 **GP runes** (the entire red PARABLE title and body) as the cyclic key and the exactly ordered 308 original p54–55 GP indices as ciphertext. Preserve all original printed rune and word boundaries. Two offsets are registered *before reading output*: zero (normal full-parable entry) and 23 (hypothetical shift suggested solely by the 23-dot terminal). At each offset, test both GP29 modular signs and native five-bit index XOR, a historically familiar Cicada primitive. There is no arbitrary phase, secret alphabet, page reset, fixed-plaintext crib, insertion, deletion or fitted key.

The original p54 opens with a complete one-rune word `A` (GP index24), followed by its complete eight-rune red title word with indices `[19,21,23,27,2,14,10,19]`. Under a direct unchanged-word-boundary **ordinary English** reading, the first plaintext word should be `A` or `I`. This is a useful independent gate that avoids selecting any decoded word from the output.

| PARABLE key entry | Operation | First plaintext word | Second plaintext word | Forbidden XOR output 29–31 / 308 | 308-rune GP29 IoC (in-range symbols) |
|---|---|---|---|---:|---:|
| 0 | ciphertext minus key mod29 | J | ABEAIJAEMN | 0 | 0.03566141 |
| 0 | ciphertext plus key mod29 | H | XAEESOEOUF | 0 | 0.03454038 |
| 0 | ciphertext XOR key | NG | JBSIOEEA[30]AE | 26 | 0.02830069 |
| 23 | ciphertext minus key mod29 | G | EAFWAFAEAE | 0 | 0.03426541 |
| 23 | ciphertext plus key mod29 | P | IPIUROAEL | 0 | 0.03426541 |
| 23 | ciphertext XOR key | I | WFWAFEACE | 25 | 0.02802572 |

The GP29 IoC of **actual clear** p57 is **0.06270997**, versus **0.03382** in the undeciphered original p54–55 stream. Every modular readout remains close to the near-uniform original distribution, and all four modular readouts fail the very first ordinary-English word. The apparently legitimate first word `I` for XOR+23 is a **single-character false positive**: 25 later output indices are outside the 29-rune alphabet and the complete opening is nonprose. Both XOR cases are impossible as direct complete 29-symbol plaintext transports unless a separately specified escape or recoding step exists.

Each candidate is an exact direct inverse of its own encoder, so original forward reconstruction succeeds **308/308** and an independently formed 308-rune native-GP plant encrypts and recovers **308/308**. Those facts validate implementation only; they cannot distinguish a true key within a bijective family.

## Decision

**Retire these six complete source-frozen direct PARABLE-as-key consumers.** The 308=3×95+23 identity is an unauthenticated structural coincidence that has not led to an original plaintext or specified downstream operation. Do not tune a shift, word segmentation, null schedule, arbitrary XOR recoding or additional cipher merely to rescue it. A new source-authored operand or exact decoding instruction would justify a genuinely separate test.

Reproduce from the repository root with the dependency-free Node22 CommonJS [original-source single-file test](../sims/lp2_terminal308_parable95_23dot_direct_sft.cjs), using [the canonical 58-page GP29 source](../resources/liber-primus/lp2-corpus.json). The physical dot stencil count comes from the [original-JPEG census](lp2-original-dot-punctuation-physical-census.md); the source title/word boundary is independently established in [the p54–55 original boundary audit](lp2-original-page-boundary-audit-p32-p54-p55.md). The independent [known terminal text transfer](lp2-solved-terminal-known-text-transfer-gate.md) tested a different 180-rune p56||p57 repeating key over the *entire* 12,956-rune unsolved book. The [terminal 308 known-hash gate](lp2-terminal308-knownhash-fullsource-direct-pad.md) tested a different adjacent 85+128+95 key register, not this 95/23 marker proposal.
