'use strict';

class ApiListResponse {
  constructor({ total = 0, count = 0, monsters = [] } = {}) {
    this.count = count;
    this.monsters = monsters;
    this.total = total;
  }
}

module.exports = ApiListResponse;
