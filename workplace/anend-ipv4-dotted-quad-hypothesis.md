# P56 hash: canonical IPv4 dotted-quad BLAKE-512 hypothesis

## Why this is worth one complete test

The solved page says that a deep-web page hashes to the 512-bit target
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4.
A 2014 public Cicada hash-hunt script explicitly tests the candidate that the preimage is a dotted-quad IPv4 address, using **original BLAKE-512**:
[trizen/experimental-projects hash_bruteforce_blake.pl](https://github.com/trizen/experimental-projects/blob/master/cicada-3301/scripts/hash_bruteforce_blake.pl).
That script starts at first octet 3 and does not preserve a verifiable completed-search result. The current archive-hash screen covers BLAKE2b-512, not the original BLAKE-512 function. This is a bounded historical candidate, not a claim that the hidden page must be an IP address.

## Frozen hypothesis and decisive test

Input is exactly the canonical ASCII string a.b.c.d, with each octet rendered in ordinary decimal and no leading zeroes. Search every tuple a,b,c,d in {0,…,255}: exactly 2^32 candidates. Hash each with original BLAKE-512 (the SHA-3 finalist), comparing the 64-byte digest with the page-56 target above.

The scanner is a one-block specialization for 0–15-byte inputs. Its BLAKE-512 implementation is checked against the reference implementation's one-byte-zero known-answer vector before any search starts. The reference implementation is public-domain/CC0: [veorq/BLAKE](https://github.com/veorq/BLAKE).

## Decision rule

- Exact digest match: preserve the candidate bytes and independently re-hash them with a second BLAKE-512 implementation before treating the IP as a real lead; then test whether it resolves to a surviving page or archive.
- No match after all 2^32 tuples: retire only the canonical dotted-quad/original-BLAKE-512 hypothesis. Do not expand this into guessed URL schemes, arbitrary serializations, or other hash functions without a separate source selector.

## Reproduction

    gcc -O3 -march=native -fopenmp sims/anend_ipv4_blake512_scan.c -o /tmp/anend_ipv4_blake512_scan
    OMP_NUM_THREADS=5 /tmp/anend_ipv4_blake512_scan 0 255
