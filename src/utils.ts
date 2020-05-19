class Utils {
    /** 是否是PC端 */
    static isPC() {
        const userAgentInfo = navigator.userAgent;
        const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];  // 判断用户代理头信息
        let flag = true;
        for (const i in Agents) {
            if (userAgentInfo.indexOf(Agents[i]) !== -1) { flag = false; break; }
        }
        return flag;   // true为pc端，false为非pc端
    }

    /**
     * utils 数字向下取整
     * @param num 数字
     * @param len 长度
     */
    static prefixInteger(num: number, len: number = 2) {
        num = isNaN(num) ? 0 : Math.floor(num); // 向下取整
        return (Array(len).join('0') + num).slice(-len);
    }

   /** 时间秒转换为时分秒 
    * @param value 秒
    */
   static formatSeconds(value: any): string {
    let secondTime = parseInt(value);// 秒
    let minuteTime = 0;// 分
    let hourTime = 0;// 小时
    if(secondTime >= 60) {
      minuteTime = Math.floor(secondTime / 60);
      secondTime = Math.floor(secondTime % 60);
      if(minuteTime >= 60) {
          hourTime = Math.floor(minuteTime / 60);
          minuteTime = Math.floor(minuteTime % 60);
      }
    }
    let joinDate = `${Utils.prefixInteger(minuteTime)}:${Utils.prefixInteger(secondTime)}`;
    if(hourTime > 0 || value >= 3600) joinDate = `${Utils.prefixInteger(hourTime)}:${joinDate}`;
    return joinDate;
  }
}

export default Utils;
