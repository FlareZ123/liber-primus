# Plaintext-fed q29 primer: spacing-free joint F-hold inverse

## Model and method
For a consuming symbol, C=(P+head(K)) mod29, pop the head of the q=29 queue and append P. Plaintext F emits zero and does not consume. The historical F-hold mechanism is real; q29 is exploratory, nominated by the GP alphabet size, not an authenticated autokey instruction. Fixed periodic additive q29 failures do not apply because the key evolves.

For each latent hold mask, active phase j depends only on the independent initial primer digit j, through successive P=C−previous plaintext. Reject any initial digit producing a non-held zero. Enumerate all visible-F masks and exactly marginalize the remaining lane choices under a unigram model and independent uniform primer prior. Exact cyclic bigram MAP for up to 64 ranked masks; exact cyclic trigram MAP for up to 8 (all if <=3 visible Fs). All fitted keys are frozen before holdout; exact full-prefix state propagation then sums all legal latent histories with queue+last-two physical rune states, caps at 100,000 states (not reached). The forward replay assertion is applied to every fitted and every legal full continuation. Training only on three trimmed literary donors as in the q29 periodic report.

Initial control attempt mistakenly conditioned terminal plants on <=3 visible F; post-primer zeros are determined by the native plaintext and the recurrence, so that procedure was not generally feasible. Final test uses the first eligible native window and first seeded key (<=14 prefix visible F); all four selected first window and first draw. Terminal and opening are independently reproducible with the same random seed, not independent underlying source passages. Source sections held out from training.

## Results
| Target | Fit/holdout | Visible F in fit | True primer rank | Best fitting matches | Best withheld matches |
|---|---:|---:|---:|---:|---:|
| Native KOAN terminal shape |232/76|4|1|232/232|76/76|
| Native LOSS terminal shape |232/76|8|2|207/232|76/76|
| Native KOAN opening shape |262/467|5|1|262/262|467/467|
| Native LOSS opening shape |262/467|9|2|237/262|467/467|

The LOSS rank-2 true primer gives exact prefix and suffix in both shapes. Rank1 reaches the same later queue with early errors; the result does not establish unique primer recovery.

Original p54 fit232, p55 holdout76: all 8 latent masks receive exact primer optimization. Best score -890.8266151626179, all eight fitted keys lack full continuation; failed at 241,241,252,240,237,294,252,270. No all-primer impossibility theorem, only all-mask-optimum finalist failure.
Original p0 fit262, p1–2 holdout467: all 16,384 masks ranked at unigram stage, top64 bigram, top8 trigram. Best fit -1011.9946913589657; seven of eight frozen keys impossible at 381,558,386,406,406,384,459; best key admits exact replay but produces nonprose continuation at -8.263191987003246 nats/rune versus native opening -2.296316/-2.390546. Peak states252. No authentic key or plaintext. Retire this finite exploratory decoder, not arbitrary evolving-key mechanisms.

[Reproducer](../sims/lp2_q29_plaintext_autokey_fhold_joint_inverse_sft.cjs) · [Terminal output](lp2-q29-plaintext-autokey-fhold-terminal-output.json) · [Opening output](lp2-q29-plaintext-autokey-fhold-opening-output.json). Outputs are separate seeded calls using study(inputs,lib,"terminal"/"opening"); default both advances one seed across regions and thus changes opening plant keys. Executed exact pinned files via connected JavaScript. No independent Windows CI.
