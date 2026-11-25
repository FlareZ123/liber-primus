// Exact keyed-alphabet pool, arbitrary primitive period-8 shifts, literal F hold.
// Input: dictionary domains as in lp2_shared_gp29_q8_affine_sft.py.
// Each pool word constructs a first-occurrence alphabet, then appends unused GP runes.
#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <numeric>
#include <string>
#include <unordered_set>
#include <vector>
#include <omp.h>
using namespace std;
using U=uint64_t; using B=uint8_t;
constexpr int N=29,Q=8; const string A="0123456789abcdefghijklmnopqrs";
static int md(int x){return (x+29)%29;}
static U code(const vector<int>&w){U r=0;for(int x:w)r=(r<<5)|x;return r;}
struct G{vector<int> c;vector<vector<int>> words;unordered_set<U> dict;};
static vector<G> groups;static vector<int> anchors,order;
static bool rec(const G&g,const int*m,int i,int j,U w){if(i==(int)g.c.size())return g.dict.count(w);int c=g.c[i];if(c==0&&rec(g,m,i+1,j,w<<5))return true;int p=m[j*29+c];return p&&rec(g,m,i+1,(j+1)&7,(w<<5)|p);}
static bool supports(const G&g,const int*m){if(find(g.c.begin(),g.c.end(),0)==g.c.end())for(int j=0;j<8;j++){U w=0;bool ok=true;for(int i=0;i<(int)g.c.size();i++){int p=m[((i+j)&7)*29+g.c[i]];if(!p){ok=false;break;}w=(w<<5)|p;}if(ok&&g.dict.count(w))return true;}else for(int j=0;j<8;j++)if(rec(g,m,0,j,0))return true;return false;}
static U canon(const array<int,8>&k){U best=~0ULL;for(int j=0;j<8;j++){U v=0;for(int i=0;i<8;i++)v=v*32+k[(i+j)&7];best=min(best,v);}return best;}
static array<int,8> decode(U x){array<int,8>k{};for(int j=7;j>=0;j--){k[j]=x&31;x>>=5;}return k;}
static vector<int> parse(string w){vector<int>v;for(char c:w)v.push_back(A.find(c));return v;}
int main(int argc,char**argv){if(argc<5)return 2;ifstream in(argv[1]);int n;in>>n;groups.resize(n);for(auto&g:groups){string s;int m;in>>s>>m;g.c=parse(s);if(g.c.size()>12){cerr<<"Packed word width exceeded\n";return 2;}for(int j=0;j<m;j++){in>>s;auto w=parse(s);g.words.push_back(w);g.dict.insert(code(w));}}
 int budget=stoi(argv[3]),threads=stoi(argv[4]);for(int g=0;g<n;g++)if(groups[g].c.size()>=8&&find(groups[g].c.begin(),groups[g].c.end(),0)==groups[g].c.end())anchors.push_back(g);sort(anchors.begin(),anchors.end(),[](int a,int b){return groups[a].words.size()<groups[b].words.size();});if((int)anchors.size()<=budget){cerr<<"Insufficient all-consuming full-period anchors\n";return 3;}anchors.resize(budget+1);order=anchors;vector<int>rest;for(int g=0;g<n;g++)if(find(anchors.begin(),anchors.end(),g)==anchors.end())rest.push_back(g);sort(rest.begin(),rest.end(),[](int a,int b){return double(groups[a].words.size())/groups[a].c.size()<double(groups[b].words.size())/groups[b].c.size();});order.insert(order.end(),rest.begin(),rest.end());
 vector<string>keywords;ifstream pool(argv[2]);string word;while(pool>>word)keywords.push_back(word);
 cout<<"ANCHORS";for(int g:anchors)cout<<" "<<g;cout<<"\n"<<flush;
 vector<array<int,29>> alphabets;vector<string> labels;for(auto&w:keywords){array<int,29>rank{};vector<int>v;for(int x:parse(w))if(find(v.begin(),v.end(),x)==v.end())v.push_back(x);for(int x=0;x<29;x++)if(find(v.begin(),v.end(),x)==v.end())v.push_back(x);int r=find(v.begin(),v.end(),0)-v.begin();for(int i=0;i<29;i++)rank[v[i]]=md(i-r);if(find(alphabets.begin(),alphabets.end(),rank)==alphabets.end()){alphabets.push_back(rank);labels.push_back(w);}}
 int found=0; U trials=0,words=0;auto t=chrono::steady_clock::now();omp_set_num_threads(threads);
 #pragma omp parallel for schedule(dynamic,1) reduction(+:found,trials,words)
 for(int a=0;a<(int)alphabets.size();a++){const auto&pi=alphabets[a];int inv[29];for(int x=0;x<29;x++)inv[pi[x]]=x;unordered_set<U>keys;for(int g:anchors){const auto&gr=groups[g];for(auto&w:gr.words){words++;array<int,8>k{};bool ok=true;for(int j=0;j<(int)w.size();j++){int d=md(pi[gr.c[j]]-pi[w[j]]);if(j<8)k[j]=d;else if(k[j&7]!=d){ok=false;break;}}if(ok&&(k[0]!=k[4]||k[1]!=k[5]||k[2]!=k[6]||k[3]!=k[7]))keys.insert(canon(k));}}
 trials+=keys.size();for(U key:keys){auto k=decode(key);int maps[232];for(int j=0;j<8;j++)for(int c=0;c<29;c++)maps[j*29+c]=inv[md(pi[c]-k[j])];int bad=0;for(int g:order)if(!supports(groups[g],maps)&&++bad>budget)break;if(bad<=budget){found++;
 #pragma omp critical
 {cout<<"KEYWORD "<<labels[a]<<"\nKEY pi";for(int v:pi)cout<<" "<<v;cout<<"\nKEY k";for(int v:k)cout<<" "<<v;cout<<"\nOOV "<<bad<<"\n"<<flush;}}}}
 cout<<"DONE alphabets="<<alphabets.size()<<" keyword_count="<<keywords.size()<<" candidate_words="<<words<<" trials="<<trials<<" found="<<found<<" budget="<<budget<<" t="<<chrono::duration<double>(chrono::steady_clock::now()-t).count()<<"\n";
}
