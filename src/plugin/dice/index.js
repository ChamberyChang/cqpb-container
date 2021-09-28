import _ from 'lodash';
import RandomSeed from 'random-seed';

const rand = RandomSeed.create();

async function diceHandler(context) {
    
    const msg = context.message;
    const diceSearch = /(?<=投掷|\.[Rr])[\s]*?([1-9])[Dd]((?!0+(?:[:.]0+)?$)[0-9]{1,3})$/.exec(msg);
    const diceAssay = /(?<=检定|\.[Rr][AaCc])\s*\S+?[\s]+((?:[1-9]?\d|100))$/.exec(msg);
    const diceMsg = [`投掷结果为`];

    if (diceSearch) {
        for (var i = 0; i < parseInt(diceSearch[1], 10); i++) {
            const randDice = rand.intBetween(1, ~~diceSearch[2]);
            diceMsg.push(randDice);
        }
        global.replyMsg(context, diceMsg.join('\n'), true);
        return true;
    }

    if (diceAssay) {
        const randDice = rand.intBetween(1, 100);
        diceMsg.push(randDice);
        if(randDice >= ~~diceAssay[1]) diceMsg.push(`\n成功`); 
        else diceMsg.push(`\n失败`); 
        global.replyMsg(context, diceMsg.join(''), true);
        return true;
    }
}

export default diceHandler;
