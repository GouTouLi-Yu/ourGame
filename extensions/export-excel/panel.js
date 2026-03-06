/**
 * 面板逻辑
 */
'use strict';

const path = require('path');
const fs = require('fs');

// 获取 HTML 模板路径
const templatePath = path.join(__dirname, 'panel.html');

exports.template = templatePath;

exports.ready = function() {
    console.log('========== 面板ready函数被调用 ==========');
    console.log('面板对象:', this);
    console.log('面板对象键:', Object.keys(this || {}));
    console.log('HTML模板路径:', templatePath);
    console.log('HTML模板存在:', fs.existsSync(templatePath));
};

exports.close = function() {
    console.log('面板关闭');
};

