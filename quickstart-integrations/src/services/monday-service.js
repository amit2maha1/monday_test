const initMondayClient = require('monday-sdk-js');
const Multiplication = require('../models/multiplication');
const getColumnValue = async (token, itemId, columnId) => {
  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(token);
    mondayClient.setApiVersion('2024-04');

    const query = `query($itemId: [ID!], $columnId: [String!]) {
        items (ids: $itemId) {
          column_values(ids:$columnId) {
            value
            text
          }
        }
      }`;
    const variables = { columnId, itemId };

    const response = await mondayClient.api(query, { variables });
    return response.data.items[0].column_values[0].text;
  } catch (err) {
    console.error(err);
  }
};

const changeColumnValue = async (token, boardId, itemId, columnId, value) => {
  try {
    const mondayClient = initMondayClient({ token });
    mondayClient.setApiVersion("2024-01");

    const query = `mutation change_column_value($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
        change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) {
          id
        }
      }
      `;
    const variables = { boardId, columnId, itemId, value: `${value}` };

    const response = await mondayClient.api(query, { variables });
    return response;
  } catch (err) {
    console.error(err);
  }
};

const getAllColumns = async (token, boardId) => {
  try {
    const mondayClient = initMondayClient({ token });
    mondayClient.setApiVersion('2024-04');

    const query = `query($boardId: [ID!]!) {
        boards(ids: $boardId) {
          columns {
            id
            title
            type
          }
        }
      }`;
    const variables = { boardId };

    const response = await mondayClient.api(query, { variables });
    return response.data.boards[0].columns;
  } catch (err) {
    console.error(err);
  }
}

const saveMultiplicationFactor = async (factorInputs) => {
  try {
    const record = await Multiplication.findOne({ itemId: factorInputs.itemId, boardId: factorInputs.boardId });

    if (record) {
      factorInputs.factor &&= (record.factor = factorInputs.factor);
      factorInputs.recipeId &&= (record.recipeId = factorInputs.recipeId);
      factorInputs.inputColumnId &&= (record.inputColumnId = factorInputs.inputColumnId);
      factorInputs.outputColumnId &&= (record.outputColumnId = factorInputs.outputColumnId);
      await record.save();
      return record;
    } else {
      const newRecord = new Multiplication({ 
        itemId: factorInputs.itemId, 
        boardId: factorInputs.boardId, 
        factor: factorInputs.factor, 
        recipeId: factorInputs.recipeId,
        ...(factorInputs.inputColumnId && { inputColumnId: factorInputs.inputColumnId }),
        ...(factorInputs.outputColumnId && { outputColumnId: factorInputs.outputColumnId }),
       });
      await newRecord.save();
      return newRecord;
    }

  } catch (err) {
    console.error(err);
  }
};

const saveCalculationHistory = async (itemId, boardId, result, factor) => {
  const record = await Multiplication.findOne({ itemId, boardId });
  if (record) {
    record.calc_history.push({ result , factor});
    await record.save();
  } else {
    console.log("Record not found");
  }
}
module.exports = {
  getColumnValue,
  changeColumnValue,
  getAllColumns,
  saveMultiplicationFactor,
  saveCalculationHistory
};
