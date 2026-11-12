// All-offset 64-rune-prefix screen of the 2013 CicadaOS 560.13 GP29 byte pad.
// Full 308-rune scores are computed only for the 2,000 prefix finalists;
// the 50,000-offset positive plant does not calibrate full-file sensitivity.
// Compile with a C++17 compiler. The caller validates the original 118,818,811-byte
// historical file SHA-256 independently before invoking this program.
#include <algorithm>
#include <array>
#include <cassert>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <queue>
#include <stdexcept>
#include <string>
#include <vector>

constexpr size_t TRIGRAMS = 29 * 29 * 29;
constexpr size_t PREFIX = 64;
constexpr size_t BEST = 2000;
constexpr size_t PAD_SIZE = 118818811;
constexpr size_t PLANT_OFFSET = 5000;
constexpr size_t PLANT_CONTROL_WINDOW = 50000;

static int gp(int x) { x %= 29; return x < 0 ? x + 29 : x; }

struct Data {
    std::array<double, TRIGRAMS> model;
    std::vector<unsigned char> original;
    std::vector<unsigned char> native;
};

static Data read_model(const std::string &filename) {
    std::ifstream f(filename, std::ios::binary);
    if (!f) throw std::runtime_error("Model file is unavailable");
    std::uint32_t sizes[3]{};
    f.read(reinterpret_cast<char *>(sizes), sizeof(sizes));
    if (sizes[0] != TRIGRAMS || sizes[1] != 308 || sizes[2] != 308)
        throw std::runtime_error("Model header mismatch");
    Data d{};
    f.read(reinterpret_cast<char *>(d.model.data()), sizeof(double) * TRIGRAMS);
    d.original.resize(sizes[1]);
    d.native.resize(sizes[2]);
    f.read(reinterpret_cast<char *>(d.original.data()), d.original.size());
    f.read(reinterpret_cast<char *>(d.native.data()), d.native.size());
    if (!f || f.peek() != EOF) throw std::runtime_error("Model payload incorrect");
    return d;
}

static std::vector<unsigned char> read_pad(const std::string &filename) {
    std::ifstream file(filename, std::ios::binary | std::ios::ate);
    if (!file || static_cast<size_t>(file.tellg()) != PAD_SIZE)
        throw std::runtime_error("Original 560.13 file missing or wrong byte length");
    std::vector<unsigned char> b(PAD_SIZE);
    file.seekg(0);
    file.read(reinterpret_cast<char *>(b.data()), b.size());
    if (!file) throw std::runtime_error("Pad read incomplete");
    return b;
}

struct Hit {
    double prefixScore;
    std::uint32_t offset;
    int sign;
};
struct LessByScore {
    bool operator()(const Hit &a, const Hit &b) const { return a.prefixScore > b.prefixScore; }
};

static double prefix_score(const std::vector<unsigned char> &cipher,
                           const std::vector<unsigned char> &pad,
                           const std::array<double, TRIGRAMS> &model,
                           size_t offset, int sign) {
    int a = gp(cipher[0] + sign * (pad[offset] % 29));
    int b = gp(cipher[1] + sign * (pad[offset + 1] % 29));
    double score = 0;
    for (size_t i = 2; i < PREFIX; ++i) {
        int c = gp(cipher[i] + sign * (pad[offset + i] % 29));
        score += model[a * 841 + b * 29 + c];
        a = b; b = c;
    }
    return score / (PREFIX - 2);
}

static double full_score(const std::vector<unsigned char> &cipher,
                         const std::vector<unsigned char> &pad,
                         const std::array<double, TRIGRAMS> &model,
                         size_t offset, int sign) {
    int a = gp(cipher[0] + sign * (pad[offset] % 29));
    int b = gp(cipher[1] + sign * (pad[offset + 1] % 29));
    double score = 0;
    for (size_t i = 2; i < cipher.size(); ++i) {
        int c = gp(cipher[i] + sign * (pad[offset + i] % 29));
        score += model[a * 841 + b * 29 + c];
        a = b; b = c;
    }
    return score / (cipher.size() - 2);
}

static std::vector<Hit> scan(const std::vector<unsigned char> &cipher,
                             const std::vector<unsigned char> &pad,
                             const std::array<double, TRIGRAMS> &model,
                             size_t last) {
    std::priority_queue<Hit, std::vector<Hit>, LessByScore> best;
    for (size_t offset = 0; offset < last; ++offset) {
        for (int sign : {-1, +1}) {
            const double score = prefix_score(cipher, pad, model, offset, sign);
            if (best.size() < BEST || score > best.top().prefixScore) {
                best.push({score, static_cast<std::uint32_t>(offset), sign});
                if (best.size() > BEST) best.pop();
            }
        }
    }
    std::vector<Hit> result;
    while (!best.empty()) { result.push_back(best.top()); best.pop(); }
    std::sort(result.begin(), result.end(),
              [](const Hit &a, const Hit &b) { return a.prefixScore > b.prefixScore; });
    return result;
}

static void report(const std::vector<Hit> &hits, const std::vector<unsigned char> &cipher,
                   const std::vector<unsigned char> &pad,
                   const std::array<double, TRIGRAMS> &model, const char *title) {
    struct FullHit { Hit h; double score; };
    std::vector<FullHit> ordered;
    for (const auto &h : hits) {
        ordered.push_back({h, full_score(cipher, pad, model, h.offset, h.sign)});
    }
    std::sort(ordered.begin(), ordered.end(),
              [](const FullHit &a, const FullHit &b) { return a.score > b.score; });
    std::cout << title << ": top " << hits.size()
              << " selected by 64-rune prefix and reranked by complete "
              << cipher.size() << "-rune chapter\n";
    for (size_t i = 0; i < std::min<size_t>(ordered.size(), 8); ++i) {
        const auto &x = ordered[i];
        std::cout << "  rank=" << (i + 1) << " offset=" << x.h.offset
                  << " sign=" << x.h.sign << " prefix=" << x.h.prefixScore
                  << " full=" << x.score << '\n';
    }
}

int main(int argc, char **argv) {
    try {
        if (argc != 3) throw std::runtime_error("Usage: scan PADFILE MODELFILE");
        const Data data = read_model(argv[2]);
        const auto pad = read_pad(argv[1]);
        const auto source = data.original;
        std::vector<unsigned char> planted = data.native;
        for (size_t i = 0; i < planted.size(); ++i)
            planted[i] = gp(planted[i] + (pad[PLANT_OFFSET + i] % 29));

        const auto control = scan(planted, pad, data.model, PLANT_CONTROL_WINDOW);
        size_t trueRank = 0;
        for (size_t i = 0; i < control.size(); ++i) {
            if (control[i].offset == PLANT_OFFSET && control[i].sign == -1)
                trueRank = i + 1;
        }
        if (trueRank == 0 || trueRank > 20)
            throw std::runtime_error("Independent planted English offset not found within top 20");
        for (size_t i = 0; i < data.native.size(); ++i)
            if (gp(planted[i] - (pad[PLANT_OFFSET + i] % 29)) != data.native[i])
                throw std::runtime_error("Native GP planted plaintext mismatch");
        std::cout << std::setprecision(8)
                  << "Positive native-GP source-pad plant: true offset " << PLANT_OFFSET
                  << " / sign -1 found at prefix rank " << trueRank
                  << " among first " << PLANT_CONTROL_WINDOW << " offset positions; "
                  << "all " << data.native.size() << " plaintext runes recover exactly.\n";
        report(control, planted, pad, data.model, "Native planted 50k-offset control");

        const size_t n = pad.size() - source.size() + 1;
        const auto original = scan(source, pad, data.model, n);
        std::cout << "Original p54-p55 direct byte-mod29 pad: exhaustively scored "
                  << (2ULL * n) << " additive candidate alignments ("
                  << n << " offsets, both signs) on the 64-rune prefix. Only the top "
                  << BEST << " receive the full 308-rune score. The plant tests "
                  << PLANT_CONTROL_WINDOW << " offsets, not the entire file.\n";
        report(original, source, pad, data.model, "Original complete 560.13");
        return 0;
    } catch (const std::exception &e) {
        std::cerr << "ERROR: " << e.what() << '\n';
        return 1;
    }
}
