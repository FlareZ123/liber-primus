# Recursive “shed circumferences” to word cores: direct LP2 readout

**11 November 2026, Agent21. Source-motivated independent experiment, no unknown plaintext/key recovered.** Distinct from completed Director #343, which removes only the *first* rune pair from each word, this experiment recursively sheds **every pair of outer runes** from each complete printed word until only one central rune remains for odd-length words or two central runes for even-length words. This more literal “shed OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN” interpretation is a possible human-solver cue from the independently solved p57 PARABLE. It has no independently selected cryptographic operator beyond literal peeling.

**Fixed input:** original LP2 physical pp0–55, 12,956 canonical GP29 runes in 2,896 complete source-printed words. Original rune transcription Git blob SHA-1 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7. Hyphen, period, ampersand, dollar sign and section mark delimit words; line and page breaks never do. Verified cross-page carries p31→32 and p54→55 are preserved. Nine body boundaries at original rune offsets [0,729,1874,3612,5506,6527,7960,8051,9640,12956] are likewise preserved. There is exactly **one** possible center when retaining both even-word central runes. No alternative tie rule, key, reversal, shift or missing-symbol restoration was tested.

**Direct output:**

| Stream | GP rune count | Index of coincidence |
| --- | ---: | ---: |
| All word centers concatenated in original word order | **4,342** | **0.03441238** |
| Odd-word single central glyphs | 1,450 | 0.03438947 |
| Even-word two central glyphs | 2,892 | 0.03440280 |
| Solved p57 source-text word centers under same operation | 33 | **0.07765152** |

Source-defined nine-section center lengths are **[237,387,574,658,337,479,35,525,1110]**. Each of their GP29 symbol frequency IoCs lies in **[0.02521,0.03503]**, including the very short 35-rune unit. In original order, the unknown core stream begins in unpunctuated GP→Latin transliteration: OGEJGJNSGBNBJNGYDFXUYHBUOAEXNGINGHEOHAEXYUFJTHPNGNEXNGX. The directly comparable *solved p57* core stream transliterates: AICTHESTNTOTHEFWEUSHEUWFEINTHEINTHNER. Thus the source-relevant positive control retains fragments recognizable as the solved English GP vocabulary, while the unknown entire core and the nine independent units remain effectively uniform and yield no readable instruction.

The alternative complete center streams, original positions, and **every recursively removed outer ring** are deterministically available from [the self-contained source SFT](../sims/lp2_recursive_word_core_sft.cjs). The SFT asserts all center counts, nine unit lengths, source blob fingerprint and exact **2,896/2,896 original-word reconstruction** from retained outer layers. This establishes implementation accuracy, not an original-cipher inverse. A ring-removal transformation alone is information losing; its reverse requires the entire discarded exterior sequence. The SFT writes no files and emits SHA-256 for independently identifying its computed streams.

**Research decision:** The uniquely determined recursive outer-pair peeling gives no directly readable plaintext or key. Retire this **direct word-core instruction** route without treating all conceivable geometric/page/text interpretations of “circumference” as excluded. Since a further unmotivated rotation or keyed substitution would make the result arbitrarily flexible, no additional key search follows absent an independently authenticated selector.
