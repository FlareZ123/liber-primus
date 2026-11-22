# Authentic Cicada solved-cipher regression suite

**Evidence class:** tested reproduction of previously solved cryptography. Agent 17, 2026-11-10. **No new unsolved LP2 plaintext is claimed.**

## Authenticated decryption controls

The suite uses original rune sequences, the 29-symbol Gematria Primus alphabet and independently recorded plaintext. All three cryptograms were published before the suite was written.

| Original source | Attack | Exact result |
| --- | --- | --- |
| LP1 page 01, scan 01.jpg | 184 ciphertext runes; all 841 modular affine mappings | Unique exact P=(28*C+28) mod29 (Atbash), 199 transliterated characters |
| LP1 pages 03–04, scans 03.jpg–04.jpg | 515 runes; infer eight-rune key from first 100 known-plaintext runes while enumerating 64 literal-F masks | Unique key indices [23,10,1,10,9,10,16,26], DIUINITY (= DIVINITY); all 415 held-out runes match |
| LP2 page 56, scan 73.jpg | 85 runes; search prime or phi(prime) streams, 29 starts, both signs, 32 literal-F masks | phi(prime), subtraction, start zero and mask 8 uniquely recovers all 85 runes after 25 held-out runes |

For Vigenère the first 100 ciphertext runes contain Fs at [5,14,47,48,74,84]; only [48,74,84] are literal. All recovered literals across the entire 515 runes are [48,74,84,132,159,160,250,421,443,465,514]. Period-7 and period-9 keys produce no exact training candidate. The 415 remaining rune predictions all match the independent plaintext.

Page 56 has Fs at [35,47,51,56,74]. On the first 60 runes, masks 8 and 24 both match. On the held-out 25 runes, they match 25/25 and 14/25 respectively. Unmodified primes produce at most 9/60 training matches under the same search. Total candidate configurations across two stream models: 3,712.

Original LP1 orthography differs from edited plaintext at three words: ILLUSIANS, WIDSOM and INSTRUCTIAN rather than ILLUSIONS, WISDOM and INSTRUCTION. Code applies these three explicit replacements, plus GP V→U, K→C and ING→NG transcription rules, and tokenizes symbols separately by word.

## Exact reproducer

- sims/authentic_lp1_p01_atbash_regression.cjs
- sims/authentic_lp1_p03_p04_vigenere_recovery.cjs
- sims/authentic_lp2_p56_totient_regression.cjs
- .github/workflows/authentic-known-decryption.yml (manual dispatch only)
- **Successful complete CI:** https://github.com/FlareZ123/liber-primus/actions/runs/42746664298

Ciphertexts: resources/transcriptions/lp1_wulfic_canonical.txt and resources/liber-primus/lp2-corpus.json. Solved reference: resources/liber-primus/lp1-plaintext-reference.txt and https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/pages/page_73/README.md.

## Interpretation

The Vigenère key is recovered using **known plaintext**; unknown later literal-F positions likewise require the plaintext comparison. The regressions reproduce genuine historical cryptography rather than overcoming the unsolved LP2 pages. They provide a reusable reference against which proposed new key-recovery methods can be measured.
