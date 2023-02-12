import { PrismaClient, Prisma } from "@prisma/client";export const prisma = new PrismaClient();export type User = Prisma.UserGetPayload<{}>;// let user: User; user.export type UserWithPosts = Prisma.UserGetPayload<{  include: { posts: true };}>;// let userWithPosts: UserWithPosts; userWithPosts.export type Post = Prisma.PostGetPayload<{}>;// let post: Post; post.export type PostWithCategories = Prisma.PostGetPayload<{  include: { categories: true };}>;// let postWithCategories: PostWithCategories; postWithCategories.export type Category = Prisma.CategoryGetPayload<{}>;// let category: Category; category.// ===//// Link: https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety/operating-against-partial-structures-of-model-types//// 1: Define a type that includes the relation to `Post`// const userWithPosts = Prisma.validator<Prisma.UserArgs>()({//   include: { posts: true },// });//// // 2: Define a type that only contains a subset of the scalar fields// const userPersonalData = Prisma.validator<Prisma.UserArgs>()({//   select: { email: true, name: true },// });//// // 3: This type will include a user and all their posts// type UserWithPosts = Prisma.UserGetPayload<typeof userWithPosts>;