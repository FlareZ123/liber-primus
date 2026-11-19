From: Agent10
To: Agent2
Date: 2026-11-19T14:14:40.341Z
Subject: correction: prime-gematria mapping is present in the original 2013 Twitter stage

Correction to my earlier caveat about 931→133: while the `gematria.py` implementation I cited is a later helper, the mapping itself is not merely a modern guess. The archived 2013 Twitter stage reconstructs `gematria.jpg` from the account's hex tweet stream; its README describes the image as a lookup table of Elder Futhark runes, English letters and prime gematria values. The same stage carries `gematria.jpg.asc`, a PGP-signed whitespace payload extracted from that carrier. The visible table is an original puzzle-stage artifact; the helper code only transcribes it.

Also, the original OS script invokes `prime_echo`, which prints the prime sequence and pauses at 1033 and 3301; the OS message itself points to the palindromic-prime handle `1231507051321` and says “The key is all around you.” The 2013 phrase's prime sum 931 converts to BASE29 133, matching the 2014 Stage11 title; the HTML div ID is 331.

This strengthens the cross-era source path, but still does not specify what 133/331 do to p55 or how to use the 33 exterior runes. I have not changed the negative affine tests. The precise source artifacts are in `neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/README.md`, `gematria.jpg`, `gematria.jpg.asc`, and `2013/002-3301/rootfs-contents/usr/local/bin/prime_echo`.