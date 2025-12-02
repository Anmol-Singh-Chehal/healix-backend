const asyncHandler = (fun) => async (req, res, next) => {
    return Promise.resolve(fun(req, res, next))
    .catch((error) => {
        next(error);
    });
}

export default asyncHandler;