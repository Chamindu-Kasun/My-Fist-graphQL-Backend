const express = require("express");
const expressGraphQL = require("express-graphql").graphqlHTTP;
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt
} = require("graphql")
const {authors,books} = require('./data')

const app = express();

const AuthorType = new GraphQLObjectType({
    name:"Author",
    description:"This represents an author of a book",
    fields: () => ({
        id:{type:GraphQLNonNull(GraphQLInt)},
        name:{type:GraphQLNonNull(GraphQLString)},
        books:{
            type:BookType,
            resolve:(author)=>{
                return books.find(book => book.authorId === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name : "Book",
    description : "This represents a book by an author",
    fields : () => ({
        id : {type:GraphQLNonNull(GraphQLInt)},
        name : {type:GraphQLNonNull(GraphQLString)},
        authorId : {type:GraphQLNonNull(GraphQLInt)},
        author : {
            type:AuthorType,
            resolve:(book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name : "Query",
    description : "Root query",
    fields : () => ({
        books: {
            type : new GraphQLList(BookType),
            description : "List of all books",
            resolve : () => books
        },
        authors: {
            type : new GraphQLList(AuthorType),
            description : "List of all Authors",
            resolve : () => authors
        },
        book: {
            type : BookType,
            description : "A single book",
            args : {
                id : {type:GraphQLInt}
            },
            resolve : (parent,args) => books.find(book => book.id === args.id)
        },
        author: {
            type : AuthorType,
            description : "A single author",
            args : {
                id : {type:GraphQLInt}
            },
            resolve : (parent,args) => authors.find(author => author.id === args.id)
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name : "Mutation",
    description : "Root Mutation",
    fields : () => ({
        addBook : {
            type : BookType,
            description : "Add a book",
            args : {
                name : {type:GraphQLNonNull(GraphQLString)},
                authorId : {type:GraphQLNonNull(GraphQLInt)}
            },
            resolve:(parent,args) => {
                const book = {id:books.length+1,name:args.name,authorId: args.authorId};
                books.push(book)
                return book
            }
        },
        addAuthor : {
            type : AuthorType,
            description : "Add an author",
            args : {
                name : {type:GraphQLNonNull(GraphQLString)},
            },
            resolve:(parent,args) => {
                const author = {id:authors.length+1,name:args.name};
                authors.push(author)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query : RootQueryType,
    mutation : RootMutationType
})

//route
app.use("/", expressGraphQL({
    schema : schema,
    graphiql : true
}));

app.listen(5000, () => console.log("Server Running"))