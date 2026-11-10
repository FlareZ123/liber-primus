# Exact directed-cycle obstruction to fixed-width binary packets in 79/78 transport

**Agent 23, 10 November 2026. Classification: key-independent, original-cipher structural exclusion with four positive source-sized plants.** No unknown LP2 plaintext, historical key, actual encryption mechanism, or destination recovered.

The existing 79/78 hypothesis represents each 78-digit GP29 integer using 79 radix-28 digits, emitted through a fixed secret predecessor-excluding permutation of the 29 runes. In this *exact* architecture, **any independent fixed-width unrestricted binary integer payload per 79-symbol packet is impossible**. This closes a natural direct binary-intermediate variant without excluding binary bitstreams using varying framing, cryptographic state, restricted codebooks or other transports.

## Complete mathematical argument

A fixed unsigned \`n\`-bit payload converted to 78 base29 digits must fit \`n <= 378\`, because \`2^378 < 29^78 < 2^379\`; for \`n >= 379\`, the complete set of \`2^n\` inputs cannot inject into the \`29^78\` available 78-digit GP29 values. For every \`n <= 378\`, its numeric value \`N < 2^378\` implies the most significant of the 79 emitted base28 digits has

\`d0 = floor(N / 28^78) <= floor((2^378 - 1) / 28^78) = 8\`.

**Unknown cyclic alphabet:** \`d0 in [0,8]\` means each packet-leading predecessor-to-current rune step must advance **1 through 9** clockwise in one common secret 29-symbol cycle. If the observed source contains a directed 3-cycle \`a→b→c→a\` among intact packet-leading transitions, its three positive clockwise steps must sum to a multiple of 29. Their sum is at most \`9+9+9=27\`, an impossibility independent of all \`29!\` secret orders.

**Unknown sorted alphabet:** the digit \`d0 <= 8\` selects one of the first nine symbols of a fixed sorted hidden alphabet with its previous rune deleted. The leading output glyph therefore must belong to **at most ten** global symbols, even when predecessor identities vary. Eleven distinct observed leaders would exclude every secret sorted order.

The original source violates both necessities **for every tested packet phase and digit direction**. Repetition-containing packets were discarded in full; the first start at source offset zero was discarded for its missing predecessor. No English-language scoring or reconstruction of ciphertext digits under a guessed key enters the proof.

## Original source and exact measurements

The input is \`resources/liber-primus/lp2-corpus.json\`: all physical unsolved pages 0..55 (p50 rune-free), concatenated into 12,956 original GP rune indices. For each phase 0..78, take full 79-transition packets and consider forward and reversed digit order. The leading edge is the first published transition in forward order or the last in reversed order. The 158 distinct phase/direction cases yield:

| Diagnostic | Source-original result | Exclusion threshold |
| --- | ---: | ---: |
| Minimum directed three-cycles per case | **2** | **At least 1** makes cyclic model impossible |
| Minimum distinct leading runes per case | **25** | **More than 10** makes sorted model impossible |
| Cases excluded for cyclic order | **158/158** | |
| Cases excluded for sorted order | **158/158** | |
| Total fixed-order family cases excluded | **316/316** | |
| Phase35 forward | **95 clean packets; 9 directed 3-cycles; 28 leaders** | |
| Phase35 reversed | **95 clean packets; 16 directed 3-cycles; 28 leaders** | |

A transparent original witness at phase35 forward uses three unaltered packet-leading transitions, indexed globally from zero:

\`C[508]=ᚠ → C[509]=ᛚ\` (physical p1), \`C[6670]=ᛚ → C[6671]=ᛟ\` (p27), \`C[10620]=ᛟ → C[10621]=ᚠ\` (p43).

All three appear in **complete repeat-free phase35 packets**. Any fixed secret cycle must put these three steps in clockwise distance 1..9, while their combined distance must be divisible by 29. This is the contradiction without any probabilistic test.

## Blind positive controls and reproducibility

Run \`node sims/prime79_binary_capacity_cycle_gate.cjs\` with Node 22, CommonJS, no extra packages. Fixed PRNG seed \`0x23094779\` generates a hidden random 29-rune order, 163 independent **378-bit** unsigned integer packets, a 35-rune arbitrary prefix and a 44-rune suffix. Four synthetic variants cover cyclic and sorted orders, each with forward and reversed digit transport. Every positive decodes and exactly re-enciphers **163/163** independently generated integer packets. Cyclic plants contain zero forbidden directed three-cycles; sorted plants have at most ten distinct leading glyphs. The original source, by contrast, fails all 316 necessary conditions. The exact original-branch and synthetic tests also **passed on Node 22 in [manual GitHub Actions 42824380536](https://github.com/FlareZ123/liber-primus/actions/runs/42824380536)**.

The theorem excludes the direct **47-byte (376-bit)** packet proposal as a strict special case, and also covers 377- and 378-bit integer payloads. It does **not** rule out variable-size or continuous binary packing, an explicitly transmitted per-packet salt, separate output symbols for repeat steps, a changing alphabet/order, nonlinear encoded intermediates restricted to a subset of 379-bit values, or arbitrary non-binary 78-digit GP plaintext. Those require independent, reversible original-source predictions rather than another key search in the excluded fixed-width family.
