#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <fstream>
#include <iostream>
#include <map>
#include <numeric>
#include <vector>
#include <omp.h>
using namespace std;constexpr int N=29,Q=8;
using Key=array<int,N>; using Prob=array<double,N>;
struct Window{vector<int> c;int count;};
Prob p;
vector<Window> windows(const vector<int>&ct,int r,bool zeroFree){map<vector<int>,int> m;for(int i=Q;i+(r-1)*Q<(int)ct.size();i++){if(zeroFree&&find(ct.begin()+i,ct.begin()+i+(r-1)*Q+1,0)!=ct.begin()+i+(r-1)*Q+1)continue;vector<int> s;for(int j=0;j<r;j++)s.push_back(ct[i+j*Q]);m[s]++;}vector<Window> v;for(auto&[k,n]:m)v.push_back({k,n});return v;}
double score(const Key&f,const vector<Window>&w,bool zeroFree){Prob u;for(int i=0;i<N;i++)u[f[i]]=p[i];int tr[N][N];double prob[N][N],initial[N][N];for(int c=0;c<N;c++)for(int x=0;x<N;x++){tr[c][x]=(c-f[x]+N)%N;prob[c][x]=p[tr[c][x]];initial[c][x]=p[x]*u[(c-x+N)%N];}double ll=0;int r=w[0].c.size();int total=0;for(auto&z:w){double sum=0;for(int a=0;a<N;a++){int x=a;double v=initial[z.c[0]][x];for(int i=1;i<r;i++){v*=prob[z.c[i]][x];x=tr[z.c[i]][x];}sum+=v;}if(sum<=0)return -1e99;ll+=z.count*log(sum);total+=z.count;}
if(zeroFree){Prob v{};for(int c=1;c<N;c++)for(int x=0;x<N;x++)v[x]+=initial[c][x];for(int i=1;i<r;i++){Prob t{};for(int x=0;x<N;x++)for(int c=1;c<N;c++)t[tr[c][x]]+=v[x]*prob[c][x];v=t;}double norm=accumulate(v.begin(),v.end(),0.0);ll-=total*log(norm);}
return ll;}
int main(int argc,char**argv){if(argc<5)return 2;ifstream in(argv[1]);vector<int>ct;int x;while(in>>x)ct.push_back(x);ifstream pi(argv[2]);for(double&v:p)pi>>v;ifstream fi(argv[3]);Key f;for(int&v:f)fi>>v;bool z=stoi(argv[4]);vector<pair<int,int>>swaps;for(int a=0;a<N;a++)for(int b=a+1;b<N;b++)swaps.emplace_back(a,b);for(int t=5;t<argc;t++){int r=stoi(argv[t]);auto w=windows(ct,r,z);if(w.empty()){cerr<<"no windows\n";return 3;}double ll=score(f,w,z);int iterations=0;auto start=chrono::steady_clock::now();for(;iterations<20;iterations++){vector<double>ls(swaps.size());
#pragma omp parallel for schedule(static)
for(int j=0;j<(int)swaps.size();j++){auto[a,b]=swaps[j];Key k=f;swap(k[a],k[b]);ls[j]=score(k,w,z);}auto i=max_element(ls.begin(),ls.end())-ls.begin();if(ls[i]<=ll+1e-8)break;auto[a,b]=swaps[i];swap(f[a],f[b]);ll=ls[i];}
cout<<"r="<<r<<" n="<<accumulate(w.begin(),w.end(),0,[](int s,const Window&v){return s+v.count;})<<" distinct="<<w.size()<<" ll="<<ll<<" iterations="<<iterations<<" seconds="<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<"\n";for(int v:f)cout<<v<<" ";cout<<"\n"<<flush;
}}
