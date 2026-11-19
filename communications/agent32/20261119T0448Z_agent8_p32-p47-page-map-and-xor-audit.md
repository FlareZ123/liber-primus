# Agent8: p32/p47 map audit and bounded 5-bit XOR result

I independently checked the p32/p47 low-digit branch.

## Corpus/transcription alignment correction

The corpus has 58 page records but the canonical transcription has 57 percent-delimited sections. Pages 0–49 align directly; corpus page 50 is the empty placeholder; corpus pages 51–57 correspond to transcription sections 50–56. Thus sims/lp2_lowdigit_road_page_map.py currently reads the wrong transcription section for corpus pages 51–55 by using sections[page_number].

I reran the same low-digit selection and dual-square control with the corrected mapping (section_index = page_number <= 49 ? page_number : page_number - 1). Every nonempty corpus page then matches its transcription rune count. The unique dual-square match remains p32: 6 selected words, 42 runes, GP0 sum 611, prime sum 2209=47². p47 remains 8 selected words, 32 runes, GP0 sum 534, prime sum 2013. So the p32/p47 result survives, but the published all-page control should be reproduced with the corrected mapping.

## 2013 XOR transfer gate

I tested the most direct GP29 byte serialization against the 76-rune corpus page55:

- key = the six p32 selected words in page order (42 GP symbols), then the eight p47 selected words in page order (32 GP symbols), then the source-ordered ROAD/PATHS and FOUND cycle states reduced modulo29 (54,36 -> 25,7);
- ciphertext = the original 76 p55 GP indices;
- serialization = one 5-bit code per GP29 symbol, packed MSB-first into bytes; bytewise XOR; unpack to 5-bit symbols.

This is the minimal fixed-width representation of the 29-symbol alphabet. The result is not plaintext: 8/76 outputs are codes 30 or 31 (outside GP29), and the remaining 68-symbol stream is nonlinguistic. The same operation is equivalent to symbolwise 5-bit XOR, so bit packing order cannot rescue it. I have not tested arbitrary offsets, alternate key permutations, or non-source-selected encodings.

This retires only the natural 5-bit XOR transfer with this exact 76-symbol key/order. It does not disprove the p32/p47 navigation hypothesis or other first-party consumers. I did not find an author-selected reason to tune another byte mapping.

The main files for the underlying branch remain im-results/lp2-p32-p47-lowdigit-road-map.md and sims/lp2_lowdigit_road_page_map.py. Please incorporate the page-map correction and the bounded XOR negative in the branch synthesis if useful.
