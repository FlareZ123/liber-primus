#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <numeric>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>
#ifdef _OPENMP
#include <omp.h>
#endif

namespace {
constexpr int PROBE = 128;
constexpr int CHAPTER = 729;
constexpr int TOP_ORIGINAL = 2048;
constexpr int TOP_POSITIVE = 10;
constexpr int BLOCK_BYTES = 32;
enum class Mode { DeltaRank28, ExcludedRank28 };
const char* mode_name(Mode m) { return m == Mode::DeltaRank28 ? "delta_rank28" : "excluded_rank28"; }

struct TopItem { int16_t score; uint64_t offset; };
struct ScanResult {
    uint64_t scanned = 0;
    int16_t minimum = 0, maximum = 0;
    double mean = 0.0, standard_deviation = 0.0;
    std::vector<TopItem> top;
};
struct FullCandidate {
    uint64_t offset = 0;
    int16_t probe_score = 0;
    int32_t chapter_score = 0;
    double ioc = 0.0;
    std::vector<uint8_t> plaintext;
};

std::vector<uint8_t> read_bytes(const std::string& path) {
    std::ifstream in(path, std::ios::binary);
    if (!in) throw std::runtime_error("cannot open " + path);
    in.seekg(0, std::ios::end);
    const auto n = in.tellg();
    if (n < 0) throw std::runtime_error("cannot size " + path);
    in.seekg(0, std::ios::beg);
    std::vector<uint8_t> data(static_cast<size_t>(n));
    if (!data.empty()) in.read(reinterpret_cast<char*>(data.data()), static_cast<std::streamsize>(data.size()));
    if (!in) throw std::runtime_error("short read " + path);
    return data;
}
std::array<int16_t, 29> read_weights(const std::string& path) {
    std::ifstream in(path, std::ios::binary);
    if (!in) throw std::runtime_error("cannot open " + path);
    std::array<int16_t, 29> w{};
    in.read(reinterpret_cast<char*>(w.data()), static_cast<std::streamsize>(sizeof(w)));
    if (!in || in.peek() != EOF) throw std::runtime_error("weight file must contain exactly 29 int16 values");
    return w;
}
int32_t score_plain(const std::vector<uint8_t>& p, const std::array<int16_t, 29>& w) {
    int32_t s = 0; for (uint8_t x : p) s += w[x]; return s;
}
double index_of_coincidence(const std::vector<uint8_t>& p) {
    std::array<uint64_t, 29> c{}; for (uint8_t x : p) ++c[x];
    uint64_t n = 0; for (uint64_t x : c) n += x * (x - 1);
    const double len = static_cast<double>(p.size());
    return static_cast<double>(n) / (len * (len - 1.0));
}
std::vector<uint8_t> decrypt_rank28(const std::vector<uint8_t>& c, const uint8_t* k, Mode m) {
    std::vector<uint8_t> p(c.size()); if (c.empty()) return p;
    p[0] = static_cast<uint8_t>((static_cast<int>(c[0]) - (k[0] % 29) + 29) % 29);
    for (size_t i = 1; i < c.size(); ++i) {
        const int prev = c[i - 1], cur = c[i];
        if (cur == prev) { p[i] = 28; continue; }
        const int r = m == Mode::DeltaRank28 ? (cur - prev - 1 + 29) % 29 : cur - (cur > prev ? 1 : 0);
        p[i] = static_cast<uint8_t>((r - (k[i] % 28) + 28) % 28);
    }
    return p;
}
std::vector<uint8_t> encrypt_rank28(const std::vector<uint8_t>& p, const uint8_t* k, Mode m) {
    std::vector<uint8_t> c(p.size()); if (p.empty()) return c;
    c[0] = static_cast<uint8_t>((static_cast<int>(p[0]) + (k[0] % 29)) % 29);
    for (size_t i = 1; i < p.size(); ++i) {
        const int prev = c[i - 1], x = p[i];
        if (x == 28) { c[i] = static_cast<uint8_t>(prev); continue; }
        const int r = (x + (k[i] % 28)) % 28;
        c[i] = static_cast<uint8_t>(m == Mode::DeltaRank28 ? (prev + r + 1) % 29 : r + (r >= prev ? 1 : 0));
    }
    return c;
}
void exhaustive_inverse_selftest() {
    for (Mode m : {Mode::DeltaRank28, Mode::ExcludedRank28}) {
        for (int prev = 0; prev < 29; ++prev) for (int p = 0; p < 29; ++p) for (int k = 0; k < 256; ++k) {
            int c = prev;
            if (p != 28) {
                const int r = (p + (k % 28)) % 28;
                c = m == Mode::DeltaRank28 ? (prev + r + 1) % 29 : r + (r >= prev ? 1 : 0);
            }
            int recovered = 28;
            if (c != prev) {
                const int r = m == Mode::DeltaRank28 ? (c - prev - 1 + 29) % 29 : c - (c > prev ? 1 : 0);
                recovered = (r - (k % 28) + 28) % 28;
            }
            if (recovered != p) throw std::runtime_error("rank28 successor inverse self-test failed");
        }
        for (int p = 0; p < 29; ++p) for (int k = 0; k < 256; ++k)
            if (((p + (k % 29)) % 29 - (k % 29) + 29) % 29 != p)
                throw std::runtime_error("first-rune mod29 inverse self-test failed");
    }
}

ScanResult scan_tape(const std::vector<uint8_t>& tape, const std::vector<uint8_t>& cipher,
                     const std::array<int16_t, 29>& w, Mode mode, size_t keep_top) {
    if (cipher.size() < PROBE || tape.size() < PROBE) throw std::runtime_error("short scan input");
    const size_t n = tape.size() - PROBE + 1;
    std::vector<int16_t> scores(n, 0);
    std::array<int16_t, 256> lookup{};
#ifdef _OPENMP
#pragma omp parallel
    {
        for (int pos = 0; pos < PROBE; ++pos) {
#pragma omp single
            {
                const int cur = cipher[pos];
                if (pos == 0) {
                    for (int b = 0; b < 256; ++b) lookup[b] = w[(cur - (b % 29) + 29) % 29];
                } else {
                    const int prev = cipher[pos - 1];
                    if (cur == prev) lookup.fill(w[28]);
                    else {
                        const int r = mode == Mode::DeltaRank28 ? (cur - prev - 1 + 29) % 29 : cur - (cur > prev ? 1 : 0);
                        for (int b = 0; b < 256; ++b) lookup[b] = w[(r - (b % 28) + 28) % 28];
                    }
                }
            }
#pragma omp for simd schedule(static)
            for (long long off = 0; off < static_cast<long long>(n); ++off) {
                const size_t i = static_cast<size_t>(off);
                scores[i] = static_cast<int16_t>(scores[i] + lookup[tape[i + static_cast<size_t>(pos)]]);
            }
        }
    }
#else
    for (int pos = 0; pos < PROBE; ++pos) {
        const int cur = cipher[pos];
        if (pos == 0) for (int b = 0; b < 256; ++b) lookup[b] = w[(cur - (b % 29) + 29) % 29];
        else {
            const int prev = cipher[pos - 1];
            if (cur == prev) lookup.fill(w[28]);
            else {
                const int r = mode == Mode::DeltaRank28 ? (cur - prev - 1 + 29) % 29 : cur - (cur > prev ? 1 : 0);
                for (int b = 0; b < 256; ++b) lookup[b] = w[(r - (b % 28) + 28) % 28];
            }
        }
        for (size_t off = 0; off < n; ++off) scores[off] = static_cast<int16_t>(scores[off] + lookup[tape[off + static_cast<size_t>(pos)]]);
    }
#endif
    int16_t minv = std::numeric_limits<int16_t>::max(), maxv = std::numeric_limits<int16_t>::min();
    long double sum = 0.0L, sumsq = 0.0L;
#ifdef _OPENMP
#pragma omp parallel for reduction(min:minv) reduction(max:maxv) reduction(+:sum,sumsq) schedule(static)
#endif
    for (long long i = 0; i < static_cast<long long>(n); ++i) {
        const int16_t v = scores[static_cast<size_t>(i)];
        minv = std::min(minv, v); maxv = std::max(maxv, v);
        sum += v; sumsq += static_cast<long double>(v) * v;
    }
    const long double mean = sum / static_cast<long double>(n);
    const long double var = std::max(0.0L, sumsq / static_cast<long double>(n) - mean * mean);
    ScanResult result;
    result.scanned = n; result.minimum = minv; result.maximum = maxv;
    result.mean = static_cast<double>(mean); result.standard_deviation = std::sqrt(static_cast<double>(var));
    if (keep_top > 0) {
        keep_top = std::min(keep_top, n);
        std::array<uint64_t, 65536> hist{};
        for (int16_t v : scores) ++hist[static_cast<uint16_t>(v)];
        uint64_t seen = 0; int threshold = -32768;
        for (int s = 32767; s >= -32768; --s) {
            const uint64_t cnt = hist[static_cast<uint16_t>(static_cast<int16_t>(s))];
            if (seen + cnt >= keep_top) { threshold = s; break; }
            seen += cnt;
        }
        std::vector<TopItem> candidates;
        candidates.reserve(static_cast<size_t>(seen + hist[static_cast<uint16_t>(static_cast<int16_t>(threshold))]));
        for (size_t off = 0; off < n; ++off) if (scores[off] >= threshold)
            candidates.push_back({scores[off], static_cast<uint64_t>(off)});
        std::sort(candidates.begin(), candidates.end(), [](const TopItem& a, const TopItem& b) {
            return a.score != b.score ? a.score > b.score : a.offset < b.offset;
        });
        if (candidates.size() > keep_top) candidates.resize(keep_top);
        result.top = std::move(candidates);
    }
    return result;
}
std::vector<FullCandidate> full_candidates(const ScanResult& scan, const std::vector<uint8_t>& tape,
                                           const std::vector<uint8_t>& cipher,
                                           const std::array<int16_t, 29>& w, Mode m) {
    std::vector<FullCandidate> out;
    for (const auto& item : scan.top) {
        if (item.offset + CHAPTER > tape.size()) continue;
        auto p = decrypt_rank28(cipher, tape.data() + item.offset, m);
        out.push_back({item.offset, item.score, score_plain(p, w), index_of_coincidence(p), std::move(p)});
    }
    std::sort(out.begin(), out.end(), [](const FullCandidate& a, const FullCandidate& b) {
        if (a.chapter_score != b.chapter_score) return a.chapter_score > b.chapter_score;
        if (a.ioc != b.ioc) return a.ioc > b.ioc;
        return a.offset < b.offset;
    });
    if (out.size() > 5) out.resize(5);
    return out;
}
std::vector<uint8_t> random_bytes(size_t n, uint64_t seed) {
    std::mt19937_64 rng(seed); std::vector<uint8_t> out(n);
    for (auto& x : out) x = static_cast<uint8_t>(rng() & 0xffU);
    return out;
}
void write_u8_array(std::ostream& out, const std::vector<uint8_t>& v) {
    out << "["; for (size_t i = 0; i < v.size(); ++i) { if (i) out << ","; out << static_cast<unsigned>(v[i]); } out << "]";
}
void write_scan(std::ostream& out, const ScanResult& s, const std::vector<FullCandidate>& full) {
    out << "{\"scanned_offsets\":" << s.scanned << ",\"min\":" << s.minimum << ",\"max\":" << s.maximum
        << ",\"mean\":" << s.mean << ",\"stddev\":" << s.standard_deviation << ",\"top_probe\":[";
    for (size_t i = 0; i < std::min<size_t>(20, s.top.size()); ++i) {
        if (i) out << ","; out << "{\"offset\":" << s.top[i].offset << ",\"score\":" << s.top[i].score << "}";
    }
    out << "],\"top_full729\":[";
    for (size_t i = 0; i < full.size(); ++i) {
        if (i) out << ","; const auto& c = full[i];
        out << "{\"offset\":" << c.offset << ",\"probe_score\":" << c.probe_score
            << ",\"chapter_score\":" << c.chapter_score << ",\"ioc\":" << c.ioc << ",\"runes\":";
        write_u8_array(out, c.plaintext); out << "}";
    }
    out << "]}";
}
struct Positive {
    uint64_t offset = 330103, rank = 0;
    int first128 = 0, chapter = 0;
    double ioc = 0.0;
    std::vector<uint8_t> recovered;
};
Positive lp1_positive(const std::vector<uint8_t>& lp1, const std::array<int16_t, 29>& w, Mode m) {
    auto tape = random_bytes(1'000'000, 33012013ULL);
    auto cipher = encrypt_rank28(lp1, tape.data() + 330103, m);
    auto recovered = decrypt_rank28(cipher, tape.data() + 330103, m);
    if (recovered != lp1) throw std::runtime_error("LP1 positive failed exact inverse");
    auto scan = scan_tape(tape, cipher, w, m, TOP_POSITIVE);
    uint64_t rank = 0;
    for (size_t i = 0; i < scan.top.size(); ++i) if (scan.top[i].offset == 330103) { rank = i + 1; break; }
    if (rank != 1) throw std::runtime_error(std::string("LP1 positive not ranked first: ") + mode_name(m));
    return {330103, rank, scan.top.front().score, score_plain(lp1, w), index_of_coincidence(lp1), std::move(recovered)};
}
void write_positive(std::ostream& out, const Positive& p) {
    out << "{\"planted_offset\":" << p.offset << ",\"rank\":" << p.rank
        << ",\"first128_score\":" << p.first128 << ",\"chapter_score\":" << p.chapter
        << ",\"ioc\":" << p.ioc << ",\"exact_recovered_runes\":" << p.recovered.size()
        << ",\"recovered_runes\":";
    write_u8_array(out, p.recovered); out << "}";
}
void make_block_shuffle(const std::vector<uint8_t>& original, std::vector<uint8_t>& shuffled, uint64_t seed) {
    const size_t blocks = original.size() / BLOCK_BYTES, tail = original.size() - blocks * BLOCK_BYTES;
    std::vector<size_t> order(blocks); std::iota(order.begin(), order.end(), 0);
    std::mt19937_64 rng(seed); std::shuffle(order.begin(), order.end(), rng);
    for (size_t i = 0; i < blocks; ++i)
        std::memcpy(shuffled.data() + i * BLOCK_BYTES, original.data() + order[i] * BLOCK_BYTES, BLOCK_BYTES);
    if (tail) std::memcpy(shuffled.data() + blocks * BLOCK_BYTES, original.data() + blocks * BLOCK_BYTES, tail);
}
} // namespace

int main(int argc, char** argv) {
    if (argc != 6 && argc != 7) {
        std::cerr << "usage: rank28_independent TAPE.bin CIPHER.bin WEIGHTS.bin LP1.bin OUTPUT.json [NULL_REPS=20]\n";
        return 2;
    }
    try {
#ifdef _OPENMP
        omp_set_dynamic(0);
#endif
        const auto start = std::chrono::steady_clock::now();
        auto tape = read_bytes(argv[1]), cipher = read_bytes(argv[2]), lp1 = read_bytes(argv[4]);
        const auto weights = read_weights(argv[3]);
        const std::string output_path = argv[5];
        const int reps = argc == 7 ? std::stoi(argv[6]) : 20;
        if (tape.size() != 118'818'811 || cipher.size() != CHAPTER || lp1.size() != CHAPTER || reps < 1)
            throw std::runtime_error("unexpected input size or null replicate count");
        exhaustive_inverse_selftest();
        std::cerr << "INPUTS tape=" << tape.size() << " cipher=" << cipher.size()
                  << " lp1=" << lp1.size() << " null_reps=" << reps << "\n";

        const std::array<Mode, 2> modes{Mode::DeltaRank28, Mode::ExcludedRank28};
        std::array<ScanResult, 2> original;
        std::array<std::vector<FullCandidate>, 2> full;
        std::array<Positive, 2> positives;
        for (size_t i = 0; i < 2; ++i) {
            const auto t0 = std::chrono::steady_clock::now();
            original[i] = scan_tape(tape, cipher, weights, modes[i], TOP_ORIGINAL);
            full[i] = full_candidates(original[i], tape, cipher, weights, modes[i]);
            std::cerr << "ORIGINAL " << mode_name(modes[i]) << " offsets=" << original[i].scanned
                      << " max=" << original[i].maximum << " best729=" << full[i][0].chapter_score
                      << " seconds=" << std::chrono::duration<double>(std::chrono::steady_clock::now() - t0).count() << "\n";
            positives[i] = lp1_positive(lp1, weights, modes[i]);
            std::cerr << "LP1_POSITIVE " << mode_name(modes[i]) << " rank=" << positives[i].rank
                      << " first128=" << positives[i].first128 << " full729=" << positives[i].chapter
                      << " ioc=" << positives[i].ioc << "\n";
        }

        const int observed_family = std::max(original[0].maximum, original[1].maximum);
        std::vector<uint8_t> shuffled(tape.size());
        std::vector<int> nd, ne, nf;
        nd.reserve(reps); ne.reserve(reps); nf.reserve(reps);
        for (int r = 0; r < reps; ++r) {
            make_block_shuffle(tape, shuffled, 0xC1CADA3301ULL + static_cast<uint64_t>(r) * 0x9E3779B97F4A7C15ULL);
            const auto a = scan_tape(shuffled, cipher, weights, Mode::DeltaRank28, 0);
            const auto b = scan_tape(shuffled, cipher, weights, Mode::ExcludedRank28, 0);
            nd.push_back(a.maximum); ne.push_back(b.maximum); nf.push_back(std::max(a.maximum, b.maximum));
            std::cerr << "NULL " << r + 1 << "/" << reps << " delta=" << a.maximum
                      << " excluded=" << b.maximum << " family=" << nf.back() << "\n";
        }
        int ed = 0, ee = 0, ef = 0;
        for (int x : nd) if (x >= original[0].maximum) ++ed;
        for (int x : ne) if (x >= original[1].maximum) ++ee;
        for (int x : nf) if (x >= observed_family) ++ef;
        const double pd = double(1 + ed) / (reps + 1), pe = double(1 + ee) / (reps + 1), pf = double(1 + ef) / (reps + 1);

        std::ofstream out(output_path);
        if (!out) throw std::runtime_error("cannot create output JSON");
        out << std::setprecision(17);
        out << "{\n\"engine\":\"independent C++20/OpenMP position-major 256-entry lookup scan\",\n";
        out << "\"inverse_selftest\":\"PASS: both rank28 orderings, all 29 predecessors × 29 plaintext values × 256 key bytes\",\n";
        out << "\"original\":{\"delta_rank28\":"; write_scan(out, original[0], full[0]);
        out << ",\"excluded_rank28\":"; write_scan(out, original[1], full[1]); out << "},\n";
        out << "\"authentic_lp1_positive\":{\"delta_rank28\":"; write_positive(out, positives[0]);
        out << ",\"excluded_rank28\":"; write_positive(out, positives[1]); out << "},\n";
        out << "\"null\":{\"type\":\"32-byte block permutation of original byte tape; exact byte histogram and within-block structure preserved; each replicate scans all valid offsets under both models\",";
        out << "\"block_bytes\":" << BLOCK_BYTES << ",\"replicates\":" << reps << ",\"observed_family_max\":" << observed_family << ",\"delta_maxima\":[";
        for (size_t i = 0; i < nd.size(); ++i) { if (i) out << ","; out << nd[i]; }
        out << "],\"excluded_maxima\":[";
        for (size_t i = 0; i < ne.size(); ++i) { if (i) out << ","; out << ne[i]; }
        out << "],\"family_maxima\":[";
        for (size_t i = 0; i < nf.size(); ++i) { if (i) out << ","; out << nf[i]; }
        out << "],\"p_delta\":" << pd << ",\"p_excluded\":" << pe
            << ",\"p_familywise\":" << pf << ",\"familywise_exceedances\":" << ef << "}\n}\n";
        out.close();
        if (!out) throw std::runtime_error("failed writing output JSON");
        std::cerr << "OUTPUT " << output_path << " elapsed_seconds="
                  << std::chrono::duration<double>(std::chrono::steady_clock::now() - start).count()
                  << " familywise_p=" << pf << "\n";
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "ERROR: " << e.what() << "\n";
        return 1;
    }
}
