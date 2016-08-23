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
    var eventNames = 'bold,italic,link,quote,code,image,olist,ulist,heading,hr,table,undo,redo,help'.split(',')

    var Editor = function (elem, options) {
        if (!(this instanceof Editor))
            return new Editor(elem, options);
        this.elem = elem;
        this.textArea = this.elem.querySelector('textarea');
        this.idTemp = 'edit-${key}-button';
        initEditor(this);
    };

    //插件列表
    Editor.plugs = {
        'bold': {
            //绘制HTML
            render: function () {

            },
            reg: /\*{2}[^\*]*\*{2}|_{2}[^\*]*_{2}/g,
            click: function (e, obj) {//obj指向这个bold对象
                var pos = Editor.pos(this.textArea);
                if (pos[0] == pos[1]) {//插入
                    this.insertValue(pos[0], pos[1], '**加粗文本**')
                        .select(pos[0] + 2, pos[0] + 6)
                } else {
                    //有选择文本
                    this.wrapSelect(pos[0], pos[1], '**', '**');
                }
            }
        },
        'undo': {
            click: function () {
                document.execCommand("undo");
            }
        },
        'redo': {
            click: function () {
                document.execCommand("redo");
            }
        }
    };

    //插入一个数值
    Editor.prototype.insertValue = function (start, end, value) {
        var textArea = this.textArea.value,
            startText = textArea.substring(0, end),
            endText = textArea.substring(end);
        this.textArea.value = startText + value + endText;
        //这里也需要检测两边特殊语法

        return this;
    };

    //包装选中的文本
    Editor.prototype.wrapSelect = function (start, end, strLeft, strRight) {
        var textArea = this.textArea.value,
            strLeftLength = strLeft.length,
            strRightLength = strRight.length,
            startText = textArea.substring(0, start),
            endText = textArea.substring(end),
            wrapText = textArea.substring(start, end);
        //检测两边是否包含包装的关键语句，如果有的话则去掉
        if (~startText.lastIndexOf(strLeft) && ~endText.indexOf(strRight)) {
            //去掉关键语法
            startText = startText.substring(0, startText.length - strLeftLength);
            endText = endText.substr(strRightLength);
            this.textArea.value = [startText, wrapText, endText].join('');
            //设置select
            this.select(start - strLeftLength, end - strRightLength);
        } else {
            this.textArea.value = [startText, strLeft, wrapText, strRight, endText].join('');
            this.select(start + strLeftLength, end + strRightLength);
        }
        return this;
    };

    //选中一段文本
    Editor.prototype.select = function (start, end) {
        if (this.textArea.setSelectionRange) {
            this.textArea.focus();
            this.textArea.setSelectionRange(start, end);
        }
        else if (this.textArea.createTextRange) {//IE
            var range = this.textArea.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    };


    Editor.prototype.getId = function (name) {
        return this.idTemp.replace('${key}', name);
    };

    Editor.pos = function (elem, start, end) {
        // Initialize
        var iCaretPos = [0, 0];//start, end

        // IE Support
        if (document.selection) {
            // Set focus on the element
            //elem.focus();//要先focus

            // To get cursor position, get empty selection range
            var oSel = document.selection.createRange();

            // Move selection start to 0 position
            oSel.moveStart('character', -elem.value.length);

            // The caret position is selection length
            iCaretPos = oSel.text.length;//IE这里要后续处理
        }

            //现代浏览器
        else if (elem.selectionStart != null && elem.selectionEnd != null) {
            iCaretPos = [elem.selectionStart, elem.selectionEnd];
        }

        // Return results
        return iCaretPos;

        //这种方法只能获取到HTML的焦点
        //var iCaretPos = 0;
        //var doc = elem.ownerDocument || elem.document;
        //var win = doc.defaultView || doc.parentWindow;
        //var sel;
        //if (typeof win.getSelection != "undefined") {
        //    sel = win.getSelection();
        //    if (sel.rangeCount > 0) {
        //        var range = win.getSelection().getRangeAt(0);
        //        var preCaretRange = range.cloneRange();
        //        preCaretRange.selectNodeContents(elem);
        //        preCaretRange.setEnd(range.endContainer, range.endOffset);
        //        iCaretPos = preCaretRange.toString().length;
        //    }
        //} else if ((sel = doc.selection) && sel.type !== 'Control') {
        //    var textRange = sel.createRange();
        //    var preCaretTextRange = doc.body.createTextRange();
        //    preCaretTextRange.moveToElementText(elem);
        //    preCaretTextRange.setEndPoint('EndToEnd', textRange);
        //    iCaretPos = preCaretTextRange.text.length;
        //}
        return (iCaretPos);
    }



    function initEditor(editor, options) {
        initEvent(editor);
    }


    function initEvent(editor) {
        eventNames.forEach(function (name) {
            if (Editor.plugs[name]) {
                var button = document.getElementById(editor.getId(name)), event = Editor.plugs[name];
                if (button) {
                    button.addEventListener('click', function (e) {
                        editor.textArea.focus();
                        event.click.call(editor, e, event, button);
                    });
                }
            }
        });
    }

    if (typeof define === "function" && define.amd) {
        //AMD
        define("service", [], function () {
            return Service;
        });
        define('promise', [], function () {
            return Service.Promise;
        });
    }
    if (noGlobal !== true) {
        window.saidEditor = Editor;
    }
    return Editor;
});

