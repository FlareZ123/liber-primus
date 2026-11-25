#include <array>
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <omp.h>
using namespace std;
constexpr int Q=832, K=812, NEG=-1000000000;
struct Edge{int end,holds;array<int,4> c;};
struct Hit{int score;array<int,4> r;int a,b;};
int mod(int x){x%=29;return x<0?x+29:x;}
int inv(int x){for(int a=1;a<29;a++)if(a*x%29==1)return a;return 0;}
int rank29(vector<array<int,4>> a){int r=0;for(int j=0;j<4;j++){int k=r;while(k<(int)a.size()&&!a[k][j])k++;if(k==(int)a.size())continue;swap(a[r],a[k]);int v=inv(a[r][j]);for(int l=j;l<4;l++)a[r][l]=a[r][l]*v%29;for(int i=r+1;i<(int)a.size();i++){int v=a[i][j];for(int l=j;l<4;l++)a[i][l]=mod(a[i][l]-v*a[r][l]);}r++;}return r;}
void edges_rec(const vector<int>& C,int p,int n,int h,array<int,4>&a,vector<Edge>&out){if(n==4){out.push_back({p,h,a});return;}if(p==(int)C.size())return;if(C[p]==0&&n>0)edges_rec(C,p+1,n,h+1,a,out);a[n]=C[p];edges_rec(C,p+1,n+1,h,a,out);}
int main(int argc,char**argv){if(argc!=3){cerr<<"usage holdhill tape logweights\n";return 1;}ifstream f(argv[1]),g(argv[2]);string s;f>>s;vector<int>C;for(char c:s)C.push_back(c<='9'?c-'0':c-'a'+10);int N=C.size(),lp[29];for(int &v:lp)g>>v;int bestlp=*max_element(lp,lp+29),hf=lp[0];vector<vector<Edge>> edges(N);int ec=0;for(int i=0;i<N;i++){array<int,4>a{};edges_rec(C,i,0,0,a,edges[i]);ec+=edges[i].size();}
 vector<int> suffix(N+1);for(int i=N-1;i>=0;i--)suffix[i]=suffix[i+1]+(C[i]!=0);
 vector<array<int,4>> rows;for(int j=0;j<4;j++){int limit=1;for(int k=j+1;k<4;k++)limit*=29;for(int z=0;z<limit;z++){array<int,4>a{};a[j]=1;int u=z;for(int k=j+1;k<4;k++){a[k]=u%29;u/=29;}rows.push_back(a);}}
 alignas(64) int w[29][Q];for(int x=0;x<29;x++)for(int q=0;q<Q;q++){int v=q<K?((q/29+1)*x+q%29)%29:0;w[x][q]=v?4*lp[v]:NEG;}
 vector<Hit> hits(rows.size());
 #pragma omp parallel
 {vector<int>d(size_t(N+1)*Q);
 #pragma omp for schedule(static)
 for(int ri=0;ri<(int)rows.size();ri++){auto r=rows[ri];fill(d.begin(),d.end(),NEG);for(int i=0;i<4&&i<=N;i++)fill(d.begin()+size_t(i)*Q,d.begin()+size_t(i+1)*Q,i*bestlp);int bs=NEG,bq=0;
  for(int i=0;i<=N;i++){auto *src=d.data()+size_t(i)*Q;if(suffix[i]<=3){int tail=(N-i)*bestlp;for(int q=0;q<K;q++){int z=src[q]+tail;if(z>bs){bs=z;bq=q;}}}if(i==N)break;
   if(C[i]==0){auto *dst=src+Q;for(int q=0;q<Q;q++)dst[q]=max(dst[q],src[q]+hf);}
   for(const auto &e:edges[i]){int x=(r[0]*e.c[0]+r[1]*e.c[1]+r[2]*e.c[2]+r[3]*e.c[3])%29,hs=e.holds*hf;auto *dst=d.data()+size_t(e.end)*Q;auto *wt=w[x];for(int q=0;q<Q;q++)dst[q]=max(dst[q],src[q]+wt[q]+hs);}
  }
  hits[ri]={bs,r,bq/29+1,bq%29};
 }
 }
 sort(hits.begin(),hits.end(),[](auto&a,auto&b){return a.score>b.score;});vector<Hit> chosen;vector<array<int,4>> basis;for(auto h:hits){if(h.score<=NEG)break;auto z=basis;z.push_back(h.r);if(rank29(z)>(int)basis.size()){basis.push_back(h.r);chosen.push_back(h);if(chosen.size()==4)break;}}
 long long sum=0;for(auto h:chosen)sum+=h.score;cout<<"{\"n\":"<<N<<",\"edges\":"<<ec<<",\"directions\":"<<rows.size()<<",\"affineRows\":"<<rows.size()*K<<",\"rank\":"<<chosen.size()<<",\"upperScore\":";cout.precision(15);cout<<double(sum)/(4*N*10000LL)<<",\"chosen\":[";auto emit=[](Hit h){cout<<"{\"score\":"<<h.score<<",\"r\":["<<h.r[0]<<","<<h.r[1]<<","<<h.r[2]<<","<<h.r[3]<<"],\"a\":"<<h.a<<",\"b\":"<<h.b<<"}";};for(int i=0;i<(int)chosen.size();i++){if(i)cout<<",";emit(chosen[i]);}cout<<"],\"top\":[";for(int i=0;i<10;i++){if(i)cout<<",";emit(hits[i]);}cout<<"]}\n";
}
