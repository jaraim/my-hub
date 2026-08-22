“使用严格模式”；
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const Cheerio_1 = require("cheerio");
const CryptoJS = require("crypto-js");
const searchRows = 20;
async function searchBase(query, page, type) {
    const headers = {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "接受编码": "gzip、deflate、br",
        "接受语言": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        连接：“保持连接”
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        主机: "m.music.migu.cn",
        引用者：`https://m.music.migu.cn/v3/search?keyword=${encodeURIComponent(query)}`,
        "Sec-Fetch-Dest": "空",
        “安全获取模式”： “cors”，
        "Sec-Fetch-Site": "同源",
        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, 如 Gecko) Chrome/89.0.4389.114 Mobile Safari/537.36 Edg/89.0.774.68",
        "X-Requested-With": "XMLHttpRequest",
    };
    const params = {
        关键词：查询
        类型，
        pgc：页面，
        行：搜索行，
    };
    const data = await axios_1.default.get("https://m.music.migu.cn/migu/remoting/scr_search_tag", { headers, params });
    返回 data.data;
}
// 函数 musicCanPlayFilter(_) {
// 返回 _.lisSQ || _.lisHQ || _.lisBq || _.lisCr || _.lisQq || _.listenUrl || _.mp3；
// }
function musicCanPlayFilter(_) {
    返回 _.mp3 || _.listenUrl || _.lisQq || _.lisCr;
}
异步函数 searchMusic(query, page) {
    const data = await searchBase(query, page, 2);
    const musics = data.musics.map((_) => ({
        id: _.id,
        艺术作品：_.封面，
        标题：_.songName，
        艺术家：_.artist，
        专辑：_.专辑名称，
        url: musicCanPlayFilter(_),
        copyrightId: _.copyrightId,
        singerId: _.singerId,
    }));
    返回 {
        isEnd: +data.pageNo * searchRows >= data.pgt,
        数据：音乐，
    };
}
异步函数 searchAlbum(query, page) {
    const data = await searchBase(query, page, 4);
    const albums = data.albums.map((_) => ({
        id: _.id,
        封面图：_.albumPicL，
        标题：_.title，
        日期：_.publishDate，
        artist: (_.singer || []).map((s) => s.name).join(","),
        歌手：_.singer，
        fullSongTotal: _.fullSongTotal,
    }));
    返回 {
        isEnd: +data.pageNo * searchRows >= data.pgt,
        数据：专辑，
    };
}
异步函数 searchArtist(query, page) {
    const data = await searchBase(query, page, 1);
    const artists = data.artists.map((result) => ({
        名称：result.title，
        id：result.id，
        头像：result.artistPicL，
        worksNum: result.songNum,
    }));
    返回 {
        isEnd: +data.pageNo * searchRows >= data.pgt,
        数据：艺术家，
    };
}
异步函数 searchMusicSheet(query, page) {
    const data = await searchBase(query, page, 6);
    const musicsheet = data.songLists.map((result) => ({
        标题：result.name，
        id：result.id，
        艺术家：result.userName，
        作品：result.img
        描述：result.intro，
        worksNum: result.musicNum,
        播放次数：result.playNum，
    }));
    返回 {
        isEnd: +data.pageNo * searchRows >= data.pgt,
        数据：乐谱，
    };
}
async function searchLyric(query, page) {
    const data = await searchBase(query, page, 7);
    const lyrics = data.songs.map((result) => ({
        标题：结果.标题，
        id：result.id，
        艺术家：result.artist，
        艺术作品：result.cover，
        lrc：result.lyrics，
        专辑：result.albumName，
        copyrightId: result.copyrightId,
    }));
    返回 {
        isEnd: +data.pageNo * searchRows >= data.pgt,
        数据：歌词，
    };
}
异步函数 getArtistAlbumWorks(artistItem, page) {
    const headers = {
        接受："text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "接受编码": "gzip、deflate、br",
        "接受语言": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        连接：“保持连接”，
        主机: "music.migu.cn",
        推荐人：“http://music.migu.cn”，
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
        "Cache-Control": "max-age=0",
    };
    const html = (await axios_1.default.get(`https://music.migu.cn/v3/music/artist/${artistItem.id}/album?page=${page}`, {
        标题，
    }））。数据;
    const $ = (0, Cheerio_1.load)(html);
    const rawAlbums = $("div.artist-album-list").find("li");
    const albums = [];
    for (let i = 0; i < rawAlbums.length; ++i) {
        const al = $(rawAlbums[i]);
        const artwork = al.find(".thumb-img").attr("data-original");
        albums.push({
            id: al.find(".album-play").attr("data-id"),
            标题: al.find(".album-name").text(),
            artwork: artwork.startsWith("//") ? `https:${artwork}` : artwork,
            日期： ””，
            艺术家：artistItem.name，
        });
    }
    返回 {
        isEnd: $(".pagination-next").hasClass("disabled"),
        数据：专辑，
    };
}
异步函数 getArtistWorks(artistItem, page, type) {
    如果（类型 === "音乐") {
        const headers = {
            Accept: "application/json, text/javascript, */*; q=0.01",
            "接受编码": "gzip、deflate、br",
            "接受语言": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            连接：“保持连接”
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            主机: "m.music.migu.cn",
            参考链接：`https://m.music.migu.cn/migu/l/?s=149&p=163&c=5123&j=l&id=${artistItem.id}`,
            "Sec-Fetch-Dest": "空",
            “安全获取模式”： “cors”，
            "Sec-Fetch-Site": "同源",
            "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, 如 Gecko) Chrome/89.0.4389.114 Mobile Safari/537.36 Edg/89.0.774.68",
            "X-Requested-With": "XMLHttpRequest",
        };
        const musicList = (await axios_1.default.get("https://m.music.migu.cn/migu/remoting/cms_artist_song_list_tag", {
            标题，
            参数：{
                artistId: artistItem.id,
                页面大小：20，
                页码：第 -1 页
            },
        })).data || {};
        返回 {
            数据：musicList.result.results.map((_) => ({
                id: _.songId,
                艺术作品：_.picL，
                标题：_.songName，
                艺术家:(_.singerName || []).join(", "),
                专辑：_.专辑名称，
                url: musicCanPlayFilter(_),
                rawLrc：_.lyricLrc，
                copyrightId: _.copyrightId,
                singerId: _.singerId,
            })),
        };
    }
    否则如果（类型 === "专辑") {
        返回 getArtistAlbumWorks(artistItem, 页);
    }
}
async function getLyric(musicItem) {
    const headers = {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "接受编码": "gzip、deflate、br",
        "接受语言": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        连接：“保持连接”
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        主机: "m.music.migu.cn",
        推荐人：`https://m.music.migu.cn/migu/l/?s=149&p=163&c=5200&j=l&id=${musicItem.copyrightId}`,
        "Sec-Fetch-Dest": "空",
        “安全获取模式”： “cors”，
        "Sec-Fetch-Site": "同源",
        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, 如 Gecko) Chrome/89.0.4389.114 Mobile Safari/537.36 Edg/89.0.774.68",
        "X-Requested-With": "XMLHttpRequest",
    };
    const result = (await axios_1.default.get("https://m.music.migu.cn/migu/remoting/cms_detail_tag", {
        标题，
        参数：{
            cpid：musicItem.copyrightId，
        },
    }））。数据;
    返回 {
        rawLrc：result.data.lyricLrc，
    };
}
异步函数 getMusicSheetInfo(sheet, page) {
    const res = (await axios_1.default.get("https://m.music.migu.cn/migumusic/h5/playlist/songsInfo", {
        参数：{
            列表 ID：sheet.id，
            页码：页码
            页面大小：30，
        },
        标题：{
            主机: "m.music.migu.cn",
            引用者：“https://m.music.migu.cn/v4/music/playlist/”，
            作者："7242bd16f68cd9b39c54a8e61537009f",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/113.0.0.0",
        },
    })).data.data;
    如果 (!res) {
        返回 {
            isEnd: true,
            音乐列表：[]，
        };
    }
    const isEnd = res.total < 30;
    返回 {
        isEnd，
        音乐列表：res.items
            .filter((item) => { var _a; return ((_a = item === null || item === void 0 ? void 0 : item.fullSong) === null || _a === void 0 ? void 0 : _a.vipFlag) === 0; })
            .map((_) => {
                var _a、_b、_c、_d、_e、_f、_g、_h、_j、_k；
                返回 （{
                    id: _.id,
                    art: ((_a = _.mediumPic) === null || _a === void 0 ? void 0 : _a.startsWith("//"))
                        ?`http:${_.mediumPic}`
                        : _.mediumPic，
                    标题：_.name，
                    artist: (_f = (_e = (_d = (_c = (_b = _.singers) === null || _b === void 0 ? void 0 : _b.map) === null || _c === void 0 ? void 0 : _c.call(_b, (_) => _.name)) === null || _d === void 0 ? void 0 : _d.join) === null || _e === void 0 ? void 0 : _e.call(_d, ",")) !== null && _f !== void 0 ? _f : "",
                    album: (_h = (_g = _.album) === null || _g === void 0 ? void 0 : _g.albumName) !== null && _h !== void 0 ? _h : "",
                    copyrightId: _.copyrightId,
                    singerId: (_k = (_j = _.singers) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.id,
                });
            }),
    };
}
异步函数 importMusicSheet(urlLike) {
    var _a, _b, _c, _d;
    令 id；
    如果 (!id) {
        id = (urlLike.match(/https?:\/\/music\.migu\.cn\/v3\/(?:my|music)\/playlist\/([0-9]+)/) || [])[1];
    }
    如果 (!id) {
        id = (urlLike.match(/https?:\/\/h5\.nf\.migu\.cn\/app\/v4\/p\/share\/playlist\/index.html\?.*id=([0-9]+)/) || [])[1];
    }
    如果 (!id) {
        id = (_a = urlLike.match(/^\s*(\d+)\s*$/)) === null || _a === void 0 ? void 0 : _a[1];
    }
    如果 (!id) {
        const tempUrl = (_b = urlLike.match(/(https?:\/\/c\.migu\.cn\/[\S]+)\?/)) === null || _b === void 0 ? void 0 : _b[1];
        如果 (tempUrl) {
            const request = (await axios_1.default.get(tempUrl, {
                标题：{
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.61",
                    接受："text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    主机: "c.migu.cn",
                },
                validateStatus(status) {
                    返回（状态码 >= 200 且 < 300）|| 状态码 === 403；
                },
            }））。要求;
            const realpath = (_c = request === null || request === void 0 ? void 0 : request.path) !== null && _c !== void 0 ? _c : request === null || request === void 0 ? void 0 : request.responseURL;
            如果（真实路径）{
                id = (_d = realpath.match(/id=(\d+)/)) === null || _d === void 0 ? void 0 : _d[1];
            }
        }
    }
    如果 (!id) {
        返回;
    }
    const headers = {
        主机: "m.music.migu.cn",
        "Sec-Fetch-Dest": "空",
        “安全获取模式”： “cors”，
        "Sec-Fetch-Site": "同源",
        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, 如 Gecko) Chrome/89.0.4389.114 Mobile Safari/537.36 Edg/89.0.774.68",
        "X-Requested-With": "XMLHttpRequest",
        参考：“https://m.music.migu.cn”,
    };
    const res = (await axios_1.default.get(`https://m.music.migu.cn/migu/remoting/query_playlist_by_id_tag?onLine=1&queryChannel=0&createUserId=migu&contentCountMin=5&playListId=${id}`, {
        标题，
    }））。数据;
    const contentCount = parseInt(res.rsp.playList[0].contentCount);
    const cids = [];
    let pageNo = 1;
    while ((pageNo - 1) * 20 < contentCount) {
        const listPage = (await axios_1.default.get(`https://music.migu.cn/v3/music/playlist/${id}?page=${pageNo}`)).data;
        const $ = (0, Cheerio_1.load)(listPage);
        $(".row.J_CopySong").each((i, v) => {
            cids.push($(v).attr("data-cid"));
        });
        页码 += 1;
    }
    如果 (cids.length === 0) {
        返回;
    }
    const songs = (await (0, axios_1.default)({
        url: `https://music.migu.cn/v3/api/music/audioPlayer/songs?type=1©rightId=${cids.join(",")}`,
        标题：{
            引用者：“http://m.music.migu.cn/v3”，
        },
        xsrfCookieName: "XSRF-TOKEN",
        withCredentials: true,
    }））。数据;
    返回歌曲项目
        .filter((_) => _.vipFlag === 0)
        .map((_) => {
            var _a, _b, _c, _d, _e, _f;
            返回 （{
                id: _.songId,
                艺术作品：_.封面，
                标题：_.songName，
                artist: (_b = (_a = _.singers) === null || _a === void 0 ? void 0 : _a.map((_) => _.artistName)) === null || _b === void 0 ? void 0 : _b.join(", "),
                album: (_d = (_c = _.albums) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.albumName,
                copyrightId: _.copyrightId,
                singerId: (_f = (_e = _.singers) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.artistId,
            });
        });
}
异步函数 getTopLists() {
    const jianjiao = {
        title: 《咪咕尖叫榜》,
        数据： [
            {
                id: "jianjiao_newsong",
                title: "尖叫新歌榜",
                coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/02/36/2002051206540​​2_360x360_2997.png",
            },
            {
                id: "jianjiao_hotsong",
                title: 《尖叫热歌榜》,
                coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/04/99/200408163640868_360x360_6587.png",
            },
            {
                id: "jianjiao_original",
                title: "尖叫原创榜",
                coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/04/99/200408163702795_360x360_1614.png",
            },
        ],
    };
    const tese = {
        title: 《咪咕特色榜》,
        数据： [
            {
                id: "电影",
                title: 《影视榜》,
                coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/05/136/200515161848938_360x360_673.png",
            },
            {
                id: "大陆",
                title: "内地榜",
                coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/08/231/200818095104122_327x327_4971.png",
            },
            {
                id: "hktw",
                title: "港台榜",
                coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/08/231/200818095125191_327x327_2382.png",
            },
            {
                id: "eur_usa",
                title: "欧美榜",
                coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/08/231/200818095229556_327x327_1383.png",
            },
            {
                id: "jpn_kor",
                title: "日韩榜",
                coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/08/231/200818095259569_327x327_4628.png",
            },
            {
                id: "coloring",
                title: "彩铃榜",
                coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/08/231/200818095356693_327x327_7955.png",
            },
            {
                id: "ktv",
                title: 《KTV榜》,
                coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/08/231/200818095414420_327x327_4992.png",
            },
            {
                id: "网络",
                title: "网络榜",
                coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/08/231/200818095442606_327x327_1298.png",
            },
        ],
    };
    返回[jianjiao，tese]；
}
const UA = "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, 如 Gecko) Chrome/89.0.4389.114 Mobile Safari/537.36 Edg/89.0.774.68";
const By = CryptoJS.MD5(UA).toString();
异步函数 getTopListDetail(topListItem) {
    const res = await axios_1.default.get(`https://m.music.migu.cn/migumusic/h5/billboard/home`, {
        参数：{
            pathName: topListItem.id,
            页码：1，
            页面大小：100，
        },
        标题：{
            接受： ”*/*”，
            "接受编码": "gzip、deflate、br",
            连接：“保持连接”
            主机: "m.music.migu.cn",
            引用者：`https://m.music.migu.cn/v4/music/top/${topListItem.id}`,
            "User-Agent": UA,
            经过，
        },
    });
    返回 Object.assign(Object.assign({}, topListItem), {
        音乐列表：res.data.data.songs.items
            .map((_) => {
                var _a, _b, _c, _d, _e, _f;
                返回 （{
                    id: _.id,
                    art: ((_a = _.mediumPic) === null || _a === void 0 ? void 0 : _a.startsWith("//"))
                        ?`https:${_.mediumPic}`
                        : _.mediumPic，
                    标题：_.name，
                    artist: (_c = (_b = _.singers) === null || _b === void 0 ? void 0 : _b.map((_) => _.name)) === null || _c === void 0 ? void 0 : _c.join(", "),
                    专辑：(_d = _.album) === null || _d === 无效 0 ？ void 0 : _d.专辑名称,
                    copyrightId: _.copyrightId,
                    singerId: (_f = (_e = _.singers) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.id,
                });
            })
    });
}
异步函数 getRecommendSheetTags() {
    const allTags = (await axios_1.default.get("https://m.music.migu.cn/migumusic/h5/playlist/allTag", {
        标题：{
            主机: "m.music.migu.cn",
            引用者：“https://m.music.migu.cn/v4/music/playlist”，
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/113.0.0.0",
            作者："7242bd16f68cd9b39c54a8e61537009f",
        },
    })).data.data.tags;
    const data = allTags.map((_) => {
        返回 {
            标题：_.tagName，
            数据：_.tags.map((_) => ({
                id: _.tagId,
                标题：_.tagName，
            })),
        };
    });
    返回 {
        置顶：[
            {
                标题：《小清新》，
                id: "1000587673",
            },
            {
                标题：“电视剧”，
                id: "1001076078",
            },
            {
                title: "民谣",
                id: "1000001775",
            },
            {
                标题：“旅行”，
                id: "1000001749",
            },
            {
                标题：《思念》，
                id: "1000001703",
            },
        ],
        数据，
    };
}
异步函数 getRecommendSheetsByTag(sheetItem, page) {
    const pageSize = 20;
    const res = (await axios_1.default.get("https://m.music.migu.cn/migumusic/h5/playlist/list", {
        参数：{
            columnId: 15127272,
            tagId: sheetItem.id,
            页码：页码，
            页面大小，
        },
        标题：{
            "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/113.0.0.0",
            主机: "m.music.migu.cn",
            作者："7242bd16f68cd9b39c54a8e61537009f",
            参考：“https://m.music.migu.cn/v4/music/playlist”，
        },
    })).data.data;
    const isEnd = page * pageSize > res.total;
    const data = res.items.map((_) => ({
        id: _.playListId,
        艺术家：_.createUserName，
        标题：_.播放列表名称，
        artwork: _.image.startsWith("//") ? `http:${_.image}` : _.image,
        播放次数：_.playCount，
        createUserId: _.createUserId,
    }));
    返回 {
        isEnd，
        数据，
    };
}
async function getMediaSourceByMTM(musicItem, quality) {
    如果（质量 === "标准" && 音乐项的 URL）{
        返回 {
            url: musicItem.url,
        };
    }
    否则如果（质量 === "标准") {
        const headers = {
            Accept: "application/json, text/javascript, */*; q=0.01",
            "接受编码": "gzip、deflate、br",
            "接受语言": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            连接：“保持连接”
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            主机: "m.music.migu.cn",
            推荐人：`https://m.music.migu.cn/migu/l/?s=149&p=163&c=5200&j=l&id=${musicItem.copyrightId}`,
            "Sec-Fetch-Dest": "空",
            “安全获取模式”： “cors”，
            "Sec-Fetch-Site": "同源",
            "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, 如 Gecko) Chrome/89.0.4389.114 Mobile Safari/537.36 Edg/89.0.774.68",
            "X-Requested-With": "XMLHttpRequest",
        };
        const result = (await axios_1.default.get("https://m.music.migu.cn/migu/remoting/cms_detail_tag", {
            标题，
            参数：{
                cpid：musicItem.copyrightId，
            },
        })).data.data;
        返回 {
            艺术品：musicItem.artwork || result.picL，
            url: result.listenUrl || result.listenQq || result.lisCr,
        };
    }
}
const qualityLevels = {
    低：“128k”，
    标准：“320k”，
    高：“320k”，
    超级：“320k”，
};
async function getMediaSource(musicItem, quality) {
    const res = (
        await axios_1.default.get(`https://lxmusicapi.onrender.com/url/mg/${musicItem.id}/${qualityLevels[quality]}`, {
            标题：{
                "X-Request-Key": "share-v3"
            },
        })
    ）。数据;
    返回 {
        url: res.url，
    };
}
module.exports = {
    平台：“小蜜音乐”，
    作者："Huibq",
    版本：“0.3.0”，
    appVersion: ">0.1.0-alpha.0",
    提示：{
        importMusicSheet: [
            "咪咕APP：自建歌单-分享-复制链接，直接粘贴即可",
            "H5/PC端：复制URL并粘贴，或者直接输入纯数字歌单ID即可",
            "导入时间和歌曲单大小有关，请耐心等待",
        ],
    },
    primaryKey: ["id", "copyrightId"],
    cacheControl: "缓存",
    srcUrl: "https://fastly.jsdelivr.net/gh/Huibq/keep-alive/Music_Free/xiaomi.js",
    supportedSearchType: ["音乐", "专辑", "乐谱", "艺术家", "歌词"],
    获取媒体源，
    异步搜索(查询，页面，类型) {
        如果（类型 === "音乐") {
            返回 await searchMusic(query, page);
        }
        如果（类型 === "专辑") {
            返回 await searchAlbum(query, page);
        }
        如果（类型 === "艺术家") {
            返回 await searchArtist(query, page);
        }
        如果（类型 === "sheet") {
            返回 await searchMusicSheet(query, page);
        }
        如果（类型 === "歌词") {
            返回 await searchLyric(query, page);
        }
    },
    异步 getAlbumInfo(albumItem) {
        const headers = {
            Accept: "application/json, text/javascript, */*; q=0.01",
            "接受编码": "gzip、deflate、br",
            "接受语言": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            连接：“保持连接”
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            主机: "m.music.migu.cn",
            引用者：`https://m.music.migu.cn/migu/l/?record=record&id=${albumItem.id}`,
            "Sec-Fetch-Dest": "空",
            “安全获取模式”： “cors”，
            "Sec-Fetch-Site": "同源",
            "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, 如 Gecko) Chrome/89.0.4389.114 Mobile Safari/537.36 Edg/89.0.774.68",
            "X-Requested-With": "XMLHttpRequest",
        };
        const musicList = (await axios_1.default.get("https://m.music.migu.cn/migu/remoting/cms_album_song_list_tag", {
            标题，
            参数：{
                albumId: albumItem.id,
                页面大小：30，
            },
        })).data || {};
        const albumDesc = (await axios_1.default.get("https://m.music.migu.cn/migu/remoting/cms_album_detail_tag", {
            标题，
            参数：{
                albumId: albumItem.id,
            },
        })).data || {};
        返回 {
            albumItem: { description: albumDesc.albumIntro },
            musicList: musicList.result.results
                .map((_) => ({
                    id: _.songId,
                    艺术作品：_.picL，
                    标题：_.songName，
                    艺术家:(_.singerName || []).join(", "),
                    专辑：albumItem.title，
                    url: musicCanPlayFilter(_),
                    rawLrc：_.lyricLrc，
                    copyrightId: _.copyrightId,
                    singerId: _.singerId,
                })),
        };
    },
    获取ArtistWorks：获取ArtistWorks，
    getLyric：getLyric，
    importMusicSheet,
    获取热门列表，
    获取热门列表详情，
    获取推荐表标签，
    获取按标签推荐表，
    获取乐谱信息，
};
