# 2012 P.S. modulus and 2013 cookie integers: factorization and bounded key-use gate

**Classification: reproducible historical arithmetic; no LP2 plaintext or key recovered.** This closes a previously untested integer interpretation only for the finite operations below.

## Why this was tested

The external pnotisdev Phase 60 clue review lists the 2012 P.S. number and the two 2013 cookie values as not yet tested **as integers** (as distinct from their decimal/hex digit strings or raw bytes): [phase60 clue review](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/log/phase60_clue_review.md), [loose ends](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/laptop_review/08_loose_ends.md), [numeric-key script](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/phase60_t2_numkeys.py). The local historical record says the 167/761 cookie values may simply be session-state tokens: [cookie source record](../resources/external/2013-final-onion-cookie-values.md).

The LP1 prime/totient instruction and the signed 2013 TCP challenge's BASE29 example motivate a bounded check: interpret the 2012 number and 2013 cookie values as integers, compute Euler φ where factorization is known, serialize the results with the signed source's positional BASE29 alphabet, and test those fixed strings as GP29 keys. The 2013 source alphabet is `0123456789ABCDEFGHIJKLMNOPQRS`; treating its digit positions as GP29 rune indices is an analyst assumption, not a mapping specified by that source.

## Exact arithmetic

The 2012 P.S. number is a 131-digit, 432-bit RSA modulus. The public [community reconstruction](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/011-valete/numbers.private) supplies factors and a private exponent for the same modulus. Its README explicitly describes the private key as a community artifact used in later trolls, not as a Cicada-supplied LP2 secret: [2012/011-valete README](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/011-valete/README.md). The factors multiply exactly to the P.S. number.

The two 64-hex cookie values factor as follows (all listed factors passed SymPy 1.14 `isprime`; the products reproduce the exact source integers):

```text
cookie 167 = 2
          × 7
          × 1361320421
          × 236799195671201320135081
          × 10549310670307874697161710919718123012798761

cookie 761 = 11
          × 53
          × 454967
          × 2536798119511
          × 28850460227246503493
          × 2883521092882646610513901291579979911
```

The factors were found with SymPy 1.14 trial division followed by ECM. The ECM calls used `B1=10000, B2=100000, max_curve=200` for the 31-bit and 42-bit factors, then `B1=100000, B2=1000000, max_curve=500` for the 78-bit and 65-bit factors; the remaining 143-bit and 122-bit cofactors passed `isprime`. The 2012 P.S. modulus already has the published community p/q reconstruction; it was not factored in this experiment.

| Integer | φ(n) mod 29 | GP29 rune |
|---|---:|---|
| cookie 167 | 16 | T |
| cookie 761 | 3 | O |
| 2012 P.S. modulus | 1 | U |
| raw P.S. modulus mod 29 | 18 | E |

The two cookie totient residues therefore spell `TO` in the source order 167, 761. This is a two-rune residue only; no source-authored selector specifies this modulo-29 readout, and it is not plaintext evidence.

## RSA interpretation check

Both cookies were tested as integer ciphertexts under the 2012 P.S. RSA modulus with e=65537 and its reconstructed private exponent. The 54-byte private-exponent outputs begin `0c` and `4b`, respectively, and have neither PKCS#1 v1.5 encryption padding (`00 02`) nor signature padding (`00 01`); the public-exponent transforms likewise expose no standard signature block or readable message. Treating cookie labels 167/761 as RSA public exponents and the values as moduli is also unsupported: cookie 167 is even and cannot be a conventional RSA modulus; the cookie-761 cross-decryptions of the other cookie and P.S. integer yield no recognizable or padded plaintext.

## BASE29 key-use gate

The reproducer converts the raw integers and their φ values to the signed 2013 BASE29 digit alphabet, then maps digit positions 0–28 to GP29 indices as an explicit analyst assumption. It tests 92 fixed candidates on the original 12,956 runes of LP2 pages 0–55:

- raw P.S. modulus, raw cookie 167, raw cookie 761, and the two raw cookies concatenated: addition/subtraction;
- φ(P.S.), φ(cookie 167), φ(cookie 761), the two cookie φ values concatenated, and all three φ values concatenated: addition, subtraction, and Beaufort;
- global repeating and page-reset clocks, each with and without the p56-style F-transparent/key-clock-skip convention.

Scoring uses the repository's fixed `dukotah_english_quadgrams.txt`, expanding the GP29 transliterations and scoring pages 0–27 as training and 28–55 as held-out material. Raw ciphertext baselines are **−17.14419** (training) and **−17.10401** (holdout). The best φ-key holdout is **−17.12319** (`φ(cookie 761)`, addition, global repeat, F not transparent); the best raw-key holdout is **−17.17329**. No candidate beats the raw holdout baseline, and none yields readable plaintext. Training-only improvements do not persist to the holdout.

## Decision

Retire the tested direct RSA and BASE29/Vigenère interpretations. The `TO` residue is retained as an arithmetic observation, not promoted to a key or plaintext. The historical cookies may be session tokens; no source connects their integer factorization or totients to LP2. Reopen this branch only if a first-party source specifies the integer operation, the 167/761 ordering, and a receiver or key clock. No change to the authoritative established-results synthesis is warranted.

## Reproduction

From the repository root:

```bash
node sims/2012_ps_2013_cookie_integer_totient_gate.cjs
```

The script verifies the source cookie values and factor products, computes φ and the BASE29 strings, reproduces the RSA probes, and reports all 92 fixed key/clock candidates with train/holdout scores.