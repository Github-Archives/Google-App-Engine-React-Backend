// const graphql = require('graphql');

// const {GraphQLObjectType , GraphQLSchema ,GraphQLString ,GraphQLID, GraphQLInt ,GraphQLList , GraphQLNonNull} =graphql;

// const Book  = require('../models/Book')
// const Author  = require('../models/Author')

// const BookType = new GraphQLObjectType({
//     name: 'Book' ,
//     fields: () => ({
//         id: { type: GraphQLID},
//         name: { type: GraphQLString},
//         genre: { type: GraphQLString},
//         author: {
//             type: AuthorType,
//             resolve(parent , args){
//                 return Author.findById(parent.authorId)
//             }
//         }
//     })
// })

// const AuthorType = new GraphQLObjectType({
//     name: 'Author' ,
//     fields: () => ({
//         id: { type: GraphQLID},
//         name: { type: GraphQLString},
//         age: { type: GraphQLInt},
//         books: {
//             type: new GraphQLList(BookType),
//             resolve(parent , args ){
//                 return Book.findById({authorId: parent.id})
//             }
//         }
//     })
// })

const graphql = require('graphql');

const {GraphQLObjectType , GraphQLSchema ,GraphQLString ,GraphQLID, GraphQLInt ,GraphQLList , GraphQLNonNull} =graphql;


const BookType = new GraphQLObjectType({
    name: 'Book' ,
    fields: () => ({
        id: { type: GraphQLID},
        name: { type: GraphQLString},
        genre: { type: GraphQLString}
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        book:{
            type: BookType,
            args:{id:{type: GraphQLID}},
            resolve (parent ,args){
                return Book.findById(args.id) // Replace with your own database query
            }
        },
        books:{
            type: new GraphQLList(BookType),
            args:{id:{type: GraphQLID}},
            resolve (parent ,args){
                return Book.find() // Replace with your own database query
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name:'Mutation',
    fields:{
        addBook: {
            type: BookType,
            args: {
                name: {type : new GraphQLNonNull(GraphQLString)},
                genre: {type : GraphQLString},
            },
            resolve(parent , args){
                const book = new Book({name: args.name , genre: args.genre})
                return book.save(); // replace with your database call
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation:Mutation
})