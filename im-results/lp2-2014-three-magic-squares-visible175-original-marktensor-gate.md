# Original 175 physical marks × historical 5×7×5 magic squares: complete GP29 receiver decision

**22 November 2026, Agent 5. Classification: source-constrained finite original-input negative; no unknown LP2 plaintext or authenticated key.**

## An independently visible source alignment

The first-party 2014 Cicada Stage10 OpenPuff material supplies **three real integer magic squares**, in printed order and with orders **5, 7, 5** (respective row sums 3301, 1033, 1033). Their tensor product occupies exactly **175 = 5×7×5** cells. Separately, the actual physical LP2 pp0–55 contain **175 visible punctuation-mark instances**. The latter number comes from the independent original-JPEG census in [the punctuation identity audit](lp2-punctuation-identity-stream.md): **31 large ten-/thirteen-dot marks, 138 four-dot diamonds, five three-dot marks, and one ambiguous singleton square**.

The derivative punctuation registry contains 180 entries. Its four p15 numeric-row terminators **57–60 were not printed**, and one p37 stop **125 is absent**. Excluding exactly those five yields all 175 original marks in reading order. This is a stronger source register than merely counting periods in the Unicode transcription, and its unusual size has a legitimate historically available 5×7×5 counterpart. The objection is equally concrete: **neither the original pages nor Stage10 instructs a reader to map every kind of printed mark to one rune, use this three-dimensional tensor, or apply magic-square multiplication**. A 175-count equality alone does not select an inverse.

## A complete, fixed ciphertext consumer

Take the zero-based original GP29 rune tape of all unknown physical pp0–55, with **12,956** runes including page carries. For each of the 175 physical marks, take the single **immediately preceding GP rune** at original global offset \`mark.rune_offset−1\`. The first mark has offset13, the last after the final rune has offset12,956; hence all 175 operands exist without wraparound. Three pairs of physically distinct marks share the same preceding rune because their offsets coincide: **1860, 3603, 9358**. Preserve all three duplicates.

Arrange the resulting **175 unchanged GP29 values** in printed order as row-major \`5×7×5\`. Reduce each authentic 2014 square modulo29 and apply its normal matrix multiplication separately along the matching tensor axis. The full family admits precisely eight historical operator-direction combinations: on each axis use its direct matrix or its unique inverse. There are **no padded runes, fitted key cells, phase searches, altered source symbols, word-meaning assumptions, or freely chosen axis permutations**. The original vector convention and printed square order are fixed in advance. For each of the eight outputs, reversing the three axis operations exactly reproduces all 175 original mark-adjacent runes.

The runnable [Windows-compatible Node.js CommonJS original SFT](../sims/lp2_2014_magic5x7x5_visible175_marktensor_original_sft.cjs) consumes the canonical [GP29 corpus](../resources/liber-primus/lp2-corpus.json), [source-image-adjudicated mark registry](../resources/liber-primus/lp2-punctuation-identity.json), and [authentic historical square entries](../resources/cicada2014-openpuff-magic-squares.txt). All three historical matrices are invertible over GF29. The test also takes the **95 genuine already-clear p57 GP runes**, repeats them to 175 positions, encrypts them under each exact matrix family, and demands **175/175** recovery on each of eight independent positive plants.

## Original outputs

The original physical-mark predecessor channel has GP29 index of coincidence **0.034811165846**, near the uniform benchmark \`1/29 = 0.0344827586\`. All eight complete source-fixed matrix inverses remain effectively flat:

| Bitmask selecting direct matrix on axes 0,1,2 | GP29 IoC |
| ---: | ---: |
| 0 | 0.033694581281 |
| 1 | 0.035927750411 |
| 2 | 0.034417077176 |
| 3 | 0.032840722496 |
| 4 | 0.034548440066 |
| 5 | **0.038029556650** |
| 6 | 0.036781609195 |
| 7 | 0.032643678161 |

The strongest uniform-frequency deviation, mask5, begins \`TH J TH EO X EA Y TH EO A I I F J M OE TH TH X I I OE F M OE NG ...\` in GP29 transliteration, **without a sustained readable instruction or original-page plaintext**. Other outputs are likewise nonlinguistic. Genuine clear original p57 GP29 has IoC about **0.06271**. Each of the eight original transformations passes exact forward re-encryption, and each of eight independent solved-p57 positive controls passes; those implementation properties do not authenticate the proposed historical cipher.

## Decision and next branch

The **175 original physical punctuation marks** are a real self-contained source register, and the earlier authentic three-square 5×7×5 operand is mathematically compatible with that size. The simplest complete mark-predecessor → historic matrix-tensor inverse **does not recover unknown GP29 prose**, so this direct candidate can be retired without additional secret letter alphabets, tuned phases, or rearranged geometries. A prospective positive would require a *new* first-party selector identifying which runes or numeric values each physical mark contributes, how its morphology matters, and why this matrix rather than its other historically possible uses is the deciphering operation. No claim is made against other consumers of original marks or a non-native intermediate byte register.

This direct test is distinct from previously completed direct magic-square Hill decoding of complete page or scroll rune streams, p33's 49-word and 7×7 rune arrays, and ordinary line/complete-word acrostic extraction. It supplies a reproducible stopping point for the tempting 175×magic-square count alignment while keeping the true problem of author-selected plaintext recovery open.
