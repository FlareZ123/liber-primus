# Independent per-word affine-feedback cipher: complete direct inverse

**16 November 2026, Agent 7.** This is a source-exact, bounded negative for a mathematically broad but *unauthenticated* simple cipher mechanism. No unknown Liber Primus plaintext or historically chosen key is recovered. The complete executable witness is [the CommonJS SFT](../sims/lp2_wordlocal_perword_affine_feedback_original_sft.cjs), successfully run on original repository inputs in [Windows Node.js 22 workflow 43784585415](https://github.com/FlareZ123/liber-primus/actions/runs/43784585415).

## Question and direct algebraic inverse

A ciphertext with very few adjacent identical GP runes might arise from a reversible predecessor-dependent cipher with a fresh secret key per printed word. Test this especially permissive family on each original printed word independently:

`C[0]` is entirely unconstrained; for `j >= 1`, `C[j] = a*C[j-1] + d*P[j] + b (mod 29)`, with arbitrary `a,b in 0..28` and any `d in 1..28`. Each word gets its own **23,548 unrestricted triple choices**; there is no assumption that a secret repeats across words, chapters or pages. The model preserves original GP29 symbols and source word lengths, and the plaintext uses independently calibrated native GP orthography including one-rune ING and IO.

For a candidate preceding-ciphertext coefficient `a`, compute the whole original word's residual `R[j]=C[j]-a*C[j-1] (mod29)` for every `j>=1`. If it encodes a dictionary plaintext word, `R[j]=d*P[j]+b`. Subtract the first residual and normalize by the first nonzero difference. This uniquely yields a *complete affine signature*, invariant under every nonzero `d` and every `b`. There are only **29** predecessor coefficients to exhaust for each original word, so the procedure tests all 23,548 keys symbol-for-symbol without a brute-force key triplet loop. The full candidate plaintext and secret triple are reconstructed and exact forward-encryption asserted for any hit.

## Original result and positives

The unchanged canonical source contains **12,956 original GP runes / 2,896 source-joined printed words**. All **343** words of GP length 8–14 were tested against **14,282 distinct GP29-encoded source-native candidate words** from the project’s unchanged Shakespeare, Emerson, English-frequency and Gibran reference registers, indexed by 14,065 invariant signatures.

| Native rune length | Original words | Complete dictionary/key matches |
| ---: | ---: | ---: |
| 8 | 156 | 2 |
| 9 | 78 | 0 |
| 10 | 52 | 0 |
| 11 | 32 | 0 |
| 12 | 18 | 0 |
| 13 | 4 | 0 |
| 14 | 3 | 0 |
| **Total** | **343** | **2** |

The **only** isolated fits are source printed word index 1327 (cipher GP indices `[18,24,26,0,19,5,26,4]`) to `VACANTLY`, with `a=26,d=2,b=1`, and word index 1940 (`[10,25,20,15,21,11,11,27]`) to `NICHOLAS`, with `a=27,d=24,b=8`. These are isolated length-eight dictionary matches with *different secret parameters*. There is no continuous plaintext, shared key, historically selected operation or independent decrypted holdout. They should not be interpreted as recovered text.

The same SFT planted **343 independently keyed positive dictionary words** of the original exact lengths with deterministic seed `0x33011033`, randomly independent `a,d,b,C[0]` for each. All **343/343 exact triples** were algebraically recovered by the inverse; the original reconstruction checks and source counts passed under Node.js 22 on Windows.

## Decision and scope

This complete `a,b,d`-per-word affine-feedback family cannot *directly* explain any of the 187 original words of nine or more runes as ordinary source-native GP dictionary English while preserving the supplied word boundaries. Its only short-word fits provide no reliable key or plaintext signal. The negative is lexicon-relative: unattested names, unusual orthography, Latin or code words, silent boundaries, skips, page-sharing transforms and nonlinear/changing-within-word states remain outside its scope. The historical manuscript does **not** select this family, so further secret parameter tuning would distract from obtaining an author-selected operation. Do not recycle these two isolated dictionary words as cribs.

This evidence belongs in supporting research and does not change the established status in `results/README.md`.
