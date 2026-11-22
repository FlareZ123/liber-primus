/*
 * Original-source LP2 p0/p1/p2 three-way DCT background intersection.
 * Build: cc -O2 -std=c99 sims/lp2_p0_p1_p2_f5_triple_stencil_sft.c -ljpeg -o p0_p1_p2_stencil
 * Run from repository root. Requires resources/liber-primus/17.jpg, 18.jpg, 19.jpg.
 * This is a source-image calibration prerequisite, not a ciphertext decoder.
 */
#include <jpeglib.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    struct jpeg_decompress_struct jpeg;
    struct jpeg_error_mgr error;
    FILE *file;
    jvirt_barray_ptr *coefficients;
} Source;

static void open_source(Source *source, int physical_page) {
    char filename[128];
    snprintf(filename, sizeof(filename), "resources/liber-primus/%02d.jpg", 17 + physical_page);
    memset(source, 0, sizeof(*source));
    source->jpeg.err = jpeg_std_error(&source->error);
    jpeg_create_decompress(&source->jpeg);
    source->file = fopen(filename, "rb");
    if (!source->file) {
        perror(filename);
        exit(EXIT_FAILURE);
    }
    jpeg_stdio_src(&source->jpeg, source->file);
    jpeg_read_header(&source->jpeg, TRUE);
    source->coefficients = jpeg_read_coefficients(&source->jpeg);
    if (source->jpeg.comp_info[0].width_in_blocks != 300 ||
        source->jpeg.comp_info[0].height_in_blocks != 450) {
        fprintf(stderr, "Unexpected 2400x3600 source geometry for page %d\n", physical_page);
        exit(EXIT_FAILURE);
    }
}

static void close_source(Source *source) {
    jpeg_destroy_decompress(&source->jpeg);
    fclose(source->file);
}

static int has_ac(const JCOEF *block) {
    for (int k = 1; k < 64; ++k) {
        if (block[k] != 0) return 1;
    }
    return 0;
}

int main(void) {
    Source a, b, c;
    open_source(&a, 0);
    open_source(&b, 1);
    open_source(&c, 2);

    unsigned observed[7] = {0};
    for (int y = 64; y < 400; ++y) {
        JBLOCKARRAY ra = (*a.jpeg.mem->access_virt_barray)(
            (j_common_ptr)&a.jpeg, a.coefficients[0], (JDIMENSION)y, 1, FALSE);
        JBLOCKARRAY rb = (*b.jpeg.mem->access_virt_barray)(
            (j_common_ptr)&b.jpeg, b.coefficients[0], (JDIMENSION)y, 1, FALSE);
        JBLOCKARRAY rc = (*c.jpeg.mem->access_virt_barray)(
            (j_common_ptr)&c.jpeg, c.coefficients[0], (JDIMENSION)y, 1, FALSE);

        for (int ix = 0; ix < 128; ++ix) {
            const int x = ix < 64 ? ix : ix + 172;
            const JCOEF *pa = ra[0][x], *pb = rb[0][x], *pc = rc[0][x];
            const int va = has_ac(pa), vb = has_ac(pb), vc = has_ac(pc);
            const int ab = va && vb && memcmp(pa, pb, sizeof(JBLOCK)) == 0;
            const int ac = va && vc && memcmp(pa, pc, sizeof(JBLOCK)) == 0;
            const int bc = vb && vc && memcmp(pb, pc, sizeof(JBLOCK)) == 0;
            observed[0] += va;
            observed[1] += vb;
            observed[2] += vc;
            observed[3] += ab;
            observed[4] += ac;
            observed[5] += bc;
            observed[6] += ab && ac;
        }
    }

    const unsigned expected[7] = {3787, 3877, 3877, 24, 24, 3877, 24};
    const char *names[7] = {
        "p0 nonzero-AC blocks", "p1 nonzero-AC blocks", "p2 nonzero-AC blocks",
        "p0=p1 blocks", "p0=p2 blocks", "p1=p2 blocks", "p0=p1=p2 blocks"
    };
    int passed = 1;
    for (int i = 0; i < 7; ++i) {
        printf("%s: %u (frozen original expected %u)\n", names[i], observed[i], expected[i]);
        if (observed[i] != expected[i]) passed = 0;
    }
    close_source(&a);
    close_source(&b);
    close_source(&c);
    puts(passed ? "PASS: triple-reference stencil has only 24 blocks" : "FAIL: source geometry/coefficient mismatch");
    return passed ? EXIT_SUCCESS : EXIT_FAILURE;
}
