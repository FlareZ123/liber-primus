# p50 interior180 → p55 perimeter: timestamped Python MT known-plaintext gate

**15 November 2026, Agent 10. A bounded original-input negative with an exact blind positive plant.** No new Liber Primus plaintext, authentic seed, original inverse, or destination recovered.

## A route that could have decrypted p55

The printed 32×8 table on LP2 pp49–51 contains 256 conditional BASE60-decoded bytes. The one-cell rectangular border contains **76 cells**, exactly the original unknown p55 rune length; the natural row-major 30×6 interior contains **180 cells**, exactly the independently known 85-rune p56 solved plaintext plus 95-rune p57 clear plaintext. Solved p57 says to shed our circumferences. One literal interpretation would fill the table with an original 256-rune record and hide that record behind an 8-bit random pad. The 180 known inner runes could identify a deterministic pad and, decisively, recover all 76 unknown outer runes.

The candidate is Python 2014-era random.Random with a seed that is an **integer UTC second** from **25 April through 9 May 2014 inclusive**, 1,296,000 seconds. Three historical Python-standard byte consumers are getrandbits(8), randrange(256), and int(random()*256). The three reversible byte masks are XOR, addition mod256, and subtraction mod256. We also grant the independently source-known alternative of using **printed p56 ciphertext** instead of **solved p56 plaintext**, always followed by 95 original p57 clear runes. This makes **18 specified source-register/mask models per seed**. No key, phase, salt, language score or original p55 value is fitted.

**Weakest premise:** Nothing authenticated by Cicada specifies Python's ordinary MT generator, a timestamp seed, a byte mask or the interior-to-ending-text alignment. The 2013 signed RAND command is described as cryptographic randomness, so it is not evidence for this generator. The source geometry makes this a constrained recovery experiment, not a claim about how the book was made.

## Original known-plaintext inversion and result

The first two core cells are at original row-major byte positions **9 and 10**; the next four are **11–14**. For every seed and each of the six p56-register/mask variants in a generator method, require exact agreement with source-derived known key bytes at each of those positions, without selecting an offset. If any seed matched all 180 original known symbols, the identical 256-byte PRNG stream would decode p55's border.

| Method | First two known bytes matched | First three matched | Four or more matched |
| --- | ---: | ---: | ---: |
| getrandbits(8) | 112 | 1 | **0** |
| randrange(256) | 129 | 1 | **0** |
| int(random()*256) | 115 | 1 | **0** |
| **Total, 18 models** | **356** | **3** | **0** |

There are **23,328,000** seed × model comparisons. Zero original candidate survives four independent source-known bytes, so none can recover p55 under the fixed mechanism. The three matches of exactly three bytes do not represent decrypted text.

**Real blind recovery control:** Generate an independent 256-rune native-GP source record on the same original 76-border/180-core geometry. Plant its complete byte mask using an unannounced-to-the-search 2014-window timestamp seed, with the 180 known inner symbols equal to the authentic p56 solved text and p57 clear text and the 76 hidden border symbols taken from independently clear p57. The same full 1,296,000-seed getrandbits/XOR search recovers **exactly the hidden seed**, validates **180/180 inner symbols**, and deciphers **76/76 withheld border runes**. This demonstrates the recovery pipeline's ability to obtain plaintext if the proposed mechanism actually generated the original table.

## Scope, reproduction, and next decision

This excludes only the tested 2014 UTC-second Python-MT stream, exact interior placement and three byte operations under the two source-known p56 registers. It does not exclude CSPRNGs, a different true key or register, independently generated non-timestamp seeds, nonlinear processing, or other source-selected table geometry. Do not enlarge the model by guessing offsets or time windows without a new authorial clue.

Single read-only dependency-free Python 3.12 SFT: [sims/lp2_p50_inner180_2014_python_mt_knownstream_sft.py](../sims/lp2_p50_inner180_2014_python_mt_knownstream_sft.py). It checks the canonical table SHA-256 and the 85+95 genuine known-rune control before testing the original source, asserts all 18 result counts and the blind planted recovery, and makes no file writes. [Passing original-input Windows run 43656479529](https://github.com/FlareZ123/liber-primus/actions/runs/43656479529).

**Next actionable route:** identify a contemporaneously authored source specifying a byte-level operation or actual entropy source. The 76+180 equality alone cannot choose a decoder, and additional unconstrained key schedules would offer no causal progress.
