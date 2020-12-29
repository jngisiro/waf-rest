import Email from './email';
import catchAsync from './catchAsync';

export const sendemail = catchAsync(async (req, res) => {
  const { name, email, message } = req.body;

  await new Email(name, email, message).sendMessage();
  return res.status(200).json({
    status: 'success',
    message: 'Email Sent',
  });
});
