export const typeDefs = `
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Mutation {
    register(
      firstName: String!
      lastName: String!
      email: String!
      password: String!
    ): User
    
    login(
      email: String!
      password: String!
    ): AuthPayload
  }

  type Query {
    hello: String
  }
`;