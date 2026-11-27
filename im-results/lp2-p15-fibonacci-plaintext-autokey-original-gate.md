# P15 Fibonacci plaintext-autokey: exact linear collapse and nonlinear prime-weight feedback limits

**Agent1, 23 November 2026. Decision on [Director #2374](https://github.com/FlareZ123/liber-primus/issues/2374): retire the specified page-continuous, additive Fibonacci-plaintext-feedback cipher as a route to native-GP plaintext on original pp16–55.** The result is a complete algebraic characterization of **all 29² possible IV pairs**, independent of language optimization, followed by an untouched-original full-length inverse, a frozen pp16–21 selector and pp40–53 holdout, and three independently sourced native-GP positive plants. It recovers no unknown plaintext, authored key, or destination.

**Current combined frontier (27 November):** the linear plaintext-index feedback below collapses to a cipher-only accumulator. A distinct nonlinear prime-weight feedback law also fails exact all-state F-hold reachability and synchronizes to a forced nonprose no-hold continuation (see final section). Neither is a live original cipher candidate.

## Source-frozen human route

Original LP2 **scan 32.jpg / physical page15** has the single red center **3299**, next clockwise neighbor **3298**, and all sixteen printed 4×4 values. The established exact operation is `|3301 − prime(distinctFibonacci[n]+1)|` along the visibly oriented outward spiral; the [source-certified reconstruction](../results/lp2-p15-fibonacci-prime-spiral.md) explains why the formula is authentic to the grid. The original numeric matrix is

```text
3258  3222  3152  3038
3278  3299  3298  2838
3288  3294  3296  2472
4516  1206   708  1820
```

A plausible solver might see the Fibonacci spiral as **an evolving cipher-state clue** for the adjacent p16 onward unknown runes. The actual equation below is a newly proposed finite hypothesis. **No first-party LP2 clue explicitly says that p15's grid seeds a plaintext-feedback additive GP29 cipher.** The independent rival is a self-contained prime/Fibonacci page with an unrelated unknown-page cipher, possibly requiring now-unavailable external key material.

Freeze one formula and the red-to-right seed orientation:
`K₀=3299 mod29=22, K₁=3298 mod29=21`;
`Cᵢ=(Pᵢ+Kᵢ) mod29`;
`Kᵢ₊₂=(Kᵢ+Kᵢ₊₁+Pᵢ) mod29`.
The script also checks every other **29×29 possible** initial pair under **this same formula**, without changing GP alphabet, coefficient, cipher sign, page resets, word breaks, or language scoring.

The original receiver is all **9,194** unchanged runes on the **39 rune-bearing physical pages p16–55**, crossing actual page and word seams without restarting the key. P50 is a rune-free numeric page; the compact textual transcription omits its empty page segment, while the canonical corpus retains its physical page ID. The SFT checks the source-original rune values of each retained page against the original full transcription and retains the exact page geometry.

## Exact algebra: only 29 meaningful full-stream keys, not 841

Eliminate the plaintext directly:

```text
K[i+2] = K[i] + K[i+1] + P[i]
       = K[i+1] + C[i]             (mod 29)

K[i] = K[1] + Σ C[j]               (mod 29), i >= 2, j=0..i-2

P[0] = C[0] − K[0]                 (mod 29)
P[i] = C[i] − K[1] − Σ C[j]        (mod 29), i >= 1, j=0..i-2
```

Thus the **first IV rune K₀ affects exactly one plaintext rune**, and changing **K₁** simply relabels **all remaining 9,193 plaintext runes by a uniform Caesar shift**. Every nominal 841-IV search is just 29 long-stream candidates, with 29 independent first-glyph choices. The original p16–55 ciphertext itself fixes every other key difference. All 841 source-original first150-rune inverses were explicitly compared with this closed form and exact forward-reencrypted; four independent seed pairs were fully inversed/reencrypted on all 9,194 original runes.

**This also proves an identifiability limit on the Director's 500+-rune suffix:** no amount of plaintext **after rune0** contains information about K₀. A *first-rune language prior*, such as a full source-native first-word dictionary check against the preserved original word shapes, can still distinguish K₀; the long-run recurrence alone cannot. K₁ *is* independently and blindly recoverable from genuine GP-native text. [Agent37's independently completed exact-original-word-geometry SFT](lp2-p15-fibonacci-plain-autokey-original-gate.md) subsequently used a different frozen English lexicon and proved **3/3 blind exact-IV-pair recovery** with authentic first-word geometry and **9,194/9,194 original-layout plant recovery**. That is the stronger, authoritative whole-word validation. The present report is a distinct auxiliary Shakespeare-trigram/Gibran-Emerson-LP1 audit and should not be read as contradicting the stronger first-word test.

## Original source and frozen independent-language decision

The original residual after rune0 is completely fixed before any score is applied. Its **GP29 index of coincidence is unchanged by all 29 candidates for K₁**:

| Unmodified original receiver | Rune count | GP29 IoC, identical across K₁ |
| --- | ---: | ---: |
| All p16–55 after the one independent first rune | **9,193** | **0.03445994261** |
| Selection-only pp16–21, excluding only first rune | **1,612** | **0.03468631447** |
| Unused pp40–53 holdout, with intervening ciphertext state carried | **3,008** | **0.03453400399** |
| Terminal p54–55, state continuous since p16 | **308** | **0.03564025551** |

The positive controls below have native GP29 IoCs **0.06001–0.06301**, compared with the nearly uniform original residual. This is a **source-locked, all-secret necessary frequency distinction** for the stated cipher family: no arbitrary IV values, chosen source center, or 29-way search can turn the original residual into the ordinary unbalanced rune occupancy of the native-GP controls. It is not a universal theorem against deliberately frequency-flat non-English plaintext.

A single trigram likelihood model was frozen from **Shakespeare source-native GP** before original-IV selection. Selecting on original pp16–21 gives **K₁=3**, differing from source seed21, with training mean trigram log-score **−4.26118625**. Without any retuning it predicts pp40–53 with score **−4.31837767**. The original candidate starts

```text
AE L O I G Y G OE R U OE TH X TH G X X M T R T E J NG I TH EO W L EO EA TH O N E AE H O D OE A OE
```

and the independent pp40–53 holdout starts

```text
NG M F IA B H R OE P D F EA AE O J O M X U NG NG EO IA O X TH W IA T T N Y N J L L A EO A EO EO I
```

Neither is sustained native GP prose. The **actual p15 seed (22,21)** was also inverted/reencrypted on the full original stream and produces similarly nonprose output, beginning `AE TH X NG B H B R S EO R P AE P B AE AE U IA S IA F OE O NG P D E TH`. A complete proposed 9,194-rune output is deterministically reproducible from the unchanged corpus and the stated two seed numbers; no private guessed words or omitted page changes are involved.

## Blind native-GP positives using the identical model

Independently convert the public **Gibran**, **Emerson** and **authenticated solved LP1** sources to canonical 29-rune GP tokens. Use source-original page lengths and contiguous key-state clocks to plant a separate 9,194-rune ciphertext book under the same equation. The donors are independent of Shakespeare training; semantic donor word breaks are retained only in the donor, while ciphertext glyph positions and page seams follow the original LP2 layout. Exact *source-native word-length matching* is not asserted.

| Source-native plant | Known generating (K₀,K₁), hidden from IV scorer | Blindly selected K₁ | Correct recovered consecutive runes **from position1** | Native GP IoC |
| --- | --- | ---: | ---: | ---: |
| Gibran, 62,696 GP donor runes | **(22,21)** | **21** | **9,193/9,193** | 0.06038293317 |
| Emerson, 323,083 GP donor runes | **(6,14)** | **14** | **9,193/9,193** | 0.06300850242 |
| Source-authentic clear LP1, 1,001 GP runes cycled | **(13,27)** | **27** | **9,193/9,193** | 0.06001302501 |

All three generated ciphertexts exactly inverse to the **full 9,194-rune native plant** when the true initial pair is supplied. The independent Shakespeare trigram model blindly recovers the genuinely identifiable second seed **3/3**, yielding exact 9,193-rune heldout GP plaintext for each. The initial glyph's K₀ remains mathematically underidentified by the later text and was supplied only to test round trips; this is deliberately disclosed rather than claiming blind two-seed recovery. The first500-runic native-window requirement is surpassed by each 9,193-position positive.

## Decision and reproducibility

**Reject this exact equation with page-continuous GP29 state for ordinary native-GP pp16–55.** A narrower regression suite with a different Shakespeare language model is useful as an independent control, while the [Agent37 all-word-geometry source report](lp2-p15-fibonacci-plain-autokey-original-gate.md) is the lead study of this exact hypothesis and is integrated into the [overall authoritative synthesis](../results/README.md).  The collapse is an algebraic fact independent of original language; the original near-uniform residual and poor unseen-window scores remain fixed across all source-selected or unconstrained IV values. The same scorer recovers all three independently sourced native-GP plant shift-keys and their complete 9,193-rune content. The source p15 Fibonacci prime spiral remains a genuinely solved 16-cell mathematical instruction whose transfer to LP2 plaintext is unproven. This result does not exclude a different recurrence, a non-native GP plaintext encoding, the opposite additive sign, actual external keystream material, or space-altering operations. There is no reason to rescue the failed exact recurrence with unmotivated extra feedback coefficients or page resets.

The complete original-cipher, source-grid, all-key and native-positive single runnable test is [**`sims/lp2_p15_fibonacci_plaintext_autokey_original_sft.cjs`**](../sims/lp2_p15_fibonacci_plaintext_autokey_original_sft.cjs), **[Windows Node22 CI PASS 45121682463](https://github.com/FlareZ123/liber-primus/actions/runs/45121682463)**. It reads original JPEG `32.jpg`, recreates all sixteen p15 numbers, cross-checks each original p16–55 GP rune against the original transcription, enforces every page length and true p50 physical gap, tests all 841 IVs' implied inverse collapse and complete replay, then runs the locked Shakespeare model and three independent native-GP ciphertext plants. No claimed unknown plaintext is generated.

## Nonlinear prime-weight feedback, exact F-hold obstruction and self-synchronization (Agent29)

**Decision:** the distinct nonlinear Fibonacci update below is excluded as a continuous p15-infinity decoder with the historical F-hold rule, for **every** 29² starting state. Its no-hold counterpart has one forced common 7,898-rune suffix, with no native-prose evidence. This does not alter the solved numeric spiral or the linear-feedback conclusions above.

The original p15 source gives the red 3299, adjacent black 3298, Fibonacci-indexed primes and visible infinity glyph. The known Gematria alphabet supplies prime values (q(p)); solved p56 supplies the prime-minus-one arithmetic and literal-F convention. Combining these into this specific recurrence is an exploratory interpretation, not a first-party command. Fix the actual infinity boundary, after the nine upper-heading runes, rather than choose a clock by decoding score. The original p15 tail through p22 is 1,894 runes. No coefficient, sign, alphabet, reset, or phase is fitted.

```text
initial (a,b) = (3299 mod 29, 3298 mod 29) = (22,21)
if P == 0 (literal F): emit 0, hold both states
else: emit C = P + a mod 29
      (a,b) <- (b, a+b+q(P)-1 mod 29)
```

For each observed C and current state, the consuming plaintext is exactly (p=(C-a)\bmod29), allowed only if nonzero. A hold edge exists precisely when C=0, with state unchanged. Maintaining the set of reachable state pairs gives the exact union of all legal hidden-F masks; this does not use dictionary, grammar, language distribution or printed word order. The GP29 prime-minus-one vector is `[1,2,4,6,10,12,16,18,22,28,1,7,11,13,17,23,0,2,8,12,14,20,24,1,9,13,15,19,21]`.

| Starting-state domain | First impossible original offset (zero-based from infinity) | Last state (a,b) | Observed C |
|---|---:|---|---:|
| Source (22,21) | 139 | (20,25) | 20 |
| All 841 states | 349 | (10,9) | 10 |

In both cases the sole surviving state requires a forbidden consuming plaintext F on a nonzero ciphertext glyph. The exact original impossibility needs no language assumption. On nine synthetic re-encryptions of the existing solved-native comparator sections (lengths 85–780; distinct fixed planted states), the true state survives **every** position under the F-hold graph. These are implementation controls with known planted states, not independent original-LP2 keys.

### No-hold diagnostic: all starting states synchronize

For the separately defined no-hold variant, every input rune consumes. At fixed C the update is

```text
T_C(a,b) = (b, b+C+[q(C-a)-1-(C-a)]) mod 29.
```

The bracketed function of plaintext takes only 20 distinct residues. Therefore each one-step image contains exactly 29×20=580 states for all C. Set propagation on the actual 9,344-rune p15-infinity→p55 register gives an exact singleton after consuming offset **1445**, on physical p20, state index 733 = (25,8). Thus every possible seed produces identical subsequent **7,898** plaintext runes, independent of scoring or key selection. Their IoC is **0.03457842718**. The p40–53 continuation (3,008 runes, same carried state) has IoC **0.03452383269** and begins `OE Y C X Y X NG W EA IA J E M W OE O B N J EO T H I U NG H X L G EO`. This is nonprose, with the fixed known-native comparator IoCs 0.05251–0.07003. No manuscript-level fresh holdout is claimed: this continuation has been examined by prior agents and is evaluated here only under the frozen new equation.

As a secondary check, exhaust all 841 no-hold states on the 1,894-rune first interval. The maximum IoC is 0.03475874826; best add-one conditional GP29 trigram score trained on the nine solved-native records is −3.4000272782 nats/rune. Leave-one-record-out planted controls select the exact seed in 5/9, recover 2,972/2,979 plaintext runes (the four different seed selections lose only 1,2,2,2 leading/near-leading runes), and achieve −2.61 to −3.052 nats/rune. These imperfect seed recoveries are consistent with the proven many-to-one state update, rather than evidence of blind historical-key recovery. The source seed and best scored original candidate replay exactly; reencryption is an invariant of the no-hold model, not authentication.

**Stop this recurrence.** The F-held rule has no legal inverse at any starting state and the no-hold rule forces a frequency-flat continuation. Neither yields authentic plaintext or a key. An independently sourced nonlinear opcode or new key evidence would be required before any successor feedback search.

Reproduce: [standalone CJS SFT](../sims/lp2_p15_prime_weight_fibonacci_feedback_sft.cjs). Inputs: canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, solved-native comparator blob `1b064ef6d85819b7d96adaff31a82d1ec551598f`. Core reachability, controls, all-seed scoring and synchronization were executed in connected V8; standalone Node wrapper not separately executed. Earlier solved-text comparators contain the known two-extra-rune KOAN I transcription variant; it is used solely for a planted algorithm control and not as original image evidence.
