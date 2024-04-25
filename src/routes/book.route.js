import express, { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { createBook, updateBook, deleteBook, getASingleBook, getAllBooks } from '../controllers/book.controller.js';
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/update/:id").patch(verifyJWT,
    upload.fields([{
        name: "coverImage",
        maxCount: 1,
    },
    {
        name: "file",
        maxCount: 1,
    }
    ]), updateBook)

router.route("/create").post(
    verifyJWT,
    upload.fields([{
        name: "coverImage",
        maxCount: 1,
    },
    {
        name: "file",
        maxCount: 1,
    }
    ]),
    createBook);

router.route("/delete/:id").delete(
    verifyJWT,
    deleteBook)

router.route("/single/:id").get(getASingleBook)
router.route("/all").get(getAllBooks)




export default router;