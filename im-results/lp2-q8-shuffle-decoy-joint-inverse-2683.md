# #2683 — Hidden q8 key recovery with shuffled words versus decoy boundaries

**Decision:** calibrated constructive inverse succeeds on both generative controls, then abstains on original p33–39. No unknown plaintext or authenticated key. Both architectures of this **specific tested** q8 additive literal-F model have negative original outcomes; neither H-shuffle nor H-decoy is generally excluded.

## Frozen cipher and key inference

Native GP29 additive q8 cycle, phase zero at chapter start, plaintext F emitted literally as 0 without consuming the key. All other plaintext runes consume one key rune. This exactly replays genuine WELCOME (515 runes, q8) and KOAN2 (319 runes, q13; used only to validate the historical convention, then re-enciphered under a hidden q8 key for matched controls).

Training uses only first 80% of words from the bodies of Gibran, Shakespeare and Emerson (Gutenberg license text excluded), and other authentic solved sections, excluding WELCOME and KOAN2. Native encoder reproduces p57's 95 runes exactly. Body sizes 47,629 / 217,106 / 306,851 runes. Fixed 10,842-type lexicon, 114,802 tokens, 2,214 long anchors with >=9 consuming runes, maximum word length24; 5% normalized word-length/within-word trigram backoff allows OOV words.

Hidden key proposals are constructed from native long words scanned over **every** prefix start, with no boundary oracle. Every F must agree with a ciphertext zero; at least nine consuming symbols give a q8 repeated-key equation. Every additional consumed symbol must agree exactly. Canonical rotation classes are ranked by number of nonoverlapping support starts, maximum consuming length, training frequency; top256 classes, all eight rotations, exact latent-phase unigram marginal filter, top12 finite prefix scores. This is a finite key-proposal heuristic, **not exhaustive over 29^8 keys**. Independent known-key inference is exact inside each selected model and finite word-length cap.

Three objective functions on the same candidates:
- **H-shuffle:** printed groups assumed genuine words; native unconditional token probabilities marginalized through the continuous phase chain.
- **H-decoy:** semi-Markov sum over every feasible word segmentation (length1–24), every phase, every literal-F branch; printed groups unused except fixing the prefix split.
- **Spacing-free comparator:** exact continuous GP trigram forward and Viterbi over phase and last two plaintext runes.

Each key is chosen exclusively on first ~65% of ciphertext (last printed boundary no later than 65%). Prefix phase/history posterior is retained; holdout uses the frozen key. Viterbi plaintext is separately exact-replayed for prefix and holdout. For H-decoy the split may bisect a true word; no true boundary supplied. The architecture discriminator is the holdout difference per rune between free-segmentation and fixed-printed-boundary log likelihood under the same free-model key and prefix phase posterior. Both use unconditional word probabilities; the unrestricted sum includes the printed segmentation. This is a calibrated boundary evidence statistic, not a Bayes factor for complete manuscript origin models.

## Development and frozen gate

Authentic WELCOME recovered all 515 runes and the exact key. Matched re-enciphered KOAN2 shuffle/decoy and development Gibran pair recovered exact keys and 100% heldout runes in all three models. Earlier pilot used Gibran tail boilerplate; excluded from calibration and rerun with body-only training/control windows. Dev shuffle gaps 0.0050 (WELCOME), 0.0114 (KOAN), 0.0655 (Gibran); decoy gaps 3.0911 and 2.2782.

[Pre-original gate comment](https://github.com/FlareZ123/liber-primus/issues/2683#issuecomment-7151230351): all six fresh controls must recover exact key and >=95% heldout plaintext in the applicable model, heldout logP/rune >= -2.6; gap <.25 for shuffled or >1 for decoy, otherwise abstain; zero independent-pad null passes. The last fresh pair uses exactly the original 1,680-rune/378-group printed inventory, including true cross-page carries. Its shuffled words are sampled from a separate heldout native donor region by length before permutation; the decoy case is continuous native text with the same inventory independently permuted. Other matched pairs share the native word multiset and pad between the two models.

| Fresh case | Runes | Applicable key | Heldout accuracy | Applicable heldout logP/rune | Boundary gap | Applicable boundary F1 |
|---|---:|---|---:|---:|---:|---:|
| Shakespeare shuffle | 1678 | exact | 100% | -1.7865 | .0460 | 1.0000 |
| Shakespeare decoy | 1678 | exact | 100% | -1.7870 | 2.4169 | .9667 |
| Emerson shuffle | 1678 | exact | 100% | -1.8441 | .0676 | 1.0000 |
| Emerson decoy | 1678 | exact | 100% | -1.7943 | 2.4951 | .9754 |
| Actual inventory shuffle | 1680 | exact | 100% | -1.9387 | .1045 | 1.0000 |
| Actual inventory decoy | 1680 | exact | 100% | -1.7789 | 2.2469 | .9643 |

All six true canonical key classes rank1 by proposal and exact-start keys rank1 by unigram. All three models recover every heldout rune on all six fresh controls; the spacing-free baseline therefore already suffices for key recovery **conditional on these anchor proposals**. The new added capability is boundary discrimination and native segmentation: free-model decoy boundary F1 .964–.975, versus .199–.261 if forced to use the decoy printed groups. All three independent-pad controls produce zero repeated-anchor classes and no finite prefix path in the retained key pool, hence abstain. Gate passes, but small control counts and lexical proposal recall remain limits.

## Original p33–39: frozen failure

Canonical source body 1,680 runes, 378 groups; prefix 1,088, independent continuation592. Exactly 34,391 distinct canonical q8 anchor proposals, **zero** classes with two nonoverlapping support starts. None of the top256 classes × eight orientations admits a complete prefix under the exact ordinary literal-F unigram phase filter. Thus all three objectives abstain before a continuation key can be frozen. Original behaves like the three independent-pad controls at this proposal/filter gate. No original plaintext, no phase path, no key, no architecture classification. No original-dependent tuning.

This result retires the **specific finite anchor-proposal q8 architecture** for this chapter. It does not exclude an arbitrary q8 key outside the proposal pool, a key with no in-vocabulary nine-consuming-rune anchor in the fit prefix, different periods/clocks, or either boundary hypothesis under another cipher. It establishes a useful ciphertext-only constructive receiver whose positive control performance is genuine; it does not establish that LP2 uses it.

## Reproduce

[SFT](../sims/lp2_q8_shuffled_decoy_joint_inverse_sft.cjs), frozen gate commit `675f88858596b8b49f61cea010c7b4ea631e89de`; [body-only development](lp2-q8-shuffle-decoy-body-development.json), [fresh pairs 1–2](lp2-q8-shuffle-decoy-fresh1-2.json), [actual-inventory pair](lp2-q8-shuffle-decoy-fresh3-actual-inventory.json), [independent-pad nulls](lp2-q8-shuffle-decoy-independent-pad-nulls.json), [original](lp2-q8-shuffle-decoy-p33-39-original.json). Executed connected V8, no Actions claim. Run `node sims/lp2_q8_shuffled_decoy_joint_inverse_sft.cjs fresh1-shuffle fresh1-decoy fresh2-shuffle fresh2-decoy fresh3-shuffle fresh3-decoy null0 null1 null2`; only then `original`. Earlier raw pilot files remain historical development, not evidence for the final gate.
