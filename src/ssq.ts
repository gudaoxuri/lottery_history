import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import { LotterySsqRecord } from './types/record';

const jsonFilePath = './data/ssq.json';
const url = 'https://datachart.500.com/ssq/history/newinc/history.php';

async function fetchData(): Promise<LotterySsqRecord[]> {
    try {
        console.log('Fetching lottery ssq data...');
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            maxRedirects: 5,
        });
        if (!response.data) {
            throw new Error('No ssq data received from the server');
        }
        // console.debug(`Response data: ${response.data}`);
        const $ = cheerio.load(response.data);
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
                redBalls: redBalls,
                blueBall,
                drawDate
            });
        });

        console.log(`Extracted ${lotteryData.length} lottery ssq records`);
        return lotteryData;
    } catch (error) {
        console.error('Error fetching lottery ssq data:', error);
        throw error;
    }
}

function readExistingData(): Promise<LotterySsqRecord[]> {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(jsonFilePath)) {
            console.log('JSON ssq file does not exist yet. Will create a new one.');
            return resolve([]);
        }

        fs.readFile(jsonFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading JSON:', err);
                return reject(err);
            }
            try {
                const results: LotterySsqRecord[] = JSON.parse(data);
                console.log(`Read ${results.length} existing ssq records from JSON`);
                resolve(results);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                reject(parseError);
            }
        });
    });
}

function mergeData(existingData: LotterySsqRecord[], newData: LotterySsqRecord[]): LotterySsqRecord[] {
    const existingMap = new Map<string, LotterySsqRecord>();
    existingData.forEach(record => {
        existingMap.set(record.issueNumber, record);
    });

    newData.forEach(record => {
        existingMap.set(record.issueNumber, record);
    });

    return Array.from(existingMap.values()).sort((a, b) => parseInt(b.issueNumber) - parseInt(a.issueNumber));
}

function writeData(data: LotterySsqRecord[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const jsonContent = JSON.stringify(data, null, 2);

        fs.writeFile(jsonFilePath, jsonContent, 'utf8', (err) => {
            if (err) {
                console.error('Error writing JSON:', err);
                return reject(err);
            }
            console.log(`Successfully wrote ${data.length} records to ${jsonFilePath}`);
            resolve();
        });
    });
}

export async function load_ssq() {
    try {
        const fetchedData = await fetchData();
        const existingData = await readExistingData();
        const mergedData = mergeData(existingData, fetchedData);
        await writeData(mergedData);
        console.log('Lottery ssq data has been updated successfully!');
    } catch (error) {
        console.error('Failed to update lottery ssq data:', error);
    }
}