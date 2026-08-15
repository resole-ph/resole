/**
 * OpenAPI path definitions for the Resole API.
 *
 * Keeping these declarations separate prevents route handlers from being
 * obscured by documentation-only comments.
 */

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Create or perform auth change password.
 *     description: Create or perform the auth change password resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 *             example:
 *               message: Password changed successfully
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Create or perform auth forgot password.
 *     description: Create or perform the auth forgot password resource for the current request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 *             example:
 *               message: If an account exists for that email, a password reset link has been sent.
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/auth/reset-password:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Retrieve auth reset password.
 *     description: Retrieve the auth reset password resource for the current request.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: Password reset token to validate.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *               required:
 *                 - valid
 *             example:
 *               valid: true
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *   post:
 *     tags:
 *       - Auth
 *     summary: Create or perform auth reset password.
 *     description: Create or perform the auth reset password resource for the current request.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: Password reset token to validate.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 *             example:
 *               message: Password updated successfully
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/auth/sign-in:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Create or perform auth sign in.
 *     description: Create or perform the auth sign in resource for the current request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     image:
 *                       type: string
 *                   required:
 *                     - id
 *                     - name
 *                     - email
 *                     - image
 *                 sessionToken:
 *                   type: string
 *                 sessionExpiresAt:
 *                   type: string
 *               required:
 *                 - user
 *                 - sessionToken
 *                 - sessionExpiresAt
 *             example:
 *               user:
 *                 id: 550e8400-e29b-41d4-a716-446655440000
 *                 name: Alex Santos
 *                 email: alex@example.com
 *                 image: https://example.com/avatar.jpg
 *               sessionToken: session_token_example
 *               sessionExpiresAt: '2026-09-14T08:00:00.000Z'
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/auth/sign-in/social:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Create or perform auth sign in social.
 *     description: Create or perform the auth sign in social resource for the current request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: integer
 *               idToken:
 *                 type: integer
 *               credential:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     image:
 *                       type: string
 *                   required:
 *                     - id
 *                     - name
 *                     - email
 *                     - image
 *                 sessionToken:
 *                   type: string
 *                 sessionExpiresAt:
 *                   type: string
 *               required:
 *                 - user
 *                 - sessionToken
 *                 - sessionExpiresAt
 *             example:
 *               user:
 *                 id: 550e8400-e29b-41d4-a716-446655440000
 *                 name: Alex Santos
 *                 email: alex@example.com
 *                 image: https://example.com/avatar.jpg
 *               sessionToken: session_token_example
 *               sessionExpiresAt: '2026-09-14T08:00:00.000Z'
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/auth/sign-out:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Create or perform auth sign out.
 *     description: Create or perform the auth sign out resource for the current request.
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 *             example:
 *               message: Signed out successfully
 * /api/auth/sign-up:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Create or perform auth sign up.
 *     description: Create or perform the auth sign up resource for the current request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Resource created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     image:
 *                       type: string
 *                   required:
 *                     - id
 *                     - name
 *                     - email
 *                     - image
 *                 sessionToken:
 *                   type: string
 *                 sessionExpiresAt:
 *                   type: string
 *               required:
 *                 - user
 *                 - sessionToken
 *                 - sessionExpiresAt
 *             example:
 *               user:
 *                 id: 550e8400-e29b-41d4-a716-446655440000
 *                 name: Alex Santos
 *                 email: alex@example.com
 *                 image: https://example.com/avatar.jpg
 *               sessionToken: session_token_example
 *               sessionExpiresAt: '2026-09-14T08:00:00.000Z'
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/cart/items/{id}:
 *   patch:
 *     tags:
 *       - Cart
 *     summary: Update cart items item.
 *     description: Update the cart items item resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cartItem:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     listingId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                   required:
 *                     - id
 *                     - listingId
 *                     - quantity
 *               required:
 *                 - cartItem
 *             example:
 *               cartItem:
 *                 id: 9
 *                 listingId: 42
 *                 quantity: 2
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *   delete:
 *     tags:
 *       - Cart
 *     summary: Delete cart items item.
 *     description: Delete the cart items item resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 *             example:
 *               message: Item successfully removed from cart
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/cart/items:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Create or perform cart items.
 *     description: Create or perform the cart items resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               listingId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cartItem:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     listingId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                   required:
 *                     - id
 *                     - listingId
 *                     - quantity
 *               required:
 *                 - cartItem
 *             example:
 *               cartItem:
 *                 id: 9
 *                 listingId: 42
 *                 quantity: 1
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/cart:
 *   get:
 *     tags:
 *       - Cart
 *     summary: Retrieve cart.
 *     description: Retrieve the cart resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isBuyNow
 *         required: false
 *         description: Return only items selected for immediate checkout.
 *         schema:
 *           type: boolean
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       quantity:
 *                         type: integer
 *                       shoeListing:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           brand:
 *                             type: string
 *                           category:
 *                             type: string
 *                           size:
 *                             type: integer
 *                           condition:
 *                             type: string
 *                           price:
 *                             type: integer
 *                           isAvailable:
 *                             type: boolean
 *                           photos:
 *                             type: array
 *                             items:
 *                               type: string
 *                         required:
 *                           - id
 *                           - name
 *                           - brand
 *                           - category
 *                           - size
 *                           - condition
 *                           - price
 *                           - isAvailable
 *                           - photos
 *                     required:
 *                       - id
 *                       - quantity
 *                       - shoeListing
 *               required:
 *                 - cart
 *             example:
 *               cart:
 *                 - id: 9
 *                   quantity: 1
 *                   shoeListing:
 *                     id: 42
 *                     name: Nike Air Max 90
 *                     brand: Nike
 *                     category: Sneakers
 *                     size: 9
 *                     condition: Like New
 *                     price: 4500
 *                     isAvailable: true
 *                     photos:
 *                       - https://example.com/shoe.jpg
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/charities/drop-off-points:
 *   get:
 *     tags:
 *       - Charities
 *     summary: Retrieve charities drop off points.
 *     description: Retrieve the charities drop off points resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: charityId
 *         required: false
 *         description: Filter drop-off points by charity.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dropOffPoints:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       charityId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       address:
 *                         type: string
 *                     required:
 *                       - id
 *                       - charityId
 *                       - name
 *                       - address
 *               required:
 *                 - dropOffPoints
 *             example:
 *               dropOffPoints:
 *                 - id: 6
 *                   charityId: 3
 *                   name: Makati Donation Center
 *                   address: Makati City, Metro Manila
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/charities:
 *   get:
 *     tags:
 *       - Charities
 *     summary: Retrieve charities.
 *     description: Retrieve the charities resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 charities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                     required:
 *                       - id
 *                       - name
 *                       - description
 *               required:
 *                 - charities
 *             example:
 *               charities:
 *                 - id: 3
 *                   name: Soles for Hope
 *                   description: Donates footwear to communities in need.
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/checkout:
 *   post:
 *     tags:
 *       - Checkout
 *     summary: Create or perform checkout.
 *     description: Create or perform the checkout resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: integer
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       shoeListingId:
 *                         type: integer
 *                       buyerId:
 *                         type: string
 *                       total:
 *                         type: integer
 *                     required:
 *                       - id
 *                       - type
 *                       - status
 *                       - shoeListingId
 *                       - buyerId
 *                       - total
 *               required:
 *                 - success
 *                 - total
 *                 - transactions
 *             example:
 *               success: true
 *               total: 4500
 *               transactions:
 *                 - id: 81
 *                   type: sale
 *                   status: pending
 *                   shoeListingId: 42
 *                   buyerId: 550e8400-e29b-41d4-a716-446655440000
 *                   total: 4500
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/conversations/{id}/messages:
 *   post:
 *     tags:
 *       - Conversations
 *     summary: Create or perform conversations item messages.
 *     description: Create or perform the conversations item messages resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     conversationId:
 *                       type: integer
 *                     senderId:
 *                       type: string
 *                     content:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                   required:
 *                     - id
 *                     - conversationId
 *                     - senderId
 *                     - content
 *                     - createdAt
 *               required:
 *                 - message
 *             example:
 *               message:
 *                 id: 16
 *                 conversationId: 7
 *                 senderId: 550e8400-e29b-41d4-a716-446655440000
 *                 content: Is this still available?
 *                 createdAt: '2026-08-15T08:00:00.000Z'
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/conversations/{id}/photos:
 *   post:
 *     tags:
 *       - Conversations
 *     summary: Create or perform conversations item photos.
 *     description: Create or perform the conversations item photos resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     conversationId:
 *                       type: integer
 *                     senderId:
 *                       type: string
 *                     content:
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                     attachment:
 *                       type: object
 *                       properties:
 *                         path:
 *                           type: string
 *                         url:
 *                           type: string
 *                       required:
 *                         - path
 *                         - url
 *                   required:
 *                     - id
 *                     - conversationId
 *                     - senderId
 *                     - content
 *                     - createdAt
 *                     - attachment
 *               required:
 *                 - message
 *             example:
 *               message:
 *                 id: 16
 *                 conversationId: 7
 *                 senderId: 550e8400-e29b-41d4-a716-446655440000
 *                 content: null
 *                 createdAt: '2026-08-15T08:00:00.000Z'
 *                 attachment:
 *                   path: inbox/photo.jpg
 *                   url: https://example.com/signed-photo.jpg
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '403':
 *         description: The caller is not allowed to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               error: Forbidden
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/conversations/{id}:
 *   get:
 *     tags:
 *       - Conversations
 *     summary: Retrieve conversations item.
 *     description: Retrieve the conversations item resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       conversationId:
 *                         type: integer
 *                       senderId:
 *                         type: string
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                     required:
 *                       - id
 *                       - conversationId
 *                       - senderId
 *                       - content
 *                       - createdAt
 *                 offers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       shoeListingId:
 *                         type: integer
 *                       buyerId:
 *                         type: string
 *                       total:
 *                         type: integer
 *                     required:
 *                       - id
 *                       - type
 *                       - status
 *                       - shoeListingId
 *                       - buyerId
 *                       - total
 *                 offerExtras:
 *                   type: object
 *                   properties:
 *                     ratedTransactionIds:
 *                       type: array
 *                       items: {}
 *                     listings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           brand:
 *                             type: string
 *                           category:
 *                             type: string
 *                           size:
 *                             type: integer
 *                           condition:
 *                             type: string
 *                           price:
 *                             type: integer
 *                           isAvailable:
 *                             type: boolean
 *                           photos:
 *                             type: array
 *                             items:
 *                               type: string
 *                         required:
 *                           - id
 *                           - name
 *                           - brand
 *                           - category
 *                           - size
 *                           - condition
 *                           - price
 *                           - isAvailable
 *                           - photos
 *                   required:
 *                     - ratedTransactionIds
 *                     - listings
 *               required:
 *                 - messages
 *                 - offers
 *                 - offerExtras
 *             example:
 *               messages:
 *                 - id: 16
 *                   conversationId: 7
 *                   senderId: 550e8400-e29b-41d4-a716-446655440000
 *                   content: Is this still available?
 *                   createdAt: '2026-08-15T08:00:00.000Z'
 *               offers:
 *                 - id: 81
 *                   type: sale
 *                   status: pending
 *                   shoeListingId: 42
 *                   buyerId: 550e8400-e29b-41d4-a716-446655440000
 *                   total: 4500
 *               offerExtras:
 *                 ratedTransactionIds: []
 *                 listings:
 *                   - id: 42
 *                     name: Nike Air Max 90
 *                     brand: Nike
 *                     category: Sneakers
 *                     size: 9
 *                     condition: Like New
 *                     price: 4500
 *                     isAvailable: true
 *                     photos:
 *                       - https://example.com/shoe.jpg
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/conversations:
 *   post:
 *     tags:
 *       - Conversations
 *     summary: Create or perform conversations.
 *     description: Create or perform the conversations resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId:
 *                 type: integer
 *               listingId:
 *                 type: integer
 *               message:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     participantIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                   required:
 *                     - id
 *                     - participantIds
 *                 message:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     conversationId:
 *                       type: integer
 *                     senderId:
 *                       type: string
 *                     content:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                   required:
 *                     - id
 *                     - conversationId
 *                     - senderId
 *                     - content
 *                     - createdAt
 *               required:
 *                 - conversation
 *                 - message
 *             example:
 *               conversation:
 *                 id: 7
 *                 participantIds:
 *                   - 550e8400-e29b-41d4-a716-446655440000
 *                   - b10c7d9e-1db8-4ca1-aefa-212e40870e67
 *               message:
 *                 id: 16
 *                 conversationId: 7
 *                 senderId: 550e8400-e29b-41d4-a716-446655440000
 *                 content: Is this still available?
 *                 createdAt: '2026-08-15T08:00:00.000Z'
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 *   get:
 *     tags:
 *       - Conversations
 *     summary: Retrieve conversations.
 *     description: Retrieve the conversations resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       otherUser:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           image:
 *                             type: string
 *                         required:
 *                           - id
 *                           - name
 *                           - email
 *                           - image
 *                       lastMessage:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           conversationId:
 *                             type: integer
 *                           senderId:
 *                             type: string
 *                           content:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                         required:
 *                           - id
 *                           - conversationId
 *                           - senderId
 *                           - content
 *                           - createdAt
 *                       unreadCount:
 *                         type: integer
 *                     required:
 *                       - id
 *                       - otherUser
 *                       - lastMessage
 *                       - unreadCount
 *               required:
 *                 - conversations
 *             example:
 *               conversations:
 *                 - id: 7
 *                   otherUser:
 *                     id: 550e8400-e29b-41d4-a716-446655440000
 *                     name: Alex Santos
 *                     email: alex@example.com
 *                     image: https://example.com/avatar.jpg
 *                   lastMessage:
 *                     id: 16
 *                     conversationId: 7
 *                     senderId: 550e8400-e29b-41d4-a716-446655440000
 *                     content: Is this still available?
 *                     createdAt: '2026-08-15T08:00:00.000Z'
 *                   unreadCount: 1
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/donations/pickups:
 *   post:
 *     tags:
 *       - Donations
 *     summary: Create or perform donations pickups.
 *     description: Create or perform the donations pickups resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               listingId:
 *                 type: integer
 *               charityId:
 *                 type: integer
 *               pickupAddress:
 *                 type: string
 *               pickupDate:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 donationPickup:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     listingId:
 *                       type: integer
 *                     charityId:
 *                       type: integer
 *                     pickupAddress:
 *                       type: string
 *                     pickupDate:
 *                       type: string
 *                     status:
 *                       type: string
 *                   required:
 *                     - id
 *                     - listingId
 *                     - charityId
 *                     - pickupAddress
 *                     - pickupDate
 *                     - status
 *               required:
 *                 - donationPickup
 *             example:
 *               donationPickup:
 *                 id: 18
 *                 listingId: 42
 *                 charityId: 3
 *                 pickupAddress: 123 Rizal Street, Manila
 *                 pickupDate: '2026-08-20T09:00:00.000Z'
 *                 status: scheduled
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/listings/{id}/archive:
 *   post:
 *     tags:
 *       - Listings
 *     summary: Create or perform listings item archive.
 *     description: Create or perform the listings item archive resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     brand:
 *                       type: string
 *                     category:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     condition:
 *                       type: string
 *                     price:
 *                       type: integer
 *                     isAvailable:
 *                       type: boolean
 *                     photos:
 *                       type: array
 *                       items:
 *                         type: string
 *                   required:
 *                     - id
 *                     - name
 *                     - brand
 *                     - category
 *                     - size
 *                     - condition
 *                     - price
 *                     - isAvailable
 *                     - photos
 *               required:
 *                 - message
 *             example:
 *               message:
 *                 id: 42
 *                 name: Nike Air Max 90
 *                 brand: Nike
 *                 category: Sneakers
 *                 size: 9
 *                 condition: Like New
 *                 price: 4500
 *                 isAvailable: false
 *                 photos:
 *                   - https://example.com/shoe.jpg
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '403':
 *         description: The caller is not allowed to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               error: Forbidden
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/listings/{id}/donate:
 *   post:
 *     tags:
 *       - Listings
 *     summary: Create or perform listings item donate.
 *     description: Create or perform the listings item donate resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               charityId:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 donation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     listingId:
 *                       type: integer
 *                     charityId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                   required:
 *                     - id
 *                     - listingId
 *                     - charityId
 *                     - status
 *               required:
 *                 - donation
 *             example:
 *               donation:
 *                 id: 31
 *                 listingId: 42
 *                 charityId: 3
 *                 status: pending
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '403':
 *         description: The caller is not allowed to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               error: Forbidden
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/listings/{id}/offer:
 *   get:
 *     tags:
 *       - Listings
 *     summary: Retrieve listings item offer.
 *     description: Retrieve the listings item offer resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offer:
 *                   type: object
 *                   properties:
 *                     conversationId:
 *                       type: integer
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         type:
 *                           type: string
 *                         status:
 *                           type: string
 *                         shoeListingId:
 *                           type: integer
 *                         buyerId:
 *                           type: string
 *                         total:
 *                           type: integer
 *                       required:
 *                         - id
 *                         - type
 *                         - status
 *                         - shoeListingId
 *                         - buyerId
 *                         - total
 *                   required:
 *                     - conversationId
 *                     - transaction
 *               required:
 *                 - offer
 *             example:
 *               offer:
 *                 conversationId: 7
 *                 transaction:
 *                   id: 81
 *                   type: sale
 *                   status: pending
 *                   shoeListingId: 42
 *                   buyerId: 550e8400-e29b-41d4-a716-446655440000
 *                   total: 4500
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/listings/{id}/offers:
 *   get:
 *     tags:
 *       - Listings
 *     summary: Retrieve listings item offers.
 *     description: Retrieve the listings item offers resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       shoeListingId:
 *                         type: integer
 *                       buyerId:
 *                         type: string
 *                       total:
 *                         type: integer
 *                     required:
 *                       - id
 *                       - type
 *                       - status
 *                       - shoeListingId
 *                       - buyerId
 *                       - total
 *               required:
 *                 - offers
 *             example:
 *               offers:
 *                 - id: 81
 *                   type: sale
 *                   status: pending
 *                   shoeListingId: 42
 *                   buyerId: 550e8400-e29b-41d4-a716-446655440000
 *                   total: 4500
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '403':
 *         description: The caller is not allowed to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               error: Forbidden
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/listings/{id}:
 *   get:
 *     tags:
 *       - Listings
 *     summary: Retrieve listings item.
 *     description: Retrieve the listings item resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: view
 *         required: false
 *         description: Record a listing view when true.
 *         schema:
 *           type: boolean
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shoeListing:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     brand:
 *                       type: string
 *                     category:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     condition:
 *                       type: string
 *                     price:
 *                       type: integer
 *                     isAvailable:
 *                       type: boolean
 *                     photos:
 *                       type: array
 *                       items:
 *                         type: string
 *                   required:
 *                     - id
 *                     - name
 *                     - brand
 *                     - category
 *                     - size
 *                     - condition
 *                     - price
 *                     - isAvailable
 *                     - photos
 *               required:
 *                 - shoeListing
 *             example:
 *               shoeListing:
 *                 id: 42
 *                 name: Nike Air Max 90
 *                 brand: Nike
 *                 category: Sneakers
 *                 size: 9
 *                 condition: Like New
 *                 price: 4500
 *                 isAvailable: true
 *                 photos:
 *                   - https://example.com/shoe.jpg
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '403':
 *         description: The caller is not allowed to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               error: Forbidden
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 *   patch:
 *     tags:
 *       - Listings
 *     summary: Update listings item.
 *     description: Update the listings item resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: view
 *         required: false
 *         description: Record a listing view when true.
 *         schema:
 *           type: boolean
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shoeListing:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     brand:
 *                       type: string
 *                     category:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     condition:
 *                       type: string
 *                     price:
 *                       type: integer
 *                     isAvailable:
 *                       type: boolean
 *                     photos:
 *                       type: array
 *                       items:
 *                         type: string
 *                   required:
 *                     - id
 *                     - name
 *                     - brand
 *                     - category
 *                     - size
 *                     - condition
 *                     - price
 *                     - isAvailable
 *                     - photos
 *               required:
 *                 - shoeListing
 *             example:
 *               shoeListing:
 *                 id: 42
 *                 name: Nike Air Max 90
 *                 brand: Nike
 *                 category: Sneakers
 *                 size: 9
 *                 condition: Like New
 *                 price: 4250
 *                 isAvailable: true
 *                 photos:
 *                   - https://example.com/shoe.jpg
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '403':
 *         description: The caller is not allowed to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               error: Forbidden
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 *   delete:
 *     tags:
 *       - Listings
 *     summary: Delete listings item.
 *     description: Delete the listings item resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: view
 *         required: false
 *         description: Record a listing view when true.
 *         schema:
 *           type: boolean
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     brand:
 *                       type: string
 *                     category:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     condition:
 *                       type: string
 *                     price:
 *                       type: integer
 *                     isAvailable:
 *                       type: boolean
 *                     photos:
 *                       type: array
 *                       items:
 *                         type: string
 *                   required:
 *                     - id
 *                     - name
 *                     - brand
 *                     - category
 *                     - size
 *                     - condition
 *                     - price
 *                     - isAvailable
 *                     - photos
 *               required:
 *                 - message
 *             example:
 *               message:
 *                 id: 42
 *                 name: Nike Air Max 90
 *                 brand: Nike
 *                 category: Sneakers
 *                 size: 9
 *                 condition: Like New
 *                 price: 4500
 *                 isAvailable: false
 *                 photos:
 *                   - https://example.com/shoe.jpg
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '403':
 *         description: The caller is not allowed to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               error: Forbidden
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/listings/{id}/sale-offers:
 *   post:
 *     tags:
 *       - Listings
 *     summary: Create or perform listings item sale offers.
 *     description: Create or perform the listings item sale offers resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactionDetails:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     type:
 *                       type: string
 *                     status:
 *                       type: string
 *                     shoeListingId:
 *                       type: integer
 *                     buyerId:
 *                       type: string
 *                     total:
 *                       type: integer
 *                   required:
 *                     - id
 *                     - type
 *                     - status
 *                     - shoeListingId
 *                     - buyerId
 *                     - total
 *                 swapDetails:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     transactionId:
 *                       type: integer
 *                     amount:
 *                       type: integer
 *                   required:
 *                     - id
 *                     - transactionId
 *                     - amount
 *               required:
 *                 - transactionDetails
 *                 - swapDetails
 *             example:
 *               transactionDetails:
 *                 id: 81
 *                 type: sale
 *                 status: pending
 *                 shoeListingId: 42
 *                 buyerId: 550e8400-e29b-41d4-a716-446655440000
 *                 total: 4500
 *               swapDetails:
 *                 id: 11
 *                 transactionId: 81
 *                 amount: 4500
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/listings/{id}/save:
 *   post:
 *     tags:
 *       - Listings
 *     summary: Create or perform listings item save.
 *     description: Create or perform the listings item save resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favourites:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       brand:
 *                         type: string
 *                       category:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       condition:
 *                         type: string
 *                       price:
 *                         type: integer
 *                       isAvailable:
 *                         type: boolean
 *                       photos:
 *                         type: array
 *                         items:
 *                           type: string
 *                     required:
 *                       - id
 *                       - name
 *                       - brand
 *                       - category
 *                       - size
 *                       - condition
 *                       - price
 *                       - isAvailable
 *                       - photos
 *               required:
 *                 - favourites
 *             example:
 *               favourites:
 *                 - id: 42
 *                   name: Nike Air Max 90
 *                   brand: Nike
 *                   category: Sneakers
 *                   size: 9
 *                   condition: Like New
 *                   price: 4500
 *                   isAvailable: true
 *                   photos:
 *                     - https://example.com/shoe.jpg
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 *   delete:
 *     tags:
 *       - Listings
 *     summary: Delete listings item save.
 *     description: Delete the listings item save resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favourites:
 *                   type: array
 *                   items: {}
 *               required:
 *                 - favourites
 *             example:
 *               favourites: []
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/listings/{id}/swap-offers:
 *   post:
 *     tags:
 *       - Listings
 *     summary: Create or perform listings item swap offers.
 *     description: Create or perform the listings item swap offers resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               listingIds:
 *                 type: integer
 *                 items:
 *                   type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactionDetails:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     type:
 *                       type: string
 *                     status:
 *                       type: string
 *                     shoeListingId:
 *                       type: integer
 *                     buyerId:
 *                       type: string
 *                     total:
 *                       type: integer
 *                   required:
 *                     - id
 *                     - type
 *                     - status
 *                     - shoeListingId
 *                     - buyerId
 *                     - total
 *                 swapDetails:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     transactionId:
 *                       type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           itemId:
 *                             type: integer
 *                           shoeListing:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               brand:
 *                                 type: string
 *                               category:
 *                                 type: string
 *                               size:
 *                                 type: integer
 *                               condition:
 *                                 type: string
 *                               price:
 *                                 type: integer
 *                               isAvailable:
 *                                 type: boolean
 *                               photos:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                             required:
 *                               - id
 *                               - name
 *                               - brand
 *                               - category
 *                               - size
 *                               - condition
 *                               - price
 *                               - isAvailable
 *                               - photos
 *                         required:
 *                           - itemId
 *                           - shoeListing
 *                   required:
 *                     - id
 *                     - transactionId
 *                     - items
 *               required:
 *                 - transactionDetails
 *                 - swapDetails
 *             example:
 *               transactionDetails:
 *                 id: 81
 *                 type: swap
 *                 status: pending
 *                 shoeListingId: 42
 *                 buyerId: 550e8400-e29b-41d4-a716-446655440000
 *                 total: 4500
 *               swapDetails:
 *                 id: 14
 *                 transactionId: 81
 *                 items:
 *                   - itemId: 44
 *                     shoeListing:
 *                       id: 42
 *                       name: Nike Air Max 90
 *                       brand: Nike
 *                       category: Sneakers
 *                       size: 9
 *                       condition: Like New
 *                       price: 4500
 *                       isAvailable: true
 *                       photos:
 *                         - https://example.com/shoe.jpg
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/listings/analyze:
 *   post:
 *     tags:
 *       - Listings
 *     summary: Create or perform listings analyze.
 *     description: Create or perform the listings analyze resource for the current request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     brand:
 *                       type: string
 *                     model:
 *                       type: string
 *                     category:
 *                       type: string
 *                     condition:
 *                       type: string
 *                     estimatedPrice:
 *                       type: integer
 *                     confidence:
 *                       type: number
 *                       format: float
 *                   required:
 *                     - brand
 *                     - model
 *                     - category
 *                     - condition
 *                     - estimatedPrice
 *                     - confidence
 *                 analysisId:
 *                   type: integer
 *               required:
 *                 - analysis
 *                 - analysisId
 *             example:
 *               analysis:
 *                 brand: Nike
 *                 model: Air Max 90
 *                 category: Sneakers
 *                 condition: Like New
 *                 estimatedPrice: 4500
 *                 confidence: 0.92
 *               analysisId: 73
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/listings/brands:
 *   get:
 *     tags:
 *       - Listings
 *     summary: Retrieve listings brands.
 *     description: Retrieve the listings brands resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 brands:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                     required:
 *                       - id
 *                       - name
 *               required:
 *                 - brands
 *             example:
 *               brands:
 *                 - id: 1
 *                   name: Nike
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/listings/categories:
 *   get:
 *     tags:
 *       - Listings
 *     summary: Retrieve listings categories.
 *     description: Retrieve the listings categories resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shoeCategories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                     required:
 *                       - id
 *                       - name
 *               required:
 *                 - shoeCategories
 *             example:
 *               shoeCategories:
 *                 - id: 2
 *                   name: Sneakers
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/listings/photos:
 *   post:
 *     tags:
 *       - Listings
 *     summary: Create or perform listings photos.
 *     description: Create or perform the listings photos resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *             example:
 *               - https://example.com/listings/photo-1.jpg
 *               - https://example.com/listings/photo-2.jpg
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '413':
 *         description: The uploaded content is too large.
 *         content:
 *           application/json:
 *             example:
 *               error: Uploaded content is too large
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/listings:
 *   get:
 *     tags:
 *       - Listings
 *     summary: Retrieve listings.
 *     description: Retrieve the listings resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: section
 *         required: false
 *         description: Marketplace section to return.
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         required: false
 *         description: Filter by category.
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         required: false
 *         description: Filter by brand.
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         required: false
 *         description: Search term for listings.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shoeListings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       brand:
 *                         type: string
 *                       category:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       condition:
 *                         type: string
 *                       price:
 *                         type: integer
 *                       isAvailable:
 *                         type: boolean
 *                       photos:
 *                         type: array
 *                         items:
 *                           type: string
 *                     required:
 *                       - id
 *                       - name
 *                       - brand
 *                       - category
 *                       - size
 *                       - condition
 *                       - price
 *                       - isAvailable
 *                       - photos
 *               required:
 *                 - shoeListings
 *             example:
 *               shoeListings:
 *                 - id: 42
 *                   name: Nike Air Max 90
 *                   brand: Nike
 *                   category: Sneakers
 *                   size: 9
 *                   condition: Like New
 *                   price: 4500
 *                   isAvailable: true
 *                   photos:
 *                     - https://example.com/shoe.jpg
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *   post:
 *     tags:
 *       - Listings
 *     summary: Create or perform listings.
 *     description: Create or perform the listings resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: section
 *         required: false
 *         description: Marketplace section to return.
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         required: false
 *         description: Filter by category.
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         required: false
 *         description: Filter by brand.
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         required: false
 *         description: Search term for listings.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 listingId:
 *                   type: integer
 *                 listingUrl:
 *                   type: string
 *               required:
 *                 - listingId
 *                 - listingUrl
 *             example:
 *               listingId: 42
 *               listingUrl: /listing/42
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/listings/search:
 *   get:
 *     tags:
 *       - Listings
 *     summary: Retrieve listings search.
 *     description: Retrieve the listings search resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: Search term of at least three characters.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shoeSearch:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       brand:
 *                         type: string
 *                       category:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       condition:
 *                         type: string
 *                       price:
 *                         type: integer
 *                       isAvailable:
 *                         type: boolean
 *                       photos:
 *                         type: array
 *                         items:
 *                           type: string
 *                     required:
 *                       - id
 *                       - name
 *                       - brand
 *                       - category
 *                       - size
 *                       - condition
 *                       - price
 *                       - isAvailable
 *                       - photos
 *               required:
 *                 - shoeSearch
 *             example:
 *               shoeSearch:
 *                 - id: 42
 *                   name: Nike Air Max 90
 *                   brand: Nike
 *                   category: Sneakers
 *                   size: 9
 *                   condition: Like New
 *                   price: 4500
 *                   isAvailable: true
 *                   photos:
 *                     - https://example.com/shoe.jpg
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/notifications/{id}/read:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Create or perform notifications item read.
 *     description: Create or perform the notifications item read resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notification:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     message:
 *                       type: string
 *                     isRead:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                   required:
 *                     - id
 *                     - title
 *                     - message
 *                     - isRead
 *                     - createdAt
 *               required:
 *                 - notification
 *             example:
 *               notification:
 *                 id: 12
 *                 title: Offer received
 *                 message: You received a new offer.
 *                 isRead: true
 *                 createdAt: '2026-08-15T08:00:00.000Z'
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/notifications/read-all:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Create or perform notifications read all.
 *     description: Create or perform the notifications read all resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updatedCount:
 *                   type: integer
 *               required:
 *                 - updatedCount
 *             example:
 *               updatedCount: 4
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/notifications/register-device:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Create or perform notifications register device.
 *     description: Create or perform the notifications register device resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expoPushToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 device:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: string
 *                     expoPushToken:
 *                       type: string
 *                   required:
 *                     - id
 *                     - userId
 *                     - expoPushToken
 *               required:
 *                 - device
 *             example:
 *               device:
 *                 id: 8
 *                 userId: 550e8400-e29b-41d4-a716-446655440000
 *                 expoPushToken: ExponentPushToken[example]
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Retrieve notifications.
 *     description: Retrieve the notifications resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       message:
 *                         type: string
 *                       isRead:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                     required:
 *                       - id
 *                       - title
 *                       - message
 *                       - isRead
 *                       - createdAt
 *                 unreadCount:
 *                   type: integer
 *               required:
 *                 - notifications
 *                 - unreadCount
 *             example:
 *               notifications:
 *                 - id: 12
 *                   title: Offer received
 *                   message: You received a new offer.
 *                   isRead: false
 *                   createdAt: '2026-08-15T08:00:00.000Z'
 *               unreadCount: 1
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/offers/{id}/accept:
 *   post:
 *     tags:
 *       - Offers
 *     summary: Create or perform offers item accept.
 *     description: Create or perform the offers item accept resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 *             example:
 *               message: Offer accepted successfully
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/offers/{id}/decline:
 *   post:
 *     tags:
 *       - Offers
 *     summary: Create or perform offers item decline.
 *     description: Create or perform the offers item decline resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 *             example:
 *               message: Offer declined successfully
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/offers/{id}:
 *   patch:
 *     tags:
 *       - Offers
 *     summary: Update offers item.
 *     description: Update the offers item resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 details:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         type:
 *                           type: string
 *                         status:
 *                           type: string
 *                         shoeListingId:
 *                           type: integer
 *                         buyerId:
 *                           type: string
 *                         total:
 *                           type: integer
 *                       required:
 *                         - id
 *                         - type
 *                         - status
 *                         - shoeListingId
 *                         - buyerId
 *                         - total
 *                     sale:
 *                       type: object
 *                       properties:
 *                         amount:
 *                           type: integer
 *                       required:
 *                         - amount
 *                   required:
 *                     - transaction
 *                     - sale
 *               required:
 *                 - message
 *                 - details
 *             example:
 *               message: Offer updated successfully
 *               details:
 *                 transaction:
 *                   id: 81
 *                   type: sale
 *                   status: pending
 *                   shoeListingId: 42
 *                   buyerId: 550e8400-e29b-41d4-a716-446655440000
 *                   total: 4500
 *                 sale:
 *                   amount: 4200
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '403':
 *         description: The caller is not allowed to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               error: Forbidden
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/orders/{id}/tracking:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Retrieve orders item tracking.
 *     description: Retrieve the orders item tracking resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tracking:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                       label:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       completed:
 *                         type: boolean
 *                     required:
 *                       - status
 *                       - label
 *                       - timestamp
 *                       - completed
 *               required:
 *                 - tracking
 *             example:
 *               tracking:
 *                 - status: confirmed
 *                   label: Order confirmed
 *                   timestamp: '2026-08-15T08:00:00.000Z'
 *                   completed: true
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Retrieve orders.
 *     description: Retrieve the orders resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       shoeListingId:
 *                         type: integer
 *                       buyerId:
 *                         type: string
 *                       total:
 *                         type: integer
 *                     required:
 *                       - id
 *                       - type
 *                       - status
 *                       - shoeListingId
 *                       - buyerId
 *                       - total
 *               required:
 *                 - transactions
 *             example:
 *               transactions:
 *                 - id: 81
 *                   type: sale
 *                   status: pending
 *                   shoeListingId: 42
 *                   buyerId: 550e8400-e29b-41d4-a716-446655440000
 *                   total: 4500
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/promotions:
 *   get:
 *     tags:
 *       - Promotions
 *     summary: Retrieve promotions.
 *     description: Retrieve the promotions resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vouchers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       code:
 *                         type: string
 *                       discount:
 *                         type: integer
 *                       coinCost:
 *                         type: integer
 *                       isActive:
 *                         type: boolean
 *                     required:
 *                       - id
 *                       - code
 *                       - discount
 *                       - coinCost
 *                       - isActive
 *               required:
 *                 - vouchers
 *             example:
 *               vouchers:
 *                 - id: 10
 *                   code: RESOLE100
 *                   discount: 100
 *                   coinCost: 500
 *                   isActive: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/redemptions:
 *   post:
 *     tags:
 *       - Redemptions
 *     summary: Create or perform redemptions.
 *     description: Create or perform the redemptions resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               saleId:
 *                 type: integer
 *               voucherId:
 *                 type: integer
 *               coinsRedeemed:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 redemption:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     voucherId:
 *                       type: integer
 *                     coinsRedeemed:
 *                       type: integer
 *                     status:
 *                       type: string
 *                   required:
 *                     - id
 *                     - voucherId
 *                     - coinsRedeemed
 *                     - status
 *                 wallet:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: string
 *                     balance:
 *                       type: integer
 *                     updatedAt:
 *                       type: string
 *                   required:
 *                     - id
 *                     - userId
 *                     - balance
 *                     - updatedAt
 *               required:
 *                 - redemption
 *                 - wallet
 *             example:
 *               redemption:
 *                 id: 21
 *                 voucherId: 10
 *                 coinsRedeemed: 500
 *                 status: completed
 *               wallet:
 *                 id: 5
 *                 userId: 550e8400-e29b-41d4-a716-446655440000
 *                 balance: 700
 *                 updatedAt: '2026-08-15T08:00:00.000Z'
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/rewards/redeem-options:
 *   get:
 *     tags:
 *       - Rewards
 *     summary: Retrieve rewards redeem options.
 *     description: Retrieve the rewards redeem options resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 redeemOptions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       title:
 *                         type: string
 *                       coinCost:
 *                         type: integer
 *                     required:
 *                       - id
 *                       - type
 *                       - title
 *                       - coinCost
 *               required:
 *                 - redeemOptions
 *             example:
 *               redeemOptions:
 *                 - id: 10
 *                   type: voucher
 *                   title: PHP 100 voucher
 *                   coinCost: 500
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/scrape:
 *   post:
 *     tags:
 *       - Scrape
 *     summary: Create or perform scrape.
 *     description: Create or perform the scrape resource for the current request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 *             example:
 *               message: men sneakers shoe scraping successful
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/search/suggestions:
 *   get:
 *     tags:
 *       - Search
 *     summary: Retrieve search suggestions.
 *     description: Retrieve the search suggestions resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: Partial search text.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shoes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       image:
 *                         type: string
 *                     required:
 *                       - id
 *                       - name
 *                       - image
 *                 people:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       image:
 *                         type: string
 *                     required:
 *                       - id
 *                       - name
 *                       - image
 *               required:
 *                 - shoes
 *                 - people
 *             example:
 *               shoes:
 *                 - id: 42
 *                   name: Nike Air Max 90
 *                   image: https://example.com/shoe.jpg
 *               people:
 *                 - id: 550e8400-e29b-41d4-a716-446655440000
 *                   name: Alex Santos
 *                   image: https://example.com/avatar.jpg
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/support/tickets:
 *   post:
 *     tags:
 *       - Support
 *     summary: Create or perform support tickets.
 *     description: Create or perform the support tickets resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     transactionId:
 *                       type: integer
 *                     subject:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                   required:
 *                     - id
 *                     - transactionId
 *                     - subject
 *                     - description
 *                     - status
 *                     - createdAt
 *               required:
 *                 - ticket
 *             example:
 *               ticket:
 *                 id: 24
 *                 transactionId: 81
 *                 subject: Item issue
 *                 description: The received item differs from its listing.
 *                 status: open
 *                 createdAt: '2026-08-15T08:00:00.000Z'
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/transactions/{id}/dispute:
 *   post:
 *     tags:
 *       - Transactions
 *     summary: Create or perform transactions item dispute.
 *     description: Create or perform the transactions item dispute resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '201':
 *         description: Resource created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dispute:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     transactionId:
 *                       type: integer
 *                     subject:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                   required:
 *                     - id
 *                     - transactionId
 *                     - subject
 *                     - description
 *                     - status
 *                     - createdAt
 *               required:
 *                 - dispute
 *             example:
 *               dispute:
 *                 id: 24
 *                 transactionId: 81
 *                 subject: Item issue
 *                 description: The received item differs from its listing.
 *                 status: open
 *                 createdAt: '2026-08-15T08:00:00.000Z'
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '403':
 *         description: The caller is not allowed to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               error: Forbidden
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/transactions/{id}/rating:
 *   post:
 *     tags:
 *       - Transactions
 *     summary: Create or perform transactions item rating.
 *     description: Create or perform the transactions item rating resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *               comment:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rating:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     transactionId:
 *                       type: integer
 *                     reviewerId:
 *                       type: string
 *                     rating:
 *                       type: integer
 *                     comment:
 *                       type: string
 *                   required:
 *                     - id
 *                     - transactionId
 *                     - reviewerId
 *                     - rating
 *                     - comment
 *               required:
 *                 - rating
 *             example:
 *               rating:
 *                 id: 33
 *                 transactionId: 81
 *                 reviewerId: 550e8400-e29b-41d4-a716-446655440000
 *                 rating: 5
 *                 comment: Great seller and accurate listing.
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '403':
 *         description: The caller is not allowed to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               error: Forbidden
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/transactions/{id}/refund-requests:
 *   post:
 *     tags:
 *       - Transactions
 *     summary: Create or perform transactions item refund requests.
 *     description: Create or perform the transactions item refund requests resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '201':
 *         description: Resource created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 refundRequest:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     transactionId:
 *                       type: integer
 *                     subject:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                   required:
 *                     - id
 *                     - transactionId
 *                     - subject
 *                     - description
 *                     - status
 *                     - createdAt
 *               required:
 *                 - refundRequest
 *             example:
 *               refundRequest:
 *                 id: 24
 *                 transactionId: 81
 *                 subject: Refund request
 *                 description: The received item differs from its listing.
 *                 status: open
 *                 createdAt: '2026-08-15T08:00:00.000Z'
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '403':
 *         description: The caller is not allowed to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               error: Forbidden
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '409':
 *         description: The request conflicts with the resource state.
 *         content:
 *           application/json:
 *             example:
 *               error: Request conflicts with the current resource state
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/users/{id}/listings:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve users item listings.
 *     description: Retrieve the users item listings resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shoeListings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       brand:
 *                         type: string
 *                       category:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       condition:
 *                         type: string
 *                       price:
 *                         type: integer
 *                       isAvailable:
 *                         type: boolean
 *                       photos:
 *                         type: array
 *                         items:
 *                           type: string
 *                     required:
 *                       - id
 *                       - name
 *                       - brand
 *                       - category
 *                       - size
 *                       - condition
 *                       - price
 *                       - isAvailable
 *                       - photos
 *               required:
 *                 - shoeListings
 *             example:
 *               shoeListings:
 *                 - id: 42
 *                   name: Nike Air Max 90
 *                   brand: Nike
 *                   category: Sneakers
 *                   size: 9
 *                   condition: Like New
 *                   price: 4500
 *                   isAvailable: true
 *                   photos:
 *                     - https://example.com/shoe.jpg
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/users/{id}/reviews:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve users item reviews.
 *     description: Retrieve the users item reviews resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       reviewer:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           image:
 *                             type: string
 *                         required:
 *                           - id
 *                           - name
 *                           - email
 *                           - image
 *                       rating:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                     required:
 *                       - id
 *                       - reviewer
 *                       - rating
 *                       - comment
 *                       - createdAt
 *               required:
 *                 - reviews
 *             example:
 *               reviews:
 *                 - id: 35
 *                   reviewer:
 *                     id: 550e8400-e29b-41d4-a716-446655440000
 *                     name: Alex Santos
 *                     email: alex@example.com
 *                     image: https://example.com/avatar.jpg
 *                   rating: 5
 *                   comment: Smooth transaction.
 *                   createdAt: '2026-08-15T08:00:00.000Z'
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve users item.
 *     description: Retrieve the users item resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     image:
 *                       type: string
 *                     description:
 *                       type: string
 *                     location:
 *                       type: string
 *                     overallRating:
 *                       type: number
 *                       format: float
 *                     reviewCount:
 *                       type: integer
 *                     joinedYear:
 *                       type: integer
 *                     listingCount:
 *                       type: integer
 *                     salesCount:
 *                       type: integer
 *                     swapsCount:
 *                       type: integer
 *                   required:
 *                     - id
 *                     - name
 *                     - email
 *                     - image
 *                     - description
 *                     - location
 *                     - overallRating
 *                     - reviewCount
 *                     - joinedYear
 *                     - listingCount
 *                     - salesCount
 *                     - swapsCount
 *               required:
 *                 - user
 *             example:
 *               user:
 *                 id: 550e8400-e29b-41d4-a716-446655440000
 *                 name: Alex Santos
 *                 email: alex@example.com
 *                 image: https://example.com/avatar.jpg
 *                 description: Sneaker collector
 *                 location: Manila
 *                 overallRating: 4.9
 *                 reviewCount: 18
 *                 joinedYear: 2024
 *                 listingCount: 12
 *                 salesCount: 8
 *                 swapsCount: 3
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/users/{id}/view:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create or perform users item view.
 *     description: Create or perform the users item view resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric id of the resource.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 *             example:
 *               message: View saved.
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '404':
 *         description: The requested resource was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: Resource not found
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/users/me/favourites:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve users me favourites.
 *     description: Retrieve the users me favourites resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCount:
 *                   type: integer
 *                 favourites:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       brand:
 *                         type: string
 *                       category:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       condition:
 *                         type: string
 *                       price:
 *                         type: integer
 *                       isAvailable:
 *                         type: boolean
 *                       photos:
 *                         type: array
 *                         items:
 *                           type: string
 *                     required:
 *                       - id
 *                       - name
 *                       - brand
 *                       - category
 *                       - size
 *                       - condition
 *                       - price
 *                       - isAvailable
 *                       - photos
 *               required:
 *                 - totalCount
 *                 - favourites
 *             example:
 *               totalCount: 1
 *               favourites:
 *                 - id: 42
 *                   name: Nike Air Max 90
 *                   brand: Nike
 *                   category: Sneakers
 *                   size: 9
 *                   condition: Like New
 *                   price: 4500
 *                   isAvailable: true
 *                   photos:
 *                     - https://example.com/shoe.jpg
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/users/me/listings:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve users me listings.
 *     description: Retrieve the users me listings resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: condition
 *         required: false
 *         description: Condition filter; may be repeated.
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         required: false
 *         description: Result sort order.
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeArchived
 *         required: false
 *         description: Include archived listings.
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: size
 *         required: false
 *         description: Shoe size filter; may be repeated.
 *         schema:
 *           type: number
 *       - in: query
 *         name: color
 *         required: false
 *         description: Color filter; may be repeated.
 *         schema:
 *           type: string
 *       - in: query
 *         name: minRating
 *         required: false
 *         description: Minimum seller rating.
 *         schema:
 *           type: number
 *       - in: query
 *         name: priceMin
 *         required: false
 *         description: Minimum price.
 *         schema:
 *           type: number
 *       - in: query
 *         name: priceMax
 *         required: false
 *         description: Maximum price.
 *         schema:
 *           type: number
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shoeListings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       brand:
 *                         type: string
 *                       category:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       condition:
 *                         type: string
 *                       price:
 *                         type: integer
 *                       isAvailable:
 *                         type: boolean
 *                       photos:
 *                         type: array
 *                         items:
 *                           type: string
 *                     required:
 *                       - id
 *                       - name
 *                       - brand
 *                       - category
 *                       - size
 *                       - condition
 *                       - price
 *                       - isAvailable
 *                       - photos
 *               required:
 *                 - shoeListings
 *             example:
 *               shoeListings:
 *                 - id: 42
 *                   name: Nike Air Max 90
 *                   brand: Nike
 *                   category: Sneakers
 *                   size: 9
 *                   condition: Like New
 *                   price: 4500
 *                   isAvailable: true
 *                   photos:
 *                     - https://example.com/shoe.jpg
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/users/me/listings/summary:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve users me listings summary.
 *     description: Retrieve the users me listings summary resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 listingSummary:
 *                   type: object
 *                   properties:
 *                     active:
 *                       type: integer
 *                     archived:
 *                       type: integer
 *                     sold:
 *                       type: integer
 *                     swapped:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                   required:
 *                     - active
 *                     - archived
 *                     - sold
 *                     - swapped
 *                     - total
 *               required:
 *                 - listingSummary
 *             example:
 *               listingSummary:
 *                 active: 8
 *                 archived: 2
 *                 sold: 5
 *                 swapped: 1
 *                 total: 16
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/users/me/notification-preferences:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve users me notification preferences.
 *     description: Retrieve the users me notification preferences resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     offers:
 *                       type: boolean
 *                     messages:
 *                       type: boolean
 *                     promotions:
 *                       type: boolean
 *                     orderUpdates:
 *                       type: boolean
 *                   required:
 *                     - offers
 *                     - messages
 *                     - promotions
 *                     - orderUpdates
 *               required:
 *                 - preferences
 *             example:
 *               preferences:
 *                 offers: true
 *                 messages: true
 *                 promotions: false
 *                 orderUpdates: true
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update users me notification preferences.
 *     description: Update the users me notification preferences resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     offers:
 *                       type: boolean
 *                     messages:
 *                       type: boolean
 *                     promotions:
 *                       type: boolean
 *                     orderUpdates:
 *                       type: boolean
 *                   required:
 *                     - offers
 *                     - messages
 *                     - promotions
 *                     - orderUpdates
 *               required:
 *                 - preferences
 *             example:
 *               preferences:
 *                 offers: true
 *                 messages: true
 *                 promotions: true
 *                 orderUpdates: true
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve users me.
 *     description: Retrieve the users me resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     image:
 *                       type: string
 *                     location:
 *                       type: string
 *                   required:
 *                     - id
 *                     - name
 *                     - email
 *                     - image
 *                     - location
 *               required:
 *                 - user
 *             example:
 *               user:
 *                 id: 550e8400-e29b-41d4-a716-446655440000
 *                 name: Alex Santos
 *                 email: alex@example.com
 *                 image: https://example.com/avatar.jpg
 *                 location: Manila
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update users me.
 *     description: Update the users me resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     image:
 *                       type: string
 *                     location:
 *                       type: string
 *                   required:
 *                     - id
 *                     - name
 *                     - email
 *                     - image
 *                     - location
 *               required:
 *                 - user
 *             example:
 *               user:
 *                 id: 550e8400-e29b-41d4-a716-446655440000
 *                 name: Alex Santos
 *                 email: alex@example.com
 *                 image: https://example.com/avatar.jpg
 *                 location: Quezon City
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete users me.
 *     description: Delete the users me resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 *             example:
 *               message: Account deleted successfully
 *       '400':
 *         description: The request is invalid.
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request payload
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/users/me/seller-analytics:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve users me seller analytics.
 *     description: Retrieve the users me seller analytics resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 listingViews:
 *                   type: integer
 *                 profileViews:
 *                   type: integer
 *                 listingSaves:
 *                   type: integer
 *               required:
 *                 - listingViews
 *                 - profileViews
 *                 - listingSaves
 *             example:
 *               listingViews: 324
 *               profileViews: 87
 *               listingSaves: 42
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/users/me/stats:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve users me stats.
 *     description: Retrieve the users me stats resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userStats:
 *                   type: object
 *                   properties:
 *                     listingCount:
 *                       type: integer
 *                     salesCount:
 *                       type: integer
 *                     swapsCount:
 *                       type: integer
 *                     averageRating:
 *                       type: number
 *                       format: float
 *                   required:
 *                     - listingCount
 *                     - salesCount
 *                     - swapsCount
 *                     - averageRating
 *               required:
 *                 - userStats
 *             example:
 *               userStats:
 *                 listingCount: 12
 *                 salesCount: 8
 *                 swapsCount: 3
 *                 averageRating: 4.9
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/users/me/transactions:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve users me transactions.
 *     description: Retrieve the users me transactions resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       shoeListingId:
 *                         type: integer
 *                       buyerId:
 *                         type: string
 *                       total:
 *                         type: integer
 *                     required:
 *                       - id
 *                       - type
 *                       - status
 *                       - shoeListingId
 *                       - buyerId
 *                       - total
 *               required:
 *                 - transactions
 *             example:
 *               transactions:
 *                 - id: 81
 *                   type: sale
 *                   status: pending
 *                   shoeListingId: 42
 *                   buyerId: 550e8400-e29b-41d4-a716-446655440000
 *                   total: 4500
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/wallet:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Retrieve wallet.
 *     description: Retrieve the wallet resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wallet:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: string
 *                     balance:
 *                       type: integer
 *                     updatedAt:
 *                       type: string
 *                   required:
 *                     - id
 *                     - userId
 *                     - balance
 *                     - updatedAt
 *               required:
 *                 - wallet
 *             example:
 *               wallet:
 *                 id: 5
 *                 userId: 550e8400-e29b-41d4-a716-446655440000
 *                 balance: 1200
 *                 updatedAt: '2026-08-15T08:00:00.000Z'
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 * /api/wallet/transactions:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Retrieve wallet transactions.
 *     description: Retrieve the wallet transactions resource for the current request.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Request completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       walletId:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       amount:
 *                         type: integer
 *                       description:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                     required:
 *                       - id
 *                       - walletId
 *                       - type
 *                       - amount
 *                       - description
 *                       - createdAt
 *               required:
 *                 - transactions
 *             example:
 *               transactions:
 *                 - id: 52
 *                   walletId: 5
 *                   type: credit
 *                   amount: 100
 *                   description: Completed sale reward
 *                   createdAt: '2026-08-15T08:00:00.000Z'
 *       '401':
 *         description: Authentication is required or was denied.
 *         content:
 *           application/json:
 *             example:
 *               error: Unauthorized
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: An internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 *             schema:
 *               type: object
 *               additionalProperties: true
 */

export {};
