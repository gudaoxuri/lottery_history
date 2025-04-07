import fs from 'fs';
import path from 'path';
import { LotterySsqRecord } from '../types/record';

const SSQ_DATA_PATH = './data/ssq.json';
const PREDICT_DIR = './data/predict';
const PREDICT_FILE = path.join(PREDICT_DIR, 'ssq.txt');

interface NumberFrequency {
    number: number;
    frequency: number;
}

function loadSsqData(): LotterySsqRecord[] {
    const data = fs.readFileSync(SSQ_DATA_PATH, 'utf8');
    return JSON.parse(data);
}

function getHistoricalData(records: LotterySsqRecord[], excludeRecentDraws: number = 5): LotterySsqRecord[] {
    return records.slice(excludeRecentDraws);
}

function getNumberFrequency(numbers: number[]): NumberFrequency[] {
    const frequency: Map<number, number> = new Map();
    numbers.forEach(num => {
        frequency.set(num, (frequency.get(num) || 0) + 1);
    });

    return Array.from(frequency.entries())
        .map(([number, freq]) => ({ number, frequency: freq }))
        .sort((a, b) => b.frequency - a.frequency);
}

function weightedRandom(numbers: NumberFrequency[]): number {
    const totalWeight = numbers.reduce((sum, item) => sum + item.frequency, 0);
    let random = Math.random() * totalWeight * 2;

    for (const item of numbers) {
        random -= item.frequency;
        if (random <= 0) {
            return item.number;
        }
    }
    return numbers[0].number; // 防止浮点数精度问题
}

function generatePredictions(redBallsFreq: NumberFrequency[], blueBallsFreq: NumberFrequency[]): Array<{ red: number[], blue: number }> {
    const predictions: Array<{ red: number[], blue: number }> = [];

    // Generate 6 different combinations
    for (let i = 0; i < 6; i++) {
        const selectedRed: number[] = [];
        const availableRedBalls = [...redBallsFreq];

        // 选择6个红球
        while (selectedRed.length < 6) {
            const selected = weightedRandom(availableRedBalls);
            if (!selectedRed.includes(selected)) {
                selectedRed.push(selected);
                // 更新可用球的权重，降低已选中数字相邻数字的权重
                availableRedBalls.forEach(ball => {
                    if (Math.abs(ball.number - selected) <= 2) {
                        ball.frequency = Math.max(1, ball.frequency * 0.8); // 降低相邻数字的权重但保持最小值
                    }
                });
            }
        }

        // 选择1个蓝球（使用权重随机）
        const selectedBlue = weightedRandom(blueBallsFreq);

        predictions.push({
            red: selectedRed.sort((a, b) => a - b),
            blue: selectedBlue
        });
    }

    return predictions;
}

function printNumberFrequency(frequencies: NumberFrequency[], title: string) {
    console.log(`\n${title}：`);
    console.log('====================');
    frequencies.forEach(({ number, frequency }) => {
        console.log(`号码 ${number.toString().padStart(2, '0')}: 出现 ${frequency} 次`);
    });
    console.log('--------------------');
}

function writePredictions(predictions: Array<{red: number[], blue: number}>): void {
    // 创建预测结果目录（如果不存在）
    if (!fs.existsSync(PREDICT_DIR)) {
        fs.mkdirSync(PREDICT_DIR, { recursive: true });
    }

    const currentTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    let content = `预测时间：${currentTime}\n`;
    
    predictions.forEach((pred, index) => {
        content += `第${index + 1}组：${pred.red.join(' ')} | ${pred.blue}\n`;
    });
    content += '\n';

    // 追加写入文件
    fs.appendFileSync(PREDICT_FILE, content, 'utf8');
}

export function predictSsq(): void {
    try {
        // 1. Load data
        const allRecords = loadSsqData();

        // 2. Exclude recent 10 draws
        const historicalRecords = getHistoricalData(allRecords);

        // 3. Get frequency of blue balls
        const allBlueBalls = historicalRecords.map(record => record.blueBall);
        const blueBallFrequency = getNumberFrequency(allBlueBalls);

        // 4. Get frequency of red balls
        const allRedBalls = historicalRecords.flatMap(record => record.redBalls);
        const redBallFrequency = getNumberFrequency(allRedBalls);

        // 5. Print frequency statistics
        printNumberFrequency(redBallFrequency, '红球出现频率统计');
        printNumberFrequency(blueBallFrequency, '蓝球出现频率统计');

        // 6. Generate predictions using full frequency information
        const predictions = generatePredictions(redBallFrequency, blueBallFrequency);
        
        // 7. Write predictions to file
        writePredictions(predictions);
        
        // 8. Output predictions to console
        console.log('\n双色球号码预测：');
        console.log('====================');
        predictions.forEach((pred, index) => {
            console.log(`第 ${index + 1} 组预测号码：`);
            console.log(`红球：${pred.red.join(' ')}`);
            console.log(`蓝球：${pred.blue}`);
            console.log('--------------------');
        });

    } catch (error) {
        console.error('预测过程中出现错误：', error);
    }
}

predictSsq()