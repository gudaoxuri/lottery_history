import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import { LotteryDltRecord } from './types/record';

const jsonFilePath = './data/dlt.json';
const url = 'https://datachart.500.com/dlt/history/newinc/history.php';

async function fetchData(): Promise<LotteryDltRecord[]> {
    try {
        console.log('Fetching lottery dlt data...');
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            maxRedirects: 5,
        });
        if (!response.data) {
            throw new Error('No dlt data received from the server');
        }

        const $ = cheerio.load(response.data);
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

        console.log(`Extracted ${lotteryData.length} lottery dlt records`);
        return lotteryData;
    } catch (error) {
        console.error('Error fetching lottery dlt data:', error);
        throw error;
    }
}

function readExistingData(): Promise<LotteryDltRecord[]> {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(jsonFilePath)) {
            console.log('JSON dlt file does not exist yet. Will create a new one.');
            return resolve([]);
        }

        fs.readFile(jsonFilePath, 'utf8', (err: any, data: string) => {
            if (err) {
                console.error('Error reading JSON:', err);
                return reject(err);
            }
            try {
                const results: LotteryDltRecord[] = JSON.parse(data);
                console.log(`Read ${results.length} existing dlt records from JSON`);
                resolve(results);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                reject(parseError);
            }
        });
    });
}

function mergeData(existingData: LotteryDltRecord[], newData: LotteryDltRecord[]): LotteryDltRecord[] {
    const existingMap = new Map<string, LotteryDltRecord>();
    existingData.forEach(record => {
        existingMap.set(record.issueNumber, record);
    });

    newData.forEach(record => {
        existingMap.set(record.issueNumber, record);
    });

    return Array.from(existingMap.values()).sort((a, b) => parseInt(b.issueNumber) - parseInt(a.issueNumber));
}

function writeData(data: LotteryDltRecord[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const jsonContent = JSON.stringify(data, null, 2);

        fs.writeFile(jsonFilePath, jsonContent, 'utf8', (err: any) => {
            if (err) {
                console.error('Error writing JSON:', err);
                return reject(err);
            }
            console.log(`Successfully wrote ${data.length} records to ${jsonFilePath}`);
            resolve();
        });
    });
}

export async function load_dlt() {
    try {
        const fetchedData = await fetchData();
        const existingData = await readExistingData();
        const mergedData = mergeData(existingData, fetchedData);
        await writeData(mergedData);
        console.log('Lottery dlt data has been updated successfully!');
    } catch (error) {
        console.error('Failed to update lottery dlt data:', error);
    }
}