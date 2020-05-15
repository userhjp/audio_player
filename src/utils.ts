// export default function() {

// }


class Utils {
    
    el: Element;
    constructor(private elemt) {
        this.el = elemt;
        return this;
    }

    /**
     * 判断class是否存在
     * @param obj dom对象
     * @param cls class名称
     */
    hasClass(cls: string) {  
        return this.el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));  
    }


    /**
     * 添加class
     * @param obj dom对象
     * @param cls class
     */
    addClass(cls: string) {  
        if (!this.hasClass(cls)) this.el.className += " " + cls;  
    } 

    /**
     * 删除class
     * @param obj dom对象
     * @param cls class
     */
    removeClass(cls: string) {  
        if (this.hasClass(cls)) {  
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');  
            this.el.className =this.el.className.replace(reg, ' ');  
        }
    }

    /**
     * 切换class 有则删除，无则添加
     * @param obj dom对象
     * @param cls class
     */
    toggleClass(cls: string) {
        if (this.hasClass(cls)) {
            this.removeClass(cls);
        } else {
            this.addClass(cls);
        }
    }

    /**
     * 创建dom元素
     * @param tag 标签 例如div
     */
    createElemt(tag: string) {  
        return document.createElement(tag);
    }

    /**
     * 设置属性
     */
    setAttr(key: string,value: string) {  
        this.el.setAttribute(key,value);
        return this;
    }

    /**
     * 监听事件
     */
    on(event: string, fun: (e) => void) {
        this.el.addEventListener(event, fun, false);
        return this;
    }
}

export default Utils;
