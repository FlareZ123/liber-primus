# A 2013 missing-prime list and LP2's 180 known terminal glyphs

## Source-visible hypothesis

The recovered participant Pastebin [xGY4pbHV](2013-first-onion-primes-xGY4pbHV-original-source.md) is the exact object cited as the first-onion PRIMES output. Its 1,387 raw bytes (SHA-256 `591b3cf337c803eef76a16466fa6ebc711aa1f0a3b26d1520573abda89889a94`) begin with the command `primes`, display a creation date of 8 January 2013, and print the first twenty primes through **71** before resuming at **1229**. Thus the participant artifact contains the exact 180-prime omission (73 through 1223, ordinals 21–200), along with doubled spaces after 29 and 3257. It is an anonymous participant paste, not a signed server response or packet capture; the displayed date is not a cryptographic timestamp. The 2016 wiki export and 2018 notes corroborate the early attribution but do not establish a separate live session. The gap itself is **prior art**; this report assesses a particular new original-table/terminal known-glyph consumer.

The original pp49–51 **32×8 numeral table** has a 76-cell perimeter and exactly **180 interior cells** (30×6). The physically adjacent LP2 solved p56 and clear p57 contain **85+95=180 original runes**. Along with the original unsolved p55's **76 runes**, this recreates the source-visible terminal **76+180=256** alignment. The two LP2 counts are consequences of the *same* table-ring/terminal comparison; they are not statistically independent corroborations. The source transcript supplies a finite new 180-prime vector with a plausible human-visible path, but no direction, key derivation, operator or input binding. Original p56 runes are **ciphertext**, while p57's are clear GP, an important impediment to any single 180-symbol plaintext rule.

## Direct original-input gate

The deterministic [CJS SFT](../sims/2013_missing180_terminal_register_sft.cjs) loads [canonical base60 table bytes](../resources/liber-primus/base60-grid.json), [canonical original rune indices and GP primes](../resources/liber-primus/lp2-corpus.json), enumerates exactly 180 historically omitted primes, and extracts the table's strict row-major 30×6 interior and p56+p57 original terminals. Under all four independent forward/reverse assignments of these two 180-vectors, tests four pointwise GP29 rules:
- `(tableByte+prime)%29`
- `(tableByte-prime)%29`
- `(prime-tableByte)%29`
- `(tableByte XOR (prime%256))%29`

Across the sixteen natural consumers the original symbol agreement is only **2–12/180**, against an independent-random equality expectation of about **6.2/180**. Even granting each candidate **an arbitrary secret stationary 29→29 lookup** (each input symbol maps to its observed most-common output, with collisions allowed), the maximum achievable original terminal matches are **49/180**.

**Authentic p56 solved-plaintext control.** Decode p56's 85 original glyphs using its established φ(prime)=p−1 GP29 keystream, literal F bypass at p56 offset56 and 84 consumed primes, reproducing native `ANEND` prefix. Concatenate its **85 real GP plaintext runes** with p57's 95 cleartext runes and repeat the sixteen fixed consumers. The direct agreement falls to **3–10/180**, and an arbitrary secret stationary GP29 decoder reaches at most **53/180** (at least **127** original control mismatches). This removes the original-ink control's intentional mixture of p56 ciphertext and p57 cleartext, while retaining the original-ink test separately for hypothetical printed-glyph uses. The shared SFT computes both targets. Thus each such stationary model must violate at least **131** of 180 original positions, independent of lookup key; this is a much more generous bound than a secret alphabet bijection.

Two direct byte-to-printed-GP-prime equations fail: `tableByte = (missingPrime + GPprime) mod256` gives **0/180** and `tableByte = (missingPrime mod256) XOR GPprime` gives **1/180**. The direct `tableByte XOR (missingPrime mod256)` 180-byte output contains **55 printable ASCII bytes** and no plain ASCII message. Both bytes and modulo29 reductions assume the *provisional* base60 source parse.

## Source-selected circumference reading and solved-page totient

A more causally motivated variant combines the exact **p57 “SHED OUR OWN CIRCUMFERENCES”** instruction with p56's authentic **φ(prime)=p−1** operation. Peel the strict 30×6 table interior into rings of **68+60+52** bytes, start each ring at the same geometric corner, read clockwise or counterclockwise (4×2 choices), and subtract the missing-prime totients mod29. The two prime-list directions make **16 predeclared** interpretations. These are all implemented in the same CJS SFT, with the true solved native GP p56+p57 control.

The best of 16 original ciphertext/cleartext mixed-glyph alignments happens to give **17/180**, but it falls to **11/180** on the correct fully native-GP plaintext control. Even after an **arbitrary secret stationary GP29 29→29 map** the maximum is **57/180**, so at least **123/180** authentic plaintext positions contradict this entire fixed family. This rejects the direct source-motivated totient/inner-ring consumer without needing a trigram score or synthetic key recovery. The two prime-list directions are exploratory; nothing authentic explicitly selects reading the 2013 missing-prime values in reverse.

## Decision

**No LP2 unknown plaintext or cipher key was recovered.** The original 180-count correspondence and historical omitted-prime vector are real as documented, but the source does not select any LP2 consumer and the direct natural model fails. Retire only the enumerated pointwise GP29/byte and inner-ring totient uses, including arbitrary stationary GP29 post-substitutions. A successor requires a historically supported instruction fixing which of the 180 missing primes keys which LP2 cell/rune, or an independently predicted original interval under a full reversible mechanism. Do not tune additional artificial traversals, clocks or lookups to the very same terminal glyphs.
