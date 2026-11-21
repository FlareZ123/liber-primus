# P7 original five-dot height order exposes a DH23 register readout

**Agent2, 21 November 2026. Evidence class: source-image geometry plus exact original-GP29 arithmetic; prospective body-consumer result is negative.** The dot order offers a visually motivated rearrangement of the five adjacent original red words, but the word-to-dot association and choice of DH output labels are hypotheses. This is **not** authenticated unknown-page plaintext, a new historical key, or a complete decoder.

## Independent original object and operation

Original physical p7 is `resources/liber-primus/24.jpg` (2400×3600). Immediately after 194 black-body runes, its last 14 runes form five red printed words. Original GP29 indices, left to right:

| Red word | GP29 source indices | Product mod29 |
| --- | --- | ---: |
| 1 | [23,3] | 11 |
| 2 | [22,16,2,25] | 26 |
| 3 | [5,7,11] | 8 |
| 4 | [14,28] | 15 |
| 5 | [6,28,19] | 2 |

Five isolated black dots lie immediately below this red inscription. The following centers, in **left-to-right x order**, are measured in original 2400×3600 JPEG pixels (x, y; y increases downward): (796.94, 3105.77), (992.50, 3166.64), (1296.93, 2866.79), (1479.26, 3127.50), (1527.15, 2936.15). They are distinct in height. Sorting the five dots **top-to-bottom** yields original left-to-right dot indices [3,5,1,4,2], one-based.

**Candidate human operation:** associate one dot with each red word by horizontal rank, then read words by the dots' vertical rank, top-to-bottom. This gives red-word order:

`3 → 5 → 1 → 4 → 2`.

Consequently the ordered red-word first indices are `[5,6,23,14,22]`; their products modulo29 are `[8,2,11,15,26]`. This is a completely specified and reproducible permutation from image geometry, **conditional on** pairing the dots and words by horizontal rank. The image does not explicitly say to sort vertically or assign one dot to each word.

## Conditional DH consequence and its weak assumption

One particularly suggestive set of readouts is: first two ordered words' first indices `g=5, a=6`; third ordered word's first index `p=23`; first two ordered word products `A=8, K=2`; second ordered word's last index `B=19`; fourth ordered word's product `b=15`. The last ordered word's product26 is independently `B^-1 mod29`. The third ordered word's second index is `e=3`, and the total five original word products have sum62, giving `q=4 mod29`. Thus the source word digits alone yield:

`(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)`.

All three historical DH equations hold: `5^6 mod23=8`, `5^15 mod23=19`, `19^6 mod23=2`. These are the parameters in the authenticated 2013 Cicada DH *worked example*, already recovered from these red words by earlier non-geometric calculations. This investigation adds a candidate **visual order-selection mechanism**, not independent evidence for the 2013 packet or a newly recovered key. The readouts mix first index, product, last index, and reciprocal in ways not demanded by the ink. An unfitted authored label grammar would have to choose those typed fields in advance.

The earlier retrospective three-column p0 marker-rise/H serializer, when populated with this same p7-derived DH state, recovers the already-known 13-rune p0 red-title candidate `EPIPHANYSEECS` (human `EPIPHANY SEEKS`) exactly. No novel title plaintext was obtained; see [existing p7 register report](lp2-p7-red-circulant-dh-original-inverse.md) and [p0 serializer](lp2-p0-square-state-rise-key-serializer.md).

## Frozen original p0 black-body consumer: negative

To test one direct, simple value-changing consumer, use the five ordered red-word **products** `[8,2,11,15,26]` as a repeating GP29 additive key with zero-phase at the original p0 black-body start (rune offset13). Ciphertext has 249 black-body runes. Two signs, plus the untouched printed-order products `[11,26,8,15,2]` for orientation control, were fixed; no fitted reset, phase, rotation or substitution.

| Frozen key | Decoder | Full p0-body IoC | First 70 native GP letters |
| --- | --- | ---: | --- |
| Height-sorted | `C-K mod29` | 0.033780 | `DNAIOOLNGDCUTAETHIAWLUAAOEWXLPDGGDUCSIAYXDOEIJBNNGTHOUNGEOAXECXEIARPAIEAUEGGSNAJIIC` |
| Height-sorted | `C+K mod29` | 0.035983 | `IPBJYMAXAEABLEONGDADAEENJWNGWIIEAAANGMLIAHIYOEOJAEAEARAHTBSEONGEJEAIAFEAOFACIEATOJSOJEA` |
| Printed order | `C-K mod29` | 0.035562 | `LXIAIIAFAEADFIANGEATHOERAERAMMEOBLHLJNDAETHLUYNLIAPJEOGYCOAEEBIAXPTHMNGIAEAIFPEAAESJNSRNGTPIF` |
| Printed order | `C+K mod29` | 0.034201 | `PHXJTHOEMJARLSSOYYMLAEDEOGRNGEOPCAEAFAXBIAPPNGFEOTEALNGRFJJXSBAPHEAOODFFFHCAETHXIFJR` |

Unchanged p0 black-body IoC is 0.034363; independently clear p57 IoC is 0.062710. The four exact-invertible outputs remain nonprose and ciphertext-like. These four fixed consumers fail to supply the required 150 contiguous authentic plaintext runes. Exact re-encryption is a code correctness invariant, not a key-authentication test.

## Decision and missing authored operand

The image permits a more human-reconstructible choice of **order** than a freely selected five-word permutation. It does not specify which DH field of each ordered word to emit, which numeric representation to use as an LP2 key, what receiver receives that key, or how to clock an unknown-page body. The strongest contrary explanation is that vertically staggered dots are ornamental and the DH labels reflect hindsight from the known worked example. A discriminating **new** original-source clue would need to select the dot-word matching and one fixed value-changing body transform *before* opening an untouched receiver. Do not retune the negative five-period pad, the older p7 circulant, or already failed direct DH consumers.

**Reproducer:** [Windows Node22 CommonJS SFT](../sims/lp2_p7_five_dot_height_dh_handoff_sft.cjs). [Executed original-input SFT, PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44944583720). The SFT asserts the original rune arrays, dot-height order, exact source arithmetic, prior title replay, full p0-body direct consumers and forward inverses, and the negative native-language diagnostics.
