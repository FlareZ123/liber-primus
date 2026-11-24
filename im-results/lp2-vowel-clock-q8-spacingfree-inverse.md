# Spacing-free q8 vowel-clock inverse: calibrated bounded negative (#2625)

## Model frozen

Use GP0 and phase q=0 initially. C=P+K[q] mod29 for P!=F; genuine plaintext F emits F and does not advance. After every plaintext vowel advance q by one mod8; all other plaintext symbols leave q unchanged. The vowel set is the literal intersection of the issue's enumerated labels A,E,I,O,U,Y,AE,EA,EO,IO with the canonical GP chart: indices [1,3,10,12,18,24,25,26,28] = U,O,I,EO,E,A,AE,Y,EA. IO is not a canonical label. IA and OE are not among the enumerated labels and were not added. No alternate class was tried. No first-party instruction establishes the law.

Original p54/p55 lengths 232/76; the cipher clock is continuous across the seam. Ignore all printed word boundaries. Nonzero ciphertext uniquely determines a non-F plaintext for a known phase/shift, unless it would decode to F (forbidden); zero can be literal F or an encrypted non-F. This is a finite state transducer.

## Necessary forced-equality screen

Equal adjacent non-F consonants in plaintext must yield equal adjacent ciphertext because phase does not change. Original p54–55 has 3 total adjacent equalities (2/1 at the seam), 6 visible F. On 96 evenly spaced 308-rune reference windows (same native tokenizer used below), 85 exceed 3 such plaintext equalities; 11 pass (2 Shakespeare, 6 Emerson, 3 Gibran). This does not decide the model.

## Blind inverse and gate

Train a spacing-free interpolated 1–5 gram model on the three independent native-prose corpora (Shakespeare, Emerson, Gibran). GP normalization QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA; longest chart token. Conditional lower-order smoothing strengths 29,8,12,16,24. For an unknown key, incremental beam states store assigned cyclic key prefix, phase, last four decoded runes, and cumulative log likelihood. First consumption in an unseen phase branches over 28 non-F plaintext possibilities and derives that key shift. Literal F does not assign a shift. Keep best score per identical state and top 30,000 states.

A preliminary single-anchor beam on solved plants recovered WELCOME but lost KOAN2 at rune 7; it was not applied to unknown text. To reduce early beam pruning, the revised fixed solver uses 104-rune windows beginning at offsets 0,32,64,96,128, entirely inside the 232-rune fit prefix. Each anchor returns up to 64 distinct complete cyclic key classes. Union them; try all eight rotations at original phase zero and exact known-key Viterbi over the fit prefix. Choose top prefix likelihood only. Freeze that key, last-four-rune context and phase at rune 232 before decoding the 76-rune continuation; no heldout rescoring or reselection. The inference never uses plaintext truth, known key, or printed words. Truth is used only for control diagnostics.

The revised solver was frozen, committed and run with controlsOnly before original scoring.

| Native solved plant | Hidden shifts | Keys found | Feasible rotated fits | Exact fit | Exact holdout | Fit log score |
|---|---|---:|---:|---:|---:|---:|
| WELCOME |4,17,9,23,1,25,8,12|313|241|232/232|76/76|-420.3918|
| KOAN2 |7,15,2,21,5,27,11,19|317|247|232/232|76/76|-422.4499|

Both true keys recovered exactly (phase-zero orientation), all plaintext recovered and forward replayed, without native donor words in inference. First plant runner-up -430.9780; second -422.9941. WELCOME true key found in four of five anchors, KOAN2 in three. These are constructed known-model controls, not evidence that the original used the model.

## Original fixed run

Only after the two exact controls passed, run the same committed function on original p54/p55. All five anchors returned 64 cyclic classes, union 320, and 21 rotated keys had legal full-prefix paths. Highest training score -1422.8057 (runner-up -1423.2947), approximately -6.133 per rune versus -1.81 per rune on the native controls. Selected phase-zero key [11,13,22,17,20,16,0,10] replays the 232-rune prefix, but produces non-prose:

PHIICNNGBYIOYNGUYPHCPIHECXOESBEOHAECSEOOIXHOEGYNGEPBOEXDJUXEEOCEAHDOELRPYYRHTJNGIABMIAXSYIAPSAPDYRXTWEATYYPBITHUYNJRPYYTHSAOPJOEDOETIAOETNGINJTXSJDTUIANMORALESJECTDAWEUGEOYEATLDGRAPESRNGEMTTHROBTHYBEOUPGNGNEAEOPNGOEPOIXDNGYORWODNGOETIJAEGUTEOAEOEHOEOGRYSJNGYYYLEATHOLGOGNGRHEOEAP

With the frozen prefix key and terminal state, **no legal path exists for the heldout p55 continuation**. No other candidate was chosen using p55. No coherent original plaintext, key, source selector, or independent original interval prediction.

## Reproduction and limits

`node sims/lp2_vowel_clock_q8_spacingfree_sft.cjs --controls-only` calibrates; omit flag to run the original after the control gate. Exact core function was committed in faca08d1077ab4bc7b0fc9b6dd2c9b0da3214beb before original scoring, then fetched and executed unmodified in connector JS runtime (blob 2b84e27dd8f8d8b881cf208ca572754ae863e9c3). Standalone Node wrapper was not separately executed.

This is a calibrated bounded search negative, not an exhaustive exclusion of all 29^8 keys or other vowel memberships. The p55 seam is an intra-run prospective check, not independent discovery-wide holdout (Critic warning acknowledged). Retire this particular exploratory clock under the current source evidence; no period/class/beam tuning after original scoring.
