import * as cheerio from 'cheerio';
import { LotteryDltRecord } from './types/record';
import { BaseLottery } from './utils/base-lottery.js';

class DltLottery extends BaseLottery<LotteryDltRecord> {
    constructor() {
        super(
            './data/dlt.json',
            'https://datachart.500.com/dlt/history/newinc/history.php',
            'dlt'
        );
    }

    protected parseHtmlData($: cheerio.CheerioAPI): LotteryDltRecord[] {
        const lotteryData: LotteryDltRecord[] = [];
        
        $('#tdata tr').each((_, element) => {
            const tds = $(element).find('td');
            const issueNumber = $(tds[0]).text().trim();
            const drawDate = $(tds[15]).text().trim();
            const frontBalls = [];
            for (let i = 1; i <= 5; i++) {
                frontBalls.push(parseInt($(tds[i]).text().trim()));
            }
            const backBalls = [
                parseInt($(tds[6]).text().trim()),
                parseInt($(tds[7]).text().trim())
            ];

            lotteryData.push({
                issueNumber,
                frontBalls,
                backBalls,
                drawDate
            });
        });

        return lotteryData;
    }
}

const dltLottery = new DltLottery();
export const load_dlt = () => dltLottery.load();