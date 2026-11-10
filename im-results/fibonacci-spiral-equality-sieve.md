# Fibonacci-prime square key sieve with an unknown output-rune permutation

**Evidence class:** clue-derived, positive-controlled candidate-key screening and held-out negative. **No plaintext or key recovered.** Agent 34, 2026-11-10.

## Source and prior art

The 16 values in the original page-15 4×4 square (original `32.jpg`) exactly encode `abs(3301-p_(F_n+1))` for the first 16 *distinct* Fibonacci values, read in a clockwise outward spiral. **This formula and its spiral order were previously documented in the Cicada community**, notably [Wulfic's tracker](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) and [Cicada Research Notebook session 03](https://cicadanotebook.com/sessions/3.html). Session 03 already tested numerous prime/Fibonacci streams; reproducing the formula is not a novel decryption. The exact source construction is independently reproduced in this repo at [`sims/fibonacci_prime_spiral.cjs`](../sims/fibonacci_prime_spiral.cjs). Previous direct mod29 streams and 16×16-bit AES key candidates were also tested. The present experiment asks a narrower remaining question: whether a clue-derived **encrypted rune stream remains identifiable even when the output rune alphabet is independently and arbitrarily permuted**.

## Key material and cipher-family contract

Reuse the pre-existing finite [32 raw/hashed 256-bit key derivations](../sims/fibonacci_spiral_key_derivation.cjs) from the observed absolute spiral, prime values, ordinal ranks and Fibonacci ranks, in spiral or row-major order, 16-bit big/little endian, with SHA-256 alternatives. Feed each key into AES-256-CTR, ChaCha20 or RC4 streams. Keys have zero-IV page-reset, page-indexed-IV or continuous key positioning where applicable, byte drops 0 or 256, two byte-to-GP-rune maps (mod29 or scaled), and both additive signs. The full declared Cartesian product is **2,048** configurations for each target. No secret key bytes are fit to LP2.

Use the **fixed unknown outer-permutation invariant**: for `C_i=σ((P_i+sK_i)%29)`, ciphertext equality at lag `d` implies `P_i-P_(i-d)=-s(K_i-K_(i-d)) mod29`. Score equality and inequality observations at physical rune lags 2–16 by empirical GP-English difference probabilities mixed with 8% uniform noise. Reference language is trained on 240k Shakespeare characters; heldout synthetic control uses a separate final 60k characters. A composite score is not an actual decryptor or an analytic significance probability.

## Targeted LP2 outputs

- **Following pages 16–22:** highest scoring model is `sha256(absolute-spiral:BE)` with ChaCha20, zero-IV page reset, no drop, byte mod29, additive sign −1. Composite log score **−3786.48398**. Against **500** independent random pad streams its uncorrected selected-candidate tail is `2/501=0.003992`; multiplied by 2,048 choices the conservative multiplicity bound is **1**. The postselected peak supplies no recovered key.
- **Immediate page 16:** the best model is *different*, `ordinal-spiral:BE`, ChaCha20, page-number-based IV, drop256, mod29, sign −1; score **−664.96270**.
- **All 55 LP2 rune pages:** yet another candidate wins, `prime-spiral:LE`, ChaCha20, page-indexed IV, no drop, scaled rune mapping, sign +1; score **−27950.34680**. There is no common winner across the independent region definitions.

## Actual held-out decision test

Select the single best of all **2,048** configurations by the equality score on **pages 16–18 only**, then freeze its entire key derivation, stream cipher, IV, skip/drop, mapping, sign and alignment. Continue the stream across the earlier pages for candidates declared as continuous, and evaluate this same frozen candidate on untouched **pages 19–22**.

- Fitted key is `sha256(absolute-row-major:LE)`, AES-256-CTR, page-indexed IV, drop 256, rune mod29, sign +1.
- Training score **−1749.28048**.
- Heldout score **−2044.30274** against 1,000 same-reset-policy random keystreams, median **−2043.20648**, 95th percentile **−2036.24981**.
- **610/1,000 random streams scored at least as well**. Empirical heldout p **0.61039**.

This is a negative prediction test of the selected candidate. Source models do not transfer to those held-out pages at the tested sensitivity; it is not legitimate to select a different candidate on the heldout interval and claim that as confirmation.

In a controlled book encrypted from the heldout English reference with the actual `absolute-spiral:BE` AES-256-CTR key and a fresh arbitrary 29-way output permutation, with 81% adjacent-repeat rewriting, the precise planted key is ranked **first** among all 2,048 tested models. The positive control confirms the sieve's ability to recover the specified model when present.

## Reproduction and scope

- [Complete Node.js CJS implementation](../sims/fibonacci_spiral_equality_sieve.cjs), built from pre-existing clue-derived source-key library and the new [permutation-invariant sieve](../sims/equality_pad_scan.cjs).
- [Successful complete CI run 42754292316](https://github.com/FlareZ123/liber-primus/actions/runs/42754292316). The final minor code update corrected the printed Bonferroni tested-option count from an understated intermediate formula to the actual 2,048; the bound was already 1 in the successful run.
- Exact original ciphertext corpus: [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json).

The method makes no claim against unknown external key bytes, key skips, different source registers, more complicated transforms or page-local independently specified keys. **Do not continue enumerating arbitrary prime/Fibonacci square pad variants without a separate clue that predicts the transformation and a fresh plaintext interval.** The source construction is prior art, the cipher hypothesis is bounded, and no new genuine decryption was obtained.
