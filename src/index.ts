import { load_ssq } from "./ssq.js";
import { load_dlt } from "./dlt.js";

// 更新双色球数据
await load_ssq();

// 更新大乐透数据
await load_dlt();