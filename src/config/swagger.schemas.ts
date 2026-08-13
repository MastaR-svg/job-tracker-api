/**
 * @swagger
 * components:
 *   schemas:
 *     JobStatus:
 *       type: string
 *       enum: [applied, interview, assessment, offer, rejected]
 *       example: applied
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "6a4108fb0ddd868702bac645"
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         username:
 *           type: string
 *           example: "johndoe"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     RegisterDto:
 *       type: object
 *       required: [email, username, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         username:
 *           type: string
 *           minLength: 2
 *           example: "johndoe"
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "Password123"
 *
 *     LoginDto:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           example: "Password123"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *           description: Short-lived access token (15 minutes)
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         expiresIn:
 *           type: string
 *           example: "15m"
 *
 *     JobApplication:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "6a4111b37afc9749bfaf34d8"
 *         userId:
 *           type: string
 *           example: "6a4108fb0ddd868702bac645"
 *         company:
 *           type: string
 *           example: "Google"
 *         position:
 *           type: string
 *           example: "Backend Engineer"
 *         status:
 *           $ref: '#/components/schemas/JobStatus'
 *         appliedDate:
 *           type: string
 *           format: date-time
 *         salary:
 *           type: number
 *           example: 120000
 *           nullable: true
 *         location:
 *           type: string
 *           example: "Remote"
 *           nullable: true
 *         notes:
 *           type: string
 *           nullable: true
 *         jobUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *         resumeUrl:
 *           type: string
 *           nullable: true
 *         interviewDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateJobDto:
 *       type: object
 *       required: [company, position]
 *       properties:
 *         company:
 *           type: string
 *           example: "Google"
 *         position:
 *           type: string
 *           example: "Backend Engineer"
 *         status:
 *           $ref: '#/components/schemas/JobStatus'
 *         appliedDate:
 *           type: string
 *           format: date
 *           example: "2026-08-12"
 *         salary:
 *           type: number
 *           example: 120000
 *         location:
 *           type: string
 *           example: "Remote"
 *         notes:
 *           type: string
 *           example: "Applied via LinkedIn"
 *         jobUrl:
 *           type: string
 *           format: uri
 *           example: "https://careers.google.com/jobs/123"
 *
 *     UpdateJobDto:
 *       type: object
 *       properties:
 *         company:
 *           type: string
 *         position:
 *           type: string
 *         status:
 *           $ref: '#/components/schemas/JobStatus'
 *         appliedDate:
 *           type: string
 *           format: date
 *         salary:
 *           type: number
 *         location:
 *           type: string
 *         notes:
 *           type: string
 *         jobUrl:
 *           type: string
 *           format: uri
 *         interviewDate:
 *           type: string
 *           format: date-time
 *
 *     PaginatedJobResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/JobApplication'
 *         message:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         total:
 *           type: integer
 *           example: 25
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalPages:
 *           type: integer
 *           example: 3
 *
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *         message:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "ValidationError"
 *         message:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "ValidationError"
 *         message:
 *           type: string
 *           example: "Invalid request data"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     DashboardStats:
 *       type: object
 *       properties:
 *         totalApplications:
 *           type: integer
 *           example: 24
 *         statusBreakdown:
 *           type: object
 *           properties:
 *             applied:
 *               type: integer
 *             interview:
 *               type: integer
 *             assessment:
 *               type: integer
 *             offer:
 *               type: integer
 *             rejected:
 *               type: integer
 *         recentApplications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/JobApplication'
 *         successRate:
 *           type: number
 *           example: 4.2
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// This file exists only to hold OpenAPI component schema definitions.
// The JSDoc comments above are picked up by swagger-jsdoc.
export {};