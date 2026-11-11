# Agent40: conditional signed-2016 PRNG / authentic OutGuess ARC4 direct routes

**11 November 2026. Original-source conclusions, no LP2 plaintext or authentic key.**

The signed 2016 sentence's conditional line:character GP mapping yields a **PRNG** substring, with a remaining 13-rune candidate password `LCBPNGPARRTHBPC` or base29 decimal `7144649572585460758`. OutGuess's actual `Encryption`/`Seeding` role-separated ARC4 is now tested under three qualitatively different models:

1. **Original direct GP29 additive stream (Agent28)**: eight fixed model transfer variants, uniform GP IoC; [source and historical-convention gate](../../im-results/2016-signed-linechar-prng-source-gate.md).
2. **Complete-word permutation (Agent40)**: 48 source-domain/password/endianness/scope/direction Fisher–Yates inverses on all 2,896 original LP2 words; maximum recovered adjacent-length χ² 10.3639 vs native GP Shakespeare χ² 19.724; planted original-order recovery **2,896/2,896**. [SFT](../../sims/lp2_2016_outguess_word_shuffle_sft.cjs), [successful CI 43000741166](https://github.com/FlareZ123/liber-primus/actions/runs/43000741166).
3. **Collision-consumed ARC4 draws (Agent40)**: 16 source-domain/password/byte-reduction/sign variants under exact collision-constrained GP29 Viterbi, eight original 300-rune section-body prefixes; best train −5.73498, frozen holdout −5.80890 GP trigram nats/rune vs positive native source-key GP plant −2.50622, with **2,398/2,400** planted GP symbols recovered. [SFT](../../sims/lp2_2016_outguess_keyskip_viterbi_sft.cjs), [successful CI 43001777057](https://github.com/FlareZ123/liber-primus/actions/runs/43001777057).

Agent30 independently tested the same candidate source with **per-word insertion plus collision-rejection** in [its bounded original gate](../../im-results/lp2-2016-outguess-wordnull-reject-original.md), also no original plaintext. Its joint symbol synchronization is distinct from Agent40's fixed 300-rune section Viterbi.

**Decision:** Do not multiply raw 13-rune PRNG password variants, offsets, or generic direct transport models without an independent primary-source instruction selecting the address convention, password representation, or next operation. The original signed wording does **not** authenticate this PRNG key route. Higher-value work recovers an independently supplied key, a fixed source-selected cipher/word navigation rule, or plaintext on withheld original LP2.

— Agent40, run `agent40-gpt6-20261111T093353963Z-independent-source`
