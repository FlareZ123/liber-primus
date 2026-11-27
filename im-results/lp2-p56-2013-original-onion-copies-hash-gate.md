# P56's 128-hex destination digest against preserved 2013 signed/onion pages

**Agent 4, 14 November 2026. Original-source historical preimage attempt, finite negative. No recovered destination or LP2 plaintext.**

## Why these exact historical targets

The authentic solved LP2 p57 *PARABLE* text already appeared verbatim in the original 2013 `AUDIO/761.MP3` metadata, prior to the 2014 LP2 page release. This makes it plausible, without establishing that p56 also existed in 2013, that some earlier Cicada material could be relevant to the manuscript's final-page instruction. Solved LP2 p56 specifically describes **a deep-web page that hashes to** the 128-character hex digest:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

The immediate, direct human-style check is whether preserved actual source material for early authenticated 2013 onion pages already has that digest, rather than guessing hundreds of spellings, fictitious hosts or appended URLs.

## Fixed byte inputs and hash operations

A [read-only, deterministic single-file SFT](../sims/lp2_p56_2013_original_onion_copies_hash_sft.cjs) hashes exactly **14 source-preserved raw files**:

- Eight dated 2013 source artifacts stored directly under `resources/historical/`: the original first-onion `hello.asc`, forest clue, two second-onion signed files and the accompanying literal ICMP-echo hex transcription, plus three archived Cicada OS original shell/message files.
- Six original-file participant copies under `resources/historical/pklmx-2013/`: standby, Annapolis and Okinawa `.html` and their respective `.txt.asc` PGP clearsigned companion files. Their archived byte counts, original upstream Git blob identifiers, PGP verification and HTML-versus-signed-body caveats are documented in [the existing 2013 archive source account](../resources/historical/pklmx-2013/README.md).

The main historical 512-bit digest is **SHA-512**, with BLAKE2b-512 (published 2012) and modern SHA3-512 evaluated as explicit comparator functions. The original gate covers **14 raw files × 3 digests = 42 comparisons**. A source-directed follow-up adds nine SHA-512 candidates from the 2013 Instar/final-invitation stages: the raw `gematria.jpg.asc`, its 69-byte whitespace decode under no/LF/CRLF line serialization, the final `invitation.asc` raw armor and canonical cleartext body, the two original invitation-stage files, and the participant README transcript. The follow-up uses the pinned upstream commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3` and does not invent page URLs or arbitrary wrappers.

## Result and interpretation

**Zero exact matches in 51 source-bounded comparisons** (42 original plus nine follow-up SHA-512 candidates). Original bytes may nevertheless be missing. In particular, the preserved `pklmx` HTML copies are **participant-archive pages**, *not* original 2013 HTTP responses; a separate contemporaneous HTTP header reports a **1,869-byte entity** that was not recovered, compared with participant standalone copies of **976–983 bytes**. Hashes are sensitive to every original source byte, encoding and serialization choice. Thus this is a real negative for archived preserved files, not a negative for all historical hidden pages, not proof of SHA-512 selection, and not evidence that p56's deep-web page was distributed by 2013.

The new follow-up independently recovers the known first-onion instruction from the archived 2013 `gematria.jpg.asc` cleartext body. Its four nonempty lines contain **240, 200, 80 and 32 whitespace characters** (552 bits = 69 bytes). Reading each line independently with **space=0, tab=1, MSB-first** yields:
```text
Come to emiwp4muu2ktwknf.onion
We shall await you there.
Good luck.
3301
```
This is a positive-control recovery of the already-known 2013 first-onion address, not a new LP2 plaintext or destination. The opposite bit polarity and LSB-first do not yield readable text. Because every character in the cleartext-signed body is trailing whitespace on its line, standard OpenPGP cleartext canonicalization strips the bit pattern; absent a separate signature verification over the raw bytes, do **not** describe the whitespace payload as cryptographically authenticated. The raw armor, decoded message in all three line serializations, and final invitation-stage candidates all fail the p56 SHA-512 target.

**Follow-up reproducer:** [`sims/lp2_p56_2013_final_invitation_sha512_gate.cjs`](../sims/lp2_p56_2013_final_invitation_sha512_gate.cjs), [workflow](../.github/workflows/p56-2013-final-invitation-sha512-gate.yml), successful run **45347563195**. It prints all nine SHA-512 comparisons and the exact decoded message. The final invitation's archived files are not the original HTTP response, so this is a negative only for the preserved candidates.

A follow-up source-constrained reconstruction now narrows the specific missing 1,869-byte pklmx entity substantially. The contemporaneous response contains the 909-byte standby and 902-byte Okinawa signed blocks; the preserved 52-byte HTML prefix plus one 6-byte `</pre>` marker closes the historical length exactly. The only two exact-length marker placements both fail SHA-512, SHA3-512 and BLAKE2b-512 in Windows PASS 44431072180. See [the 1,869-byte reconstruction gate](lp2-p56-pklmx-1869-reconstruction-gate.md). The remaining prerequisite is an actual period-original entity whose bytes differ from that bounded reconstruction, or an independently selected different hash family.

**Original-gate reproducer:** [`sims/lp2_p56_2013_original_onion_copies_hash_sft.cjs`](../sims/lp2_p56_2013_original_onion_copies_hash_sft.cjs), [Windows Node22 manual CI PASS 43629915573](https://github.com/FlareZ123/liber-primus/actions/runs/43629915573). **Follow-up reproducer:** [`sims/lp2_p56_2013_final_invitation_sha512_gate.cjs`](../sims/lp2_p56_2013_final_invitation_sha512_gate.cjs), [workflow PASS 45347563195](../.github/workflows/p56-2013-final-invitation-sha512-gate.yml). No ciphertext decryption or authentic target hash preimage was recovered.

## Reconstructed SSSS destination: exact final-onion welcome and follow-up source objects (Agent3, 27 November 2026)

The 2013 native SSSS reconstruction now fixes the final historical onion destination. The archived signed welcome text associated with that destination is preserved as `resources/historical/cicada2013-welcome-and-congratulations.asc` (2,257 bytes, Git blob `2a76372e671573028809260777169e3a4a0a6950`). A later signed email-reminder message is preserved as `resources/historical/cicada2013-if-you-followed.asc` (1,046 bytes, blob `2cac85317c8245dfe3bf6509807e7f8308b734ac`); the [participant archive's no-email.txt.asc](https://github.com/neuroretransmit/cicada/blob/main/2013/007-fourth-onion/no-email.txt.asc) is the same exact bytes without the final LF (1,045 bytes, blob `313cfae861cde191583cb1d753e31b9fba307efc`). These are signed textual artifacts, not authenticated complete original HTTP entities. The raw archive payloads were locally reconstructed from the connector's base64 and matched all three Git blob hashes.

Check those three raw byte objects plus each distinct signed-text body (LF and CRLF, excluding the newline immediately before signature armor): seven objects, SHA-512 and Whirlpool, **0/14 matches**. Whirlpool `abc` known-answer control passes. Exact SHA-256 identifiers:

| Object | Bytes | SHA-256 |
|---|---:|---|
| Welcome raw | 2257 | `601a4e1bac2421f980df98487260bde1c390df7c875a9c7dfbfff0a85135a0c5` |
| Reminder raw | 1046 | `c97598ce1fa3ee47e71fa8cb2d2b9c88750a3c931407550c50aef7ac811e25b2` |
| Reminder raw, no final LF | 1045 | `e1bfac092f4fdc2a229a71468890bc075f02c5e23e3751d0d5b610116144f08a` |
| Welcome body LF | 1373 | `7c7be4c01823d77642b19212345ec1297210d6dcaffb4fd4926d608eb6f1edd2` |
| Welcome body CRLF | 1398 | `8ecda6c785fde1e54b4a348ae34fa4a0e275a2b7c8d74eea67b35f0dcdafbe8a` |
| Reminder body LF | 162 | `f0dd543b65acc985297a2aa8bc9ebc409fb9fbdb720d43f5b66109775ef95224` |
| Reminder body CRLF | 169 | `8c245f8bf892a5294562c36bd525d684d0f40c5a62b9433caa276f7d7a2dc94f` |

Reproduction (repository root, Python 3, OpenSSL with legacy Whirlpool provider):

```python
from pathlib import Path
from hashlib import sha512, sha1
import subprocess
root = Path("resources/historical")
items = {n: (root / f).read_bytes() for n,f in [
    ("welcome","cicada2013-welcome-and-congratulations.asc"),
    ("reminder","cicada2013-if-you-followed.asc")]}
items["reminder-no-LF"] = items["reminder"][:-1]
for n, sha in [
    ("welcome","2a76372e671573028809260777169e3a4a0a6950"),
    ("reminder","2cac85317c8245dfe3bf6509807e7f8308b734ac"),
    ("reminder-no-LF","313cfae861cde191583cb1d753e31b9fba307efc")]:
    x=items[n]
    assert sha1(f"blob {len(x)}\\0".encode()+x).hexdigest()==sha
for n in ("welcome","reminder"):
    b=items[n].split(b"\\n\\n",1)[1].split(b"\\n-----BEGIN PGP SIGNATURE-----",1)[0]
    items[n+"-body-LF"]=b
    items[n+"-body-CRLF"]=b.replace(b"\\n",b"\\r\\n")
target="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
def whirl(x):
    return subprocess.run(["openssl","dgst","-provider","legacy","-whirlpool"],input=x,capture_output=True,check=True).stdout.decode().split()[-1]
assert whirl(b"abc")=="4e2448a4c6f486bb16b6562c73b4020bf3043e3a731bce721ae1b303d97e6d4c7181eebdb6c57e277d0e34957114cbd6c797fc9d95d8b582d225292076d4eef5"
for n,x in items.items():
    print(n,len(x),sha512(x).hexdigest()==target,whirl(x)==target)
```

The source-local decision is to stop testing these existing message representations. A complete contemporaneous quiz HTTP response or an independently selected different digest is a genuinely different input. The reconstructed 2013 destination is not the solved LP2 p56 destination, and no new LP2 plaintext follows from this result.

