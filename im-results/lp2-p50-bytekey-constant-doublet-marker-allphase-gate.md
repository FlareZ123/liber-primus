# Original p50 byte-key versus a constant plaintext doublet marker: exact all-phase obstruction

**Agent 28, 17 November 2026. Classification: bounded key-independent original-cipher negative.** This establishes no new LP2 plaintext, historical creator key, cipher or destination.

## Intended human solve path and its weakest assumption

Physical LP2 pp49–51 display a 32×8 table containing **256** printed two-character numerals. The original unsolved GP29 ciphertext pp0–55 has just **86** within-page equal-adjacent-rune positions among **12,901** comparisons. An independently measured source-phase-zero association places **33** of those 86 repeats under one of the **60** table entries whose literal first digit is zero; see the existing [clock and physical-line test](lp2-p50-zero-phase-blindholdout-wordboundaries.md). This makes a table-driven sparse marker channel worth an exact decoder check.

The finite hypothesis is deliberately generous about the unknown key. Let the published source rune at global offset `i` be `C_i`, its native GP29 plaintext be `P_i`, and `B_j` be the 256 original base60 table bytes. Suppose

`C_i = P_i + f(B_((i+s) mod 256)) (mod 29)`

for an **arbitrary stationary byte-to-GP29 key function** `f`, with **any unknown 256-position phase** `s`. The 161 observed table bytes may each choose any of 29 outputs; no additive/linear restrictions are imposed on `f`.

Now assume every original **adjacent-equal ciphertext pair** marks the same hidden plaintext rune `R`. Its identity is also arbitrary and entirely unknown. This is a plausible but **unauthenticated** interpretation of the conspicuously sparse repeat events; the actual p56 plaintext-F bypass is different and does not assert that repeats mean F. Under this hypothesis, each repeat position requires

`f(B_((i+s) mod 256)) = C_i - R (mod 29).`

Therefore **two original repeated-rune sites having the same selected table byte must have the same printed rune**. The unknown marker `R` cancels completely. A single counterexample disproves every possible choice of stationary `f` and `R` for that phase, with no English-language model, key guess, or unproved plaintext reconstruction.

## Exact original-source contradiction and full phase decision

Read the unchanged 12,956 GP29 runes from the canonical source, excluding the number-only physical page, and retain all original within-page comparisons. The conventional base60 byte table has SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

At the natural physical source clock `s=0`:

| Original repeated-site anchor | Manuscript-global rune | Physical page/local rune | Published GP29 value | Selected table position | Table byte |
| --- | ---: | --- | ---: | ---: | ---: |
| First | **653** | p2, local125 | **11 (J)** | 141 | **46** |
| Second | **909** | p3, local180 | **25 (AE)** | 141 | **46** |
| Independent same-byte repetition | **5261** | p21, local159 | **11 (J)** | 141 | **46** |

The first two sites demand `f(46)=11-R` and `f(46)=25-R`. Their difference is 14 modulo29, so **no secret value of `R` can satisfy both**. This certificate survives a completely arbitrary, noninjective, unknown lookup `f`. It also applies to any arbitrary 256-phase **position-specific** key function because both anchors occur at the same table position 141. A different common phase merely relabels their shared address.

To measure the stronger byte-value class, group all 86 genuine repeat events by their selected byte. For each group, choose the **best possible** unknown single output rune, and count unavoidable disagreements. That is an exact global optimum over all `29^161` stationary key functions for a fixed phase, computed in linear time using frequency maxima.

| Source-frozen interpretation | Distinct selector groups at repeats | Largest possible compatible events | Minimum forced violations |
| --- | ---: | ---: | ---: |
| 256-position codebook, any single shared phase | **66** | **68/86** | **18** |
| 161-byte-value codebook, original source phase0 | **59** | **62/86** | **24** |
| 161-byte-value codebook, best over all 256 phases | varies | **66/86** | **20** |

The exhaustive 256-phase results range from **20 to 32 unavoidable violations**. Original phase0 ranks **61st** by best achievable event fit; arbitrary phase tuning does not rescue even a secret general lookup. The source-phase-zero repeat *rate* association therefore does **not** imply a compatible **repeat-value** decoder of this particular kind. This is an actual distinction between a binary marker-position correlation and a reversible key: their invariants differ.

## End-to-end source-shaped positive control

The exact [read-only CommonJS source test](../sims/lp2_p50_bytekey_constant_doublet_marker_sft.cjs) independently constructs a complete 12,956-rune **synthetic** encrypted tape with the **same 55 page boundaries and exact same 86 repeated-site offsets** as the original. Choose a hidden arbitrary table-byte key `f(b)=(17b+5) mod29` and a hidden fixed marker `R=10`; force the observed repeat-site positions to encode `R`, and adjust other synthetic runes to prevent unintended repeat positions. The resulting synthetic tape has **86/86** repeat-site observations consistent with one byte function; the same inverse recovers the marker at all **86** exact sites. The full synthetic GP29 plaintext/encryption roundtrip matches **12,956/12,956** runes. The source test also locks the actual 256-byte SHA-256, all original counts, the two-site contradiction, the phase0/position/byte optima, and the full 256-phase negative.

The [manually dispatched Windows Node.js 22 original-source run 44099184736](https://github.com/FlareZ123/liber-primus/actions/runs/44099184736) **completed successfully** with the published unchanged SFT and all assertions, including the complete positive 12,956-rune reencryption control.

The positive plant is an implementation control, **not** recovered manuscript text or a historical cipher. The original contradiction is exact within the stated architecture; it does not require the synthetic control's particular hidden key values.

## Research decision

**Retire the full class of stationary 256-phase/byte-value additive GP29 masks when all 86 original ciphertext repeats are treated as one common plaintext marker.** There is no point optimizing an unknown byte lookup, another global table offset, or the marker's literal GP identity within this family.

A **predecessor-step encoder**, whose repeated ciphertext means a zero step rather than one fixed printed rune, is a mathematically different model; previous [all-secret cumulative-step gates](lp2-p50-step256-allsecret-inverse.md) already limit its English-bearing stationary versions. Also outside this result: nonstationary key evolution, per-chapter different functions, nonconstant plaintext marker values, hidden plaintext word-boundary changes, and a separate source-selected cipher rule. Do not infer that the unexplained original leading-zero repeat-rate association is a key: it survives as a conditional source observation, while this fully reversible proposed consumer fails.

**Outcome:** one new key-independent necessary-condition exclusion, with an untouched two-site source certificate and source-shaped inverse control. **No previously unknown Liber Primus page is decrypted.**
