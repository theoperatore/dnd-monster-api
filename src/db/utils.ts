import chalk from 'chalk';

export const info = (...args: any[]) => console.log(chalk.blue('[info]'), ...args);
export const error = (...args: any[]) => console.error(chalk.red('[error]'), ...args);
export const success = (...args: any[]) => console.log(chalk.green('[success]'), ...args);
