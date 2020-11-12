import Fse from 'fs-extra';
import 'lodash.combinations';
import _ from 'lodash';
import Path from 'path';
import draw from './akhr.draw';
import { get } from 'axios';

const GJZS = '高级资深干员';

const AKDATA_PATH = Path.resolve(__dirname, '../../data/akhr.json');
let AKDATA = null;

function isDataReady() {
  return !!AKDATA;
}

function getChar(i) {
  return AKDATA.characters[i];
}

async function pullData() {
  const [charData, charNameData, tagData] = _.map(
    await Promise.all([
      get('https://cdn.jsdelivr.net/gh/arkntools/arknights-toolbox@master/src/data/character.json'),
      get('https://cdn.jsdelivr.net/gh/arkntools/arknights-toolbox@master/src/locales/cn/character.json'),
      get('https://cdn.jsdelivr.net/gh/arkntools/arknights-toolbox@master/src/locales/cn/tag.json'),
    ]),
    'data'
  );
  let charTagSum = 0;
  const result = _.transform(
    Object.entries(charData)
      .filter(([, { recruitment }]) => recruitment.includes(0))
      .sort(([, { star: a }], [, { star: b }]) => b - a),
    ({ characters, data }, [id, { star, position, profession, tags }], i) => {
      characters.push({ n: charNameData[id], r: star });
      const tagNames = [position, profession, ...tags].map(tid => tagData[tid]);
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
  } catch (error) {
    throw new Error('方舟数据获取失败');
  }
}

async function init() {
  if (!Fse.existsSync(AKDATA_PATH)) await updateData();
  else AKDATA = Fse.readJsonSync(AKDATA_PATH);
}

function getCombinations(tags) {
  const combs = _.flatMap([1, 2, 3], v => _.combinations(tags, v));
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

function getResultImg(words) {
  let tags = _.transform(
    words,
    (a, w) => {
      //  支持日服词条  
      w = w.replace(/先鋒([夕タ][亻イ][ブプ])?/g, '先锋干员');
      w = w.replace(/前衛([夕タ][亻イ][ブプ])?/g, '近卫干员');
      w = w.replace(/狙撃([夕タ][亻イ][ブプ])?/g, '狙击干员');
      w = w.replace(/重装([夕タ][亻イ][ブプ])?/g, '重装干员');
      w = w.replace(/医療([夕タ][亻イ][ブプ])?/g, '医疗干员');
      w = w.replace(/補助([夕タ][亻イ][ブプ])?/g, '辅助干员');
      w = w.replace(/術師([夕タ][亻イ][ブプ])?/g, '术师干员');
      w = w.replace(/特殊([夕タ][亻イ][ブプ])?/g, '特种干员');
      w = w.replace('近距離', '近战位');
      w = w.replace('遠距離', '远程位');
      w = w.replace('火力', '输出');
      w = w.replace('防御', '防护');
      w = w.replace(/範囲(攻擊)?/g, '群攻');
      w = w.replace('COST回復', '费用回复');
      w = w.replace('治療', '治疗');
      w = w.replace('弱化', '削弱');
      w = w.replace('減速', '减速');
      w = w.replace('強制移動', '位移');
      w = w.replace('牽制', '控场');
      w = w.replace('爆発力', '爆发');
      w = w.replace('召喚', '召唤');
      w = w.replace('高速再配置', '快速复活');
      w = w.replace('初期', '新手');
      w = w.replace('ロボット', '支援机械');
      w = w.replace('エリート', '资深干员');
      w = w.replace('上級エリート', '高级资深干员');
      //  for tencent OCR
      w = w.replace('千员', '干员');
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
  tags = _.uniq(tags).slice(0, 6);
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
