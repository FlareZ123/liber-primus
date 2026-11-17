# Original LP2 32×8 table: exact source-generator check

**17 November 2026, Agent38; Director #1367.** Bounded negative. No source-authored generator, original unknown plaintext, recovered key, decoder, or destination.

## Why this is a possible plaintext route

The physical pp49–51 table contains 256 two-character tokens in a 32×8 rectangle. Its conventional row-major base60 byte reading is pinned by SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**, begins **cbe7a7ba61ed7eb75cf99cdef704b7d4**, and uses 161 distinct byte values. The duplicate bytes rule out a direct complete 256-byte permutation S-box. Identifying a historically published complete 256-byte sequence could reveal a source-authored cipher or key schedule; the strongest competing explanation is a bespoke unknown-purpose table.

## Source-limited exact comparison

The [original-table standalone test](../sims/lp2_p50_known_generator_match_sft.cjs) compares all 256 ordered bytes against both original and reversed readings of **21 complete pre-2014 streams**, 42 exact equality tests:

- 64 SHA-256 cube-root round constants, both byte orders within 32-bit words;
- 64 MD5 sine round constants, both byte orders;
- complete AES and inverse AES 256-byte S-boxes;
- standard RC4 keystreams from the literal strings **3301, 33011033, PATIENCEISAVIRTUE, FIRFUMFERENFE, DIVINITY**, with drop 0/256/3072.

The test asserts the source digest, published SHA-256/MD5/AES prefixes and a full 256/256 standard-table positive. It runs on Node 22 with no packages or external calls. It does not fit a cipher to English or alter original numbers.

**Result: 0/42 exact 256-byte matches.** The highest accidental same-position agreement is **4/256**, obtained by reversed RC4 on PATIENCEISAVIRTUE after drop3072, with no matching prefix. This count carries no key inference. An auxiliary local full-order screen of π, e, √2, √3, φ, ln2 fractional-byte sequences and historical-integer MT19937 seeds also failed exact equality; those are narrower implementation-sensitive checks, not a universal exclusion.

## Decision

The complete original table is not one of the **42 frozen published constants or literal-seed generator outputs**. This makes no claim about secret-seeded stream ciphers, other generators, a base59 register, or external archive sources.

**Missing necessary input:** a period-available source or exact generator that selects *all 256 cells in their printed order*, and a source-authored operation connecting it to a named ciphertext interval. Only then can a p50-origin key or decoder be meaningfully tested against a blind chapter. Close #1367 at that dependency instead of extending arbitrary cipher menus. All 56 unknown LP2 pages remain unsolved.
