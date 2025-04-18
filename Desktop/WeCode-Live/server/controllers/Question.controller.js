const User = require("../models/user.model");


const updateQuestion = async (req, res) => {
    try {
        const { questionId, field, value } = req.body;

        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        
        const questionIndex = user.questions.findIndex(q => q.questionId === questionId);

        if (questionIndex !== -1) {
            // Update specific field
            user.questions[questionIndex][field.toLowerCase()] = value === "Yes";
        } else {
            // Create new question entry with the correct field
            const newQuestion = {
                questionId,
                revision: field === "Revision" ? value === "Yes" : false,
                important: field === "Important" ? value === "Yes" : false,
            };
            user.questions.push(newQuestion);
        }

        await user.save();
        return res.status(200).json({ message: "Question updated successfully." });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred.", error });
    }
};

const fetchquestion = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const importantQuestions = user.questions.filter(q => q.important);
        const revisionQuestions = user.questions.filter(q => q.revision);
        return res.status(200).json({ importantQuestions, revisionQuestions });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred.", error });
    }
}
module.exports = { updateQuestion , fetchquestion};