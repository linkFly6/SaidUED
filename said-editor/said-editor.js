/*!
* Copyright 2015 linkFLy - http://www.cnblogs.com/silin6/
* Released under the BSD license
* http://opensource.org/licenses/BSD-3-Clause
* Help document：https://github.com/linkFly6/so/blob/master/So/Other/Sogou/Service.md
* Date: 2015-7-20 16:16:17
*/
(function (global, factory) {
    //UMD处理
    if (typeof define === "function" && define.amd) {
        //AMD
        define(function () {
            return factory(global, true);
        });
    } else if (typeof module === "object" && typeof module.exports === "object") {
        //node/commonJs
        module.exports = global.document ?
			factory(global, true) :
			function (w) {
			    if (!w.document) {
			        throw new Error("said-editor requires a window with a document");
			    }
			    return factory(w);
			};
    } else {
        //browser
        factory(global);
    }
})(typeof window !== 'undefined' ? window : this, function (window, noGlobal, undefined) {
    'use strict';
    var templateBox = `<div class="editor editMode" id="edit-{id}">
                        <div class ="editor-toolbar" id="tool-{id}" style="visibility:hidden;">
                            <ul class ="e-tool" id="tool-r-{id}"></ul>
                            <ul class ="e-menu" id="tool-l-{id}"></ul>
                        </div>
                        <div class ="editor-main" id="main-{id}"></div>
                        <div class ="editor-loading" id="loading-{id}">
                            <div class ="loading-box">
                                <i class ="fa fa-refresh fa-spin fa-2x fa-fw margin-bottom"></i>
                            </div>
                        </div>
                    </div>`,
        templateMenuItem = `<li class="menu-item" id="{name}-btn-{id}" title="{title}">
                                <a class="menu-btn" href="javascript:;">
                                    <i class="fa {className}"></i>
                                </a>
                            </li>`,
        templateMenuLine = '<li class="line"></li>',
        DEFAULTS = {
            textAreaClass: 'eidtor-text'
        },
        createElementByTemplate = function (id) {
            var node = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
            node.innerHTML = templateBox.replace(/{id}/g, id);
            return node.firstChild;
        };



    var eventNames = 'bold,italic,link,quote,code,image,olist,ulist,heading,hr,table,undo,redo,help'.split(',');

    var Editor = function (textArea, options) {
        if (!(this instanceof Editor))
            return new Editor(textArea, options);
        this.textArea = textArea;
        this.__id__ = +new Date;
        this.elem = createElementByTemplate(this.__id__);
        initEditor(this);
    };




    /**
    * 插入一个数值到textarea，会自动设置光标
    * @param {int} start - 要插入值的起点位置
    * @param {int} end - 要插入值的终点位置
    * @param {String} value = null - 要插入的值
    * @returns {this}
    */
    Editor.prototype.insertValue = function (value) {
        var selectInfo = this.getSelectInfo();
        this.textArea.value = selectInfo.startText + value + selectInfo.endText;
        this.select(selectInfo.start, selectInfo.end + value.length);
        return this;
    };

    /**
    * 包装选中的文本
    * 传入一个位置，将对应位置的文本给包装起来，会自动设置光标
    * @param {int} start - 要包装文本的起点位置
    * @param {int} end - 要包装文本的终点位置
    * @param {String} strLeft 字符串左侧要包装的文本
    * @param {String} strRight 字符串右侧要包装的文本
    * @returns {this}
    */
    Editor.prototype.wrapSelect = function (start, end) {
        Editor.wrapSelect(this.textArea, strLeft, strRight);
        return this;
    };

    /**
    * 选中一段文本
    * @param {int} start - 要选中值的起点位置
    * @param {int} end - 要选中值的终点位置
    * @returns {this}
    */
    Editor.prototype.select = function (start, end) {

        if (start == null) {//获取位置
            return Editor.select(this.textArea);
        }
        Editor.select(this.textArea, start, end);
        return this;
    };

    /**
    * 获取光标相关信息
    * @returns {object}
    */
    Editor.prototype.getSelectInfo = function () {
        return Editor.getSelectInfo(this.textArea);
    }

    Editor.prototype.__getById = function (name) {
        return document.getElementById(name + this.__id__);
    };




    //初始化编辑器
    function initEditor(editor, options) {
        var defaultsStyle = getComputedStyle(editor.textArea),
            editWidth = editor.textArea.offsetWidth || parseInt(defaultsStyle.width),
            editHeight = editor.textArea.offsetHeight || parseInt(defaultsStyle.height);
        //进行包装，先渲染到页面上
        editor.textArea.parentElement.insertBefore(editor.elem, editor.textArea);
        document.getElementById('main-' + editor.__id__).appendChild(editor.textArea);
        editor.elem.style.height = editHeight + 'px';
        editor.elem.style.width = editWidth + 'px';
        editor.textArea.className += DEFAULTS.textAreaClass;
        //再渲染按钮
        initRender(editor);
    }

    //初始化事件
    function initRender(editor) {

        //绑定基本的键盘事件
        editor.textArea.addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                case 9: {
                    var selectInfo = editor.getSelectInfo();
                    if (e.shiftKey == true) {//按下了shift，往后递减

                    } else {
                        if (!selectInfo.innerText) {//光标没有选中文本

                        }
                    }
                    e.preventDefault();
                    break;
                }
                default:
                    break;
            }

        });

        //注入插件列表
        var leftPlugsHTML = [],//左侧插件HTML
            rightPlugsHTML = [],//右侧插件HTML
            plugNames = Object.keys(Editor.plugs);
        //循环生成HTML
        plugNames.forEach(function (plugName) {
            var plug = Editor.plugs[plugName],
                templateTemp = templateMenuItem.replace('{name}', plugName)
                                    .replace('{id}', editor.__id__)
                                    .replace('{className}', plug.className || '')
                                    .replace('{title}', plug.title || '');
            if (plug.type == 'right') {
                rightPlugsHTML.push(plug.line == true ? templateMenuLine : '', templateTemp);
            } else
                leftPlugsHTML.push(plug.line == true ? templateMenuLine : '', templateTemp);
        });

        //放入插件
        editor.__getById('tool-r-').innerHTML = rightPlugsHTML.join('');
        editor.__getById('tool-l-').innerHTML = leftPlugsHTML.join('');

        //再循环一遍绑定事件（TODO 可以其实可以使用文档碎片减少两次循环，利弊自己衡量）
        plugNames.forEach(function (plugName) {
            var plug = Editor.plugs[plugName],
                button = editor.__getById(plugName + '-btn-');
            if (button) {
                button.addEventListener('click', function (e) {
                    editor.textArea.focus();
                    plug.click.call(editor, e, event, button);
                });
            }
        });
        editor.__getById('tool-').style.visibility = '';
        editor.__getById('loading-').style.display = 'none';
    }



    /**
    * 获取/设置一个input/textarea的光标位置（索引）
    * Editor.select() - 获取光标
    * Editor.select(start, end) - 设置光标
    * @param {object} textArea - 要获取选择信息的input/textarea
    * @param {number} start - 光标起始位置
    * @param {number} end - 光标起始位置
    * @returns {Array} - arr
    * @returns {number} - arr.start - 光标起始位置
    * @returns {number} - arr.end - 光标结束位置
    */
    Editor.select = function (textArea, start, end) {
        if (start == null) {//获取位置
            // Initialize
            var iCaretPos = [0, 0];//start, end

            // IE Support
            if (document.selection) {
                // Set focus on the element
                //textArea.focus();//要先focus

                // To get cursor position, get empty selection range
                var oSel = document.selection.createRange();

                // Move selection start to 0 position
                oSel.moveStart('character', -textArea.value.length);

                // The caret position is selection length
                iCaretPos = oSel.text.length;//IE这里要后续处理
            }

                //现代浏览器
            else if (textArea.selectionStart != null && textArea.selectionEnd != null) {
                iCaretPos = [textArea.selectionStart, textArea.selectionEnd];
            }

            // Return results
            return iCaretPos;
        }
        if (textArea.setSelectionRange) {
            textArea.focus();
            textArea.setSelectionRange(start, end);
        }
        else if (textArea.createTextRange) {//IE
            var range = textArea.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    }


    /**
    * 获取一个input/textarea的光标和选择相关信息
    * @param {object} textArea - 要获取选择信息的input/textarea
    * @returns {object} - obj
    * @returns {number} - obj.start - 光标起始位置
    * @returns {number} - obj.end - 光标结束位置
    * @returns {string} - obj.startText - 切割的字符串左侧的文本（光标左侧的文本）
    * @returns {string} - obj.endText - 切割的字符串右侧的文本（光标右侧的文本）
    * @returns {string} - [obj.innerText = ""] - 切割的字符串中间的文本（光标选中的文本）
    */
    Editor.getSelectInfo = function (textArea) {

        var pos = Editor.select(textArea);//获取光标位置

        var start = pos[0],
            end = pos[1],
            textAreaValue = textArea.value,
            startText = textAreaValue.substring(0, start),
            endText = textAreaValue.substring(end),
            innerText = start == end ? '' : textAreaValue.substring(start, end);
        return {
            start: start,//光标起始位置
            end: end,//光标结束位置
            startText: startText,//切割的字符串左侧的文本（光标左侧的文本）
            endText: endText,//切割的字符串右侧的文本（光标右侧的文本）
            innerText: innerText//切割的字符串中间的文本（光标选中的文本）
        };
    }

    /**
    * 设置一个textarea/input的光标选中信息
    * 传入两个要包装的文本，检测光标，如果光标左右两侧和包装的文本是相同的，则把输入框中包装的文本去掉，否则将选中的文本包装起来，如果没有选中，则填充默认值
    * @param {object} textArea - 要操作的input/textarea
    * @param {function} strLeft - 在光标选中区域左侧要包装的文本
    * @param {function} strRight - 在光标选中区域右侧要包装的文本
    * @param {int} [defaultText=''] - 如果没有选中文本（仅有光标）的话，填充的默认文本
    * @returns {undefined}
    */
    Editor.wrapSelect = function (textArea, strLeft, strRight, defaultText) {
        defaultText = defaultText || '';
        var selectInfo = Editor.getSelectInfo(textArea),
            strLeftLength = strLeft.length,
            strRightLength = strRight.length;
        if (selectInfo.startText.lastIndexOf(strLeft) == selectInfo.startText.length - strLeftLength &&//检测两边是否包含包装的关键语句，如果有的话则去掉
            selectInfo.endText.indexOf(strRight) == 0
            ) {
            //去掉关键语法
            selectInfo.startText = selectInfo.startText.substring(0, selectInfo.startText.length - strLeftLength);
            selectInfo.endText = selectInfo.endText.substr(strRightLength);
            textArea.value = [selectInfo.startText, selectInfo.innerText, selectInfo.endText].join('');
            //设置select
            //Editor.select(textArea, selectInfo.start - strLeftLength, selectInfo.end - strRightLength);
        } else {

            if (!selectInfo.innerText) {//没有选中内容，填充默认文本并选中
                selectInfo.innerText = defaultText;
                //修正光标选中，加上默认文本的值
                //selectInfo.end += defaultText.length;
            }
            textArea.value = [selectInfo.startText, strLeft, selectInfo.innerText, strRight, selectInfo.endText].join('');
            //Editor.select(textArea, selectInfo.start + strLeftLength, selectInfo.end + strRightLength);
            return selectInfo;
        }


    }



    //插件列表 TODO 如果做成对象类型的话，低版本浏览器排序就会乱序
    Editor.plugs = {
        //加粗
        'bold': {
            //绘制HTML
            className: 'fa-bold',
            //line: false,
            type: 'left',//左侧工具栏
            title: '加粗 <strong> Ctrl+B',//hover文本
            keyCode: 13,//快捷键
            click: function (e, obj) {//obj指向这个bold对象 TODO：这里是选中要自己搞
                Editor.wrapSelect(this.textArea, '**', '**', '加粗文本');
            }
        },
        //斜体
        'italic': {
            className: 'fa-italic',
            type: 'left',
            title: '斜体 <em> Ctrl+I',
            keyCode: 13,
            click: function (e, obj) {
                Editor.wrapSelect(this.textArea, '*', '*', '斜体文本');
            }
        },
        //链接
        'link': {
            className: 'fa-link',
            type: 'left',
            line: true,
            title: '链接 <a> Ctrl+L',
            keyCode: 13,
            click: function (e, obj) { }
        },
        //引用
        'quote': {
            className: 'fa-indent',
            type: 'left',
            title: '引用 <blockquote> Ctrl+Q',
            keyCode: 13,
            click: function (e, obj) { }
        },
        //代码
        'code': {
            className: 'fa-code',
            type: 'left',
            title: '代码 <pre><code> Ctrl+K',
            keyCode: 13,
            click: function (e, obj) { }
        },
        //图片
        'image': {
            //绘制HTML
            className: 'fa-picture-o',
            type: 'left',
            title: '图片 <img> Ctrl+G',
            keyCode: 13,
            click: function (e, obj) { }
        },
        //数字列表
        'olist': {
            className: 'fa-list-ol',
            line: true,
            type: 'left',
            title: '数字列表 <ol> Ctrl+O',
            keyCode: 13,
            click: function (e, obj) { }
        },
        //普通列表
        'ulist': {
            className: 'fa-list-ul',
            type: 'left',
            title: '普通列表 <ul> Ctrl+U',
            keyCode: 13,
            click: function (e, obj) { }
        },
        //标题
        'heading': {
            className: 'fa-header',
            line: true,
            type: 'left',
            title: '标题 <h1>/<h2> Ctrl+H',
            keyCode: 13,
            click: function (e, obj) { }
        },
        //分割线
        'hr': {
            className: 'fa-scissors',
            type: 'left',
            title: '分割线 <hr> Ctrl+R',
            keyCode: 13,
            click: function (e, obj) { }
        },
        //表格
        'table': {
            className: 'fa-table',
            type: 'left',
            title: '表格 <hr> Ctrl+T',
            keyCode: 13,
            click: function (e, obj) { }
        },
        //撤销
        'undo': {
            className: 'fa-undo',
            line: true,
            type: 'left',
            title: '撤销 - Ctrl+Z',
            keyCode: 13,
            click: function (e, obj) { }
        },
        //重做
        'redo': {
            className: 'fa-repeat',
            line: true,
            type: 'left',
            title: '重做 - Ctrl+Y',
            keyCode: 13,
            click: function (e, obj) { }
        },


        // -----------------------右侧

        //帮助说明
        'help': {
            className: 'fa-question-circle',
            type: 'right',
            title: '帮助说明',
            keyCode: 13,
            click: function (e, obj) {
            }
        },
        //预览
        'preview': {
            className: 'fa-file-text-o',
            type: 'right',
            title: '预览',
            keyCode: 13,
            click: function (e, obj) { }
        }
    };


    if (typeof define === "function" && define.amd) {
        //AMD
        define([], function () {
            return Editor;
        });
    }
    if (noGlobal !== true) {
        window.saidEditor = Editor;
    }
    return Editor;
});

