import "./style.scss"
// @ts-ignore
import  music  from  "./static/zhoujielun.mp3"
import audioCanvas from "./app"

const audioInstance = new audioCanvas();
// 分析
audioInstance.analysisAudio();
