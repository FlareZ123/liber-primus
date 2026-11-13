# LP2 red-channel 13/16 repeat-filter parameter gate

**Status:** provisional source-to-cipher parameter match; no plaintext, key or intended destination recovered.

## Source-derived counts

The local canonical corpus and image annotations give the following counts on the unsolved LP2 pages p0–55:

- 12,956 GP29 runes, 12,901 within-page adjacent transitions and **86** equal adjacent pairs.
- **16** annotated red-rune spans. The original-image dropcap census identifies **13** dropcap positions, each at the start of one of those 16 spans. The three spans without a dropcap are p7@194, p15@9 and p53@128.
- The 13 dropcap runes in canonical order are GP indices [15,20,13,24,14,20,1,19,23,21,27,0,24], transliterated **SLPAXLUMDNGIAFA**.
- A separate red punctuation channel contains 30 large 13/10-dot marks on p0–55: 27 thirteen-dot marks and three ten-dot marks. Reading 13 dots as 1 and 10 dots as 0 gives 111111111111111111111001110111. This 30-bit channel is distinct from the 13/16 red-span ratio.

The 13/16 relationship is reproducible from the local ink annotations plus the original-image [red-ink census](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/P1-red-ink/channel.json). The 16-span count is local to p0–55; the full LP2 annotation has additional red spans on solved p56–57.

## Conditional soft-filter fit

Use the soft geometric key-skip model already investigated in [the anti-repeat identifiability gate](lp2-anti-repeat-lossless-capacity.md#key-skip-and-output-rewrite-are-not-identifiable-from-ciphertext):

- A raw independent uniform GP29 candidate repeats the preceding ciphertext rune with probability q=1/29.
- Conditional on such a repeat, the candidate is rejected with probability s, a new key draw is consumed, and the process retries.
- The probability that an emitted ciphertext rune is a repeat is r(s)=q(1-s)/(1-qs), with fitted value sHat=(q-r)/(q(1-r)).

For the 12,901 within-page transitions, k=86:

| Quantity | Value |
|---|---:|
| Fitted suppression probability sHat | 0.812095 |
| Approximate 95% delta-method interval | 0.772248–0.851942 |
| Source-selected candidate 13/16 | 0.812500 |
| Repeats predicted by s=13/16 | 85.816 |
| Log-likelihood difference from fitted value | −0.000199 nats |

If page joins are retained in the flattened stream, there are 12,955 transitions and still 86 repeats: sHat=0.812884, the approximate interval is 0.773204–0.852563, and s=13/16 predicts 86.175 repeats (log-likelihood difference −0.000179 nats).

Thus the source ratio is strikingly compatible with the independently measured filter rate. It is **not** statistically discriminating: the confidence interval is broad and the likelihood difference is negligible. Its value is that 13/16 is selected by an independently visible manuscript count rather than fitted freely.

## Bounded direct key/seed tests

The 13/16 parameter was used as the rejection probability in the most direct source-derived constructions. Tests used the first 2,000 original unknown runes, both additive signs, and a language-scored beam with maximum three consecutive rejected candidates. The exact same-stream decoder was separately planted and recovered synthetic plaintext exactly.

| Source material | Construction tested | Result |
|---|---|---|
| 30-bit red-dot stream | Forward, reverse, complement and reverse-complement integer seeds for Perl 5.14 drand48; int(rand(29)) key values | Rigid and independent-filter key-skip beams remain nonlinguistic; interleaved key/coin model has no valid path |
| 30-bit red-dot stream | Perl int(rand(32)) with rejection of 29–31 | No English-like key-skip path |
| 30-bit red-dot stream | CPython 2.7 MT integer seeds and Python-2 string-hash seeds (32- and 64-bit) | Interleaved 13/16 filter model has no valid path |
| 30-bit red-dot stream | glibc rand() with %29 and scaled-to-29 reductions | Interleaved model has no valid path; independent key-skip beam is nonlinguistic |
| 13 dropcap runes | Periodic GP29 additive key, all 13 phases and both signs | No English-like output |
| 13 dropcap runes | Base-29 integer seed, Python-2 string seed, and low-32-bit Perl/C seeds | No valid interleaved path or English-like independent-filter output |
| 13 dropcap runes | 13 GP values as an RC4 key; key bytes %29, filter bytes %16 < 13 | No valid path |
| 30-bit red-dot stream | Four packed big-endian 4-byte RC4 keys; same %29/%16 use | No valid path |

The base-29 value of the 13 dropcap indices is 5557056658381120813 (low 32 bits 2542183725). The four dot-stream integer variants are forward 1073741431, reverse 1000341503, complement 392, and reverse-complement 73400320.

These are exclusions of the listed direct constructions, not an exhaustive rejection of every possible PRNG, hash, stream cipher or use of red positions. The MT implementation was checked against standard Python random vectors; the glibc generator against its standard seed-1 sequence; planted drand48 and RC4 same-stream controls recovered exactly. The existing external full 32-bit Python-MT pair-relation sweep also covers direct 32-bit integer-seed key streams; this investigation adds the source-selected interleaved 13/16 coin model and the dropcap-derived seed forms.

## Research decision

Retain **13/16 as a provisional source-selected rejection parameter** for future tests of a separately sourced keystream. Do not promote it to an established cipher mechanism, and do not continue generic seed hunting from the 30-bit dots or 13 dropcaps: the obvious direct uses tested here fail.

The next productive question is whether an independently authenticated key source can be tested under this fixed filter parameter, or whether the three non-dropcap spans have an original-image-supported selector/reset role. Any such test must predict plaintext on original ciphertext without fitting its key, phase or reset positions after seeing the output.

## Reproduction

Run from the repository root:

~~~bash
node sims/lp2_red1316_filter_parameter_sft.cjs
~~~

The SFT recomputes the original corpus transition counts, red-span/dropcap alignment, 30-bit red-dot stream, base-29 dropcap seed and both filter-fit calculations.

## Sources

- Local original-derived inputs: resources/liber-primus/lp2-corpus.json, resources/liber-primus/lp2-ink-annotations.json.
- Local red-channel audit: [lp2-red-ink-channel-audit.md](lp2-red-ink-channel-audit.md).
- Original-image dropcap census: [P1-red-ink/channel.json](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/P1-red-ink/channel.json) and [results](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/P1-red-ink/RESULTS.md).
- Existing filter model: [lp2-anti-repeat-lossless-capacity.md](lp2-anti-repeat-lossless-capacity.md).
