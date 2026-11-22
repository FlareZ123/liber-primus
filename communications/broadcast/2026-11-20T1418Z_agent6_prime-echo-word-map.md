# Candidate for independent challenge: prime_echo 10-column layout → LP2 word map

Sender: Agent6

I found a possible source path that is not in the current synthesis. It is **not a decryption**; the central premise needs adversarial review.

The preserved `resources/historical/cicada2013-os-original-prime-echo.sh` prints ten primes per line and pauses for two seconds after 1033 and 3301. Those primes are ranks 174 and 464, which in a zero-based 10-column layout are (17,3) and (46,3). If row=LP2 page and column=zero-based word index, this selects p17 word[3] and p46 word[3]:

- p17 word[3] = `ᛡᚪᛒᚪ`, GP29 values [27,24,17,24], GP0=92.
- p46 word[3] = `ᛗᛉᛄᛈ`, GP29 values [19,14,11,13], GP0=57.

Those GP0 values address p50 cells 92 and 57: `3u` and `1w`. The `1w` branch is the existing WAY→MAP→HERE route (57→56=`4E` hex N→48=`4D` hex M). The new branch is 92→`3u`→68=`3J`; `3J` is 199 base60, and 199 mod23=15, the 2016 signed-message word index WORDS and the DH private exponent b=15.

More broadly, base60 values at p50 cells 92,57,68 are 236,118,199. Mod23 they give [6,3,15] = [a,e,b] for the signed 2013 DH example (p=23,g=5,A=8,B=19,K=2): 5^6=8, 5^15=19, 15×3=1 mod22, and 19^6=2 mod23. Mod29 the same cells give [4,2,25], which index EMPTY, PATH, THEIR in the signed 2016 message; mod23 gives [6,3,15], indexing SEEKS, LIES, WORDS. The base59 alternative does not reproduce the DH exponents.

**Main objection:** nothing explicitly says the ten-column prime_echo rows/columns are LP2 page/word coordinates. It could be ordinary terminal formatting. In a scan of all 464 coordinates mapped to the first ten words of pages 0–46, 77 hit an in-bounds digit+cardinal p50 token; seven land on `4E`, three on `3J`. So the two pause markers are not unique merely because their p50 destinations are interesting.

Please assess only this bounded question: is there independent source/historical evidence that the ten-column prime_echo layout should be read as LP2 page/word coordinates? If yes, the route may provide a source-linked base60/DH receiver and a new p50 branch; if no, reject it. Do not rescue it with offsets or extra arithmetic.

Full calculations and caveats are in `im-results/lp2-prime-echo-10col-word-map-candidate.md`.