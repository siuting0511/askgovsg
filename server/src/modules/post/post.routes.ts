import { AuthMiddleware } from '../auth/auth.middleware'
import express from 'express'
import { check, param, query } from 'express-validator'
import { PostController } from './post.controller'
import { SortType } from '../../types/sort-type'

export const routePosts = ({
  controller,
  authMiddleware,
}: {
  controller: PostController
  authMiddleware: Public<AuthMiddleware>
}): express.Router => {
  const router = express.Router()
  /**
   * Lists all post
   * @route   GET /api/posts
   * @returns 200 with posts and totalItem for pagination
   * @returns 422 if invalid tags are used in request
   * @returns 500 when database error occurs
   * @access  Public
   */
  router.get('/', controller.listPosts)

  /**
   * Lists all post answerable by the agency user
   * @route   GET /api/posts/answerable
   * @returns 200 with posts and totalItem for pagination
   * @returns 400 if `withAnswers`, `sort` or `tags` query is not given
   * @returns 401 if userID is invalid
   * @returns 500 if invalid tags are used in request
   * @returns 500 when database error occurs
   * @access  Public
   */
  router.get(
    '/answerable',
    [
      query('withAnswers').isBoolean().toBoolean(),
      query('sort').isIn(Object.values(SortType)),
    ],
    controller.listAnswerablePosts,
  )

  /**
   * Get a single post and all the tags, topic and users associated with it
   * @route  GET /api/posts/:id
   * @return 200 with post
   * @return 403 if user does not have permission to access post
   * @return 500 for database error
   * @access Public
   */
  router.get(
    '/:id',
    [
      param('id').isInt().toInt(),
      query('relatedPosts').isInt().toInt().optional({ nullable: true }),
    ],
    controller.getSinglePost,
  )

  /**
   * Create a new post
   * @route  POST /api/posts/
   * @return 200 if post is created
   * @return 400 if title and description is too short or long
   * @return 401 if user is not signed in
   * @return 403 if user does not have permission to add some of the tags
   * @return 500 if database error
   * @access Private
   */
  router.post(
    '/',
    [
      authMiddleware.authenticate,
      check(
        'title',
        'Enter a title with minimum 15 characters and maximum 150 characters',
      ).isLength({
        min: 15,
        max: 150,
      }),
      check('description', 'Enter a description with minimum 30 characters')
        .isLength({
          min: 30,
        })
        .optional({ nullable: true, checkFalsy: true }),
    ],
    controller.createPost,
  )

  /**
   * Delete a post
   * @route  DELETE /api/posts/:id
   * @return 200 if successful
   * @return 401 if user is not logged in
   * @return 403 if user does not have permission to delete post
   * @return 500 if database error
   * @access Private
   */
  router.delete('/:id([0-9]+$)', controller.deletePost)

  /**
   * Update a post
   * @route  PUT /api/posts/:id
   * @return 200 if successful
   * @return 400 if title and description is too short or long
   * @return 401 if user is not logged in
   * @return 403 if user does not have permission to delete post
   * @return 500 if database error
   * @access Private
   */
  router.put('/:id([0-9]+$)', controller.updatePost)

  return router
}
