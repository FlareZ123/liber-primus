# Native LP2 p56 prime/F transfer: nine source chapters and the first 5,000 starting primes

**15 November 2026, Agent5 initial phase-zero result and Agent12 full 5,000-start extension. No recovered unknown-page plaintext.** The authentic known LP2 p56 cipher is **consecutive-prime totient subtraction with a transparent plaintext-F skip**. A previous original nine-chapter punctuation transfer ([#1085](https://github.com/FlareZ123/liber-primus/issues/1085)) incorrectly advanced the prime key on literal plaintext F and checked only the pre-bypass six-rune prefix of p56; the Critic correctly challenged that positive calibration. This work tests the **real historical cipher** and checks its full original p56 solution, without language guesses or approximate statistical gates. Complete [single-file Node22 implementation](../sims/lp2_original_phi_Ftransparent_ninechapter_gate_sft.cjs) and [successful Windows source-original CI run 43705655838](https://github.com/FlareZ123/liber-primus/actions/runs/43705655838).

## Fixed original-source hypothesis

The original LP2 red-ink visual chapters start at pages **0, 3, 8, 15, 23, 27, 33, 40, 54** and end at **2, 7, 14, 22, 26, 32, 39, 53, 55**, respectively. Freeze a **separate prime-index-zero key start** at each chapter beginning; read source runes continuously across its physical pages and original punctuation. Inline tables (especially p50) do not advance or reset the rune key. These are the original illustrated chapter divisions, not inferred key resets; whether their ciphers share the later p56 key remains the hypothesis under test.

For authentic p56, the GP29 forward rule is:

- For plaintext rune **F**, numerical value **0**: output ciphertext F and **do not consume a key**.
- For every other plaintext rune value `P ≠ 0`: output `C=(P+(prime[k]-1)) mod29`; advance `k` by exactly one, beginning with first prime 2.

Thus on an observed ciphertext F, either a literal F/no-consumption transition or a key-consuming non-F inverse can be valid. For observed `C ≠ 0`, key consumption is mandatory and the inverse `P=(C-(prime[k]-1)) mod29` is **illegal when its output is F**. No amount of language-model scoring can restore an illegal state.

The SFT maintains **all reachable key-consumption counts** at each original ciphertext position. It branches exhaustively at every ciphertext F and removes only transitions forbidden by this original historical forward rule. Reaching an empty set is an exact impossibility for the entire key-start-zero hypothesis. There is no dictionary, word-spacing assumption, phase fitting, extra state, or guessed plaintext.

## Complete authentic p56 control

The untouched source p56 holds **85** GP29 ciphertext runes. The known plaintext begins **AN END WITHIN THE DEEP WEB** and ends **PILGRIM TO SEEC OUT THIS PAGE** (GP source spelling). It contains one genuine transparent plaintext F at zero-based source index **56**, so its correct key cursor consumes **84** symbols. The SFT independently converts the *complete* known 85-rune phrase to GP29, decodes the original with that known source-F mask, checks **85/85 exact plaintext**, and strictly reencrypts **85/85 original ciphertext runes** using the genuine F-transparent forward rule. The exhaustive key-clock reachability pass includes the historically true cursor 84 and returns five terminal states. This proves both the consuming/nonconsuming branches and source key are calibrated across the actual F event, unlike the earlier first-six check.

## Original unsolved chapters: exact first impossible position

All offsets are **zero-based**, counted from the fixed red-ink chapter start. Every failure lies in the **very first physical page** of its chapter. At the failure, **every previously viable F assignment** requires an illegal key-consuming plaintext F.

| Physical original chapter | Original GP29 runes | First impossible rune offset | Original ciphertext glyph | All prior key-consumed states |
|---|---:|---:|---|---|
| p0–2 | 729 | **235** | H | 231 |
| p3–7 | 1,145 | **22** | A | 22 |
| p8–14 | 1,729 | **30** | I | 30 |
| p15–22 | 1,903 | **10** | U | 10 |
| p23–26 | 1,021 | **0** | U | 0 |
| p27–32 | 1,433 | **95** | OE | 92 |
| p33–39 | 1,680 | **58** | N | 57 |
| p40–53 | 3,008 | **38** | B | 37 |
| p54–55 | 308 | **105** | M | 104 |

The p23–26 example is especially transparent: its first ciphertext rune is GP index1 (**U**), and the authentic initial `prime[0]-1=1`. Therefore the only attempted consuming inverse would be plaintext F (0), forbidden because that F would have been emitted as ciphertext F. Its chapter fails immediately, *before* any language assumption or possible skip ambiguity.

## New exact all-F-mask extension: first 5,000 prime starts (Agent12, 15 November)

The table above is the **historical s=0 key-start** result and remains unchanged. A separately frozen and executed extension tests **every initial prime-key index s=0..4,999** on each entire source-visible chapter, with precisely the same legitimate p56 cipher semantics. A prime-start offset is the only additional degree of freedom. No ciphertext runes, printed word breaks or chapter boundaries are modified. The source's numerals-only p50 contributes zero rune-clock positions; the clock advances exactly once per consuming non-F plaintext rune and never on a true F.

For each starting index, a dynamic program stores the complete set of reachable consumed-prime counts after each ciphertext rune. A consuming inverse that would yield plaintext F is forbidden, and on a ciphertext F the program branches exhaustively into a literal-F no-clock transition and a legal non-F consuming transition. States with equal consumed-key counts are future-equivalent, so the merge is exact. This is a language-independent and key-choice-independent necessary condition within the tested 5,000-start family. The complete known p56 solution reencrypts **85/85** original runes with its genuine transparent F at zero-based position 56. A separately planted 85-rune solved-p56 plaintext also reencrypts and survives the inverse when deliberately started at nonzero prime index **167**, confirming the new shifted-index implementation.

| Original chapter | Original source runes | Furthest rune reached at any of 5,000 starts | Complete legal prime starts |
|---|---:|---:|---|
| p0–2 | 729 | **674** | **none** |
| p3–7 | 1,145 | **498** | **none** |
| p8–14 | 1,729 | **524** | **none** |
| p15–22 | 1,903 | **559** | **none** |
| p23–26 | 1,021 | **553** | **none** |
| p27–32 | 1,433 | **642** | **none** |
| p33–39 | 1,680 | **594** | **none** |
| p40–53 | 3,008 | **648** | **none** |
| p54–55 | 308 | **308** | **167, 168, 3047, 4121, 4365, 4366** |

**The first eight entire chapters admit zero legal GP29 plaintext strings under the real p56 machine for all 5,000 tested source-key starts.** The shortest final p54–55 chapter has six source ciphertext-F sites. Exhaustively evaluating the complete **64 possible F-skip masks** at every surviving start yields only **eight** valid 308-rune strings, strictly forward-reencrypting the original:

| Prime start | Surviving skip masks, integer bitfield | IoC of the complete GP29 output |
|---:|---|---|
| 167 | 13, 14 | 0.0353653 / 0.0349211 |
| 168 | 15 | 0.0351115 |
| 3047 | 19, 51 | 0.0358941 / 0.0354710 |
| 4121 | 36 | 0.0350903 |
| 4365 | 62 | 0.0349423 |
| 4366 | 63 | 0.0338424 |

Every allowed output is near the 29-symbol uniform IoC **1/29≈0.034483**, far below the independently solved p57's original clear rune IoC **0.06270997**. Their GP-rune openings are printed in the source-exact SFT. The surviving p54 offsets are arithmetic continuations, **not recovered keys**; no original source selects one, and none produces an authenticated readable sentence. The first eight failures are exact independent of English. The final chapter's eight outputs are nonprose by coincidence statistics; the independent original printed-word gate below also excludes every surviving start as a credible direct English reading, conditional on those printed spaces being plaintext word boundaries.

**Reproduction:** [Single-file Node22 CommonJS SFT with strict source p56 and nonzero-start controls](../sims/lp2_p56_phi_ftransparent_5000start_sft.cjs), successful [manual Windows Actions run 43723399919](https://github.com/FlareZ123/liber-primus/actions/runs/43723399919). This is a distinct finite extension of the initial [phase-zero SFT](../sims/lp2_original_phi_Ftransparent_ninechapter_gate_sft.cjs); it does not depend on its failure positions being assumed or language fitting.

## Original p54 printed-word gate on all six surviving prime starts (16 November 2026, Agent 29)

The exact 5,000-start F-transparent analysis above leaves only six possible complete arithmetic inverses of the **308-rune p54–55 chapter**. Instead of tuning any further key, use a source-fixed constraint at its very start: original p54 (JPEG 71) prints the complete first two units `ᚪ-ᛗᛝᛞᛡᚦᛉᛁᛗ.`. The first is **one rune**, followed by a printed word separator; the second is **eight runes** ending at a period. Their original GP indices are `[24]` and `[19,21,23,27,2,14,10,19]`. None of these nine ciphertext positions is F, so all F-transparent skip-mask variants at the same start produce **identical** first-two-word plaintext candidates.

Using the original p56 consuming inverse `P[i] = C[i] − (prime[start+i]−1) mod29` with zero-based prime starts fixed by the preceding whole-chapter exhaustive gate:

| Entire p54–55 legal prime start | Actual starting prime | First complete source word | Second complete source word |
|---:|---:|---|---|
| 167 | 997 | `X` | `YALOETYTS` |
| 168 | 1009 | `TH` | `OEEEEOXLGP` |
| 3047 | 27941 | `J` | `RTHIADNGBEAR` |
| 4121 | 39157 | `E` | `NNOETEOXTHU` |
| 4365 | 41759 | `Y` | `MJWTEOLSE` |
| 4366 | 41761 | `A` | `NCEOHHMNT` |

Under the independently established **GP-native English** spelling and if the manuscript's printed separators are real plaintext word boundaries, an ordinary first one-letter word must be `A` or `I`. Only start **4366** passes that necessary condition, and its immediately following complete eight-rune word `NCEOHHMNT` is not an ordinary recognizable English GP word. Thus the entire source-fixed p54 original word opening provides **no credible direct English reading among any of the exact surviving prime-start candidates**, strengthening the earlier uniform-IoC observation without adding a search parameter. It is a language/word-boundary gate, **not an algebraic exclusion**: another language, nonlinguistic packet, state-encoding separators, or a separately authenticated additional transform would require a distinct test.

The [read-only Windows Node22 SFT](../sims/lp2_p54_phi_survivor_native_firstwords_sft.cjs) asserts the **printed punctuation and nine unchanged original runes**, independently rebuilds the prime list, computes all six complete word prefixes, and demonstrates a **solved original p56 `AN END` positive** at start0. It consumes the six starts already established by the exact whole-chapter gate; it does not re-run a 5,000-start sweep, fit word fragments, or claim recovered plaintext.

## Consolidated decision and limits

The authenticated native p56 cipher, including every possible source-ciphertext F ambiguity, **cannot** decrypt any of the nine original chapters with historical prime start zero. Allowing **all initial prime indices 0..4,999** still leaves the first eight chapters algebraically impossible; the short ninth has only eight arithmetically admissible non-English-like results. This replaces the earlier narrow assertion that only zero-start transfer was excluded.

The result does not exclude an independently source-selected starting index beyond 4,999, a different key sequence or cipher, a key clock restarted inside a chapter, a separately specified preprocessing operation, altered F conventions or genuine non-English plaintext. No such missing rule is supplied by this test. Given the failed 5,000-start family, further phase sweeps should require an original creator clue. Prioritize **authentic unknown-page keys, plaintext, or a new source-selected inverse operation** instead of rescanning unchanged p56 arithmetic.
