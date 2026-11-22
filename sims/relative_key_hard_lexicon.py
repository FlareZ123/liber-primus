"""Exact dictionary-constrained LP2 shared-key sieve.

Usage (Python 3.11+, cmudict==1.1.3, textblob==0.19.0):
    python sims/relative_key_hard_lexicon.py --pair 28 42
    python sims/relative_key_hard_lexicon.py --all --max-depth 100

Scans C_a-C_b = scale*(P_a-P_b) (mod29), with each P an encoded
English GP rune stream respecting its own observed word boundaries.
Exhaustive product-trie reachability. No beam pruning and no OOV fallback.
"""
import argparse
import collections
import json
import re
from pathlib import Path
import cmudict
import textblob

ROOT = Path(__file__).resolve().parents[1]
TRANSLIT = ('F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S',
            'T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA')
ENCODING = {letter: i for i, letter in enumerate(TRANSLIT)}
CHARACTERS = re.compile(r'[a-z]+\Z')


def encode(word):
    text = word.upper().replace('QU','CW').replace('V','U').replace('K','C').replace('Z','S')
    output = []
    i = 0
    while i < len(text):
        two = text[i:i+2]
        if two in ENCODING:
            output.append(ENCODING[two]); i += 2
        elif text[i] in ENCODING:
            output.append(ENCODING[text[i]]); i += 1
        else:
            return None
    return tuple(output)


def load_lexicon():
    counts = collections.defaultdict(float)
    source = Path(textblob.__file__).parent / 'en' / 'en-spelling.txt'
    for line in source.read_text('utf-8').splitlines():
        parts = line.split()
        if len(parts) != 2 or not parts[1].isdigit() or not CHARACTERS.fullmatch(parts[0]):
            continue
        word = encode(parts[0])
        if word and len(word) <= 24:
            counts[word] += float(parts[1])
    spelling_words = len(counts)
    for word in set(cmudict.words()):
        if not CHARACTERS.fullmatch(word):
            continue
        gp = encode(word)
        if gp and len(gp) <= 24:
            counts[gp] += 0.05
    return counts, spelling_words


class Trie:
    def __init__(self):
        self.children = [{}]
        self.terminal = [False]

    def add(self, word):
        node = 0
        for rune in word:
            next_node = self.children[node].get(rune)
            if next_node is None:
                next_node = len(self.children)
                self.children[node][rune] = next_node
                self.children.append({})
                self.terminal.append(False)
            node = next_node
        self.terminal[node] = True


def build_tries(words):
    by_length = {0: Trie()}
    for word in words:
        by_length[0].add(word)
        trie = by_length.setdefault(len(word), Trie())
        trie.add(word)
    return by_length


def word_lengths(page):
    """0 indicates a right-censored word; -1 indicates unknown page prefix."""
    ends = page['end']; size = len(ends); out = [0] * size
    i = 0
    while i < size:
        j = i
        while j + 1 < size and not ends[j]:
            j += 1
        length = j - i + 1 if ends[j] else 0
        for k in range(i, j + 1):
            out[k] = length
        i = j + 1
    # Physical pages can begin mid-word. Exempt the entire initial fragment.
    for i in range(size):
        out[i] = -1
        if ends[i]:
            break
    return out


def load_pages():
    corpus = json.loads((ROOT / 'resources/liber-primus/lp2-corpus.json').read_text('utf-8'))
    chunks = (ROOT / 'resources/lp2-transcription.txt').read_text('utf-8').split('%')
    rune_to_index = {r: i for i, r in enumerate(corpus['runes'])}
    pages = []
    for item in corpus['pages']:
        if item.get('status') == 'solved' or item['page'] >= 56 or not item['indices']:
            continue
        physical = item['page']
        segment = chunks[physical if physical < 51 else physical - 1]
        xs, starts, ends = [], [], []
        active = False
        for ch in segment:
            if ch in rune_to_index:
                xs.append(rune_to_index[ch]); starts.append(not active)
                ends.append(False); active = True
            elif ch not in '/ \t\r\n':
                # Printed slash/newlines only wrap lines; other nonrunes split words.
                if ends:
                    ends[-1] = True
                active = False
        if xs != item['indices']:
            raise ValueError(f'Corpus/transcript mismatch on page {physical}')
        if not xs:
            continue
        page = {'page': physical, 'xs': xs, 'start': starts, 'end': ends}
        page['lengths'] = word_lengths(page)
        pages.append(page)
    return pages


def search(a, b, tries, scale=4, shift=0, depth=None):
    """Exhaustive product-automaton reachability; no OOV or beam pruning."""
    n = min(len(a['xs']), len(b['xs']))
    if depth is not None:
        n = min(n, depth)
    inverse = pow(scale, -1, 29)
    states = {(0, 0)}
    maxima = 0
    for t in range(n):
        da = a['lengths'][t]; db = b['lengths'][t]
        ta = tries.get(da) if da != -1 else None
        tb = tries.get(db) if db != -1 else None
        if (da != -1 and ta is None) or (db != -1 and tb is None):
            return {'depth':t, 'peak_states':maxima, 'last_states':0}
        difference = (inverse * (a['xs'][t] - b['xs'][(t + shift) % len(b['xs'])])) % 29
        new_states = set()
        for na, nb in states:
            pa = 0 if a['start'][t] else na
            pb = 0 if b['start'][t] else nb
            letters_a = range(29) if da == -1 else ta.children[pa]
            edges_b = None if db == -1 else tb.children[pb]
            for p in letters_a:
                q = (p - difference) % 29
                next_a = 0 if da == -1 else ta.children[pa][p]
                next_b = 0 if db == -1 else edges_b.get(q)
                if next_b is None:
                    continue
                if da != -1 and a['end'][t] and not ta.terminal[next_a]:
                    continue
                if db != -1 and b['end'][t] and not tb.terminal[next_b]:
                    continue
                new_states.add((next_a, next_b))
        maxima = max(maxima, len(new_states))
        if not new_states:
            return {'depth':t, 'peak_states':maxima, 'last_states':0}
        states = new_states
    return {'depth':n, 'peak_states':maxima, 'last_states':len(states)}



def synthetic_controls(pages, words, tries, trials=5):
    """Construct authentic-boundary GP dictionary plaintext and shared-key pairs."""
    import random
    gen = random.Random(3301)
    pool = collections.defaultdict(list)
    for word in words:
        if len(word) < 24:
            pool[len(word)].append(word)

    def sample(page):
        result = []
        i = 0
        ends = page['end']
        while i < len(ends):
            j = i
            while j + 1 < len(ends) and not ends[j]:
                j += 1
            length = j-i+1
            available = pool[length] if ends[j] else [
                word for k, options in pool.items() if k >= length for word in options
            ]
            if not available:
                raise ValueError(f'No positive-control word of length {length}')
            word = gen.choice(available)
            result.extend(word[:length])
            i = j+1
        return result

    a, b = pages[28], pages[42]
    results = []
    for trial in range(trials):
        pa, pb = sample(a), sample(b)
        key = [gen.randrange(29) for _ in range(len(pb))]
        ca = dict(a, xs=[(4*p + key[i])%29 for i,p in enumerate(pa)])
        cb = dict(b, xs=[(4*p + key[i])%29 for i,p in enumerate(pb)])
        check = search(ca, cb, tries, scale=4)
        expected = min(len(pa), len(pb))
        assert check['depth'] == expected, f'Shared-key plant rejected: {check}'
        results.append({'trial':trial,'expected':expected,**check})
    return results


def run(args):
    words, spelling_words = load_lexicon()
    tries = build_tries(words)
    pages = load_pages()
    by_page = {p['page']:p for p in pages}
    output = {'lexicon_gp_words':len(words), 'textblob_gp_words':spelling_words,
              'pages':len(pages),
              'model':'shared additive keystream; affine-scaled GP-English words',
              'initial_page_fragment':'unconstrained',
              'dictionary':'TextBlob 0.19.0 en-spelling + CMUdict 1.1.3',
              'search':'exact length-conditioned product tries; no beam or OOV fallback'}
    if args.self_test:
        output['planted_controls'] = synthetic_controls(by_page, words, tries)
    if args.all:
        candidates = []
        histogram = collections.Counter()
        for i, a in enumerate(pages):
            for b in pages[i+1:]:
                for scale in range(1,29):
                    hit = search(a,b,tries,scale=scale,depth=args.max_depth)
                    histogram[hit['depth']] += 1
                    if hit['depth'] >= args.threshold:
                        candidates.append({'pair':[a['page'],b['page']], 'scale':scale, **hit})
        output.update({'searched':len(pages)*(len(pages)-1)*14,
                       'max_depth':args.max_depth,'threshold':args.threshold,
                       'top_candidates':sorted(candidates,key=lambda x:x['depth'],reverse=True)[:100],
                       'depth_histogram':dict(sorted(histogram.items()))})
    else:
        a=by_page[args.pair[0]]; b=by_page[args.pair[1]]
        output['pair']=args.pair
        output['scales']={str(s):search(a,b,tries,scale=s,depth=args.max_depth)
                          for s in args.scales}
    print(json.dumps(output,indent=2))


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pair',type=int,nargs=2,default=[28,42])
    parser.add_argument('--scales',type=int,nargs='+',default=[1,4,7,22])
    parser.add_argument('--all',action='store_true')
    parser.add_argument('--self-test',action='store_true')
    parser.add_argument('--max-depth',type=int,default=None)
    parser.add_argument('--threshold',type=int,default=100)
    run(parser.parse_args())
