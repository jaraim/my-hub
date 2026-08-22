“使用严格模式”；
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const CryptoJs = require("crypto-js");
const qs = require("qs");
const bigInt = require("big-integer");
const dayjs = require("dayjs");
const Cheerio = require("cheerio");
function create_key() {
    var d, e, b = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", c = "";
    for (d = 0; 16 > d; d += 1)
        (e = Math.random() * b.length), (e = Math.floor(e)), (c += b.charAt(e));
    返回 c；
}
函数 AES(a, b) {
    var c = CryptoJs.enc.Utf8.parse(b), d = CryptoJs.enc.Utf8.parse("0102030405060708"), e = CryptoJs.enc.Utf8.parse(a), f = CryptoJs.AES.encrypt(e, c, {
        iv：d，
        模式：CryptoJs.mode.CBC，
    });
    返回 f.toString();
}
函数 Rsa(text) {
    text = text.split("").reverse().join("");
    const d = "010001";
    常量 e = “00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725 152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312e cbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d8 13cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7”；
    const hexText = text
        。分裂（””）
        .map((_) => _.charCodeAt(0).toString(16))
        。加入（””）;
    const res = bigInt(hexText, 16)
        .modPow(bigInt(d, 16), bigInt(e, 16))
        .toString(16);
    返回数组(256 - res.length)
        .fill("0")
        。加入（””）
        .concat(res);
}
function getParamsAndEnc(text) {
    const first = AES(text, "0CoJUm6Qyw8W8jud");
    const rand = create_key();
    const params = AES(first, rand);
    const encSecKey = Rsa(rand);
    返回 {
        参数，
        encSecKey，
    };
}
function formatMusicItem(_) {
    var _a, _b, _c, _d;
    const 专辑 = _.al || _.专辑；
    返回 {
        id: _.id,
        artwork: album === null || album === void 0 ? void 0 : album.picUrl,
        标题：_.name，
        艺术家:(_.ar || _.artists)[0].name,
        专辑：专辑 === null || 专辑 === void 0 ? void 0 : album.name,
        url: `https://share.duanx.cn/url/wy/${_.id}/128k`,
        品质：{
            低的： {
                size: (_a = (_.l || {})) === null || _a === void 0 ? void 0 : _a.size,
            },
            标准： {
                size: (_b = (_.m || {})) === null || _b === void 0 ? void 0 : _b.size,
            },
            高的： {
                size: (_c = (_.h || {})) === null || _c === void 0 ? void 0 : _c.size,
            },
            极好的： {
                size: (_d = (_.sq || {})) === null || _d === void 0 ? void 0 : _d.size,
            },
        },
        copyrightId: _ === null || _ === void 0 ? void 0 : _.copyrightId
    };
}
function formatAlbumItem(_) {
    返回 {
        id: _.id,
        艺术家：_.artist.name，
        标题：_.name，
        艺术作品：_.picUrl，
        描述： ””，
        日期：dayjs.unix(_.publishTime / 1000).format("YYYY-MM-DD"),
    };
}
const pageSize = 30;
async function searchBase(query, page, type) {
    const data = {
        s：查询，
        限制：页面大小，
        类型：类型，
        偏移量：（页码 - 1）* 页面大小，
        csrf_token: "",
    };
    const pae = getParamsAndEnc(JSON.stringify(data));
    const paeData = qs.stringify(pae);
    const headers = {
        权威来源：“music.163.com”，
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
        "content-type": "application/x-www-form-urlencoded",
        接受： ”*/*”，
        来源：“https://music.163.com”
        "sec-fetch-site": "同源",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "空",
        引用者：“https://music.163.com/search/”，
        "accept-language": "zh-CN,zh;q=0.9",
    };
    const res = (await (0, axios_1.default)({
        方法："post",
        url: "https://music.163.com/weapi/search/get",
        标题，
        数据：paeData，
    }））。数据;
    返回结果；
}
异步函数 searchMusic(query, page) {
    const res = await searchBase(query, page, 1);
    const songs = res.result.songs
        .map(formatMusicItem);
    返回 {
        isEnd: res.result.songCount <= page * pageSize,
        数据：歌曲，
    };
}
异步函数 searchAlbum(query, page) {
    const res = await searchBase(query, page, 10);
    const albums = res.result.albums.map(formatAlbumItem);
    返回 {
        isEnd: res.result.albumCount <= page * pageSize,
        数据：专辑，
    };
}
异步函数 searchArtist(query, page) {
    const res = await searchBase(query, page, 100);
    const artists = res.result.artists.map((_) => ({
        名称：_.name，
        id: _.id,
        头像：_.img1v1Url，
        worksNum: _.albumSize,
    }));
    返回 {
        isEnd: res.result.artistCount <= page * pageSize,
        数据：艺术家，
    };
}
异步函数 searchMusicSheet(query, page) {
    const res = await searchBase(query, page, 1000);
    const playlists = res.result.playlists.map((_) => {
        var _a;
        返回 （{
            标题：_.name，
            id: _.id,
            coverImg: _.coverImgUrl,
            艺术家：（_a = _.creator）=== null || _a === void 0 ? void 0 : _a.nickname,
            播放次数：_.playCount，
            worksNum: _.trackCount,
        });
    });
    返回 {
        isEnd: res.result.playlistCount <= page * pageSize,
        数据：播放列表，
    };
}
async function searchLyric(query, page) {
    var _a, _b;
    const res = await searchBase(query, page, 1006);
    const lyrics = (_b = (_a = res.result.songs) === null || _a === void 0 ? void 0 : _a.map((it) => {
        var _a, _b, _c, _d;
        返回 （{
            标题：it.name，
            艺术家: (_a = it.ar) === null || _a === void 0 ? void 0 : _a.map((_) => _.name).join(", "),
            id：it.id，
            art: (_b = it.al) === null || _b === void 0 ? void 0 : _b.picUrl,
            专辑：(_c = it.al) === null || _c === void 0 ? void 0 : _c.name,
            rawLrcTxt: (_d = it.lyrics) === null || _d === void 0 ? void 0 : _d.join("\n"),
        });
    })) !== null && _b !== void 0 ? _b : [];
    返回 {
        isEnd: res.result.songCount <= page * pageSize,
        数据：歌词，
    };
}
异步函数 getArtistWorks(artistItem, page, type) {
    const data = {
        csrf_token: "",
    };
    const pae = getParamsAndEnc(JSON.stringify(data));
    const paeData = qs.stringify(pae);
    const headers = {
        权威来源：“music.163.com”，
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
        "content-type": "application/x-www-form-urlencoded",
        接受： ”*/*”，
        来源：“https://music.163.com”
        "sec-fetch-site": "同源",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "空",
        引用者：“https://music.163.com/search/”，
        "accept-language": "zh-CN,zh;q=0.9",
    };
    如果（类型 === "音乐") {
        const res = (await (0, axios_1.default)({
            方法："post",
            url: `https://music.163.com/weapi/v1/artist/${artistItem.id}?csrf_token=`,
            标题，
            数据：paeData，
        }））。数据;
        返回 {
            isEnd: true,
            数据：res.hotSongs.map(formatMusicItem)
        };
    }
    否则如果（类型 === "专辑") {
        const res = (await (0, axios_1.default)({
            方法："post",
            url: `https://music.163.com/weapi/artist/albums/${artistItem.id}?csrf_token=`,
            标题，
            数据：paeData，
        }））。数据;
        返回 {
            isEnd: true,
            数据：res.hotAlbums.map(formatAlbumItem),
        };
    }
}
异步函数 getTopListDetail(topListItem) {
    const musicList = await getSheetMusicById(topListItem.id);
    return Object.assign(Object.assign({}, topListItem), { musicList });
}
async function getLyric(musicItem) {
    const headers = {
        推荐人：“https://y.music.163.com/”，
        来源：“https://y.music.163.com/”
        权威来源：“music.163.com”，
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
    };
    const data = { id: musicItem.id, lv: -1, tv: -1, csrf_token: "" };
    const pae = getParamsAndEnc(JSON.stringify(data));
    const paeData = qs.stringify(pae);
    const result = (await (0, axios_1.default)({
        方法："post",
        url: `https://interface.music.163.com/weapi/song/lyric?csrf_token=`,
        标题，
        数据：paeData，
    }））。数据;
    返回 {
        rawLrc：result.lrc.lyric，
    };
}
异步函数 getMusicInfo(musicItem) {
    const headers = {
        推荐人：“https://y.music.163.com/”，
        来源：“https://y.music.163.com/”
        权威来源：“music.163.com”，
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
    };
    const data = { id: musicItem.id, ids: `[${musicItem.id}]` };
    const result = (await axios_1.get('http://music.163.com/api/song/detail',
        {
            标题，
            参数：数据
        }））。数据;
    返回 {
        封面图：result.songs[0].album.picUrl，
    };
}
异步函数 getAlbumInfo(albumItem) {
    const headers = {
        推荐人：“https://y.music.163.com/”，
        来源：“https://y.music.163.com/”
        权威来源：“music.163.com”，
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
    };
    const data = {
        资源类型：3，
        resourceId: albumItem.id,
        限量：15
        csrf_token: "",
    };
    const pae = getParamsAndEnc(JSON.stringify(data));
    const paeData = qs.stringify(pae);
    const res = (await (0, axios_1.default)({
        方法："post",
        url: `https://interface.music.163.com/weapi/v1/album/${albumItem.id}?csrf_token=`,
        标题，
        数据：paeData，
    }））。数据;
    返回 {
        albumItem: { description: res.album.description },
        音乐列表：（res.songs || []）
            .map(formatMusicItem),
    };
}
异步函数 getValidMusicItems(trackIds) {
    const headers = {
        推荐人：“https://y.music.163.com/”，
        来源：“https://y.music.163.com/”
        权威来源：“music.163.com”，
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
    };
    尝试 {
        // 获取歌曲详情数据
        const res = (await axios_1.default.get(`https://music.163.com/api/song/detail/?ids=[${trackIds.join(",")}]`, { headers })).data;
        // 直接格式化歌曲项，不检查URL
        const validMusicItems = res.songs.map(formatMusicItem);
        返回有效的音乐项；
    }
    捕获（e）{
        console.error(e);
        返回 [];
    }
}

异步函数 getSheetMusicById(id) {
    const headers = {
        推荐人：“https://y.music.163.com/”，
        来源：“https://y.music.163.com/”
        权威来源：“music.163.com”，
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
    };
    const sheetDetail = (await axios_1.default.get(`https://music.163.com/api/v3/playlist/detail?id=${id}&n=5000`, {
        标题，
    }））。数据;
    const trackIds = sheetDetail.playlist.trackIds.map((_) => _.id);
    let result = [];
    let idx = 0;
    while (idx * 200 < trackIds.length) {
        const res = await getValidMusicItems(trackIds.slice(idx * 200, (idx + 1) * 200));
        result = result.concat(res);
        ++idx;
    }
    返回结果；
}
异步函数 importMusicSheet(urlLike) {
    const matchResult = urlLike.match(/(?:https:\/\/y\.music\.163.com\/m\/playlist\?id=([0-9]+))|(?:https?:\/\/music\.163\.com\/playlist\/([0-9]+)\/.*)|(?:https?:\/\/music.163.com(?:\/#)?\/playlist\?id=(\d+))|(?:^\s*(\d+)\s*$)/);
    const id = matchResult[1] || matchResult[2] || matchResult[3] || matchResult[4];
    返回 getSheetMusicById(id);
}
异步函数 getTopLists() {
    const res = await axios_1.default.get("https://music.163.com/discover/toplist", {
        标题：{
            引用者：“https://music.163.com/”，
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.54",
        },
    });
    const $ = Cheerio.load(res.data);
    const children = $(".n-minelst").children();
    const groups = [];
    let currentGroup = {};
    对于（设 c 个孩子）{
        如果 (c.tagName == "h2") {
            如果 (currentGroup.title) {
                groups.push(currentGroup);
            }
            currentGroup = {};
            currentGroup.title = $(c).text();
            currentGroup.data = [];
        }
        else if (c.tagName === "ul") {
            let sections = $(c).children();
            currentGroup.data = sections
                .map((index, element) => {
                    const ele = $(element);
                    const id = ele.attr("data-res-id");
                    const coverImg = ele.find("img").attr("src").replace(/(\.jpg\?).*/, ".jpg?param=800y800");
                    const title = ele.find("p.name").text();
                    const description = ele.find("ps-fc4").text();
                    返回 {
                        ID，
                        coverImg，
                        标题，
                        描述，
                    };
                })
                .toArray();
        }
    }
    如果 (currentGroup.title) {
        groups.push(currentGroup);
    }
    返回组；
}
const qualityLevels = {
    低：“128k”，
    标准：“320k”，
    高：“320k”，
    超级：“320k”，
};
async function getMediaSource(musicItem, quality) {
    const res = (
        await axios_1.default.get(`https://lxmusicapi.onrender.com/url/wy/${musicItem.id}/${qualityLevels[quality]}`, {
            标题：{
                "X-Request-Key": "share-v3"
            },
        })
    ）。数据;
    返回 {
        url: res.url，
    };
}
const headers = {
    权威来源：“music.163.com”，
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
    "content-type": "application/x-www-form-urlencoded",
    接受： ”*/*”，
    来源：“https://music.163.com”
    "sec-fetch-site": "同源",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "空",
    引用者：“https://music.163.com/”，
    "accept-language": "zh-CN,zh;q=0.9",
};
异步函数 getRecommendSheetTags() {
    const data = {
        csrf_token: "",
    };
    const pae = getParamsAndEnc(JSON.stringify(data));
    const paeData = qs.stringify(pae);
    const res = (await (0, axios_1.default)({
        方法："post",
        url: "https://music.163.com/weapi/playlist/catalogue",
        标题，
        数据：paeData，
    }））。数据;
    const cats = res.categories;
    const map = {};
    const catData = Object.entries(cats).map((_) => {
        const tagData = {
            标题：_[1]，
            数据： []，
        };
        map[_[0]] = tagData;
        返回 tagData；
    });
    const pinned = [];
    res.sub.forEach((tag) => {
        const _tag = {
            id：标签名称，
            标题：标签名称，
        };
        如果 (tag.hot) {
            pinned.push(_tag);
        }
        map[tag.category].data.push(_tag);
    });
    返回 {
        被钉住，
        数据：catData，
    };
}
async function getRecommendSheetsByTag(tag, page) {
    const pageSize = 20;
    const data = {
        猫: tag.id || “全部”,
        订单：“热的”，
        限制：页面大小，
        偏移量：（页码 - 1）* 页面大小，
        总计：是，
        csrf_token: "",
    };
    const pae = getParamsAndEnc(JSON.stringify(data));
    const paeData = qs.stringify(pae);
    const res = (await (0, axios_1.default)({
        方法："post",
        url: "https://music.163.com/weapi/playlist/list",
        标题，
        数据：paeData，
    }））。数据;
    const playLists = res.playlists.map((_) => ({
        id: _.id,
        艺术家：_.creator.nickname，
        标题：_.name，
        封面图片：_.coverImgUrl，
        播放次数：_.playCount，
        createUserId: _.userId,
        创建时间：_.createTime，
        描述：_.描述，
    }));
    返回 {
        isEnd: !(res.more === true),
        数据：播放列表，
    };
}
异步函数 getMusicSheetInfo(sheet, page) {
    let trackIds = sheet._trackIds;
    如果 (!trackIds) {
        const id = sheet.id;
        const headers = {
            推荐人：“https://y.music.163.com/”，
            来源：“https://y.music.163.com/”
            权威来源：“music.163.com”，
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
        };
        const sheetDetail = (await axios_1.default.get(`https://music.163.com/api/v3/playlist/detail?id=${id}&n=5000`, {
            标题，
        }））。数据;
        trackIds = sheetDetail.playlist.trackIds.map((_) => _.id);
    }
    const pageSize = 40;
    const currentPageIds = trackIds.slice((page - 1) * pageSize, page * pageSize);
    const res = await getValidMusicItems(currentPageIds);
    let extra = {};
    如果（页码 <= 1）{
        额外 = {
            _trackIds：trackIds，
        };
    }
    return Object.assign({ isEnd: trackIds.length <= page * pageSize, musicList: res }, extra);
}
module.exports = {
    平台：“小芸音乐”，
    作者：'Huibq'
    版本：“0.3.0”，
    appVersion: ">0.1.0-alpha.0",
    srcUrl: "https://fastly.jsdelivr.net/gh/Huibq/keep-alive/Music_Free/xiaoyun.js",
    cacheControl: "no-store",
    提示：{
        importMusicSheet: [
            "网易云：APP点击分享，然后复制链接",
            “默认歌单无法导入，先新建一个空白歌单复制过去再导入新歌单即可”
        ],
    },
    supportedSearchType: ["音乐", "专辑", "乐谱", "艺术家", "歌词"],
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
    获取媒体源，
    getMusicInfo，
    获取专辑信息，
    getLyric，
    获取艺术家作品，
    importMusicSheet,
    获取热门列表，
    获取热门列表详情，
    获取推荐表标签，
    获取乐谱信息，
    获取按标签推荐表，
};
