"""Issue #2966: independent Middle English GP-register gate using pinned C7/C8.
Run with Python 3.12 + NumPy. No original-candidate search is performed here.
"""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.request import urlopen, Request
import csv
import io
import json
import sys
import time
import xml.etree.ElementTree as ET

UPSTREAM = "fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb"
WYCLIFFE = "252c53a7e51916f6f2bf329b477f1ca6f2016b15"
GAWAIN = "5847a1b50628e8c9073b05235f333805eea18322"
SEED = 2966001
N_POS, N_CHEAP, N_BEAM = 200, 2000, 500
ALPHA = 8.0
TOKENS = "F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split()
# Orthographic GP fold, fixed before evaluation. Morris's digit 3 represents
# yogh; G is a graphemic approximation (not a claim about its contextual sound).
# & represents the conjunction and. No learned/dialect-specific spell changes.
TABLE = {t.lower(): t for t in TOKENS}
TABLE.update({"v": "U", "k": "C", "q": "C", "z": "S",
              "þ": "TH", "ð": "TH", "æ": "AE", "œ": "OE",
              "ȝ": "G", "3": "G", "ƿ": "W", "&": "A N D"})
PREFIX = "https://raw.githubusercontent.com/"
W_URL = PREFIX + "gratis-bible/bible/" + WYCLIFFE + "/en/wycliffe.xml"
G_URL = PREFIX + "jtauber/sir-gawain-and-the-green-knight/" + GAWAIN + "/txt/base.tsv"
FILES = [
    "challenges/c7_corpus_forge.py",
    "challenges/c8_register_scorer.py",
    "challenges/_common.py", "challenges/_heavy.py", "challenges/_sandbox.py",
    "liber-primus/src/lp/gematria.py", "liber-primus/src/lp/score.py",
    "liber-primus/src/lp/stats.py", "liber-primus/src/lp/ciphers.py",
    "liber-primus/src/lp/corpus.py",
    "liber-primus/benchmark/plant.py",
    "liber-primus/analysis/campaign18_skip/skipdecode.py",
    "liber-primus/analysis/round12/C1/feedback.py",
    "liber-primus/analysis/round11/lib_numchannel.py",
    "liber-primus/analysis/run_stats.py",
    "liber-primus/analysis/round46/L1-word-loader/words.py",
    "liber-primus/analysis/round32/I2-multiregister-readjudication/adjudicate.py",
    "liber-primus/data/panels/panel-r36.npz",
    "liber-primus/data/english_quadgrams.txt",
    "liber-primus/data/krisyotam_runes.txt",
    "liber-primus/dataset/liber_primus.json",
    "liber-primus/PROBLEM.json",
    "liber-primus/data/keys/self_reliance.txt",
    "liber-primus/data/keys/armada19/mill_on_liberty.txt",
    "liber-primus/data/keys/armada18/emerson_essays_first_series.txt",
    "liber-primus/data/keys/armada19/shelley_frankenstein.txt",
    "liber-primus/data/keys/armada19/virgil_aeneid_latin.txt",
    "liber-primus/analysis/latin/latin_218.txt",
    "liber-primus/analysis/round10b/B6-non-english-plaintext/corpora/de_faust.txt",
    "liber-primus/analysis/round10b/B6-non-english-plaintext/corpora/de_2.txt",
    "liber-primus/data/keys/welsh/welsh_mabinogion.txt",
    "liber-primus/analysis/round10b/B6-non-english-plaintext/corpora/oe_beowulf.txt",
]


def download(url):
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={"User-Agent": "LP2-register-SFT"}), timeout=60) as response:
                return response.read()
        except OSError:
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)


def fetch_upstream(root):
    def one(path):
        source = ("liber-primus/analysis/round36/P1-panel-r36/inputs_frozen/welsh_mabinogion.txt"
                  if path == "liber-primus/data/keys/welsh/welsh_mabinogion.txt" else path)
        try:
            b = download(PREFIX + "Dukotah/cicada3301/" + UPSTREAM + "/" + source)
        except OSError as exc:
            raise RuntimeError(f"upstream input unavailable: {source}") from exc
        out = root / path
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(b)
    with ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(one, FILES))
    print("Pinned upstream files:", len(FILES), flush=True)


def prepare(root):
    wraw, graw = download(W_URL), download(G_URL)
    doc = ET.fromstring(wraw)
    verses = [(v.attrib["osisID"], "".join(v.itertext()).strip())
              for v in doc.iter("{http://www.bibletechnologies.net/2003/OSIS/namespace}verse")
              if v.attrib["osisID"].startswith(("Gen.", "Exod."))]
    assert len(verses) == 2734, len(verses)
    rows = list(csv.DictReader(io.StringIO(graw.decode("utf-8-sig")), delimiter="\t"))
    assert [int(x["LINE"]) for x in rows] == list(range(1, 2531))
    training = "\n".join(v for _, v in verses) + "\n"
    heldout = "\n".join(row["TEXT"] for row in rows) + "\n"
    def manifest(name, content, raw, url, title, author, edition, extraction):
        d = root / name
        d.mkdir()
        source = content.encode("utf-8")
        (d / "source.txt").write_bytes(source)
        m = {"language": "enm", "register": "late-fourteenth-century Middle English",
             "source": "source.txt", "table": TABLE, "normalize": "NFC",
             "provenance": {"title": title, "author": author, "edition": edition,
                            "url": url, "license": "public domain (historical text/edition)",
                            "source_sha256": sha256(source).hexdigest(),
                            "upstream_raw_sha256": sha256(raw).hexdigest(),
                            "extraction": extraction}}
        path = d / "manifest.json"
        path.write_text(json.dumps(m, ensure_ascii=False, indent=2), encoding="utf-8")
        print("CORPUS_MANIFEST", name, json.dumps(m["provenance"], ensure_ascii=False), flush=True)
        return path
    tr = manifest("train", training, wraw, W_URL, "Wycliffe Bible, Genesis and Exodus",
                  "Wycliffe and followers",
                  "Later Version, attributed to Forshall and Madden 1850; 2009 Free Bible Group text, OSIS conversion 2010",
                  "OSIS verse text, Gen./Exod. only, 2734 verses, LF-joined, final LF")
    ho = manifest("heldout", heldout, graw, G_URL, "Sir Gawayne and the Green Knight",
                  "Anonymous", "Richard Morris, 2nd revised ed. 1869; Gutenberg 14568; jtauber base.tsv",
                  "TEXT column, numbered lines 1-2530, LF-joined, final LF")
    return tr, ho


def train_model(train, folder):
    # Rune n-gram conditional likelihood, orders 1-4 with fixed recursive
    # interpolation and alpha=8. Only the training stream enters the counts.
    counts = [{} for _ in range(4)]
    contexts = [{} for _ in range(4)]
    for i in range(len(train)):
        code, power = 0, 1
        for k in range(min(4, i + 1)):
            code += train[i - k] * power
            power *= 29
            counts[k][code] = counts[k].get(code, 0) + 1
            if k:
                ctx = code // 29
                contexts[k][ctx] = contexts[k].get(ctx, 0) + 1
    (folder / "model.json").write_text(json.dumps(
        {"counts": counts, "contexts": contexts, "n": len(train), "alpha": ALPHA},
        separators=(",", ":")), encoding="utf-8")
    path = folder / "scorer.py"
    path.write_text(
        '''from pathlib import Path
import json, math
REGISTER = "ENM_LATE14_ORTHOGRAPHIC"
M = json.loads(Path(__file__).with_name("model.json").read_text(encoding="utf-8"))
C = [{int(k): v for k, v in d.items()} for d in M["counts"]]
D = [{int(k): v for k, v in d.items()} for d in M["contexts"]]
A = M["alpha"]
def score(idx):
    total = 0.0
    for i, x in enumerate(idx):
        p = (C[0].get(x, 0) + 0.5) / (M["n"] + 14.5)
        code, power = x, 29
        for k in range(1, min(4, i + 1)):
            code += idx[i-k] * power
            power *= 29
            p = (C[k].get(code, 0) + A*p) / (D[k].get(code//29, 0) + A)
        total += math.log(p)
    return total / len(idx)
''', encoding="utf-8")
    return path


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    repo = Path(__file__).resolve().parents[1]
    print("C7/C8 issue2966", UPSTREAM, "seed", SEED, flush=True)
    with TemporaryDirectory(prefix="lp2-enm-") as td:
        root = Path(td)
        upstream = root / "upstream"
        upstream.mkdir()
        fetch_upstream(upstream)
        sys.path.insert(0, str(upstream / "challenges"))
        import c7_corpus_forge as C7
        import c8_register_scorer as C8
        import _sandbox
        local = json.loads((repo / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
        local_runes = [i for p in local["pages"] if p["page"] <= 55 for i in p["indices"]]
        assert local_runes == C8.H.lp2_stream(), "local/upstream LP2 rune stream mismatch"
        tr, ho = prepare(root)
        errors = []
        code, row = C7.check(str(tr), build=True, seed=SEED, errs_out=errors)
        assert code == 0 or (errors and all(e.startswith("label check") for e in errors)), errors
        # C7 explicitly warns its label gate can flag genuine close relatives.
        # Preserve that decision; compute the same placement even when the
        # automatic label screen refuses a new-register classification.
        data = {}
        for label, path in (("train", tr), ("heldout", ho)):
            m = C7.load_manifest(str(path), [])
            sents, unmapped, letters = C7.derive(
                C7.read_source(m, str(path.parent), []), m, [])
            words = [w for s in sents for w in s]
            stream = [x for w in words for x in w]
            rate = sum(unmapped.values()) / letters
            assert rate <= C7.MAX_UNMAPPED, (label, unmapped)
            corpus = ("\n".join(C7.line_of(s) for s in sents) + "\n").encode("utf-8")
            data[label] = {"words": len(words), "sentences": len(sents),
                           "runes": len(stream), "unmapped": dict(unmapped),
                           "unmapped_rate": rate, "corpus_sha256": sha256(corpus).hexdigest()}
            (path.parent / "corpus.txt").write_bytes(corpus)
            if label == "train":
                training = stream
                train_words = words
            else:
                heldout = stream
        dists, hits = C7.label_gate(json.loads(tr.read_text(encoding="utf-8")), train_words)
        placement = C7.place([len(w) for w in train_words], SEED)
        print("C7_RESULT_JSON", json.dumps({"code": code, "errors": errors, "row": row,
              "source_stats": data, "label_jsd": dists, "label_hits": hits, "placement": placement},
              ensure_ascii=False), flush=True)
        model = train_model(training, tr.parent)
        assert training != heldout and len(heldout) > 236
        out = {}
        with _sandbox.Sandbox(str(model), "score", "float", attrs=("REGISTER",)) as sb:
            for L in (236, 120, 60):
                print("Building exact C8 plants and four null classes, L=", L, flush=True)
                sets = C8.build(heldout, SEED, N_POS, N_CHEAP, N_BEAM, False, lengths=(L,))
                inc = C8.evaluate(C8.H.panel_pmax, sets)[L]
                en = C8.evaluate(C8.H.english_score, sets)[L]
                me = C8.evaluate(None, sets, many=lambda xs: sb.map([(x,) for x in xs]))[L]
                out[L] = {"incumbent_panel": inc, "english": en, "middle_english": me}
                print("C8_LENGTH_JSON", json.dumps({"length": L, **out[L]}), flush=True)
        p = out[236]
        incumbent = p["incumbent_panel"]["power"]
        new = p["middle_english"]["power"]
        decision = ("already seen by panel-R36" if incumbent >= C8.FINISH
                    else "additional coverage, one frozen original candidate eligible" if new >= C8.FINISH
                    else "new scorer failed coverage gate")
        print("C8_RESULT_JSON", json.dumps({"seed": SEED, "pos": N_POS, "cheap": N_CHEAP,
              "beam_null": N_BEAM, "lengths": out, "decision": decision}), flush=True)


if __name__ == "__main__":
    main()
