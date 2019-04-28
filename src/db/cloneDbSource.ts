import * as path from 'path';
import del from 'del';
import git from 'simple-git/promise';
import * as utils from './utils';

// main export
export async function cloneDbSource(repoUrl: string, destination = 'rawDb') {
  const pathToRepo = path.resolve(process.cwd(), destination);
  utils.info('cleaning...');
  await del(pathToRepo);
  utils.info('cloning:', repoUrl, '==>', pathToRepo);
  await git().clone(repoUrl, destination);
  return path.resolve(pathToRepo, '_creatures');
}
