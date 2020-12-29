const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/app-error");
const features = require("../utils/features");

exports.deleteOne = (Model, document) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc)
      return next(
        new AppError(`No ${document} found with ID: ${req.params.id}`, 404)
      );

    res.status(204).json({
      status: "Success",
      data: null
    });
  });

exports.updateOne = (Model, document) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc)
      return next(
        new AppError(`No ${document} found with ID: ${req.params.id}`, 404)
      );

    res.status(200).json({
      status: "Success",
      data: {
        document: doc
      }
    });
  });

exports.createOne = (Model, document) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "Success",
      message: `${document} created`,
      data: doc
    });
  });

exports.getOne = (Model, document) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc)
      return next(
        new AppError(`No ${document} found with ID: ${req.params.id}`, 404)
      );

    res.status(200).json({
      status: "Success",
      data: doc
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // Filter object to catch any userid params and send only transactions for that user
    let filter = {};

    if (req.params.userid) {
      console.log(req.params.userid);
      filter = {
        $or: [{ sender: req.user.id }, { receiver: req.user.id }]
      };
    } else if (req.user.role !== "superadmin") {
      // Only an admin should get acces to all the documents without providing a userid in the req
      return next(
        new AppError(
          "You do not have the permissions to access this route",
          403
        )
      );
    }

    // Save the query parameters in an object
    let queryObj = { ...req.query };

    // Exclude some fields from the query
    const excludeFields = ["page", "limit", "sort", "fields"];
    excludeFields.forEach(el => delete queryObj[el]);

    // add the "$" operator on the gte, gt, lte and lt keys
    queryObj = JSON.parse(
      JSON.stringify(queryObj).replace(
        /\b(gt|gte|lt|lte)\b/g,
        match => `$${match}`
      )
    );

    filter = { ...filter, ...queryObj };

    const query = Model.find(filter);

    // Sorting returned values by specified value in the req query or by default if no specified value
    if (req.query.sort) query.sort(req.query.sort);
    else query.sort("-createdAt");

    // Limiting fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query.select(fields);
    } else {
      query.select("-__v");
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).limit(limit);

    const doc = await query;

    res.status(200).json({
      status: "Success",
      results: doc.length,
      data: doc
    });
  });
