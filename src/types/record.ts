export interface LotterySsqRecord {
    issueNumber: string;
    redBalls: number[];
    blueBall: number;
    drawDate: string;
}

export interface LotteryDltRecord {
    issueNumber: string;
    frontBalls: number[];
    backBalls: number[];
    drawDate: string;
}