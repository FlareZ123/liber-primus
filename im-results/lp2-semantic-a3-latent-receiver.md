# Latent-boundary semantic A3 receiver

Agent 6, 26 November 2026. **No authenticated unknown plaintext or key.** This is a constructive, calibrated negative for the pinned R38/R39 semantic-index key family, not a proof against every possible semantic operation.

## Motivation and exact model

Dukotah Round47 L2 found that the original semantic A3 receiver loses its measured recovery power when printed word lengths are displaced (b-prime). Do not treat its fixed-boundary results as exclusion of a hidden true segmentation. Here the decoder never receives printed lengths, and infers both the true word divisions and collision-only key skips.

The exact pinned R38/R39 lookup vectors are preserved in [the derived source fixture](../resources/derived/dukotah-r38-r39-lp1-semantic-keys.json). Source commit `fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb`; R38 lookup blob `fac550da1f263fbd051241ae527eb408112419c4`, R39 `164e66f63cf5ff13c32ee23afb2d4d1cc30b325f`. The previously preserved LP1 map tape is [here](../resources/derived/dukotah-r37-lp1-map-runes.json), blob `0fb8fcaaf793628e0e76c6b17e9643170bbb9508`. There are nine index variants, each with 726 possible starts and two signs; the tape has 2,916 runes.

For true word k, d[k] = VAL[(s+k) mod726]; J[k] = signed cumulative d through the start of that word. At nominal key position j, the shifted key is K0[(j+J[k(j)]) mod2916]. Encrypt P[i] by addition mod29 at key cursor j. A candidate equal to preceding emitted ciphertext may be rejected (weight .83); advance cursor once and retry the same plaintext rune. On emission, advance cursor once. Noncolliding candidates cannot be rejected. A collision emission has weight .17. Clock reset at physical page start (C0). Printed separators ignored.

A latent-boundary beam stores output position, consumed cursor, current word index, already selected future word endpoints, incomplete plaintext word and lexical score. Selecting future endpoints is necessary because skipped keys can put the nominal cursor ahead of the output. Prefix scores use a 35,938-form native/English vocabulary, with OOV penalties. Cap true word length24, cursor drift16, five skips per rune. Refined width500. Every returned path is replayed against all emitted glyphs and every claimed rejected candidate. This is a finite approximate search and can drop valid paths.

## Executed results

Three independent known-selector native plants of 80 runes each (held literary excerpts from Gibran, Shakespeare, Emerson) recover 240/240 runes, all boundaries (F1=1 each), and exact skip counts 1, 2, 6. Scores −1.67254, −2.06699, −1.81560 nats/rune. Raw output [here](lp2-semantic-a3-latent-receiver-output.json).

With origin fixed to zero, all 18 original p0 variant/sign combinations were searched at width500 through 80 runes. Best B-D29, sign−1, −5.22368; all nonprose. Freeze that configuration and reset it at each p1–5: −5.59989, −5.21849, −5.62714, −5.51838, −5.49778. Every path replays; no coherent reading. These are computational continuation tests, not independent source authentication or a globally untouched holdout.

## All-offset p0 extension

Screen all 13,068 variant/sign/start triples at first24 runes, width24. A separate unknown-offset control (Shakespeare, held donor offset123, B-R28, s371, sign−1, seed 0x6113002) ranks third overall, first in its variant/sign group; score −3.813375, with two L variants at −3.708779. Refine 16 leading competitors through 80 runes, width500: true key ranks first at −1.949438, 80/80 runes and F1=1, with all emitted and rejected candidates replayed. Best wrong key −4.903154. This is one independent blind all-offset calibration, not a claim of universal search power.

Original p0: screen all 13,068. Best first24 B-R28, sign+1, s240, −4.944285. Refine the five best starts per variant/sign (90 configurations) through 80 runes at width500. Best L-R28, sign+1, s470, −5.012887; second D-R29, sign−1, s199, −5.018023; third A-D29, sign+1, s461, −5.032661. All nonprose and all replay. The best text is `FLSFUUPAYPTHXYWANOEATHMAEOEEANG FLPDYGDACEAL LY WAR UCYJEAAEAOE IAXOBNEAY IBN GRM YEA EGLAWXT MY NOEOEBIATHHOE`, not an authenticated decoding.

This closes only the practical specified approximate p0 receiver (all starts short screened, 90 longer refined), not all paths, every page-specific start, other word maps, other signs/clocks outside the source model, or all decoy-segmentation models. Origin-zero extension is separate from all-offset p0. No reason for further arbitrary semantic-index sweeps absent an independent source selector. 

## Reproduction

`node sims/lp2_semantic_a3_latent_receiver_sft.cjs` runs original origin-zero controls and continuations. `node sims/lp2_semantic_a3_offset_search_sft.cjs` reproduces the staged all-offset experiment. Connected V8 cores executed separately in variant/sign batches; standalone Node wrappers not independently run. The all-offset wrapper uses the same receiver and source fixtures. No CI was dispatched.
