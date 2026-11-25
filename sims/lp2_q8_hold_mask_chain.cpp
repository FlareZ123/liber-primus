#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <fstream>
#include <iostream>
#include <numeric>
#include <string>
#include <unordered_map>
#include <vector>
#include <omp.h>
using namespace std;constexpr int N=29,Q=8;using Key=array<int,N>;using Prob=array<double,N>;
struct Term{array<int,Q> chains;int holds;};
struct Window{int begin,end;};
struct Dataset{vector<string> chains;vector<Term> terms;vector<Window> windows;int L;double zeroRate;};
Prob p;
Dataset prepare(const vector<int>&ct,int L,int stride){Dataset d;d.L=L;d.zeroRate=(double)count(ct.begin()+32,ct.end(),0)/(ct.size()-32);d.chains.push_back("");unordered_map<string,int> ids;ids[""]=0;for(int i=32;i+L<=(int)ct.size();i+=stride){int z=count(ct.begin()+i,ct.begin()+i+L,0);if(z>16){cerr<<"too many zeros in window\n";exit(4);}Window w{(int)d.terms.size(),0};for(int mask=0;mask<(1<<z);mask++){array<string,Q>s;int b=0,phase=0,holds=0;for(int j=i;j<i+L;j++){int c=ct[j];if(c==0){if(mask&(1<<b++)){holds++;continue;}}s[phase].push_back((char)c);phase=(phase+1)%Q;}Term t;t.holds=holds;for(int j=0;j<Q;j++){auto [it,ins]=ids.emplace(s[j],d.chains.size());if(ins)d.chains.push_back(s[j]);t.chains[j]=it->second;}d.terms.push_back(t);}w.end=d.terms.size();d.windows.push_back(w);}return d;}
struct Score{double ll,h;};
Score score(const Key&f,const Dataset&d){Prob u;for(int i=0;i<N;i++)u[f[i]]=p[i];int tr[N][N];double prob[N][N],initial[N][N];for(int c=0;c<N;c++)for(int x=0;x<N;x++){tr[c][x]=(c-f[x]+N)%N;prob[c][x]=p[tr[c][x]];initial[c][x]=p[x]*u[(c-x+N)%N];}double g0=accumulate(initial[0],initial[0]+N,0.0);double h=clamp((d.zeroRate-g0)/(1-g0),0.0001,0.2);vector<double> cp(d.chains.size());cp[0]=1;for(size_t i=1;i<d.chains.size();i++){const string&s=d.chains[i];double sum=0;for(int a=1;a<N;a++){int x=a;double v=initial[(unsigned char)s[0]][x];for(size_t j=1;j<s.size();j++){int c=(unsigned char)s[j];v*=prob[c][x];x=tr[c][x];}sum+=v;}cp[i]=sum;}
vector<double> products(d.terms.size());for(size_t i=0;i<d.terms.size();i++){double v=1;for(int c:d.terms[i].chains)v*=cp[c];products[i]=v;}
double ll=0;for(int it=0;it<3;it++){vector<double> weights(d.L+1);for(int k=0;k<=d.L;k++)weights[k]=pow(h,k)*pow(1-h,d.L-k);ll=0;double eh=0;for(auto w:d.windows){double v=0,s=0;for(int j=w.begin;j<w.end;j++){int k=d.terms[j].holds;double x=products[j]*weights[k];v+=x;s+=k*x;}if(v<=0)return {-1e99,h};ll+=log(v);eh+=s/v;}if(it<2)h=clamp(eh/(d.L*d.windows.size()),0.0001,0.2);}return {ll,h};}
int main(int argc,char**argv){if(argc<5)return 2;ifstream in(argv[1]);vector<int>ct;int x;while(in>>x)ct.push_back(x);ifstream pi(argv[2]);for(double&v:p)pi>>v;ifstream fi(argv[3]);Key f;for(int&v:f)fi>>v;int stride=stoi(argv[4]);vector<pair<int,int>> swaps;for(int a=0;a<N;a++)for(int b=a+1;b<N;b++)swaps.emplace_back(a,b);for(int t=5;t<argc;t++){int L=stoi(argv[t]);auto d=prepare(ct,L,stride);auto cur=score(f,d);int iterations=0;auto start=chrono::steady_clock::now();for(;iterations<12;iterations++){vector<Score>ls(swaps.size());
#pragma omp parallel for schedule(static)
for(int j=0;j<(int)swaps.size();j++){auto[a,b]=swaps[j];Key k=f;swap(k[a],k[b]);ls[j]=score(k,d);}auto i=max_element(ls.begin(),ls.end(),[](auto a,auto b){return a.ll<b.ll;})-ls.begin();if(ls[i].ll<=cur.ll+1e-8)break;auto[a,b]=swaps[i];swap(f[a],f[b]);cur=ls[i];}
cout<<"L="<<L<<" windows="<<d.windows.size()<<" chains="<<d.chains.size()<<" terms="<<d.terms.size()<<" ll="<<cur.ll<<" h="<<cur.h<<" iterations="<<iterations<<" seconds="<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<"\n";for(int v:f)cout<<v<<" ";cout<<"\n"<<flush;
}}