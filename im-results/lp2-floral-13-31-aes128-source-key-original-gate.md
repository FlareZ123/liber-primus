# Floral 13/31-selected p50 rows as a literal AES-128 key: original text gate

**Research status (Agent17, 22 November 2026):** One new, frozen, reversible source-key candidate was tested on the **intact 3,008-rune p40–53 corridor**; it failed to recover original plaintext. The recovered output is uniformly distributed GP symbols, with original normalized index of coincidence **0.03443–0.03457** versus independently planted source-native GP English **0.06150**. The positive plant, incorrect source-row negative and complete inverse all pass in Windows Node22. This is **not** an exclusion of all AES, all row keys or all cipher architectures. No unknown plaintext or authentic key was found.

## Independent source clue and the minimal hypothesis

The source-original p40–55 floral pages show exactly two distinct five-dot margin patterns, reported and measured in [the existing original image note](lp2-floral-outline-dots-13-31-table-selector.md): left `01101₂=13` and right `11111₂=31`. The same chapter independently includes a p49–51 physical **32×8** grid of two-character base60 candidate bytes, retained in `resources/liber-primus/base60-grid.json`. Selecting zero-based rows 13 and 31 supplies **2×8 = 16 bytes**, a literal AES-128 key length. These are original source structures; the choice to concatenate rows and use AES remains **hypothetical**. The earlier [#1293 original row consumer](lp2-floral-13-31-original-direct-row-and-walk-gate.md) and [Agent13 literal reversed-row XOR] documented opaque direct output, with no AES-128-CTR source receiver. The present typed key test differs from those direct byte or graph readings.

From the unmodified conventional base60 row parser:
- zero-based row13: `7a3f1fda0eb82073`
- zero-based row31: `719eace6b424bd50`
- 16-byte literal key: `7a3f1fda0eb82073719eace6b424bd50`
- separately plausible right-wing mirrored key: `7a3f1fda0eb8207350bd24b4e6ac9e71`

Freeze the recognizable 2014-period AES-128 counter-mode keystream with a 16-byte zero IV, one byte per *actual GP rune*, `r_i=AES128CTR(key,zeroIV)[i] mod29`. Invert the whole original p40–53, including red title/ending and runeless p50 table (which consumes zero symbols), via `P_i=(C_i-r_i) mod29`. For completeness the opposite additive direction is a second source-common consumer, and reversal is applied solely to the right row, because the margin image supplies two sides. The **four frozen original tests** do not retune rows, IV, key phase, body start, punctuation, plaintext F or observed output.

## Results on the unmodified original section

| Original AES row/key direction | GP29 output IoC | 48-rune decoded opening |
| --- | ---: | --- |
| row13+row31 / subtract keystream | **0.034573363** | `L A D TH NG F O E T P H G D N P X G R TH J O B T R EA OE X EA I N TH P A AE T U N C T TH L G G T U E E B` |
| row13+row31 / add keystream | **0.034551693** | `N D S NG L B E IA O P L B OE S X NG U EA J T H O T F U T C J Y H H M P M AE Y N T E F T EA AE B EA Y D P` |
| row13+mirrored(row31) / subtract | **0.034432512** | `S E Y Y Y F U U NG I D P M C H Y O X F S EA F W AE NG TH EA B TH EA I E AE OE D AE EA A S EA EO O T Y C NG G IA` |
| row13+mirrored(row31) / add | **0.034534004** | `X F EO Y S B L S IA T C I Y M M N R E P EO EO L AE H H W L OE C E F X EO OE E TH M Y M O A TH S W A D G O` |

None is sustained source-native prose; all four are near the 1/29=0.034483 random-register IoC. For a real solved-native control, the same source-fixed 16-byte key and AES mode encrypt a 3,008-rune excerpt from `resources/liber-primus/lp1-plaintext-reference.txt`, then decode **every one of 3,008 runes exactly** with original source-native IoC **0.061498790**. Replacing source row13 by row12 fails that positive exactly. All original candidate outputs re-encrypt, which only verifies invertible implementation.

**Source-backed Windows Node22 PASS:** [run 45015289781](https://github.com/FlareZ123/liber-primus/actions/runs/45015289781). **Reproducer:** [frozen literal source-key SFT](../sims/lp2_floral_13_31_aes128_source_key_original_sft.cjs) and [workflow](../.github/workflows/agent17-floral-13-31-aes128-original.yml). The Node `crypto.createCipheriv` interface follows the [Node22 crypto documentation](https://nodejs.org/download/release/v22.21.0/docs/api/crypto.html).

## What actually changes

The image-derived **13/31 key-source idea** still lacks a creator-selected byte radix, key-to-cipher interface, AES variant, IV, counter/rune clock and chapter state update. In this one tightly specified key construction, the 16 original selected bytes are **not** enough to decrypt the original floral GP text as English. Do **not** rescue this by fitting alternate AES modes, a 16-byte nonce, arbitrary digit pads, or secret phase to opaque output. If a first-party source independently identifies the cryptographic consumer, test that complete instruction with one untouched chapter prediction. Until then, treat 13/31 as source-authentic morphology and p50 row addresses rather than an authenticated key. Existing #2218/#2231 evolving-state original-cipher studies remain distinct and should not be duplicated.
