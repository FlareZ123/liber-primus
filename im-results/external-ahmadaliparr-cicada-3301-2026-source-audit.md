# External repository audit: AHMADALIPARR/Cicada-3301-2026 is not LP2 evidence

**Reviewed:** 2026-11-18  
**Pinned upstream revision:** `7c02f5037605aa4208b533c90393a992a6020341` (2026-11-08T22:11:28Z)  
**Upstream:** https://github.com/AHMADALIPARR/Cicada-3301-2026/tree/7c02f5037605aa4208b533c90393a992a6020341

## Decision

Do not treat this repository as a Liber Primus transcription, a new LP2 corpus, or a decryption. Its raw page fixtures are misindexed and include synthetic text that is not present in the original manuscript. Its own results summary reports zero accepted solutions. No plaintext, key, cipher mechanism, or destination was recovered.

This is a source-corpus exclusion, not a claim about the author's intent.

## Decisive source mismatches

The external manifest labels `evidence/raw/page_56_runes.txt` as the LP2 page 56 "Sacred Primes & Totient Inscription". The file actually transliterates to:

> SOME WISDOM THE PRIMES ARE SACRED THE TOTIENT FUNCTION IS SACRED

That is the earlier LP1 "Some Wisdom" page, not LP2 page 56. The local canonical LP2 corpus contains exactly 58 pages; its page 56 is an 85-rune solved page and page 57 is a 95-rune solved page. The actual LP2 page 57 is the Parable, not an unsolved plate.

The external `evidence/raw/page_57_runes.txt` transliterates to synthetic prose beginning "RECURSION PRIME SECRET SCRIPT SPIRIT CONSTRAINT LIBER PRIMUS GATE ...". Its `page_58_runes.txt` begins "CLOSURE STATEMENT ...". These are not the original page 57 or page 58; the 2014 LP2 release ends at page 57. The external manifest's claims that pages 57 and 58 are unsolved therefore do not describe the source artifact.

## Internal status is also non-positive

- External `results/README.md`: 344 candidate evaluations, **0 verified accepted solutions**, 4 refuted paths, 340 unresolved.
- External `README.md`: explicitly says `evidence/raw/cicada_3301.asc` is a truncated stub; it cannot establish an authentic PGP verification.
- Its affine, reversal, magic-square, and prime-sequence candidates are formal/search demonstrations, not recovered LP2 plaintext.

## Reproduction / source pointers

Pinned upstream files:
- [README](https://github.com/AHMADALIPARR/Cicada-3301-2026/blob/7c02f5037605aa4208b533c90393a992a6020341/README.md)
- [Manifest](https://github.com/AHMADALIPARR/Cicada-3301-2026/blob/7c02f5037605aa4208b533c90393a992a6020341/evidence/manifest.json)
- [Mislabelled page 56](https://github.com/AHMADALIPARR/Cicada-3301-2026/blob/7c02f5037605aa4208b533c90393a992a6020341/evidence/raw/page_56_runes.txt)
- [Synthetic page 57](https://github.com/AHMADALIPARR/Cicada-3301-2026/blob/7c02f5037605aa4208b533c90393a992a6020341/evidence/raw/page_57_runes.txt)
- [Synthetic page 58](https://github.com/AHMADALIPARR/Cicada-3301-2026/blob/7c02f5037605aa4208b533c90393a992a6020341/evidence/raw/page_58_runes.txt)
- [External results summary](https://github.com/AHMADALIPARR/Cicada-3301-2026/blob/7c02f5037605aa4208b533c90393a992a6020341/results/README.md)
- Local canonical LP2 index: `resources/liber-primus/lp2-corpus.json`
- Local master transcription: `resources/transcriptions/liber_primus_master.txt`

The external page-file blob SHAs at the pinned revision are:
- p56: `26b190888d3f60f8e13fc25c20f1d4712620afaa`
- p57: `7f0272ec5be03f004fb67ec6bc90e25aad026b33`
- p58: `2887170be0b9414c84e94cd8bc6e4cdac27f421c`

## Reopen condition

Reconsider only if a later revision supplies original LP2 scans or a transcription that independently matches the canonical original rune sequence and page boundaries. Until then, exclude this repository from cryptanalytic inputs and do not spend further compute on its synthetic page fixtures.
