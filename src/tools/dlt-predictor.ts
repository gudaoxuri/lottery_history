import { LotteryDltRecord } from '../types/record';
import { BasePredictor, NumberFrequency, PredictionResult } from '../utils/base-predictor.js';

const DLT_DATA_PATH = './data/dlt.json';

export class DltPredictor extends BasePredictor {
    constructor() {
        super(DLT_DATA_PATH, 'dlt.txt');
    }

    protected generatePredictions(frontBallsFreq: NumberFrequency[], backBallsFreq: NumberFrequency[]): PredictionResult[] {
        const predictions: PredictionResult[] = [];

        // Generate 6 different combinations
        for (let i = 0; i < 6; i++) {
            const selectedFront: number[] = [];
            const availableFrontBalls = [...frontBallsFreq];

            // 选择5个前区号码
            while (selectedFront.length < 5) {
                const selected = this.weightedRandom(availableFrontBalls);
                if (!selectedFront.includes(selected)) {
                    selectedFront.push(selected);
                    // 更新可用球的权重，降低已选中数字相邻数字的权重
                    availableFrontBalls.forEach(ball => {
                        if (Math.abs(ball.number - selected) <= 2) {
                            ball.frequency = Math.max(1, ball.frequency * 0.8);
                        }
                    });
                }
            }

            // 选择2个后区号码
            const selectedBack: number[] = [];
            const availableBackBalls = [...backBallsFreq];

            while (selectedBack.length < 2) {
                const selected = this.weightedRandom(availableBackBalls);
                if (!selectedBack.includes(selected)) {
                    selectedBack.push(selected);
                    // 更新可用球的权重，降低已选中数字相邻数字的权重
                    availableBackBalls.forEach(ball => {
                        if (Math.abs(ball.number - selected) <= 2) {
                            ball.frequency = Math.max(1, ball.frequency * 0.8);
                        }
                    });
                }
            }

            predictions.push({
                mainBalls: selectedFront.sort((a, b) => a - b),
                supplementBalls: selectedBack.sort((a, b) => a - b)
            });
        }

        return predictions;
    }

    public predict(): void {
        try {
            // 1. Load data
            const allRecords = this.loadData<LotteryDltRecord>();

            // 2. Exclude recent draws
            const historicalRecords = this.getHistoricalData(allRecords);

            // 3. Get frequency of back balls
            const allBackBalls = historicalRecords.flatMap(record => record.backBalls);
            const backBallFrequency = this.getNumberFrequency(allBackBalls);

            // 4. Get frequency of front balls
            const allFrontBalls = historicalRecords.flatMap(record => record.frontBalls);
            const frontBallFrequency = this.getNumberFrequency(allFrontBalls);

            // 5. Print frequency statistics
            this.printNumberFrequency(frontBallFrequency, '前区号码出现频率统计');
            this.printNumberFrequency(backBallFrequency, '后区号码出现频率统计');

            // 6. Generate predictions using full frequency information
            const predictions = this.generatePredictions(frontBallFrequency, backBallFrequency);
            
            // 7. Write predictions to file
            this.writePredictions(predictions);

            // 8. Output predictions to console
            console.log('\n大乐透号码预测：');
            console.log('====================');
            predictions.forEach((pred, index) => {
                console.log(`第 ${index + 1} 组预测号码：`);
                console.log(`前区：${pred.mainBalls.join(' ')}`);
                console.log(`后区：${pred.supplementBalls.join(' ')}`);
                console.log('--------------------');
            });
        } catch (error) {
            console.error('预测过程中出现错误：', error);
        }
    }
}