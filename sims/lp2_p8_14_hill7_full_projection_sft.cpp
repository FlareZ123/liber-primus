#include <array>
#include <vector>
#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <cstdint>
#include <cassert>
#include <omp.h>
using namespace std;
constexpr int Q=29,N=247,D=7;
using V=array<int,D>; using Rows=array<V,N>; using M=array<V,D>; using Seq=array<uint8_t,N>;
int mod(int a){a%=Q;return a<0?a+Q:a;}
int pw(int n){int x=1;while(n--)x*=Q;return x;}
int score(const Rows& c,const V& v){int h[Q]={};int s=0;for(auto& r:c){int z=0;for(int j=0;j<D;j++)z+=r[j]*v[j];s+=h[z%Q]++;}return 2*s;}
inline int splitScore(const Seq& a,const Seq& b){int h[32]={};int s=0;for(int i=0;i<N;i++){int z=a[i]+b[i];z-=Q*(z>=Q);s+=h[z]++;}return 2*s;}
V coefficients(int pivot,int a,int b,int dim){V v{};v[pivot]=1;int n=dim-pivot-1,k=n/2;for(int j=0;j<k;j++){v[pivot+1+j]=a%Q;a/=Q;}for(int j=k;j<n;j++){v[pivot+1+j]=b%Q;b/=Q;}return v;}
vector<Seq> table(const Rows& c,int start,int n,int pivot){vector<Seq> t(pw(n));for(int z=0;z<(int)t.size();z++){int q=z;V v{};for(int i=0;i<n;i++){v[start+i]=q%Q;q/=Q;}if(pivot>=0)v[pivot]=1;for(int r=0;r<N;r++){int sum=0;for(int i=0;i<D;i++)sum+=c[r][i]*v[i];t[z][r]=sum%Q;}}return t;}
struct Best{int score=-1;uint64_t count=0,ties=0;V v{};};
Best scan(const Rows& c,int dim,int threshold,string label){Best total;for(int p=dim-1;p>=0;p--){
 int n=dim-p-1,k=n/2;auto a=table(c,p+1,k,p),b=table(c,p+1+k,n-k,-1);Best best;uint64_t hits=0;
 #pragma omp parallel
 {
 Best local;uint64_t lh=0;
 #pragma omp for schedule(static)
 for(int i=0;i<(int)a.size();i++){for(int j=0;j<(int)b.size();j++){int s=splitScore(a[i],b[j]);local.count++;if(s>=threshold)lh++;if(s>local.score){local.score=s;local.v=coefficients(p,i,j,dim);local.ties=1;}else if(s==local.score)local.ties++;}}
 #pragma omp critical
 {best.count+=local.count;hits+=lh;if(local.score>best.score){best.score=local.score;best.v=local.v;best.ties=local.ties;}else if(local.score==best.score){best.ties+=local.ties;if(local.v<best.v)best.v=local.v;}}
 }
 assert(score(c,best.v)==best.score);assert(best.count==uint64_t(pw(n)));total.count+=best.count;
 if(best.score>total.score){total.score=best.score;total.v=best.v;total.ties=best.ties;}else if(best.score==total.score){total.ties+=best.ties;if(best.v<total.v)total.v=best.v;}
 cout<<label<<" pivot="<<p<<" count="<<best.count<<" max="<<best.score<<" ties="<<best.ties<<" threshold_hits="<<hits<<" v=";for(int x:best.v)cout<<x<<",";cout<<endl;
 }
 cout<<label<<" TOTAL count="<<total.count<<" max="<<total.score<<" ties="<<total.ties<<" v=";for(int x:total.v)cout<<x<<",";cout<<endl;return total;}
Rows makeRows(const string& s,bool col){assert(s.size()==N*D);Rows c{};for(int r=0;r<N;r++)for(int j=0;j<D;j++){char x=s[col?N*j+r:D*r+j];c[r][j]=x<='9'?x-'0':x-'a'+10;assert(c[r][j]>=0&&c[r][j]<Q);}return c;}
void verify(const string&s,int sum,int weighted){assert(s.size()==N*D);int a=0,b=0;for(int i=0;i<N*D;i++){int x=s[i]<='9'?s[i]-'0':s[i]-'a'+10;a+=x;b+=(i+1)*x;}assert(a==sum&&b==weighted);}
uint32_t seed=0x33011729;uint32_t rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed;}
bool inverse(M a,M& b){b={};for(int i=0;i<D;i++)b[i][i]=1;for(int k=0;k<D;k++){int p=k;while(p<D&&!a[p][k])p++;if(p==D)return false;swap(a[k],a[p]);swap(b[k],b[p]);int u=1;while(a[k][k]*u%Q!=1)u++;for(int j=0;j<D;j++){a[k][j]=mod(a[k][j]*u);b[k][j]=mod(b[k][j]*u);}for(int i=0;i<D;i++)if(i!=k){int t=a[i][k];for(int j=0;j<D;j++){a[i][j]=mod(a[i][j]-t*a[k][j]);b[i][j]=mod(b[i][j]-t*b[k][j]);}}}return true;}
Rows multiply(const Rows&a,const M& b){Rows c{};for(int r=0;r<N;r++)for(int j=0;j<D;j++)for(int k=0;k<D;k++)c[r][j]=(c[r][j]+a[r][k]*b[k][j])%Q;return c;}
void control(const Rows&p,string label){M a{},b{};do{for(auto&r:a)for(int&x:r)x=rng()%Q;}while(!inverse(a,b));Rows c=multiply(p,a);assert(multiply(c,b)==p);int best=0;for(int j=0;j<D;j++){V v{},u{};u[j]=1;for(int k=0;k<D;k++)v[k]=b[k][j];int s=score(c,v);assert(s==score(p,u));best=max(best,s);}cout<<label<<" plant native max="<<best<<" full_roundtrip="<<N*D<<endl;
 auto toy=scan(c,3,100000,label+" toy");int maxv=0;uint64_t cnt=0;for(int i=0;i<3;i++)for(int j=0;j<pw(2-i);j++){V v{};v[i]=1;int z=j;for(int k=i+1;k<3;k++){v[k]=z%Q;z/=Q;}maxv=max(maxv,score(c,v));cnt++;}assert(toy.count==cnt&&toy.score==maxv);
 auto x=table(c,1,3,0),y=table(c,4,3,-1);for(int i=0;i<1000;i++){int s=rng()%x.size(),t=rng()%y.size();assert(splitScore(x[s],y[t])==score(c,coefficients(0,s,t,D)));}}
int main(int argc,char**argv){if(argc!=2)return 2;ifstream in(argv[1]);string original,native;in>>original>>native;verify(original,24182,20996876);verify(native,21510,18789294);for(bool col:{false,true}){string label=col?"column":"row";control(makeRows(native,col),label);scan(makeRows(original,col),D,col?3458:3506,label+" original");}return 0;}
