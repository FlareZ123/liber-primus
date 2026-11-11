# Original p55 sixteen-word prime-sum reading: one testable historical Tor-v2 address candidate

**11 November 2026, Agent23; independent exploratory route. Status: no unknown LP2 plaintext, authentic decryption key, historic hidden-service page, or established destination.** The candidate below is frozen as an archival lookup target, not recognized as a solved Cicada address. This does not modify the authoritative conclusions in `results/README.md`.

## Why this might have been human-attemptable in 2014–2016

The final still-encrypted physical LP2 page **p55**, immediately preceding the solved p56 **AN END** instruction to find a page on the deep web, contains exactly **16 complete words beginning on that page**. This is the *only* unknown rune-bearing physical page with exactly 16 word starts (among all 55). Its 76 original runes comprise **one carryover rune from p54** and **75 runes in the 16 new words**. The original p55 image is `resources/liber-primus/72.jpg` and its exact word boundaries were independently audited in `im-results/p15-p55-sixteen-complete-word-source-gate.md`; this is pre-existing source evidence, not a new discovery.

At the time of the puzzle, historical Tor version-2 onion hostnames had **16 RFC4648 base32 characters** (80 bits, the first half of SHA-1 of a service RSA identity key). [Tor's protocol specification](https://github.com/torproject/torspec/blob/main/address-spec.txt) documents that old convention, now deprecated. The signed 2016 Cicada clue says: “Its words are the map. Their meaning is the road, and their numbers are the direction.” The manuscript's GP rune alphabet has 29 distinct prime weights. Therefore a reader might try one GP-prime sum per p55 word and interpret the residues as base32 characters. Crucially, **no authentic source explicitly commands this modulo-32 reduction, this page, or this serialization**. These choices are a proposed human solve path. The source itself prints 17 page-local segments, including the cross-page carry, and the exclusion of that incomplete segment needs explanation.

## One frozen computation on untouched original words

Take all **16** complete words *whose first rune is printed on p55*, in ordinary reading order. Do not count the rune carried in from the prior p54 word as a separate p55 word. For each, sum the standard Gematria Primus **prime weights**, reduce modulo 32, then look up the resulting integer in the Tor-v2 alphabet `abcdefghijklmnopqrstuvwxyz234567` (0-based).

| P55 complete word, printed order | Literal GP transliteration | Exact prime sum | Mod 32 | Tor character |
| ---: | --- | ---: | ---: | :---: |
| 1 | AEMIW | 222 | 30 | 6 |
| 2 | SB | 114 | 18 | s |
| 3 | XM | 118 | 22 | w |
| 4 | SEOGDTHAE | 306 | 18 | s |
| 5 | FIAABCU | 283 | 27 | 3 |
| 6 | WR | 30 | 30 | 6 |
| 7 | BEAFXIMUCPHNGLEO | 596 | 20 | u |
| 8 | MSDIAPF | 365 | 13 | n |
| 9 | BHEOC | 138 | 10 | k |
| 10 | EOE | 108 | 12 | m |
| 11 | EAEIGXGS | 341 | 21 | v |
| 12 | ESEOTHTHES | 291 | 3 | d |
| 13 | THOE | 88 | 24 | y |
| 14 | CEAIMCX | 284 | 28 | 4 |
| 15 | DJU | 129 | 1 | b |
| 16 | BEI | 159 | 31 | 7 |

The sole forward, source-order result of this **exact** construction is

```text
6sws36unkmvdy4b7.onion
```

This is a syntactically well-formed **retired v2-style address string**, **not an authenticated or currently accessible service**. Its reverse printed-order variant is `7b4ydvmknu63sws6.onion`, but reversal is not source-selected for this purpose; the forward result is the primary falsifiable archival prediction.

## Strong objections and decisive evidence required

1. **A 16-character base32 output is guaranteed by construction.** Any 16 original words can supply one residue each; all **2,881** contiguous 16-word windows of the canonical 2,896-word unknown LP2 transcript also form syntactically valid v2 hostnames under the same recipe. Address format and the unique 16-word p55 page are at most a location/format cue. They carry *zero cryptographic proof* of the hostname's existence.
2. **The modulus and prime-sum choice are speculative.** Tor specifies how services derive an address from an identity public key, not how to encode GP prime sums. The 2016 sentence postdates LP2 and does not select p55, the particular word list, or modulo32. One could generate other addresses by changing the numeric mapping or orientation, so do not conduct a wordlist search or promote the most attractive output.
3. **No contemporary independent corroboration found.** A web-index exact-string check on 11 November 2026 for the forward and reverse host labels returned no indexed references. Search absence is not proof the service never existed; retired v2 hidden-service descriptors and HTTP bodies may be gone. The solved p56 target is a **64-byte page hash**, not a hostname hash; the string alone cannot satisfy it.

**Actionability:** keep the *forward result fixed*. A contemporaneous 2014–2017 signed source, HSDir descriptor (including identity public key), original crawl, Tor directory archive, or a historically preserved fetch for **that exact host** would be an independently discriminating success. If an authentic page object is recovered, verify its bytes against the known original 128-hex p56 target using a historically supported digest convention, and check whether it actually instructs a cipher or supplies plaintext. Without such independent historical evidence, stop at this hypothesis rather than run arbitrary alternative prime sums, key schedules, host-string edits or hash families.

## Reproduce

The one-file [dependency-free CommonJS check](../sims/p55_16word_prime32_onion_sft.cjs) uses the unchanged `resources/lp2-transcription.txt`, the existing `sims/lp2_word_pages.cjs` page/word parser and `resources/liber-primus/lp2-corpus.json`. It asserts all 2,896 source word counts, 16 unique p55 word starts, exact 76 = 1 + 75 rune accounting, every individual prime sum and base32 character, and the 2,881-window tautology. Run it on a locally checked-out repository with Node.js:

```text
node sims/p55_16word_prime32_onion_sft.cjs
```

The original-source inputs and 2016 source wording are unchanged. This is an independently testable **proposed destination**, with zero newly decrypted rune symbols.
