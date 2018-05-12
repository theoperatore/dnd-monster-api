const path = require('path');
const fs = require('fs-extra');
const fastMemoize = require('fast-memoize');

const memoizedReadJson = fastMemoize(fs.readJson.bind(fs));

class Yadb {
  constructor(dirPath) {
    if (!fs.pathExistsSync(dirPath)) {
      throw new Error(`No directory found at path: ${dirPath}`);
    }

    this.dirPath = dirPath;

    // optimize: set this._filelist to null to trigger another
    //           reading of the directory.
    this._filelist = null;

    this._getFileList = this._getFileList.bind(this);
    this.write = this.write.bind(this);
    this.read = this.read.bind(this);
    this.readRange = this.readRange.bind(this);
  }

  _getFileList() {
    if (this._filelist) {
      return Promise.resolve(this._filelist);
    }

    return new Promise((resolve, reject) => {
      fs.readdir(this.dirPath, (err, files) => {
        if (err) {
          return reject(err);
        }

        const sorted = files.sort((a, b) => {
          return a.localeCompare(b, 'en', { numeric: true });
        });

        this._filelist = sorted;
        return resolve(sorted);
      });
    });
  }

  getTotal() {
    return this._getFileList().then(files => files.length);
  }

  write(filename, fileString) {
    const resolvedPath = path.resolve(this.dirPath, filename);
    return fs.writeJson(resolvedPath, fileString, { spaces: 2 })
      .then(() => (this._filelist = null))
      .then(() => true);
  }

  read(filename) {
    const resolvedPath = path.resolve(this.dirPath, filename);
    return memoizedReadJson(resolvedPath);
  }

  // optimize: stress-test the Promise.all. might have to turn it
  //           into a sequence.
  readRange(limit, offset) {
    return this._getFileList()
      .then(files => files.slice(offset, limit + offset))
      .then(files => Promise.all(files.map(this.read)))
  }

  findFirst(filename) {
    return this._getFileList()
      .then(files => files.filter(file => file.match(filename)))
      .then(maybeFiles => maybeFiles.length > 0 ? maybeFiles[0] : null)
      .then(fileOrNull => {
        if (fileOrNull === null) {
          return null;
        }

        return this.read(fileOrNull);
      });
  }

  delete(filename) {
    const resolvedPath = path.resolve(this.dirPath, filename);
    return fs.remove(filename).then(() => true);
  }
}

module.exports = Yadb;
