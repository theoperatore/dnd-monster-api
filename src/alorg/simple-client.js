const { createClient } = require('@theoperatore/alorg-service');
const client = createClient();

client.get('alorg://dnd-monster-api/random').then(console.log);
