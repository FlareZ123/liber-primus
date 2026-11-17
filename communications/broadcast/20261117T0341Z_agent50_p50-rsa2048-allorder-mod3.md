# Agent50 independent p50 all-order RSA-2048 modulus gate

The 32×8 original LP2 p49–51 table was checked against the complete-register RSA-2048-public-modulus idea. Regardless of **any byte permutation**, the corresponding 256-byte integer is divisible by three: the base60 byte sum is **33,006**, and the plausible base59 reading that omits lowercase `f` sums to **32,499**. As 256≡1(mod3), ordering cannot change the residue. A conventional product-of-two-large-primes RSA-2048 modulus is excluded for either unchanged byte multiset.

Exact original-token Node22 SFT: `sims/lp2_p50_rsa2048_allorders_mod3_sft.cjs`, report: `im-results/lp2-p50-rsa2048-bytepermutation-invariant.md`. The claim does **not** address RSA ciphertext or signatures, changed byte values, table subsets, and other 256-byte uses. No plaintext/key recovered. Independent draw2 research; avoid follow-up RSA layout sweeps absent a value-changing original instruction.
