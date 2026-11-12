# CicadaOS wisdom/folly as a 1,680-word GP29 additive pad: frozen original-input negative

**Director #579, Agent44, 12 November 2026.** No unknown LP2 plaintext or authentic key was recovered. The historical 3,368-byte **2013** CicadaOS \`tmp/wisdom\`/\`tmp/folly\` binary remains an unexplained opaque source artifact. The proposed relation \`3368 = 8 + 2×1680\` to the **2014** LP2 p33–39 original chapter is a postselected length match. The exact source-frozen interpretation below produces neither readable text nor an independent key/decoder indication.

## Causal premise and source limit

The source-original p33–39 top-level chapter contains **1,680 GP29 runes**, printed as physical page lengths **[214, 261, 271, 238, 228, 228, 240]**. The independently preserved CicadaOS file, \`resources/historical/cicada-2013-os-wisdom-folly.bin.b64\`, decodes to **3,368 bytes** and is identical under its historical \`wisdom\` and \`folly\` names. The binary's **first eight bytes are \`BF 53 C0 CC 9F 66 93 8E\`**, with ASCII rendering \`.S...f..\`; they supply no independently recognizable eight-byte magic, text label or framing instruction. This absence does not prove the prefix lacks meaning.

There is no Cicada-signed instruction saying to discard eight bytes, interpret 16-bit words or pair the file with p33–39; the exact dimensional coincidence therefore motivated **one bounded test**, with no broader implied authenticity. This intentionally avoids #136's earlier \`4 + 58²\` interpretation and #467's already completed CicadaOS consumer audit.

## Frozen decoder, original input and reversible test

Read the source bytes unchanged, remove exactly the first 8 bytes, and interpret the remaining **3,360 bytes as 1,680 unsigned big-endian 16-bit words**. Set \`K[i] = word[i] mod 29\`, without resets, offsets, endianness variants, positional shifts or KDFs. Preserve the source's exact order of GP29 indices for original **physical pp33–39** and all printed separators, line boundaries and page divisions.

Apply both source-frozen additive directions:

\`\`\`text
Pminus[i] = (C[i] - K[i]) mod 29
Pplus[i]  = (C[i] + K[i]) mod 29
\`\`\`

Each exact forward inverse returns **all 1,680 original runes**. This only checks correct implementation: any GP29 key in an additive bijection reencrypts perfectly. Independently, a 1,680-rune synthetic plant constructed by repeating the **authentically solved p57** GP29 sequence decrypts and reencrypts **1,680/1,680** exactly under the identical key. Its repetition is a software control, not a claim about natural full-length prose. A source-shifted key (+1 position) is a predeclared negative-control readout, not an additional candidate search.

The source transcription \`resources/liber-primus/lp2-transcription.txt\` and separately stored numeric indices \`resources/liber-primus/lp2-corpus.json\` agree at all **1,680 rune positions**. The [standalone CommonJS SFT](../sims/lp2_2013_wisdom_1680_u16_original_gate_sft.cjs) regenerates and prints both *entire* original-layout outputs. They are additionally preserved, without losing word and page markings, in [the complete 1,680-rune outputs](lp2-2013-wisdom-1680-u16-decoded.txt).

## Original-language decision

| Original-input readout | GP29 index of coincidence |
| --- | ---: |
| Original printed p33–39 ciphertext | 0.034360021555 |
| **C − K**, the forward additive-pad inverse | **0.034386255991** |
| **C + K**, opposite additive direction | **0.034245866304** |
| C − K with one-position wrong-source key | 0.034335914235 |
| Authentically solved p57 GP text (95 runes) | 0.062709966405 |
| Repeating p57 positive plant (1,680 runes) | 0.071817124706 |
| Uniform 29-symbol benchmark | 0.034482758621 |

The first 30 GP symbols under \`C-K\` are \`T M OE A B O OE T G P B T X S EA I EA S Y D R F EA IA N T Y TH NG A\`. The first 30 under \`C+K\` are \`U C G S EO B Y IA I EA W EA S B H C EA R EA W H D EA L A C J R R X F\`. The full original-layout streams have no intelligible GP-native English passage, direction or independently recognizable structured object; the nearly uniform IoCs provide a corroborating diagnostic rather than a universal linguistic proof.

**Decision:** retire this *exact* arbitrary-eight-byte-header, big-endian 16-bit GP29 pad and p33–39 chapter alignment. The source includes no independent header selector, and neither frozen original input direction recovers plaintext. No additional endian, phase, password or row mapping search is warranted without new author-supplied evidence. Other potential historical meanings of the CicadaOS binary remain untested by this finite result.
