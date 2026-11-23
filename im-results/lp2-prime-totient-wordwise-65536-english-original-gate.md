# Wordwise authentic-p56 prime-totient inversion: all 65,536 starts fail on original long LP2 words

**Agent8, 23 November 2026. Classification: a source-authenticated cipher-family transfer obstruction under an explicit English lexicon, not a decipherment.** The original 56 encrypted/unknown LP2 pages p0–p55 remain unsolved. This test grants **every word its own arbitrary 16-bit prime-stream starting ordinal**, even though no creator-era source says to reset the prime clock at word boundaries.

## Why this is a distinct plaintext route

The author’s actual solved p56 page establishes the GP29 prime-totient cipher: for plaintext rune `F=0`, emit literal F without advancing the prime key; for each other plaintext rune `P`, emit `(P + (prime[k]−1)) mod 29` and advance `k`. A non-F rune can wrap to ciphertext F, so the inverse must not assume that every ciphertext F is necessarily a plaintext F. The authentic p56 ciphertext can be reconstructed exactly under this rule with **85/85 ciphertext symbols and 84 consumed primes**, including the true skip at page-local rune position 56.

The proposed extension is extraordinarily generous: for **each complete originally printed word separately**, choose an arbitrary prime ordinal `0 ≤ start < 65,536` and either additive sign. Word lengths, rune order, and actual original printed spaces remain fixed. No chapter key, word-number formula or inter-word continuity is required. The entire 16-bit start interval is a bounded grant to the hypothesis, **not** a key size or operator supplied by Cicada.

If this wordwise-transfer architecture genuinely encodes typical English prose, it ought to recover some of the book's hundreds of long whole words from a broad English lexicon. An exact whole-word match is stricter than a trigram score or a fitted brief crib and identifies a legitimate inverse candidate.

## Exhaustive original-input decision

Inputs are [unchanged original GP29 rune indices](../resources/liber-primus/lp2-corpus.json), the [shared physical word-boundary transcript](../resources/lp2-transcription.txt), and the [frozen English word-frequency register](../resources/control/english_wordfreq_textblob.txt), with the standard native GP transcription conventions `ING→NG`, `IO→IA`, `V→U`, `QU→CW`, `K/Q→C` and `Z→S`. The complete book has **12,956 original unknown runes and 2,896 genuine words**, including the **32** words spanning a page boundary. Exactly **343 complete words** have length 8–14 GP runes.

The English register normalizes to **12,859 distinct native-GP words** of length 8–14: by length, `4325, 3397, 2388, 1450, 767, 379, 153`. Multiple English spellings that normalize to one GP string are treated as one candidate; the highest observed frequency is preserved as its display label. No English words of length below 8 were used to select or rescue any result.

All primes from ordinal zero through **65,549** are computed in canonical ascending order. For every candidate original ciphertext word and lexicon plaintext word of equal GP length:

1. Require that every putative plaintext F produce a ciphertext F, consuming no prime. For all non-F plaintext positions, compute the exact required consecutive prime-key residues for each sign.
2. Index all 65,536 six-residue prime-key windows. Examine every matching start and compare every remaining required residue exactly. When a candidate has fewer than six consuming positions, inspect all 65,536 starts directly.
3. Forward-encrypt every candidate match and require byte-for-byte equality with the original runes. No word-level score, interpolation, spelling edit, filler, key phase shift, or post-result parameter is admitted.

| Original decision | Outcome |
| --- | ---: |
| Unknown LP2 source words tested, GP lengths 8–14 | **343** |
| Distinct English GP word candidates, lengths 8–14 | **12,859** |
| Allowed starting prime ordinals per word | **65,536** |
| Arithmetic signs | **2** |
| Six-key-residue prefix survivors | **259** |
| Exact original ciphertext/English whole-word matches | **0** |
| Original p56 reference forward-encryption | **85/85** |
| Original solved word `PILGRIM`, prime start 61 | **7/7** |
| Lengths 8–14 artificial long-word positive tests, both signs | **14/14** |

**Outcome:** No GP-length-8-or-longer original word matches a single dictionary English word under any of the 131,072 prime-start/sign pairs, despite allowing an independently chosen key start and sign for every word. This rules out *a full conventional-dictionary English reading under this complete direct wordwise p56-cipher transfer and 16-bit start domain*. It is stronger than a failed pagewise key-clock test because a successful solution would be free to restart the prime clock at every source-printed word.

The test does **not** exclude authentic words absent from this finite English register, GP-length-1–7 target words, prime indices beyond 65,535, nonstandard orthography, added encryption layers, changed segmentation, different F handling, or a wholly different cipher. No authentic key, unknown-page plaintext or new continuation URL was recovered. The source supplies no instruction selecting per-word independent primes.

## Reproduction and research decision

[Single runnable Windows11/Node22 CommonJS test](../sims/lp2_prime_totient_wordwise_65536_english_sft.cjs), repository-root command `node sims/lp2_prime_totient_wordwise_65536_english_sft.cjs`. It reads original/derived repo inputs without writing data or installing packages, proves the entire p56 known ciphertext, tests 14 planted long-word positives, and asserts zero original matches. **[Successful GitHub Actions source run 45108721351](https://github.com/FlareZ123/liber-primus/actions/runs/45108721351)**, output: `PASS source=12956_runes_2896_words tested_long_words=343 unique_dictionary_words=12859 first_six_survivors=259 all_65536_prime_starts_both_signs_exact_long_matches=0 p56_authentic_85_of_85=PASS planted_14_of_14=PASS`.

**Next cipher choice:** Retire unlimited word-by-word seed hunting within this literal p56 prime-totient family. Continuing to vary prime starts within this range cannot recover a single ordinary long GP-English word, regardless of how its start is computed. Work seeking real plaintext should obtain an independently source-selected transformation or key mechanism before layering another fitted cipher on this rejected direct transfer. This result remains an intermediate family exclusion and does not alter the overall status in `results/README.md`.
