const mondayService = require('../services/monday-service');
const transformationService = require('../services/transformation-service');
const { TRANSFORMATION_TYPES } = require('../constants/transformation');
const Multiplication = require('../models/multiplication');

async function executeAction(req, res) {
  const { shortLivedToken } = req.session;
  const { payload } = req.body;

  try {
    const { inputFields } = payload;
    const { boardId, itemId, sourceColumnId, targetColumnId, transformationType } = inputFields;

    const text = await mondayService.getColumnValue(shortLivedToken, itemId, sourceColumnId);
    if (!text) {
      return res.status(200).send({});
    }
    const transformedText = transformationService.transformText(
      text,
      transformationType ? transformationType.value : 'TO_UPPER_CASE'
    );

    await mondayService.changeColumnValue(shortLivedToken, boardId, itemId, targetColumnId, transformedText);

    return res.status(200).send({});
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'internal server error' });
  }
}
async function saveMultiplicationFactor(req, res) {
 const { itemId, boardId, factor, originalFactor } = req.body;
 let { authorization } = req.headers;

 try {
   let factorRes = await mondayService.saveMultiplicationFactor({itemId, boardId, factor: originalFactor || factor});
    const text = await mondayService.getColumnValue(authorization, itemId, factorRes.inputColumnId);

    if(factorRes.toJSON().factor && text) {
      let product = Number(text) * factorRes.toJSON().factor;
      await mondayService.changeColumnValue(authorization, boardId, itemId, factorRes.outputColumnId, product);

      await mondayService.saveCalculationHistory(itemId, boardId, product, factor);
    }
  
    return res.status(200).send({ message: 'Factor saved successfully' });
 } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal server error' });
  
 }


}
async function getMultiplicationFactor(req, res) {
  const { itemId, boardId } = req.query;

  try {
    const record = await Multiplication.findOne({ itemId, boardId });

    if (!record) {
      return res.status(200).send({ message: 'Record not found' });
    }

    return res.status(200).send(record);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Internal server error' });
  }
}
async function runItemMultiplication(req, res) {
  const { shortLivedToken } = req.session;
  const { payload } = req.body;

  try {
    console.log(payload, "payload");
    const { inputFields } = payload;
    const { boardId, itemId, input_column, output_column } = inputFields;
    console.log(inputFields, "inputFields");

   let factorRes =  await mondayService.saveMultiplicationFactor({itemId, boardId, recipeId: payload.recipeId, inputColumnId: input_column, outputColumnId: output_column});

    const text = await mondayService.getColumnValue(shortLivedToken, itemId, input_column);

    if(factorRes.toJSON().factor) {
      let product = Number(text) * factorRes.toJSON().factor;
      await mondayService.changeColumnValue(shortLivedToken, boardId, itemId, output_column, product);

      await mondayService.saveCalculationHistory(itemId, boardId, product, factorRes.toJSON().factor);

    }

    return res.status(200).send({});
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'internal server error' });
  }
}
async function getRemoteListOptions(req, res) {
  try {
    return res.status(200).send(TRANSFORMATION_TYPES);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'internal server error' });
  }
}

async function getCalculationHistory(req, res) {
  let { itemId, boardId } = req.query;
  let calc_history = await Multiplication.aggregate([
    {
      $match: {
        itemId: Number(itemId),
        boardId: Number(boardId),
      },
    },
    {
      $project: {
        _id: 0, // Exclude the main document's _id if you don't need it
        calc_history: {
          $sortArray: {
            input: "$calc_history",
            sortBy: { createdAt: -1 }, // -1 for descending (newest first)
          },
        },
      },
    },
  ]);

  if (calc_history.length > 0) {
    return res.status(200).send(calc_history[0].calc_history);
  } else {
    return res.status(200).send([]);
  }
}

module.exports = {
  executeAction,
  getRemoteListOptions,
  runItemMultiplication,
  getMultiplicationFactor,
  saveMultiplicationFactor,
  getCalculationHistory
};
