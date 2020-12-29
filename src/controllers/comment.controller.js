import catchAsync from '../utils/catchAsync';
import Comment from '../models/comment.model';
import Features from '../utils/features';

export const getAllComments = catchAsync(async (req, res) => {
  const comment = await Comment.find();

  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

export const createComment = catchAsync(async (req, res) => {
  req.body.user = req.user.id;
  req.body.transaction = req.params.id;
  const comment = await Comment.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      comment,
    },
  });
});
