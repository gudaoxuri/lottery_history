import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

export interface BaseLotteryRecord {
    issueNumber: string;
    drawDate: string;
}

export abstract class BaseLottery<T extends BaseLotteryRecord> {
    protected constructor(
        protected readonly jsonFilePath: string,
        protected readonly url: string,
        protected readonly type: string
    ) {}

    protected abstract parseHtmlData($: cheerio.CheerioAPI): T[];

    protected async fetchData(): Promise<T[]> {
        try {
            console.log(`Fetching lottery ${this.type} data...`);
            const response = await axios.get(this.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
                maxRedirects: 5,
            });
            if (!response.data) {
                throw new Error(`No ${this.type} data received from the server`);
            }

            const $ = cheerio.load(response.data);
            const lotteryData = this.parseHtmlData($);

            console.log(`Extracted ${lotteryData.length} lottery ${this.type} records`);
            return lotteryData;
        } catch (error) {
            console.error(`Error fetching lottery ${this.type} data:`, error);
            throw error;
        }
    }

    protected readExistingData(): Promise<T[]> {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(this.jsonFilePath)) {
                console.log(`JSON ${this.type} file does not exist yet. Will create a new one.`);
                return resolve([]);
            }

            fs.readFile(this.jsonFilePath, 'utf8', (err: any, data: string) => {
                if (err) {
                    console.error('Error reading JSON:', err);
                    return reject(err);
                }
                try {
                    const results: T[] = JSON.parse(data);
                    console.log(`Read ${results.length} existing ${this.type} records from JSON`);
                    resolve(results);
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    reject(parseError);
                }
            });
        });
    }

    protected mergeData(existingData: T[], newData: T[]): T[] {
        const existingMap = new Map<string, T>();
        existingData.forEach(record => {
            existingMap.set(record.issueNumber, record);
        });

        newData.forEach(record => {
            existingMap.set(record.issueNumber, record);
        });

        return Array.from(existingMap.values()).sort((a, b) => parseInt(b.issueNumber) - parseInt(a.issueNumber));
    }

    protected writeData(data: T[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const jsonContent = JSON.stringify(data, null, 2);

            fs.writeFile(this.jsonFilePath, jsonContent, 'utf8', (err: any) => {
                if (err) {
                    console.error('Error writing JSON:', err);
                    return reject(err);
                }
                console.log(`Successfully wrote ${data.length} records to ${this.jsonFilePath}`);
                resolve();
            });
        });
    }

    public async load(): Promise<void> {
        try {
            const fetchedData = await this.fetchData();
            const existingData = await this.readExistingData();
            const mergedData = this.mergeData(existingData, fetchedData);
            await this.writeData(mergedData);
            console.log(`Lottery ${this.type} data has been updated successfully!`);
        } catch (error) {
            console.error(`Failed to update lottery ${this.type} data:`, error);
        }
    }
}