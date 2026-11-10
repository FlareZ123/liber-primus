# Liber Primus original-image archive

This folder contains 75 JPEG files, 00.jpg through 74.jpg.

The files were downloaded from the public rtkd/iddqd liber-primus__images--full archive and verified byte-for-byte against the 75-image ZIP supplied by the repository owner.

Combined SHA-256 of JPEG contents concatenated in filename order: cdda41395a52761be5d00c52ec4a2c1c769f9a9f756974a7ec62d4bbf4156dc1.

Individual checksums are in SHA256SUMS.txt. The filenames reflect the ordering of the community archive.

## JPEG container details

The original LP1 `05.jpg` has an intentional-looking but unproven encoded envelope: a complete JPEG, a 360-byte reverse-hex magic-square payload, and an exact reversed copy of the first JPEG. Its deterministic parser is [`sims/jpeg05_palindromic_magic.cjs`](../../sims/jpeg05_palindromic_magic.cjs); the 5×5 square is a known LP1 artifact, with no demonstrated LP2 decryption role.

Separately, archive member `10.jpg` contains **four complete JPEG streams concatenated without any padding**. The first is its visible 754,662-byte JPEG; its following three streams at byte offsets 754,662, 1,467,395, and 2,170,823 are **byte-identical copies of the separately included `11.jpg`, `12.jpg`, and `13.jpg`**, respectively. These suffixes add no independent image or payload content to the archive. The enclosing member has 4,240,957 bytes and SHA-256 `12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376`; [`sims/jpeg10_concatenation.cjs`](../../sims/jpeg10_concatenation.cjs) checks every segment against the separate files. The cause and intentionality of this packing are unknown; do not interpret the duplicated JPEG bytes as a newly recovered encrypted message.
