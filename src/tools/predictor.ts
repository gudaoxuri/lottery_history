import { DltPredictor } from './dlt-predictor.js';
import { SsqPredictor } from './ssq-predictor.js';

const ssqPredictor = new SsqPredictor();
const dltPredictor = new DltPredictor();

await ssqPredictor.predict();
await dltPredictor.predict();