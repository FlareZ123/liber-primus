# Rune-name-terminal feedback receiver: original inverse decision

**Decision (Agent50, 27 November 2026):** the fixed orthographic rune-name-terminal feedback composition does not decipher either tested original LP2 span. The literal plaintext-F-hold variants have exact language-independent contradictions; the ordinary-consuming variants have nonprose frozen continuations. No unknown plaintext or authentic key is recovered.

## Independent motivation and fixed scope

The Scandinavian jötunvillur interpretation was public by 5 February 2014 ([ScienceNordic](https://www.sciencenorway.no/archaeology-history-forskningno-language/mysterious-code-in-viking-runes-is-cracked/1396525); [Guardian, 12 February](https://www.theguardian.com/books/2014/feb/12/ancient-viking-code-deciphered-runologist-jotunvillur)): it substitutes the last sound in a rune's name. This is a period-available runic operation, independent of the original LP2 fit. The p0 branch-rune analogy and historical qualification are already recorded in [the twig-rune study](lp2-opening-3x3-yf-cipher-rune-literature-audit.md).

The literal historical substitution is lossy and uses Younger Futhark. Here the explicit **exploratory adaptation**, not an asserted historical cipher, uses the fixed Old English names in [the existing 29-stanza codebook report](lp2-old-english-rune-poem-codebook-selector.md). For each name take its longest final GP29 orthographic token. In GP order the resulting shift labels are:

`H R N S D N U N L D S R H H G L R C H N U NG L G C C R R R`

There are only ten distinct outputs; directly applying that map as a substitution cannot produce the observed complete 29-symbol inventory. To retain the original rune as an invertible operand, compose the map with the authentic LP1 additive idiom:
`C_i = (P_i + sign * tail(S_i)) mod 29`, updating state to either the just-consumed plaintext or ciphertext rune. Both signs, both state updates and ordinary/transparent plaintext-F clocks give eight frozen laws. Transparent F emits zero and leaves the cryptographic state unchanged; a consuming plaintext zero is forbidden in this variant. The initial state is unrestricted over all 29 runes. There is no added periodic pad, shift offset, alternative spelling sweep, or reset tuning.

This spelling-based GP29 extension and additive composition are investigator choices, not a documented jötunvillur rule or an independently authenticated Cicada instruction. Final spelling is not necessarily final phoneme. The experiment is deliberately narrow.

## Exact original decisions

Fit on the 249 black runes of p0, hold p1 (266); independently fit on the 213 complete black-body runes of p54, hold the untouched ten-rune carry prefix plus all 76 runes of p55 (86). The physical p54 boundary is the corrected canonical split. No printed-group constraints are used.

The reachability projection begins with every possible initial state and propagates all legal held/consuming choices. It yields the following first impossible ciphertext offsets (zero-based relative to the fitted span):

| Feedback state | Sign | p0 body | p54 body |
| --- | ---: | ---: | ---: |
| Plaintext | −1 | 23 | 19 |
| Plaintext | +1 | 61 | 117 |
| Ciphertext | −1 | 14 | 3 |
| Ciphertext | +1 | 10 | 11 |

These are exact no-path certificates for all 29 possible initial states under each fixed F-hold law, without a lexicon or language threshold. The JSON records each preceding reachable state set and impossible ciphertext rune.

For ordinary clocks, optimize the initial state by exact trigram Viterbi on the fit only and freeze the ending state and last two plaintext symbols. The language model is a smoothed GP-token trigram trained on 3,010 approximate GP tokens from the existing editor-normalized LP1 reference, excluding p56 and p57. The eight original ordinary fits score −3.5437 to −3.6121 nats/rune; their frozen continuations score −3.5101 to −3.6145. None is readable prose. Each selected fit and held continuation exactly re-encrypts, which is an implementation invariant rather than key evidence.

## Calibration and reproducibility

Two authentic native plaintext controls are obtained from the original solved p56 prime/F decryption (85 runes) and clear p57 (95). Plant the fixed candidate law with hidden initial states 7 and 18 respectively, fit their first 50 runes and freeze the resulting state on the remaining 35/45. Across eight laws and two controls, every candidate re-encrypts. All 45 p57 held runes recover in all eight laws; p56 held recovery is 35/35 in seven laws and 34/35 in the remaining law. Fit recovery ranges 41–50/50. Held native control scores lie between −2.7293 and −2.1385 nats/rune. The small controls demonstrate functionality, not broad population-level power or historical authenticity.

- [Standalone CommonJS SFT](../sims/lp2_rune_name_tail_feedback_sft.cjs): `node sims/lp2_rune_name_tail_feedback_sft.cjs`.
- [Full output, original candidate paths and no-path certificates](lp2-rune-name-tail-feedback-output.json).
- Original corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; the control reference blob is in the JSON.

The core and feasibility projection executed in connected V8; the saved Node wrapper has not independently run in Node or CI. No alternate name normalization, arbitrary secret tail map or different state law is excluded. The existing authoritative frontier does not change; do not expand this exploratory family absent an independent selector.
