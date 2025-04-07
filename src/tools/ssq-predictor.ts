import fs from 'fs';
import { LotterySsqRecord } from '../types/record';

const SSQ_DATA_PATH = './data/ssq.json';

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

function generatePredictions(topRedBalls: number[], topBlueBalls: number[]): Array<{red: number[], blue: number}> {
    const predictions: Array<{red: number[], blue: number}> = [];
    
    // Generate 6 different combinations
    for (let i = 0; i < 6; i++) {
        // Randomly select 6 different numbers from topRedBalls
        const selectedRed = [...topRedBalls]
            .sort(() => Math.random() - 0.5)
            .slice(0, 6)
            .sort((a, b) => a - b);
            
        // Randomly select 1 number from topBlueBalls
        const selectedBlue = topBlueBalls[Math.floor(Math.random() * topBlueBalls.length)];
        
        predictions.push({
            red: selectedRed,
            blue: selectedBlue
        });
    }
    
    return predictions;
}

function printNumberFrequency(frequencies: NumberFrequency[], title: string) {
    console.log(`\n${title}：`);
    console.log('====================');
    frequencies.forEach(({number, frequency}) => {
        console.log(`号码 ${number.toString().padStart(2, '0')}: 出现 ${frequency} 次`);
    });
    console.log('--------------------');
}

export function predictSsq(): void {
    try {
        // 1. Load data
        const allRecords = loadSsqData();
        
        // 2. Exclude recent 10 draws
        const historicalRecords = getHistoricalData(allRecords);
        
        // 3. Get frequency of blue balls and find top 3
        const allBlueBalls = historicalRecords.map(record => record.blueBall);
        const blueBallFrequency = getNumberFrequency(allBlueBalls);
        const topBlueBalls = blueBallFrequency.slice(0, 3).map(f => f.number);
        
        // 4. Get frequency of red balls and find top 10
        const allRedBalls = historicalRecords.flatMap(record => record.redBalls);
        const redBallFrequency = getNumberFrequency(allRedBalls);
        const topRedBalls = redBallFrequency.slice(0, 10).map(f => f.number);

        // 5. Print frequency statistics
        printNumberFrequency(redBallFrequency, '红球出现频率统计');
        printNumberFrequency(blueBallFrequency, '蓝球出现频率统计');
        
        // 6. Generate predictions
        const predictions = generatePredictions(topRedBalls, topBlueBalls);
        
        // 7. Output predictions
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