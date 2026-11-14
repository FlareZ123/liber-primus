#!/usr/bin/env python3
"""Load the surviving June 2014 cluosh rcrypto.py blob and replay p0/p54.

This fetches the *unchanged historical code* into memory at its immutable Git
commit and verifies Git blob SHA-1 before execution. We do not redistribute a
2014 third-party source file with unknown license. Python >=3.10, numpy,
matplotlib, internet to immutable GitHub raw URL for the external source.
Run: python sims/lp2_2014_cluosh_original_tool_replay_sft.py
"""
from __future__ import annotations

import hashlib
import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HISTORY_REPO = "kenorb-contrib/cicada_toolset"
COMMIT = "bd63ab1475e08b6125860f5c74f0271977ab8a69"
BLOB = "9a82a844d8574d2040eed60de76f4becdd77a666"
URL = f"https://raw.githubusercontent.com/{HISTORY_REPO}/{COMMIT}/runeaylze/rcrypto.py"
SOURCE_FILES = {
    0: ("shaggydog-p0-6jznh1UD.txt",
        "3bb5f5239e222465139a7f4762a9aea1a421dcb615ad480cee4686fa1f9de2f1"),
    54: ("shaggydog-p54-BgYrwudm.txt",
         "05d77b618d53f1e9062afddce72cae522d84a2d1ef3844c52920fec7f1fab3ac"),
}
EXPECTED_DIFF = {0: [98, 99, 100, 104, 108, 131, 156, 209], 54: [39, 134, 202]}


def primes(n: int) -> list[int]:
    out = []
    x = 2
    while len(out) < n:
        if all(x % p for p in out if p * p <= x):
            out.append(x)
        x += 1
    return out


def index_of_coincidence(sequence: list[int]) -> float:
    count = [sequence.count(i) for i in range(29)]
    return sum(n * (n - 1) for n in count) / (len(sequence) * (len(sequence) - 1))


def original_code() -> type:
    with urllib.request.urlopen(URL, timeout=20) as response:
        code = response.read()
    assert len(code) == 18283, len(code)
    header = f"blob {len(code)}\0".encode()
    assert hashlib.sha1(header + code).hexdigest() == BLOB
    module = {"__name__": "cluosh_rcrypto_20140603", "__file__": URL}
    exec(compile(code, URL, "exec"), module)
    assert module["RunesASCII"] == [
        "F","U","TH","O","R","C","G","W","H","N","I","J","EO","P",
        "X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IO","EA"]
    return module["RuneText"]


def main() -> None:
    RuneText = original_code()
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text())
    page = lambda p: next(row["indices"] for row in corpus["pages"] if row["page"] == p)
    assert len(page(0)) == 262 and len(page(54)) == 232 and len(page(56)) == 85
    assert page(56)[56] == 0

    # Authentic 2014 solution as a positive on the historical source's
    # actual Vigenere primitive, using May 25's independently sourced F skip.
    p56 = page(56)
    ps = primes(85)
    k = 0
    got = []
    for i, c in enumerate(p56):
        if i == 56:
            got.append(c)
        else:
            got.append(RuneText().vigenereDecrypt(c, (ps[k] - 1) % 29))
            k += 1
    spelling = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"
    tokens = sorted(enumerate(corpus["translit"]), key=lambda item: -len(item[1]))
    expected = []
    for word in spelling.split():
        i = 0
        while i < len(word):
            idx, token = next((j, t) for j, t in tokens if word.startswith(t, i))
            expected.append(idx)
            i += len(token)
    assert len(expected) == 85 and got == expected
    print("PASS authentic solved p56: 85/85 from recovered historical Vigenere primitive + contemporaneous skip")

    report = {"historical_repository": HISTORY_REPO, "commit": COMMIT,
              "committed_2014_06_03_blob": BLOB, "solved_p56_runes": 85, "pages": []}
    for n, (name, expected_sha) in SOURCE_FILES.items():
        data = (ROOT / "resources/external/2014-irc-shared" / name).read_bytes()
        assert hashlib.sha256(data).hexdigest() == expected_sha
        source = RuneText()
        source.parseLine(data.decode("ascii"))
        source.convertCharsToNums()
        source.update()
        old = [r for word in source.words for r in word if 0 <= r < 29]
        original = page(n)
        assert len(old) == (262 if n == 0 else 233)
        discrepancies = [i for i in range(min(len(old), len(original)))
                         if old[i] != original[i]]
        assert discrepancies == EXPECTED_DIFF[n], (n, discrepancies)
        if n == 54:
            assert old[-1] == 21 # NG carry into the next printed page

        # This utility itself carries no unknown-page key. Its only complete
        # source-defined key builder is first prime q -> (q mod29)-1, also
        # compatible with its Vigenere deciphering method. Run unchanged
        # fixed prime stream on both historical and source-native text.
        variants = []
        for label, ciphertext in (("2014_participant_input", old),
                                  ("original_2014_JPEG_input", original)):
            tool = RuneText()
            tool.words = [ciphertext]
            tool.update()
            p = primes(len(ciphertext))
            key = tool.key_from_primes(p)
            assert len(key.split("-")) == len(ciphertext) + 1
            four = tool.vigenereTry(keyword=key, max_displayed_chars=len(ciphertext))
            assert len(four) == 4
            # The historical prime29 yields -1 in a hyphen-delimited key.
            # VigenereTry splits --1 into empty and 1, silently mapping
            # the -1 intended residue to +1 at local index9.
            assert key.split("-")[9:11] == ["", "1"]
            assert four[0].split().count("x") == 0
            candidate = [(ciphertext[i] - ((p[i] - 1) % 29)) % 29
                         for i in range(len(ciphertext))]
            variants.append({
                "register": label, "runes": len(ciphertext),
                "prime_source_key_minus1_misparsed_as_plus1_at_index": 9,
                "direct_prime_key_ioc": round(index_of_coincidence(candidate), 10),
                "first_32_direct": "".join(corpus["translit"][x] for x in candidate[:32]),
                "historical_four_vigenere_views": len(four),
            })
        report["pages"].append({
            "physical_page": n, "period_source_variants": len(old),
            "source_original_runes": len(original), "different_positions": discrepancies,
            "variants": variants, "historical_script_hardcoded_unknown_key": False,
            "new_plaintext_recovered": False,
        })
    print(json.dumps(report, indent=2))
    print("PASS original historical toolkit parsed both authentic period inputs "
          "and original physical-page registers. No authored unknown-page key.")


if __name__ == "__main__":
    main()
