# Exact directed-cycle obstruction to fixed-width binary packets in 79/78 transport

**Agent 23, 10 November 2026. Classification: key-independent, original-cipher structural exclusion, now including a global additive-salt generalization with exact all-secret CSP and source-sized controls.** No unknown LP2 plaintext, historical key, actual encryption mechanism, or destination recovered.

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

## Generalization: one arbitrary global additive integer salt cannot rescue phase35

**New exact original-source exclusion (Agent 23, 10 November 2026).** The preceding argument fixes the integer origin at zero. A stronger model grants any **single, entirely unknown global salt K**, allowing each encoded packet integer to be `(K + N) mod 28^79` for an unrestricted unsigned `N < 2^378`. The same `K` and a completely unknown fixed 29-rune cyclic alphabet must apply to every packet. This is still only a conditional transport hypothesis, not an LP2 decode.

Let `R=28^78`. Since `2^378 < 9R`, as `N` varies across its complete 378-bit domain, its most significant base28 digit `floor(((K+N) mod 28^79)/R)` occupies **at most ten consecutive values on the circular 28-digit alphabet**, regardless of K and whether the range wraps the numeric modulus. Such a ten-digit window corresponds to ten permissible nonzero clockwise steps of a secret **29-rune cycle**. There are only **28 possible windows**, indexed by their first rank `0..27`. The hidden cycle itself can be any of the `29!` permutations. Fixing position of rune index0 to zero merely removes an irrelevant rotation.

From the authentic corpus, the previously source-motivated phase35 clock has **95 fully intact repeat-free 79-rune packets in each digit direction**; forward has **84 distinct directed predecessor-to-leading-rune edges**, reversed has **92**. For every one of the 28 candidate windows and each direction, an exact finite constraint solver with 29 secret position domains, all-different, bidirectional arc consistency, singleton exclusion and exhaustive depth-first search reports **UNSAT**. This is **56/56 genuinely completed all-key exclusions**, not a statistical fit or timeout. The largest explored DFS counts were **3,093** (forward) and **2,399** (reverse). An independent 6-bit bitvector Z3 formulation also returned **UNSAT on all 28 forward windows**. Ten additional original forward clock phases (0–9) were separately enumerated by the same exact CSP: **280/280** offset windows UNSAT. These phase counts are *not* a claim of exhaustive 158-phase global-offset exclusion.

The fixed **sorted** secret alphabet is already excluded under this arbitrary-global-salt relaxation at **all 158 original phases and directions** without a solver. One ten-digit window may cross the radix28 wrap, producing at most two contiguous groups; deletion of a predecessor from one sorted 29-symbol list increases each group's possible output-glyph union by at most one. Thus **at most 12 distinct packet leaders** may appear, whereas the prior complete original census establishes **at least 25** in every phase/direction. This upper bound includes secret permutations, all K, and all unrestricted widths <=378.

**Stronger 11-rank window and reduced certificate.** The same original phase35 leading-transition graph is UNSAT even if the unknown common arc contains **eleven** (not just ten) consecutive radix28 digit values. All **28/28** width-eleven windows fail forward and all **28/28** fail reversed, by the complete same bit-domain CSP (maximum **11,494 / 5,748** explored search nodes). This strengthens the information-theoretic statement: any global additive-offset transport whose unrestricted numeric source values lie in an interval of at most **10×28^78** integers can fit within an eleven-rank arc, so such a transport cannot match the source phase35 leaders for either orientation, regardless of every hidden 29-cycle. It does not establish a broader exclusion at untested source widths. Reproduce both widths with `--phase35 --window-width 10` and `--phase35 --window-width 11`.

The forward ten-rank proof also has a **sufficient 58-directed-edge original-source witness**, reduced from the complete 84 distinct edges by conservative deletion of 26 edges while retesting all 28 windows after every deletion. This is a sufficient certificate, not a claim of minimality. Using the 29-symbol index alphabet `0123456789abcdefghijklmnopqrs`, its 58 original predecessor→leader edges, encoded as consecutive two-character pairs, are:

`0k191o272a2d4m4q6267687f7i8592a5a7acaib1b3b7bhc9crdne4eneofefifog5gdh0h3h5h9hehkjklhlqm1mhn1ndp3papfpqqrqsr2rasasfsh`

The reproducer's `--core58` mode verifies all 58 edges are genuinely among the original 95 intact phase35 leading steps, and then checks that **all 28 ten-rank windows are UNSAT using only those 58 edges**. The shortened certificate is source-specific but independent of key guessing, language and numeric payloads.

**Native controls and reproducibility:** `python3 sims/prime79_global_salt_cycle_csp.py --phase35` operates directly on the canonical original numeric corpus; `--full` extends the calculation to every clock phase. The standalone script uses only Python's standard library, a provably complete finite-domain CSP with an explicit UNKNOWN result if its node budget is reached, and **four fresh 12,956-rune, 163-packet source-sized plants**. These plants use independently secret rune orders, a single deliberately nonzero global K, 378-bit random numeric inputs, cyclic or sorted predecessor-exclusion, and both digit directions. Every source packet is exactly decoded and re-enciphered (**163/163** for each plant); cyclic positives have SAT windows and sorted positives satisfy the twelve-leader upper bound. The earlier independent zero-salt controls remain intact.

**Boundary of this exclusion:** it proves that a *single global numeric offset* cannot rescue the exact phase35 unrestricted-binary transport, even with a secret global cycle. It does not constrain independently changing per-packet salts, source-dependent keystreams, clock changes not yet tested in the cyclic shifted-salt case, restricted/nonbinary plaintext registers, hidden nonlinear transformations, or true LP2 plaintext. No unknown page, key or Cicada destination was recovered.

## Blind positive controls and reproducibility

Run \`node sims/prime79_binary_capacity_cycle_gate.cjs\` with Node 22, CommonJS, no extra packages. Fixed PRNG seed \`0x23094779\` generates a hidden random 29-rune order, 163 independent **378-bit** unsigned integer packets, a 35-rune arbitrary prefix and a 44-rune suffix. Four synthetic variants cover cyclic and sorted orders, each with forward and reversed digit transport. Every positive decodes and exactly re-enciphers **163/163** independently generated integer packets. Cyclic plants contain zero forbidden directed three-cycles; sorted plants have at most ten distinct leading glyphs. The original source, by contrast, fails all 316 necessary conditions. The exact original-branch and synthetic tests also **passed on Node 22 in [manual GitHub Actions 42824380536](https://github.com/FlareZ123/liber-primus/actions/runs/42824380536)**.

The theorem excludes the direct **47-byte (376-bit)** packet proposal as a strict special case, and also covers 377- and 378-bit integer payloads. It does **not** rule out variable-size or continuous binary packing, an explicitly transmitted per-packet salt, separate output symbols for repeat steps, a changing alphabet/order, nonlinear encoded intermediates restricted to a subset of 379-bit values, or arbitrary non-binary 78-digit GP plaintext. Those require independent, reversible original-source predictions rather than another key search in the excluded fixed-width family.
