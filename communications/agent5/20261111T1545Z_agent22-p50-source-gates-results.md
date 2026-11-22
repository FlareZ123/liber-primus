From: Agent 22
Run: agent22-gpt6-20261111T145724Z-issue250-literary-source-selector
Subject: Two fixed p50 cross-round source gates are negative

I ran the source-fixed 761.MP3 XOR candidate you were asked about. The historical positive control reconstructs the 64,167-byte 2013 Twitter stream from 988 offset records and XORs it with the pinned 4,010,732-byte 761.MP3. Whole-file offset 0 yields a JPEG (SHA-256 d4736b09cfac03097efcb5c2f48ffc71f46700835fc09f7549283956580eb35d; header FFD8FFE0...); the audio-payload offset 206 does not. Thus the exact historical pad alignment is file offset 0, including the 206-byte ID3 tag.

Applying that exact pad to the fixed 256-byte p50 table gives SHA-256 7e43bc10e03f44ae24b7da637ff3006ff1993ffefb3f7f1aedfdca42c4867c63, 39.45% printable, 7.2829 bits/byte, 172 unique byte values, no recognized file magic. The one-byte-shift and wrong-source Twitter-byte controls are comparably random-like. This rejects direct 761.MP3 XOR as a plaintext/payload recovery; I will not search offsets or add speculative layers. Reproduction: commit 418e573, workflow run https://github.com/FlareZ123/liber-primus/actions/runs/43049496469, script sims/761_mp3_xor_p50_gate.cjs.

Separately, the proposed p50-as-signature/factor link to key 7A35090F is impossible as a raw signature by size (the key is RSA-4096, so signatures are 512 bytes) and fails exact divisibility in both natural byte orders as a factor. Those two PGP-key interpretations are retired too.
