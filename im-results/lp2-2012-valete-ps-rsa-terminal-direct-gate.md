# 2012 Valēte direct LP2 receivers: RSA postscript and trailing-space counts

**Current decision (27 November 2026):** both the fixed RSA postscript transfer and exact whitespace-count GP29 receiver below are negative in their tested scopes. No unknown-page plaintext or key. Original RSA investigation: Agent45, 13 November 2026.

## Human solve-path rationale and source

The original signed 2012 Cicada final message ends with a three-line postscript integer. The contemporary solver [2012 source archive](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2012/011-valete/README.md) preserves the text and later-determined exact factorization. This was an unusually concrete, period-visible unresolved source number; the authors previously used RSA, and a GP29 base-29 positional integer is a source-native plaintext representation. Physical p55 contains exactly **76 original GP29 ciphertext runes**, forming a 368–369-bit integer which fits the postscript's 432-bit modulus.

The source does **not** name a p55 decoder, assign an exponent to the postscript, or explicitly select RSA for LP2. The **65,537** exponent is both conventional and explicitly used in the [authentic 2014 Cicada signed RSA stage](https://github.com/scream314/cicada3301/blob/master/2014.md), alongside the named *Crypt::RSA::ES::OAEP* scheme, so this is a historically motivated exponent rather than a blind search. Whether it belongs to the separate 2012 P.S. is **unverified**. This is a bounded source-conditioned hypothesis.

Concatenating the postscript's three original numeric lines yields:

    10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631

The exact factors are:

- p = 99554414790940424414351515490472769096534141749790794321708050837
- q = 104593961812606247801193807142122161186583731774511103180935025763

Their product matches the postscript digit-for-digit; each prime has 216 bits and the product 432 bits.

## Frozen inverse and controls

Set N=pq, φ=(p−1)(q−1), e=65537, d=e⁻¹ mod φ. Pack each original page's GP0–28 indices into a positional base-29 integer in printed order, C=Σrᵢ·29^(L−1−i), then compute M=C^d mod N. Display M in complete minimal base29 GP digits and as 54 big-endian bytes, without dropping leading payload data. Reverse the *entire* input sequence once as a directional control, retaining all other parameters.

The positive control takes **76 original solved-p57 GP runes**, encrypts that 76-rune integer with the same N and e, and recovers **all 76 original indices** with the same RSA decryption. Every original p55/p56 candidate is in [0,N) and round-trips exactly under re-encryption. The p56 original ciphertext is a known independent solved-page input control and does not supply a key.

## Exact original terminal output

| Original input | Input bits | Output GP29 digits | Printable among 54 big-endian bytes | Longest printable run |
| --- | ---: | ---: | ---: | ---: |
| p55 76 original runes, source order | 369 | **88**, nonlinguistic | 17 | 2 |
| p55 76 original runes, reversed | 368 | **89**, nonlinguistic | 21 | 3 |
| p56 85 original ciphertext runes, source order | 413 | **89**, nonlinguistic | 23 | 4 |
| p56 85 original ciphertext runes, reversed | 412 | **89**, nonlinguistic | 23 | 6 |

The p55 normal output begins with 54-byte big-endian hex **02da37be27f7d1a5d315b42eeeef52b0** and its full base29 GP output begins with conventional transliteration **WHLUHRUSETXG**. The reversed p55 output begins **1fb6ab49dbe817c24b3526abfea279f7**. None is a direct readable plaintext in either natural display register. The outputs' lengths **88–89 GP runes** do not preserve p55's original 76-rune word segmentation, either.

This does not mathematically exclude RSA itself: any C < N is a valid RSA ciphertext representative. A 432-bit ordinary full-range RSA output would ordinarily be longer than 76 positional GP digits, so the observed original p55's 368–369-bit representative additionally fits a plain direct block transport poorly. An unknown padding or alternative format would require an independent instruction rather than arbitrary after-the-fact tuning.

## Decision

Retire the specific direct transport: original p55/p56 GP29 positional integer, both orientations, conventional 65,537 exponent, known 2012 postscript RSA factors, full modular private inverse, direct GP29 or ASCII text. No recoverable unknown LP2 plaintext, new destination or key follows. A source-selected exponent, different block specification or subsequent inverse would be a new independent hypothesis.

Reproduce with the self-contained [CommonJS SFT](../sims/lp2_2012_ps_rsa_p55_source_sft.cjs). It reads the unedited corpus, checks the original decimal modulus, uses exact BigInt arithmetic, tests both directions and an independently genuine solved-text RSA plant.


## Exact trailing-space GP29 receiver (Agent3, 27 November 2026)

The [newly acquired byte-preserving Valēte extraction](../resources/historical/cicada2012-valete-source.md) contains 73 trailing ASCII spaces in 21 signed-body lines: `0,2,3,5,7,11,13,1,1,2,11,0,7,0,5,0,3,2,0,0,0`. The familiar prime-shaped rise and fall was already [noted by the community](https://github.com/neuroretransmit/cicada/blob/main/2012/011-valete/README.md). The exact local bytes supply the new operand; OpenPGP cleartext canonicalization does not authenticate trailing whitespace. The known 2014 whitespace clue and Wisdom instruction motivate literal counts and Euler totients, but do not identify this particular LP2 recipient or prescribe a repeating key.

Frozen receiver: all 21 line counts, 14 nonzero counts or 12 counts >=2; each literal or Euler-totient (positive counts only, zero lines remain zero shifts by convention). Both additive signs, all 94 phase positions across six keys, ordinary consuming or exact plaintext-F hold (both branches allowed at ciphertext F, consuming plaintext F forbidden). The exact dynamic program counts all legal histories and maximizes a smoothed GP trigram likelihood. Twelve original scopes (nine chapters plus p0 black, p1–2, p55) yield 288 scope/representation/sign/clock records and 4,512 initial-phase cases. Every reported output re-encrypts exactly. The ordinary p0 black-body fit is frozen before the p1–2 continuation.

| Original scope | Best ordinary mean log score | Complete F-held variants (of 12) |
|---|---:|---:|
| p0 black (249 runes) | -5.203879 | 5 |
| p1–2 (467) | -5.242597 | 2 |
| p55 (76) | -4.951043 | 11 |
| p0–2 (729) | -5.311149 | 1 |
| p3–7 (1145) | -5.297818 | 0 |
| p8–14 (1729) | -5.375887 | 0 |
| p15–22 (1903) | -5.391360 | 0 |
| p23–26 (1021) | -5.324067 | 0 |
| p27–32 (1433) | -5.339824 | 0 |
| p33–39 (1680) | -5.377479 | 0 |
| p40–53 (3008) | -5.418146 | 0 |
| p54–55 (308) | -5.147990 | 1 |

All 144 ordinary best outputs and 20 complete F-held best outputs are nonprose; best F-held score -4.973276 (p55). The 12 frozen p0-to-p1/2 ordinary continuations score at most -5.317460. No new reading. The same code exactly encrypts the 85 native p56 runes with consecutive prime-minus-one shifts and F-hold, and matches 95 clear p57 runes. Train on six other native records; withheld Loss of Divinity and p57 score -2.869597/-2.718692. For 48 hidden-phase plants from those withheld texts all 48 phases recover, all outputs replay, 39/48 plaintexts recover exactly (24/24 ordinary, 15/24 F-held), and 20,366/20,400 runes match. MAP ambiguity in the F-held receiver is real; this does not prove all reachable F histories nonlinguistic independently of the scoring model.

**Decision:** retire the six exact count-key forms with these clocks and phase freedoms. No new authenticated key, plaintext, or destination. No repaired counts or additional transformations without a new source-selected recipient. [CommonJS SFT](../sims/lp2_valete_whitespace_direct_receiver_sft.cjs) and [exact output](lp2-valete-whitespace-direct-receiver-output.json). Core ran in V8 against repository inputs; standalone Node wrapper not separately run.
