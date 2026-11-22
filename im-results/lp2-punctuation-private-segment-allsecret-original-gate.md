# Physical-punctuation private-alphabet gate: 172 independently secret ciphertext segments

**22 November 2026, Agent37. Classification: an exact necessary-condition exclusion for a specific direct GP29 cipher architecture; no recovered unknown plaintext, key, authored opcode or destination.**

## Human-visible candidate and independent source

A human could notice that Liber Primus prints 175 genuine punctuation marks in its 12,956-rune, 55-rune-bearing unsolved LP2 pages. The marks might denote independent ciphertext segments whose substitution keys refresh after every real period, comma or large chapter mark. The manuscript does not explicitly order such a refresh. To avoid testing arbitrary guessed keywords, grant the hypothesis its strongest reasonable secret: an independently arbitrary **29! permutation for each complete punctuation-bounded segment**.

The source is the exact physical-punctuation audit [`lp2-punctuation-identity.json`](../resources/liber-primus/lp2-punctuation-identity.json). Remove derivative event indices 57–60 (unprinted p15 numeric row terminators) and 125 (unprinted p37 mark). The **175 physical events occur at 172 different positions** in the original [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json) 12,956-rune sequence. Duplicate marks at the same position add no hidden rune-bearing segment. The final mark terminates the last segment. The resulting **172 consecutive segments cover every original rune exactly once** and retain original page-crossing words, text order and rune identities.

This hypothesis differs from the previous [punctuation-reset key-reuse report](punctuation-reset-key-reuse.md): that one grants a different secret alphabet for each *position after a reset* but requires an alphabet to be **reused at the same position across segments**. Here, each entire authentic punctuation segment has its own completely private alphabet, and no alphabet is shared with any other segment.

## All-secret theorem

For physical segment `s`, count ciphertext rune `a` as `n[s,a]`, and sort these 29 occupancy counts `n[s,(1)] >= n[s,(2)] >= ...`. If the original direct cipher is `C[i] = sigma_s(P[i])` inside that segment, then each `sigma_s` is a permutation, with no restriction on its secret values. Its histogram cannot change, only the labels can be renamed.

For any fixed plaintext symbol, the exact maximum count supported by **all possible independent private alphabets** is

`U1 = sum_s n[s,(1)]`.

For any fixed pair of **distinct** plaintext symbols, the exact maximum is

`U2 = sum_s (n[s,(1)] + n[s,(2)])`.

The original source gives **U1 = 1,012** and **U2 = 1,874**. This is an exact finite-key upper bound over all `(29!)^172` independent secret choices. No search, English scoring, unknown key or assigned alphabet enters either computation. The symbols need not be E and O: the same ceilings hold for *every* fixed single symbol and every distinct pair.

## Native plaintext comparison and power

The [CommonJS source SFT](../sims/lp2_punctuation_private_segment_allsecret_original_sft.cjs) uses the project's already pinned historical Gematria transliteration and scans **every** contiguous 12,956-rune window in each of the established genuine-English reference registers. E and O are selected in advance from the already documented predominant GP-native reference symbols; they are not selected because of the unknown ciphertext.

| Independent pinned native reference | Minimum plaintext E in any original-length window | Minimum plaintext E+O in any such window |
| --- | ---: | ---: |
| Gibran, *The Prophet* | 1,407 | 2,556 |
| Emerson, essays | 1,482 | 2,455 |
| Shakespeare, existing excerpt | 1,397 | 2,430 |
| **Original ciphertext's exact all-private-key ceiling** | **1,012** | **1,874** |

Every original-length control exceeds both exact original ceilings. The one-letter contradiction alone excludes the entire tested class as a direct converter of the original ciphertext into any of those native GP-English windows.

As a positive experiment, the reproducer chooses a genuine 12,956-rune contiguous Gibran passage, encrypts each original punctuation-bounded segment under its own pseudorandom 29-rune bijection, then recovers **all 12,956 original plaintext runes** under the exact inverse. Its recomputed all-secret capacities meet the source-native E/E+O counts. This demonstrates that the theorem permits a real instance of the tested cipher and that its exclusion of the unknown manuscript is not forced by the artificial segmentation itself.

## Cryptanalytic decision

**Retire a direct, constant-within-punctuation-segment GP29 substitution as a way to recover ordinary GP-English plaintext, even when all 172 punctuation segments have completely unrelated, unknowable permutations.** Adding another static keyword, a new private alphabet per paragraph, or a different additive/affine mapping within this exact architecture cannot overcome the original histogram ceilings.

The theorem does **not** exclude an evolving substitution **inside** a segment, a differently encoded plaintext register, lossless word/value transductions, transposition across punctuation boundaries, newly revealed side-channel key material, or hidden message content in the images. The punctuation placement itself is preserved as source evidence. This gate alone does not select a positive solution or tell the Director which untested evolving-state mechanism to choose; such a choice still requires an independent creator-visible operation or key.

**Executable:** `node sims/lp2_punctuation_private_segment_allsecret_original_sft.cjs` (Node22 CommonJS, read-only). Input and exact counts are asserted from the original repository corpus and corrected physical-punctuation inventory; the native-control minima and synthetic positive recovery are asserted by the same script. [Manual Windows runner](https://github.com/FlareZ123/liber-primus/actions/runs/45082912376) **completed successfully** on 22 November 2026 under Windows Node.js 22, verifying all original-source assertions and the 12,956/12,956 native positive plant.
