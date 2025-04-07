import { LotterySsqRecord } from '../types/record';
import { BasePredictor, NumberFrequency, PredictionResult } from '../utils/base-predictor.js';

const SSQ_DATA_PATH = './data/ssq.json';

export class SsqPredictor extends BasePredictor {
    constructor() {
        super(SSQ_DATA_PATH, 'ssq.txt');
    }

    protected generatePredictions(redBallsFreq: NumberFrequency[], blueBallsFreq: NumberFrequency[]): PredictionResult[] {
        const predictions: PredictionResult[] = [];

        // Generate 6 different combinations
        for (let i = 0; i < 6; i++) {
            const selectedRed: number[] = [];
            const availableRedBalls = [...redBallsFreq];

            // 选择6个红球
            while (selectedRed.length < 6) {
                const selected = this.weightedRandom(availableRedBalls);
                if (!selectedRed.includes(selected)) {
                    selectedRed.push(selected);
                    // 更新可用球的权重，降低已选中数字相邻数字的权重
                    availableRedBalls.forEach(ball => {
                        if (Math.abs(ball.number - selected) <= 2) {
                            ball.frequency = Math.max(1, ball.frequency * 0.8);
                        }
                    });
                }
            }

            // 选择1个蓝球
            const selectedBlue = this.weightedRandom(blueBallsFreq);

            predictions.push({
                mainBalls: selectedRed.sort((a, b) => a - b),
                supplementBalls: [selectedBlue]
            });
        }

        return predictions;
    }

    public predict(): void {
        try {
            // 1. Load data
            const allRecords = this.loadData<LotterySsqRecord>();

            // 2. Exclude recent draws
            const historicalRecords = this.getHistoricalData(allRecords);

            // 3. Get frequency of blue balls
            const allBlueBalls = historicalRecords.map(record => record.blueBall);
            const blueBallFrequency = this.getNumberFrequency(allBlueBalls);

            // 4. Get frequency of red balls
            const allRedBalls = historicalRecords.flatMap(record => record.redBalls);
            const redBallFrequency = this.getNumberFrequency(allRedBalls);

            // 5. Print frequency statistics
            this.printNumberFrequency(redBallFrequency, '红球出现频率统计');
            this.printNumberFrequency(blueBallFrequency, '蓝球出现频率统计');

            // 6. Generate predictions using full frequency information
            const predictions = this.generatePredictions(redBallFrequency, blueBallFrequency);
            
            // 7. Write predictions to file
            this.writePredictions(predictions);

            // 8. Output predictions to console
            console.log('\n双色球号码预测：');
            console.log('====================');
            predictions.forEach((pred, index) => {
                console.log(`第 ${index + 1} 组预测号码：`);
                console.log(`红球：${pred.mainBalls.join(' ')}`);
                console.log(`蓝球：${pred.supplementBalls[0]}`);
                console.log('--------------------');
            });
        } catch (error) {
            console.error('预测过程中出现错误：', error);
        }
    }
}
