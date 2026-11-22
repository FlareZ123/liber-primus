# LP1's three prime filenames as an LP2 prime-11 key: exact F-transparent inverse

**Agent47, 17 November 2026. Original-cipher bounded negative.** No recovered LP2 plaintext, source-selected key, or next-stage address.

## Source path and independent historical prior art

The preserved [2014 Stage10 response HTML](../resources/external/2014-stage10-post-square-response.html) shows **107.jpg, 167.jpg, 229.jpg** in that order. Their **one-based prime ranks are 28, 39, 50**, evenly separated by **11 ranks**. The arithmetic was already explicitly noted in a [March 2021 r/cicada post](https://www.reddit.com/r/cicada/comments/lzrdds), so this is historical prior art rather than a novel clue. Prime numbers are authentic Cicada puzzle vocabulary. The hypothetical transfer to later LP2 is exploratory: no original text identifies this list as its cipher key.

Two source-minimal key hypotheses: (A) continue the ordinal step, `K[t] = phi(prime[28 + 11t])`; (B) loop the three literal filename numbers, `K[t] = phi([107,167,229][t mod 3])`. For both, all three historically visible starting ranks/phases are tested, both additive encryption signs are tested, and **every algebraically legal plaintext-F-transparent branch** is retained. This last rule is part of the authentic known solved LP2 p56 cipher, not a new fitted skip policy.

## Exact inverse and source-native positive controls

For ciphertext GP29 index c and currently consumed key count t, a nontransparent branch gives `p = (c - sign*K[t]) mod 29`, advances t by one, and must satisfy `p != 0` (literal rune F). Only when `c == 0` may there also be a plaintext-F branch with `p=0`, **leaving t unchanged**. Track every reachable t state until either the page ends or the state set becomes empty. Empty means that the key+operation cannot produce the original ciphertext from *any* plaintext in that entire class, independently of language and punctuation.

The actual p56 **85-rune original ciphertext** is exactly regenerated from its historically solved plaintext with `K[t]=phi(prime[t+1])`, plaintext-F transparency, and 84 consumed prime keys; its lone F is at zero-based plaintext position56. This is an authentic cipher-control. Twelve source-native synthetic encryptions of that same plaintext using the 2 candidate registers, 3 starts and 2 signs all survive the matching exact-state decoder with the correct 84-key terminal count (12/12).

## Results on untouched original ciphertext

| Original LP2 page | Tested key variants | Exact all-F-branch rejection | Surviving variants |
| --- | ---: | ---: | ---: |
| Physical p0 | 12 | **12** | **0** |
| Physical p15 | 12 | **12** | **0** |
| Physical p55 | 12 | **10** | **2** |

All p0 configurations contradict the authentic p56 algebra by source rune index111 at the latest; several reject at index1. Both p55 survivors are ordinal-step keys beginning at **prime rank28**, once for each encryption sign; the raw filenames' three-symbol loop does not survive. A surviving *shorter* p55 register cannot rescue p0, nor is it positive plaintext evidence.

**Decision:** This finite, source-visible, exact p56-cipher transfer to the 2014 linked prime ranks cannot decipher the unsolved manuscript's opening. Revisit only if a separate authentic instruction specifies a different cipher, nonvisible starting offset, KDF, or receiver. The numerical 11-step filename observation itself remains true and independent of these failed decoding proposals.

**Read-only reproduction:** [Node22 CommonJS SFT](../sims/lp2_2014_threejpg_prime11_ftransparent_sft.cjs) asserts the original linked HTML, every prime ordinal, actual p56 encryption roundtrip, twelve source-shaped positive plants, and all 36 untouched original page cases. [Windows Node22 CI run 44026683094 passed](https://github.com/FlareZ123/liber-primus/actions/runs/44026683094) on 17 November 2026, including the authentic p56 reencryption, twelve independent positive controls and all original contradictions.
