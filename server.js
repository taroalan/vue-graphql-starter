const Koa = require('koa');
const serve = require('koa-static');
const { ApolloServer, gql } = require('apollo-server-koa');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const app = new Koa();

app.use(serve('./public'));

// Fake data
let incrementID = 3;
const BOOKS = [
  {
    id: 1,
    title: 'HTML5 Tutorial',
    author: 'xiaowang',
    date: new Date(2018, 7, 20),
  },
  {
    id: 2,
    title: 'Deep Learning With React',
    author: 'xiaoli',
    date: new Date(2018, 7, 21),
  },
  {
    id: 3,
    title: 'Vue Cookbook',
    author: 'xiaoming',
    date: new Date(2018, 7, 22),
  },
];

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  scalar Date
  type Book {
    id: Int!
    title: String
    author: String
    date: Date
  }
  type Query {
    books: [Book]
    book(id: Int!): Book
  }
  type Mutation {
    addBook(title: String!, author: String!): Book
    updateBook(id: Int!, title: String, author: String): Book
    deleteBook(id: Int!): Book
  }
  schema {
    query: Query
    mutation: Mutation
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    books() {
      return BOOKS;
    },
    book(root, args) {
      return BOOKS.filter(book => book.id === args.id)[0];
    },
  },
  Mutation: {
    addBook(root, args) {
      let newBook = { id: ++incrementID, date: new Date(), ...args };
      // fake add book
      BOOKS.push(newBook);
      return newBook;
    },
    updateBook(root, args) {
      let modifiedBook = {};
      // fake update book
      BOOKS.forEach(book => {
        if (book.id === args.id) {
          Object.assign(book, args);
          modifiedBook = book;
        }
      });
      return modifiedBook;
    },
    deleteBook(root, args) {
      let deletedBook = {};
      BOOKS.forEach((book, i) => {
        if (book.id === args.id) {
          BOOKS.splice(i, 1);
          deletedBook = book;
        }
      });
      return deletedBook;
    },
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return value.getTime();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10);
      }
      return null;
    },
  }),
};

const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

const PORT = process.env.PROT || 4000;
app.listen(PORT, () => console.log(`App running in http://localhost:${PORT}`));
