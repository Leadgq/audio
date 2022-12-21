export default class audioCanvas {
    protected isStart = false;
    // 音频
    private audioSourceNode?: MediaElementAudioSourceNode
    private dataArray?: Float32Array
    // 分析资源对象
    private analyserNode?: AnalyserNode
    private bufferLength?: number
    // 上下文对象和canvas的上下文类似
    private audioCtx?: AudioContext
    // 流文件
    private mediaStreamAudioSourceNode?: MediaStreamAudioSourceNode
    private ffSize: number = 512

    constructor(
        public el = document.querySelector<HTMLCanvasElement>("#canvas")!,
        private app = el.getContext("2d")!,
        private width = el.width,
        private height = el.height,
        private bgColor = '#000'
    ) {
        this.initCanvas();
    }

    // 初始化画板
    public initCanvas() {
        this.app.fillStyle = this.bgColor;
        this.app.fillRect(0, 0, this.width, this.height)
    }

    // 分析音频、或者麦克风
    public analysisAudio(source?: string) {
        if (source) {
            this.bindMouseEvent(source);
        } else {
            this.mikeMedia();
        }
    }

    // 分析麦克风
    public async mikeMedia() {
        const constraints = {audio: true}
        try {
            // 获取用户用户支持的媒体
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.createMikeSource(mediaStream);
        } catch (error) {
            alert("无法使用麦克风、请确认浏览器版本或者是否有插入设备")
        }
    }


    private bindMouseEvent(source: string) {
        document.documentElement.addEventListener('mousedown', () => this.createMusicSource(source));
    }

    private createMusicSource(source: string) {
        if (this.isStart) return;
        this.isStart = true;
        const audioEle = new Audio();
        audioEle.src = source;
        audioEle.autoplay = true;
        audioEle.preload = 'auto';
        this.createSource(audioEle);
    }

    private createMikeSource(mediaStream: MediaStream) {
        if (this.audioCtx) return;
        this.audioCtx = new AudioContext();
        this.mediaStreamAudioSourceNode = this.audioCtx.createMediaStreamSource(mediaStream);
        this.createAnalyser();
        //设置音频节点网络（音频源->分析节点->输出）
        this.mediaStreamAudioSourceNode.connect(this.analyserNode!);
        this.analyserNode!.connect(this.audioCtx.destination);
        this.renderAudio();
    }

    private createSource(target: HTMLAudioElement) {
        if (this.audioCtx) return;
        this.audioCtx = new AudioContext();
        // 要分析的资源
        this.audioSourceNode = this.audioCtx.createMediaElementSource(target);
        this.createAnalyser();
        //设置音频节点网络（音频源->分析节点->输出）
        this.audioSourceNode.connect(this.analyserNode!);
        this.analyserNode!.connect(this.audioCtx.destination);
        this.renderAudio();
    }


    private createAnalyser() {
        // 分析资源对象
        this.analyserNode = this.audioCtx!.createAnalyser();
        // 样本窗口大小
        this.analyserNode.fftSize = this.ffSize;
        // 等于样本窗口的一半
        this.bufferLength = this.analyserNode.frequencyBinCount;
        this.dataArray = new Float32Array(this.bufferLength);
    }


    public renderAudio() {
        //准备好下次重绘
        requestAnimationFrame(this.renderAudio.bind(this));
        //获取实时的频谱信息
        this.analyserNode?.getFloatFrequencyData(this.dataArray!);
        //画一个黑色的背景
        this.app.fillStyle = 'rgb(0, 0, 0)';
        this.app.fillRect(0, 0, this.width, this.height);
        //绘制频谱
        const barWidth = (this.width / this.bufferLength!) * 3;
        let posX = 0;
        for (let i = 0; i < this.bufferLength!; i++) {
            if (this.dataArray) {
                const barHeight = (this.dataArray[i] + 140) * 2;
                const color = Math.floor(barHeight);
                this.app.fillStyle = `rgb(${Math.abs(color + 100)}, ${color}, ${Math.abs(Math.random() * color)})`;
                this.app.fillRect(posX, this.height - barHeight , barWidth, barHeight);
                posX += barWidth + 1;
            }
        }
    }
}
