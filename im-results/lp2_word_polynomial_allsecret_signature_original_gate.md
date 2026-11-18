# Original LP2: all-secret per-word polynomial-shift gates (degrees 2–7)

**Decision (18 November 2026):** A direct, independent additive polynomial in each plaintext word cannot explain the intact original GP29 ciphertext as ordinary English with the repository's pinned native-GP word register, even if its coefficients are arbitrary independent secrets and all word boundaries are moved. This is an exact source-language exclusion of the specified family, **not an unknown-page decryption or proof against other registers**.


## Stronger arbitrary secret per-word affine scale extension (18 November)

The p39-red-polynomial word hypothesis now grants each word **an arbitrary nonzero secret multiplier** `scale[w]`: `C[w,j] = scale[w]·P[w,j] + Σ a[w,k]·j^k (mod29)`. The `(d+1)`th finite difference cancels every secret polynomial coefficient. Normalizing that vector by its first nonzero entry eliminates all **28 possible hidden nonzero scales** as well. Against all original 12,956 GP29 rune windows and 32,021 pinned source-native GP English words, there are **zero compatible windows of length n≥11** for degrees **2 and 3**, or **n≥12** for degrees **4 and 5**, through n14. Respectively **57/57/25/25** original printed word slots require one of those unavailable lengths. Shorter windows yield real incidental hits, so the gate is discriminating. Planted native-GP affine-poly controls pass. [Updated standalone SFT](../sims/lp2_polynomial_wordshift_allsecret_sft.cjs) · [Windows Node22 PASS 44305457452](https://github.com/FlareZ123/liber-primus/actions/runs/44305457452).

**Decision:** The no-go now covers every secret nonzero multiplicative word scale with polynomial shifts of degrees 2–5, in the stated native-English original-word family. No recovered plaintext or authentic key follows.

## Why investigate this operation

The manuscript contains an original red quadratic expression on physical p39, and the Cicada-signed 2016 message emphasizes words and their numbers. A natural but *unselected* implementation is a polynomial shift in each printed word's rune position. Prior independent research excluded constant, affine and linear-ramp per-word shifts. The quadratic operation and extensions through degree seven test the wider finite-difference family without guessing coefficients. The original expression does **not** specify this operation or the reset clock.

## All-secret mechanism and exact invariant

For a proposed plaintext word with GP29 indices `P[j]` and a ciphertext word `C[j]`, consider

`C[j] = P[j] + a[0] + a[1]*j + ... + a[d]*j^d (mod 29)`,

where `d` is fixed and **every coefficient of every word may be chosen independently from GP29**. The initial word position is `j=0`. This grants `29^(d+1)` independent keys per word (and different keys for each word). For *every* such key, applying `d+1` adjacent finite differences modulo 29 cancels the polynomial, giving the immutable necessary condition:

`Δ^(d+1) C = Δ^(d+1) P (mod 29)`.

It is therefore unnecessary to enumerate any secret keys, polynomial starting points or coefficients. Reversing the polynomial coordinate `j` merely changes its coefficients and stays inside the admitted family. This test grants an even stronger adversary: proposed plaintext word starts can move to **every contiguous offset** in the entire 12,956-rune original tape, while retaining the manuscript's 2,896-word length multiset. No choice of boundaries can create a word of a required length if zero corresponding source windows have the invariant of a natural-GP English word.

## Frozen original input and English register

- Original `resources/liber-primus/lp2-corpus.json`: physical p0–p55, skipping runeless p50, **12,956 runes**.
- Original `resources/liber-primus/lp2-transcription.txt`: **2,896 complete words** and physical page-crossing words preserved. The original length demand above degree-specific thresholds is counted from these words.
- GP29 tokenizer and the native English normalization `QU→CW`, `V→U`, `K→C`, `Z→S`, `ING→NG`, `IO→IA` are reused unchanged from the pre-existing exact linear-ramp test `sims/lp2_word_progressive_affine_signature_sft.cjs`.
- Five existing immutable reference files: `english_wordfreq_textblob.txt` (29,157 source tokens), `shakespeare_first300k.txt`, `emerson_essays_2944.txt`, `gibran_prophet_58585.txt`, and `blake_song_of_liberty_train.txt`. These produce **32,021 distinct GP29 word encodings of length at most 14** after deduplication, including **172 different length-14 encodings**.

## Original-input results

| Degree d | First length with zero matches in *all* original contiguous windows | Required original printed words of that length or longer | Original all-cut matches at immediately shorter length |
|---:|---:|---:|---:|
| 2 (quadratic) | 9 | 187 | 6 of 12,949 windows at length 8 |
| 3 (cubic) | 10 | 109 | 1 of 12,948 at length 9 |
| 4 (quartic) | 11 | 57 | 1 of 12,947 at length 10 |
| 5 | 12 | 25 | 1 of 12,946 at length 11 |
| 6 | 12 | 25 | 32 of 12,946 at length 11 |
| 7 | 14 | 3 | 1 of 12,944 at length 13 |

For each row, **every** length from the stated first-zero threshold through length 14 has zero dictionary-compatible original windows, while the original printed-word multiset demands at least the indicated number of words in that range. The immediately shorter counts are included to expose the boundary of each finite gate, and the SFT prints the complete length-by-degree matrix. Under the printed original boundaries, quadratic shifts already have **zero matches at lengths 7 and 8** across 216 and 156 required original words respectively; the any-cut gate tolerates *all* alternative cuts.

The planted control independently chooses each secret polynomial coefficient, encrypts a real source-native word at each tested length and degree, exactly decrypts it, and verifies that the invariant survives. These positive checks pass for every stated degree and available length. The complete original corpus contributes **no plaintext, discovered key or proposed author-chosen polynomial receiver**.

## Limits and research decision

This result excludes one broad **additive per-word polynomial shift** family in the pinned GP29 English register while preserving original length multiset and rune order. It says nothing universal about non-English plaintext, proper names absent from the 32,021-word reference, insertions/deletions, nonpolynomial feedback, transposition, or other encrypted registers. Even degree seven remains an artificial robustness extension: the source p39 printing only offers the quadratic clue and does not authenticate the word index clock. No further scanning of polynomial coefficients in this family can evade the exact invariant; a new route needs independent source evidence for a different operation or text register.

**Reproduction:** `node sims/lp2_polynomial_wordshift_allsecret_sft.cjs` (read-only Node22 SFT, original source files, unaltered lexical normalization; all counts and full per-degree matrix printed). The SFT fails if original source lengths or all-cut zero gates differ, and includes exact encryption/decryption plants.