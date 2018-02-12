'use strict';

const chalk = require('chalk');

exports.info = (...args) => console.log(chalk.blue('[info]'), ...args);
exports.error = (...args) => console.error(chalk.red('[error]'), ...args);
exports.success = (...args) => console.log(chalk.green('[success]'), ...args);
