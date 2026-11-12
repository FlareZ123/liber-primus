/*
 * Original LP2 pp40–55 JPEG luma-AC coefficient identity gate.
 *
 * Uses libjpeg's exact quantized DCT blocks, with no image re-encoding,
 * to compare the source's invariant background outside the union of the
 * fixed outer frame margins selected from the repeated page template.
 */
#include <assert.h>
#include <inttypes.h>
#include <stdio.h>
#include <stddef.h>
#include <jpeglib.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    FILE *file;
    struct jpeg_decompress_struct decoder;
    struct jpeg_error_mgr errors;
    jvirt_barray_ptr *coefficients;
} Source;

static void load(Source *out, const char *path) {
    memset(out, 0, sizeof(*out));
    out->file = fopen(path, "rb");
    assert(out->file);
    out->decoder.err = jpeg_std_error(&out->errors);
    jpeg_create_decompress(&out->decoder);
    jpeg_stdio_src(&out->decoder, out->file);
    assert(jpeg_read_header(&out->decoder, TRUE) == JPEG_HEADER_OK);
    out->coefficients = jpeg_read_coefficients(&out->decoder);
    assert(out->coefficients);
    assert(out->decoder.comp_info[0].width_in_blocks == 300);
    assert(out->decoder.comp_info[0].height_in_blocks == 450);
}

static void close_source(Source *source) {
    jpeg_destroy_decompress(&source->decoder);
    fclose(source->file);
}

static int outside(int x, int y) {
    return x < 512 || x >= 1888 || y < 512 || y >= 3200;
}

int main(int argc, char **argv) {
    assert(argc == 2);
    char path[4096];
    Source reference;
    snprintf(path, sizeof(path), "%s/57.jpg", argv[1]);
    load(&reference, path);
    uint64_t eligible = 0;
    uint64_t blocks = 0;
    for (JDIMENSION row = 0; row < 450; ++row) {
        JBLOCKARRAY rr = (*reference.decoder.mem->access_virt_barray)(
            (j_common_ptr)&reference.decoder, reference.coefficients[0],
            row, 1, FALSE);
        for (JDIMENSION col = 0; col < 300; ++col) {
            if (!outside((int)col*8, (int)row*8)) continue;
            ++blocks;
            for (int k=1; k<64; ++k) eligible += (rr[0][col][k] != 0);
        }
    }
    assert(blocks == 77208);
    assert(eligible == 270846);
    printf("reference invariant luma blocks=%" PRIu64
           " exact nonzero AC=%" PRIu64 "\n", blocks, eligible);

    for (int i=58; i<=72; ++i) {
        Source target;
        snprintf(path, sizeof(path), "%s/%02d.jpg", argv[1], i);
        load(&target, path);
        assert(memcmp(
            reference.decoder.quant_tbl_ptrs[0]->quantval,
            target.decoder.quant_tbl_ptrs[0]->quantval,
            sizeof(reference.decoder.quant_tbl_ptrs[0]->quantval)
        ) == 0);
        uint64_t differing_blocks = 0, differing_ac = 0;
        for (JDIMENSION row=0; row<450; ++row) {
            JBLOCKARRAY rr = (*reference.decoder.mem->access_virt_barray)(
                (j_common_ptr)&reference.decoder, reference.coefficients[0],
                row, 1, FALSE);
            JBLOCKARRAY tr = (*target.decoder.mem->access_virt_barray)(
                (j_common_ptr)&target.decoder, target.coefficients[0],
                row, 1, FALSE);
            for (JDIMENSION col=0; col<300; ++col) {
                if (!outside((int)col*8, (int)row*8)) continue;
                int mismatch = 0;
                for (int k=0; k<64; ++k) {
                    if (rr[0][col][k] == tr[0][col][k]) continue;
                    ++mismatch;
                    if (k>0) ++differing_ac;
                }
                differing_blocks += mismatch>0;
            }
        }
        assert(differing_blocks == 0);
        assert(differing_ac == 0);
        printf("page %d: changed blocks=%" PRIu64
               " changed AC=%" PRIu64 "\n",
               i, differing_blocks, differing_ac);
        close_source(&target);
    }
    close_source(&reference);
    return 0;
}
