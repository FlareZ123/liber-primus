// Exact necessary anchor-support gate for fixed keyword alphabets, free primitive q8.
#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>
#include <omp.h>
using namespace std;using U=uint64_t;
const string A="0123456789abcdefghijklmnopqrs";
static int md(int x){return (x+29)%29;}
static vector<int> parse(const string&w){vector<int>v;for(char c:w)v.push_back(A.find(c));return v;}
static U canon(const array<int,8>&k){U v=0;for(int x:k)v=v*32+x;U best=v;for(int j=1;j<8;j++){v=((v<<5)&((1ULL<<40)-1))|(v>>35);best=min(best,v);}return best;}
struct Group{vector<int> c;vector<vector<int>> words;};
struct Count{uint16_t n=0,last=65535;};
int main(int argc,char**argv){if(argc<5)return 2;ifstream in(argv[1]);int n;in>>n;vector<Group> groups;for(int g=0;g<n;g++){string s;int m;in>>s>>m;auto c=parse(s);bool eligible=c.size()>=8&&find(c.begin(),c.end(),0)==c.end();Group x; x.c=c;for(int i=0;i<m;i++){in>>s;if(eligible)x.words.push_back(parse(s));}if(eligible)groups.push_back(move(x));}
 int budget=stoi(argv[3]),need=int(groups.size())-budget,threads=stoi(argv[4]);if(need<=0){cerr<<"No necessary anchor gate\n";return 3;}
 vector<array<int,29>>alphabets;vector<string>labels;ifstream keys(argv[2]);string w;while(keys>>w){array<int,29>rank{};vector<int>v;for(int x:parse(w))if(find(v.begin(),v.end(),x)==v.end())v.push_back(x);for(int x=0;x<29;x++)if(find(v.begin(),v.end(),x)==v.end())v.push_back(x);int r=find(v.begin(),v.end(),0)-v.begin();for(int i=0;i<29;i++)rank[v[i]]=md(i-r);if(find(alphabets.begin(),alphabets.end(),rank)==alphabets.end()){alphabets.push_back(rank);labels.push_back(w);}}
 U trials=0,candidates=0,survivors=0;int max_support=0;auto t=chrono::steady_clock::now();omp_set_num_threads(threads);
 #pragma omp parallel for schedule(dynamic,1) reduction(+:trials,candidates,survivors) reduction(max:max_support)
 for(int a=0;a<(int)alphabets.size();a++){auto&pi=alphabets[a];unordered_map<U,Count>support;size_t cap=0;for(auto&g:groups)cap+=g.words.size();support.reserve(cap);
  for(int g=0;g<(int)groups.size();g++){auto&gr=groups[g];for(auto&p:gr.words){candidates++;array<int,8>k{};bool ok=true;for(int j=0;j<(int)p.size();j++){int d=md(pi[gr.c[j]]-pi[p[j]]);if(j<8)k[j]=d;else if(k[j&7]!=d){ok=false;break;}}if(!ok||k[0]==k[4]&&k[1]==k[5]&&k[2]==k[6]&&k[3]==k[7])continue;auto&x=support[canon(k)];if(x.last!=g){x.n++;x.last=g;}}}
  trials+=support.size();for(auto&[k,x]:support){max_support=max(max_support,int(x.n));if(x.n>=need){survivors++;
 #pragma omp critical
 {cout<<"SURVIVOR keyword="<<labels[a]<<" key="<<k<<" support="<<x.n<<"\n"<<flush;}}}}
 cout<<"DONE alphabets="<<alphabets.size()<<" anchors="<<groups.size()<<" budget="<<budget<<" need="<<need<<" candidate_words="<<candidates<<" distinct_keys="<<trials<<" max_support="<<max_support<<" survivors="<<survivors<<" t="<<chrono::duration<double>(chrono::steady_clock::now()-t).count()<<"\n";
}
