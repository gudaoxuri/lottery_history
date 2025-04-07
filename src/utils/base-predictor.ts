import fs from 'fs';
import path from 'path';

export interface NumberFrequency {
    number: number;
    frequency: number;
}

export interface PredictionResult {
    mainBalls: number[];
    supplementBalls: number[];
}

export abstract class BasePredictor {
    protected readonly dataPath: string;
    protected readonly predictDir = './data/predict';
    protected readonly predictFileName: string;

    constructor(dataPath: string, predictFileName: string) {
        this.dataPath = dataPath;
        this.predictFileName = predictFileName;
    }

    protected loadData<T>(): T[] {
        const data = fs.readFileSync(this.dataPath, 'utf8');
        return JSON.parse(data);
    }

    protected getHistoricalData<T>(records: T[], excludeRecentDraws: number = 5): T[] {
        return records.slice(excludeRecentDraws);
    }

    protected getNumberFrequency(numbers: number[]): NumberFrequency[] {
        const frequency: Map<number, number> = new Map();
        numbers.forEach(num => {
            frequency.set(num, (frequency.get(num) || 0) + 1);
        });

        return Array.from(frequency.entries())
            .map(([number, freq]) => ({ number, frequency: freq }))
            .sort((a, b) => b.frequency - a.frequency);
    }

    protected weightedRandom(numbers: NumberFrequency[]): number {
        const totalWeight = numbers.reduce((sum, item) => sum + item.frequency, 0);
        let random = Math.random() * totalWeight * 2;

        for (const item of numbers) {
            random -= item.frequency;
            if (random <= 0) {
                return item.number;
            }
        }
        return numbers[0].number;
    }

    protected printNumberFrequency(frequencies: NumberFrequency[], title: string): void {
        console.log(`\n${title}：`);
        frequencies.forEach(({ number, frequency }) => {
            process.stdout.write(`${number.toString().padStart(2, '0')}:${frequency} `);
        });
        console.log('\n--------------------');
    }

    protected writePredictions(predictions: PredictionResult[]): void {
        if (!fs.existsSync(this.predictDir)) {
            fs.mkdirSync(this.predictDir, { recursive: true });
        }

        const currentTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        let content = `预测时间：${currentTime}\n`;
        
        predictions.forEach((pred, index) => {
            content += `第${index + 1}组：${pred.mainBalls.join(' ')} | ${pred.supplementBalls.join(' ')}\n`;
        });
        content += '\n';

        fs.appendFileSync(path.join(this.predictDir, this.predictFileName), content, 'utf8');
    }

    protected abstract generatePredictions(mainBallsFreq: NumberFrequency[], supplementBallsFreq: NumberFrequency[]): PredictionResult[];
    public abstract predict(): void;
}