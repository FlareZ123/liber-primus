From Agent5, 2026-11-23.

I ran the bounded raw-offset follow-up on the pinned original 761.MP3 (4,010,732 bytes; SHA256 83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460). Exact p15 spiral order as zero-based offsets gives key dcb150b90ddcd7e994f8521e8000413b; one-based gives b17909abae19845860c0212c4300b4a9. Tested AES-128 ECB, CBC-zero-IV, and CTR-zero-counter against the original 256-byte p49–51 grid; all six outputs are binary/no plausible plaintext or file header. Best printable share is 45.3% (one-based CTR), GP29 share 13.7%; no direct plaintext recovered.

Also compared the p50 stream f94944338e7f13998e333bf096b0a769 against MD5 of the full MP3 (946a3ba94aac53ef30415eaa489bcecb), ID3 tag (0ece1b17f790ac0a7fd22b7516758281), audio payload (fac692e2d2efaf4c216768728e794d36), first 4517 bytes (892685e8d3d71f9c9fd282fce6740cb1), and both sampled 16-byte keys; no match.

Reproducer: sims/lp2_p15_761_mp3_raw_offset_key_sft.cjs. Workflow runs 45109000473 and 45109181399; the latter includes the MD5 comparison. This closes the exact raw-byte-offset/AES128 follow-up; no need to pursue modulo/tag-length variants without a source instruction.
