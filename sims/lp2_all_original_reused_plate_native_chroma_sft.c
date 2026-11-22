/* Exact original JPEG reused-art Cb/Cr native coefficient comparison.
 * Uses only native chroma components when both images are color.
 * No original raster transform, quantization or re-encoding.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>
typedef struct {struct jpeg_decompress_struct dec;struct jpeg_error_mgr err;jvirt_barray_ptr *arr; FILE *file;} Image;
typedef struct{const char*name;int first,last,step,nrect,rect[2][4];} Group;
static const Group G[]={
 {"cross",1,2,1,1,{{0,900,450,2650}}},
 {"scrolls",4,7,1,2,{{0,850,560,2600},{1800,850,2400,2600}}},
 {"right_saplings",9,13,2,1,{{1850,600,2400,2900}}},
 {"left_saplings",10,14,2,1,{{0,600,550,2900}}},
 {"insects",24,26,2,2,{{0,1000,520,2600},{1800,1000,2400,2600}}},
 {"cuneiform",34,39,1,1,{{900,250,1450,670}}},
 {"floral",40,55,1,2,{{0,650,550,2950},{1850,650,2400,2950}}}
};
static void load(Image *im,const char *name){
 memset(im,0,sizeof(*im));im->dec.err=jpeg_std_error(&im->err);
 jpeg_create_decompress(&im->dec);im->file=fopen(name,"rb");
 if(!im->file){fprintf(stderr,"missing %s\n",name);exit(2);}
 jpeg_stdio_src(&im->dec,im->file);jpeg_read_header(&im->dec,TRUE);
 im->arr=jpeg_read_coefficients(&im->dec);
}
static void destroy(Image *im){
 jpeg_finish_decompress(&im->dec);jpeg_destroy_decompress(&im->dec);fclose(im->file);
}
static int member(int bx,int by,int sx,int sy,const Group *g){
 int x=8*bx*sx,y=8*by*sy;
 for(int i=0;i<g->nrect;i++){
  const int *r=g->rect[i];
  if(x>=r[0]&&y>=r[1]&&x+8*sx<=r[2]&&y+8*sy<=r[3])return 1;
 }
 p1_achromatic_rgb_original(argv[1]);
 return 0;
}
static void p1_achromatic_rgb_original(const char *folder){
 char path[1024];
 snprintf(path,sizeof(path),"%s/18.jpg",folder);
 Image im;load(&im,path);
 if(im.dec.num_components!=3){fprintf(stderr,"p1 expected original RGB\n");exit(6);}
 long total=0,nonzero=0;
 for(int c=1;c<=2;c++){
  jpeg_component_info *info=&im.dec.comp_info[c];
  for(JDIMENSION y=0;y<info->height_in_blocks;y++){
   JBLOCKARRAY row=(*im.dec.mem->access_virt_barray)(
     (j_common_ptr)&im.dec,im.arr[c],y,1,FALSE);
   for(JDIMENSION x=0;x<info->width_in_blocks;x++){
    total+=64;
    for(int j=0;j<64;j++)nonzero+=row[0][x][j]!=0;
   }
  }
 }
 printf("P1_WHOLE_RGB_ACHROMATIC,1,%ld,%ld\n",total,nonzero);
 if(total!=4320000||nonzero!=0)exit(7);
 destroy(&im);
}
int main(int argc,char**argv){
 if(argc!=2)return 2;
 printf("TYPE,group,page,component,block_count,coeff_diffs,absparity_diffs\n");
 for(size_t k=0;k<sizeof(G)/sizeof(G[0]);k++){
  const Group *g=&G[k];char f[1024];
  snprintf(f,sizeof(f),"%s/%02d.jpg",argv[1],g->first+17);
  Image a;load(&a,f);
  for(int p=g->first+g->step;p<=g->last;p+=g->step){
   snprintf(f,sizeof(f),"%s/%02d.jpg",argv[1],p+17);
   Image b;load(&b,f);
   if(a.dec.num_components<3||b.dec.num_components<3){
    printf("SKIP_NONRGB,%s,%d,%d,%d,%d\n",g->name,p,0,0,0);
    destroy(&b);continue;
   }
   for(int c=1;c<3;c++){
    jpeg_component_info *ac=&a.dec.comp_info[c],*bc=&b.dec.comp_info[c];
    if(ac->width_in_blocks!=bc->width_in_blocks||
       ac->height_in_blocks!=bc->height_in_blocks||
       ac->h_samp_factor!=bc->h_samp_factor||
       ac->v_samp_factor!=bc->v_samp_factor){
     fprintf(stderr,"incompatible geometry %s p%d component%d\n",g->name,p,c);return 3;
    }
    JQUANT_TBL *aq=a.dec.quant_tbl_ptrs[ac->quant_tbl_no],
               *bq=b.dec.quant_tbl_ptrs[bc->quant_tbl_no];
    if(!aq||!bq||memcmp(aq->quantval,bq->quantval,sizeof(aq->quantval))){
     fprintf(stderr,"incompatible qtables %s p%d component%d\n",g->name,p,c);return 4;
    }
    int sx=a.dec.max_h_samp_factor/ac->h_samp_factor,
        sy=a.dec.max_v_samp_factor/ac->v_samp_factor;
    long blocks=0,diffs=0,parity=0;
    for(JDIMENSION y=0;y<ac->height_in_blocks;y++)
     for(JDIMENSION x=0;x<ac->width_in_blocks;x++){
      if(!member(x,y,sx,sy,g))continue;
      JBLOCKARRAY ar=(*a.dec.mem->access_virt_barray)((j_common_ptr)&a.dec,a.arr[c],y,1,FALSE),
                  br=(*b.dec.mem->access_virt_barray)((j_common_ptr)&b.dec,b.arr[c],y,1,FALSE);
      blocks++;
      for(int j=0;j<64;j++)if(ar[0][x][j]!=br[0][x][j]){
       diffs++;if((abs(ar[0][x][j])^abs(br[0][x][j]))&1)parity++;
      }
     }
    printf("ORIGINAL,%s,%d,%d,%ld,%ld,%ld\n",g->name,p,c,blocks,diffs,parity);
    if(blocks<=0||diffs!=0){fprintf(stderr,"native chroma source-plate mismatch\n");return 5;}
   }
   destroy(&b);
  }
  destroy(&a);
 }
 return 0;
}
