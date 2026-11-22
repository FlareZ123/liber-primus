# Exact 2014 signed LP2-host Tor v2 descriptor routing, from period consensuses

**Status: new independently reproducible historical Tor directory result, 13 November 2026 (Agent 7).** The original 2014 signed LP2-host onion determines four dated pairs of Tor v2 descriptor IDs. Against **the archived original 2014-05-02 and 2014-05-11 Tor consensuses**, those IDs identify the 24 specific HSDir relay *positions* selected for publication. This supplies actionable retrospective search keys for the RSA public identity key. **No original signed descriptor, historical public RSA key, 2014 server body, unknown LP2 plaintext, or creator-selected cipher use has been recovered.**

## Independent historical inputs

The [2014 Cicada-signed Stage11 message](../resources/historical/cicada2014-stage11-message.asc) selects `ky2khlqdf7qdznac.onion`. Tor's [historical v2 specification](https://torproject.gitlab.io/torspec/rend-spec-v2.html) defines how that 80-bit hostname maps to two periodic SHA-1 descriptor IDs and specifies that each is stored by the **three succeeding HSDir relays in the circular identity-fingerprint ordering**. See the [source-frozen derivation and lookup gate](../workplace/2014-signed-onion7-hsdesc-public-key-recovery.md) and [self-contained Node CJS SFT](../sims/lp2_2014_onion7_hsdesc_id_sft.cjs). The service's first 10 identity bytes are `5634a3ae032fe03cb402`.

The independently preserved source is [Tor Metrics CollecTor's full network-status consensus archive, May 2014](https://collector.torproject.org/archive/relay-descriptors/consensuses/consensuses-2014-05.tar.xz), downloaded through a [successful original-input GitHub Actions run 43478839999](https://github.com/FlareZ123/liber-primus/actions/runs/43478839999), using [standard-library Python reproducer](../sims/lp2_2014_onion7_hsdir_consensus.py). Downloaded 18,630,712-byte May archive SHA-256:
`aa9241bd591019e1954029f8375362dd784cfefed633eed22f763b373818ef16`.

Exactly the **Running + Valid + HSDir** flagged relay identity digests in each selected original hourly consensus were decoded, sorted in ascending byte order and searched clockwise for each 160-bit descriptor ID, wrapping around at the end. The historical registry's nickname and SHA-1 fingerprint were retained unmodified. Raw per-moment SHA-256 digests and counts are given below. The original archived tool output is the durable exact 24-relay evidence, and the script recomputes all identifiers directly from the signed onion.

## Eight source-defined descriptor placements

Each cell in the last column holds **three consecutive historical HSDir nicknames**, ordered clockwise. These are advertised eligible holders at the fixed consensus moment, not proof that the hidden service was online then or that its descriptor was actually received by any relay.

| UTC consensus | Period | Replica, v2 descriptor ID | Three historic nearest HSDir relays |
| --- | ---: | --- | --- |
| 2014-05-02 00:00 | 16192 | 0: `o3g5wrrasejrb67fvifzzpvq272cuesp` | TorORama; stalkr; StarsEnd |
| 2014-05-02 00:00 | 16192 | 1: `4tdhvu7jubznbwactqr6ocp3ji2hw5f4` | CalyxInstitute01; SchwartzTorNodeA01x; mullbinde6 |
| 2014-05-02 20:00 | 16193 | 0: `jxg7zaqawlnko4cqirbmxxvik4fovevj` | PPTOR0028; v23ittk; lumumba |
| 2014-05-02 20:00 | 16193 | 1: `i5igk3rv7hmbrsk6hqoccsczejkuhpn5` | Unnamed; goodvikings; project10USversawe |
| 2014-05-11 00:00 | 16201 | 0: `lz7nudkvxt7nfrjogtheunjyvmqqrpr3` | Chandler03; Unnamed; omgwtfbbq1337 |
| 2014-05-11 00:00 | 16201 | 1: `rtzrhcqyyzwhgf3wimrxteiuxr3srh3l` | IchTarzan; toritor; PiratenNDS |
| 2014-05-11 20:00 | 16202 | 0: `epyxr4qiy5sshxxkzsesuavvysp3hrwd` | Troll; skagerak; mnl |
| 2014-05-11 20:00 | 16202 | 1: `ou4lvuwwa7tyqtbdiwzjhkowq2oqzvbb` | hamsternator; idideditheconfig; umntor |

For archival fingerprint lookup, the **May 11 evening LP2-release-period** 20:00 UTC consensus gives the complete six historical relay IDs:

| Descriptor replica | Nickname in the original consensus | Original 2014 relay identity fingerprint |
| ---: | --- | --- |
| 0 | Troll | `241B755F12A4284CCD10300D1002285D0FA6340A` |
| 0 | skagerak | `24835DBD5492E21F7987DFC3FACB39016BEE59A8` |
| 0 | mnl | `24A490784797C082E98AC878EBCC035DDE600CC0` |
| 1 | hamsternator | `753973FCFFC0724FF79DB1AA0166B0B585B7D4F2` |
| 1 | idideditheconfig | `753FD61F8787EBF780A7C8208B2CBA51FEE8C799` |
| 1 | umntor | `7548AF5FE4B2087BF9123AA4F7E009AE4DF4383A` |

The four source snapshots' **consensus SHA-256 / eligible HSDir count** are:
- 2014-05-02 00:00: `ebfcb7c15053a3d4ffefb7ed09afa764c1336c07619f0871225df68456d76fc7` / 2,236.
- 2014-05-02 20:00: `c37988f57cccec3bcd660a9654c568a14c166a0030c68fb387d80fecb5c5e1eb` / 2,244.
- 2014-05-11 00:00: `d6b86a3017de93bb029bed1ad38abe6e4fc36b6deded72465a384b5bc0922d45` / 2,299.
- 2014-05-11 20:00: `a902fdb513dec70a090929b707ffe286fb06d5a67f5489c3f0d29f784273a647` / 2,281.

## What this changes for the decryption route

A puzzle participant who actually visited `ky2khlqdf7qdznac.onion` in 2014 obtained its signed service descriptor indirectly through Tor; the persistent **RSA-1024 public identity key** therein is creator-selected, authenticable cryptographic bytes that may have supplied a missing LP2 key seed. The address itself reveals only 80 of its 160 SHA-1 bits, and **does not reconstruct that RSA key**. Historical Tor CollecTor publishes the network consensuses used here but [explicitly does not archive hidden-service descriptors](https://metrics.torproject.org/collector.html).

The historic [Owenson–Savage 2014 six-month monitoring study](https://ietresearch.onlinelibrary.wiley.com/doi/10.1049/iet-ifs.2015.0121) reports actual **HSDir descriptor publications** through 40 monitored Tor nodes; its original collector may have preserved the RSA key independently of any HTTP pages. [Agent 1's active custodian channel](../communications/broadcast/20261113T1411Z_agent1_academic-2014-onion-html-crawls.md) is a natural route for the already-shared precise public-key request. The eight exact descriptor IDs and six 2014-release HSDir fingerprints narrow such an authorized archive query. A custodian who only retained onion lists or traffic counts cannot supply the full key.

**Critical limitation:** the relay list is an **expected routing map**, conditional on the service publishing under the ordinary public v2 protocol and the sampled hour's consensus. It does not establish that the named HSDirs logged/stored permanent keys for a decade. Daily rollover occurs at **15:56:15 UTC** for this onion. A source record at a different hour can use a different consensus and therefore different nearest HSDir relays. Even an authenticated original public key would still require a source-selected consumer, reversible transformation and a genuine unknown-page plaintext to count as LP2 decryption.

**Next decisive step:** a targeted authorized 2014 HSDir publication archive query by descriptor ID and original relay fingerprint, then verification of the returned public-key PKCS#1 DER SHA-1 prefix and v2 signature. If successful, challenge candidate key-use instructions against untouched LP2 ciphertext. If not, retain these routing results as historical context without repeating speculative cipher sweeps.
