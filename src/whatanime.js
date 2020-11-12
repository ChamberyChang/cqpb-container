import CQ from './CQcode';
import logError from './logError';
const Axios = require('./axiosProxy');

let hostsI = 0;

const waURL = 'https://trace.moe';

/**
 * whatanime搜索
 *
 * @param {string} imgURL
 * @param {boolean} [debug=false]
 * @returns
 */
async function doSearch(imgURL, debug = false) {
  const hosts = global.config.whatanimeHost;
  const hostIndex = hostsI++ % hosts.length; // 决定当前使用的host
  let msg = global.config.bot.replys.failed; // 返回信息
  let success = false;

  function appendMsg(str, needEsc = true) {
    if (typeof str === 'string' && str.length > 0) msg += '\n' + (needEsc ? CQ.escape(str) : str);
  }

  await getSearchResult(imgURL, hosts[hostIndex])
    .then(async ret => {
      if (debug) {
        console.log(`${global.getTime()} whatanime[${hostIndex}]`);
        console.log(JSON.stringify(ret.data));
      }

      const retcode = ret.code;
      if (retcode === 413) {
        msg = 'WhatAnime：ちょっと待って！何これ？';
        return;
      } else if (retcode !== 200) {
        msg = ret.data;
        return;
      }

      ret = ret.data;

      const limit = ret.limit; // 剩余搜索次数
      const limit_ttl = ret.limit_ttl; // 次数重置时间
      if (ret.docs.length === 0) {
        console.log(`${global.getTime()} [out] whatanime[${hostIndex}]:${retcode}\n${JSON.stringify(ret)}`);
        msg = `WhatAnime：お前やろが先に${limit_ttl}秒をつまみ食いしたのは！俺にもさしてや！`;
        return;
      }

      // 提取信息
      const doc = ret.docs[0]; // 相似度最高的结果
      const similarity = (doc.similarity * 100).toFixed(2); // 相似度
      const jpName = doc.title_native || ''; // 日文名
      const romaName = doc.title_romaji || ''; // 罗马音
      const cnName = doc.title_chinese || ''; // 中文名
      let posSec = Math.floor(doc.at); // 位置：秒
      const posMin = Math.floor(posSec / 60); // 位置：分
      posSec %= 60;
      const isR18 = doc.is_adult; // 是否R18
      const anilistID = doc.anilist_id; // 动漫ID
      const episode = doc.episode || '-'; // 集数
      let type, start, end, img, synonyms;

      await getAnimeInfo(anilistID)
        .then(info => {
          type = info.type + ' - ' + info.format; // 类型
          const sd = info.startDate;
          start = sd.year + '-' + sd.month + '-' + sd.day; // 开始日期
          const ed = info.endDate;
          end = ed.year > 0 ? ed.year + '-' + ed.month + '-' + ed.day : '';
          img = CQ.img(info.coverImage.large); // 番剧封面图
          synonyms = info.synonyms_chinese || []; // 别名

          // 构造返回信息
          msg = `WhatAnime (${similarity}%)\n第${episode}話の${posMin < 10 ? '0' : ''}${posMin}:${
            posSec < 10 ? '0' : ''
          }${posSec}`;
          if (limit <= 3) {
            appendMsg(`WhatAnime-${hostIndex}：${limit_ttl}秒ないやん…食べたんもしかして？`);
          }
          if (!(global.config.bot.hideImg || (global.config.bot.hideImgWhenWhatanimeR18 && isR18))) {
            appendMsg(img, false);
          }
          appendMsg(romaName);
          if (jpName !== romaName) appendMsg(jpName);
          if (cnName !== romaName && cnName !== jpName) appendMsg(cnName);
          if (synonyms.length > 0 && !(synonyms.length >= 2 && synonyms[0] === '[' && synonyms[1] === ']')) {
            let syn = `又名：“${synonyms[0]}”`;
            for (let i = 1; i < synonyms.length; i++) syn += `、“${synonyms[i]}”`;
            appendMsg(syn);
          }
          appendMsg(`タイプ：${type}`);
          appendMsg(`上映：${start}`);
          if (end.length > 0) appendMsg(`完結：${end}`);
          if (isR18) appendMsg('R18注意');

          success = true;
        })
        .catch(e => {
          appendMsg('ううん全然全然こんな…');
          logError(`${global.getTime()} [error] whatanime getAnimeInfo`);
          logError(e);
        });
    })
    .catch(e => {
      logError(`${global.getTime()} [error] whatanime[${hostIndex}]`);
      logError(e);
    });

  return {
    success,
    msg,
  };
}

/**
 * 取得搜番结果
 *
 * @param {string} imgURL 图片地址
 * @param {string} host 自定义whatanime的host
 * @returns Prased JSON
 */
async function getSearchResult(imgURL, host) {
  const token = global.config.whatanimeToken.trim();
  if (host === 'trace.moe') host = `https://${host}`;
  else if (!/^https?:\/\//.test(host)) host = `http://${host}`;
  const json = {
    code: 200,
    data: {},
  };
  // 取得whatanime返回json
  await Axios.get(imgURL, {
    responseType: 'arraybuffer', // 为了转成 base64
  })
    .then(({ data: image }) =>
      Axios.post(`${host}/api/search` + (token ? `?token=${token}` : ''), {
        image: Buffer.from(image, 'binary').toString('base64'),
      })
    )
    .then(ret => {
      json.data = ret.data;
      json.code = ret.status;
    })
    .catch(e => {
      if (e.response) {
        json.code = e.response.status;
        json.data = e.response.data;
        logError(`${global.getTime()} [error] whatanime`);
        logError(e);
      } else throw e;
    });
  return json;
}

/**
 * 取得番剧信息
 *
 * @param {number} anilistID
 * @returns Prased JSON
 */
function getAnimeInfo(anilistID) {
  return Axios.get(`${waURL}/info?anilist_id=${anilistID}`).then(({ data }) => data[0]);
}

export default doSearch;
