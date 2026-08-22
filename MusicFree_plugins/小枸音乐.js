“使用严格模式”；
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const Cheerio_1 = require("cheerio");
const CryptoJs = require("crypto-js");
const he = require("he");
const pageSize = 20;
function formatMusicItem(_) {
    var _a、_b、_c、_d、_e、_f、_g、_h、_i；
    返回 {
        id: (_d = _.FileHash) !== null && _d !== void 0 ? _d : _.Grp[0].FileHash,
        标题：(_a = _.SongName) !== null && _a !== void 0 ? _a : _.OriSongName,
        artist: (_b = _.SingerName) !== null && _b !== void 0 ? _b : _.Singers[0].name,
        album: (_c = _.AlbumName) !== null && _c !== void 0 ? _c : _.Grp[0].AlbumName,
        album_id: (_e = _.AlbumID) !== null && _e !== void 0 ? _e : _.Grp[0].AlbumID,
        album_audio_id: 0,
        持续时间：_.持续时间，
        artwork: ((_f = _.Image) !== null && _f !== void 0 ? _f : _.Grp[0].Image).replace("{size}", "1080"),
        "320hash": (_i = _.HQFileHash) !== null && _i !== void 0 ? _i : undefined,
        sqhash: (_g = _.SQFileHash) !== null && _g !== void 0 ? _g : undefined,
        ResFileHash: (_h = _.ResFileHash) !== null && _h !== void 0 ? _h : undefined,
    };
}
function formatMusicItem2(_) {
    var _a、_b、_c、_d、_e、_f、_g；
    返回 {
        id: _.hash，
        标题：_.歌曲名，
        artist: (_a = _.singername) !== null && _a !== void 0 ? _a : (((_c = (_b = _.authors) === null || _b === void 0 ? void 0 : _b.map((_) => { var _a; return (_a = _ === null || _ === void 0 ? void 0 : _.author_name) !== null && _a !== void 0 ? _a : ""; })) === null || _c === void 0 ? void 0 : _c.join(", ")) ||
            ((_f = (_e = (_d = _.filename) === null || _d === void 0 ? void 0 : _d.split("-")) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.trim())),
        专辑：(_g = _.album_name) !== null && _g !== void 0 ? _g : _.remark,
        album_id: _.album_id,
        album_audio_id: _.album_audio_id,
        封面图：_.album_sizable_cover
            ? _.album_sizable_cover.replace("{size}", "400")
            ： 不明确的，
        持续时间：_.duration，
        "320hash": _["320hash"],
        sqhash: _.sqhash，
        origin_hash: _.origin_hash,
    };
}
function formatImportMusicItem(_) {
    var _a、_b、_c、_d、_e、_f、_g；
    let title = _.name;
    const singerName = _.singername;
    如果（歌手姓名和标题）{
        const index = title.indexOf(singerName);
        如果（索引 !== -1）{
            title = (_a = title.substring(index + singerName.length + 2)) === null || _a === void 0 ? void 0 : _a.trim();
        }
        如果 (!title) {
            标题 = 歌手姓名；
        }
    }
    const qualites = _.relate_goods;
    返回 {
        id: _.hash，
        标题，
        艺术家：歌手姓名，
        专辑：(_b = _.albumname) !== null && _b !== void 0 ? _b : "",
        album_id: _.album_id,
        album_audio_id: _.album_audio_id,
        artwork: (_d = (_c = _ === null || _ === void 0 ? void 0 : _.info) === null || _c === void 0 ? void 0 : _c.image) === null || _d === void 0 ? void 0 : _d.replace("{size}", "400"),
        "320hash": (_e = qualites === null || qualites === void 0 ? void 0 : qualites[1]) === null || _e === 无效 0 ？ void 0 : _e.hash,
        sqhash: (_f = qualites === null || qualites === void 0 ? void 0 : qualites[2]) === null || _f === 无效 0 ？无效0：_f.hash，
        origin_hash: (_g = qualites === null || qualites === void 0 ? void 0 : qualites[3]) === null || _g === 无效 0 ？无效0：_g.hash，
    };
}
const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
    接受： ”*/*”，
    "Accept-Encoding": "gzip, deflate",
    "接受语言": "zh-CN,zh;q=0.9",
};
异步函数 searchMusic(query, page) {
    const res = (await axios_1.default.get("https://songsearch.kugou.com/song_search_v2", {
        标题，
        参数：{
            关键词：查询
            页，
            页面大小：pageSize，
            用户ID：0，
            客户端：“，
            平台：“WebFilter”，
            过滤器：2，
            更正：1，
            privilege_filter: 0,
            区号：1，
        },
    }））。数据;
    const songs = res.data.lists.map(formatMusicItem);
    返回 {
        isEnd：页面 * 页面大小 >= res.data.total，
        数据：歌曲，
    };
}
异步函数 searchAlbum(query, page) {
    const res = (await axios_1.default.get("http://msearch.kugou.com/api/v3/search/album", {
        标题，
        参数：{
            版本：9108
            更正：1，
            突出显示：“em”，
            plat: 0,
            关键词：查询
            页数：20，
            页，
            版本：2
            with_res_tag: 0,
        },
    }））。数据;
    const albums = res.data.info.map((_) => {
        var _a, _b;
        返回 （{
            id: _.albumid,
            artwork: (_a = _.imgurl) === null || _a === void 0 ? void 0 : _a.replace("{size}", "400"),
            艺术家：_.歌手名，
            标题: (0, cheerio_1.load)(_.albumname).text(),
            描述：_.intro，
            日期：(_b = _.publishtime) === null || _b === void 0 ? void 0 : _b.slice(0, 10),
        });
    });
    返回 {
        isEnd: page * 20 >= res.data.total,
        数据：专辑，
    };
}
异步函数 searchMusicSheet(query, page) {
    const res = (await axios_1.default.get("http://mobilecdn.kugou.com/api/v3/search/special", {
        标题，
        参数：{
            格式："json",
            关键词：查询
            页，
            页面大小：pageSize，
            显示类型：1，
        },
    }））。数据;
    const sheets = res.data.info.map(item => ({
        标题：物品.特殊名称，
        创建时间：item.publishtime，
        描述：项目简介，
        艺术家：item.nickname，
        coverImg: item.imgurl,
        gid: item.gid，
        播放次数：item.playcount，
        id: item.specialid,
        worksNum：项目.歌曲计数
    }));
    返回 {
        isEnd：页面 * 页面大小 >= res.data.total，
        数据表
    };
}
const qualityLevels = {
    低：“128k”，
    标准：“320k”，
    高：“320k”，
    超级：“320k”，
};
async function getMediaSource(musicItem, quality) {
    const res = (
        await axios_1.default.get(`https://lxmusicapi.onrender.com/url/kg/${musicItem.id}/${qualityLevels[quality]}`, {
            标题：{
                "X-Request-Key": "share-v3"
            },
        })
    ）。数据;
    返回 {
        url: res.url，
    };
}
异步函数 getTopLists() {
    const lists = (await axios_1.default.get("http://mobilecdnbj.kugou.com/api/v3/rank/list?version=9108&plat=0&showtype=2&parentid=0&apiver=6&area_code=1&withsong=0&with_res_tag=0", {
        标题：标题，
    })).data.data.info;
    const res = [
        {
            title: "热门排行榜",
            数据： []，
        },
        {
            title: "特色音乐榜",
            数据： []，
        },
        {
            标题：“全球排行榜”，
            数据： []，
        },
    ];
    const extra = {
        标题：“其他”，
        数据： []，
    };
    lists.forEach((item) => {
        var _a, _b, _c, _d;
        如果 (item.classify === 1 || item.classify === 2) {
            res[0].data.push({
                id: item.rankid,
                描述：项目简介，
                coverImg: (_a = item.imgurl) === null || _a === void 0 ? void 0 : _a.replace("{size}", "400"),
                标题：item.rankname，
            });
        }
        否则如果 (item.classify === 3 || item.classify === 5) {
            res[1].data.push({
                id: item.rankid,
                描述：项目简介，
                coverImg: (_b = item.imgurl) === null || _b === void 0 ? void 0 : _b.replace("{size}", "400"),
                标题：item.rankname，
            });
        }
        否则如果 (item.classify === 4) {
            res[2].data.push({
                id: item.rankid,
                描述：项目简介，
                coverImg: (_c = item.imgurl) === null || _c === void 0 ? void 0 : _c.replace("{size}", "400"),
                标题：item.rankname，
            });
        }
        别的 {
            extra.data.push({
                id: item.rankid,
                描述：项目简介，
                coverImg: (_d = item.imgurl) === null || _d === void 0 ? void 0 : _d.replace("{size}", "400"),
                标题：item.rankname，
            });
        }
    });
    如果 (extra.data.length !== 0) {
        res.push(extra);
    }
    返回结果；
}
异步函数 getTopListDetail(topListItem) {
    const res = await axios_1.default.get(`http://mobilecdnbj.kugou.com/api/v3/rank/song?version=9108&ranktype=0&plat=0&pagesize=100&area_code=1&page=1&volid=35050&rankid=${topListItem.id}&with_res_tag=0`, {
        标题，
    });
    return Object.assign(Object.assign({}, topListItem), { musicList: res.data.data.info.map(formatMusicItem2) });
}
异步函数 getLyricDownload(lyrdata) {
    const result = (await (0, axios_1.default)({
        // url: `http://lyrics.kugou.com/download?ver=1&client=pc&id=${lyrdata.id}&accesskey=${lyrdata.accessKey}&fmt=krc&charset=utf8`,
        url: `http://lyrics.kugou.com/download?ver=1&client=pc&id=${lyrdata.id}&accesskey=${lyrdata.accessKey}&fmt=lrc&charset=utf8`,
        标题：{
            'KG-RC'：1，
            'KG-THash': 'expand_search_manager.cpp:852736169:451',
            'User-Agent': 'KuGou2012-9020-ExpandSearchManager',
        },
        方法：“get”，
        xsrfCookieName: "XSRF-TOKEN",
        withCredentials: true,
    }））。数据;
    返回 {
        rawLrc: he.decode(CryptoJs.enc.Base64.parse(result.content).toString(CryptoJs.enc.Utf8)),
    };
}
// 复制自 lxmusic https://github.com/lyswhut/lx-music-desktop/blob/master/src/renderer/utils/musicSdk/kg/lyric.js#L114
async function getLyric(musicItem) {
    const result = (await (0, axios_1.default)({
        url: `http://lyrics.kugou.com/search?ver=1&man=yes&client=pc&keyword=${musicItem.title}&ha​​sh=${musicItem.id}&timelength=${musicItem.duration}`,
        标题：{
            'KG-RC'：1，
            'KG-THash': 'expand_search_manager.cpp:852736169:451',
            'User-Agent': 'KuGou2012-9020-ExpandSearchManager',
        },
        方法：“get”，
        xsrfCookieName: "XSRF-TOKEN",
        withCredentials: true,
    }））。数据;
    const info = result.candidates[0];
    return await getLyricDownload({ id: info.id, accessKey: info.accesskey })
}
异步函数 getAlbumInfo(albumItem, page = 1) {
    const res = (await axios_1.default.get("http://mobilecdn.kugou.com/api/v3/album/song", {
        参数：{
            版本：9108
            albumid: albumItem.id,
            plat: 0,
            页数：100
            区号：1，
            页，
            with_res_tag: 0,
        },
    }））。数据;
    返回 {
        isEnd: page * 100 >= res.data.total,
        专辑项：{
            worksNum: res.data.total,
        },
        musicList: res.data.info.map((_) => {
            var _a;
            const [artist, songname] = _.filename.split("-");
            返回 {
                id: _.hash，
                标题：歌曲名.trim()，
                艺术家：artist.trim()，
                专辑：(_a = _.album_name) !== null && _a !== void 0 ? _a : _.remark,
                album_id: _.album_id,
                album_audio_id: _.album_audio_id,
                专辑封面：albumItem.artwork，
                "320hash": _.HQFileHash,
                sqhash: _.SQFileHash，
                origin_hash: _.id,
            };
        }),
    };
}
异步函数 importMusicSheet(urlLike) {
    var _a;
    let id = (_a = urlLike.match(/^(?:.*?)(\d+)(?:.*?)$/)) === null || _a === void 0 ? void 0 : _a[1];
    let musicList = [];
    如果 (!id) {
        返回;
    }
    let res = await axios_1.default.post(`http://t.kugou.com/command/`, {
        appid：1001
        客户端版本：9020
        中：“21511157a05844bd085308bc76ef3343”，
        客户端时间：640612895，
        键：“36164c4015e704673c588ee202b9ecb8”，
        数据：id，
    });
    如果 (res.status === 200 && res.data.status === 1) {
        let data = res.data.data;
        let response = await axios_1.default.post(`http://www2.kugou.kugou.com/apps/kucodeAndShare/app/`, {
            appid：1001
            客户端版本：10112
            中：“70a02aad1ce4648e7dca77f2afa7b182”，
            clienttime: 722219501,
            键：“381d7062030e8a5a94cfbe50bfe65433”，
            数据： {
                id: data.info.id,
                类型：3，
                用户 ID：data.info.userid，
                collect_type: data.info.collect_type,
                页码：1，
                页面大小：data.info.count，
            },
        });
        如果 (response.status === 200 && response.data.status === 1) {
            let resource = [];
            response.data.data.forEach((song) => {
                resource.push({
                    album_audio_id: 0,
                    album_id: "0",
                    哈希值：歌曲哈希值
                    id：0，
                    名称: song.filename.replace(".mp3", ""),
                    page_id: 0,
                    类型：“音频”，
                });
            });
            let postData = {
                appid：1001
                区号：“1”，
                行为：“玩耍”，
                客户端版本：“10112”，
                dfid: "2O3jKa20Gdks0LWojP3ly7ck",
                中：“70a02aad1ce4648e7dca77f2afa7b182”，
                need_hash_offset: 1,
                相关：1，
                资源，
                标记：“，
                用户 ID：“0”，
                VIP：0，
            };
            var result = await axios_1.default.post(`https://gateway.kugou.com/v2/get_res_privilege/lite?appid=1001&clienttime=1668883879&clientver=10112&dfid=2O3jKa20Gdks0LWojP3ly7ck&mid=70a02aad1ce4648e7dca77f2afa7b182&userid=390523108&uuid=92691C6246F86F28B149BAA1FD370DF1`, postData, {
                标题：{
                    "x-router": "media.store.kugou.com",
                },
            });
            如果 (response.status === 200 && response.data.status === 1) {
                musicList = result.data.data
                    .map(formatImportMusicItem);
            }
        }
    }
    返回音乐列表；
}
module.exports = {
    平台：“小枸音乐”，
    版本：“0.3.0”，
    作者：'Huibq'
    appVersion: ">0.1.0-alpha.0",
    srcUrl: "https://fastly.jsdelivr.net/gh/Huibq/keep-alive/Music_Free/xiaogou.js",
    cacheControl: "no-cache",
    描述： ””，
    primaryKey: ["id", "album_id", "album_audio_id"],
    提示：{
        importMusicSheet: [
            "仅支持酷狗APP，通过酷狗码导入，输入纯数字酷狗码即可。",
            "导入时间和歌曲单大小有关，请耐心等待",
        ],
    },
    supportedSearchType: ["音乐", "专辑", "乐谱"],
    异步搜索(查询，页面，类型) {
        如果（类型 === "音乐") {
            返回 await searchMusic(query, page);
        }
        否则如果（类型 === "专辑") {
            返回 await searchAlbum(query, page);
        }
        否则如果（类型 === "sheet") {
            返回 await searchMusicSheet(query, page);
        }
    },
    获取媒体源，
    获取热门列表，
    getLyric，
    获取热门列表详情，
    获取专辑信息，
    importMusicSheet,
};
