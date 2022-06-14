// const express = require('express');
// const { graphqlHTTP } = require('express-graphql'); // middleware
// const {buildSchema} = require('graphql');


// // GraphQL schema
// var schema = buildSchema(`
//   type Query {
//     message: String
//   }
// `);

// // Root Resolver
// // we can attach a function which is called each time
// // a query from our schema needs to be executed
// root = {
//   message: () => 'Hello World'
// }

// // Create an express server and a GraphQL endpoint
// var app = express();
// app.use('/graphql', graphqlHTTP({
//     schema: schema,
//     rootValue: root,
//     graphiql: true
// }));

// // Start the server
// app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));


// const express = require('express');
// const { graphqlHTTP } = require('express-graphql');
// const app = express();
// const schema = require('./schema/schema')
// app.use(
//     '/graphql',
//     graphqlHTTP({
//         schema,
//         graphiql: true,
//     }),
// );
// app.listen( 4000 , () => {
//     console.log('app is listening at port 4000')
// })

const { ApolloServer, gql } = require('apollo-server')
const axios = require('axios')

const endpoint = "https://finalspaceapi.com/api/v0/character/?limit=2";
const headers = {
	"content-type": "application/json",
    "Authorization": "<token>"
};
const graphqlQuery = {
    "operationName": "fetchAuthor",
    "query": `query fetchAuthor { author { id name } }`,
    "variables": {}
};

const response = axios({
  url: endpoint,
  method: 'post',
  headers: headers,
  data: graphqlQuery
});

console.log('Response', response.data); // data
console.log('Errors', response.errors); // errors if any

// // Axios GET Default
// axios
//   .get("https://finalspaceapi.com/api/v0/character/?limit=2")
//   .then(function (response) {
//     console.log(response);
//   });


// // axios.request(config)
// // axios.get(url[, config])
// // Using the Request Config
// axios
//   .get("https://finalspaceapi.com/api/v0/character/?limit=2", {
//     responseType: "json",
//   })
//   .then(function (response) {
//     console.log(response.data);
//   });

// // Axios with responseType - stream
// // GET request for remote image in node.js
// const fs = require('fs');
// axios({
//     method: 'get',
//     url: 'https://images.unsplash.com/photo-1642291555390-6a149527b1fa',
//     responseType: 'stream'
//   })
//     .then(function (response) {
//         // console.log(response.data.pipe);
//       response.data.pipe(fs.createWriteStream('nature.jpg'))
//     });


// // Using Asyc/Await
//     async function getCharacters() {
//         const { data } = await axios.get(
//           "https://finalspaceapi.com/api/v0/character/?limit=4"
//         );
//         console.log(data);
//       }
//       getCharacters();

// const typeDefs = gql`
//     type User {
//         id: ID
//         # login: String
//         name: String
//         # avatar_url: String
//     }

//     type Query {
//         users: [User]
//     }
// `

// console.log('Hello World!');

// const resolvers = {
//     Query: {
//         users: async () => {
//             try {
//                 // const users = await axios.get('https://api.github.com/users')
//                 const users = await axios.get('https://finalspaceapi.com/api/v0/character/?limit=2')
//                 console.log("FUCKKKKKKKK........................users.data", users.data)
//                 return users.data.map(({ id, name }) => ({
//                     id,
//                     name
//                 }))
//                 // return users.data.map(({ id, login, avatar_url }) => ({
//                 //     id,
//                 //     login,
//                 //     avatar_url 
//                 // }))
//             } catch (error) {
//                 throw error
//             }
//         },
//     },
// }

// const server = new ApolloServer({
//     typeDefs,
//     resolvers,
// })

// server.listen().then(({ url }) => console.log(`Server ready at ${url}`))