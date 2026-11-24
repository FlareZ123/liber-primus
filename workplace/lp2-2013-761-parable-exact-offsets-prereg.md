# p57 Parable-derived exact offsets into 2013 761.MP3 under R40-B3

**Status: preregistered, pending execution.** This is a narrowly bounded receiver test, not a claim that the four numbers are an authenticated instruction.

## Why these four positions

The solved LP2 p57 Parable and the original 2013 audio provide a small, player-visible numerical bridge. The original file is named 761.MP3; the source-native GP-prime sum of its title, THE INSTAR EMERGENCE, is 761. The original 2013 audio ID3 field gives the Parable value 1,595,277,641, whose three prime factors are 1031, 1229 and 1259. The source-native GP-prime sum of the audio title THE INSTAR EMERGENCE is 761. The same parable poem appears on solved LP2 p57. These four numbers are the complete frozen offset set:

**761, 1031, 1229, 1259**.

The hypothesis is that these values are literal zero-based byte offsets into the complete original MP3, including its ID3 tag. This offset interpretation is conjectural; the manuscript does not explicitly say to use these as byte offsets.

## Exact test

- Original audio: rtkd/iddqd commit f2267b0c2f1e1d2662806b90b9c3a2953b3a7023, 4,010,732 bytes, SHA-256 83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460.
- Decoder: Dukotah/cicada3301 commit f63501d8f2d835b80c30230eb89a1110fb9197d2, reusing its R40-B3 engine.py and pads.py, R37-I2 frozen pf_v4_12, R36 null12 POT bars and panel-R36 12-register beam.
- Target: original LP2 unknown stream U[:120] and U[:240] (p0 head), continuous stream, no page reset.
- Exactly 40 source streams: four offsets × five byte-to-symbol builders (mod29, prime_to_idx, hi_nibble, lo_nibble, byte_scaled) × forward/reverse byte order.
- Decode both signs and both fixed collision models (keyskip1, keyskip2): 80 candidates per relation.
- No atbash, no fitted phase, no extra offsets, no arbitrary key expansion. The full MP3 bytes are used; no PCM or spectral conversion.

The four offsets were absent from R40-B3's earlier 250,000-per-cell stride sample for 761.mp3. The existing R40-B3 COSPAD controls licensed all three registers across both relations: EN_MODERN 20/20, EN_NOVOWEL 19/20 and LATIN 19/20. In the skip split, EN_MODERN passed 11/11 skip-free and 9/9 with-skip; EN_NOVOWEL 10/10 and 9/10; LATIN 11/11 and 8/9. The new script also performs eight source-positive controls using the exact 761-offset mod29 forward key streams (one keyskip1 and one keyskip2 plant per offset).

## Decision rule

For each relation, there are 80 candidate decodes. Report the POT threshold at both the actual family size N=80 and the conservative declared N=10^6. A candidate is a strong hit only if it clears both the L=120 and L=240 N=10^6 thresholds. Report lower N=80 crossings separately; they are not sufficient to claim plaintext. If a candidate clears the L=120 threshold but not L=240, classify it as a near miss.

If all eight positive controls fail, the experiment is inconclusive and the original-cipher search must not be interpreted. If the controls pass and no candidate clears the conservative two-length gate, retire this exact literal-byte-offset family for the p0 continuous-head receiver. Do not rescue it by adding adjacent offsets, one-based variants, alternate file segments, new reducers, or new skip counts.

## Scope and limits

A negative result would reject only these four zero-based positions, five bytewise reductions, two directions, two signs and keyskip1/keyskip2 on the p0 continuous 120/240-rune receiver. It would not rule out a different page/line reset, a source-selected transform not tested here, a PCM/spectral receiver, or a different use of the 2013 audio. The purpose is to close a small, motivated gap in an earlier sampled search, not to claim a universal audio-key exclusion.
