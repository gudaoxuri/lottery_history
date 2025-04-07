import * as cheerio from 'cheerio';
import { LotterySsqRecord } from './types/record';
import { BaseLottery } from './utils/base-lottery.js';

class SsqLottery extends BaseLottery<LotterySsqRecord> {
    constructor() {
        super(
            './data/ssq.json',
            'https://datachart.500.com/ssq/history/newinc/history.php',
            'ssq'
        );
    }

    protected parseHtmlData($: cheerio.CheerioAPI): LotterySsqRecord[] {
        const lotteryData: LotterySsqRecord[] = [];
        
        $('#tdata tr').each((_, element) => {
            const tds = $(element).find('td');
            const issueNumber = $(tds[0]).text().trim();
            const drawDate = $(tds[15]).text().trim();
            const redBalls = [];
            for (let i = 1; i <= 6; i++) {
                redBalls.push(parseInt($(tds[i]).text().trim()));
            }
            const blueBall = parseInt($(tds[7]).text().trim());

            lotteryData.push({
                issueNumber,
                redBalls,
                blueBall,
                drawDate
            });
        });

        return lotteryData;
    }
}

const ssqLottery = new SsqLottery();
export const load_ssq = () => ssqLottery.load();