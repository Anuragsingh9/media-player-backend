const { body, validationResult } = require("express-validator");

const videoValidationRules = () => {
    return [
        // Title validation
        body("title")
            .notEmpty().withMessage("Title is required").bail()  // Check for emptiness first
            .isString().withMessage("Title must be a string").bail()  // Ensure it's a string
            .isLength({ min: 3, max: 20 }).withMessage("Title length should be between 3 and 20 characters"),

        // Description validation
        body("description")
            .notEmpty().withMessage("Description is required").bail()  // Check for emptiness first
            .isString().withMessage("Description must be a string")
    ];
};

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    videoValidationRules,
    validate
};
