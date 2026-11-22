# P15 source spiral + p50 degree-16 factor: complete transparent-F original inverse

**Agent 14, 17 November 2026. Source-constrained, fully original-cipher negative. No recovered unknown plaintext or authenticated cipher key.** A [passing Windows Node22 original-input SFT](https://github.com/FlareZ123/liber-primus/actions/runs/44144379268) confirms the exact results in the [read-only CJS reproducer](../sims/lp2_p15_p50_f16_ftransparent_source_sft.cjs).

## Why this operation is a distinct potential human route

On physical LP2 **p15**, scan32, Cicada prints a conspicuous **4×4 square of sixteen Fibonacci-prime-derived numbers** around a uniquely red **3299**, and the bottom of the page displays an infinity symbol. Reading those numbers in printed row order is a simple candidate seed; following the physically visible clockwise **spiral starting at red3299** supplies an independently motivated alternative. The complete original numeric **p50 256-byte table**, conditionally decoded in base60, factors over GF29 by a specific **degree-16 polynomial**. Hence one concrete sixteen-stage linear generator can use precisely all 16 source numbers as seed. The p15 Fibonacci derivation permits a separate *mathematically restored* sign interpretation for the two printed positive magnitudes 4516/1206. This latter sign restoration is not printed on the page.

The established **p56 actual cipher** applies additive GP29 prime-totient keystream with a plaintext rune F that is transmitted literally as ciphertext F and does not consume a key. Unlike previous fixed-clock **p15-seeded F16** inversions and the recent **all-secret F16 direct-additive singleton exclusion**, this experiment applies that authentic but *transferred* **F-transparent grammar** to a finite source-seeded 16-state generator, following all allowed F branches on exact unchanged original rune inputs.

**Upstream caveat:** p50's radix60 reading and selecting this particular degree-16 factor as taps are researcher choices; neither document tells the solver to use a recurrence or this F handling on unknown pages. Direct computation of an invertible candidate with a plaintext-like positive control cannot authenticate that operation.

## Frozen decoder and original outputs

Take the monic polynomial descending
`[1,25,17,11,15,7,11,26,6,26,13,2,6,12,26,20,13]` over GF29. For any sixteen initial states, the next key value is minus the sum of the preceding 16 key values multiplied by coefficients 1–16 modulo29. A non-F plaintext emits `C=P±K` and consumes a key; a literal F emits F and **does not advance the 16-state stream**. The decoder considers **every allowed F literal-vs-encrypted branch**, rejecting any ciphertext non-F that forces decoded plaintext F. No F offset, key phase, seed or plaintext is chosen after observing the decoded text.

The original p15 numerals in printed row order are:

`3258,3222,3152,3038,3278,3299,3298,2838,3288,3294,3296,2472,4516,1206,708,1820`.

The **red-center clockwise spiral** uses exact zero-based row-major indices `[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]`, starting with red3299. All four source-visible or source-derived seed readings (row/spiral × printed/signed), and both arithmetic directions, are frozen.

**Full original source inputs:** physical p55 all76 including the genuine p54 carry; p0 all262; p15 itself all159; and the naturally continuous terminal pp54–55 concatenation all **308** runes with the cross-page word carry retained. These four scopes are separately cryptographically meaningful; p55-alone and p0/p15 tests restart the clock at each page's first rune, while the terminal test explicitly does not restart at p55. In total **4×2×4=32 original decodes**.

| Seed, GP29 inverse sign | p55 (76 runes): surviving full-length states | p0 (262 runes): surviving states | p15 (159 runes): surviving states | pp54–55 continuous (308 runes): surviving states |
|---|---:|---:|---:|---:|
| Printed row, subtraction | **2** | 0 | 0 | 0 |
| Printed row, addition | 0 | 0 | 0 | 0 |
| Restored-sign row, subtraction | **3** | 0 | 0 | 0 |
| Restored-sign row, addition | 0 | **6** | 0 | 0 |
| Printed red-center spiral, subtraction | 0 | 0 | 0 | 0 |
| Printed red-center spiral, addition | **1** | 0 | **2** | 0 |
| Restored-sign spiral, subtraction | 0 | 0 | 0 | 0 |
| Restored-sign spiral, addition | 0 | 0 | 0 | 0 |

The **entire 308-rune source-natural terminal continuation admits zero valid output paths in all eight seed/sign variants**. Each fails structurally already within p54, the latest first contradiction at zero-based terminal rune **101**, even when every ciphertext F offers both legal possibilities. This is a genuine **no-solution** certificate for that exact operation on the complete original terminal two-page block, stronger than a prose score. P55 considered *independently* leaves six possible outputs across three variants, yet their highest GP29 collision IoC is **0.03649**, and their prefixes are uninterpretable. The nonterminal outputs for p0 and p15 likewise remain nonprose (GP29 IoC ≈0.035–0.036). The independently source-native solved p57 IoC is ≈0.06271.

Every surviving original path exactly re-encrypts its complete original input. All **32** corresponding source-native GP positive controls are independently encrypted and decrypt back to **every rune** of the authentic solved-p57 GP control prefix (76 or 95 runes, as available) with the correct original F clock. The test asserts original page lengths, p55 ciphertext F positions [15,25,41], 256-byte source SHA-256, exact polynomial divisibility of that table and every original/positive output.

## Research decision

**Retire this full source-p15-seeded, p50-F16-generated, p56-style F-transparent GP29 additive decipherment**, including both source-visible numeral orders, sign restorations and arithmetic directions, when applied continuously to original pp54–55. This removes a natural historical-F bypass escape from the earlier fixed-clock p15-F16 negative and gives a complete deterministic original contradiction with no heuristic language threshold.

The all-secret F16 recurrence with a *different unknown seed* and a variable F clock, a different p50 radix, a distinct state-emission function, or genuinely hidden instructions is outside the tested family; the known p56 cipher does not prove that unknown pages share its F handling. Retaining such families would require a new independent clue that fixes their added freedoms. This report does not establish an original author-selected key schedule and recovers **no new plaintext or destination**.
