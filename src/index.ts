import { load_ssq } from "./ssq.js";
import { load_dlt } from "./dlt.js";
import { predictSsq } from "./tools/ssq-predictor.js";

// 更新双色球数据
await load_ssq();

// 更新大乐透数据
await load_dlt();

// 预测双色球
await predictSsq();