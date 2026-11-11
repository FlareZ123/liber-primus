# 2012 chorus as a base-56 LP2 word map

**Disposition: negative for the proposed page-permutation / interior-extraction route.** The 2012 chorus supplies a source-native 56-word sequence, but the tested coordinate rule does not produce a page permutation or plaintext.

## Why test it

The archived 2012 MIDI puzzle gives the instruction “Let the Chorus be your guide to the depths.” Its decoded chorus has 56 words, matching the 56 unsolved LP2 pages (0–55). The 2013 server's COUNT operation supplies Gematria Primus prime-weight word sums; the authenticated 2016 message says “Its words are the map, their meaning is the road, and their numbers are the direction”; and solved LP2 page 57 says to shed circumferences and find what is within.

A plausible, fixed human-solver hypothesis is therefore:

1. For each of the 56 chorus words, encode its letters in GP29 and sum the corresponding prime weights, producing S.
2. Address LP2 page S mod 56 and its printed-word index floor(S/56).
3. Remove the first and last rune of each selected printed word and concatenate the interiors in chorus order.

The base-56 coordinate rule is an inference, not an instruction explicitly preserved in the sources. It is tested once, with no phase or modulus search.

## Exact source handling

- Chorus text: the source text between BEGIN SOURCE TEXT and END SOURCE TEXT in resources/control/cicada2012_blake_chorus.txt. The archived spelling variants “letchery” and “every thing” are preserved.
- Target: printed rune words on LP2 pages 0–55, parsed with the same printed delimiters and line-wrap handling used by the established 2016 word-map script. Page 50 is the numerical table and has no rune words.
- GP29 encoding: the canonical corpus transliteration, with V→U, K→C, Z→S normalization; each rune contributes its repository prime weight.
- Address: page = S mod 56; zero-based word index = floor(S/56).
- Readout: strict interior of each selected word, in source chorus order.

## Results

- Source words: **56**.
- Addresses landing on rune-bearing printed words: **55/56**.
- Distinct pages addressed: **34**, not 56. Thirteen page indices repeat; 22 pages are never visited. This is not a page permutation.
- The maximum selected word index is 8, while every rune-bearing page has at least 17 printed words. Thus the 55/56 in-bounds rate is automatic for every address except the single page-50 hit; it is not evidence of a successful map.
- The one invalid address is the chorus word **note**: GP29 prime sum 162 gives page 50, word index 2. That points to the third p50 table cell, token 3L / value 201, rather than a rune word.
- The strict interiors yield **154 runes**, beginning:

      EDSDCEANCTHGCWAEGDCEANCTHEAWAEGSEANGXPNGTIAPXIWMCEALAEANTHAENTHENUIAEIUDCEANCTHAEBEOWAEGTHENUIAEIUIIALXBBNJCHJRHTHENUIAEIUNGGDCEANCTHOEGYCTHCAJEOEAEANTHAEDCEANCTHPIEWBASOEEOINGWTHHLJLLAULNAGEONGTHBIRU

  This is not readable plaintext. The full selected-word stream is also non-linguistic.

## One cross-source observation, not a result

The 2016 signed-message base-58 word-map report independently records the word **lies** at p50 cell index 3 (token 3D / value 193). The 2012 base-56 experiment sends **note** to the immediately preceding p50 cell index 2 (token 3L / value 201). Also, the 2012 word **with** maps to p55's first one-rune printed fragment, NG.

These are reproducible addresses, but they do not validate the inferred base-56 rule: the page mapping is not a permutation, its in-bounds rate is automatic, and the extracted interiors do not decode. Preserve the adjacent p50-cell observation as an unresolved coincidence; do not promote it into a key or launch more modulus/phase searches without an independent source instruction.

## Conclusion

Reject this exact 56-word base-56 page-map and strict-interior readout as a decryption route. The separate 238-character 2012-chorus / p36 length correspondence remains a different hypothesis and is not reassessed here.

## Reproduction

Run from the repository root:

    node sims/lp2-2012-chorus-base56-wordmap-gate.cjs

The script asserts the 56-word source, fixed page/word formula, p50 cell values, and the output counts, then prints every source word, prime sum, address, selected word, and interior.
