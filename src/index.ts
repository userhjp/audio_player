import './index.less';
import WaveSurfer from 'wavesurfer.js';
import $ from './dom';
import Utils from './utils';

interface Config {
  /** 音频加载是否自动播放 */
  autoplay?: boolean;
  /** 播放地址 */
  src?: string;
  /** 是否允许点击、拖动进度条跳转进度 */
  isFastForward?: boolean; 
};

class AudioPlayer {
   private audioPlayer: any; // 播放器
   private config: Config = {
      autoplay: false, // 音频加载是否自动播放
      isFastForward: true, // 是否允许快进
    }
    private isMove = false; // 进度条是否拖动中，防止拖动时候音频正常播放更新进度条
    private currentvolum = 1; // 当前音频播放音量 0 - 1
    videoContainer;
    // 开始加载 | 加载完成 | 播放中 | 暂停中 | 缓冲中 | 缓冲就绪 | 播放完毕 | 错误

    constructor() {}
    
    init(selector: string | HTMLElement, config: Config) {
      try {
        this.videoContainer = typeof selector === 'string' ? document.querySelector(selector) : selector;
        this.videoContainer.innerHTML = this.videoElement;
        this.videoContainer.oncontextmenu = () => false;
        if(Utils.isIE()) {
          this.videoContainer.innerHTML = `<audio src="${config.src}" controlsList="nodownload noremoteplayback" controls="controls">您的浏览器不支持html5的audio标签</audio>`;
          document.querySelector('audio').oncontextmenu = () => false;
          return;
        }

        const elemelt = this.videoContainer.querySelector('#audio_player');
        this.audioPlayer = WaveSurfer.create({
            container: elemelt,
            waveColor: '#d7d7d7',
            progressColor: '#04bdff',
            backgroundColor: '#fff',
            cursorColor: '#04bdff',
            barRadius: '4',
            height: '200',
            // barGap: null,
            // barWidth: 4,
            // barHeight: 1,

        });
        this.audioPlayer.load(config.src);
        this.initEvent();
      } catch (error) {
        console.error(error);
      }
    }

    destroy = () => {
      if(this.audioPlayer) {
        this.audioPlayer.destroy();
        this.audioPlayer.unAll();
      }
    }

    // /** 重新加载音频 */
    // reload = () => this.playerElement.load();
    
    /** 开始、暂停播放 */
    play() {
      this.audioPlayer && this.audioPlayer.playPause()
    }

    /** 暂停播放 */
    pause = () => {
      if(this.audioPlayer) {
        this.audioPlayer.pause();
      } else {
        const audioEl = document.querySelector('audio');
        audioEl && audioEl.pause();
      }
    } 

    /** 停止并开始？ */
    stop = () => this.audioPlayer && this.audioPlayer.stop();

    /** 是否播放中 */
    isPlaying = () => this.audioPlayer && this.audioPlayer.isPlaying()

    /**
     * 设置播放进度
     * @param time 从当前位置跳过多少秒
     */
    setPlayTime(time: number) {
      // 当前播放时间
      const lasttime = this.audioPlayer.getCurrentTime();
      this.audioPlayer.skip(time-lasttime)
    }
    
    /** 设置倍速 */
    setPlaybackRate(e: string) {
      $('#speed_btn').text(parseFloat(e).toFixed(1) + 'x');
      this.audioPlayer.setPlaybackRate(e)
    }
    
    /** 设置音量 */
    setVolum(value) {
      value = parseFloat(value);
      this.audioPlayer.setVolume(value)
      /*设置左右宽度比例*/
      $('#volumeslider').setStyle('backgroundSize', `${value * 100}% 100%`)
      const volume_bth = $('#volume_img');
      if(value > 0) {
        volume_bth.removeClass('mute');
      } else {
        volume_bth.addClass('mute');
      }
    }
    
    
    /** 更新当前状态 */
    setState(state: 'error' | 'finish' | 'interaction' | 'loading' | 'mute' | 'pause' | 'play' | 'ready') {
      $('.video_cover').hide();
      console.log(state)
      switch (state) {
        case 'error':
         $('#v_error').show();
          break;
        case 'play':
          $('.play_btn').addClass('suspend');
          break
        case 'finish':
          $('.play_btn').removeClass('suspend');
        case 'ready':
        case 'pause':
          $('.play_btn').removeClass('suspend');
          // $('#v_play').setStyle('display', 'block');
          break;
        case 'loading':
         $('.v_loading').setStyle('display', 'block');
          break;
        default:
          break;
      }
    }

    /** 获取进度条宽度，存在旋转屏幕导致宽度不一致，实时获取 */
    getProgressWidth() {
      return $('#progress').get().clientWidth;
    }

    /** 根据当前X位置计算当前时间进度 */
    getCurrentLocationTime(position: number): string {
      const maxWidth = this.getProgressWidth(); // 进度总长度，进度条-按钮
      if(position > maxWidth) position = maxWidth;
      const slitherCurrentTime = position / maxWidth * this.audioPlayer.getDuration(); // 当前拖动进度位置时间
      const currentTime = `${Utils.formatSeconds(slitherCurrentTime)}`; // 当前播放进度- 分:秒
      return currentTime;
    }

    /** 
     * 音频当前播放进度/进度条样式 
     * @param position 当前进度条位置
    */
    setDuration(position: number) {
      const currentTime = this.getCurrentLocationTime(position);
      const duration = Utils.formatSeconds(this.audioPlayer.getDuration()); // 音频总长度- 分:秒
      $('.time').html(`${currentTime} / ${duration}`);
      $('.current_progress').setStyle('width', `${position}px`);
      $('.current_dot').setStyle('left', `${position}px`);
    }
  
    
    /** 各种初始化事件 */
    initEvent() {
      const isPc = Utils.isPC();
      // pc端 和移动端事件区分
      const touchstart = isPc ? 'mousedown' : 'touchstart'; // 鼠标按下/触摸
      const touchmove = isPc ? 'mousemove' : 'touchmove'; // 开始移动/拖动
      const touchend = isPc ? 'mouseup' : 'touchend'; // 鼠标松开/手指移开
      
      // 倍速列表点击事件
      $('#speed_con div').on('click', (e) => {
        $('#speed_con div').removeClass('on');
        e.target.classList.add('on');
        const val = `${parseFloat(e.target.innerText)}`;
        this.setPlaybackRate(val);
      })

      // 播放按钮点击
      $('.play_btn').on('click', (e) => this.play());

      $('.stop_btn').on('click', (e) => this.stop());

      // 改变时间label位置
      const showmoveLabel = (clientX) => {
        if(clientX < 0) clientX = 0;
        const datelabel = $('.date_label');
        datelabel.text(this.getCurrentLocationTime(clientX));
        datelabel.setStyle('left', clientX + 'px');
        datelabel.setStyle('visibility', 'visible');
      }

      // 隐藏label
      const hidemoveLabel = () => {
        $('.date_label').setStyle('visibility', 'hidden');;
      }

      // 进度条拖动
      $('.current_dot').on(touchstart, (event) => {
        if(!this.config.isFastForward) return;
        event.preventDefault();
        const maxWidth = this.getProgressWidth();
        // 如果这个元素的位置内只有一个手指
        if (isPc || event.targetTouches.length === 1) {
          const touch = isPc ? event : event.targetTouches[0];
          // 把元素放在手指所在的位置
          const disX = touch.clientX - $('.current_dot').get().offsetLeft;
          const getPosition = (e) => {
            let l = e.clientX - disX;
            if (l < 0) { l = 0; }
            if (l > maxWidth) { l = maxWidth; }
            return l;
          };
          const position = getPosition(touch);
          if(!isPc) showmoveLabel(position);
          // 开始拖动
          const move = (e) => {
            this.isMove = true;
            const touch2 = isPc ? e : e.targetTouches[0];
            const position = getPosition(touch2);
            this.setDuration(position);
            showmoveLabel(position);
          };
    
          // 如果浏览器下，需要全局监听拖动
          const dotElmt = isPc ? window : $('.current_dot').get();
          // 拖动完成 删除事件
          const chend = (e) => {
            // 拖动完成更新播放器时间
            const touch2 = isPc ? e : e.changedTouches[0];
            const position = getPosition(touch2);
            // 实际播放时间
            const currentTime = position / maxWidth * this.audioPlayer.getDuration();
            this.setPlayTime(currentTime);
            this.isMove = false;
            hidemoveLabel();
            dotElmt.removeEventListener(touchmove, move);
            dotElmt.removeEventListener(touchend, chend);
          };
          dotElmt.addEventListener(touchmove, move);
          dotElmt.addEventListener(touchend, chend);
        }
      })
    
      if (isPc) {
        // PC端点击音量按钮禁音
        $('#volume_img').on('click', (e) => {
            const val = parseFloat($('#volumeslider').get().value) > 0 ? 0.0 : this.currentvolum;
            $('#volumeslider').get().value = val;
            this.setVolum(val);
        })

        // 鼠标移开
        $('#progress').on('mouseleave', (e) => {
            // progressHover(false);
            hidemoveLabel();
        });
        // 鼠标移动
        $('#progress').on('mousemove', (e) => {
          // layerX 鼠标相对于当前焦点元素可视区偏移位置  offsetLeft 当前元素偏移
          showmoveLabel(e.target.tagName === 'I' ? e.target.offsetLeft + e.layerX : e.layerX);
        });
      } else {
        $('#audio_container').on('ontouchstart', onmouseover);
      }

      // 右键
      // const containerElemelt = container.querySelector('#video_container');;
      // $('#audio_container').on('oncontextmenu', (e) => {
      //   //阻止浏览器默认右键事件
      //   return false;
      // });

    
      // 阻止事件冒泡到点击进度条
      $('.current_dot').onmousedown((event) => event.stopPropagation());
    
      // 鼠标按下，跳转进度
      $('#progress').onmousedown((event) => {
        if(!this.config.isFastForward) return;
        const maxWidth = this.getProgressWidth();
        let layerX = event.layerX;
        if (layerX > maxWidth) { layerX = maxWidth; }
        const duration = this.audioPlayer.getDuration();
        let currentTime = layerX / maxWidth * duration; // 计算出点击的位置在总时间里面占多少。
        if(currentTime < 0) currentTime = 0;
        this.setPlayTime(currentTime);
        this.setDuration(layerX);
      })
    
      // 音量拖动事件
      $('#volumeslider').get().oninput = (e) => {
        e.stopPropagation();
        const value = e.target.value;
        this.currentvolum = value;
        this.setVolum(value);
      };
      
      // 音频播放时连续发射,搜寻时也会触发
      this.audioPlayer.on('audioprocess', (e) => {
        if (!this.isMove) {
          const duration = this.audioPlayer.getDuration();
          const maxWidth = this.getProgressWidth();
          this.setDuration(e / duration * maxWidth);
        }
      });
    
      // ready：可播放监听。当浏览器能够开始播放指定的音频/音频时触发
      this.audioPlayer.on('ready', (e) => {
        // 当前进度秒/总长度
        this.setDuration(this.audioPlayer.getCurrentTime()/ this.audioPlayer.getDuration() * this.getProgressWidth());
        this.setState('ready');
      })
      
      // readythrough：可流畅播放。当浏览器预计能够在不停下来进行缓冲的情况下持续播放指定的音频/音频时触发
      // video.addEventListener('readythrough', (e) => {
      //   console.log('提示音频能够不停顿地一直播放');
      // });
    
      // play：播放监听
      this.audioPlayer.on('play', (e) => this.setState('play'));
      // 暂停
      this.audioPlayer.on('pause', (e) => this.setState('pause'));
      
      // 双击播放器
      this.audioPlayer.on('dblclick', (e) => {});
      // 实例被销毁时。
      this.audioPlayer.on('destroy', (e) => {});
      // error：播放错误
      this.audioPlayer.on('error', (e) => this.setState('error'));
      // 与波形有相互作用时(波形点击跳转进度)
      this.audioPlayer.on('interaction', (e) => {
        this.setState('interaction');
        setTimeout(() => {
          this.setDuration(this.audioPlayer.getCurrentTime()/ this.audioPlayer.getDuration() * this.getProgressWidth());
        }, 0);
       
      });
      
      // 静音更改。回调将收到（布尔）新的静音状态。
      this.audioPlayer.on('mute', (e) => this.setState('mute'));
    
      // 使用抓取或拖放加载时连续触发。回调将以百分比[0..100]接收（整数）加载进度。
      this.audioPlayer.on('loading', (e) => this.setState('loading'));
    
      // finish：播放结束
      this.audioPlayer.on('finish', (e) => {
        this.setState('finish');
        $('.play_btn').removeClass('suspend');
      });
    }

    videoElement = `
      <div class="audio_player showControls" id="audio_container">
        <div class="controls" id="audio_controls">
            <div class="controls_left">
                <i class="button_img play play_btn" title="播放/暂停"></i>
                <i class="button_img stop stop_btn" title="停止播放"></i>
            </div>
            <div id="progress" class="progress_bar">
                <div class="current_progress"></div>
                <div class="current_buffer"></div>
                <i class="current_dot"></i>
                <span class="date_label">00:00</span>
            </div>
            <div class="controls_right">
                <div class="time">00:00 / 00:00</div>
                <!-- 音量 -->
                <div class="volume_bth">
                    <i id="volume_img" class="button_img sound"></i>
                    <div class="volume_con">
                        <div class="volume_slider">
                            <input id="volumeslider" type='range' min="0" max="1" step="0.01" value="0.8"/>
                        </div>
                    </div>
                </div>
                <!-- 倍速 -->
                <div class="speed_bth">
                    <div id="speed_con" class="speed_li">
                        <div>2.0x</div>
                        <div>1.5x</div>
                        <div class="on">1.0x</div>
                        <div>0.5x</div>
                    </div>
                    <span id="speed_btn">1.0x</span>
                </div>
            </div>
        </div>
        <div class="video_cover" id="v_error">
            <div class="cover_content">
                <div class="cover_img error"></div>
                <div class="tips_text tips_error">资源加载失败~</div>
            </div>
        </div>
        <div class="video_cover" id="v_play">
            <div class="cover_content">
                <div class="cover_img play play_btn"></div>
            </div>
        </div>
        <div class="video_cover" id="v_loading">
            <div class="cover_content">
                <div class="loading">
                    <div>
                        <div class="spot"></div>
                        <div class="spot"></div>
                        <div class="spot"></div>
                        <div class="spot"></div>
                        <div class="spot"></div>
                    </div>
                    <div class="tips_text">缓冲中...</div>
                </div>
            </div>
        </div>
        <div class="wavesurfer_container">
          <div id="audio_player" width="100%"></div>
        </div>
    </div>
    `
}
export default AudioPlayer;