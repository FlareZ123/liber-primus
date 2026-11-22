/* Original LP2 p34-p39: exact JPEG quantized-DCT identity in the repeated
 * cuneiform header. Source archive images 51.jpg through 56.jpg.
 * Requires libjpeg, compares original coefficients without recompression.
 */
#include <assert.h>
#include <inttypes.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <jpeglib.h>

typedef struct {
    FILE *file;
    struct jpeg_decompress_struct decoder;
    struct jpeg_error_mgr errors;
    jvirt_barray_ptr *blocks;
} Source;

static void load(Source *source, const char *path) {
    memset(source, 0, sizeof(*source));
    source->file = fopen(path, "rb");
    assert(source->file);
    source->decoder.err = jpeg_std_error(&source->errors);
    jpeg_create_decompress(&source->decoder);
    jpeg_stdio_src(&source->decoder, source->file);
    assert(jpeg_read_header(&source->decoder, TRUE) == JPEG_HEADER_OK);
    assert(source->decoder.image_width == 2400);
    assert(source->decoder.image_height == 3600);
    assert(source->decoder.num_components == 3);
    source->blocks = jpeg_read_coefficients(&source->decoder);
    assert(source->blocks);
}
static void close_source(Source *source) {
    jpeg_destroy_decompress(&source->decoder);
    fclose(source->file);
}
static uint64_t compare_region(Source *a, Source *b, int component,
                               JDIMENSION first, JDIMENSION last,
                               uint64_t *reference_nonzero) {
    jpeg_component_info *ac = &a->decoder.comp_info[component];
    jpeg_component_info *bc = &b->decoder.comp_info[component];
    assert(ac->width_in_blocks == bc->width_in_blocks);
    assert(ac->height_in_blocks == bc->height_in_blocks);
    assert(ac->v_samp_factor == bc->v_samp_factor);
    assert(ac->h_samp_factor == bc->h_samp_factor);
    assert(memcmp(a->decoder.quant_tbl_ptrs[ac->quant_tbl_no]->quantval,
                  b->decoder.quant_tbl_ptrs[bc->quant_tbl_no]->quantval,
                  sizeof(a->decoder.quant_tbl_ptrs[ac->quant_tbl_no]->quantval)) == 0);
    assert(last <= ac->height_in_blocks);
    uint64_t changed = 0;
    *reference_nonzero = 0;
    for (JDIMENSION y=first; y<last; ++y) {
        JBLOCKARRAY aa = (*a->decoder.mem->access_virt_barray)(
            (j_common_ptr)&a->decoder, a->blocks[component], y, 1, FALSE);
        JBLOCKARRAY bb = (*b->decoder.mem->access_virt_barray)(
            (j_common_ptr)&b->decoder, b->blocks[component], y, 1, FALSE);
        for (JDIMENSION x=0; x<ac->width_in_blocks; ++x) {
            for (int k=0; k<64; ++k) {
                JCOEF u=aa[0][x][k], v=bb[0][x][k];
                *reference_nonzero += (u!=0);
                changed += (u!=v);
            }
        }
    }
    return changed;
}
int main(int argc, char **argv) {
    assert(argc==2);
    char path[4096];
    Source a;
    snprintf(path,sizeof(path),"%s/51.jpg",argv[1]);
    load(&a,path);
    uint64_t compared=0, unchanged_nonzero=0;
    for (int i=52; i<=56; ++i) {
        Source b;
        snprintf(path,sizeof(path),"%s/%02d.jpg",argv[1],i);
        load(&b,path);
        for (int c=0; c<3; ++c) {
            jpeg_component_info *ac=&a.decoder.comp_info[c];
            JDIMENSION end=(JDIMENSION)(600*ac->v_samp_factor/
                                       (8*a.decoder.max_v_samp_factor));
            uint64_t nz=0;
            uint64_t mismatches=compare_region(&a,&b,c,0,end,&nz);
            uint64_t expected=(c==0?48059:(c==1?25:3));
            assert(nz==expected);
            assert(mismatches==0);
            compared+=(uint64_t)end*ac->width_in_blocks*64;
            unchanged_nonzero+=nz;
            if(c==0){
                uint64_t control_nz=0;
                uint64_t control_diff=compare_region(&a,&b,0,end,200,&control_nz);
                assert(control_diff>0); /* variable printed text, positive control */
                printf("51 vs %d: top600 luma differences=%" PRIu64
                       "; lower-text luma differences=%" PRIu64 "\n",
                       i,mismatches,control_diff);
            }
        }
        close_source(&b);
    }
    assert(compared==10752000);
    assert(unchanged_nonzero==240435);
    printf("PASS: %" PRIu64 " original quantized JPEG coefficients equal; "
           "%" PRIu64 " nonzero baseline coefficients examined across five pairs\n",
           compared,unchanged_nonzero);
    close_source(&a);
    return 0;
}
