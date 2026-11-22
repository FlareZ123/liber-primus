/* Native LP2 repeated artwork coefficient-difference source test.
 * Compare seven original image-registered exact reused plate groups using
 * original quantized luminance DCT arrays without decoding/re-encoding.
 * Positive: plant and extract 40 known bits in a separate synthetic JPEG.
 * C99 libjpeg, source JPEGs scans 18..72 (physical page +17).
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <jpeglib.h>

#define BW 300
#define BH 450
#define BITS 40

static const unsigned char PAYLOAD[5] = {'3','3','0','1','\n'};

typedef struct {
    struct jpeg_decompress_struct j;
    struct jpeg_error_mgr err;
    FILE *f;
    jvirt_barray_ptr *arr;
} Image;

static void die(const char *what) { fprintf(stderr, "FAIL %s\n", what); exit(2); }
static void load(Image *im, const char *name) {
    memset(im, 0, sizeof(*im));
    im->j.err = jpeg_std_error(&im->err);
    jpeg_create_decompress(&im->j);
    im->f=fopen(name,"rb"); if (!im->f) die(name);
    jpeg_stdio_src(&im->j, im->f);
    if (jpeg_read_header(&im->j, TRUE) != JPEG_HEADER_OK) die("JPEG header");
    if (im->j.image_width != 2400 || im->j.image_height != 3600) die("source dimensions");
    if (im->j.comp_info[0].width_in_blocks != BW ||
        im->j.comp_info[0].height_in_blocks != BH) die("native Y grid");
    im->arr=jpeg_read_coefficients(&im->j);
}
static void close_image(Image *im) {
    jpeg_finish_decompress(&im->j);
    jpeg_destroy_decompress(&im->j);
    fclose(im->f);
}
typedef struct {
    const char *name;
    int first, last, step, nrect;
    int rect[2][4];
} Group;
static const Group GROUPS[] = {
    {"cross",1,2,1,1,{{0,900,450,2650}}},
    {"scrolls",4,7,1,2,{{0,850,560,2600},{1800,850,2400,2600}}},
    {"right_saplings",9,13,2,1,{{1850,600,2400,2900}}},
    {"left_saplings",10,14,2,1,{{0,600,550,2900}}},
    {"insects",24,26,2,2,{{0,1000,520,2600},{1800,1000,2400,2600}}},
    {"cuneiform",34,39,1,1,{{900,250,1450,670}}},
    {"floral",40,55,1,2,{{0,650,550,2950},{1850,650,2400,2950}}},
};
static const Group *FLORAL=&GROUPS[6];
static int in_roi(int bx,int by,const Group *g){
    const int x=bx*8,y=by*8;
    for(int i=0;i<g->nrect;i++){
        const int *r=g->rect[i];
        if(x>=r[0]&&y>=r[1]&&x+8<=r[2]&&y+8<=r[3])return 1;
    }
    return 0;
}
static JCOEF *block(Image *im,int bx,int by,int write) {
    JBLOCKARRAY row=(*im->j.mem->access_virt_barray)(
        (j_common_ptr)&im->j, im->arr[0], (JDIMENSION)by, 1, write);
    return row[0][bx];
}
static void compare_original(Image *ref, const char *folder, int page,const Group *g) {
    char path[1024]; snprintf(path,sizeof(path),"%s/%02d.jpg",folder,page+17);
    Image cand; load(&cand,path);
    int qdiff=0;
    JQUANT_TBL *a=ref->j.quant_tbl_ptrs[ref->j.comp_info[0].quant_tbl_no],
                *b=cand.j.quant_tbl_ptrs[cand.j.comp_info[0].quant_tbl_no];
    if (a==NULL||b==NULL) die("no luma quant tables");
    for(int i=0;i<64;i++) qdiff+=a->quantval[i]!=b->quantval[i];
    if(qdiff) die("unaligned luma quantization");
    long blocks=0, identical=0, different=0, dc=0, ac=0;
    long absOne=0,parityChange=0;
    for(int by=0;by<BH;by++)for(int bx=0;bx<BW;bx++){
        if(!in_roi(bx,by,g))continue;
        JCOEF *x=block(ref,bx,by,0),*y=block(&cand,bx,by,0);
        int local=0;
        blocks++;
        for(int k=0;k<64;k++) if(x[k]!=y[k]){
            different++; local++;
            if(k==0)dc++;else ac++;
            if(k&&abs(x[k]-y[k])==1)absOne++;
            if(k&&((abs(x[k])^abs(y[k]))&1))parityChange++;
        }
        if(local==0)identical++;
    }
    printf("ORIGINAL,%s,%d,%ld,%ld,%ld,%ld,%ld,%ld,%ld\n",g->name,page,blocks,identical,
        different,dc,ac,absOne,parityChange);
    if(blocks<=0) die("empty source ROI");
    if(different!=0) die("source repeated plate luma DCT mismatch");
    close_image(&cand);
}
/* Synthetic JPEG copy with exactly 40 controlled bit sites.
 * A positive capacity fixture, never an original-source mutation. */
static void plant(Image *ref,const char *out) {
    int sites=0;
    for(int by=0;by<BH;by++)for(int bx=0;bx<BW;bx++){
        if(!in_roi(bx,by,FLORAL))continue;
        JCOEF *b=block(ref,bx,by,1);
        for(int k=1;k<64 && sites<BITS;k++){
            const int v=b[k],a=abs(v);
            if(a<2)continue;
            const int bit=(PAYLOAD[sites/8]>>(7-sites%8))&1;
            if((a&1)!=bit) b[k]=(JCOEF)(v + (v>0?1:-1));
            sites++;
        }
    }
    if(sites!=BITS) die("insufficient synthetic carrier sites");
    struct jpeg_compress_struct w;
    struct jpeg_error_mgr error;
    w.err=jpeg_std_error(&error);
    jpeg_create_compress(&w);
    FILE *f=fopen(out,"wb");if(!f)die("plant output");
    jpeg_stdio_dest(&w,f);
    jpeg_copy_critical_parameters(&ref->j,&w);
    jpeg_write_coefficients(&w,ref->arr);
    jpeg_finish_compress(&w);
    jpeg_destroy_compress(&w); fclose(f);
}
static void positive_extract(const char *name) {
    Image im;load(&im,name);
    unsigned char got[5]={0};int sites=0;
    for(int by=0;by<BH;by++)for(int bx=0;bx<BW;bx++){
        if(!in_roi(bx,by,FLORAL))continue;
        JCOEF *b=block(&im,bx,by,0);
        for(int k=1;k<64 && sites<BITS;k++){
            if(abs(b[k])<2) continue;
            got[sites/8]|=(unsigned char)((abs(b[k])&1)<<(7-sites%8));
            sites++;
        }
    }
    if(sites!=BITS||memcmp(got,PAYLOAD,5)!=0) die("synthetic payload not extracted");
    printf("PLANTED_POSITIVE,40,5,3301_newline,PASS\n");
    close_image(&im);
}
int main(int argc,char **argv) {
    if(argc!=3){fprintf(stderr,"Usage: sft path_to_original_jpgs path_to_synthetic_plant.jpg\n");return 2;}
    printf("TYPE,group,page,ROI_Y_blocks,identical_Y_blocks,different_Y_coeffs,DC_diffs,AC_diffs,abs1_AC_diffs,AC_parity_diffs\n");
    for(size_t i=0;i<sizeof(GROUPS)/sizeof(GROUPS[0]);i++){
        const Group *g=&GROUPS[i];
        char first[1024];snprintf(first,sizeof(first),"%s/%02d.jpg",argv[1],g->first+17);
        Image ref;load(&ref,first);
        for(int page=g->first+g->step;page<=g->last;page+=g->step)
            compare_original(&ref,argv[1],page,g);
        if(g==FLORAL)plant(&ref,argv[2]);
        close_image(&ref);
    }
    positive_extract(argv[2]);
    return 0;
}
