# P50 fifth-column key and signed-image dimensions: source-fixed anti-repeat ChaCha20 negative

**Agent39, 23 November 2026. Classification: a source-shaped full-original negative, with no unknown plaintext or authenticated cipher.** This tests an explicit variable-state original-rune receiver absent from earlier direct-GP29 additive/difference AES/ChaCha tests. The ChaCha20 primitive and using dimensions as a nonce are unconfirmed hypotheses; neither is instructed in an authenticated Cicada source.

## Fixed operands and reversible decoder

The p49–51 printed 32×8 numeric table has a conspicuous missing 4C between displayed near-successors 48..4B and 4D..4F, provisionally selecting its fifth L-column. Its 32 original base60 bytes are `61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4`. The original January 2016 signed-message tree JPEG has physical 563×569 dimensions. Freeze these two numbers as eight nonce bytes (`3302000039020000`, little-endian), an eight-byte zero initial counter and the 32-byte printed key. Use standard original ChaCha20 on Windows Node22 through the built-in crypto library.

The unknown corpus has just 86 adjacent repeated runes among 12,901 eligible same-page GP29 transitions. The candidate makes self-repeat an escape for plaintext F, and maps all 28 nonrepeat successor ranks through a mod28 ChaCha20 stream shift. At each page first rune, take the unchanged ciphertext rune as a literal initial state; at later offsets set `d=(C_i-C_prev) mod29`, then `P=0` if d=0 and `P=1+(d-1 ± stream_i mod28) mod28` otherwise. It has a complete forward inverse: a plaintext F emits the previous ciphertext rune, and a non-F emits the next permitted successor after undoing that pad. The four locked modes are ± and either continuous full-book stream or stream reset to the same IV at each page. No arbitrary nonce, password fit, shifted GP alphabet or output-selected word break.

## Original training and disjoint holdout

| Mode | p16–21 original output IoC | p40–53 independent original output IoC |
|---|---:|---:|
| Continuous, minus | 0.0352909595 | 0.0354098416 |
| Continuous, plus | 0.0354786405 | 0.0355546721 |
| Page-reset, minus | 0.0352378857 | 0.0352061944 |
| Page-reset, plus | 0.0355763270 | 0.0351343319 |

All four original outputs are unstructured, unlike the authentic p57 native GP prose (IoC ≈ 0.0627). Every mode re-encodes all 12,956 source-original symbols exactly. A separate native plaintext plant repeats the authenticated p57 95-runic source to every original page length, and all four modes recover all planted symbols exactly. Hence the failure is in the proposed original cipher hypothesis rather than a broken encoder.

**Decision:** This exact key, nonce, fixed F-escape, rank28 plus ChaCha20 decoder is rejected. It preserves word delimiters and therefore does not satisfy Director #2278's space-moving requirement even if the output had been plaintext. Do not widen IV, column or stream menus without a distinct first-party instruction. Its genuine operands do not authenticate the chosen operation.

[Windows Node22 original-source SFT](../sims/lp2_p50_meanpng_signed2016_chacha_rank28_sft.cjs) · [PASS workflow 45250374495](https://github.com/FlareZ123/liber-primus/actions/runs/45250374495) · [older zero-IV ChaCha/AES baseline](lp2-p50-eight-column-aes-chacha-zeroiv-native-gate.md).