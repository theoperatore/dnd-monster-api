# D&D 5e Monster Api

A down and dirty, content scraped, Dungeons and Dragons 5th Edition Monster API powered by [GraphQL](). Sorry REST. I got no time for your infuriating multi-request ideology.

## Getting a local server set up

This project requires `node v9.0.0+`. To get that version, it's easiest to use [nvm](https://github.com/creationix/nvm)

```bash
nvm install 9.0.0
nvm use 9.0.0
```

With the source cloned, you'll want to:
- install dependencies
- build the database
- start the server

```bash
# install deps
yarn # or npm install

# build database
yarn build-db # or npm run build-db

# start server on default port 9966
yarn start # or npm start
```

Then you'll be all set to query monsters!

## Querying

With the server running, and `$NODE_ENV !== production`, you'll be able to navigate a browser to [the local graphiql endpont](http://localhost:9966/graphql) and be able to play around with some queries.

Some example queries:

Get 10 monsters starting from the 10th monster in the database (range 10 - 19). Return the `count` of monsters returned and the monster's `name` and `image` properties only.
```
{
  getMonsters(limit: 10, offset: 10) {
    count
    monsters {
      name
      image
    }
  }
}
```

You can also query by "id" or the monster's name with `_` for spaces.
```
{
  getMonsters(id: "adult_white_dragon") {
    monsters {
      name
      armorClass
      challengeRating
    }
  }
}
```

That's the only resource available currently.

# Content Procurement

Shoutout to [Bestiary](https://github.com/chisaipete/bestiary) and [www.aidedd.org](https://www.aidedd.org/regles/monsters/); the former is a very nice website / monster database written in jekyll with each monster being a markdown file. Very easy to read and browse through. The Latter being where I try to scrape images of the monsters.

# License

MIT
