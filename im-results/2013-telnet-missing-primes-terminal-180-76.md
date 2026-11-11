# 2013 telnet missing-prime interval versus the LP2 terminal 180/76 division

**Status:** a new, conditional cross-round source-size correspondence and a finite **negative** direct-key test. No recovered unknown plaintext, authenticated key, or cipher.

## A possible human solve path

A historical 2013 Cicada telnet transcript lists the primes through 71, resumes at 1229, and continues to 3301. The 20th prime is 71 and the 201st is 1229. Thus exactly **180 consecutive primes, with ordinals 21–200 and values 73–1223**, are omitted. This source has been described as an unresolved anomaly in historical community archives; the surviving transcript's completeness and whether the gap was intentional require independent historical confirmation.

- Community transcript: [Possible hints never used, “missing primes on telnet”](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/analysis/HINTS-NEVER-USED.md#missing-primes-on-telnet).
- Independent *later archive transcription*: [neuroretransmit's telnet README](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md#primes). Both preserve the identical 71→1229 gap and two doubled spaces. **The witness copies disagree on the final prime:** this README's displayed example ends at 3299, while the other includes 3301. Neither is an authenticated original-server byte recording; the selected 180 interval itself is consistent across copies. The SFT's prime list through 3301 is a local mathematical construction, independent of the inconsistent terminal endpoint.
- Independent historical description of the command: [The Telnet Prompt](https://uncovering-cicada.fandom.com/wiki/The_Telnet_Prompt). This page links to a historical pastebin record; it is not an independent authenticated transcript.
- The original LP2 printed numeral table has 32×8 = **256** cells. Its outer one-cell perimeter contains **76 = 2(32+8)−4** cells and the rectangular interior contains **180 = 30×6** cells.
- One independently noticed terminal composition is p53's 179 runes followed by the oversized p54 initial Ac (GP index24), making **180**, while p55 has exactly **76** runes. **A competing and independently established framing also has 180:** the 85 solved runes of p56 followed by the 95 clear runes of p57. Both alternatives are documented in [the existing circumference research](terminal-grid-circumference-knownplain-gate.md). No source instruction chooses between them.
- Restricting the historical prime list to the **first 256 primes** creates another exact split: the missing ordinals 21–200 contain 180 primes, and the visible ordinals 1–20 plus 201–256 contain 20+56=**76** primes.

This gives a concrete, if retrospective, possible assignment: **omitted 2013 primes ↔ terminal interior**, **visible early primes ↔ p55 perimeter**. A solver could in principle make both connections from player-visible source numbers, if the historical transcript is authentic. The selection of the first 256 primes is motivated by the table only after seeing both artifacts, and the geometric-to-rune assignment was already under investigation before the telnet connection. These are independent source lengths, not independent evidence that Cicada designed the link.

## A separate 2013 anchor: the PARABLE number's prime factors

A distinct historical item makes the telnet omission worth investigating without adding speculative ciphers. The archived **2013 Cicada OS `AUDIO/761.MP3`** has an ID3 `Parable` number **1,595,277,641**, which independently equals the product of the **three prime-weight clause sums** of the later solved p57 PARABLE body. This identity was established before this investigation; see the [public pnotisdev analysis](https://github.com/pnotisdev/cicada3301/blob/main/STATUS.md) and [existing 2013 telnet/Parable SFT](../sims/cicada2013_parable_reversal_ring_sft.cjs). The novel question here is how those already anchored primes intersect the historically omitted interval.

| Solved p57 clause | GP prime-weight sum | Prime ordinal | In 2013 telnet omitted interval? |
| --- | ---: | ---: | --- |
| Red heading PARABLE | 449 | 87 | Yes |
| Body clause 1 | 1,259 | 205 | No |
| Body clause 2 | 1,031 | 173 | Yes |
| Body clause 3 | **1,229** | **201** | **No: first displayed after gap** |

Exactly **1,259 × 1,031 × 1,229 = 1,595,277,641**. Consequently, a solver possessing only the 2013 audio metadata and the prime list could reconstruct the omitted factor directly: **1,595,277,641 ÷ (1,229 × 1,259) = 1,031 exactly**. Both divisors are among the first five printed primes after the telnet gap (positions first and fifth). The quotient 1,031 is prime and absent from the list, so this is a finite, checkable historical source-to-source recovery; it still does not decode any unknown LP2 rune. The telnet source resumes at 1,229, making one independently documented 2013 audio factor the **first surviving prime immediately after the 180-prime omission**. The next factor 1,259 is the fifth prime printed after the gap, and 1,031 lies inside it. The heading 449 also lies in the gap. These are original source-number intersections, now asserted in the [reproducer](../sims/lp2_telnet_prime_gap_terminal_sft.cjs). The interval could have drawn attention to the prior Parable factors, but no surviving instruction demonstrates this was Cicada's intention. The relationship does not determine an order, key, numeral encoding or reversible map on unknown LP2 ciphertext. Its strongest objection remains historical post-selection: the factor identities and the missing-prime interval were separately investigated before their intersection was noticed.

**Decision:** This overlap is a more causal clue to examine than an arbitrary 180-number list. A useful successor would establish whether contemporary puzzle participants noticed an explicitly player-visible instruction to use the missing prime interval with the already supplied 2013 Parable number. Absent that, do not turn the 1,229 boundary coincidence into new additive-state parameter scans.

## Exact limited decryption test

The reproducible [SFT](../sims/lp2_telnet_prime_gap_terminal_sft.cjs) constructs the 464 primes through 3301 and enforces the original boundaries. It extracts unchanged GP indices from [the canonical corpus](../resources/liber-primus/lp2-corpus.json):

- Interior ciphertext = p53[0..178] concatenated with p54[0], length 180.
- Exterior ciphertext = p55[0..75], length 76.
- Interior key = primes 21–200 in ordinary ascending order.
- Exterior key = primes 1–20 followed by 201–256, in historical reading order.

For each region, the *complete, predeclared direct key family* comprises prime value or φ(prime)=prime−1, forward or reversed order, and GP29 add/subtract. These are 8 interpretations per region, **16** original-input tests altogether. The operation is a hypothesis; the historical telnet source does not instruct the solver to use GP29 addition or subtraction. No fitted spaces, column order, crib shift, second layer, or keyed selection was allowed.

**Results of original-input execution:**

| Original region | Original IoC | Range of decoded IoC, 8 cases | Result |
| --- | ---: | ---: | --- |
| p53 + p54[0], 180 runes | 0.03333333 | 0.03370577–0.03656114 | No coherent GP plaintext |
| p55, 76 runes | 0.03789474 | 0.03052632–0.03789474 | No coherent GP plaintext |

All 16 variants preserve the full original rune array under exact forward reencryption. Native-GP plants from cyclic repetitions of the *already solved* p57 runes recover every rune with the same fixed keys, confirming arithmetic reversibility; these are implementation controls, not evidence of the historical mechanism. As a descriptive reference, the 95-rune genuine plaintext p57 has IoC **0.06270997**, but this is a different-sized sample and must not be interpreted as a calibrated p-value.

**Important false-positive trap:** one reversed, totient, additive p55 transliteration begins with the Latin string `SPONGEO...`. Its actual first five GP rune tokens are **S · P · O · NG · EO**, so the apparent substring `SPONGE` is produced by cutting the one-rune **EO** digraph. It is **not** the rune spelling of the word SPONGE, not a plaintext crib, and the remainder is nonlinguistic. The SFT records full rune-index outputs to prevent this ambiguity.

## Competing 180-rune framing: exact known-plaintext disconfirmation

The 180-cell table interior can also represent **p56+p57**, rather than p53+p54[0]. This alternate interpretation is especially valuable because the plaintext is known: p56's historically solved 85 GP runes and p57's 95 plainly printed runes. The [same SFT](../sims/lp2_telnet_prime_gap_terminal_sft.cjs) calculates the exact GP29 encryption shifts required at every one of those 180 original positions. The same eight direct prime/totient, forward/reverse, add/subtract interpretations are then compared to those required shifts *without language scoring*.

| Prime-key reducer / direction | Matches of 85 solved p56 rune shifts (best sign) | Matches of 95 clear p57 rune shifts |
| --- | ---: | ---: |
| Prime, ascending | 3 | 0 |
| Prime, reversed | 8 | 0 |
| φ(prime), ascending | 5 | 2 |
| φ(prime), reversed | 2 | 3 |

The eight sign-specific totals range from **2 to 8 of 180 exact required shifts**; no direct GP29 prime-gap pad reproduces this known 180-rune control. This rejects only a pad that is also supposed to explain *both* historically solved pages with the same direct arithmetic. It does not exclude a distinct cipher on the unsolved terminal pages or a different role for the prime interval.

## Independent printed-table numeric check

A separate, language-free source check asks whether the same split has an obvious **bytewise** correspondence with the printed table itself. Freeze the table's natural 30×6 interior row-major reading and the standard outer ring clockwise from the upper-left corner. Compare those 180 and 76 base60-decoded byte values with the two historical prime sets reduced mod256, using either the prime or its φ(prime)=prime−1. There is no fitted rotation or optimized correspondence.

| Original table region versus source key | Equality count | Pearson r |
| --- | ---: | ---: |
| Interior versus missing primes mod256 | 1/180 | −0.09733 |
| Interior versus missing φ(prime) mod256 | 4/180 | −0.09733 |
| Exterior versus visible primes mod256 | 0/76 | +0.10812 |
| Exterior versus visible φ(prime) mod256 | 0/76 | +0.10812 |

The 1, 4, 0 and 0 coincidences are consistent with unrelated bytes under this direct interpretation. This specifically fails to corroborate a literal prime-valued byte table. The historical base59 numeral-codec ambiguity does not provide a reason to optimize the byte interpretation after this negative result.

## Historically motivated native-byte XOR, exact full-grid test

The 2013 Cicada onion `clue` was decrypted by **XOR against an explicitly supplied historical file** (`_560.00`), so XOR is an actual creator-used operation rather than a cipher family imported without a puzzle precedent. The 180/76 mapping also naturally describes the **256 printed table byte cells**, independently of any runic message assignment. This selects one additional bounded experiment: place the omitted 180 primes in the **30×6 table interior row-major**, place the visible first-256-prime complement on the **perimeter clockwise starting upper-left**, reduce every prime modulo 256, and XOR each original byte with its assigned key byte. The table is read in its printed, unpermuted row-major order. See [SFT](../sims/lp2_telnet_prime_gap_terminal_sft.cjs).

Of the original **256** printed source bytes, **103** are printable ASCII (0x20–0x7E). After the source-locked XOR, only **89** are printable ASCII, with **54** letters or spaces, four spaces and one NUL. The recovered first 95 bytes rendered with nonprintables as `.` begin:

`....j.o......e..4.dL...J$O&.....4.h...D ....9."e.......{.{.Ps.Y.Q......Y......[i.A.D ..|..c.]..`

No English plaintext, file signature, or recognizable contiguous message appears in the full original output. The source program prints all 256 recovered bytes as hex for independent assessment, exactly re-XORs to the original bytes, and recovers a constructed 256-byte ASCII plant under the same frozen key and layout. This **rules out the single literal native-byte XOR** interpretation of this source mapping as ordinary uncompressed English, not compressed/encrypted/multilayer data and not an arbitrary other perimeter order. The source-linked prime list still lacks a creator-authenticated instruction selecting this mapping, so there is no reason to multiply variants.

## A separate creator-used operator: decimal prime reversal

The same 2013 terminal supplied `NUMBER`, which **reverses decimal digits** of a prime before factoring the reversed integer (for example, `449` gives `944`). This independently documented historical primitive selects one additional literal test. The [SFT](../sims/lp2_telnet_prime_gap_terminal_sft.cjs) reverses each omitted/visible prime's decimal digits, preserves original source order, and subtracts its residue modulo29 from the exact 180- and 76-rune terminal ciphertext; it separately XORs its residue modulo256 with the byte table under the previously frozen layout. **180-rune IoC is 0.03513346**, **76-rune IoC is 0.03228070**, and both full GP rune sequences are nonlinguistic. The reversed-prime byte XOR yields **101 printable bytes out of 256** without a coherent ASCII instruction. All outputs round-trip exactly. The creator never instructed a 2014 solver to apply prime digit reversal to this omitted interval, so these finite tests establish a negative at their literal scope and warrant no extension into arbitrary number transforms.

## What would change the decision

The historic prime-gap interval is a more specific cross-round starting point than another arbitrary 180-number list; its most direct additive uses fail. It should **not** be used to launch permutations, cyclic offsets, multi-layer transformations, or a general prime-pad sweep. The valuable next evidence would be either a truly original 2013 telnet transcript or source-code capture establishing intentional omission, or a historically visible instruction selecting a **specific reversible mapping** from the prime interval and table interior/perimeter to runes. Freeze such a map before looking at original plaintext; use a solved historical control and a distinct original holdout. Until then this remains a provisional source clue with no decrypted text.
