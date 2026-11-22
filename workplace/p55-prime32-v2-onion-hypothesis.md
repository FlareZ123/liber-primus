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

## Cross-round Stage10→Stage11 checksum (13 Nov 2026)

The original 2014 Stage10 square source has row sums **3301, 1033, 1033**. The archived original Stage11 onion7 HTML, present in the 2014-05-11 source commit [`6c3421a4d245596e403c88e037509d162a2afd17`](https://github.com/micheloosterhof/cicada-2014/commit/6c3421a4d245596e403c88e037509d162a2afd17), contains `<title>133</title>` and `<div id="331">`. Deleting the single zero from the two distinct Stage10 sums gives **331** and **133**; Stage11 stores these values in reverse order (title **133**, div ID **331**). Taking the first and last decimal digits of those Stage11 values gives **13** and **31**.

That ordered pair independently matches (a) the original p55 floral-frame values **13/31**, and (b) the eighth and sixteenth base32 digit indices of the frozen p55 candidate **`6sws36unkmvdy4b7`**. The Stage11 numeric title/ID pair is unique among the archived Stage index HTML files inspected. The same prime-sum/mod32 recipe applied to the competing 16-word 2016 signed sentence gives **`ptpits7uimxshpir`**, whose eighth/sixteenth base32 indices are **20/17**, not 13/31. This makes the new check discriminating between the p55 block and that obvious alternative 16-word block.

This is a new cross-round **source-linked checksum hypothesis**, not a decryption or proof that the candidate ever hosted a service. It is distinct from the previously tested raw 133/331 modulo-58 page-address and GP29 pair-mixer interpretations (Director #135; `im-results/onion7-133331-gp29-pair-inverse.md`), which remain negative. Neither zero deletion nor outer-digit extraction is explicitly prescribed by the sources. The candidate still requires an attributable historical service descriptor or page bytes; page bytes must independently match the p56 512-bit digest before any destination claim.

## Strong objections and decisive evidence required

1. **A 16-character base32 output is guaranteed by construction.** Any 16 original words can supply one residue each; all **2,881** contiguous 16-word windows of the canonical 2,896-word unknown LP2 transcript also form syntactically valid v2 hostnames under the same recipe. Address format and the unique 16-word p55 page are at most a location/format cue. They carry *zero cryptographic proof* of the hostname's existence.
2. **The modulus and prime-sum choice are speculative.** Tor specifies how services derive an address from an identity public key, not how to encode GP prime sums. The 2016 sentence postdates LP2 and does not select p55, the particular word list, or modulo32. One could generate other addresses by changing the numeric mapping or orientation, so do not conduct a wordlist search or promote the most attractive output.
3. **The signed 2016 instruction has a competing 16-word inventory.** The exact source sentence `Its words are the map their meaning is the road and their numbers are the direction` has 16 words with GP-prime sums `[143,179,175,72,211,114,319,84,72,204,215,114,295,175,72,337]`. The identical modulo-32 method creates the also-syntactically-valid `ptpits7uimxshpir.onion`, with no known source corroboration. This independent natural 16-word block weakens any argument that p55's 16-word count alone selects an onion host.
4. **No contemporary independent corroboration found.** A web-index exact-string check on 11 November 2026 for the forward and reverse host labels returned no indexed references. Search absence is not proof the service never existed; retired v2 hidden-service descriptors and HTTP bodies may be gone. The solved p56 target is a **64-byte page hash**, not a hostname hash; the string alone cannot satisfy it.

**Actionability:** keep the *forward result fixed*. A contemporaneous 2014–2017 signed source, HSDir descriptor (including identity public key), original crawl, Tor directory archive, or a historically preserved fetch for **that exact host** would be an independently discriminating success. If an authentic page object is recovered, verify its bytes against the known original 128-hex p56 target using a historically supported digest convention, and check whether it actually instructs a cipher or supplies plaintext. Without such independent historical evidence, stop at this hypothesis rather than run arbitrary alternative prime sums, key schedules, host-string edits or hash families.

## Reproduce

The current full source and numeric-check reproduction is the [dependency-free CommonJS SFT](../sims/lp2_p55_16word_onion_candidate_sft.cjs). It reads the unchanged canonical transcription, original p55 rune indices, GP prime table, Stage10 magic-square values and Stage11 HTML metadata; it asserts the exact 16 word sums, all 2,103 page-local windows, the 13/31 checksum and the 2016 competing-block negative control. The earlier [independent arithmetic script](../sims/p55_16word_prime32_onion_sft.cjs) remains available. Run the current SFT on a locally checked-out repository with Node.js:

```text
node sims/lp2_p55_16word_onion_candidate_sft.cjs
```

The original-source inputs and 2016 source wording are unchanged. This is an independently testable **proposed destination**, with zero newly decrypted rune symbols.
