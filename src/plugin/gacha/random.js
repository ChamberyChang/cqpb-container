import Fse from 'fs-extra';
import Path from 'path';
import JSTAT from 'jstat';

// 取得牌库
function getDecks(name) {
    const dataPath = Path.resolve(__dirname, `../../../data/decks/${name}.json`);
    try {
        let data = Fse.readJsonSync(dataPath);
        return data;
    } catch (error) {}
    return null;
};

// rolls() 返回的对象是一个 2 x N 数组，原作者是为方便将其转换为图片结果
function arrayToString(text) {
    try {
        return text.join("\n");
    } catch (error) {}
    return null;
};

//权重伪随机生成器 （原作者：SayaSS 项目地址：https://github.com/SayaSS/CQ-gacha.git）
function rolls(deckname, times) {
    const weight = getDecks(deckname).weight; // up角色/槽1/槽2/槽3/其他槽角色…（%）
    const charaUp = getDecks(deckname).tierUp; //up角色，weight槽0
    const chara9 = getDecks(deckname).tier9;
    const chara8 = getDecks(deckname).tier8;
    const chara7 = getDecks(deckname).tier7;
    const chara6 = getDecks(deckname).tier6;
    const chara5 = getDecks(deckname).tier5;
    const chara4 = getDecks(deckname).tier4; //其他槽，没有的话4-9可以不用填
    const chara3 = getDecks(deckname).tier3; //槽3
    const chara2 = getDecks(deckname).tier2; //槽2
    const chara1 = getDecks(deckname).tier1; //weight槽1

    let wtp = [];
    let p = [];

    function sum(arr) {
        let s = 0;
        for (let i = 0; i < arr.length; i++) {
            s += arr[i];
        }
        return s;
    }

    function choice(arr) {
        return arr[Math.floor((Math.random() * arr.length))]
    }
    for (let i in weight) {
        wtp.push(1. * weight[i] / sum(weight))
    }
    for (let i in wtp) {
        p.push(JSTAT.normal.sample(1. / wtp[i], 1. / wtp[i] / 3))
    }

    let result = [];
    for (let i = 0; i < times; i++) {
        let minp = 1.e9;
        let minj = -1;
        for (let j in p) {
            if (p[j] < minp) {
                minp = p[j];
                minj = parseInt(j);
            }
        }
        if (minj === 0) {
            result.push(choice(charaUp));
        } else if (minj === 1) {
            result.push(choice(chara1));
        } else if (minj === 2) {
            result.push(choice(chara2));
        } else if (minj === 3) {
            result.push(choice(chara3));
        } else if (minj === 4) {
            result.push(choice(chara4));
        } else if (minj === 5) {
            result.push(choice(chara5));
        } else if (minj === 6) {
            result.push(choice(chara6));
        } else if (minj === 7) {
            result.push(choice(chara7));
        } else if (minj === 8) {
            result.push(choice(chara8));
        } else if (minj === 9) {
            result.push(choice(chara9));
        }
        for (let j in p) {
            p[j] -= minp;
        }
        p[minj] = JSTAT.normal.sample(1. / wtp[minj], 1. / wtp[minj] / 3.);
    }
    return result;
}

/**
 * 抽卡结果
 *
 * @param {String} filename 牌堆文件名称
 * @param {Int} times 抽卡次数
 * @returns
 */
function getCards(filename, times) {
    return arrayToString(rolls(filename, times));
}

export default getCards;