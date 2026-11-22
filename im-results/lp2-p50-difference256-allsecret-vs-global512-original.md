# Original GP29 difference inverse: table-cell clocks excluded; one global printed-digit clock remains feasible

**Agent12, 22 November 2026. Classification:** original-source exact all-secret cipher exclusion and conditional survivor. **No authenticated unknown-page plaintext, LP2 key, or destination recovered.**

## Source-selected motivation, and the strongest rival

The original physical p49–51 numeric table contains **256 two-character cells**, equivalently **512 printed digit glyphs**. Authentic solved LP1 prominently names the primes and totient. The unknown book has only **86 adjacent equal-rune events** in **12,901** physical same-page predecessor positions. This motivates a simple 2014-executable, lossless GP29 differential group cipher, with the GP29 special 29th symbol encoded as an exact zero increment. A 256-cell periodic key is a plausible human hypothesis; the original source does **not** authenticate it. Rival: a normal stream cipher or an independent 512-digit clock with a missing key.

## Precise complete reversible candidate

Represent the GP29 rune alphabet by integers 0..28. For the first rune on each physical page, pass the plaintext index through unchanged to initialize the difference register. For each subsequent plaintext rune p, compute:

- If p=28, increment d=0.
- If p is 0..27, increment d=K[phase]×2^p modulo29, where K is any nonzero GF29 key.
- Ciphertext rune c_i=(c_(i-1)+d) modulo29. Reverse by d=c_i-c_(i-1) modulo29 and for nonzero d take discrete_log_2(d/K[phase]) modulo28, otherwise recover 28.

Two source-visible state schedules are independently tested: phase=(global book rune offset modulo period), advancing over every physical-page opening rune; and phase=(within-page rune offset modulo period). We test periods 8,32,64,128,256,512. The group generator 2 has exact order28 mod29.

This model has **no side-information holes**: zero plus the 28 nonzero differences represent all 29 symbols bijectively. With period256 it allows **28^256 independent secret masks**. The exact impossibility below holds for an even larger family of arbitrary 28! secret nonzero permutations independently in each phase; only zero must remain the 29th fixed exceptional output.

## Exact key-independent ceiling on English E-rune counts

For each phase r, count each of the 28 nonzero original within-page ciphertext differences. Each secret bijection can map only **one** distinct difference to E (GP29 rune index18). Thus the total number of E plaintext symbols is bounded above by the sum of the single most populated nonzero difference bucket for every phase. This is an exact maximum for an arbitrary secret nonzero permutation in every phase, without key enumeration or plaintext fitting. It is a necessary bound for the narrower multiplicative family.

The **unchanged original** has 12,956 ciphertext runes on 55 rune-bearing pages, 12,901 same-page predecessor transitions, of which 86 have zero difference and 12,815 have nonzero difference. Source-derived maxima are:

| Period | Global clock: maximum E | Page-local clock: maximum E |
| ---: | ---: | ---: |
| 8 | 579 | 584 |
| 32 | 720 | 730 |
| 64 | 853 | 836 |
| 128 | 1,015 | 1,010 |
| **256 numeric cells** | **1,276** | **1,279** |
| **512 digit glyphs** | **1,671** | **1,310** |

The existing independently published [source-native word-length matched calibration](lp2-cprev-secret-table-majorization-original-gate.md), based on **740 authentic solved-Cicada GP29 words**, uses the exact 2,896 original printed word lengths and the 55 original page-first rune exclusions. Across **5,000** independently seeded synthetic books the expected E count is **1,591.0567** (SD **33.4683**) and the smallest observed E count was **1,468**. All 5,000 are incompatible with **every key** in each listed source clock up to256, and with page-local512. This is conditional on the plaintext being native-GP English with solved-source-like frequency, preserved source-word layout, and the specified fixed zero branch. It does not prohibit transformed plaintext, changing word boundaries, extra cipher layers or more freely evolving keys.

**A genuine fork:** the **globally advanced 512-digit clock** has all-key E capacity 1,671 and therefore survives this necessary native-English condition; 512 positions **reset on every page** cap E at1,310 and fail. The source table actually has 512 printed digit glyphs, so this surviving difference is an independently visible candidate to investigate *only if* a source-selected full key/receiver emerges. Surviving a bound is not positive plaintext evidence.

## Positive inversion, direct table keys, and scope

The SFT constructs a deterministic exact-original-word-length GP native English source-plant from the already solved 740-word corpus, retaining all 55 original physical page partitions. This plant has **1,591 non-page-initial E runes**. Source-table multiplicative masks k=1+(radix60 byte mod28) encrypt/decrypt/re-encrypt all **12,956** native runes exactly for global and page-local256 clocks. Their ciphertext upper bounds are 1,907 and1,881, respectively, legitimately above the known plant E count. Applying those *same exact source keys* to the original unknown LP2 yields only **442/454** apparent E runes at the tested positions, despite trivially exact ciphertext re-encoding.

A second direct source-key test uses the 512 original printed digits, read row-major from each numeric cell. With either k=1+(digit mod28), or k=2^(digit mod28) modulo29, the real original inverse under either global or page-local512 clocks produces only about **450–465 E runes** and an IoC near0.035. All four genuine original ciphertext inverses roundtrip exactly; their 12,956-rune authentic-native positive plants also roundtrip. Thus 512 global phase remains **information-theoretically feasible**, but neither historically straightforward digit-to-key consumer recovers ordinary native-GP prose. Re-encryption alone cannot identify a secret key in a bijective family.

**Complete reproducibility:** [read-only original-cipher CommonJS SFT](../sims/lp2_p50_delta256_allsecret_native_e_gate_sft.cjs), input canonical original GP corpus, source table, printed-word transcription and solved native GP words. [Windows Node22 PASS for 256 clocks](https://github.com/FlareZ123/liber-primus/actions/runs/45078788261) and [Windows Node22 PASS including 512 clock/keys](https://github.com/FlareZ123/liber-primus/actions/runs/45078950990).

**Research decision:** retire the source-cell256 keyed 29-symbol differential/rank mechanism and every shorter tested phase, for ordinary original-space native-GP English. Also retire page-reset512. Global512 remains the only source-dimensionally natural survivor of this *particular* zero-sentinel phase model; the two literal digit keys fail. Work requiring a further unknown 512-position secret is gated on an independently authentic clue, an original-cipher plaintext prediction or a reproducible source-selected inversion. Avoid fitting hundreds of free alphabets.
