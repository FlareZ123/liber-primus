/*
 * Q92 F5 known-stencil, independent peer cover test.
 * On every test page, two OTHER source pages select common original-image
 * luma DCT blocks. Decrement matches are counted only in nonzero AC values
 * from those blocks. Scope: original physical LP2 visual chapters, 56 unknown pages.
 * Build: gcc -O2 -Wall -Wextra lp2_f5_q92_chapter_peers_sft.c -ljpeg -o stencil
 * Usage: stencil resources/liber-primus physical_page [candidate_stego.jpg]
 */
#include <stdio.h>
#include <stddef.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <jpeglib.h>
#define W 300
#define H 450
#define BLOCKS (W*H)
#define K 64
static const int g0[]={0,1,2};
static const int g1[]={3,4,5,6,7};
static const int g2[]={8,9,10,11,12,13,14};
static const int g3[]={15,16,17,18,19,20,21,22};
static const int g4[]={23,24,25,26};
static const int g5[]={27,28,29,30,31,32};
static const int g6[]={33,34,35,36,37,38,39};
static const int g7[]={40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55};
typedef struct {const char*name;const int *ids;int n;} Group;
static const Group groups[]={
 {"p0-2",g0,sizeof(g0)/sizeof(int)},
 {"p3-7",g1,sizeof(g1)/sizeof(int)},
 {"p8-14",g2,sizeof(g2)/sizeof(int)},
 {"p15-22",g3,sizeof(g3)/sizeof(int)},
 {"p23-26",g4,sizeof(g4)/sizeof(int)},
 {"p27-32",g5,sizeof(g5)/sizeof(int)},
 {"p33-39",g6,sizeof(g6)/sizeof(int)},
 {"p40-55",g7,sizeof(g7)/sizeof(int)}
};
static JCOEF* read_y(const char*path,int quant[64]){
 FILE *f=fopen(path,"rb");if(!f){perror(path);exit(3);}
 struct jpeg_decompress_struct d={0};struct jpeg_error_mgr e;
 d.err=jpeg_std_error(&e);jpeg_create_decompress(&d);
 jpeg_stdio_src(&d,f);if(jpeg_read_header(&d,TRUE)!=JPEG_HEADER_OK)exit(3);
 jvirt_barray_ptr*co=jpeg_read_coefficients(&d);
 if(d.comp_info[0].width_in_blocks!=W||d.comp_info[0].height_in_blocks!=H)exit(4);
 for(int k=0;k<64;k++)quant[k]=d.quant_tbl_ptrs[d.comp_info[0].quant_tbl_no]->quantval[k];
 JCOEF *out=malloc((size_t)BLOCKS*K*sizeof(JCOEF));if(!out)exit(4);
 for(int y=0;y<H;y++){
  JBLOCKARRAY row=(*d.mem->access_virt_barray)((j_common_ptr)&d,co[0],y,1,FALSE);
  memcpy(out+(size_t)y*W*K,row[0],(size_t)W*K*sizeof(JCOEF));
 }
 jpeg_destroy_decompress(&d);fclose(f);return out;
}
static void filename(char*out,size_t n,const char*dir,int page){
 snprintf(out,n,"%s/%d.jpg",dir,page+17);
}
static int in_outer(int x,int y){
 return x*8<512||x*8>=1888||y*8<512||y*8>=3200;
}
static void test(const char*dir,int page,const char*override){
 const Group*g=NULL;
 for(size_t i=0;i<sizeof(groups)/sizeof(groups[0]);i++)
  for(int j=0;j<groups[i].n;j++)if(groups[i].ids[j]==page)g=&groups[i];
 if(!g){printf("%d,UNSCORABLE,0,0,0,0,0,0\n",page);return;}
 int a=-1,b=-1;
 for(int j=0;j<g->n;j++)if(g->ids[j]!=page){
  if(a<0)a=g->ids[j];else if(b<0){b=g->ids[j];break;}
 }
 char path[4096];int qa[64],qb[64],qt[64];
 filename(path,sizeof(path),dir,a);JCOEF *ra=read_y(path,qa);
 filename(path,sizeof(path),dir,b);JCOEF *rb=read_y(path,qb);
 if(override)snprintf(path,sizeof(path),"%s",override);
 else filename(path,sizeof(path),dir,page);
 JCOEF *t=read_y(path,qt);
 if(memcmp(qa,qb,sizeof(qa))||memcmp(qa,qt,sizeof(qa))){
  fprintf(stderr,"Quantization mismatch page %d\n",page);exit(5);
 }
 uint64_t blocks=0,ac=0,dec=0,inc=0,other=0,dc=0;
 for(int y=0;y<H;y++)for(int x=0;x<W;x++){
  if(!in_outer(x,y))continue;
  size_t offset=((size_t)y*W+x)*K;
  int same=1,has=0;
  for(int k=0;k<64;k++){
   if(ra[offset+k]!=rb[offset+k]){same=0;break;}
   if(k>0&&ra[offset+k]!=0)has=1;
  }
  if(!same||!has)continue;
  blocks++;dc+=(t[offset]!=ra[offset]);
  for(int k=1;k<64;k++){
   int v=ra[offset+k],w=t[offset+k];if(!v)continue;
   ac++;
   int s=v>0?1:-1;
   if(w==v)continue;
   if(w==v-s)dec++;else if(w==v+s)inc++;else other++;
  }
 }
 printf("%d,%s,%llu,%llu,%llu,%llu,%llu,%llu\n",page,g->name,
  (unsigned long long)blocks,(unsigned long long)ac,(unsigned long long)dec,
  (unsigned long long)inc,(unsigned long long)other,(unsigned long long)dc);
 free(ra);free(rb);free(t);
}
int main(int argc,char**argv){
 if(argc<3||argc>4){fprintf(stderr,"usage: stencil image_dir physical_page [stego_jpeg]\n");return 2;}
 int page=atoi(argv[2]);if(page<0||page>57)return 2;
 test(argv[1],page,argc==4?argv[3]:NULL);
 return 0;
}
