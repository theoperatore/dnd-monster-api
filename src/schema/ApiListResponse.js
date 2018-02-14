'use strict';

class ApiListResponse {
  constructor({ count = 0, monsters = [] } = {}) {
    this.count = count;
    this.monsters = monsters;
  }
}

module.exports = ApiListResponse;
