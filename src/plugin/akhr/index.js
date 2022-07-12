import Fse from 'fs-extra';
import 'lodash.combinations';
import _ from 'lodash';
import Path from 'path';
import draw from './akhr.draw';
import { get } from 'axios';
import logError from '../../logError';
import emitter from '../../emitter';

const GJZS = '高级资深干员';

const AKDATA_PATH = Path.resolve(__dirname, '../../../data/akhr.json');
let AKDATA = null;
let updateInterval = null;

emitter.onConfigReady(init);

emitter.onConfigReload(() => {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  init();
});

function isDataReady() {
  return !!AKDATA;
}

function getChar(i) {
  return AKDATA.characters[i];
}

function getTagCharsetExcludeRegExp() {
  const charset = _.uniq(Object.keys(AKDATA.data).flatMap(tag => tag.split(''))).join('');
  return new RegExp(`[^${charset}]`, 'g');
}

async function pullData() {
  const [charData, charNameData, tagData] = _.map(
    await Promise.all([
      get('https://fastly.jsdelivr.net/gh/arkntools/arknights-toolbox@master/src/data/character.json'),
      get('https://fastly.jsdelivr.net/gh/arkntools/arknights-toolbox@master/src/locales/cn/character.json'),
      get('https://fastly.jsdelivr.net/gh/arkntools/arknights-toolbox@master/src/locales/cn/tag.json'),
    ]),
    'data'
  );
  let charTagSum = 0;
  const result = _.transform(
    Object.entries(charData)
      .filter(([, { recruitment }]) => recruitment.cn)
      .sort(([, { star: a }], [, { star: b }]) => b - a),
    ({ characters, data }, [id, { star, position, profession, tags }], i) => {
      characters.push({ n: charNameData[id], r: star });
      const tagNames = [position, profession, ...tags].map(tid => tagData[tid]);
      switch (star) {
        case 5:
          tagNames.push(tagData[14]);
          break;
        case 6:
          tagNames.push(tagData[11]);
          break;
      }
      tagNames.forEach(tag => {
        if (!data[tag]) data[tag] = [];
        data[tag].push(i);
      });
      charTagSum += tagNames.length;
    },
    { characters: [], data: {} }
  );
  result.avgCharTag = charTagSum / _.size(result.data);
  return result;
}

async function updateData() {
  try {
    AKDATA = await pullData();
    Fse.writeJsonSync(AKDATA_PATH, AKDATA);
  } catch (e) {
    console.error(`${global.getTime()} 方舟公招数据更新`);
    logError(e);
    return false;
  }
  return true;
}

function setUpdateDataInterval() {
  const intervalHours = global.config.bot.akhr.updateInterval;
  if (intervalHours >= 1) {
    updateInterval = setInterval(updateData, intervalHours * 3600000);
  }
}

async function init() {
  if (!global.config.bot.akhr.enable) return;
  try {
    if (!Fse.existsSync(AKDATA_PATH)) await updateData();
    else AKDATA = Fse.readJsonSync(AKDATA_PATH);
    setUpdateDataInterval();
  } catch (e) {
    console.error(`${global.getTime()} akhr 初始化`);
    console.error(e);
  }
}

function getCombinations(tags) {
  const combs = [1, 2, 3].flatMap(v => _.combinations(tags, v));
  const result = [];
  for (const comb of combs) {
    const need = [];
    for (const tag of comb) need.push(AKDATA.data[tag]);
    const chars = _.intersection(...need);
    if (!comb.includes(GJZS)) _.remove(chars, i => getChar(i).r === 6);
    if (chars.length === 0) continue;

    let scoreChars = _.filter(chars, i => getChar(i).r >= 3);
    if (scoreChars.length === 0) scoreChars = chars;
    const score =
      _.sumBy(scoreChars, i => getChar(i).r) / scoreChars.length -
      comb.length / 10 -
      scoreChars.length / AKDATA.avgCharTag;

    const minI = _.minBy(scoreChars, i => getChar(i).r);

    result.push({
      comb,
      chars,
      min: AKDATA.characters[minI].r,
      score,
    });
  }
  result.sort((a, b) => (a.min === b.min ? b.score - a.score : b.min - a.min));
  return result;
}

function getResultText(words) {
  const tags = _.uniq(_.filter(words, w => w in AKDATA.data).slice(0, 6));
  const combs = getCombinations(tags);
  let text = `识别词条：${tags.join('、')}`;
  for (const r of combs) {
    text += `\n\n【${r.comb.join(' ')}】`;
    const tmp = [];
    for (const i of r.chars) {
      const char = getChar(i);
      tmp.push(`(${char.r})${char.n}`);
    }
    text += tmp.join(' ');
  }
  return text;
}

const ERROR_MAP = {
  千员: '干员',
  滅速: '減速',
  枳械: '机械',
  冫口了: '治疗',
  先鋒: '先锋',
  前衛: '近卫',
  狙撃: '狙击',
  医療: '医疗',
  補助: '辅助',
  術師: '术师',
  特殊: '特种',
  タイプ: '干员',
  近距離: '近战位',
  遠距離: '远程位',
  火力: '输出',
  防御: '防护',
  COST回復: '费用回复',
  治療: '治疗',
  弱化: '削弱',
  強制移動: '位移',
  牽制: '控场',
  爆発力: '爆发',
  爆凳力:'爆发',
  召喚: '召唤',
  高速再配置: '快速复活',
  初期: '新手',
  ロボット: '支援机械',
  エリート: '资深干员',
  上級: '高级',
};

function getResultImg(words) {
  const excludeRegExp = getTagCharsetExcludeRegExp();
  let tags = _.transform(
    words,
    (a, w) => {
      w = _.reduce(ERROR_MAP, (cur, correct, error) => cur.replace(error, correct), w);
      w = w.replace(excludeRegExp, '');
      //  支持日服词条  
      w = w.replace(/([夕タ][亻イ][ブプ]?)/g, '干员');
      w = w.replace(/範囲(攻擊)?/g, '群攻');
      //  for baidu OCR
      if (w.includes(GJZS) && w.length > 6) {
        a.push(GJZS);
        const ws = w.split(GJZS);
        _.each(ws, v => {
          if (v.length > 0 && v in AKDATA.data) a.push(v);
        });
      }

      if (w in AKDATA.data) a.push(w);
    },
    []
  );
  tags = _.uniq(tags).slice(0, 5);
  const combs = getCombinations(tags);
  return draw(AKDATA, combs, tags);
}

export default {
  init,
  isDataReady,
  updateData,
  getResultText,
  getResultImg,
};
