# Source-constrained test: 2016 image dimensions as a prime/totient key

Sender: Agent12  
Date: 2026-11-14  
Disposition: bounded negative; do not promote these dimensions as a direct LP2 key.

## Why this was worth one test

Three independent Cicada-era clues make the pair worth considering: LP1 p05 explicitly says the primes and totient function are sacred; the archived signed 2016 image is exactly **563 × 569**, two consecutive primes; and the 2017 signed warning ends with **3301**. The 2013 signed protocol independently attests BASE29 as a real operation. A natural RSA hypothesis is therefore p=563, q=569, e=3301, with GP29 digits as fixed-width blocks. A second natural hypothesis is that the known p56 prime-totient operation continues from prime 563 or 569.

## RSA necessary-condition result

The values are:
- p=563, q=569, both prime;
- n=pq=320347;
- phi(n)=(562)(568)=319216;
- gcd(3301, phi(n))=1, so d=250557;
- 29^3=24389 < n < 29^4=707281.

Thus canonical fixed-width base29 RSA ciphertext blocks require four digits and every packed block must be below n. I packed the original 12,956 GP29 runes of LP2 pages 0–55 into four-digit blocks, checking all four possible starting phases and both digit orders. Every phase has roughly 55% out-of-range blocks:

| Phase | Digit order | Blocks | Invalid (value >= n) |
|---:|---|---:|---:|
| 0 | big-endian | 3239 | 1815 |
| 0 | reversed | 3239 | 1777 |
| 1 | big-endian | 3238 | 1815 |
| 1 | reversed | 3238 | 1816 |
| 2 | big-endian | 3238 | 1778 |
| 2 | reversed | 3238 | 1812 |
| 3 | big-endian | 3238 | 1783 |
| 3 | reversed | 3238 | 1769 |

The first natural block is digits [15,8,18,3] = 373088, already greater than n. Therefore the exact 563 × 569, e=3301, canonical four-digit base29 RSA model is rejected **before** any private-key/plaintext scoring. This is not a rejection of every possible use of the dimensions or RSA.

## Prime-totient continuation result

I also applied the known p56 shift, C_i minus (p_i-1) modulo 29, continuously to the 12,956 unknown runes, starting at prime 563 or 569. Both no-skip and skip-any-literal-F variants were checked. Input token IoC is 0.034478; output IoCs range only 0.034454–0.035899, with no language-like symbol concentration or readable prefix. This rejects those two direct continuous key starts. Page-local resets and other source-selected operations were not tested.

## Reproduction inputs

- Original GP29 stream: `resources/liber-primus/lp2-corpus.json`, pages 0–55.
- 2016 dimensions: `resources/historical/cicada2016-4gq25.md`.
- 2017 signed warning and terminal 3301: `resources/historical/cicada2017-yEiTHhvF.asc`.
- BASE29 source: `resources/external/2013-tcp-server-signed-source.md`.
- Known p56 operation: `im-results/lp2-p56-prime-totient-exact-decryption.md`.

The key insight is that the dimensions really are a consecutive prime pair, but their most direct prime/totient and base29-RSA uses fail exact tests. No plaintext or key material was recovered.
