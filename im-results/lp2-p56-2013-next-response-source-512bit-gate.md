# p56 exact 2013 NEXT artifact candidates — closed finite negative

Agent48 implemented and ran the frozen test; Agent22 recovered the completed run and closed the stale issue #2564 without a rerun.

The exact 128-hex target printed on p56 specifies 512 bits, but no algorithm. The five exact logical objects below were compared under SHA-512, BLAKE2b-512 and SHA3-512. **0/15 matches**. This excludes only these exact bytes under these three functions. The historical page and digest algorithm remain unidentified; there is no reason to widen this candidate family without an independent source clue.

The 65 received records reconstruct 3,247 CRLF armor bytes and a 2,344-byte clear-signed body; LF-normalized armor is exactly the stored 3,182-byte derivative. The script checks the pinned TCP source byte length and SHA-256 before testing. See the [successful original run](https://github.com/FlareZ123/liber-primus/actions/runs/45367972940), [reproducer](../sims/lp2_p56_2013_next_response_source_512bit_gate.cjs) and [source semantics](lp2-p56-source-defined-hash-semantics-gate.md).

## Exact run output

```json
{
  "decision": "finite negative: no exact match among five 2013 NEXT/source/key objects",
  "p56Target": {
    "hex": "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4",
    "hexCharacters": 128,
    "bits": 512,
    "algorithm": "not authenticated by length alone"
  },
  "testedFunctions": [
    "sha512",
    "blake2b512",
    "sha3-512"
  ],
  "candidateObjects": 5,
  "comparisons": 15,
  "reconstruction": {
    "receivedLineRecords": 65,
    "signatureBeginLine": 48,
    "armoredLFStoredBytes": 3182,
    "armoredLFReconstructionEqualsStored": true,
    "armoredCRLFOriginalBytes": 3247,
    "clearSignedBodyCRLFBytes": 2344,
    "clientlogBytes": 10636
  },
  "pinnedTCPSource": {
    "commit": "27309e66746e21542f2b908d7f60b906915fe7c6",
    "path": "messages/2013/tcp-server.asc",
    "bytes": 3775,
    "sha256": "fdfe1208b49f75ce634224d2b0561e4c8b322f27dd74bd757f5d83ebcfbdb88c"
  },
  "results": [
    {
      "name": "complete_armored_NEXT_original_CRLF",
      "bytes": 3247,
      "sha256_integrity": "dd622c3f3437258560befcd5e3edf14b172fdd5d601b7835c3c92d455e47f078",
      "hashes_512": {
        "sha512": "973f26507091cafa49e6d72168761a9590c97f7757233871773d3a96af892858361d625d708a17538d727e3737a5a89343bcdd314bab1f45196bf2d3cc76d908",
        "blake2b512": "802bf8d8f6476ea52f8a58c39c4fd1e8a04fdbb713c30c91aea78444b39fe0bd51e4a5d9d3391507e3c5068785ca67890aa6f56b028f190c6f46ad9fde499aa7",
        "sha3-512": "9215a7fb8957ae1f0bcb86900a1558e938e6439df6bd1d1df5526d8a44174c4d07266c2c05693b75811e5416ac4597f2da6ba0638fb481cfcfccc36b22ddc888"
      },
      "matchingFunctions": []
    },
    {
      "name": "clear_signed_message_body_original_CRLF",
      "bytes": 2344,
      "sha256_integrity": "7a569a451e281c53e73c9afc5994d734bd77b20f021ea6ed722df53bad4cf723",
      "hashes_512": {
        "sha512": "d9daa101bea6d6803e3968567d889181c14ececfbfc30247a589ed50b051e14acfba6cee2befd1231ff79c043103cedeb7b4ba59ea5aa5609db1331828a2b300",
        "blake2b512": "4c2859270fdd9de7ca6f54f625633104b3800333da99dd5ad74f7ae9f21fb177608c507a6f996a1a25e1ae0411baab838005da52a39748aa58722a70d286426a",
        "sha3-512": "5cdf1a048832975f1724ad04bb6a823925f0fe93ecb7ece566d70d3ab0008db08c8d547390c2e515a244366be250e3327d23bb80c57ddd94da0cd417bdd628f2"
      },
      "matchingFunctions": []
    },
    {
      "name": "raw_clientlog",
      "bytes": 10636,
      "sha256_integrity": "28c9e908c594c8cc48194ebd73308cfb9b3765cf69755e7bc3556548521d43d2",
      "hashes_512": {
        "sha512": "b5f1565d5fa476be9d9af2f84c71531444ecdd5acaa6160875c504297aeab969dce2dc0ea7fda1b8b8d5882884be23ef02b1305c12cbae729304fd17b67a17e4",
        "blake2b512": "60bfefee359db26dd25581df4f6c214df0bb2d3107759d2ce0b6b6b6434be150ab19d2c1dac9c3411c7e03cbd14c16a0ebc536493b2d9af0abed31e75c86c61b",
        "sha3-512": "c1a298bc3dcfc1fddf1ccf1a7109ebfd4cf43097c0d9d17b84382e5409bef3ca174ed1cf85afbdf881a3e12bda7fb098941c0774e3b9549f248fe4d4ba1440b8"
      },
      "matchingFunctions": []
    },
    {
      "name": "signed_TCP_server_source_pinned_commit",
      "bytes": 3775,
      "sha256_integrity": "fdfe1208b49f75ce634224d2b0561e4c8b322f27dd74bd757f5d83ebcfbdb88c",
      "hashes_512": {
        "sha512": "e76950c0d8f1027740fadaabfcf400dd585a0d47f9fd96ce6ce990f855159e1e0f59de982ae56202ca0b6bde493fa4dac63a64366954d83c0fc835ebf6c3ad96",
        "blake2b512": "85634f309166ead9ea415544cdea1822b242cd079bdb639c820a78f8fc149158df6c090c0863e2c2dcc88ff05d27466c3a60b6679b22ccf67bf508f781ed8da9",
        "sha3-512": "ec4e43014bc0dd7291c86a3d5bf87ce572d61d1e0132334b83be74d1e2d73dbdacf0abbe04aeeb18a97298e3fa8e85eaac7e0622ddb5d5667cd8c833b9818c01"
      },
      "matchingFunctions": []
    },
    {
      "name": "verification_public_key",
      "bytes": 3057,
      "sha256_integrity": "6e397c5c6ceeeb4da08535db74874989f193c914b8d2d87972dd282b24ea809f",
      "hashes_512": {
        "sha512": "a535f6b6db4536431203d3b921d40b082a86b2064c2ad0b662b4c22d4c445f71b9bb07b67721e3dbbbe9b013e3248053513f16f4084c431c894a79bcdec04444",
        "blake2b512": "3f8370010adb96c7b45327ebb4c130753ee1c0ee20a8212ae9fa1c800d72a6036d0bc60fa910aae7cb2103f655114256fd296c13209ae1bc5c057b08b8b8a810",
        "sha3-512": "aad01ffebaad0f16b1a9e30b491819b8263da87f0225c3196aade6f553243f2208750591af2c70f4b19fc9c40f2842f31e47a293258252ae1185e9686bba938f"
      },
      "matchingFunctions": []
    }
  ],
  "matches": []
}
```
