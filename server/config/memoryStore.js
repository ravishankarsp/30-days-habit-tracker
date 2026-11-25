// Resilient in-memory fallback store when MongoDB is temporarily unreachable
const memoryStore = {
  challenges: [],
  users: [],
  notifications: []
};

module.exports = memoryStore;
