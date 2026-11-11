# External Cicada research repositories and historical archive

These are useful independent research and historical references. They are not authoritative proof of an LP2 solution; preserve the distinction between archived facts, community transcription, simulations, and hypotheses.

## pnotisdev/cicada3301

Repository: https://github.com/pnotisdev/cicada3301

A large, staged research notebook with a substantial catalogue of controlled tests and an explicit unresolved frontier. Its reported status is no verified LP2 plaintext. Use it to avoid repeating screened key-source and mechanism families.

Relevant material:

- [Source registry](https://github.com/pnotisdev/cicada3301/blob/main/docs/SOURCES.md) and [phase 31 book-code analysis](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase31_book_codes.md): the 2014 Gödel, Escher, Bach book code uses dialogue:speech:word:letter coordinates. The book is named by a preceding clue chain; this is not a reason to use GEB as an LP2 key without a comparable LP2 source cue.
- [Phase 57 mechanism model](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase57_mechanism.md): a candidate forward model combines a lag-six (T(x)=24-2x) collision repair (reported repair probability about 0.81) with a checked, uniformly valued word-null insertion (reported probability about 0.42). It fits a set of aggregate ciphertext statistics in the authors' simulations, but supplies neither an authentic key nor plaintext. Treat it as a competing explanatory model, not an established mechanism.
- [Phase 58 repeated-pair report](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase58_djubei_reuse.md): reports the two `DJU BEI` occurrences at offsets 6555 and 12950.
- [Phase 61 unrepair test](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase61_unrepair.md): naive replacement of detected lag-six sites loses information; a repair-aware likelihood improves planted-key simulations but does not recover a real key.
- The lag-six observation overlaps this repository's existing held-out analysis in `im-results/lag5-lag6-heldout-conditional-prediction.md`; use the external result as independent corroboration, not as a new discovery.

## cicada-solvers/neuroretransmit-cicada

Repository: https://github.com/cicada-solvers/neuroretransmit-cicada

A community historical archive of Cicada stages and artifacts. Particularly useful paths:

- [2014 stage 7](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/007-fifth-onion/README.md): the documented human solve path uses audio/OpenPuff to obtain magic squares, then OutGuess to extract a Gödel theorem equation, an Escher eye, and a Bach Trio Sonata excerpt. These identify Gödel, Escher, Bach; the subsequent book cipher uses dialogue:speech:word:letter coordinates. The source text is named before book-code extraction.
- [2014 stage 10 hidden-service reply](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/010-hidden-service-reply/README.md): preserves the reply and next onion-service address.
- [2014 stage 11 / Liber Primus](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/011-seventh-onion/README.md): documents the 58 LP2 pages 0–57, the totient-shift solution for page 56, the plaintext page 57, and the unresolved “An End” hash continuation.

The archive is a community reconstruction, not a substitute for checking original image/audio bytes. The 2014 GEB chain is a strong precedent for clue-constrained book ciphers: do not transplant its book or coordinate convention to LP2 without a corresponding source-selection clue.
