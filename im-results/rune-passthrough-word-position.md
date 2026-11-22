# LP2 single-rune passthrough: all 841 mappings, doublet-preserving null

**Agent 27, 10 November 2026. Conditional cryptanalytic constraint, not a decipherment.** [Executable model](../sims/rune_passthrough_word_position.cjs) · [Successful full GitHub Actions run 42756528410](https://github.com/FlareZ123/liber-primus/actions/runs/42756528410).

## Motivation and model

In established solved Liber Primus sections using DIVINITY, FIRFUMFERENFE and the prime-totient keystream, original GP F runes are left unencrypted. A direct plaintext rune that survives the subsequent encrypted stream should retain ordinary GP-English positional structure inside its words, even if the remaining ciphertext is flat. Original LP2 contains 458 ciphertext ᚠ among 12,956 runes (3.535%); total rune frequency alone does not identify surviving plaintext F.

Given GP-English reference words, define a length/position-conditioned log-odds model for each of the 29 possible plaintext rune labels:

\[
h_{L,i}(p)=\log\left(\frac{\Pr(P_i=p\mid |P|=L)}{1-\Pr(P_i=p\mid |P|=L)}\right).
\]

For each proposed ordered map (cipher c, plaintext p), sum these log-odds over all original ciphertext positions with rune c. Normalize analytically by its exact expectation and variance conditional on the number of c runes in each word. This searches **all 29 × 29 = 841** associations without knowing any pad, key or other substitution, and directly tests the prespecified literal F→F map.

Train the GP reference on the first **240,000 characters** of the repository's Shakespeare control, with 0.5 binary pseudocounts and exact rune-word-length conditioning. Evaluate **2,839 whole ciphertext words and 12,294 runes** of length at most ten. The remaining longest words are omitted because their source positional estimates are poorly sampled. Canonical whole-word segmentation preserves words that cross printed line and physical-page breaks.

Generate **500** seeded familywise null manuscripts by independently shuffling runes within each original word *while preserving the exact number of adjacent equal-rune pairs inside that word*. Each null also preserves every word's complete multiset, length and location. Score the best of all 841 mappings on each null; this properly corrects selecting the largest of 841 z values under this explicitly matched chance model. Standardized z uses the unrestricted positional conditional mean and variance, while the empirical randomization threshold includes the additional doublet-preserving constraint.

## Original unsolved LP2 result

| Measurement | Original | Matched null interpretation |
| --- | ---: | --- |
| Largest of 841 position scores: ciphertext index 10, putative source X | z = **3.6037** | Null 95th percentile **3.8073** |
| Null global maxima at least this large | **50 / 500** | Familywise p **51/501 = 0.10180** |
| Prespecified cipher ᚠ (index0) = source F (index0) | z = **0.43458** | Fixed-pair p **91/501 = 0.18164** |
| Largest matched null maximum | **5.1759** | An apparently stronger candidate emerges by chance |

No candidate is significant under the declared 841-hypothesis family and doublet-preserving null. The exact LP1-style F passthrough has no positive word-position signal in the original LP2 text.

## Powered blind positive with matched ciphertext-F frequency

Generate GP-English words from the independent withheld last **60,000 Shakespeare characters**, preserving the **exact LP2 rune-word length sequence**, with three exceptionally long words drawn from training text because that length does not occur in the heldout subset. Encrypt other symbols as random flat ciphertext, while preserving a plaintext F as ciphertext F with **60% probability** and mapping non-F input to ciphertext F with **2.35% probability**. The latter rate deliberately yields a ciphertext-F marginal comparable to LP2. On any adjacent ciphertext doublet, independently overwrite the newest rune with a different uniformly random rune with probability **81%**.

The deterministic planted control contains **228** plaintext F runes, of which **149** were selected for passthrough, **462** final ciphertext F runes (real LP2 **458**), and **352** immediate-doublet repairs across 12,956 runes.

The correct hidden F→F association is recovered as the **highest-ranked of all 841** candidates, with z **5.5218**, a fixed-pair null p **3/501 = 0.00599**, and 841-familywise p **13/501 = 0.02595**. The positive demonstrates that this deliberately strong passthrough channel remains detectable even after substantial randomization and a flat F marginal.

**Conditional conclusion:** ordinary GP-English text with direct F survival as strong as the planted mechanism does not explain the observed LP2 ciphertext. The actual manuscript might contain a far sparser passthrough, different plaintext register, inserted symbols, changed rune-word breaks, or a nonliteral map. The results do not prove any absolute exclusion, recover original plaintext, or identify a key. The best apparent original association index10→X is statistically compatible with chance.

## Reproduction and next action

Script: [sims/rune_passthrough_word_position.cjs](../sims/rune_passthrough_word_position.cjs), Node.js 22/CommonJS. On-demand workflow [rotor-phase-manual.yml](../.github/workflows/rotor-phase-manual.yml), [verified run](https://github.com/FlareZ123/liber-primus/actions/runs/42756528410). The program preserves source SHA256, asserts the actual total rune count, reports all competing associations and includes the seeded, hidden-passthrough English control. Null seeds: original 0x270a8219, plant 0x270ace09; source plant 0xa11ce279; 500 replicates each.

For a future proposed key or partial decryption with a specific retained plaintext symbol, this test can quickly check its independently predicted physical word positions. A valid positive would require a fully re-encryptable passage on actual unsolved runes.
