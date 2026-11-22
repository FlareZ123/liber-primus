# The original LP2 256-cell numeral table fails the literal SHA-1 message-schedule inverse

**Agent 26, 12 November 2026. Classification: exact, source-constrained negative on a reversible cryptographic format.** No original unknown-page plaintext, authenticated key or continuation is recovered. [Original-input Node 22 CommonJS regression](../sims/lp2_p50_sha1_schedule_original_sft.cjs).

## Motivated human route and weakest assumption

Physical LP2 pp49–51 print exactly **32 rows × 8 numeral cells**. In the conventional radix-60 interpretation this yields exactly **256 bytes**, or **64 consecutive 32-bit words**, a natural prefix of the SHA-1 message schedule. The 2016 signature-valid Cicada tree-message carrier identifies an RSA/SHA-1 OpenPGP signature (packet metadata independently parsed in [the signed payload gate](../sims/p32_2016_openpgp_frozen_byte_gate.cjs)). SHA-1 was a historically familiar cryptographic tool by LP2's 2014 release. This motivates testing a fixed, non-keyed source-byte structure rather than guessing another cipher pad.

**Critical limitation:** the authentic 2016 OpenPGP signature postdates the 2014 table, and nothing authentic says the author used its signature hash algorithm to fill the table. This is an exploratory format hypothesis, not a Cicada-issued decode command. The [distinct SHA-256/SHA-512 schedule test](lp2-p50-sha2-message-schedule-source-gate.md) already rejected those two algorithms. SHA-1 uses a different recurrence and was not included in that test.

## Exact original-source prediction

For SHA-1, the first 16 schedule words are freely chosen. For every subsequent word, the published algorithm **must** satisfy

```text
W[t] = ROL1(W[t-3] XOR W[t-8] XOR W[t-14] XOR W[t-16]), t >= 16.
```

The table provides 64 words. Thus, under any fixed byte serialization, **48 full 32-bit words / 1,536 bits are predicted deterministically from the original first 16 words**, with *no* secret key, initial state, plaintext, fitted constants or statistical model. Tested serializations are all 16 combinations of source-compatible radix (base60 or the documented f-omitting base59), row-major/column-major table order, forward/reverse byte order and big/little-endian 32-bit words. The original canonical base60 stream is asserted by its SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

## Decisive original result

| Original-source reading | Predicted vs printed W16 | Exact matches among W16–W63 | Differing bits / 1,536 |
| --- | --- | ---: | ---: |
| Base60, printed row-major, forward, big-endian | `658ec427` vs `7aff19c0` | **0/48** | **785** |
| Base60, printed row-major, forward, little-endian | `26c58f64` vs `c019ff7a` | **0/48** | **767** |
| Base59, printed row-major, forward, big-endian | `6f9ccc0b` vs `78fb19bd` | **0/48** | **762** |
| All 16 declared source readings | Every model **0/48** | **0/768 total** | **743–818** per model |

The SFT computes the complete original bit distances for each reading, asserts every mismatch result, checks that a synthetic 16-word seed expanded by the **same code** correctly predicts all 48 additional SHA-1 schedule words, and leaves original source tokens unchanged. [Successful source-original SHA-1 + SHA-2 CI run 43294943650](https://github.com/FlareZ123/liber-primus/actions/runs/43294943650) (Node.js 22).

## Research consequence

The original numeric table is **not a literal 64-word prefix of the SHA-1 expanded message schedule** in these 16 natural readings. There is no 2014 author-selected SHA-1 consumer, so do not enlarge this into free message-word permutations or secret whitening to rescue it. These results do not exclude using the 256 bytes as an arbitrary ciphertext, hash *input*, secret seed, external key, or differently specified data structure. They leave the underlying LP2 decipherment problem open. The immediate path to a real decryption remains recovery of an independently source-indicated **key plus consumer** or a complete decoder which predicts original ciphertext from a recognizable plaintext without postselection.
