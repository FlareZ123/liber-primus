#include <algorithm>
#include <array>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <set>
#include <string>
#include <tuple>
#include <vector>
#include <omp.h>
using namespace std;
constexpr int Q=8;
constexpr char A[]="0123456789abcdefghijklmnopqrstuvwxyz";
int ix(char c){return c<='9'?c-'0':c-'a'+10;}
vector<int> decode(string s){vector<int> v;for(char c:s)v.push_back(ix(c));return v;}
struct Hit{int start,visible;string key;bool operator<(const Hit& x)const{return tie(start,visible,key)<tie(x.start,x.visible,x.key);}};
struct Search{
 const vector<int>&P;const vector<int>&C;int start=0,minVisible;array<int,Q>K;uint64_t nodes=0;set<Hit>hits;
 Search(const vector<int>&p,const vector<int>&c,int m):P(p),C(c),minVisible(m){}
 string keystr(){string a;for(int k:K){if(k<0)abort();a+=A[k];}return a;}
 void dfs(int i,int h,int j,int last,int retry){
  ++nodes;int n=P.size(),m=C.size()-start;
  for(;;){
   if(h+n-i<minVisible)return;
   if(i==n){if(h>=minVisible)hits.insert({start,h,keystr()});return;}
   if(K[j]<0)break;
   int c=P[i]+K[j];if(c>=36)c-=36;j=(j+1)&7;
   if(c==last){if(++retry>=Q)return;continue;}
   if(c<29){if(h>=m||C[start+h]!=c)return;++h;}
   ++i;last=c;retry=0;
  }
  int p=P[i],next=(j+1)&7;
  auto assign=[&](int c){int k=c-p;K[j]=k<0?k+36:k;};
  if(h<m&&C[start+h]!=last){assign(C[start+h]);dfs(i+1,h+1,next,C[start+h],0);}
  if(last<36&&retry+1<Q){assign(last);dfs(i,h,next,last,retry+1);}
  if(h+n-i>minVisible)for(int c=29;c<36;c++)if(c!=last){assign(c);dfs(i+1,h,next,c,0);}
  K[j]=-1;
 }
 void run(int s){start=s;K.fill(-1);dfs(0,0,0,36,0);}
};
int main(int argc,char**argv){
 if(argc!=6){cerr<<"usage: crib plaintext visible-tape minVisible start end\n";return 1;}
 auto P=decode(argv[1]),C=decode(argv[2]);int m=stoi(argv[3]),a=stoi(argv[4]),b=min(stoi(argv[5]),int(C.size())-m+1);if(m<Q||m>(int)P.size()||a<0||b<a)return 2;
 uint64_t nodes=0;set<Hit>hits;double t=omp_get_wtime();
 #pragma omp parallel
 {
  Search s(P,C,m);
  #pragma omp for schedule(dynamic,1)
  for(int i=a;i<b;i++)s.run(i);
  #pragma omp critical
  {nodes+=s.nodes;hits.insert(s.hits.begin(),s.hits.end());}
 }
 cout<<"starts "<<a<<" "<<b<<" nodes "<<nodes<<" hits "<<hits.size()<<" seconds "<<(omp_get_wtime()-t)<<"\n";
 for(auto&h:hits)cout<<h.start<<" "<<h.visible<<" "<<h.key<<"\n";
}
