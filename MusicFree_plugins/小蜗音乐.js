“使用严格模式”；
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const he = require("he");
const pageSize = 30;
function artworkShort2Long(albumpicShort) {
    var _a;
    const firstSlashOfAlbum = (_a = albumpicShort === null || albumpicShort === void 0 ? void 0 : albumpicShort.indexOf("/")) !== null && _a !== void 0 ? _a : -1;
    返回 firstSlashOfAlbum !== -1
        ? `https://img4.kuwo.cn/star/albumcover/1080${albumpicShort.slice(firstSlashOfAlbum)}`
        ： 不明确的;
}
function formatMusicItem(_) {
    返回 {
        id: _.MUSICRID.replace("MUSIC_", ""),
        artwork: artworkShort2Long(_.web_albumpic_short),
        标题: he.decode(_.NAME || ""),
        艺术家: he.decode(_.ARTIST || ""),
        专辑：he.decode(_.ALBUM || ""),
        albumId: _.ALBUMID,
        artistId: _.ARTISTID,
        格式：_.FORMATS，
    };
}
function formatAlbumItem(_) {
    var _a;
    返回 {
        id: _.albumid,
        艺术家: he.decode(_.artist || ""),
        标题: he.decode(_.name || ""),
        artwork: (_a = _.img) !== null && _a !== void 0 ? _a : artworkShort2Long(_.pic),
        描述：he.decode(_.info || ""),
        日期：_.pub，
        artistId: _.artistid,
    };
}
function formatArtistItem(_) {
    返回 {
        id: _.ARTISTID,
        头像：_.hts_PICPATH，
        名称: he.decode(_.ARTIST || ""),
        artistId: _.ARTISTID,
        描述：he.decode(_.desc || ""),
        worksNum: _.SONGNUM
    };
}
function formatMusicSheet(_) {
    返回 {
        id: _.playlistid,
        标题: he.decode(_.name || ""),
        艺术家: he.decode(_.nickname || ""),
        艺术作品：_.pic，
        播放次数：_.playcnt，
        描述：he.decode(_.intro || ""),
        worksNum: _.songnum,
    };
}
异步函数 searchMusic(query, page) {
    const res = (await (0, axios_1.default)({
        方法：“get”，
        网址：`http://search.kuwo.cn/rs`
        参数：{
            客户端：“kt”，
            所有：查询，
            pn：第 1 页
            rn：页面大小，
            uid：2574109560
            版本：“kwplayer_ar_8.5.4.2”，
            vipver：1，
            ft:“音乐”，
            集群：0，
            战略：2012年
            编码："utf8",
            rformat: "json",
            vermerge: 1,
            mobi：1，
        },
    }））。数据;
    const songs = res.abslist.map(formatMusicItem);
    返回 {
        isEnd: (+res.PN + 1) * +res.RN >= +res.TOTAL,
        数据：歌曲，
    };
}
异步函数 searchAlbum(query, page) {
    const res = (await (0, axios_1.default)({
        方法：“get”，
        网址：`http://search.kuwo.cn/rs`
        参数：{
            所有：查询，
            ft:“专辑”，
            项集：“web_2013”​​，
            客户端：“kt”，
            pn：第 1 页
            rn：页面大小，
            rformat: "json",
            编码："utf8",
            pcjson：1，
        },
    }））。数据;
    const albums = res.albumlist.map(formatAlbumItem);
    返回 {
        isEnd: (+res.PN + 1) * +res.RN >= +res.TOTAL,
        数据：专辑，
    };
}
异步函数 searchArtist(query, page) {
    const res = (await (0, axios_1.default)({
        方法：“get”，
        网址：`http://search.kuwo.cn/rs`
        参数：{
            所有：查询，
            ft：“艺术家”，
            项集：“web_2013”​​，
            客户端：“kt”，
            pn：第 1 页
            rn：页面大小，
            rformat: "json",
            编码："utf8",
            pcjson：1，
        },
    }））。数据;
    const artists = res.abslist.map(formatArtistItem);
    返回 {
        isEnd: (+res.PN + 1) * +res.RN >= +res.TOTAL,
        数据：艺术家，
    };
}
异步函数 searchMusicSheet(query, page) {
    const res = (await (0, axios_1.default)({
        方法：“get”，
        网址：`http://search.kuwo.cn/rs`
        参数：{
            所有：查询，
            ft: "播放列表",
            项集：“web_2013”​​，
            客户端：“kt”，
            pn：第 1 页
            rn：页面大小，
            rformat: "json",
            编码："utf8",
            pcjson：1，
        },
    }））。数据;
    const musicSheets = res.abslist.map(formatMusicSheet);
    返回 {
        isEnd: (+res.PN + 1) * +res.RN >= +res.TOTAL,
        数据：乐谱，
    };
}
异步函数 getArtistMusicWorks(artistItem, page) {
    const res = (await (0, axios_1.default)({
        方法：“get”，
        网址：`http://search.kuwo.cn/rs`
        参数：{
            pn：第 1 页
            rn：页面大小，
            artistid: artistItem.id,
            类型: "artist2music",
            排序依据：0，
            alflac：1，
            show_copyright_off: 1,
            pcmp4：1，
            编码："utf8",
            plat: "pc",
            主机：“search.kuwo.cn”，
            vipver: "MUSIC_9.1.1.2_BCS2",
            devid: "38668888",
            newver：1，
            pcjson：1，
        },
    }））。数据;
    const songs = res.musiclist.map((_) => {
        返回 {
            id: _.musicrid,
            artwork: artworkShort2Long(_.web_albumpic_short),
            标题: he.decode(_.name || ""),
            艺术家: he.decode(_.artist || ""),
            专辑：he.decode(_.album || ""),
            albumId: _.albumid,
            artistId: _.artistid,
            格式：_.formats，
        };
    });
    返回 {
        isEnd: (+res.pn + 1) * pageSize >= +res.total,
        数据：歌曲，
    };
}
异步函数 getArtistAlbumWorks(artistItem, page) {
    const res = (await (0, axios_1.default)({
        方法：“get”，
        网址：`http://search.kuwo.cn/rs`
        参数：{
            pn：第 1 页
            rn：页面大小，
            artistid: artistItem.id,
            stype: "专辑列表",
            排序依据：1，
            alflac：1，
            show_copyright_off: 1,
            pcmp4：1，
            编码："utf8",
            plat: "pc",
            主机：“search.kuwo.cn”，
            vipver: "MUSIC_9.1.1.2_BCS2",
            devid: "38668888",
            newver：1，
            pcjson：1，
        },
    }））。数据;
    const albums = res.albumlist.map(formatAlbumItem);
    返回 {
        isEnd: (+res.pn + 1) * pageSize >= +res.total,
        数据：专辑，
    };
}
异步函数 getArtistWorks(artistItem, page, type) {
    如果（类型 === "音乐") {
        返回 getArtistMusicWorks(artistItem, 页);
    }
    否则如果（类型 === "专辑") {
        返回 getArtistAlbumWorks(artistItem, 页);
    }
}
async function getLyric(musicItem) {
    const res = (await axios_1.default.get("http://m.kuwo.cn/newh5/singles/songinfoandlrc", {
        参数：{
            musicId: musicItem.id,
            http状态：1，
        },
    }））。数据;
    const list = res.data.lrclist;
    返回 {
        rawLrc: list.map((_) => `[${_.time}]${_.lineLyric}`).join("\n"),
    };
}
异步函数 getAlbumInfo(albumItem) {
    const res = (await (0, axios_1.default)({
        方法：“get”，
        网址：`http://search.kuwo.cn/rs`
        参数：{
            pn：0，
            rn：100，
            albumid: albumItem.id,
            stype: "albuminfo",
            排序依据：0，
            alflac：1，
            show_copyright_off: 1,
            pcmp4：1，
            编码："utf8",
            plat: "pc",
            主机：“search.kuwo.cn”，
            vipver: "MUSIC_9.1.1.2_BCS2",
            devid: "38668888",
            newver：1，
            pcjson：1，
        },
    }））。数据;
    const songs = res.musiclist.map((_) => {
        var _a;
        返回 {
            id: _.id,
            artwork: (_a = albumItem.artwork) !== null && _a !== void 0 ? _a : res.img,
            标题: he.decode(_.name || ""),
            艺术家: he.decode(_.artist || ""),
            专辑：he.decode(_.album || ""),
            albumId: albumItem.id,
            artistId: _.artistid,
            格式：_.formats，
        };
    });
    返回 {
        音乐列表：歌曲，
    };
}
异步函数 getTopLists() {
    const result = (await axios_1.default.get("http://wapi.kuwo.cn/api/pc/bang/list")).data
        。孩子;
    返回 result.map((e) => ({
        标题：e.disname，
        数据: e.child.map((_) => {
            var _a, _b;
            返回 （{
                id: _.sourceid,
                coverImg: (_b = (_a = _.pic5) !== null && _a !== void 0 ? _a : _.pic2) !== null && _b !== void 0 ? _b : _.pic,
                标题：_.name，
                描述：_.intro，
            });
        }),
    }));
}
异步函数 getTopListDetail(topListItem) {
    const res = await axios_1.default.get(`http://kbangserver.kuwo.cn/ksong.s`, {
        参数：{
            来自：“pc”，
            fmt: "json",
            pn：0，
            rn：80，
            类型："bang",
            数据：“内容”，
            id：topListItem.id，
            show_copyright_off: 0,
            pcmp4：1，
            isbang: 1,
            用户ID：0，
            http状态：1，
        },
    });
    返回 Object.assign(Object.assign({}, topListItem), {
        musicList: res.data.musiclist.map((_) => {
            返回 {
                id: _.id,
                标题: he.decode(_.name || ""),
                艺术家: he.decode(_.artist || ""),
                专辑：he.decode(_.album || ""),
                albumId: _.albumid,
                artistId: _.artistid,
                格式：_.formats，
            };
        })
    });
}
异步函数 getMusicSheetResponseById(id, page, pagesize = 50) {
    返回 (await axios_1.default.get(`http://nplserver.kuwo.cn/pl.svc`, {
        参数：{
            操作：“getlistinfo”，
            pid：id，
            pn：第 1 页
            rn：页面大小，
            编码："utf8",
            键集：“pl2012”，
            vipver: "MUSIC_9.1.1.2_BCS2",
            newver：1，
        },
    }））。数据;
}
异步函数 importMusicSheet(urlLike) {
    var _a, _b;
    令 id；
    如果 (!id) {
        id = (_a = urlLike.match(/https?:\/\/www\/kuwo\.cn\/playlist_detail\/(\d+)/)) === null || _a === void 0 ? void 0 : _a[1];
    }
    如果 (!id) {
        id = (_b = urlLike.match(/https?:\/\/m\.kuwo\.cn\/h5app\/playlist\/(\d+)/)) === null || _b === void 0 ? void 0 : _b[1];
    }
    如果 (!id) {
        id = urlLike.match(/^\s*(\d+)\s*$/);
    }
    如果 (!id) {
        返回;
    }
    令页码 = 1；
    let totalPage = 30;
    let musicList = [];
    while (page < totalPage) {
        尝试 {
            const data = await getMusicSheetResponseById(id, page, 80);
            totalPage = Math.ceil(data.total / 80);
            如果 (isNaN(totalPage)) {
                总页数 = 1；
            }
            musicList = musicList.concat(data.musicList.map((_) => ({
                id: _.id,
                标题: he.decode(_.name || ""),
                艺术家: he.decode(_.artist || ""),
                专辑：he.decode(_.album || ""),
                albumId: _.albumid,
                artistId: _.artistid,
                格式：_.formats，
            })));
        }
        catch (_c) { }
        await new Promise((resolve) => {
            setTimeout(() => {
                解决（）;
            }, 200 + Math.random() * 100);
        });
        ++页；
    }
    返回音乐列表；
}
异步函数 getRecommendSheetTags() {
    const res = (await axios_1.default.get(`http://wapi.kuwo.cn/api/pc/classify/playlist/getTagList?cmd=rcm_keyword_playlist&user=0&prod=kwplayer_pc_9.0.5.0&vipver=9.0.5.0&source=kwplayer_pc_9.0.5.0&loginUid=0&loginSid=0&appUid=76039576`)).data.data;
    const data = res
        .map((group) => ({
            标题：group.name，
            数据：group.data.map((_) => ({
                id: _.id,
                摘要：_.digest，
                标题：_.name，
            })),
        }))
        .filter((item) => item.data.length);
    const pinned = [
        {
            id: "1848",
            标题：“翻唱”，
            摘要：“10000”，
        },
        {
            id: "621",
            标题：“网络”，
            摘要：“10000”，
        },
        {
            标题：“伤感”，
            摘要：“10000”，
            id: "146",
        },
        {
            标题：“欧美”，
            摘要：“10000”，
            id: "35",
        },
    ];
    返回 {
        数据，
        被钉住，
    };
}
async function getRecommendSheetsByTag(tag, page) {
    const pageSize = 20;
    令 res；
    如果 (tag.id) {
        如果 (tag.digest === "10000") {
            res = (await axios_1.default.get(`http://wapi.kuwo.cn/api/pc/classify/playlist/getTagPlayList?loginUid=0&loginSid=0&appUid=76039576&pn=${page - 1}&id=${tag.id}&rn=${pageSize}`)).data.data;
        }
        别的 {
            let digest43Result = (await axios_1.default.get(`http://mobileinterfaces.kuwo.cn/er.s?type=get_pc_qz_data&f=web&id=${tag.id}&prod=pc`)).data;
            res = {
                总计：0
                data: digest43Result.reduce((prev, curr) => [...prev, ...curr.list]),
            };
        }
    }
    别的 {
        res = (await axios_1.default.get(`https://wapi.kuwo.cn/api/pc/classify/playlist/getRcmPlayList?loginUid=0&loginSid=0&appUid=76039576&&pn=${page - 1}&rn=${pageSize}&order=hot`)).data.data;
    }
    const isEnd = page * pageSize >= res.total;
    返回 {
        isEnd，
        数据：res.data.map((_) => ({
            标题：_.name，
            艺术家：_.uname，
            id: _.id,
            图片：_.img，
            播放次数：_.listencnt，
            createUserId: _.uid,
        })),
    };
}
异步函数 getMusicSheetInfo(sheet, page) {
    const res = await getMusicSheetResponseById(sheet.id, page, pageSize);
    返回 {
        isEnd：页面 * 页面大小 >= res.total，
        musicList: res.musiclist.map((_) => ({
            id: _.id,
            标题: he.decode(_.name || ""),
            艺术家: he.decode(_.artist || ""),
            专辑：he.decode(_.album || ""),
            albumId: _.albumid,
            artistId: _.artistid,
            格式：_.formats，
        })),
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
        await axios_1.default.get(`https://lxmusicapi.onrender.com/url/kw/${musicItem.id}/${qualityLevels[quality]}`, {
            标题：{
                "X-Request-Key": "share-v3"
            },
        })
    ）。数据;
    返回 {
        url: res.url，
    };
}
异步函数 getMusicInfo(musicItem) {
    const res = (await axios_1.default.get("http://m.kuwo.cn/newh5/singles/songinfoandlrc", {
        参数：{
            musicId: musicItem.id,
            http状态：1，
        },
    }））。数据;
    const originalUrl = res.data.songinfo.pic;
    let picUrl;
    如果 (originalUrl.includes("starheads/")) {
        picUrl = originalUrl.replace(/starheads\/\d+/, "starheads/800");
    }
    否则如果 (originalUrl.includes("albumcover/")) {
        picUrl = originalUrl.replace(/albumcover\/\d+/, "albumcover/800");
    }
    返回 {
        作品：picUrl，
    };
}
module.exports = {
    平台：“小蜗音乐”，
    作者：'Huibq'
    版本：“0.3.0”，
    appVersion: ">0.1.0-alpha.0",
    srcUrl: "https://fastly.jsdelivr.net/gh/Huibq/keep-alive/Music_Free/xiaowo.js",
    cacheControl: "no-cache",
    提示：{
        importMusicSheet: [
            "酷我APP：自建歌单-分享-复制试听链接，直接粘贴即可",
            "H5：复制URL并粘贴，或者直接输入纯数字歌单ID即可",
            "导入时间和歌曲单大小有关，请耐心等待",
        ],
    },
    supportedSearchType: ["音乐", "专辑", "乐谱", "艺术家"],
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
    },
    获取媒体源，
    getMusicInfo，
    获取专辑信息，
    getLyric，
    获取艺术家作品，
    获取热门列表，
    获取热门列表详情，
    importMusicSheet,
    获取推荐表标签，
    获取按标签推荐表，
    获取乐谱信息，
};
