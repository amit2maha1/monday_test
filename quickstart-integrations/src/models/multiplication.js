const mongoose = require('mongoose');

const multiplicationSchema = new mongoose.Schema({
    boardId: { type: Number, required: false },
    itemId: { type: Number, required: false },
    factor: { type: Number, required: false },
    recipeId: { type: Number, required: false },
    inputColumnId: { type: String, required: false },
    outputColumnId: { type: String, required: false },
    calc_history: [
        {
            factor: { type: Number, required: false },
            result: { type: Number, required: false },
            error: { type: String, required: false },
            createdAt: { type: Date, default: Date.now },
        }
    ]
});

module.exports = mongoose.model('Multiplication', multiplicationSchema);