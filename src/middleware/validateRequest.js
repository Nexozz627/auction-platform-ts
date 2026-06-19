export const validateRequest = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const error = result.error.issues.map((err) => err.message).join(", ");

            return res.status(400).json({ message: error });
        }

        next();

    }

}