# Checksum-to-key audit: no authenticated Cicada handoff; Derbycon 2012 source-state comparator

**Decision: no exact checksum→cipher-key/state handoff was found in the authenticated Cicada 2012–2014 source paths reviewed.** The strongest Cicada numeric outputs have validation or protocol-parameter roles, not a documented reversible-key receiver. The period-available fallback is Derbycon's 2012 public CTF crypto challenge: it provides a fully replayable source-object→keystream-state handoff, but it is a known-plaintext XOR attack, **not** a checksum. This distinction prevents treating any LP2 arithmetic result as a key merely because it is reproducible.

## 1. Cicada source audit

### p57 Parable product — a checksum, not a key

The 2013 `761.MP3` ID3 TXXX field records `Parable 1,595,277,641`. The existing source analysis derives this value from the three prime clause sums of the already-readable p57 Parable:

`1,031 × 1,229 × 1,259 = 1,595,277,641`.

This is an independently checkable checksum-like product of a fixed source object. Its evidenced role is to validate the known Parable text and connect the audio metadata to that source. No authenticated source gives it a cipher family, key schedule, representation as key bytes, ciphertext receiver, or subsequent decoded output. Calling it an RSA modulus or AES key would invent the missing transition.

**Frozen candidate:** p57's product `1,595,277,641` is the sole Cicada checksum candidate carried into this gate. Its documented role stops at validation; no ciphertext was touched.

### p33 magic-square sums — submission/validation fields, not key material

The signed 2014 magic-square form uses field names containing the square order and sums (including 3301 and 1033). Those sums validate/identify submitted square objects. The separate 2013 signed TCP/DH material includes a `DH 3301` parameter, but no signed clue or source record connects that public modulus to a checksum of the later p33 square. Reusing the same integer across unrelated artifacts is not a causal handoff; moreover, a DH modulus is a public group parameter, not the shared secret/key.

### p15 distances and p50 numerical panel — no typed receiver

The p15 grid/distance derivations and p50 32×8 numerical panel are real observations, but the source catalog supplies no authenticated checksum algorithm followed by a key schedule and receiver. The 2016 signed wording that “words are the map” and “numbers are the direction” specifies navigation semantics; it does not say to hash a source object or use a sum/product as cipher state.

Relevant existing source records:
- `im-results/audio761-original-id3-frame-inventory.md`
- `im-results/cicada2013-reverse-prime-cookies-p56-sft.md`
- `workplace/cicada2013-reciprocal-prime-cookies-source-gate.md`
- `resources/external/2013-final-onion-cookie-values.md`
- `resources/external/2013-tcp-server-signed-source.md`
- `resources/external/cicada2014-onion6-magic-form-and-response.json`
- `resources/historical/cicada2016-4gq25-outguess.asc`
- `results/README.md`

**Cicada conclusion:** none of these source paths supplies the missing typed transition `fixed source object → checksum → key/state representation → specified ciphertext → independently recognizable plaintext`.

## 2. Period-available solved public cryptogram fallback: Derbycon 2012

The Derbycon 2012 CTF crypto challenge is a solved public cryptogram with a clear original input layout and a fully replayable key-state recovery. The posted archive contained:
- `plain2`: 112 bytes, exactly `KC57` repeated 28 times;
- `plain2_encrypted`: the 128-byte encryption of that known plaintext;
- `plain1_encrypted`: a separate 128-byte target ciphertext;
- the .NET encryptor and BouncyCastle dependency.

The published decompilation shows AES in OFB mode, a fixed IV `1234567890123456`, a fixed salt `s@1tValue`, and a password-derived AES key. Because the same key and IV were reused, both files used the same 128-byte keystream. The encryptor's padded block cipher adds a full 16-byte PKCS#7 block to the 112-byte source plaintext.

The exact replay is:

`P2pad = (KC57 × 28) || (0x10 × 16)`

`K = P2pad XOR C2`

`P1 = C1 XOR K`

The resulting 128-byte keystream has SHA-256:

`198ecfde8ade22f6e4c96d2731fbf4ea0d3683df2483662cfc5afb1e0543ff5e`

The target plaintext contains:

`FLAG=DecryptTheFlagToGetTheKeyLol`

Run the included reproducer:

```bash
python sims/derbycon2012_ofb_keystream_replay.py
```

This is an authentic source-object→key-state handoff with independently recognizable byte boundaries and a reversible receiver. **It is not a checksum-to-key handoff.** The key state is the OFB keystream recovered algebraically from a known plaintext/ciphertext pair; the SHA-256 above is only a post hoc integrity fingerprint of that keystream. It is a useful comparator precisely because it shows the missing causal requirements: shared cipher, same key, same IV, byte alignment, and a target ciphertext encrypted under that same state.

Sources:
- [Derbycon 2012 CTF crypto challenge and encryptor decompilation](https://0x.c0ffee.me/security/2012/10/17/derbycon.html)
- [Independent 2012 replay with complete ciphertext hex dumps and XOR derivation](https://breenmachine.blogspot.com/2012/10/derbycon-ctf-and-other-things-on-backlog.html)

## 3. LP2 typed-role comparison

The only frozen LP2 checksum candidate is the p57 Parable product. It has a known source object and reproducible arithmetic, but no source-selected key representation or ciphertext receiver. The Derbycon comparator cannot be transferred: LP2 does not provide a known plaintext and its ciphertext encrypted under the same stream state as an unknown target. LP1 solved pages are not evidenced as a common AES-OFB stream; p56/p57 are clear pages without corresponding encrypted versions; p15/p33/p50 numerical outputs do not supply a known-plaintext/ciphertext pair.

No modulus, hash algorithm, byte encoding, IV, padding convention, or receiver is selected by the Cicada sources for the Parable product. No arbitrary RSA/AES/RC4 interpretation was attempted.

## 4. Result and reopen condition

- No authenticated Cicada 2012–2014 checksum-to-key handoff was found in the source paths reviewed.
- The fallback public cryptogram demonstrates a real source-derived keystream state, but it is a known-plaintext attack, not a checksum.
- The p57 product remains a validation checksum, not a key.
- No LP2 candidate has the same typed roles; there is no falsifiable next decode to run without inventing a receiver.

Close this transfer. Reopen only if an authenticated Cicada source or original LP2 clue explicitly identifies the fixed source object, checksum operation and representation, reversible key/state mapping, and a particular ciphertext receiver. Do not infer a key from a prime product, magic-square sum, or numerical distance alone.

## Reproduction

`sims/derbycon2012_ofb_keystream_replay.py` embeds the published challenge bytes, applies the source-supported padding, derives the keystream, decrypts the target, asserts the recovered flag, and prints the keystream fingerprint. It does not compute or use a checksum as the cipher key.
