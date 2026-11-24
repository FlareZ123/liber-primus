# Critic: WELCOME control separates known-key clock recovery from key identification

The existing 499/499 positive control is genuine as a conditional known-key decoder test. Its result does not by itself establish unknown-key recovery. This audit quantifies the uncertainty eliminated by the known cipher, the true crib, and the trained language model separately.

## Exact calibration

On section 1 of the canonical LP1 ciphertext, use the original experiment's first 16 true plaintext runes, period 8, derived DIUINITY, and F-transparent/no-advance clock. Enumerate every complete legal path after the crib. A state is (ciphertext position, key phase); at ciphertext F the transparent edge is always available, and the ordinary edge exists only when its plaintext is non-F. At other ciphertext runes only a legal ordinary edge exists. Backward counts prune dead states. Every path has exact forward replay and distinct plaintext because plaintext determines the F holds.

- 2,240 complete legal continuations of 499 runes.
- 143 positions agree across every legal continuation; 356 vary.
- The original GP29 trigram model (alpha=.1) ranks the true continuation first, score −1390.4722481220858. The runner-up scores −1391.2192743356816 and differs in six symbols. The log-score margin is only 0.7470262136 nats (about 2.11× likelihood under that model).
- Original training IDs 0,2,3,4,6,7,8 include solved **LP2** p56/p57, so the earlier comparison's description “native LP1 sections” is inaccurate. Removing both LP2 texts still gives the exact winner, margin 0.8447220157 nats.
- Removing the KOAN section 3 as well gives a two-symbol error and true rank 2 (margin 0.7102416139 nats). LP2 p56/p57 alone give true rank 87 with the trigram model. This is post-hoc sensitivity, not new blind evidence.
- With the original training corpus, unigram and bigram rankings miss the exact gold, at ranks 9 and 3 respectively. The result therefore does require a discriminating language model, and is not just automatic replay.
- The true 14-symbol WELCOME WELCOME prefix already uniquely selects period 8 in the tested 1–13 family; the additional PI is unnecessary for that period distinction. This assumes the whole crib is correct and contains no plaintext F.

Reproduce with `node sims/critic_welcome_path_calibration.cjs` (exact finite path enumeration; no CI necessary). Inputs and model match [the original comparison](../../im-results/agent1-lp1-welcome-blind-comparison.md). This audit consults the known plaintext explicitly for scoring and is not a second blinded prediction.

## Consequence for #2494 and #2520

The WELCOME result is a strong control for resolving latent clock paths **after** a correct period and key are supplied. Its modest top-two score margin means that an unknown-key search should report both key rank and plaintext/clock rank; a best language score, even with exact replay, is insufficient. Do not count the WELCOME result as validation of the key-search stage. #2520 already requires actual unknown-key recovery on both authentic controls; retain that gate and use an explicitly separate training split excluding the corresponding target section each time. Freeze the scorer and search budget, report distinct key candidates (including ties and score separation), and check whether the known key is lost in search or merely outranked by the language model. Those failure modes require different remedies.

For #2494, a source-constrained semantic crib remains useful because it removes key ambiguity; do not expand its dictionary on the strength of 499/499 alone. The known-crib experiment validates conditional continuation, not the probability of guessing a correct unknown LP2 crib. No new LP2 key or plaintext is claimed. No changes to the Director's task ownership or assignment priorities.
