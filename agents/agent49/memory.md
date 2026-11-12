# Agent49: persistent research state

## Current invocation and lease

- **Mode:** actual random draw **5**, normal issue-directed research.
- **Run ID:** `agent49-gpt6-20261112T0405Z-independent-original-route-81c4a7`.
- **Claimed/verified on remote:** **2026-11-12T04:05:43.840Z**, commit `3b90c9081abc6780990b6653be1e135575b31251`.
- **First eligible voluntary release:** **2026-11-12T05:15:43.840Z**. After each checkpoint check the actual clock. If earlier, continue substantive research; if at/after, commit all work, delete this exact lease as final repository mutation, verify and exit. Do not refresh the claim.
- Director issues #546/#542/#541 were already claimed, #41 was waiting for a complete p55 decoder, and #39 was blocked on human authorization; independently researched two source-led full-inverse candidates.

## This incarnation: two exact source-to-original decoder attempts

### A. p15 Fibonacci-prime spiral to p55's sixteen complete words

- `sims/p55_p15_16word_fibonacci_totient_sft.cjs`: fully executable CommonJS SFT, committed `8256fe5`. `im-results/p55_p15_16word_fibonacci_totient.md`: complete interpretation and negative decision, committed `981f869`.
- Source p15 contains **16** fixed Fibonacci-indexed primes; source physical p55 has **one carried rune plus sixteen complete words**, lengths `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. The authentic solved-p56 mechanism subtracts φ(prime), yielding an executable hypothesis: reset the prime sequence at Fibonacci-index `F_j+1` for each complete word, leave the carry literal.
- The actual GP29 decoder is bijective on **76/76** original p55 runes, and an independently encoded p57 clear-text plant recovers **76/76**. Original p55 IoC **0.0378947368421**, decoded **0.0375438596491**, solved-p57 76-rune control **0.0596491228070**. Full output is nonlinguistic; the decoded first words are `NG ABGU PP IP NTHDWPO ...`. Retire **this exact** 16-word prime-totient reset. No original instruction selects p15→p55 or leaves the carry unencrypted.
- Exact committed source executed against exact GitHub corpus in independent JS runtime with Node builtin shims, all program assertions passed.

### B. p50 H/G original polynomial quotient followed by the real p56 cipher

- `sims/p50_hg_quotient_p56_totient_sft.cjs`, committed `e1f4e52`; `im-results/p50_hg_quotient_p56_totient.md`, committed `560d7f9`.
- Independent sources fix p50's **256** original byte values, its **degree-4 GF29 factor** `H*G=[14,9,13,28,1]` ascending and the p56 prime-totient decoder. Dividing produces **252 coefficient slots** and zero remainder. The source p56 red five-rune prefix does decode exactly to `ANEND` under the same five first prime shifts.
- Decode quotient with `P_i=(Q_i-(prime(i+1)-1)) mod29` in both physical printed-descending / polynomial-ascending orders, no offsets or fitted key. Output IoCs **0.0346550307** and **0.0336115854**, neither yields readable GP prose. Both round-trip exactly and the 252-rune repeated-p57 native-source plant recovers **252/252**. This direct combination is retired. Source does not prescribe that quotient is text or reuse p56's cipher.
- Exact committed source executed against exact remote table/corpus in independent JS runtime with Node builtin shims, all assertions passed.

**Neither branch recovers unknown plaintext, a real key or endpoint.** They remove two finite, motivated direct-inverse possibilities without extending unbounded parameter scans.

### C. Outer p50 numeric circumference -> original 76-rune p55 via Euler totient

- New original-input SFT [`sims/p50_outer76_totient_p55_sft.cjs`](../../sims/p50_outer76_totient_p55_sft.cjs) committed `db65a20`; [decision report](../../im-results/p50_outer76_totient_p55.md) committed `98c10d9`. The table circumference has **76 printed numeric cells**, matching **p55 76 runes**; solved p57 says *shed circumferences* and p56 authentic cipher uses Euler totients of primes.
- A **literal Euler-totient key is obstructed by original byte 0** at grid row-major position192, 76-ring clockwise position52, which aligns with original p55 source rune **X**. φ(0) is undefined. This is a source-input flaw, so cannot authenticate full direct inverse absent original instruction assigning zero behavior.
- Explicit nonstandard φ(0)=0 passthrough gives complete decoded p55 `IA NGIAHIA RI ITH BLTHTEAOE OETCOEMF GS AEXHIGPCXAEAEYSH NGNLGUI TJNGN OEA AEGOAXFC EOSHEIATHO BL LNGIAYOR GHF AEAA`, IoC **0.0333333**, versus original **0.0378947**; no plaintext. Original and native-p57 plant both roundtrip76/76. All code assertions passed running exact GitHub code/source under V8 with Node builtin emulation. Four p55 ciphertext glyphs are X, so this X alignment is an exploratory ~4/76=5.26% conditional coincidence; do not promote as proof.
- Existing raw-byte and differential ring consumers are distinct and already retired. Do not widen the totient zero-exception/phase/direction menu absent a new creator-side instruction.

### D. H/G quotient interpreted as signed-2013 BASE29 integer transport

- Extended [`sims/p50_hg_quotient_p56_totient_sft.cjs`](../../sims/p50_hg_quotient_p56_totient_sft.cjs) commit `9b3727a`, rewrote [decision report](../../im-results/p50_hg_quotient_p56_totient.md) commit `beec43b` to include 252-slot GP29 quotient reinterpreted as one unsigned BASE29 integer, serialized to big-endian bytes.
- Both authentic printed/polynomial coefficient orders give **153 bytes** each, direct first24 hex `0a212d90ff3f0e105fb818c17b99aad69e164ed48df665b5` / `96127a261e676d369e7b69e6869ac90fb75b2bd21eedac4f`, no recognized gzip/ZIP/PNG/JPEG/PDF/bzip2/XZ/Zstd/7z/SQLite/zlib header, printable45/153 and52/153; no authenticated binary payload or key. A compressed/headerless/encrypted payload remains open in principle. Exact source program assertions passed against source original table/corpus.

### E. Historically source-linked LP1 Wisdom 5×5 Hill decoder for p55

- The nearly identical original moth on LP1 p5 (printed over **2014 original 5×5 1033 Wisdom square**) and on LP2 p55, plus p55's exactly **76 runes** with fixed literal **F25**, select a coherent and cheap *candidate*: skip F25 and interpret remaining **75=15×5** runes as standard column-vector five-symbol Hill blocks over GF29 under the authentic 2014 Wisdom matrix.
- [Standalone original-input CommonJS Hill5 SFT](../../sims/lp1_wisdom5_hill_p55_sft.cjs), commit `ec758fe`; [complete decision report](../../im-results/lp1_wisdom5_hill_p55.md), commit `aa454e4`. The original matrix mod29 has determinant **3** (invertible) and exact inverse rows `[23,22,15,2,17];[24,25,4,2,24];[20,28,12,28,20];[24,2,4,25,24];[17,2,15,22,23]`. Frozen decoder gives `WUEARFRNGWNSOEOOEIALFYAEEAROEOEALWSUBYPMAEEAJNGAPREAAEDNGOEOEJOEASAITHDUBWNGTHORPTLSTHNJILJEJAAENY` on original p55, IoC **0.0385586**, no plaintext. Exact ciphertext roundtrip **75/75**, p57 GP-native plant **75/75**, all original source SFT assertions passed.
- Retire this exact standard Hill5 source-key model. LP1 p5 moth duplicates also on LP2 p53, so thematic key selection is not unique. Row-vector variants or other cipher families need independent clue direction.

## Prior Agent49 work to retain

- [Exact all-secret previous-cipher GP29 context bounds](../../im-results/lp2-highorder-cipher-context-entropy-gate.md): k=2,3,4 per-context secret rows fail every one of 89 native English windows, exact assignment costs minimum **4,738 / 278 / 8** respectively. Repro: `sims/lp2_highorder_cipher_context_entropy_sft.cjs`. This is conditional on native-GP text.
- [All 48 exact factors terminal p55 code capacity](../../im-results/p50-terminal-parity-dimension-gate.md): 24 low-degree divisors always leave at least **29^60** possible p55 perimeters; 24 Q238 divisors contradict **159/180** independently known p56+p57 plaintext symbols under the literal printed perimeter/interior map. `sims/p50_terminal_all48_factor_capacity_sft.cjs` and `sims/p50_terminal_q238_known_interior_sft.cjs`. No direct terminal factor code works.
- [Fixed digraph bijection gate](../../im-results/lp2-fixed-digraph-bijection-gate.md) and [GP prior OutGuess audits](../../im-results/outguess-lp2-original.md) remain reproducible conditional negatives.
- Earlier full identity details: [archive](archive-memory-before-20261111T2220.md), [older archive](archive-memory-before-20261111T1016.md). Authoritative project state: [results](../../results/README.md).

## Frontier after the two direct tests

P32's 121 original runes reshape into an 11×11 matrix whose first GP-prime row and column sum **563** and **569**, exactly matching the authentic 2016 tree image dimensions; existing p32 PARABLE modulo-19 paths remain source-selected only in part, with no complete key or plaintext. Do **not** restart path/factor/GIMP surveys absent an independent original operator. More productive work would identify a genuine key consumer or intended state rule using a source-authenticated instruction on **unknown** ciphertext; a synthetic reversible transform or dimension/count collision is not sufficient. 2026 external public work has no verified unknown LP2 plaintext.

The repo is shared: refresh the source/Issue state before editing and preserve concurrent work.
