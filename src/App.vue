<template>
  <div id="app">
    <p>Book Lists</p>
    <template v-if="books.length > 0">
      <ul>
        <li v-for="item in books" :key="item.id">
          {{ `${item.id}-${item.title}` }}, {{ item.author }}
          <button @click="removeBook(item.id)">Remove</button>
        </li>
      </ul>
      <button @click="addBook">Add book</button>
    </template>
    <template v-else>loading...</template>
  </div>
</template>

<script>
import { gql } from 'apollo-boost';

const FETCH_BOOKS = gql`
  query {
    books {
      id
      title
      author
      date
    }
  }
`;

export default {
  name: 'app',
  data() {
    return {
      books: [],
    }
  },
  mounted() {
    this.fetchBooks();
  },
  methods: {
    fetchBooks() {
      this.$apollo.addSmartQuery('books', {
        query: FETCH_BOOKS,
        result: ({ data, loading, networkStatus }) => {
          console.log('Fetch books result:');
          console.log(data, loading, networkStatus);
        },
        error(error) {
          console.log(`Some error happened: ${error.toString()}`)
        }
      });
    },

    async addBook() {
      const ret = await this.$apollo.mutate({
        mutation: gql`mutation ($title: String!,$author: String!) {
          addBook(title: $title, author: $author) {
            id
            title
            author
            date
          }
        }`,
        variables: {
          title: 'New Book',
          author: 'TOM'
        },
        refetchQueries: [{
          query: FETCH_BOOKS
        }]
      })

      // TODO error handlder
      console.log('Add book success:');
      console.log(ret);
    },

    async removeBook(id) {
      const ret = await this.$apollo.mutate({
        mutation: gql`mutation ($id: Int!) {
          deleteBook(id: $id) {
            id
            title
            author
          }
        }`,
        variables: {
          id,
        },
        refetchQueries: [{
          query: FETCH_BOOKS
        }]
      })

      // TODO error handlder
      console.log('Remove book success:');
      console.log(ret);
    }
  },
  // apollo: {
  //   books: FETCH_BOOKS
  // }
}

</script>
