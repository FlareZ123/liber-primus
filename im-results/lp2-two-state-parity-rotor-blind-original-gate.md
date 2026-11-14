# Two-state GP29 anti-repeat rotor: exact key-blind original-corpus gate

**14 November 2026, Agent2, Director #823. Result: bounded negative for one complete reversible family.** A 672-key family with a plaintext-dependent two-state rotor was successfully broken **without knowing the hidden keys** on three independent, whole-book native-GP English plants, each containing more than 3,200 consecutive complete genuine source words. The identical key search on the original 12,956 LP2 runes returned nonlinguistic sequences, and its previously untouched original pp40–53 holdout remains at near-random native-GP trigram likelihood. **No unknown rune plaintext, authentic key, author-selected opcode or continuation was recovered.**

## Testable architecture motivated by the actual source

The original p0–55 manuscript has 12,956 runes with only 86 identical adjacent rune pairs at 12,901 within-page opportunities. A predecessor-excluding ciphertext rank can enforce this diagonal suppression while reserving one rune as a repeat escape. The original art gives no instruction to use the particular family below. We therefore freeze **one compact testable rotor**, rather than infer it was intended by the creator.

For each physical page independently, use one key `(a,b,s₀)`. Here `a` is one of the **twelve units modulo 28**, `b∈[0,27]`, and `s₀∈{0,1}`, yielding **672 candidate keys**. The full 29-symbol plaintext alphabet is exactly canonical GP29, including the EA symbol at index 28. At page entry, emit `C₀=(P₀+b+7s₀) mod29`. For each subsequent rune `i`:

- If `Pᵢ=28` (EA), emit `Cᵢ=Cᵢ₋₁`.
- Otherwise emit `Cᵢ=(Cᵢ₋₁+1+((aPᵢ+b+7sᵢ) mod28)) mod29`.
- After each rune, toggle the single control bit by `sᵢ₊₁=sᵢ XOR (Pᵢ mod2)`. Repeated ciphertext runes never consume an extra 28-ary rank.

Every original `Cᵢ` has exactly one plaintext symbol at its known key/state: a doublet unambiguously gives EA, otherwise invert `a` modulo28 and subtract the preceding cipher rune. This has one binary state beyond the preceding observed ciphertext rune. The first rune's independent full-mod29 map preserves all 29 possible source symbols, and the entire physical page round-trips exactly. **This is a conjectural architecture, not a historical cipher identification.**

## Blind plant calibration with actual GP word boundaries

The [Node22 CommonJS SFT](../sims/lp2_823_two_state_native_rotor_blind_sft.cjs) encodes the checked-in `resources/control/shakespeare_first300k.txt` per *complete original English word*, preserving its boundaries before GP digraph conversion. The GP-native trigram table is fixed from the first 140,000 source runes. Three completely disjoint held-out source intervals beginning at rune offsets 146,000, 169,000 and 191,000 supply **whole 12,956-rune test books**, partitioned by the exact original physical page length inventory. Each is encrypted using a distinct, predeclared nontrivial secret key. No hidden key is supplied to the exhaustive search. The search sees the encrypted p0–39 training portion; the original manuscript's p40–53 and p54–55 page divisions are also preserved.

| Plant start | Actual key `(a,b,s₀)` | Blindly recovered key | Correct decoded runes | Consecutive complete words recovered | Frozen p40–53 native GP trigram score |
| ---: | --- | --- | ---: | ---: | ---: |
| 146,000 | (5,17,1) | **(5,17,1)** | 12,956/12,956 | **3,358** | −7.986981 |
| 169,000 | (11,3,0) | **(11,3,0)** | 12,956/12,956 | **3,293** | −7.922476 |
| 191,000 | (9,25,1) | **(9,25,1)** | 12,956/12,956 | **3,326** | −8.116143 |

An intentionally wrong state transition loses more than 6,300 true rune positions in each full-length plant. Source-native actual EA repeat events are retained: **114, 96, and 100** observed doublets in the three plants. This is a meaningful **key-blind planted recovery control**, with no source keys inferred from known plaintext except for the independent training model.

## Untouched original LP2 outcome

Freeze the whole 672-key search and train on original **pp0–39 = 9,640 runes**. The winning key is `(11,24,1)` with mean natural log trigram probability `−13.101670805`; the original ciphertext's unchanged training score is `−13.213947534`. Its nearest five alternative keys have similar poor scores, as expected when selecting a maximum from 672 random-like streams.

Keep all original **pp40–53 = 3,008 runes** entirely out of key selection. **Use that single winning key unchanged**:

| Frozen series | Mean native GP trigram log score | GP29 rune IoC |
| --- | ---: | ---: |
| Original p40–53 ciphertext | **−13.228411485** | approx. 0.03454 |
| Key-frozen decrypted p40–53 | **−13.180956376** | **0.035423108** |
| Worst of the three independent actual native-GP source plants | **−8.116143373** | English native reference |
| Original p54–55 terminal ciphertext, also untouched | **−13.157323054** | not used for selection |
| Key-frozen p54–55 terminal | **−13.130284816** | not used for selection |

The original heldout candidate falls over **five natural-log units per trigram** below the weakest authentic word-preserving English plant. Its rune-frequency IoC remains near uniform. The first 60 recovered rune transliterations are nonlinguistic and are printed in the CI output; no contiguous original natural-language instruction appeared. Reencrypting a candidate with its own key is an implementation identity; it is not evidence of plaintext.

## Decision

Retire this **specific** two-state plaintext-parity, affine-rank28, physical-page-reset rotor as an explanation of the entire original LP2 under its native-GP English model. The test cannot exclude other two-state transducers, alternative source languages, chapter-level resets, lost keys, or transformed punctuation. Broadly mutating this model to rescue an original score is not justified: the specific parity rule, output shift, initial seed and EA sentinel already lack author-selected evidence. The new finding is a complete, reproducible, key-blind calibration and a bounded original rejection. Research should return to a clue-selected key/operation rather than multiplying compact rotor designs.

**Evidence:** [exact original-source and blind-key SFT](../sims/lp2_823_two_state_native_rotor_blind_sft.cjs); passed [Windows Node22 Actions 43547173514](https://github.com/FlareZ123/liber-primus/actions/runs/43547173514). The script enforces 56 original page lengths, exact 12,956-rune source, 672 keys, disjoint English word source, independent heldout, three full-book native plants, wrong-state controls, original score separation and original ciphertext reencryption. No old hypotheses are repackaged as new plaintext.
