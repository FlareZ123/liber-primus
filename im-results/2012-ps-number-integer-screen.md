# 2012 Valete P.S. integer: source correction and bounded LP2 screen

## Decision

The authentic 2012 P.S. integer is a 131-digit, 432-bit number with a published factorization into two 216-bit primes. A later research status labels the P.S. object a 435-bit modulus; exact parsing of the original signed message gives 432 bits. The same 2012 archive also contains a matching recreated Crypt::RSA public/private key pair, so the RSA reconstruction is not merely inferred from the factorization. Appending an accidental trailing `1` would create a different 132-digit, 436-bit integer, not the source value.

The original vjuNp.jpg display and the OutGuess clear-signed output establish a source-authenticated 3 × 46 character block when the literal `P.S. ` prefix and two continuation backslashes are retained. GnuPG verifies the P.S. digits and line arrangement under the archived Cicada key; a quarter-turn reads the Cicada marker 3301/1033. This corrects the earlier digits-only 40/45/46 treatment, but it does not supply an LP2 receiver or key schedule; see [the source-selector decision](2012-signed-ps-original-selector-2014-link-gate.md).

The P.S. integer has a matching community-recreated RSA public/private key pair in the 2012 archive, but it is **not** the 2014 Stage 2 RSA modulus. Its direct base-29 representations and the obvious RSA-derived values do not decrypt LP2 under an additive/subtractive running-key model. Treat it as a solved historical RSA side-object with no established LP2 role. Do not expand this into unconstrained exponent or key-family searches without a specific ciphertext or source instruction.

## Exact source value and factorization

The 2012 signed *Valēte!* message gives:

```text
10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631
```

Published factors:

```text
p = 99554414790940424414351515490472769096534141749790794321708050837
q = 104593961812606247801193807142122161186583731774511103180935025763
```

Checks:
- (p q=N) exactly.
- (N) has 131 decimal digits and 432 bits.
- Both factors have 216 bits and are prime (the published factorization is reproduced in the cited reference).
- Appending one extra `1` changes the integer to 132 digits and 436 bits.

The signed *Valēte!* message itself prints only N. The same 2012 archive also contains `numbers.public`, `numbers.private`, and `numbers.factors`: the public key lists the exact modulus and e=65537; the private key lists matching p, q, phi, and d in a Crypt::RSA 1.99 object (`Checked=1`). The stored d matches `pow(65537, -1, phi)`. This establishes a reproducible community RSA key reconstruction for N, but not the intended use of that key in LP2 or later rounds.

## Discriminating cross-round checks

### Not the 2014 Stage 2 modulus

The modulus in the 2014 Stage 2 signed payload is:

```text
7557912574608535164426718292058021255641310207187633095795069445700059210248050757270234679993673844203148013173091173786572116639
```

It is also 432 bits, but has 130 decimal digits and is a different integer; (gcd(N,N_{2014})=1). The 2012 factors therefore do not factor or unlock the 2014 Stage 2 modulus.

### 2013 cookie values as RSA ciphertexts

Using the published 2013 cookie values labelled `167` and `761` as integers and the reconstructed private exponent from `numbers.private`, decryption gives two fixed-width 54-byte blocks beginning `0cff` and `4b10`, respectively. Neither has the required `00 02` PKCS#1 v1.5 type-2 prefix or recognizable plaintext. This excludes only direct PKCS#1 v1.5 type-2 decryption of these two candidates under the reconstructed key; their original role remains unknown.

### Crypt::RSA 1.99 default schemes

The archived private key is a `Crypt::RSA 1.99` object. Its module documentation explicitly sets the default encryption scheme to OAEP and the default signature scheme to PSS; PKCS#1 v1.5 encryption and signatures are opt-ins. The OAEP defaults are SHA-1, MGF1-SHA1, and an empty label. The PSS defaults are SHA-1, MGF1-SHA1, a 20-byte salt, and trailer byte `0xBC`. This tests the library's natural modes rather than treating v1.5 as the only plausible encoding.

### 2013 ISO /tmp files as RSA targets

The 2013 ISO archive lists `folly` and `wisdom` under `assets/2013/cicados/tmp/`. They are identical 3,368-byte blobs (Git blob id `62b1b949a1e4e4a346e75b1c34101000d3c53220`); the first bytes are `BF 53 C0 CC...`. The `0xBF` prefix has the shape of an old-format OpenPGP packet header (tag 15, indeterminate length), although no full packet parse is claimed.

Using the reconstructed 2012 RSA key, every 54-byte sliding window was tested in both byte orders (3,315 offsets × 2 = 6,630 candidates): private-exponent operations were checked for PKCS#1 v1.5 type-2 encryption blocks and high-printability plaintext; public-exponent operations were checked for PKCS#1 v1.5 type-1 signature blocks. No type-1 or type-2 block was found, and no decrypted block had a high printable-ASCII ratio.

The source-default OAEP-SHA1 path was then tested on every 54-byte big-endian window. Of 3,315 windows, 3,100 represented integers below N and were decrypted; **zero** passed OAEP decoding (empty-label SHA-1 hash check, MGF1-SHA1 unmasking, zero padding, and delimiter). This rejects direct OAEP blocks as well as the previously tested v1.5 blocks in these two files. It does not rule out a symmetric/custom packet format or another use of the files.

The source-default PSS signature path was also checked: every 54-byte big-endian window with c < N was raised to e and tested for the necessary EMSA-PSS structure (top unused bit, 12 zero padding bytes, delimiter, 20-byte salt, and `0xBC` trailer). **Zero** PSS structures were found. This is a structural exclusion, not full signature verification against an unknown message; no candidate reached that second step.

### 2014 Stage11 default-key OutGuess artifacts as RSA targets

The existing `outguess-lp2-default-key.zip` Actions artifact (workflow run `42755426574`, artifact `13735332261`) contains extracted outputs `17.payload`, `21.payload`, and `43.payload`, each 58,152 bytes. These are the same untrusted/default-key extraction family discussed in [the OutGuess source assessment](outguess-lp2-original.md), not independently authenticated ciphertext.

Using the 2012 modulus (54-byte RSA blocks), every big-endian 54-byte window in each file was checked. Candidate windows with c < N numbered 54,572 (page 17), 54,557 (page 21), and 54,528 (page 43). Across those windows there were **zero** OAEP-SHA1 decodes, zero PKCS#1 v1.5 type-2 encryption blocks under d, and zero PKCS#1 v1.5 type-1 signature blocks under e. A separate framing check tested all 54 possible block offsets in both byte orders; no alignment made every full 54-byte block smaller than N, so these files are not a complete raw 54-byte RSA block stream under this modulus. The same candidate windows also produced **zero** default PSS structures under e (SHA-1/MGF1-SHA1, 20-byte salt, `0xBC` trailer).

This is only a negative for these three extracted artifacts and standard 2012-key RSA encodings. It does not promote the OutGuess outputs to source-authenticated ciphertext or rule out non-RSA uses of the P.S. object.

### Direct GP29 key screen

The 2012 integer and its obvious RSA-derived quantities were converted to base 29:
- (N): 89 digits
- (p), (q): 45 digits each
- `φ(N)`, and (d) for (e=65537): 89 digits each

Each stream was repeated over the 12,956 unsolved LP2 runes and tested with both additive signs, with and without treating ciphertext F as transparent. The best (29\times IoC) was 1.039 (the ciphertext baseline is 1.000); no language-like plaintext appeared. This is a bounded negative for these direct GP29 running-key readings, not for every imaginable use of the 2012 object.

## Reproduction

Run from the repository root:

```bash
python sims/ps_number_lp2_screen.py
python sims/ps_rsa_oaep_crossround_gate.py
python sims/ps_rsa_oaep_crossround_gate.py --outguess-zip /path/to/outguess-lp2-default-key.zip
```

`ps_number_lp2_screen.py` checks the factor product, modulus sizes, Stage 2 modulus inequality, cookie RSA decryptions, and the direct base-29 key screen against the canonical `resources/liber-primus/lp2-transcription.txt`. `ps_rsa_oaep_crossround_gate.py` reproduces the default OAEP-SHA1 scan of the 2013 source blob and, when given the Actions artifact ZIP, the OAEP/PSS/v1.5 and 54-byte framing checks for LP2 OutGuess pages 17, 21, and 43.

## Sources

- Original signed 2012 *Valēte!* message: https://github.com/neuroretransmit/cicada/blob/main/2012/011-valete/README.md
- Published P.S. factorization and discussion of the clue: https://github.com/scream314/cicada3301/blob/master/hints_never_used.md
- Recreated public key (exact N, e=65537): https://github.com/neuroretransmit/cicada/blob/main/2012/011-valete/numbers.public
- Recreated private key (matching p, q, phi, d): https://github.com/neuroretransmit/cicada/blob/main/2012/011-valete/numbers.private
- Factor pair: https://github.com/neuroretransmit/cicada/blob/main/2012/011-valete/numbers.factors
- 2014 Stage 2 signed payload and its separate modulus: https://github.com/micheloosterhof/cicada-2014/blob/master/stage02/1033.jpg.outguess
- Later research status (describes the P.S. object as 435-bit and leaves the integer interpretation open): https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase60_clue_review.md
- 2013 ISO /tmp files (identical `folly` and `wisdom` blobs): https://github.com/scream314/cicada3301/tree/master/assets/2013/cicados/tmp
- Crypt::RSA 1.99 module documentation (OAEP default; PKCS#1 v1.5 opt-in): https://metacpan.org/release/VIPUL/Crypt-RSA-1.99/view/lib/Crypt/RSA.pm
- PKCS#1 OAEP defaults (SHA-1, MGF1-SHA1, empty label): https://www.rfc-editor.org/rfc/rfc3447.html
- LP2 default-key OutGuess extraction artifact: https://github.com/FlareZ123/liber-primus/actions/runs/42755426574

## Remaining uncertainty

The RSA key reconstruction is established in the 2012 archive, but no source-authenticated ciphertext has been linked to it or to LP2. The 2013 cookie values, the 2013 ISO /tmp files, and the three tested 2014 OutGuess extraction artifacts yield no direct plaintext under the library-default OAEP or tested PKCS#1 v1.5 encodings; the 2014 Stage 2 modulus is different. This does not rule out a non-RSA use of the P.S. object or a different source-authenticated ciphertext. Revisit only if a concrete ciphertext or a first-party cross-round instruction is recovered.
