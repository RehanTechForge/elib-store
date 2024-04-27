import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { OPTIONS } from "../constant.js";
import mongoose from "mongoose";
import { Book } from "../models/book.models.js";

const createBook = asyncHandler(async (req, res) => {
    const { title, description, genre, author } = req.body;
    // add validatation 

    if (
        title.trim() === "" ||
        description.trim() === "" ||
        genre.trim() === "" ||
        author.trim() === ""
    ) {
        throw new ApiError(
            401,
            "All fields are required Please fill in all fields",
            false,
        )
    }

    const convertAuthorIntoAnArray = author.split(",");
    const convertGenreIntoArray = genre.split(",");

    const bookCoverImage = req.files?.coverImage[0]?.path;
    const bookPDF = req.files?.file[0]?.path;
    // console.log(req.files);

    if (!bookCoverImage && !bookPDF) {
        throw new ApiError(
            401,
            "Please upload a book cover image and a book pdf",
            false,
        )
    }

    const bookImage = await uploadOnCloudinary(bookCoverImage);
    const bookPDFs = await uploadOnCloudinary(bookPDF);

    if (!bookImage) {
        throw new ApiError(
            401,
            "Please upload a book cover image",
            false,
        )
    }

    if (!bookPDFs) {
        throw new ApiError(
            401,
            "Please upload a book pdf",
            false,
        )
    }

    const newBook = await Book.create({
        title,
        description,
        genre: convertGenreIntoArray,
        author: convertAuthorIntoAnArray,
        uploadBy: req.user.id,
        coverImage: bookImage.secure_url,
        file: bookPDFs.url,
    });

    return res.status(200).json(
        new ApiResponse(
            201,
            newBook,
            "Book created successfully",
            false,
        )
    )

});

const updateBook = asyncHandler(async (req, res) => {
    const { title, description, genre, author } = req.body;

    if (
        title.trim() === "" ||
        description.trim() === "" ||
        genre.trim() === "" ||
        author.trim() === ""
    ) {
        throw new ApiError(
            401,
            "All fields are required Please fill in all fields",
            false,
        )
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
        throw new ApiError(
            401,
            "Book does not exist",
            false,
        )
    }

    if (book.uploadBy.toString() !== req.user.id) {
        throw new ApiError(
            401,
            "You are not authorized to update this book",
            false,
        )
    }


    let convertedGenreArray = genre.includes(",") ? genre.split(",") : [genre];
    let convertedAuthorArray = author.includes(",") ? author.split(",") : [author];

    let bookCoverImage;
    let bookPDF;
    let bookPDFs;
    let bookImage;

    if (req.files?.coverImage) {
        bookCoverImage = req.files?.coverImage[0]?.path;
        bookImage = await uploadOnCloudinary(bookCoverImage);
        if (!bookImage) {
            throw new ApiError(
                401,
                "Please upload a book cover image",
                false,
            );
        }

        console.log("elib-store/" + book.coverImage.split("/").at(-1).split(".").at(-2));
        await deleteOnCloudinary("elib-store/" + book.coverImage.split("/").at(-1).split(".").at(-2))
    }

    if (req.files?.file) {
        bookPDF = req.files?.file[0]?.path;
        bookPDFs = await uploadOnCloudinary(bookPDF);
        if (!bookPDFs) {
            throw new ApiError(
                401,
                "Please upload a book pdf",
                false,
            );
        }
        console.log("elib-store/" + book.file.split("/").at(-1).split(".").at(-2));
        await deleteOnCloudinary("elib-store/" + book.file.split("/").at(-1).split(".").at(-2))
    }

    const updatedBook = await Book.findByIdAndUpdate(
        req.params.id,
        {
            title,
            description,
            genre: convertedGenreArray,
            author: convertedAuthorArray,
            uploadBy: req.user.id,
            coverImage: bookImage ? bookImage.url : Book.coverImage,
            file: bookPDFs ? bookPDFs.url : Book.file,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    return res.status(200).json(
        new ApiResponse(
            201,
            updatedBook,
            "Book updated successfully",
            false,
        )
    )

});


const deleteBook = asyncHandler(async (req, res) => {
    const bookId = req.params.id;

    const book = await Book.findById(bookId);

    if (!book) {
        throw new ApiError(
            403,
            "Book not found",
            false,
        )
    }

    if (book.uploadBy.toString() !== req.user.id) {
        throw new ApiError(
            401,
            "Unauthorized request to delete book from the database",
            false,
        )
    }

    await deleteOnCloudinary("elib-store/" + book.coverImage.split("/").at(-1).split(".").at(-2))
    await deleteOnCloudinary("elib-store/" + book.file.split("/").at(-1).split(".").at(-2))

    await Book.deleteOne({ _id: bookId });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Book deleted successfully",
            true,
        )
    );

});
// Middleware to validate ObjectId

const getASingleBook = asyncHandler(async (req, res) => {
    const bookId = req.params.bookId;

    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError(
            401,
            "Book not found",
            false,
        )
    }

    const newBook = await Book.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(bookId) } // Add match stage to filter by bookId
        },
        {
            $lookup: {
                from: "users",
                localField: "uploadBy",
                foreignField: "_id",
                as: "uploadBy",
            },
        },
        {
            $addFields: {
                uploadBy: {
                    $arrayElemAt: ["$uploadBy.name", 0] // Access the first element of the array
                }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            newBook,
            "Book retrieved successfully",
            false,
        )
    );

});





const getAllBooks = asyncHandler(async (req, res) => {
    const options = {
        page: req.query.page || 1,
        limit: 10 // Number of items per page
    };

    // Perform the aggregation query
    Book.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "uploadBy",
                foreignField: "_id",
                as: "uploadBy",
            },
        },
        {
            $addFields: {
                uploadBy: {
                    $arrayElemAt: ["$uploadBy.name", 0]
                }

            }
        }
    ])
        .then(results => {
            // Manually paginate the results
            const startIndex = (options.page - 1) * options.limit;
            const endIndex = options.page * options.limit;
            const paginatedResults = results.slice(startIndex, endIndex);

            return res.status(200).json(new ApiResponse(200, paginatedResults, "Books retrieved successfully"));
        })
        .catch(err => {
            console.error("Error:", err);
            return res.status(500).json(new ApiResponse(500, null, "Error occurred", true));
        });
});





export { createBook, updateBook, deleteBook, getASingleBook, getAllBooks }